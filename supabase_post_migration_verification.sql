SELECT COUNT(*) as users_migrated FROM billing.user_credits;

SELECT type, COUNT(*) as count, SUM(amount) as total 
FROM billing.credit_transactions 
GROUP BY type;

SELECT * FROM billing.pricing_config ORDER BY category, key;

SELECT status, COUNT(*) FROM billing.subscriptions GROUP BY status;

SELECT 
  'billing.user_credits' as table_name,
  COUNT(*) as total_records,
  SUM(monthly_credits) as total_monthly_credits,
  SUM(purchased_credits) as total_purchased_credits,
  COUNT(CASE WHEN first_premium_used = false THEN 1 END) as users_with_free_premium_available
FROM billing.user_credits;

SELECT 
  'billing.credit_transactions' as table_name,
  COUNT(*) as total_transactions,
  COUNT(CASE WHEN type = 'subscription_monthly' THEN 1 END) as subscription_transactions,
  COUNT(CASE WHEN type = 'spend_premium' THEN 1 END) as spend_transactions
FROM billing.credit_transactions;

SELECT billing.get_user_balance(id) as user_balance 
FROM auth.users 
LIMIT 3;