-- Comprehensive Organization Setup Diagnostic Query
-- Replace 'YOUR_EMAIL_HERE' with your actual email address

-- ================================
-- 1. USER PROFILE CHECK
-- ================================
SELECT 
  'USER PROFILE' as check_type,
  p.id as user_id,
  p.email,
  p.user_role,
  p.organization_setup_pending,
  p.email_confirmed_at,
  p.created_at,
  CASE 
    WHEN p.user_role != 'organisation' AND p.user_role != 'staff' THEN '❌ User role is not organisation/staff'
    WHEN p.organization_setup_pending = true THEN '⚠️ organization_setup_pending is TRUE - will redirect to setup'
    ELSE '✅ Profile looks good'
  END as diagnosis
FROM profiles p
WHERE p.email = 'YOUR_EMAIL_HERE';

-- ================================
-- 2. USER_ORGANIZATIONS CHECK (CRITICAL!)
-- ================================
SELECT 
  'USER_ORGANIZATIONS' as check_type,
  uo.id,
  uo.user_id,
  uo.organization_id,
  uo.user_role,
  uo.status,
  uo.is_primary,
  uo.created_at,
  CASE 
    WHEN uo.organization_id IS NULL THEN '❌ NO entry in user_organizations - THIS IS THE PROBLEM!'
    WHEN uo.status != 'active' THEN '❌ Status is not active: ' || uo.status
    ELSE '✅ user_organizations entry exists and is active'
  END as diagnosis
FROM profiles p
LEFT JOIN user_organizations uo ON p.id = uo.user_id
WHERE p.email = 'YOUR_EMAIL_HERE';

-- ================================
-- 3. ORGANIZATIONS CHECK
-- ================================
SELECT 
  'ORGANIZATIONS' as check_type,
  o.id as org_id,
  o.name,
  o.type,
  o.onboarding_completed,
  o.onboarding_step,
  o.owner_id,
  o.created_by,
  o.created_at,
  CASE 
    WHEN o.id IS NULL THEN '❌ NO organization found'
    WHEN o.onboarding_completed = false THEN '⚠️ onboarding_completed is FALSE'
    WHEN o.onboarding_step < 6 THEN '⚠️ onboarding_step is ' || o.onboarding_step || ' (should be 6)'
    ELSE '✅ Organization setup complete'
  END as diagnosis
FROM profiles p
LEFT JOIN user_organizations uo ON p.id = uo.user_id AND uo.status = 'active'
LEFT JOIN organizations o ON uo.organization_id = o.id
WHERE p.email = 'YOUR_EMAIL_HERE';

-- ================================
-- 4. COMBINED DIAGNOSIS
-- ================================
SELECT 
  'COMBINED DIAGNOSIS' as check_type,
  p.email,
  p.user_role as profile_role,
  p.organization_setup_pending,
  uo.organization_id,
  uo.user_role as user_org_role,
  uo.status as user_org_status,
  o.name as org_name,
  o.onboarding_completed,
  o.onboarding_step,
  CASE 
    -- Check in order of redirect priority (matches code logic)
    WHEN p.organization_setup_pending = true AND uo.organization_id IS NULL THEN 
      '🔴 REDIRECT TO /setup-organization: organization_setup_pending=true AND no user_organizations entry'
    WHEN p.organization_setup_pending = true AND uo.organization_id IS NOT NULL THEN 
      '⚠️ ISSUE: organization_setup_pending=true but organization exists - should be false'
    WHEN uo.organization_id IS NULL THEN 
      '🔴 REDIRECT TO /setup-organization: No user_organizations entry'
    WHEN uo.status != 'active' THEN 
      '🔴 REDIRECT TO /setup-organization: user_organizations status is not active'
    WHEN o.onboarding_completed = false THEN 
      '⚠️ Organization exists but onboarding_completed=false (not blocking in new code)'
    WHEN uo.organization_id IS NOT NULL AND uo.status = 'active' THEN 
      '✅ SHOULD GO TO /organisation/' || uo.organization_id || '/dashboard'
    ELSE '❓ Unknown state'
  END as diagnosis,
  CASE
    WHEN p.organization_setup_pending = true AND uo.organization_id IS NOT NULL THEN
      'UPDATE profiles SET organization_setup_pending = false WHERE id = ''' || p.id || ''';'
    WHEN uo.organization_id IS NULL AND o.id IS NOT NULL THEN
      'INSERT INTO user_organizations (user_id, organization_id, user_role, status, is_primary) VALUES (''' || 
      p.id || ''', ''' || o.id || ''', ''organisation'', ''active'', true);'
    WHEN uo.status != 'active' THEN
      'UPDATE user_organizations SET status = ''active'' WHERE id = ''' || uo.id || ''';'
    ELSE NULL
  END as suggested_fix
FROM profiles p
LEFT JOIN user_organizations uo ON p.id = uo.user_id
LEFT JOIN organizations o ON o.created_by = p.id OR uo.organization_id = o.id
WHERE p.email = 'YOUR_EMAIL_HERE';

-- ================================
-- 5. CHECK FOR MULTIPLE ORGANIZATIONS
-- ================================
SELECT 
  'MULTIPLE ORGS CHECK' as check_type,
  COUNT(DISTINCT o.id) as org_count,
  STRING_AGG(DISTINCT o.name, ', ') as org_names,
  CASE 
    WHEN COUNT(DISTINCT o.id) > 1 THEN '⚠️ Multiple organizations found - may cause confusion'
    WHEN COUNT(DISTINCT o.id) = 1 THEN '✅ Single organization'
    ELSE '❌ No organizations'
  END as diagnosis
FROM profiles p
LEFT JOIN organizations o ON o.created_by = p.id
WHERE p.email = 'YOUR_EMAIL_HERE';

-- ================================
-- 6. ALL ORGANIZATIONS FOR THIS USER (any relationship)
-- ================================
SELECT 
  'ALL USER ORGS' as check_type,
  o.id,
  o.name,
  o.created_by,
  uo.user_id as linked_via_user_org,
  uo.status as user_org_status,
  o.onboarding_completed,
  o.onboarding_step
FROM profiles p
LEFT JOIN organizations o ON o.created_by = p.id
LEFT JOIN user_organizations uo ON uo.organization_id = o.id AND uo.user_id = p.id
WHERE p.email = 'YOUR_EMAIL_HERE';
