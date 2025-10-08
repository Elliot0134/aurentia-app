-- Migration: Consolidate address and location fields into single location field
-- Date: 2025-10-07
-- Description: Removes duplicate address field and consolidates all location data into the location field

-- Step 1: Migrate data from address to location (if location is empty and address has data)
UPDATE public.profiles
SET location = address
WHERE (location IS NULL OR location = '')
  AND address IS NOT NULL
  AND address != '';

-- Step 2: Drop the address column
ALTER TABLE public.profiles
DROP COLUMN IF EXISTS address;

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

-- Step 5: Backfill location from auth.users metadata for existing users (check both location and address fields)
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

-- Step 6: Update index (if address index exists, it will be removed with the column)
-- The location index should already exist from previous migrations

COMMENT ON COLUMN public.profiles.location IS 'User location (city, region, or full address) for organization discovery and matching';
