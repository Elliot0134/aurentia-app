-- Quick Check: Is organization_setup_pending causing the redirect loop?
-- Replace YOUR_EMAIL with your actual email

SELECT 
  p.id,
  p.email,
  p.user_role,
  p.organization_setup_pending,
  uo.organization_id,
  uo.status,
  CASE 
    WHEN p.organization_setup_pending = true AND uo.organization_id IS NOT NULL THEN
      '🔴 PROBLEM FOUND! organization_setup_pending should be FALSE'
    WHEN p.organization_setup_pending = true THEN
      '⚠️ organization_setup_pending is true (will redirect to setup)'
    WHEN p.organization_setup_pending = false AND uo.organization_id IS NOT NULL THEN
      '✅ Everything looks good - no redirect should happen'
    ELSE
      '⚠️ Check other conditions'
  END as diagnosis,
  CASE 
    WHEN p.organization_setup_pending = true AND uo.organization_id IS NOT NULL THEN
      'UPDATE profiles SET organization_setup_pending = false WHERE id = ''' || p.id || ''';'
    ELSE
      'No fix needed for organization_setup_pending'
  END as fix_sql
FROM profiles p
LEFT JOIN user_organizations uo ON p.id = uo.user_id AND uo.status = 'active'
WHERE p.email = 'YOUR_EMAIL';
