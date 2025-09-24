-- Script pour vérifier les données de user_organizations et profiles
-- Ce script aide à déboguer pourquoi les adhérents n'apparaissent pas

-- 1. Vérifier les organisations existantes
SELECT id, name, type, created_at 
FROM organizations 
ORDER BY created_at DESC 
LIMIT 5;

-- 2. Vérifier les relations user_organizations
SELECT 
    uo.id,
    uo.user_id,
    uo.organization_id,
    uo.user_role,
    uo.status,
    uo.joined_at,
    o.name as organization_name
FROM user_organizations uo
LEFT JOIN organizations o ON uo.organization_id = o.id
ORDER BY uo.joined_at DESC
LIMIT 10;

-- 3. Vérifier les profils utilisateurs
SELECT 
    p.id,
    p.email,
    p.first_name,
    p.last_name,
    p.user_role as profile_user_role,
    p.organization_id as profile_org_id,
    p.created_at
FROM profiles p
ORDER BY p.created_at DESC
LIMIT 10;

-- 4. Requête complète pour tester la jointure (comme dans le code)
SELECT 
    uo.id,
    uo.user_id,
    uo.organization_id,
    uo.user_role,
    uo.joined_at,
    uo.status,
    p.id as profile_id,
    p.email,
    p.first_name,
    p.last_name,
    p.phone,
    p.created_at as profile_created_at,
    p.invitation_code_used
FROM user_organizations uo
LEFT JOIN profiles p ON uo.user_id = p.id
WHERE uo.status = 'active'
AND uo.user_role IN ('member', 'staff', 'organisation')
ORDER BY uo.joined_at DESC;