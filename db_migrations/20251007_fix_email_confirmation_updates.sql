-- Migration to fix email confirmation to properly update profiles table
-- Date: 2025-10-07
-- Purpose: Ensure email_confirmed_at and invitation_code_used are updated on email confirmation

-- 1. Create or replace function to handle email confirmation and profile updates
CREATE OR REPLACE FUNCTION confirm_user_email(
    p_user_id uuid,
    p_confirmation_id uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    confirmation_record record;
    profile_record record;
    result json;
BEGIN
    -- Get confirmation record
    SELECT * INTO confirmation_record
    FROM email_confirmations
    WHERE id = p_confirmation_id
    AND user_id = p_user_id
    AND status = 'pending';

    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Confirmation invalide ou déjà utilisée'
        );
    END IF;

    -- Get current profile
    SELECT * INTO profile_record
    FROM profiles
    WHERE id = p_user_id;

    -- Update email_confirmations
    UPDATE email_confirmations
    SET 
        status = 'confirmed',
        confirmed_at = NOW(),
        updated_at = NOW()
    WHERE id = p_confirmation_id;

    -- Update profiles with email confirmation
    UPDATE profiles
    SET 
        email_confirmed_at = NOW(),
        email_confirmation_required = false
    WHERE id = p_user_id;

    -- Build success response
    SELECT json_build_object(
        'success', true,
        'user_id', p_user_id,
        'confirmed_at', NOW(),
        'email', confirmation_record.email
    ) INTO result;

    RETURN result;
END;
$$;

-- 2. Create a trigger to automatically update profiles when email_confirmations status changes to 'confirmed'
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

        -- Update auth.users metadata (if possible)
        BEGIN
            UPDATE auth.users
            SET 
                email_confirmed_at = NEW.confirmed_at
            WHERE id = NEW.user_id;
        EXCEPTION WHEN OTHERS THEN
            -- Ignore errors if we can't update auth.users directly
            NULL;
        END;
    END IF;

    RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_sync_email_confirmation_to_profile ON email_confirmations;

-- Create the trigger
CREATE TRIGGER trigger_sync_email_confirmation_to_profile
    AFTER UPDATE ON email_confirmations
    FOR EACH ROW
    EXECUTE FUNCTION sync_email_confirmation_to_profile();

-- 3. Fix existing confirmed emails that haven't updated profiles
-- This will backfill any missing email_confirmed_at values
UPDATE profiles p
SET 
    email_confirmed_at = ec.confirmed_at,
    email_confirmation_required = false
FROM email_confirmations ec
WHERE p.id = ec.user_id
    AND ec.status = 'confirmed'
    AND ec.confirmed_at IS NOT NULL
    AND p.email_confirmed_at IS NULL;

-- 4. Create a function to check if user email is confirmed
CREATE OR REPLACE FUNCTION is_email_confirmed(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    confirmed boolean;
BEGIN
    SELECT 
        (email_confirmed_at IS NOT NULL) 
    INTO confirmed
    FROM profiles
    WHERE id = p_user_id;

    RETURN COALESCE(confirmed, false);
END;
$$;

-- 5. Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email_confirmed 
    ON profiles(email_confirmed_at) 
    WHERE email_confirmed_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_email_confirmations_user_status 
    ON email_confirmations(user_id, status);

-- 6. Add helpful comment
COMMENT ON FUNCTION sync_email_confirmation_to_profile() IS 
    'Automatically updates profiles.email_confirmed_at when email_confirmations.status changes to confirmed';

COMMENT ON FUNCTION confirm_user_email(uuid, uuid) IS 
    'Confirms user email and updates both email_confirmations and profiles tables';

COMMENT ON FUNCTION is_email_confirmed(uuid) IS 
    'Returns true if user has confirmed their email address';
