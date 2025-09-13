-- Script de diagnostic corrigé
-- Le problème : affichage "3 sur 5" au lieu des vrais crédits du système billing

-- ÉTAPE 1: Vérifier les colonnes dans profiles qui pourraient causer le "3 sur 5"
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles' 
ORDER BY column_name;

-- ÉTAPE 2: Vérifier les données actuelles pour votre utilisateur
SELECT *
FROM public.profiles 
WHERE id = '006810be-0ca2-4412-ae2c-3fb511362ca0';

-- ÉTAPE 3: Vérifier que le nouveau système billing fonctionne correctement
SELECT billing.get_user_balance('006810be-0ca2-4412-ae2c-3fb511362ca0'::UUID) as credits_billing_system;

-- ÉTAPE 4: Vérifier les crédits dans la table billing directement  
SELECT 
    user_id,
    monthly_credits,
    purchased_credits,
    first_premium_used,
    created_at,
    updated_at
FROM billing.user_credits 
WHERE user_id = '006810be-0ca2-4412-ae2c-3fb511362ca0';

-- ÉTAPE 5: Si il y a des colonnes credits* dans profiles, les voir
-- (à décommenter selon ce que montre l'ÉTAPE 1)
-- SELECT credits, credits_restants, credits_limite FROM public.profiles WHERE id = '006810be-0ca2-4412-ae2c-3fb511362ca0';