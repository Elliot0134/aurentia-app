-- QUICK FIX: Apply this SQL in Supabase SQL Editor
-- This will fix email confirmations not updating profiles

-- 1. Create the database trigger to auto-sync confirmations to profiles
CREATE OR REPLACE FUNCTION sync_email_confirmation_to_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Only proceed if status changed to 'confirmed'
    IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
        -- Update the profiles table
        UPDATE profiles
        SET 
            email_confirmed_at = NEW.confirmed_at,
            email_confirmation_required = false
        WHERE id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS trigger_sync_email_confirmation_to_profile ON email_confirmations;

CREATE TRIGGER trigger_sync_email_confirmation_to_profile
    AFTER UPDATE ON email_confirmations
    FOR EACH ROW
    EXECUTE FUNCTION sync_email_confirmation_to_profile();

-- 2. Fix all existing confirmed emails (BACKFILL)
UPDATE profiles p
SET 
    email_confirmed_at = ec.confirmed_at,
    email_confirmation_required = false
FROM email_confirmations ec
WHERE p.id = ec.user_id
    AND ec.status = 'confirmed'
    AND ec.confirmed_at IS NOT NULL
    AND p.email_confirmed_at IS NULL;

-- 3. Verify the fix worked
SELECT 
    'Fixed ' || COUNT(*) || ' users' as result
FROM profiles 
WHERE email_confirmed_at IS NOT NULL;

-- 4. Show remaining issues (should be 0)
SELECT 
    ec.email,
    ec.confirmed_at as confirmation_time,
    p.email_confirmed_at as profile_time,
    CASE 
        WHEN p.email_confirmed_at IS NULL THEN 'NOT SYNCED'
        ELSE 'OK'
    END as status
FROM email_confirmations ec
JOIN profiles p ON p.id = ec.user_id
WHERE ec.status = 'confirmed'
ORDER BY ec.confirmed_at DESC
LIMIT 10;
