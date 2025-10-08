-- Script de vérification pour identifier les utilisateurs avec des métadonnées manquantes
-- Date: 2025-10-06

-- 1. Vérifier les utilisateurs avec metadata mais profil incomplet
SELECT 
    au.id as user_id,
    au.email,
    au.raw_user_meta_data->>'first_name' as metadata_first_name,
    au.raw_user_meta_data->>'last_name' as metadata_last_name,
    au.raw_user_meta_data->>'phone_number' as metadata_phone,
    p.first_name as profile_first_name,
    p.last_name as profile_last_name,
    p.phone as profile_phone,
    CASE 
        WHEN p.first_name IS NULL AND au.raw_user_meta_data->>'first_name' IS NOT NULL THEN '❌ Missing first_name'
        WHEN p.last_name IS NULL AND au.raw_user_meta_data->>'last_name' IS NOT NULL THEN '❌ Missing last_name'
        WHEN p.phone IS NULL AND au.raw_user_meta_data->>'phone_number' IS NOT NULL THEN '❌ Missing phone'
        ELSE '✅ OK'
    END as status
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE 
    (p.first_name IS NULL AND au.raw_user_meta_data->>'first_name' IS NOT NULL)
    OR (p.last_name IS NULL AND au.raw_user_meta_data->>'last_name' IS NOT NULL)
    OR (p.phone IS NULL AND au.raw_user_meta_data->>'phone_number' IS NOT NULL)
ORDER BY au.created_at DESC;

-- 2. Compter les utilisateurs affectés
SELECT 
    COUNT(*) as total_affected_users,
    COUNT(*) FILTER (WHERE p.first_name IS NULL AND au.raw_user_meta_data->>'first_name' IS NOT NULL) as missing_first_name,
    COUNT(*) FILTER (WHERE p.last_name IS NULL AND au.raw_user_meta_data->>'last_name' IS NOT NULL) as missing_last_name,
    COUNT(*) FILTER (WHERE p.phone IS NULL AND au.raw_user_meta_data->>'phone_number' IS NOT NULL) as missing_phone
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE 
    (p.first_name IS NULL AND au.raw_user_meta_data->>'first_name' IS NOT NULL)
    OR (p.last_name IS NULL AND au.raw_user_meta_data->>'last_name' IS NOT NULL)
    OR (p.phone IS NULL AND au.raw_user_meta_data->>'phone_number' IS NOT NULL);

-- 3. Vérifier si le trigger existe
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 4. Vérifier si la fonction existe
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines
WHERE routine_name = 'handle_new_user'
AND routine_schema = 'public';
