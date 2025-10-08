-- Migration to fix RLS policies for organizations and user_organizations tables
-- Date: 2025-10-08
-- Issue: Missing INSERT policy preventing organization creation during onboarding
-- Important: This migration does NOT use organization_id in profiles table
-- Instead, it uses the proper user_organizations relational table

-- =====================================================
-- 0. HELPER FUNCTION TO SAFELY DROP ALL POLICIES
-- =====================================================

-- Create a function to drop all policies from a table
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
-- 1. CREATE HELPER FUNCTIONS TO AVOID RECURSION
-- =====================================================

-- Drop existing functions first to avoid parameter name conflicts
-- Use CASCADE to drop dependent policies that will be recreated
DROP FUNCTION IF EXISTS public.is_organization_member(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS public.is_organization_admin(uuid, uuid) CASCADE;

-- Function to check if user is a member of an organization
-- Uses SECURITY DEFINER to bypass RLS and avoid infinite recursion
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

-- Function to check if user is an organization admin (organisation or staff role)
-- Uses SECURITY DEFINER to bypass RLS and avoid infinite recursion
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

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.is_organization_member(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_organization_admin(uuid, uuid) TO authenticated;

-- =====================================================
-- 2. FIX ORGANIZATIONS TABLE POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow authenticated users to insert organizations
-- This is needed for the initial organization creation during onboarding
CREATE POLICY "Authenticated users can create organizations" ON public.organizations
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Policy 2: Public organizations are viewable by everyone
CREATE POLICY "Public organizations are viewable by everyone" ON public.organizations
  FOR SELECT 
  TO authenticated
  USING (is_public = true AND onboarding_completed = true);

-- Policy 3: Organization creators and members can view their organization
-- Uses helper function to avoid infinite recursion
CREATE POLICY "Organization members can view their organization" ON public.organizations
  FOR SELECT 
  TO authenticated
  USING (
    auth.uid() = created_by OR
    public.is_organization_member(id, auth.uid())
  );

-- Policy 4: Organization creators and staff can update their organization
-- Uses helper function to avoid infinite recursion
CREATE POLICY "Organization creators and staff can update their organization" ON public.organizations
  FOR UPDATE 
  TO authenticated
  USING (
    auth.uid() = created_by OR
    public.is_organization_admin(id, auth.uid())
  );

-- Policy 5: Organization owners can delete their organization
CREATE POLICY "Organization owners can delete their organization" ON public.organizations
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = created_by);

-- =====================================================
-- 3. FIX USER_ORGANIZATIONS TABLE POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE public.user_organizations ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view their own organization memberships
-- Simple policy - no recursion risk
CREATE POLICY "Users can view their own organization memberships" ON public.user_organizations
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy 2: Users can view memberships of organizations they belong to
-- This allows seeing other members of the same organization
-- Uses helper function to avoid recursion
CREATE POLICY "Users can view organization member list" ON public.user_organizations
  FOR SELECT
  TO authenticated
  USING (public.is_organization_member(organization_id, auth.uid()));

-- Policy 3: Users can insert their own organization membership when creating an organization
-- Simple policy - no recursion risk
CREATE POLICY "Users can insert their own organization membership" ON public.user_organizations
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy 4: Organization admins can insert new memberships (for inviting users)
-- Uses a simple check against existing memberships to avoid recursion
CREATE POLICY "Organization admins can insert memberships" ON public.user_organizations
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_organization_admin(organization_id, auth.uid()));

-- Policy 5: Users can update their own organization memberships
-- Simple policy - no recursion risk
CREATE POLICY "Users can update their own organization membership" ON public.user_organizations
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy 6: Organization admins can update memberships
-- Uses helper function to avoid recursion
CREATE POLICY "Organization admins can update memberships" ON public.user_organizations
  FOR UPDATE
  TO authenticated
  USING (public.is_organization_admin(organization_id, auth.uid()));

-- Policy 7: Users can delete their own organization memberships (leave organization)
-- Simple policy - no recursion risk
CREATE POLICY "Users can delete their own organization membership" ON public.user_organizations
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy 8: Organization admins can delete memberships (remove users)
-- Uses helper function to avoid recursion
CREATE POLICY "Organization admins can delete memberships" ON public.user_organizations
  FOR DELETE
  TO authenticated
  USING (public.is_organization_admin(organization_id, auth.uid()));

-- =====================================================
-- 4. ADD HELPFUL COMMENTS
-- =====================================================

COMMENT ON FUNCTION public.is_organization_member(uuid, uuid) IS 
  'Helper function to check if a user is a member of an organization. Uses SECURITY DEFINER to bypass RLS and avoid infinite recursion.';

COMMENT ON FUNCTION public.is_organization_admin(uuid, uuid) IS 
  'Helper function to check if a user is an admin (organisation or staff role) of an organization. Uses SECURITY DEFINER to bypass RLS and avoid infinite recursion.';

COMMENT ON POLICY "Authenticated users can create organizations" ON public.organizations IS 
  'Allows authenticated users to create new organizations during onboarding';
  
COMMENT ON POLICY "Public organizations are viewable by everyone" ON public.organizations IS 
  'Allows anyone to view public organizations that have completed onboarding';
  
COMMENT ON POLICY "Organization members can view their organization" ON public.organizations IS 
  'Allows organization members to view their own organization details using helper function to avoid recursion';
  
COMMENT ON POLICY "Organization creators and staff can update their organization" ON public.organizations IS 
  'Allows organization creators and staff members to update organization details using helper function to avoid recursion';

COMMENT ON POLICY "Users can view their own organization memberships" ON public.user_organizations IS 
  'Allows users to see which organizations they belong to';

COMMENT ON POLICY "Users can view organization member list" ON public.user_organizations IS
  'Allows users to see other members of organizations they belong to';
  
COMMENT ON POLICY "Users can insert their own organization membership" ON public.user_organizations IS 
  'Allows users to create their organization membership when setting up a new organization';

COMMENT ON POLICY "Organization admins can insert memberships" ON public.user_organizations IS
  'Allows organization admins to invite new members to the organization';

COMMENT ON POLICY "Users can update their own organization membership" ON public.user_organizations IS 
  'Allows users to update their own organization membership details';

COMMENT ON POLICY "Organization admins can update memberships" ON public.user_organizations IS
  'Allows organization admins to update member details and roles';

COMMENT ON POLICY "Users can delete their own organization membership" ON public.user_organizations IS 
  'Allows users to leave organizations by deleting their own membership';

COMMENT ON POLICY "Organization admins can delete memberships" ON public.user_organizations IS
  'Allows organization admins to remove members from the organization';
