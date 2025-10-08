-- Test script for organization RLS policies migration
-- Run this AFTER applying the main migration to verify everything works

-- =====================================================
-- TEST 1: Verify helper functions exist and work
-- =====================================================

DO $$
DECLARE
  test_org_id uuid;
  test_user_id uuid;
  result boolean;
BEGIN
  -- Get a test organization and user
  SELECT id INTO test_org_id FROM public.organizations LIMIT 1;
  SELECT user_id INTO test_user_id FROM public.user_organizations WHERE organization_id = test_org_id LIMIT 1;
  
  IF test_org_id IS NOT NULL AND test_user_id IS NOT NULL THEN
    -- Test is_organization_member function
    result := public.is_organization_member(test_org_id, test_user_id);
    RAISE NOTICE 'is_organization_member test: % (should be true)', result;
    
    -- Test is_organization_admin function
    result := public.is_organization_admin(test_org_id, test_user_id);
    RAISE NOTICE 'is_organization_admin test: % (depends on user role)', result;
  ELSE
    RAISE NOTICE 'No test data available - skipping function tests';
  END IF;
END $$;

-- =====================================================
-- TEST 2: Verify all policies exist
-- =====================================================

SELECT 
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('organizations', 'user_organizations')
ORDER BY tablename, policyname;

-- Expected policies for organizations:
-- - Authenticated users can create organizations (INSERT)
-- - Public organizations are viewable by everyone (SELECT)
-- - Organization members can view their organization (SELECT)
-- - Organization creators and staff can update their organization (UPDATE)
-- - Organization owners can delete their organization (DELETE)

-- Expected policies for user_organizations:
-- - Users can view their own organization memberships (SELECT)
-- - Users can view organization member list (SELECT)
-- - Users can insert their own organization membership (INSERT)
-- - Organization admins can insert memberships (INSERT)
-- - Users can update their own organization membership (UPDATE)
-- - Organization admins can update memberships (UPDATE)
-- - Users can delete their own organization membership (DELETE)
-- - Organization admins can delete memberships (DELETE)

-- =====================================================
-- TEST 3: Count policies
-- =====================================================

SELECT 
  tablename,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('organizations', 'user_organizations')
GROUP BY tablename;

-- Expected: organizations = 5 policies, user_organizations = 8 policies

-- =====================================================
-- TEST 4: Verify RLS is enabled
-- =====================================================

SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('organizations', 'user_organizations');

-- Both should show rowsecurity = true

RAISE NOTICE 'Test completed. Review the output above to verify all policies are in place.';
