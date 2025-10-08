-- Fix sync_user_metadata_to_profile to accept optional user_role parameter
-- This allows setting the correct role during signup instead of defaulting to 'individual'

-- Drop the old function
DROP FUNCTION IF EXISTS public.sync_user_metadata_to_profile(uuid, text, text, text, text, text);

-- Create updated function with optional user_role parameter
CREATE OR REPLACE FUNCTION public.sync_user_metadata_to_profile(
  p_user_id uuid,
  p_email text DEFAULT NULL,
  p_first_name text DEFAULT NULL,
  p_last_name text DEFAULT NULL,
  p_phone text DEFAULT NULL,
  p_location text DEFAULT NULL,
  p_user_role text DEFAULT 'individual'  -- NEW: Allow passing the role, defaults to 'individual' for backward compatibility
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
    COALESCE(p_user_role, 'individual'), -- Use provided role or default to 'individual'
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
    END,
    -- Also update user_role if provided and different
    user_role = CASE
      WHEN EXCLUDED.user_role IS NOT NULL AND EXCLUDED.user_role != 'individual'
      THEN EXCLUDED.user_role
      ELSE public.profiles.user_role
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment for documentation
COMMENT ON FUNCTION public.sync_user_metadata_to_profile(uuid, text, text, text, text, text, text) IS 
  'Syncs user metadata to profile including location and role. Called from application during signup. Use: SELECT sync_user_metadata_to_profile(user_id, email, first_name, last_name, phone, location, user_role)';

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.sync_user_metadata_to_profile(uuid, text, text, text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.sync_user_metadata_to_profile(uuid, text, text, text, text, text, text) TO service_role;
