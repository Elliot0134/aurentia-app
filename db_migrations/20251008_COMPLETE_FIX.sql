-- =====================================================
-- COMPLETE FIX FOR ORGANIZATION RLS POLICIES
-- Run this ENTIRE file in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- STEP 1: Remove organization_id from profiles if it exists
-- =====================================================

-- Drop the column with CASCADE to remove any dependent objects
ALTER TABLE public.profiles DROP COLUMN IF EXISTS organization_id CASCADE;

-- =====================================================
-- STEP 2: Drop all existing policies
-- =====================================================

DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all existing policies on organizations table
    FOR r IN (
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'organizations'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.organizations', r.policyname);
    END LOOP;
    
    -- Drop all existing policies on user_organizations table
    FOR r IN (
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'user_organizations'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_organizations', r.policyname);
    END LOOP;
END $$;

-- =====================================================
-- STEP 3: Create helper functions to avoid recursion
-- =====================================================

-- Drop existing functions first with CASCADE
DROP FUNCTION IF EXISTS public.is_organization_member(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS public.is_organization_admin(uuid, uuid) CASCADE;

-- Function to check if user is a member of an organization
CREATE FUNCTION public.is_organization_member(org_id uuid, check_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_organizations
    WHERE organization_id = org_id
      AND user_id = check_user_id
      AND status = 'active'
  );
$$;

-- Function to check if user is an organization admin
CREATE FUNCTION public.is_organization_admin(org_id uuid, check_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_organizations
    WHERE organization_id = org_id
      AND user_id = check_user_id
      AND status = 'active'
      AND user_role IN ('organisation', 'staff')
  );
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.is_organization_member(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_organization_admin(uuid, uuid) TO authenticated;

-- =====================================================
-- STEP 4: Create organizations table policies
-- =====================================================

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can create organizations" ON public.organizations
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Public organizations are viewable by everyone" ON public.organizations
  FOR SELECT 
  TO authenticated
  USING (is_public = true AND onboarding_completed = true);

CREATE POLICY "Organization members can view their organization" ON public.organizations
  FOR SELECT 
  TO authenticated
  USING (
    auth.uid() = created_by OR
    public.is_organization_member(id, auth.uid())
  );

CREATE POLICY "Organization creators and staff can update their organization" ON public.organizations
  FOR UPDATE 
  TO authenticated
  USING (
    auth.uid() = created_by OR
    public.is_organization_admin(id, auth.uid())
  );

CREATE POLICY "Organization owners can delete their organization" ON public.organizations
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = created_by);

-- =====================================================
-- STEP 5: Create user_organizations table policies
-- =====================================================

ALTER TABLE public.user_organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own organization memberships" ON public.user_organizations
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view organization member list" ON public.user_organizations
  FOR SELECT
  TO authenticated
  USING (public.is_organization_member(organization_id, auth.uid()));

CREATE POLICY "Users can insert their own organization membership" ON public.user_organizations
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Organization admins can insert memberships" ON public.user_organizations
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_organization_admin(organization_id, auth.uid()));

CREATE POLICY "Users can update their own organization membership" ON public.user_organizations
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Organization admins can update memberships" ON public.user_organizations
  FOR UPDATE
  TO authenticated
  USING (public.is_organization_admin(organization_id, auth.uid()));

CREATE POLICY "Users can delete their own organization membership" ON public.user_organizations
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Organization admins can delete memberships" ON public.user_organizations
  FOR DELETE
  TO authenticated
  USING (public.is_organization_admin(organization_id, auth.uid()));

-- =====================================================
-- STEP 6: Verify everything
-- =====================================================

-- Show all policies created
SELECT 
  tablename,
  policyname,
  cmd as operation
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('organizations', 'user_organizations')
ORDER BY tablename, policyname;

-- Verify organization_id column is gone from profiles
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'organization_id'
  ) THEN
    RAISE EXCEPTION 'ERROR: organization_id column still exists in profiles table!';
  ELSE
    RAISE NOTICE '✓ SUCCESS: organization_id column removed from profiles';
    RAISE NOTICE '✓ Migration completed successfully!';
    RAISE NOTICE 'Next step: Regenerate TypeScript types with: npx supabase gen types typescript --project-id llcliurrrrxnkquwmwsi > src/types/supabase.ts';
  END IF;
END $$;
