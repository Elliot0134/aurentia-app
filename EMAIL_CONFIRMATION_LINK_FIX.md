# Email Confirmation Link Fix

## Problem Found
The email confirmation link was pointing to Supabase's built-in auth endpoint (`/auth/v1/verify`) instead of your custom `confirm-email` edge function. This caused the error:
```
error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired
```

## Root Cause
In `send-confirmation-email/index.ts` (line 392), the confirmation URL was:
```typescript
const confirmUrl = `${supabaseUrl}/auth/v1/verify?token=${token}&type=signup&redirect_to=${encodeURIComponent(redirectToUrl)}`;
```

This used Supabase's native auth system, but you have a custom email confirmation system with:
- Custom `email_confirmations` table
- Custom `confirm-email` edge function
- Custom token format (UUID instead of OTP)

## Fix Applied

### 1. Updated Email Link (send-confirmation-email/index.ts)
**Before:**
```typescript
const confirmUrl = `${supabaseUrl}/auth/v1/verify?token=${token}&type=signup&redirect_to=${encodeURIComponent(redirectToUrl)}`;
```

**After:**
```typescript
const confirmUrl = `${supabaseUrl}/functions/v1/confirm-email?token=${token}`;
```

### 2. Added Redirect to confirm-email Function
When users click the email link (GET request), they are now redirected to the login page with a success indicator:

```typescript
if (req.method === 'GET') {
  const siteUrl = Deno.env.get('SITE_URL') || 'http://localhost:8080';
  const redirectUrl = `${siteUrl}/login?confirmed=true`;
  
  return new Response(null, {
    status: 302,
    headers: {
      'Location': redirectUrl,
    }
  });
}
```

## How It Works Now

### Flow:
1. **User Signs Up** → Creates record in `email_confirmations` with UUID token
2. **Email Sent** → Contains link to `/functions/v1/confirm-email?token=<uuid>`
3. **User Clicks Link** → Edge function verifies token
4. **Confirmation** → Database trigger updates `profiles` table:
   - `email_confirmed_at` = NOW()
   - `email_confirmation_required` = false
5. **Redirect** → User redirected to `/login?confirmed=true`

### Database Trigger (Already Applied)
The trigger `sync_email_confirmation_to_profile()` automatically updates the `profiles` table when `email_confirmations.status` changes to `'confirmed'`.

## Deployment Steps

### 1. Deploy Updated Edge Functions
```bash
# Deploy send-confirmation-email
npx supabase functions deploy send-confirmation-email

# Deploy confirm-email
npx supabase functions deploy confirm-email
```

### 2. Verify Environment Variables
Make sure these are set in your Supabase project:
- `RESEND_API_KEY` - Your Resend API key
- `SENDER_EMAIL` - Your sender email address
- `SITE_URL` - Your app URL (e.g., `http://localhost:8080` or `https://app.aurentia.fr`)
- `SUPABASE_URL` - Auto-set by Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Auto-set by Supabase

### 3. Test the Flow
1. Sign up a new user
2. Check email for confirmation link
3. Click the link
4. Verify you're redirected to `/login?confirmed=true`
5. Check database:
   ```sql
   SELECT 
     ec.email,
     ec.status,
     ec.confirmed_at,
     p.email_confirmed_at,
     p.email_confirmation_required
   FROM email_confirmations ec
   JOIN profiles p ON p.id = ec.user_id
   WHERE ec.email = 'test@example.com';
   ```

## Frontend Integration (Optional)

Add a success message on the login page when `confirmed=true`:

```typescript
// In your Login component
const searchParams = new URLSearchParams(window.location.search);
const confirmed = searchParams.get('confirmed');

if (confirmed === 'true') {
  // Show success toast/message
  toast.success('Email confirmé ! Vous pouvez maintenant vous connecter.');
  
  // Clean up URL
  window.history.replaceState({}, '', '/login');
}
```

## Troubleshooting

### Issue: Token not found
- Check that `token_hash` is being saved correctly in `email_confirmations`
- Verify the token in the email matches what's in the database

### Issue: Still getting "expired" error
- Make sure you deployed the updated edge functions
- Clear your email cache and request a new confirmation email
- Check that `expires_at` is set to 24 hours from creation

### Issue: Redirect not working
- Verify `SITE_URL` environment variable is set correctly
- Check browser console for any errors
- Make sure CORS is configured properly

## Files Modified
- ✅ `/supabase/functions/send-confirmation-email/index.ts` - Fixed confirmation URL
- ✅ `/supabase/functions/confirm-email/index.ts` - Added redirect logic
- ✅ `/db_migrations/20251007_fix_email_confirmation_updates.sql` - Database trigger (already applied)
- ✅ `/QUICK_EMAIL_FIX.sql` - Quick fix (already applied)

## Next Steps
1. Deploy the edge functions (see commands above)
2. Test with a new signup
3. Verify database updates are working
4. Add frontend success message (optional)
5. Monitor logs for any issues
