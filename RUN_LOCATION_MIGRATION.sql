-- ============================================================================
-- LOCATION FIELD CONSOLIDATION MIGRATION
-- Run this in the Supabase SQL Editor or via psql
-- ============================================================================

-- This migration consolidates the duplicate 'address' and 'location' fields
-- in the profiles table into a single 'location' field.

BEGIN;

-- Step 1: Migrate data from address to location (if location is empty and address has data)
DO $$
BEGIN
  UPDATE public.profiles
  SET location = address
  WHERE (location IS NULL OR location = '')
    AND address IS NOT NULL
    AND address != '';
  
  RAISE NOTICE 'Migrated % rows from address to location', (SELECT COUNT(*) FROM public.profiles WHERE location IS NOT NULL AND location != '');
END $$;

-- Step 2: Drop the address column
DO $$
BEGIN
  ALTER TABLE public.profiles
  DROP COLUMN IF EXISTS address;

  RAISE NOTICE 'Dropped address column from profiles table';
END $$;

-- Step 3: Drop the old sync function
DROP FUNCTION IF EXISTS public.sync_user_metadata_to_profile(uuid, text, text, text, text, text);

-- Step 4: Create updated function with location parameter instead of address
CREATE OR REPLACE FUNCTION public.sync_user_metadata_to_profile(
  p_user_id uuid,
  p_email text DEFAULT NULL,
  p_first_name text DEFAULT NULL,
  p_last_name text DEFAULT NULL,
  p_phone text DEFAULT NULL,
  p_location text DEFAULT NULL
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
    location,
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
    COALESCE(p_location, ''),
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
    END,
    location = CASE 
      WHEN EXCLUDED.location IS NOT NULL AND EXCLUDED.location != '' 
      THEN EXCLUDED.location 
      ELSE public.profiles.location 
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment for documentation
COMMENT ON FUNCTION public.sync_user_metadata_to_profile(uuid, text, text, text, text, text) IS 
  'Syncs user metadata to profile including location. Called from application during signup. Use: SELECT sync_user_metadata_to_profile(user_id, email, first_name, last_name, phone, location)';

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.sync_user_metadata_to_profile(uuid, text, text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.sync_user_metadata_to_profile(uuid, text, text, text, text, text) TO service_role;

DO $$
BEGIN
  RAISE NOTICE 'Updated sync_user_metadata_to_profile function';
END $$;

-- Step 5: Backfill location from auth.users metadata for existing users
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE public.profiles p
  SET 
    location = COALESCE(
      p.location, 
      au.raw_user_meta_data->>'location',
      au.raw_user_meta_data->>'address'
    )
  FROM auth.users au
  WHERE p.id = au.id
    AND (p.location IS NULL OR p.location = '')
    AND (
      au.raw_user_meta_data->>'location' IS NOT NULL 
      OR au.raw_user_meta_data->>'address' IS NOT NULL
    );
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE 'Backfilled % profiles from auth metadata', updated_count;
END $$;

-- Step 6: Update column comment
COMMENT ON COLUMN public.profiles.location IS 'User location (city, region, or full address) for organization discovery and matching';

DO $$
BEGIN
  RAISE NOTICE '✅ Migration completed successfully!';
END $$;

COMMIT;

-- Verification queries (run these after the migration)
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'profiles' AND column_name IN ('location', 'address');
-- SELECT COUNT(*) as profiles_with_location FROM public.profiles WHERE location IS NOT NULL AND location != '';
-- SELECT proname, prosrc FROM pg_proc WHERE proname = 'sync_user_metadata_to_profile';
