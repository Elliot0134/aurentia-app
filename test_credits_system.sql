-- Script de test pour vérifier le fonctionnement du système de crédits après correction
-- À exécuter dans Supabase Dashboard > SQL Editor après les corrections

-- ÉTAPE 1: Vérifier qu'un utilisateur existe (remplacez par un vrai user_id)
-- SELECT id, email FROM auth.users LIMIT 1;

-- ÉTAPE 2: Tester l'ajout de crédits mensuels (abonnement)
-- Remplacez 'YOUR_USER_ID' par un vrai UUID utilisateur
DO $$
DECLARE
    test_user_id UUID;
    result JSONB;
BEGIN
    -- Récupérer le premier utilisateur pour le test
    SELECT id INTO test_user_id FROM auth.users LIMIT 1;
    
    IF test_user_id IS NULL THEN
        RAISE EXCEPTION 'Aucun utilisateur trouvé pour le test';
    END IF;
    
    RAISE NOTICE 'Test avec utilisateur: %', test_user_id;
    
    -- Test 1: Ajouter des crédits mensuels
    RAISE NOTICE '--- TEST 1: Ajout crédits mensuels ---';
    SELECT billing.add_credits(
        test_user_id,
        1500,
        'monthly',
        'Test abonnement mensuel',
        'test_stripe_ref'
    ) INTO result;
    
    RAISE NOTICE 'Résultat ajout crédits: %', result;
    
    -- Test 2: Vérifier le solde
    RAISE NOTICE '--- TEST 2: Vérification solde ---';
    SELECT billing.get_user_balance(test_user_id) INTO result;
    RAISE NOTICE 'Solde utilisateur: %', result;
    
    -- Test 3: Vérifier si premier livrable gratuit
    RAISE NOTICE '--- TEST 3: Premier livrable gratuit ---';
    IF billing.can_generate_premium_for_free(test_user_id) THEN
        RAISE NOTICE 'Premier livrable gratuit: OUI';
    ELSE
        RAISE NOTICE 'Premier livrable gratuit: NON';
    END IF;
    
    RAISE NOTICE '--- TESTS TERMINÉS ---';
END $$;

-- ÉTAPE 3: Vérifier les données dans les tables
SELECT 
    'billing.user_credits' as table_name,
    COUNT(*) as count,
    SUM(monthly_credits) as total_monthly,
    SUM(purchased_credits) as total_purchased
FROM billing.user_credits

UNION ALL

SELECT 
    'billing.subscriptions' as table_name,
    COUNT(*) as count,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_subs,
    0 as placeholder
FROM billing.subscriptions

UNION ALL

SELECT 
    'billing.credit_transactions' as table_name,
    COUNT(*) as count,
    COUNT(CASE WHEN type = 'subscription_monthly' THEN 1 END) as subscription_transactions,
    0 as placeholder
FROM billing.credit_transactions;

-- ÉTAPE 4: Vérifier que l'ancien système est supprimé
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_credits') THEN
        RAISE WARNING 'ATTENTION: L''ancienne table public.user_credits existe encore !';
    ELSE
        RAISE NOTICE 'Bon: L''ancienne table public.user_credits a été supprimée';
    END IF;
END $$;