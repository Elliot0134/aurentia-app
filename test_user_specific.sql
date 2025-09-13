-- Test spécifique pour l'utilisateur 006810be-0ca2-4412-ae2c-3fb511362ca0
-- À copier/coller dans Supabase Dashboard > SQL Editor

-- ÉTAPE 1: Vérifier l'utilisateur
SELECT 
    id,
    email,
    created_at
FROM auth.users 
WHERE id = '006810be-0ca2-4412-ae2c-3fb511362ca0';

-- ÉTAPE 2: Vérifier le profil utilisateur
SELECT 
    id,
    email,
    subscription_status,
    created_at
FROM public.profiles 
WHERE id = '006810be-0ca2-4412-ae2c-3fb511362ca0';

-- ÉTAPE 3: Vérifier les crédits actuels
SELECT * FROM billing.user_credits 
WHERE user_id = '006810be-0ca2-4412-ae2c-3fb511362ca0';

-- ÉTAPE 4: Tester l'ajout de crédits mensuels (simulation abonnement)
SELECT billing.add_credits(
    '006810be-0ca2-4412-ae2c-3fb511362ca0'::UUID,
    1500,
    'monthly',
    'Test abonnement mensuel',
    'test_stripe_ref_123'
) as resultat_ajout;

-- ÉTAPE 5: Vérifier le solde après ajout
SELECT billing.get_user_balance('006810be-0ca2-4412-ae2c-3fb511362ca0'::UUID) as solde_final;

-- ÉTAPE 6: Vérifier l'historique des transactions
SELECT 
    type,
    amount,
    credit_type,
    balance_after_monthly,
    balance_after_purchased,
    description,
    created_at
FROM billing.credit_transactions 
WHERE user_id = '006810be-0ca2-4412-ae2c-3fb511362ca0'
ORDER BY created_at DESC;

-- ÉTAPE 7: Tester si premier livrable gratuit
SELECT billing.can_generate_premium_for_free('006810be-0ca2-4412-ae2c-3fb511362ca0'::UUID) as premier_livrable_gratuit;

-- Résultat attendu après ajout :
-- - monthly_credits: 1500
-- - purchased_credits: 0 (ou précédent montant)
-- - total_credits: 1500 + purchased_credits
-- - subscription_status: dépend de ce qui est dans profiles.subscription_status