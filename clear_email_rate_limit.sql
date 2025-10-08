-- Clear Email Confirmation Rate Limits
-- Use this script when you've hit the rate limit during testing

-- 1. View current email confirmations (to see what's there)
SELECT 
  id,
  email,
  user_id,
  status,
  attempts,
  max_attempts,
  created_at,
  last_sent_at,
  expires_at,
  CASE 
    WHEN expires_at < NOW() THEN 'EXPIRED'
    WHEN attempts >= max_attempts THEN 'RATE LIMITED'
    ELSE 'ACTIVE'
  END as rate_limit_status,
  EXTRACT(EPOCH FROM (NOW() - last_sent_at))/60 as minutes_since_last_send
FROM email_confirmations
ORDER BY created_at DESC
LIMIT 20;

-- 2. Clear email confirmations for a specific email (RECOMMENDED)
-- Replace 'your-email@example.com' with your test email
DELETE FROM email_confirmations 
WHERE email = 'bousquet.matthieu0@gmail.com';

-- 3. Clear ALL pending email confirmations (USE WITH CAUTION)
-- Uncomment the line below if you want to clear all pending confirmations
-- DELETE FROM email_confirmations WHERE status = 'pending';

-- 4. Clear expired email confirmations (SAFE - good for cleanup)
DELETE FROM email_confirmations 
WHERE expires_at < NOW() 
  AND status = 'pending';

-- 5. Reset attempts counter for a specific email (instead of deleting)
-- This allows you to keep the record but reset the rate limit
-- UPDATE email_confirmations 
-- SET attempts = 0, 
--     last_sent_at = NOW() - INTERVAL '2 hours'
-- WHERE email = 'your-email@example.com';

-- 6. View email confirmation logs for debugging
SELECT 
  id,
  user_id,
  email,
  action,
  ip_address,
  user_agent,
  created_at,
  metadata
FROM email_confirmation_logs
ORDER BY created_at DESC
LIMIT 20;

-- 7. Check if there are any stuck users waiting for confirmation
SELECT 
  p.id,
  p.email,
  p.first_name,
  p.last_name,
  p.email_confirmation_required,
  p.email_confirmed_at,
  p.created_at,
  ec.status as confirmation_status,
  ec.attempts,
  ec.last_sent_at
FROM profiles p
LEFT JOIN email_confirmations ec ON p.id = ec.user_id
WHERE p.email_confirmation_required = true
  AND p.email_confirmed_at IS NULL
ORDER BY p.created_at DESC
LIMIT 20;
