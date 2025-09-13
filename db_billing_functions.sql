-- =====================================================
-- FONCTIONS SQL POUR LA GESTION DES CRÉDITS
-- =====================================================

-- =====================================================
-- FONCTION DE DÉDUCTION DE CRÉDITS AVEC PRIORITÉ
-- =====================================================

CREATE OR REPLACE FUNCTION billing.deduct_credits_with_priority(
  p_user_id UUID, 
  p_amount INTEGER,
  p_description TEXT DEFAULT NULL,
  p_project_id UUID DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  current_purchased_remaining INTEGER;
  current_monthly_remaining INTEGER;
  deducted_purchased INTEGER := 0;
  deducted_monthly INTEGER := 0;
  remaining_amount INTEGER := p_amount;
BEGIN
  -- Vérifier que le montant est positif
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Le montant à déduire doit être positif: %', p_amount;
  END IF;

  -- Récupérer les crédits actuels avec verrouillage
  SELECT purchased_credits_remaining, monthly_credits_remaining 
  INTO current_purchased_remaining, current_monthly_remaining
  FROM billing.user_credits 
  WHERE user_id = p_user_id
  FOR UPDATE;
  
  -- Vérifier si l'utilisateur existe
  IF current_purchased_remaining IS NULL THEN
    RAISE EXCEPTION 'Utilisateur non trouvé dans le système de crédits';
  END IF;
  
  -- Vérifier si assez de crédits au total
  IF (current_purchased_remaining + current_monthly_remaining) < p_amount THEN
    RAISE EXCEPTION 'Crédits insuffisants. Total: %, requis: %', 
      (current_purchased_remaining + current_monthly_remaining), p_amount;
  END IF;
  
  -- PRIORITÉ 1: Déduire d'abord des crédits achetés restants
  IF current_purchased_remaining > 0 AND remaining_amount > 0 THEN
    deducted_purchased := LEAST(current_purchased_remaining, remaining_amount);
    remaining_amount := remaining_amount - deducted_purchased;
  END IF;
  
  -- PRIORITÉ 2: Déduire le reste des crédits mensuels restants
  IF remaining_amount > 0 THEN
    deducted_monthly := remaining_amount;
  END IF;
  
  -- Mettre à jour les crédits
  UPDATE billing.user_credits SET
    purchased_credits_remaining = purchased_credits_remaining - deducted_purchased,
    monthly_credits_remaining = monthly_credits_remaining - deducted_monthly,
    updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Enregistrer la transaction
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
    current_monthly_remaining - deducted_monthly,
    current_purchased_remaining - deducted_purchased,
    COALESCE(p_description, 'Déduction de crédits'), 
    p_project_id
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'deducted_purchased', deducted_purchased,
    'deducted_monthly', deducted_monthly,
    'remaining_purchased', current_purchased_remaining - deducted_purchased,
    'remaining_monthly', current_monthly_remaining - deducted_monthly,
    'total_remaining', (current_purchased_remaining - deducted_purchased) + (current_monthly_remaining - deducted_monthly)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FONCTION POUR VÉRIFIER SI PREMIER LIVRABLE GRATUIT
-- =====================================================

CREATE OR REPLACE FUNCTION billing.can_generate_premium_for_free(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  first_used BOOLEAN;
BEGIN
  SELECT first_premium_used INTO first_used
  FROM billing.user_credits
  WHERE user_id = p_user_id;
  
  -- Si l'utilisateur n'existe pas dans billing, créer l'entrée avec les nouvelles colonnes
  IF first_used IS NULL THEN
    INSERT INTO billing.user_credits (user_id, monthly_credits_remaining, monthly_credits_limit, purchased_credits_remaining, purchased_credits_limit, first_premium_used)
    VALUES (p_user_id, 0, 0, 0, 0, false)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN true;
  END IF;
  
  RETURN NOT first_used;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FONCTION POUR MARQUER LE PREMIER LIVRABLE COMME UTILISÉ
-- =====================================================

CREATE OR REPLACE FUNCTION billing.mark_first_premium_used(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE billing.user_credits 
  SET 
    first_premium_used = true,
    updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Enregistrer la transaction gratuite
  INSERT INTO billing.credit_transactions (
    user_id, type, amount, credit_type, 
    balance_after_monthly, balance_after_purchased,
    description
  ) 
  SELECT 
    p_user_id, 'bonus', 0, 'monthly',
    monthly_credits_remaining, purchased_credits_remaining, -- Utiliser les nouvelles colonnes
    'Premier livrable premium gratuit'
  FROM billing.user_credits 
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FONCTION POUR GÉNÉRER LES LIVRABLES PREMIUM
-- Coût fixe : 1000 crédits pour TOUS les livrables premium
-- =====================================================

CREATE OR REPLACE FUNCTION billing.generate_premium_deliverables(
  p_user_id UUID,
  p_project_id UUID
) RETURNS JSONB AS $$
DECLARE
  premium_cost INTEGER := 1000; -- Coût fixe pour TOUS les livrables premium
  can_free BOOLEAN;
  deduction_result JSONB;
BEGIN
  -- Vérifier si c'est le premier livrable gratuit
  SELECT billing.can_generate_premium_for_free(p_user_id) INTO can_free;
  
  IF can_free THEN
    -- Premier livrable gratuit
    PERFORM billing.mark_first_premium_used(p_user_id);
    
    RETURN jsonb_build_object(
      'success', true,
      'free', true,
      'message', 'Premier livrable premium généré gratuitement',
      'cost', 0
    );
  ELSE
    -- Déduire les crédits normalement
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

-- =====================================================
-- FONCTION POUR AJOUTER DES CRÉDITS (ABONNEMENT/ACHAT)
-- =====================================================

CREATE OR REPLACE FUNCTION billing.add_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_credit_type TEXT, -- 'monthly' ou 'purchased'
  p_description TEXT DEFAULT NULL,
  p_stripe_reference TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  new_monthly_remaining INTEGER;
  new_purchased_remaining INTEGER;
  new_monthly_limit INTEGER;
  new_purchased_limit INTEGER;
BEGIN
  -- Vérifier le type de crédit
  IF p_credit_type NOT IN ('monthly', 'purchased') THEN
    RAISE EXCEPTION 'Type de crédit invalide: %', p_credit_type;
  END IF;
  
  -- Créer l'utilisateur s'il n'existe pas, avec les nouvelles colonnes
  INSERT INTO billing.user_credits (user_id, monthly_credits_remaining, monthly_credits_limit, purchased_credits_remaining, purchased_credits_limit)
  VALUES (p_user_id, 0, 0, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Ajouter les crédits selon le type
  IF p_credit_type = 'monthly' THEN
    -- Pour l'abonnement : Définir les crédits mensuels restants et la limite
    UPDATE billing.user_credits SET
      monthly_credits_remaining = p_amount,
      monthly_credits_limit = p_amount, -- La limite est égale au montant donné pour les crédits mensuels
      credits_reset_at = now(),
      updated_at = now()
    WHERE user_id = p_user_id
    RETURNING monthly_credits_remaining, purchased_credits_remaining, monthly_credits_limit, purchased_credits_limit
    INTO new_monthly_remaining, new_purchased_remaining, new_monthly_limit, new_purchased_limit;
  ELSE
    -- Pour les achats : AJOUTER aux crédits achetés restants et augmenter la limite achetée
    UPDATE billing.user_credits SET
      purchased_credits_remaining = purchased_credits_remaining + p_amount,
      purchased_credits_limit = purchased_credits_limit + p_amount, -- La limite achetée augmente avec l'achat
      updated_at = now()
    WHERE user_id = p_user_id
    RETURNING monthly_credits_remaining, purchased_credits_remaining, monthly_credits_limit, purchased_credits_limit
    INTO new_monthly_remaining, new_purchased_remaining, new_monthly_limit, new_purchased_limit;
  END IF;
  
  -- Enregistrer la transaction
  INSERT INTO billing.credit_transactions (
    user_id, type, amount, credit_type, 
    balance_after_monthly, balance_after_purchased,
    description, stripe_reference
  ) VALUES (
    p_user_id, 
    CASE WHEN p_credit_type = 'monthly' THEN 'subscription_monthly' ELSE 'purchase' END,
    p_amount, 
    p_credit_type,
    new_monthly_remaining, -- Utiliser les crédits restants
    new_purchased_remaining, -- Utiliser les crédits restants
    COALESCE(p_description, 'Ajout de crédits'),
    p_stripe_reference
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'added_amount', p_amount,
    'credit_type', p_credit_type,
    'new_monthly_remaining', new_monthly_remaining,
    'new_purchased_remaining', new_purchased_remaining,
    'new_monthly_limit', new_monthly_limit,
    'new_purchased_limit', new_purchased_limit,
    'total_remaining', new_monthly_remaining + new_purchased_remaining
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FONCTION POUR RÉCUPÉRER LE SOLDE UTILISATEUR
-- =====================================================

CREATE OR REPLACE FUNCTION billing.get_user_balance(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  user_credits_data RECORD;
  profile_info RECORD;
  v_monthly_available INTEGER;
  v_purchased_available INTEGER;
  v_total_available INTEGER;
BEGIN
  -- Récupérer les crédits de l'utilisateur
  SELECT 
    uc.monthly_credits_remaining,
    uc.monthly_credits_limit,
    uc.purchased_credits_remaining,
    uc.purchased_credits_limit,
    uc.first_premium_used,
    uc.credits_reset_at
  INTO user_credits_data
  FROM billing.user_credits uc
  WHERE uc.user_id = p_user_id;
  
  -- Récupérer les infos d'abonnement depuis la table profiles
  SELECT p.subscription_status INTO profile_info
  FROM public.profiles p
  WHERE p.id = p_user_id;
  
  -- Si l'utilisateur n'existe pas dans billing.user_credits, initialiser l'entrée
  IF user_credits_data.monthly_credits_remaining IS NULL THEN
    INSERT INTO billing.user_credits (user_id, monthly_credits_remaining, monthly_credits_limit, purchased_credits_remaining, purchased_credits_limit, first_premium_used)
    VALUES (p_user_id, 0, 0, 0, 0, false)
    RETURNING * INTO user_credits_data;
  END IF;

  -- Les crédits disponibles sont directement les crédits restants
  v_monthly_available := COALESCE(user_credits_data.monthly_credits_remaining, 0);
  v_purchased_available := COALESCE(user_credits_data.purchased_credits_remaining, 0);
  v_total_available := v_monthly_available + v_purchased_available;
  
  RETURN jsonb_build_object(
    'monthly_used', COALESCE(user_credits_data.monthly_credits_limit, 0) - v_monthly_available, -- Calculer les crédits utilisés à partir de la limite et du restant
    'monthly_limit', COALESCE(user_credits_data.monthly_credits_limit, 0),
    'monthly_available', v_monthly_available,
    'purchased_used', COALESCE(user_credits_data.purchased_credits_limit, 0) - v_purchased_available, -- Calculer les crédits utilisés à partir de la limite et du restant
    'purchased_limit', COALESCE(user_credits_data.purchased_credits_limit, 0),
    'purchased_available', v_purchased_available,
    'total_available', v_total_available,
    'subscription_status', COALESCE(profile_info.subscription_status, 'inactive'),
    'first_premium_used', COALESCE(user_credits_data.first_premium_used, false),
    'credits_reset_at', user_credits_data.credits_reset_at
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
