-- Script de diagnostic rapide pour les adhérents
-- Exécuter dans Supabase SQL Editor ou votre interface de base de données

-- 1. Vérifier combien d'organisations existent
SELECT 'Organizations' as table_name, COUNT(*) as count FROM organizations
UNION ALL
-- 2. Vérifier combien d'entrées user_organizations existent
SELECT 'user_organizations (active)', COUNT(*) FROM user_organizations WHERE status = 'active'
UNION ALL
-- 3. Vérifier combien de profiles avec organization_id existent
SELECT 'profiles with org_id', COUNT(*) FROM profiles WHERE organization_id IS NOT NULL
UNION ALL
-- 4. Vérifier les membres spécifiquement
SELECT 'user_orgs members', COUNT(*) FROM user_organizations WHERE user_role = 'member' AND status = 'active'
UNION ALL
SELECT 'profiles members', COUNT(*) FROM profiles WHERE user_role = 'member';

-- 5. Voir les données réelles (limité à 5 lignes)
SELECT 'SAMPLE user_organizations:' as info, NULL as org_id, NULL as user_role, NULL as status, NULL as email
UNION ALL
SELECT 
  'user_org_data',
  uo.organization_id::text,
  uo.user_role,
  uo.status,
  p.email
FROM user_organizations uo
LEFT JOIN profiles p ON uo.user_id = p.id
LIMIT 5;

-- 6. Voir les profiles avec organization_id
SELECT 'SAMPLE profiles with org_id:' as info, organization_id::text as org_id, user_role, email, NULL as extra
FROM profiles 
WHERE organization_id IS NOT NULL 
LIMIT 5;