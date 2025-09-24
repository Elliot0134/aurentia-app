-- Migration: Fix infinite recursion in user_organizations RLS policies
-- Date: 2025-09-24
-- Description: Remove recursive RLS policies and replace with non-recursive alternatives

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Organization owners and staff can view memberships" ON public.user_organizations;
DROP POLICY IF EXISTS "Organization owners can manage memberships" ON public.user_organizations;

-- Keep the simple policy for users to view their own memberships
-- This one doesn't cause recursion
-- DROP POLICY IF EXISTS "Users can view their own organization memberships" ON public.user_organizations;
-- CREATE POLICY "Users can view their own organization memberships" ON public.user_organizations
--   FOR SELECT USING (auth.uid() = user_id);

-- Create new non-recursive policies
-- Organization owners and staff can view memberships based on profiles table instead
CREATE POLICY "Organization owners and staff can view memberships via profiles" ON public.user_organizations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.organization_id = user_organizations.organization_id
      AND p.user_role IN ('organisation', 'staff')
    )
  );

-- Organization owners can manage memberships based on profiles table
CREATE POLICY "Organization owners can manage memberships via profiles" ON public.user_organizations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.organization_id = user_organizations.organization_id
      AND p.user_role = 'organisation'
    )
  );

-- Alternative: Super admin access
CREATE POLICY "Super admins can manage all user organizations" ON public.user_organizations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.user_role = 'super_admin'
    )
  );

-- Add a comment explaining the fix
COMMENT ON TABLE public.user_organizations IS 'Junction table for user-organization relationships. RLS policies use profiles table to avoid infinite recursion.';