-- Migration: Restructurer le système de crédits vers used/limit
BEGIN;

-- Ajouter nouvelles colonnes
ALTER TABLE billing.user_credits 
ADD COLUMN monthly_credits_used INTEGER DEFAULT 0 CHECK (monthly_credits_used >= 0),
ADD COLUMN monthly_credits_limit INTEGER DEFAULT 0 CHECK (monthly_credits_limit >= 0),
ADD COLUMN purchased_credits_used INTEGER DEFAULT 0 CHECK (purchased_credits_used >= 0),
ADD COLUMN purchased_credits_limit INTEGER DEFAULT 0 CHECK (purchased_credits_limit >= 0);

-- Migrer données existantes
UPDATE billing.user_credits SET
    monthly_credits_limit = COALESCE(monthly_credits, 0),
    purchased_credits_limit = COALESCE(purchased_credits, 0),
    monthly_credits_used = 0,
    purchased_credits_used = 0;

-- Nouvelle fonction get_user_balance
CREATE OR REPLACE FUNCTION billing.get_user_balance(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  uc RECORD;
  profile_sub TEXT;
BEGIN
  SELECT * INTO uc FROM billing.user_credits WHERE user_id = p_user_id;
  SELECT subscription_status INTO profile_sub FROM public.profiles WHERE id = p_user_id;
  
  IF uc IS NULL THEN
    INSERT INTO billing.user_credits (user_id, monthly_credits_used, monthly_credits_limit, purchased_credits_used, purchased_credits_limit)
    VALUES (p_user_id, 0, 0, 0, 0) RETURNING * INTO uc;
  END IF;
  
  RETURN jsonb_build_object(
    'monthly_used', COALESCE(uc.monthly_credits_used, 0),
    'monthly_limit', COALESCE(uc.monthly_credits_limit, 0),
    'monthly_available', COALESCE(uc.monthly_credits_limit, 0) - COALESCE(uc.monthly_credits_used, 0),
    'purchased_used', COALESCE(uc.purchased_credits_used, 0),
    'purchased_limit', COALESCE(uc.purchased_credits_limit, 0),
    'purchased_available', COALESCE(uc.purchased_credits_limit, 0) - COALESCE(uc.purchased_credits_used, 0),
    'total_available', 
      (COALESCE(uc.monthly_credits_limit, 0) - COALESCE(uc.monthly_credits_used, 0)) +
      (COALESCE(uc.purchased_credits_limit, 0) - COALESCE(uc.purchased_credits_used, 0)),
    'subscription_status', COALESCE(profile_sub, 'inactive')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;