# Signup Hanging - Debugging Guide

## Issue
The `supabase.auth.signUp()` call is hanging and not returning a response.

## Possible Causes

### 1. **Supabase Email Confirmation Settings**

Check your Supabase project settings:

1. Go to **Authentication > Settings** in Supabase Dashboard
2. Look for **"Enable email confirmations"**
3. **If enabled**, Supabase might be waiting for SMTP to send email before returning

**Solution**: Disable email confirmations in Supabase Auth settings (since we're using our custom system)

```
Authentication > Settings > Email Auth
☐ Enable email confirmations
```

### 2. **SMTP Configuration Not Set**

If email confirmations are enabled but SMTP is not configured, the signup will hang waiting for email to send.

**Solution**: Either:
- Disable email confirmations, OR
- Configure SMTP in Supabase Auth settings

### 3. **Database Triggers Taking Too Long**

Check if there are slow triggers on `auth.users` table.

**SQL to check triggers:**
```sql
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
  AND event_object_table = 'users';
```

### 4. **RLS Policies Blocking**

Row Level Security policies might be preventing user creation.

**SQL to check RLS on profiles:**
```sql
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

### 5. **Network/Firewall Issues**

Check browser network tab for stuck requests.

---

## Quick Fixes to Try

### Fix 1: Disable Supabase Auto Email Confirmations

In Supabase Dashboard:
1. Go to **Authentication > Settings**
2. Scroll to **Email Auth**
3. **Uncheck** "Enable email confirmations"
4. Click **Save**

This is the most likely fix since you're using a custom email confirmation system.

### Fix 2: Check Supabase Auth Settings in Code

Add this to your Supabase client initialization:

```typescript
// In src/integrations/supabase/client.ts
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      // Force disable auto email confirmation
      flowType: 'pkce'
    }
  }
);
```

### Fix 3: Clear Existing User Records

If a user with this email already exists but is in a weird state:

```sql
-- Check for existing users
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email = 'bousquet.matthieu0@gmail.com';

-- If found and it's a test account, delete it
DELETE FROM auth.users WHERE email = 'bousquet.matthieu0@gmail.com';
```

### Fix 4: Test with Minimal signUp Call

Try a simpler signup call to isolate the issue:

```typescript
const { error, data } = await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'testpassword123'
  // No options at all
});
```

If this works, then the issue is with the metadata or options.

---

## Diagnostic Commands

### Check Browser Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "Fetch/XHR"
4. Look for requests to Supabase auth endpoint
5. Check if request is:
   - **Pending** (hanging) - Network/timeout issue
   - **Failed** (red) - Error in request
   - **Completed** (green) - Check response

### Check Supabase Logs
```bash
# If using Supabase CLI
npx supabase functions logs

# Or check in Supabase Dashboard
# Logs & Reports > Logs
```

### Test Direct Supabase Connection
```typescript
// In browser console
const testSignup = async () => {
  const { error, data } = await supabase.auth.signUp({
    email: 'test' + Date.now() + '@example.com',
    password: 'TestPassword123!'
  });
  console.log('Test signup result:', { error, data });
};
testSignup();
```

---

## Expected Behavior After Fix

After fixing, you should see these logs in order:
```
🚀 [SIGNUP] Form submitted - starting signup process
✅ [SIGNUP] Starting user registration process...
📧 [SIGNUP] Calling supabase.auth.signUp with timeout protection...
⏳ [SIGNUP] Waiting for signUp response...
📬 [SIGNUP] signUp response received
✅ [SIGNUP] supabase.auth.signUp successful. User ID: <uuid>
```

---

## If Still Hanging After Fixes

1. **Check Supabase Status**: https://status.supabase.com/
2. **Try different email domain** (maybe Gmail is blocking)
3. **Check if you're hitting rate limits** on Supabase free tier
4. **Try from different network** (maybe firewall blocking)
5. **Check browser console for CORS errors**

---

## Next Steps

1. ✅ Added timeout protection (30 seconds)
2. ⬜ Check Supabase Auth settings (disable auto email confirmation)
3. ⬜ Clear existing user records if any
4. ⬜ Check network tab for stuck requests
5. ⬜ Test with minimal signup call

Try again and report what you see! 🔍
