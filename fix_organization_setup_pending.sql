-- ============================================================================
-- FIX: Organization Setup Pending Data Inconsistency
-- ============================================================================
-- This script fixes users who have an organization but still have 
-- organization_setup_pending = true, which causes infinite redirect loops
--
-- SAFE TO RUN: This only updates profiles where there's a clear inconsistency
-- ============================================================================

-- Step 1: Show current state BEFORE fix
SELECT 
  '=== BEFORE FIX ===' as section,
  p.email,
  p.user_role,
  p.organization_setup_pending as setup_pending,
  uo.organization_id,
  o.name as org_name,
  CASE 
    WHEN p.organization_setup_pending = true AND uo.organization_id IS NOT NULL THEN
      '🔴 NEEDS FIX: Has org but setup_pending=true'
    WHEN p.organization_setup_pending = false AND uo.organization_id IS NOT NULL THEN
      '✅ OK: Has org and setup_pending=false'
    WHEN p.organization_setup_pending = true AND uo.organization_id IS NULL THEN
      '✅ OK: No org and setup_pending=true'
    WHEN p.organization_setup_pending = false AND uo.organization_id IS NULL THEN
      '⚠️ UNUSUAL: No org but setup_pending=false'
    ELSE
      'Unknown state'
  END as status
FROM profiles p
LEFT JOIN user_organizations uo ON p.id = uo.user_id AND uo.status = 'active'
LEFT JOIN organizations o ON uo.organization_id = o.id
WHERE p.user_role IN ('organisation', 'staff')
ORDER BY p.created_at DESC;

-- Step 2: FIX - Update organization_setup_pending to false for users with organizations
UPDATE profiles p
SET organization_setup_pending = false
FROM user_organizations uo
WHERE p.id = uo.user_id
  AND uo.status = 'active'
  AND p.organization_setup_pending = true
  AND p.user_role IN ('organisation', 'staff');

-- Step 3: Show state AFTER fix
SELECT 
  '=== AFTER FIX ===' as section,
  p.email,
  p.user_role,
  p.organization_setup_pending as setup_pending,
  uo.organization_id,
  o.name as org_name,
  CASE 
    WHEN p.organization_setup_pending = true AND uo.organization_id IS NOT NULL THEN
      '🔴 STILL BROKEN: Has org but setup_pending=true'
    WHEN p.organization_setup_pending = false AND uo.organization_id IS NOT NULL THEN
      '✅ FIXED: Has org and setup_pending=false'
    WHEN p.organization_setup_pending = true AND uo.organization_id IS NULL THEN
      '✅ OK: No org and setup_pending=true'
    WHEN p.organization_setup_pending = false AND uo.organization_id IS NULL THEN
      '⚠️ Check manually: No org but setup_pending=false'
    ELSE
      'Unknown state'
  END as status
FROM profiles p
LEFT JOIN user_organizations uo ON p.id = uo.user_id AND uo.status = 'active'
LEFT JOIN organizations o ON uo.organization_id = o.id
WHERE p.user_role IN ('organisation', 'staff')
ORDER BY p.created_at DESC;

-- Step 4: Verification query - should return 0 rows
SELECT 
  '=== VERIFICATION: Should be EMPTY ===' as verification,
  COUNT(*) as broken_profiles_count
FROM profiles p
INNER JOIN user_organizations uo ON p.id = uo.user_id AND uo.status = 'active'
WHERE p.organization_setup_pending = true
  AND p.user_role IN ('organisation', 'staff');
  
-- If the count is 0, all issues are fixed!
