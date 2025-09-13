-- Script pour corriger l'affichage des crédits
-- Le problème : affichage "3 sur 5" au lieu des vrais crédits du système billing

-- ÉTAPE 1: Vérifier les colonnes actuelles dans profiles
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles' 
AND column_name LIKE '%credit%';

-- ÉTAPE 2: Vérifier les données actuelles pour votre utilisateur
SELECT 
    id,
    email,
    subscription_status,
    -- Autres colonnes liées aux crédits qui pourraient exister
    *
FROM public.profiles 
WHERE id = '006810be-0ca2-4412-ae2c-3fb511362ca0';

-- ÉTAPE 3: Supprimer les anciennes colonnes de crédits dans profiles (si elles existent)
-- ⚠️ ATTENTION : Uncomment seulement après vérification
-- ALTER TABLE public.profiles DROP COLUMN IF EXISTS credits_restants;
-- ALTER TABLE public.profiles DROP COLUMN IF EXISTS credits_limite;
-- ALTER TABLE public.profiles DROP COLUMN IF EXISTS credits;

-- ÉTAPE 4: Vérifier que le nouveau système fonctionne
SELECT billing.get_user_balance('006810be-0ca2-4412-ae2c-3fb511362ca0'::UUID) as nouveaux_credits;

-- ÉTAPE 5: Vérifier s'il y a des données dans l'ancienne table user_credits
SELECT * FROM public.user_credits 
WHERE user_id = '006810be-0ca2-4412-ae2c-3fb511362ca0'
LIMIT 1;

-- Si cette requête retourne des données, c'est que l'ancienne table existe encore
-- et pourrait être lue par l'ancien hook useCredits.js