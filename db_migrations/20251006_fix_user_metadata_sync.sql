-- Migration: Fix user metadata synchronization to profiles table
-- Date: 2025-10-06
-- Description: Sync auth.users metadata to profiles table using Supabase-compatible approach
--              Note: Cannot create triggers on auth.users (permission denied)
--              Solution: Use application-level sync + backfill existing data

-- 1. Create a helper function to sync user metadata to profile
-- This will be called from the application code during signup
CREATE OR REPLACE FUNCTION public.sync_user_metadata_to_profile(
  p_user_id uuid,
  p_email text DEFAULT NULL,
  p_first_name text DEFAULT NULL,
  p_last_name text DEFAULT NULL,
  p_phone text DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  -- Upsert profile with provided data or fetch from auth.users metadata
  INSERT INTO public.profiles (
    id,
    email,
    first_name,
    last_name,
    phone,
    user_role,
    email_confirmation_required,
    created_at
  )
  VALUES (
    p_user_id,
    COALESCE(p_email, (SELECT email FROM auth.users WHERE id = p_user_id)),
    COALESCE(p_first_name, ''),
    COALESCE(p_last_name, ''),
    COALESCE(p_phone, ''),
    'individual', -- Default role
    true, -- Require email confirmation by default
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = COALESCE(EXCLUDED.email, public.profiles.email),
    first_name = CASE 
      WHEN EXCLUDED.first_name IS NOT NULL AND EXCLUDED.first_name != '' 
      THEN EXCLUDED.first_name 
      ELSE public.profiles.first_name 
    END,
    last_name = CASE 
      WHEN EXCLUDED.last_name IS NOT NULL AND EXCLUDED.last_name != '' 
      THEN EXCLUDED.last_name 
      ELSE public.profiles.last_name 
    END,
    phone = CASE 
      WHEN EXCLUDED.phone IS NOT NULL AND EXCLUDED.phone != '' 
      THEN EXCLUDED.phone 
      ELSE public.profiles.phone 
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Backfill existing users who have metadata but NULL profile fields
-- This reads from auth.users.raw_user_meta_data and updates profiles
UPDATE public.profiles p
SET 
  first_name = COALESCE(p.first_name, au.raw_user_meta_data->>'first_name'),
  last_name = COALESCE(p.last_name, au.raw_user_meta_data->>'last_name'),
  phone = COALESCE(
    p.phone, 
    au.raw_user_meta_data->>'phone_number',
    au.raw_user_meta_data->>'phone'
  )
FROM auth.users au
WHERE p.id = au.id
  AND (
    (p.first_name IS NULL AND au.raw_user_meta_data->>'first_name' IS NOT NULL)
    OR (p.last_name IS NULL AND au.raw_user_meta_data->>'last_name' IS NOT NULL)
    OR (p.phone IS NULL AND (au.raw_user_meta_data->>'phone_number' IS NOT NULL OR au.raw_user_meta_data->>'phone' IS NOT NULL))
  );

-- 3. Add comment for documentation
COMMENT ON FUNCTION public.sync_user_metadata_to_profile(uuid, text, text, text, text) IS 
  'Syncs user metadata to profile. Called from application during signup. Use: SELECT sync_user_metadata_to_profile(user_id, email, first_name, last_name, phone)';

-- 4. Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.sync_user_metadata_to_profile(uuid, text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.sync_user_metadata_to_profile(uuid, text, text, text, text) TO service_role;
