-- Fix des crédits manquants pour les utilisateurs avec abonnement actif
-- À exécuter une seule fois après la mise en place du nouveau webhook

-- Fonction pour corriger les crédits manquants
CREATE OR REPLACE FUNCTION fix_missing_credits()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  credits_before INTEGER,
  credits_after INTEGER
) AS $$
BEGIN
  -- Mettre à jour les utilisateurs avec subscription_status = 'active' 
  -- mais qui ont moins de 1000 crédits (probablement n'ont pas reçu leurs crédits d'abonnement)
  RETURN QUERY
  UPDATE profiles 
  SET 
    monthly_credits_remaining = 1500,
    monthly_credits_limit = 1500,
    updated_at = NOW()
  WHERE subscription_status = 'active' 
  AND (monthly_credits_remaining IS NULL OR monthly_credits_remaining < 1000)
  RETURNING 
    id as user_id,
    email,
    COALESCE(monthly_credits_remaining, 0) as credits_before,
    1500 as credits_after;
END;
$$ LANGUAGE plpgsql;

-- Exécuter la correction
SELECT * FROM fix_missing_credits();

-- Supprimer la fonction après utilisation
DROP FUNCTION fix_missing_credits();
