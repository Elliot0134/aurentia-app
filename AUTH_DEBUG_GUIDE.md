# 🔍 Debug Guide - Session & Redirect Issues

## 📝 Testing Instructions

### Test 1: Login and Stay on Page
1. Open browser DevTools (F12)
2. Go to Console tab
3. Navigate to `/login`
4. Enter valid credentials and login
5. You should be redirected to `/individual/dashboard`
6. **Check console logs** - you should see:
   ```
   [useUserProfile] Starting fetchUserProfile...
   [useUserProfile] Calling getSession()...
   [useUserProfile] getSession() completed - Session: true
   [ProtectedRoute] Checking authentication...
   [ProtectedRoute] Local session exists: true
   [ProtectedRoute] Is authenticated: true
   [RoleBasedRedirect] Current path: /individual/dashboard
   [RoleBasedRedirect] Path is whitelisted, no redirect
   ```

### Test 2: Navigate to Chatbot
1. While logged in, click on Chatbot link or navigate to `/individual/chatbot`
2. **Check console logs** - you should see:
   ```
   [RoleBasedRedirect] Current path: /individual/chatbot
   [RoleBasedRedirect] User role: individual
   [RoleBasedRedirect] Path is whitelisted, no redirect
   ```

### Test 3: Refresh on Chatbot Page (THE CRITICAL TEST)
1. While on `/individual/chatbot`, press F5 to refresh
2. **Watch the URL bar** - does it change to `/individual/dashboard`?
3. **Check console logs** - copy ALL logs and send them
4. Look for these specific patterns:
   - Does `[RoleBasedRedirect] Will redirect: true` appear?
   - Does `[RoleBasedRedirect] Redirecting to: /individual/dashboard` appear?
   - What is the sequence of `[ProtectedRoute]` logs?

## 🔍 What to Look For

### If redirecting to dashboard on refresh:

**Scenario A: RoleBasedRedirect is redirecting**
```
[RoleBasedRedirect] Current path: /individual/chatbot
[RoleBasedRedirect] User role: individual
[RoleBasedRedirect] Target path: /individual/dashboard
[RoleBasedRedirect] Will redirect: true  ← THIS SHOULDN'T HAPPEN!
[RoleBasedRedirect] Redirecting to: /individual/dashboard
```
**Cause**: The whitelist check is failing
**Fix**: The path should match the whitelist on line 22-27

**Scenario B: ProtectedRoute is redirecting**
```
[ProtectedRoute] Checking authentication...
[ProtectedRoute] Local session exists: false  ← Session lost!
Not authenticated, redirecting to login
```
**Cause**: Session is being lost on refresh
**Fix**: Need to investigate localStorage

**Scenario C: Different component redirecting**
No `[RoleBasedRedirect]` redirect logs, but URL still changes
**Cause**: Another component (like OrganisationRouteGuard) is redirecting
**Fix**: Need to find which component

## 🧪 Additional Diagnostic Tests

### Check LocalStorage After Login
1. Login successfully
2. Open DevTools → Application tab → Local Storage
3. Find key: `sb-llcliurrrrxnkquwmwsi-auth-token`
4. Copy the value and check:
   - Does it exist? ✅ / ❌
   - Does it have `access_token`? ✅ / ❌
   - Does it have `refresh_token`? ✅ / ❌

### Check LocalStorage After Refresh
1. While on `/individual/chatbot`, open DevTools
2. Check Local Storage for the auth token
3. Press F5 to refresh
4. **Immediately** check if the token is still there
5. If token disappears → localStorage is being cleared
6. If token stays → session should work

### Manual getSession() Test
1. While on `/individual/chatbot`, open Console
2. Run this command:
   ```javascript
   import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.4/+esm')
     .then(({ createClient }) => {
       const client = createClient(
         'https://llcliurrrrxnkquwmwsi.supabase.co',
         'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsY2xpdXJycnJ4bmtxdXdtd3NpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc5MDMwOTEsImV4cCI6MjA1MzQ3OTA5MX0.UWfFrlMEQRvRhXYUORmUhrc1A6WLAJbLBnpCWAVaWSQ'
       );
       return client.auth.getSession();
     })
     .then(result => console.log('Session:', result));
   ```
3. Check if session exists

## 🎯 Expected Behavior

### ✅ CORRECT BEHAVIOR:
1. Login → redirected to `/individual/dashboard`
2. Navigate to `/individual/chatbot` → stays on chatbot
3. Refresh on `/individual/chatbot` → **STAYS ON CHATBOT**
4. Session persists across all pages
5. No unexpected redirects

### ❌ INCORRECT BEHAVIOR (Current Issue):
1. Login → redirected to `/individual/dashboard` ✅
2. Navigate to `/individual/chatbot` → stays on chatbot ✅
3. Refresh on `/individual/chatbot` → **REDIRECTED TO DASHBOARD** ❌

## 📊 Console Log Checklist

When you refresh on `/individual/chatbot`, you should see this sequence:

```
[ ] [ProtectedRoute] Checking authentication...
[ ] [ProtectedRoute] Local session exists: true
[ ] [ProtectedRoute] Is authenticated: true
[ ] [ProtectedRoute] Setting loading to false
[ ] [ProtectedRoute] Render - loading: false isAuthenticated: true
[ ] Authenticated, rendering protected content
[ ] [RoleBasedRedirect] Current path: /individual/chatbot
[ ] [RoleBasedRedirect] User role: individual
[ ] [RoleBasedRedirect] Loading: false
[ ] [RoleBasedRedirect] Path is whitelisted, no redirect
[ ] [useUserProfile] Starting fetchUserProfile...
[ ] [useUserProfile] getSession() completed - Session: true
[ ] [useUserProfile] Profile loaded: {...}
```

**If ANY of these logs are different, copy the full console output!**

## 🚨 Common Issues

### Issue 1: "Path is whitelisted" never appears
- **Cause**: RoleBasedRedirect is not executing the whitelist check
- **Fix**: Check if component is even rendering

### Issue 2: "Will redirect: true" appears for /individual/chatbot
- **Cause**: The whitelist check is failing
- **Fix**: Debug the currentPath.startsWith() logic

### Issue 3: Component unmounts before auth check completes
- **Cause**: Race condition in ProtectedRoute
- **Fix**: Ensure checkAuth() completes before rendering

### Issue 4: Session exists but isAuthenticated: false
- **Cause**: ProtectedRoute state not updating correctly
- **Fix**: Check the auth state change listener

---

**Run these tests and send me the FULL console output from Test 3!**
