# ✅ READY TO RUN - Corrected Migrations

## Copy & Paste These Into Supabase SQL Editor

### Migration 1: Add Address and Applications Table

```sql
-- Migration: Add address field to profiles and create organisation_applications table
-- Date: 2025-10-07
-- Description: 
--   1. Add address field to profiles table for location-based organization discovery
--   2. Create organisation_applications table to track user applications to organizations

-- Step 1: Add address field to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS address text;

-- Add index for address searches (for better performance with location queries)
CREATE INDEX IF NOT EXISTS idx_profiles_address ON public.profiles(address);

-- Step 2: Create organisation_applications table
CREATE TABLE IF NOT EXISTS public.organisation_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  message text, -- Optional message from the user
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  reviewed_at timestamp with time zone,
  reviewed_by uuid REFERENCES public.profiles(id),
  
  -- Ensure a user can only have one pending application per organization at a time
  CONSTRAINT unique_user_org_pending_application UNIQUE (user_id, organization_id)
);

-- Add indexes for organisation_applications
CREATE INDEX IF NOT EXISTS idx_org_applications_user_id ON public.organisation_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_org_applications_org_id ON public.organisation_applications(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_applications_status ON public.organisation_applications(status);

-- Add RLS policies for organisation_applications
ALTER TABLE public.organisation_applications ENABLE ROW LEVEL SECURITY;

-- Users can view their own applications
CREATE POLICY "Users can view their own applications"
ON public.organisation_applications
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create applications for themselves
CREATE POLICY "Users can create applications"
ON public.organisation_applications
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update (cancel) their own pending applications
CREATE POLICY "Users can update their own pending applications"
ON public.organisation_applications
FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending')
WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Organization staff and admins can view applications to their organization
CREATE POLICY "Organization staff can view applications to their org"
ON public.organisation_applications
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_organizations
    WHERE user_organizations.user_id = auth.uid()
    AND user_organizations.organization_id = organisation_applications.organization_id
    AND user_organizations.user_role IN ('organisation', 'staff')
    AND user_organizations.status = 'active'
  )
);

-- Organization staff and admins can update (approve/reject) applications to their organization
CREATE POLICY "Organization staff can update applications to their org"
ON public.organisation_applications
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_organizations
    WHERE user_organizations.user_id = auth.uid()
    AND user_organizations.organization_id = organisation_applications.organization_id
    AND user_organizations.user_role IN ('organisation', 'staff')
    AND user_organizations.status = 'active'
  )
);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_organisation_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_organisation_applications_updated_at
BEFORE UPDATE ON public.organisation_applications
FOR EACH ROW
EXECUTE FUNCTION update_organisation_applications_updated_at();

-- Add comments for documentation
COMMENT ON TABLE public.organisation_applications IS 'Tracks user applications to join public organizations';
COMMENT ON COLUMN public.profiles.address IS 'User address for location-based organization discovery';
```

---

### Migration 2: Update Sync Function with Address

```sql
-- Migration: Update sync_user_metadata_to_profile function to include address
-- Date: 2025-10-07
-- Description: Updates the sync_user_metadata_to_profile function to accept and sync address field

-- Drop the old function
DROP FUNCTION IF EXISTS public.sync_user_metadata_to_profile(uuid, text, text, text, text);

-- Create updated function with address parameter
CREATE OR REPLACE FUNCTION public.sync_user_metadata_to_profile(
  p_user_id uuid,
  p_email text DEFAULT NULL,
  p_first_name text DEFAULT NULL,
  p_last_name text DEFAULT NULL,
  p_phone text DEFAULT NULL,
  p_address text DEFAULT NULL
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
    address,
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
    COALESCE(p_address, ''),
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
    address = CASE 
      WHEN EXCLUDED.address IS NOT NULL AND EXCLUDED.address != '' 
      THEN EXCLUDED.address 
      ELSE public.profiles.address 
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment for documentation
COMMENT ON FUNCTION public.sync_user_metadata_to_profile(uuid, text, text, text, text, text) IS 
  'Syncs user metadata to profile including address. Called from application during signup. Use: SELECT sync_user_metadata_to_profile(user_id, email, first_name, last_name, phone, address)';

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.sync_user_metadata_to_profile(uuid, text, text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.sync_user_metadata_to_profile(uuid, text, text, text, text, text) TO service_role;

-- Backfill address from auth.users metadata for existing users
UPDATE public.profiles p
SET 
  address = COALESCE(p.address, au.raw_user_meta_data->>'address')
FROM auth.users au
WHERE p.id = au.id
  AND p.address IS NULL 
  AND au.raw_user_meta_data->>'address' IS NOT NULL;
```

---

## ✅ Verification After Running Migrations

Run these queries to confirm everything worked:

```sql
-- 1. Verify address column exists
SELECT EXISTS (
  SELECT 1 FROM information_schema.columns 
  WHERE table_name = 'profiles' AND column_name = 'address'
) as address_column_exists;
-- Expected: true

-- 2. Verify organisation_applications table exists
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_name = 'organisation_applications'
) as applications_table_exists;
-- Expected: true

-- 3. Count RLS policies on organisation_applications
SELECT COUNT(*) as policy_count
FROM pg_policies
WHERE tablename = 'organisation_applications';
-- Expected: 5 policies

-- 4. Verify sync function has 6 parameters
SELECT COUNT(*) as parameter_count
FROM information_schema.parameters
WHERE specific_name = (
  SELECT specific_name 
  FROM information_schema.routines 
  WHERE routine_name = 'sync_user_metadata_to_profile'
  LIMIT 1
);
-- Expected: 6 parameters
```

## 🎉 Success Criteria

All migrations successful when:
- ✅ No SQL errors
- ✅ All verification queries return expected results
- ✅ Application compiles without errors
- ✅ Users can signup with address field
- ✅ Public organizations modal displays organizations

## 📝 Next Steps After Migration

1. Test signup with address field
2. Test public organizations discovery modal
3. Test application submission
4. Verify data in `organisation_applications` table
