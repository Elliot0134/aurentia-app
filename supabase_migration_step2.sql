CREATE OR REPLACE FUNCTION billing.deduct_credits_with_priority(
  p_user_id UUID, 
  p_amount INTEGER,
  p_description TEXT DEFAULT NULL,
  p_project_id UUID DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  current_purchased INTEGER;
  current_monthly INTEGER;
  deducted_purchased INTEGER := 0;
  deducted_monthly INTEGER := 0;
  remaining_amount INTEGER := p_amount;
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Le montant à déduire doit être positif: %', p_amount;
  END IF;

  SELECT purchased_credits, monthly_credits 
  INTO current_purchased, current_monthly
  FROM billing.user_credits 
  WHERE user_id = p_user_id
  FOR UPDATE;
  
  IF current_purchased IS NULL THEN
    RAISE EXCEPTION 'Utilisateur non trouvé dans le système de crédits';
  END IF;
  
  IF (current_purchased + current_monthly) < p_amount THEN
    RAISE EXCEPTION 'Crédits insuffisants. Total: %, requis: %', 
      (current_purchased + current_monthly), p_amount;
  END IF;
  
  IF current_purchased > 0 AND remaining_amount > 0 THEN
    deducted_purchased := LEAST(current_purchased, remaining_amount);
    remaining_amount := remaining_amount - deducted_purchased;
  END IF;
  
  IF remaining_amount > 0 THEN
    deducted_monthly := remaining_amount;
  END IF;
  
  UPDATE billing.user_credits SET
    purchased_credits = purchased_credits - deducted_purchased,
    monthly_credits = monthly_credits - deducted_monthly,
    updated_at = now()
  WHERE user_id = p_user_id;
  
  INSERT INTO billing.credit_transactions (
    user_id, type, amount, credit_type, 
    balance_after_monthly, balance_after_purchased,
    description, project_id
  ) VALUES (
    p_user_id, 'spend_premium', -p_amount, 
    CASE 
      WHEN deducted_purchased > 0 AND deducted_monthly > 0 THEN 'mixed'
      WHEN deducted_purchased > 0 THEN 'purchased'
      ELSE 'monthly'
    END,
    current_monthly - deducted_monthly,
    current_purchased - deducted_purchased,
    COALESCE(p_description, 'Déduction de crédits'), 
    p_project_id
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'deducted_purchased', deducted_purchased,
    'deducted_monthly', deducted_monthly,
    'remaining_purchased', current_purchased - deducted_purchased,
    'remaining_monthly', current_monthly - deducted_monthly,
    'total_remaining', (current_purchased - deducted_purchased) + (current_monthly - deducted_monthly)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION billing.can_generate_premium_for_free(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  first_used BOOLEAN;
BEGIN
  SELECT first_premium_used INTO first_used
  FROM billing.user_credits
  WHERE user_id = p_user_id;
  
  IF first_used IS NULL THEN
    INSERT INTO billing.user_credits (user_id, monthly_credits, purchased_credits, first_premium_used)
    VALUES (p_user_id, 0, 0, false)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN true;
  END IF;
  
  RETURN NOT first_used;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION billing.mark_first_premium_used(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE billing.user_credits 
  SET 
    first_premium_used = true,
    updated_at = now()
  WHERE user_id = p_user_id;
  
  INSERT INTO billing.credit_transactions (
    user_id, type, amount, credit_type, 
    balance_after_monthly, balance_after_purchased,
    description
  ) 
  SELECT 
    p_user_id, 'bonus', 0, 'monthly',
    monthly_credits, purchased_credits,
    'Premier livrable premium gratuit'
  FROM billing.user_credits 
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION billing.generate_premium_deliverables(
  p_user_id UUID,
  p_project_id UUID
) RETURNS JSONB AS $$
DECLARE
  premium_cost INTEGER := 1000;
  can_free BOOLEAN;
  deduction_result JSONB;
BEGIN
  SELECT billing.can_generate_premium_for_free(p_user_id) INTO can_free;
  
  IF can_free THEN
    PERFORM billing.mark_first_premium_used(p_user_id);
    
    RETURN jsonb_build_object(
      'success', true,
      'free', true,
      'message', 'Premier livrable premium généré gratuitement',
      'cost', 0
    );
  ELSE
    SELECT billing.deduct_credits_with_priority(
      p_user_id, 
      premium_cost, 
      'Génération pack livrables premium complet',
      p_project_id
    ) INTO deduction_result;
    
    RETURN jsonb_build_object(
      'success', true,
      'free', false,
      'message', 'Pack livrables premium généré avec déduction de crédits',
      'cost', premium_cost,
      'deduction_details', deduction_result
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION billing.add_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_credit_type TEXT,
  p_description TEXT DEFAULT NULL,
  p_stripe_reference TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  new_monthly INTEGER;
  new_purchased INTEGER;
BEGIN
  IF p_credit_type NOT IN ('monthly', 'purchased') THEN
    RAISE EXCEPTION 'Type de crédit invalide: %', p_credit_type;
  END IF;
  
  INSERT INTO billing.user_credits (user_id, monthly_credits, purchased_credits)
  VALUES (p_user_id, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;
  
  IF p_credit_type = 'monthly' THEN
    UPDATE billing.user_credits SET
      monthly_credits = p_amount,
      credits_reset_at = now(),
      updated_at = now()
    WHERE user_id = p_user_id
    RETURNING monthly_credits, purchased_credits INTO new_monthly, new_purchased;
  ELSE
    UPDATE billing.user_credits SET
      purchased_credits = purchased_credits + p_amount,
      updated_at = now()
    WHERE user_id = p_user_id
    RETURNING monthly_credits, purchased_credits INTO new_monthly, new_purchased;
  END IF;
  
  INSERT INTO billing.credit_transactions (
    user_id, type, amount, credit_type, 
    balance_after_monthly, balance_after_purchased,
    description, stripe_reference
  ) VALUES (
    p_user_id, 
    CASE WHEN p_credit_type = 'monthly' THEN 'subscription_monthly' ELSE 'purchase' END,
    p_amount, 
    p_credit_type,
    new_monthly,
    new_purchased,
    COALESCE(p_description, 'Ajout de crédits'),
    p_stripe_reference
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'added_amount', p_amount,
    'credit_type', p_credit_type,
    'new_monthly', new_monthly,
    'new_purchased', new_purchased,
    'total', new_monthly + new_purchased
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION billing.get_user_balance(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  user_credits RECORD;
  subscription_info RECORD;
BEGIN
  SELECT * INTO user_credits
  FROM billing.user_credits
  WHERE user_id = p_user_id;
  
  SELECT status, current_period_end INTO subscription_info
  FROM billing.subscriptions
  WHERE user_id = p_user_id;
  
  IF user_credits IS NULL THEN
    INSERT INTO billing.user_credits (user_id, monthly_credits, purchased_credits)
    VALUES (p_user_id, 0, 0)
    RETURNING * INTO user_credits;
  END IF;
  
  RETURN jsonb_build_object(
    'monthly_credits', COALESCE(user_credits.monthly_credits, 0),
    'purchased_credits', COALESCE(user_credits.purchased_credits, 0),
    'total_credits', COALESCE(user_credits.monthly_credits, 0) + COALESCE(user_credits.purchased_credits, 0),
    'first_premium_used', COALESCE(user_credits.first_premium_used, false),
    'subscription_status', COALESCE(subscription_info.status, 'inactive'),
    'subscription_end', subscription_info.current_period_end,
    'credits_reset_at', user_credits.credits_reset_at
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

ALTER TABLE billing.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing.user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing.credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription" ON billing.subscriptions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription" ON billing.subscriptions
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own credits" ON billing.user_credits
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own credits" ON billing.user_credits
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own transactions" ON billing.credit_transactions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

ALTER TABLE billing.pricing_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can read pricing config" ON billing.pricing_config
  FOR SELECT TO authenticated
  USING (true);

ALTER TABLE billing.credit_packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can read credit packages" ON billing.credit_packages
  FOR SELECT TO authenticated
  USING (is_active = true);