# 🔍 Debugging Steps for Infinite Loading

## Current Status
The app is stuck on "Loading..." or "Chargement..." screen after the latest changes.

## What to Check

### 1. Open Browser Console (F12)
Look for these console messages in order:

```
[useUserProfile] useEffect mounting
[useUserProfile] Starting fetchUserProfile...
[useUserProfile] User: <user-id>
[useUserProfile] Profile loaded: {...}
[useUserProfile] Final profile: {...}
[useUserProfile] Setting loading to false
[useUserProfile] Current state - loading: false, userProfile: <user-id>

[RoleBasedLayout] Render - loading: false, userLoading: false, userProfile: <user-id>
```

### 2. Check for Errors
Look for any RED error messages, especially:
- RLS (Row Level Security) policy errors
- Database query errors
- Network errors
- TypeScript errors

### 3. Identify Which Loading State is Stuck

**If you see "Loading..." (English)**:
- This is from `ProtectedRoute` in `App.tsx`
- Check the browser console for "Checking authentication..."
- Check if session is loading properly

**If you see "Chargement..." (French)**:
- This is from `RoleBasedLayout` or `RoleBasedRedirect`
- Check console for `[RoleBasedLayout]` or `[useUserProfile]` messages
- See which loading state is `true`

### 4. Common Issues and Fixes

#### Issue: `[useUserProfile] Error fetching profile: ...`
**Cause**: RLS policies blocking profile access
**Fix**: Check Supabase RLS policies for `profiles` table

#### Issue: `[useUserProfile] Fetch timeout after 10 seconds`
**Cause**: Database query hanging or network issue
**Fix**: 
1. Check Supabase dashboard for slow queries
2. Check your network connection
3. Check if you're logged in properly

#### Issue: Loading never becomes false
**Cause**: useEffect not completing or error in finally block
**Fix**: Check console for where the flow stops

#### Issue: `[RoleBasedLayout] Showing loading state` repeats forever
**Cause**: `loading` or `userLoading` stuck at `true`
**Fix**: Check which one is stuck and trace back to source

## Quick Fixes to Try

### Fix 1: Clear Browser Cache and Storage
```
1. Open DevTools (F12)
2. Go to Application tab
3. Clear Storage -> Clear site data
4. Refresh page
```

### Fix 2: Check if Logged In
```javascript
// Run in browser console:
const { data } = await supabase.auth.getSession();
console.log('Session:', data.session);
```

### Fix 3: Manually Check Profile
```javascript
// Run in browser console:
const { data: { user } } = await supabase.auth.getUser();
console.log('User:', user);

const { data: profile, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single();
console.log('Profile:', profile, 'Error:', error);
```

### Fix 4: Check RLS Policies
Go to Supabase Dashboard -> Authentication -> Policies
Ensure `profiles` table has policies that allow:
- SELECT for authenticated users on their own profile

## Next Steps Based on Console Output

### Scenario A: No console logs at all
- Check if JavaScript is running
- Check for syntax errors
- Try hard refresh (Ctrl+Shift+R)

### Scenario B: Stops at "[useUserProfile] Starting fetchUserProfile..."
- Database query is hanging
- Check Supabase dashboard for query performance
- Check if you're rate limited

### Scenario C: Error fetching profile
- RLS policy issue
- Check Supabase policies
- Verify user is authenticated

### Scenario D: Profile loads but still shows loading
- Check `[RoleBasedLayout]` logs
- See which loading state is stuck
- May need to debug `useUserRole` hook

## Manual Workaround

If all else fails, you can temporarily bypass the loading by:

1. Open `src/hooks/useUserProfile.tsx`
2. Change `const [loading, setLoading] = useState(true);` to `useState(false);`
3. Save and test

This will show the UI even if profile hasn't loaded, allowing you to see other errors.

## Report Back

Please share:
1. All console messages in order
2. Any errors (red text)
3. Which scenario above matches your situation
4. Result of the manual checks in browser console
