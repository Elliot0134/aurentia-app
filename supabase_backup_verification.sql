SELECT 
  'profiles' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN credits_restants IS NOT NULL THEN 1 END) as records_with_credits,
  COUNT(CASE WHEN credits_restants ~ '^[0-9]+$' THEN 1 END) as valid_credit_format
FROM public.profiles
UNION ALL
SELECT 
  'project_summary' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN statut_project IS NOT NULL THEN 1 END) as records_with_status,
  COUNT(CASE WHEN statut_project IN ('pay_1_waiting', 'pay_2_waiting', 'plan1', 'plan2') THEN 1 END) as old_payment_statuses
FROM public.project_summary;

SELECT 
  'PROBLEMATIC_PROFILES' as issue_type,
  id, 
  email, 
  credits_restants, 
  credit_limit 
FROM public.profiles 
WHERE credits_restants IS NOT NULL 
  AND (credits_restants !~ '^[0-9]+$' OR credit_limit !~ '^[0-9]+$')
LIMIT 10;

SELECT 
  'CREDIT_STATS' as info_type,
  AVG(CAST(COALESCE(NULLIF(credits_restants, ''), '0') AS INTEGER)) as avg_credits,
  MAX(CAST(COALESCE(NULLIF(credits_restants, ''), '0') AS INTEGER)) as max_credits,
  MIN(CAST(COALESCE(NULLIF(credits_restants, ''), '0') AS INTEGER)) as min_credits,
  SUM(CAST(COALESCE(NULLIF(credits_restants, ''), '0') AS INTEGER)) as total_credits
FROM public.profiles 
WHERE credits_restants ~ '^[0-9]+$';