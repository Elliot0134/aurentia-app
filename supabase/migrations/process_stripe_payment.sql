-- Fonction SQL simple pour traiter les paiements Stripe
CREATE OR REPLACE FUNCTION process_stripe_payment(
  p_customer_email TEXT,
  p_stripe_customer_id TEXT DEFAULT NULL,
  p_subscription_id TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  result JSON;
BEGIN
  -- Trouver l'utilisateur par email
  SELECT id INTO v_user_id 
  FROM profiles 
  WHERE email = p_customer_email;
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User not found');
  END IF;
  
  -- Mettre à jour les crédits et statut
  UPDATE profiles 
  SET 
    monthly_credits_remaining = 1500,
    monthly_credits_limit = 1500,
    subscription_status = 'active',
    updated_at = NOW()
  WHERE id = v_user_id;
  
  -- Ajouter dans billing si la table existe
  BEGIN
    INSERT INTO billing.user_credits (user_id, amount, credit_type, description)
    VALUES (v_user_id, 1500, 'monthly', 'Crédits abonnement Stripe');
  EXCEPTION WHEN OTHERS THEN
    NULL; -- Ignorer si billing n'existe pas
  END;
  
  RETURN json_build_object(
    'success', true, 
    'user_id', v_user_id,
    'credits_added', 1500
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant pour authenticated users
GRANT EXECUTE ON FUNCTION process_stripe_payment(TEXT, TEXT, TEXT) TO authenticated;
