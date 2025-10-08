# Signup Flow Fixes & Debugging Guide

## Issues Fixed

### 1. **Button Stuck on "Inscription..."**
- **Root Cause**: The `handleSubmit` function wasn't being called at all
- **Fix**: Added extensive console logging to trace the execution flow
- **Verification**: Check browser console for `🚀 [SIGNUP] Form submitted` log

### 2. **Modal Not Showing**
- **Root Cause**: `showEmailConfirmationModal` state remained `false`
- **Fix**: Ensured proper state updates and added logging at modal state changes
- **Verification**: Look for `🎭 [SIGNUP] Opening email confirmation modal` logs

### 3. **Toast Messages Not Showing**
- **Root Cause**: Errors were happening before toast calls or were being swallowed
- **Fix**: Added proper error handling with specific toast messages for different error scenarios
- **Verification**: Should see toasts for:
  - Password mismatch
  - Rate limit errors (with specific wait time)
  - Email send failures
  - Generic signup errors

### 4. **Emails Not Coming**
- **Root Cause**: Rate limiting (5 emails per hour per email address)
- **Fix**: Added `DISABLE_EMAIL_RATE_LIMIT` environment variable for testing
- **How to Disable**: See configuration section below

## Rate Limiting Configuration

### **Understanding Rate Limits**

The email confirmation system has built-in rate limiting to prevent abuse:
- **Max Attempts**: 5 emails per hour per email address
- **Window**: 60 minutes (1 hour)
- **Cooldown**: 60 seconds between resend attempts

### **Disabling Rate Limits for Testing**

#### Option 1: Environment Variable (Recommended for Testing)

Add this to your Supabase Edge Function secrets:

```bash
# In Supabase Dashboard:
# Project Settings > Edge Functions > Secrets

DISABLE_EMAIL_RATE_LIMIT=true
```

Or using Supabase CLI:

```bash
npx supabase secrets set DISABLE_EMAIL_RATE_LIMIT=true
```

#### Option 2: Clear Email Confirmations Table

If you've hit the rate limit, you can manually clear the entries:

```sql
-- Clear all email confirmations for a specific email
DELETE FROM email_confirmations 
WHERE email = 'your-test-email@example.com';

-- Or clear ALL email confirmations (use with caution!)
TRUNCATE TABLE email_confirmations;
```

#### Option 3: Increase Rate Limit

Edit `/supabase/functions/send-confirmation-email/index.ts`:

```typescript
// Change these values:
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // Change to: 5 * 60 * 1000 (5 minutes)
const MAX_ATTEMPTS_PER_WINDOW = 5; // Change to: 100 (or higher)
```

Then redeploy:

```bash
npx supabase functions deploy send-confirmation-email
```

## Debugging the Signup Flow

### Console Log Legend

The signup flow now uses emoji prefixes to make debugging easier:

- `🚀` - Process started
- `✅` - Success
- `❌` - Error/Failure
- `📧` / `📬` - Email related
- `🚪` - Auth/Session management
- `🎭` - UI/Modal state changes
- `🔍` - State monitoring
- `🏁` - Process completed

### Expected Log Sequence

A successful signup should show these logs in order:

```
🚀 [SIGNUP] Form submitted - starting signup process
✅ [SIGNUP] Starting user registration process...
📧 [SIGNUP] Sending confirmation email to: user@example.com
📬 [SIGNUP] Email confirmation result: {...}
✅ [SIGNUP] Confirmation email sent successfully
🚪 [SIGNUP] Signing out user to enforce email confirmation
🎭 [SIGNUP] Opening email confirmation modal for user: <uuid>
✅ [SIGNUP] Modal state updated - should be visible now
🏁 [SIGNUP] Signup process completed. Resetting loading state.
```

### Common Issues & Solutions

#### Issue: No logs appear after clicking "S'inscrire"
**Solution**: 
- Check if form validation is blocking submission
- Check browser console for JavaScript errors
- Verify the button is not disabled

#### Issue: Logs stop after "Starting user registration"
**Solution**:
- Check Supabase auth.signUp is working
- Verify email/password meet requirements
- Check if user already exists

#### Issue: "Rate limit" error appears
**Solution**:
- Wait 1 hour, OR
- Disable rate limiting (see above), OR
- Use a different email address, OR
- Clear email_confirmations table

#### Issue: Email sent but modal doesn't show
**Solution**:
- Check `🎭 [SIGNUP] Opening email confirmation modal` log
- Verify `showEmailConfirmationModal` state in logs
- Check for React re-rendering issues

## Testing Checklist

### Before Testing
- [ ] Clear browser cache and cookies
- [ ] Use incognito/private browsing mode
- [ ] Check Supabase Edge Functions are deployed
- [ ] Verify environment variables are set
- [ ] Confirm database RLS policies allow user creation

### Test Case 1: Fresh Signup
1. Fill out signup form with NEW email
2. Submit form
3. **Expected**: 
   - Loading spinner shows briefly
   - Toast: "Email de confirmation envoyé !"
   - Modal opens showing confirmation instructions
   - Email arrives in inbox

### Test Case 2: Rate Limited
1. Try to signup 6+ times with same email
2. **Expected**:
   - Toast: "Limite de tentatives atteinte"
   - Shows exact wait time in minutes

### Test Case 3: Existing User
1. Use email of existing confirmed user
2. **Expected**:
   - Toast: "Un compte avec cet email existe déjà"
   - Redirects to login

### Test Case 4: Password Mismatch
1. Enter different passwords
2. **Expected**:
   - Toast: "Les mots de passe ne correspondent pas"
   - Loading stops immediately

## Environment Variables Reference

Add these to your `.env` file or Supabase secrets:

```bash
# Required for email sending
RESEND_API_KEY=your_resend_api_key
SENDER_EMAIL=noreply@yourdomain.com

# Optional - disable rate limiting for testing
DISABLE_EMAIL_RATE_LIMIT=true

# Required for edge functions
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SITE_URL=http://localhost:5173  # Or your production URL
```

## Files Modified

1. **`/src/pages/Signup.tsx`**
   - Enhanced console logging
   - Better error handling
   - Improved toast messages
   - Rate limit error handling

2. **`/supabase/functions/send-confirmation-email/index.ts`**
   - Added `DISABLE_EMAIL_RATE_LIMIT` environment variable
   - Added detailed rate limit logging
   - Improved error responses

3. **`/src/components/auth/EmailConfirmationModal.tsx`**
   - Already has good error handling
   - Cooldown timer for resend

4. **`/src/services/emailConfirmationService.ts`**
   - Already has comprehensive error handling
   - Proper retry logic

## Production Considerations

⚠️ **Before deploying to production:**

1. **REMOVE** or set `DISABLE_EMAIL_RATE_LIMIT=false`
2. Keep rate limits enabled to prevent abuse
3. Monitor email sending costs (Resend pricing)
4. Set up proper email DNS records (SPF, DKIM, DMARC)
5. Consider implementing additional abuse prevention:
   - IP-based rate limiting
   - CAPTCHA for repeated attempts
   - Email domain validation

## Additional Resources

- [Resend API Docs](https://resend.com/docs)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Supabase Auth](https://supabase.com/docs/guides/auth)

---

## Quick Commands

```bash
# Check edge function logs
npx supabase functions logs send-confirmation-email

# Deploy edge function
npx supabase functions deploy send-confirmation-email

# Test edge function locally
npx supabase functions serve send-confirmation-email

# Check database for email confirmations
psql -h db.xxx.supabase.co -U postgres -d postgres -c "SELECT * FROM email_confirmations ORDER BY created_at DESC LIMIT 10;"
```
