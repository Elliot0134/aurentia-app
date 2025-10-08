-- Remove organization_id column from profiles table if it exists
-- This column should not exist - user-organization relationship is managed through user_organizations table

-- Drop the column if it exists (with CASCADE to drop any dependent objects)
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS organization_id CASCADE;

-- Verify the column is gone
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'organization_id'
  ) THEN
    RAISE EXCEPTION 'organization_id column still exists in profiles table!';
  ELSE
    RAISE NOTICE 'SUCCESS: organization_id column removed from profiles table (or did not exist)';
  END IF;
END $$;
