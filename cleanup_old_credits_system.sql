-- Script pour nettoyer l'ancien système de crédits
-- À exécuter dans Supabase Dashboard > SQL Editor

-- ÉTAPE 1: Supprimer l'ancien système de crédits
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_credits() CASCADE;
DROP TABLE IF EXISTS public.user_credits CASCADE;

-- ÉTAPE 2: Supprimer les anciennes fonctions de crédits si elles existent
DROP FUNCTION IF EXISTS public.deduct_user_credits(UUID, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS public.add_user_credits(UUID, INTEGER) CASCADE;

-- ÉTAPE 3: S'assurer que le nouveau système billing est bien en place
-- Vérifier que les tables existent
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'billing' AND table_name = 'user_credits') THEN
        RAISE EXCEPTION 'Table billing.user_credits manquante ! Exécutez d''abord db_billing_schema_migration.sql';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        RAISE EXCEPTION 'Table profiles manquante !';
    END IF;
    
    -- Vérifier que la colonne subscription_status existe dans profiles
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'profiles'
        AND column_name = 'subscription_status'
    ) THEN
        -- Ajouter la colonne subscription_status si elle n'existe pas
        ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive';
        RAISE NOTICE 'Colonne subscription_status ajoutée à la table profiles';
    END IF;
    
    RAISE NOTICE 'Nettoyage terminé avec succès. Système de crédits unifié sur le schéma billing.';
END $$;

-- ÉTAPE 4: Créer un trigger pour initialiser les nouveaux utilisateurs dans le système billing
CREATE OR REPLACE FUNCTION billing.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Initialiser l'utilisateur dans le système billing avec 0 crédits
  INSERT INTO billing.user_credits (user_id, monthly_credits, purchased_credits, first_premium_used)
  VALUES (NEW.id, 0, 0, false)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour les nouveaux utilisateurs
DROP TRIGGER IF EXISTS on_auth_user_created_billing ON auth.users;
CREATE TRIGGER on_auth_user_created_billing
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION billing.handle_new_user();

-- ÉTAPE 5: Vérification finale
SELECT 
  'billing.user_credits' as table_name,
  COUNT(*) as user_count
FROM billing.user_credits

UNION ALL

SELECT 
  'billing.subscriptions' as table_name,
  COUNT(*) as subscription_count
FROM billing.subscriptions;