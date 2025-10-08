-- Debug query to check your organization state
-- Run this in Supabase SQL Editor and share the results

-- 1. Check your profile
SELECT 
  id,
  email,
  user_role,
  organization_setup_pending,
  first_name,
  last_name
FROM profiles 
WHERE email = 'YOUR_EMAIL_HERE'; -- Replace with your actual email

-- 2. Check organizations you created
SELECT 
  o.id,
  o.name,
  o.type,
  o.onboarding_completed,
  o.onboarding_step,
  o.created_by,
  o.created_at
FROM organizations o
WHERE o.created_by = (SELECT id FROM profiles WHERE email = 'YOUR_EMAIL_HERE'); -- Replace with your email

-- 3. Check user_organizations entries (THIS IS THE KEY TABLE!)
SELECT 
  uo.id,
  uo.user_id,
  uo.organization_id,
  uo.user_role,
  uo.status,
  uo.is_primary,
  o.name as organization_name,
  o.onboarding_completed
FROM user_organizations uo
JOIN organizations o ON uo.organization_id = o.id
WHERE uo.user_id = (SELECT id FROM profiles WHERE email = 'YOUR_EMAIL_HERE'); -- Replace with your email

-- 4. Combined diagnostic - what should work
SELECT 
  p.email,
  p.user_role as profile_role,
  p.organization_setup_pending,
  uo.organization_id,
  uo.user_role as user_org_role,
  uo.status as user_org_status,
  o.name as org_name,
  o.onboarding_completed,
  CASE 
    WHEN uo.organization_id IS NULL THEN '❌ NO user_organizations entry - THIS IS YOUR PROBLEM!'
    WHEN uo.status != 'active' THEN '❌ user_organizations status is not active'
    WHEN o.onboarding_completed IS FALSE THEN '⚠️ Onboarding not complete'
    ELSE '✅ Everything looks good'
  END as diagnosis
FROM profiles p
LEFT JOIN user_organizations uo ON p.id = uo.user_id AND uo.status = 'active'
LEFT JOIN organizations o ON uo.organization_id = o.id
WHERE p.email = 'YOUR_EMAIL_HERE'; -- Replace with your email
