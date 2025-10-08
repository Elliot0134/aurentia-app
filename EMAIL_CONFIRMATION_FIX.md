# Email Confirmation Fix - Complete Guide

## Problem
Users who sign up and confirm their email are not having their `email_confirmed_at` field updated in the `profiles` table, preventing them from accessing the application.

## Solution Overview
This fix ensures that when a user confirms their email:
1. ✅ `email_confirmations.status` → `'confirmed'`
2. ✅ `profiles.email_confirmed_at` → `NOW()`
3. ✅ `profiles.email_confirmation_required` → `false`
4. ✅ Automatic sync via database trigger

## Files Modified

### 1. Database Migration
**File:** `/db_migrations/20251007_fix_email_confirmation_updates.sql`

This migration adds:
- `confirm_user_email()` - Function to confirm email and update profile atomically
- `sync_email_confirmation_to_profile()` - Trigger function to auto-sync confirmations to profiles
- Trigger on `email_confirmations` table to auto-update profiles
- Backfill query to fix existing confirmed users
- Helper function `is_email_confirmed()` to check confirmation status

### 2. Edge Function Update
**File:** `/supabase/functions/confirm-email/index.ts`

Updated to use the new `confirm_user_email()` database function for atomic updates.

## How to Apply

### Step 1: Run the Migration
```bash
# Option A: Using Supabase CLI
supabase db push

# Option B: Run SQL directly in Supabase Dashboard
# Copy the content of db_migrations/20251007_fix_email_confirmation_updates.sql
# Paste and run in SQL Editor
```

### Step 2: Deploy the Edge Function
```bash
# Deploy the updated confirm-email function
supabase functions deploy confirm-email
```

### Step 3: Verify the Fix

#### Check Database Functions
```sql
-- Verify functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name IN (
    'confirm_user_email', 
    'sync_email_confirmation_to_profile',
    'is_email_confirmed'
);

-- Verify trigger exists
SELECT trigger_name 
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_sync_email_confirmation_to_profile';
```

#### Test Email Confirmation Flow
1. Create a test user
2. Get the confirmation token from `email_confirmations` table
3. Call the confirm-email edge function
4. Verify `profiles.email_confirmed_at` is updated

```sql
-- Check if a user's email is confirmed
SELECT 
    p.id,
    p.email,
    p.email_confirmed_at,
    p.email_confirmation_required,
    ec.status as confirmation_status,
    ec.confirmed_at
FROM profiles p
LEFT JOIN email_confirmations ec ON ec.user_id = p.id
WHERE p.email = 'test@example.com';
```

### Step 4: Fix Existing Users (Backfill)

The migration automatically backfills existing confirmed users. To manually verify:

```sql
-- Count users who are confirmed but missing email_confirmed_at
SELECT COUNT(*) 
FROM profiles p
JOIN email_confirmations ec ON ec.user_id = p.id
WHERE ec.status = 'confirmed' 
    AND ec.confirmed_at IS NOT NULL
    AND p.email_confirmed_at IS NULL;

-- Manual backfill (if needed)
UPDATE profiles p
SET 
    email_confirmed_at = ec.confirmed_at,
    email_confirmation_required = false,
    updated_at = NOW()
FROM email_confirmations ec
WHERE p.id = ec.user_id
    AND ec.status = 'confirmed'
    AND ec.confirmed_at IS NOT NULL
    AND p.email_confirmed_at IS NULL;
```

## Blocking Unconfirmed Users

### Option 1: Row-Level Security (RLS) Policy
Add this policy to block unconfirmed users from accessing their data:

```sql
-- Block unconfirmed users from accessing profiles
CREATE POLICY "Only confirmed users can read profiles"
    ON profiles
    FOR SELECT
    USING (
        email_confirmed_at IS NOT NULL 
        OR email_confirmation_required = false
    );
```

### Option 2: Frontend Guard
Use the `EmailConfirmationGuard` component (already in your codebase):

```tsx
import { EmailConfirmationGuard } from '@/components/auth/EmailConfirmationGuard';

// In your protected routes
<EmailConfirmationGuard user={user}>
  <YourProtectedComponent />
</EmailConfirmationGuard>
```

### Option 3: Backend Check
In your edge functions or API routes:

```typescript
// Check if user is confirmed
const { data: isConfirmed } = await supabase
  .rpc('is_email_confirmed', { p_user_id: userId });

if (!isConfirmed) {
  return new Response(
    JSON.stringify({ error: 'Email not confirmed' }), 
    { status: 403 }
  );
}
```

## Testing Checklist

- [ ] Migration runs successfully
- [ ] Edge function deploys without errors
- [ ] New signups receive confirmation email
- [ ] Clicking confirmation link updates `email_confirmed_at`
- [ ] Trigger automatically syncs confirmations
- [ ] Existing confirmed users are backfilled
- [ ] Unconfirmed users cannot access app
- [ ] Confirmed users can access app normally

## Monitoring

### Check Confirmation Status
```sql
-- Overview of email confirmations
SELECT 
    status,
    COUNT(*) as count,
    COUNT(*) * 100.0 / SUM(COUNT(*)) OVER () as percentage
FROM email_confirmations
GROUP BY status;
```

### Find Stuck Confirmations
```sql
-- Users with pending confirmations older than 24 hours
SELECT 
    ec.email,
    ec.created_at,
    ec.expires_at,
    ec.attempts,
    EXTRACT(EPOCH FROM (NOW() - ec.created_at))/3600 as hours_old
FROM email_confirmations ec
WHERE ec.status = 'pending'
    AND ec.created_at < NOW() - INTERVAL '24 hours';
```

### Check Sync Issues
```sql
-- Confirmed emails without profile update (should be 0)
SELECT 
    ec.email,
    ec.confirmed_at,
    p.email_confirmed_at
FROM email_confirmations ec
JOIN profiles p ON p.id = ec.user_id
WHERE ec.status = 'confirmed'
    AND ec.confirmed_at IS NOT NULL
    AND p.email_confirmed_at IS NULL;
```

## Troubleshooting

### Issue: Profile not updating after confirmation
**Solution:** Check trigger is active
```sql
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'trigger_sync_email_confirmation_to_profile';
```

### Issue: Old confirmed users still can't log in
**Solution:** Run the backfill query manually (see Step 4)

### Issue: RLS blocking confirmed users
**Solution:** Check your RLS policies
```sql
-- List all policies on profiles table
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

## Rollback (if needed)

If something goes wrong, you can rollback:

```sql
-- Remove trigger
DROP TRIGGER IF EXISTS trigger_sync_email_confirmation_to_profile ON email_confirmations;

-- Remove functions
DROP FUNCTION IF EXISTS sync_email_confirmation_to_profile();
DROP FUNCTION IF EXISTS confirm_user_email(uuid, uuid);
DROP FUNCTION IF EXISTS is_email_confirmed(uuid);

-- Revert edge function
git checkout HEAD~1 supabase/functions/confirm-email/index.ts
supabase functions deploy confirm-email
```

## Next Steps

After applying this fix:

1. **Monitor for 24-48 hours** - Check that new signups work correctly
2. **Clean up expired confirmations** - Run the cleanup function periodically
3. **Consider automatic cleanup** - Set up a cron job to clean old confirmations

```sql
-- Clean up expired confirmations (run weekly)
DELETE FROM email_confirmations 
WHERE status = 'expired' 
    AND updated_at < NOW() - INTERVAL '30 days';
```

## Support

If you encounter issues:
1. Check the logs in Supabase Dashboard → Edge Functions → Logs
2. Verify migration ran successfully in SQL Editor
3. Test with a fresh user signup
4. Check email delivery in your email service (Resend) dashboard
