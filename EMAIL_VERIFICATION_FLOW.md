# Email Verification Flow - Complete Implementation

## 🎯 Overview

Users who sign up must verify their email before accessing the application. Unverified users are automatically redirected to `/verify-email` where they must confirm their email to proceed.

## 🔄 Flow Diagram

```
┌─────────────┐
│   Signup    │
└──────┬──────┘
       │
       ▼
┌─────────────────────────┐
│ Email sent with         │
│ confirmation link       │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ User clicks link        │
│ in email                │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│ Edge function validates token   │
│ and updates:                    │
│ - email_confirmations.status    │
│ - profiles.email_confirmed_at   │
│ - profiles.email_confirmation_  │
│   required = false              │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────┐
│ Redirect to             │
│ /verify-email           │
│ ?confirmed=true         │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ VerifyEmail page checks │
│ confirmation status     │
└──────┬──────────────────┘
       │
       ├─ Not Confirmed ──►┌───────────────────┐
       │                   │ Show verify page  │
       │                   │ with resend button│
       │                   └───────────────────┘
       │
       └─ Confirmed ──────►┌───────────────────┐
                           │ Redirect to       │
                           │ /individual/      │
                           │ dashboard         │
                           └───────────────────┘
```

## 🔐 Access Control

### Protected Route Guard

The `ProtectedRoute` component in `App.tsx` checks:

1. **Authentication**: Is user logged in?
   - ❌ No → Redirect to `/login`
   - ✅ Yes → Continue

2. **Email Verification**: Is email confirmed?
   - Check `profiles.email_confirmation_required` AND `profiles.email_confirmed_at`
   - ❌ Not confirmed → Redirect to `/verify-email`
   - ✅ Confirmed → Allow access

### Database Fields (profiles table)

```sql
email_confirmation_required BOOLEAN DEFAULT true
email_confirmed_at TIMESTAMP WITH TIME ZONE
```

**User needs verification if:**
```typescript
email_confirmation_required === true && email_confirmed_at === null
```

## 📁 Files Modified

### 1. `/src/pages/VerifyEmail.tsx` ✨ NEW
- Dedicated page for email verification
- Shows verification status
- Resend email functionality
- Auto-redirects when confirmed
- Sign out option

### 2. `/src/App.tsx` ✏️ UPDATED
- Added `/verify-email` route
- Updated `ProtectedRoute` to check email verification
- Redirects unverified users to `/verify-email`

### 3. `/src/services/emailConfirmationService.ts` ✏️ UPDATED
- `needsEmailConfirmation()` now checks `profiles` table
- Uses `email_confirmation_required` and `email_confirmed_at` as source of truth
- Falls back to `email_confirmations` table if needed

### 4. `/supabase/functions/confirm-email/index.ts` ✏️ UPDATED
- Redirects to `/verify-email?confirmed=true` instead of `/login`
- Database trigger updates `profiles` automatically

### 5. `/supabase/functions/send-confirmation-email/index.ts` ✏️ UPDATED
- Confirmation link points to custom edge function
- Fixed URL: `/functions/v1/confirm-email?token=<uuid>`

## 🛠️ How It Works

### 1. User Signs Up
```typescript
// Signup creates user and profile
// profiles.email_confirmation_required = true (default)
// profiles.email_confirmed_at = null
```

### 2. Email is Sent
```typescript
// send-confirmation-email edge function
// Creates record in email_confirmations table
// Sends email with link: /functions/v1/confirm-email?token=<uuid>
```

### 3. User Clicks Email Link
```typescript
// GET /functions/v1/confirm-email?token=<uuid>
// Edge function validates token
// Updates email_confirmations.status = 'confirmed'
// Database trigger updates profiles:
//   - email_confirmed_at = NOW()
//   - email_confirmation_required = false
// Redirects to /verify-email?confirmed=true
```

### 4. Verification Page
```typescript
// /verify-email checks status
if (email_confirmed_at !== null) {
  // Show success + redirect to dashboard
} else {
  // Show "please verify" message + resend button
}
```

### 5. Protected Routes
```typescript
// Every protected route checks:
if (email_confirmation_required && !email_confirmed_at) {
  // Redirect to /verify-email
}
```

## 🧪 Testing

### Test the Flow

1. **Sign up a new user**
   ```
   Email: test@example.com
   Password: TestPassword123
   ```

2. **Check database**
   ```sql
   SELECT 
     email,
     email_confirmation_required,
     email_confirmed_at
   FROM profiles
   WHERE email = 'test@example.com';
   ```
   
   Expected:
   ```
   email_confirmation_required = true
   email_confirmed_at = null
   ```

3. **Try to access dashboard**
   - Should redirect to `/verify-email`

4. **Check email for confirmation link**
   - Click the link

5. **Verify redirect**
   - Should redirect to `/verify-email?confirmed=true`

6. **Check database again**
   ```sql
   SELECT 
     email,
     email_confirmation_required,
     email_confirmed_at
   FROM profiles
   WHERE email = 'test@example.com';
   ```
   
   Expected:
   ```
   email_confirmation_required = false
   email_confirmed_at = <timestamp>
   ```

7. **Access dashboard**
   - Should now be able to access all protected routes

### Debug SQL Queries

```sql
-- Check all unverified users
SELECT 
  p.id,
  p.email,
  p.email_confirmation_required,
  p.email_confirmed_at,
  ec.status as confirmation_status,
  ec.expires_at
FROM profiles p
LEFT JOIN email_confirmations ec ON ec.user_id = p.id
WHERE p.email_confirmation_required = true
  AND p.email_confirmed_at IS NULL;

-- Check email confirmations
SELECT 
  ec.email,
  ec.status,
  ec.created_at,
  ec.confirmed_at,
  ec.expires_at,
  p.email_confirmed_at as profile_confirmed_at
FROM email_confirmations ec
JOIN profiles p ON p.id = ec.user_id
ORDER BY ec.created_at DESC
LIMIT 10;

-- Manually confirm a user (for testing)
UPDATE profiles
SET 
  email_confirmed_at = NOW(),
  email_confirmation_required = false
WHERE email = 'test@example.com';
```

## 🚀 Deployment Steps

### 1. Deploy Edge Functions
```bash
cd /home/matthieu/Desktop/Projects/aurentia-app

# Deploy updated functions
npx supabase functions deploy send-confirmation-email
npx supabase functions deploy confirm-email
```

### 2. Apply Database Migration (if not done)
```sql
-- Run QUICK_EMAIL_FIX.sql in Supabase SQL Editor
-- This creates the trigger that auto-updates profiles
```

### 3. Test the Flow
1. Sign up new user
2. Check email
3. Click confirmation link
4. Verify redirect to `/verify-email?confirmed=true`
5. Verify auto-redirect to dashboard

## 🔧 Configuration

### Environment Variables (Supabase)
- `SITE_URL` - Your app URL (e.g., `http://localhost:8080` or `https://app.aurentia.fr`)
- `RESEND_API_KEY` - Resend API key for sending emails
- `SENDER_EMAIL` - Sender email address

### Frontend Routes
- `/login` - Public, login page
- `/signup` - Public, signup page
- `/verify-email` - Semi-public, requires auth but not email verification
- `/individual/*` - Protected, requires auth + email verification
- `/organisation/*` - Protected, requires auth + email verification

## 🐛 Troubleshooting

### Issue: Users stuck on verify-email page
**Check:**
1. Is the database trigger working?
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'trigger_sync_email_confirmation_to_profile';
   ```

2. Are edge functions deployed?
   ```bash
   npx supabase functions list
   ```

3. Is `SITE_URL` set correctly?
   ```bash
   npx supabase secrets list
   ```

### Issue: Email not updating after confirmation
**Solution:**
```sql
-- Check if trigger exists
SELECT * FROM pg_trigger 
WHERE tgname = 'trigger_sync_email_confirmation_to_profile';

-- Manually fix if needed
UPDATE profiles p
SET 
  email_confirmed_at = ec.confirmed_at,
  email_confirmation_required = false
FROM email_confirmations ec
WHERE p.id = ec.user_id
  AND ec.status = 'confirmed'
  AND p.email_confirmed_at IS NULL;
```

### Issue: Redirect loop
**Check:**
1. Verify `ProtectedRoute` logic doesn't redirect from `/verify-email`
2. Check browser console for errors
3. Verify `needsEmailConfirmation` returns correct value

## 📝 Next Steps (Optional)

### 1. Add Email Verification Banner (Future)
For non-blocking mode, show a banner instead of blocking:
```tsx
<EmailConfirmationGuard user={user} fallbackMode="banner">
  {/* App content */}
</EmailConfirmationGuard>
```

### 2. Add Admin Override
Allow admins to manually verify users:
```sql
CREATE FUNCTION admin_verify_user(p_user_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET 
    email_confirmed_at = NOW(),
    email_confirmation_required = false
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 3. Add Email Change Flow
Handle email changes with re-verification:
```typescript
// When user changes email:
// 1. Set email_confirmation_required = true
// 2. Set email_confirmed_at = null
// 3. Send new confirmation email
// 4. Block access until confirmed
```

## ✅ Checklist

- [x] Created `/verify-email` page
- [x] Updated `ProtectedRoute` to check email verification
- [x] Updated `needsEmailConfirmation` to use `profiles` table
- [x] Fixed email confirmation link URL
- [x] Added redirect after confirmation
- [x] Added database trigger for auto-sync
- [x] Created documentation
- [ ] Deploy edge functions
- [ ] Test complete flow
- [ ] Monitor logs for issues

## 📚 Related Files

- `/EMAIL_CONFIRMATION_LINK_FIX.md` - Previous fix for link issues
- `/QUICK_EMAIL_FIX.sql` - Quick SQL fix for database
- `/db_migrations/20251007_fix_email_confirmation_updates.sql` - Full migration
- `/EMAIL_CONFIRMATION_FIX.md` - Original fix documentation
