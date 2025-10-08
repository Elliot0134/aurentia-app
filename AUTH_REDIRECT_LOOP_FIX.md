# 🔐 Authentication Redirect Loop & Session Timeout Fix

**Date:** October 8, 2025  
**Status:** ✅ **COMPLETE**

## 📋 Issues Fixed

### Issue 1: Login Redirect Loop
**Problem:** After login, user sees "Loading..." then gets redirected back to `/login`.

**Root Cause:**
- `RoleBasedRedirect` was trying to access `userProfile?.organization_id` which doesn't exist on the `UserProfile` type
- The organization ID is stored in the `user_organizations` table, not in the `profiles` table
- This was causing TypeScript errors and undefined values in redirect logic

**Solution:**
- Updated `RoleBasedRedirect` to use `organizationId` from the `useUserRole` hook
- The `useUserRole` hook properly fetches organization ID from `user_organizations` table via `useUserOrganizationId`
- Added `organizationId` as a prop to `RoleBasedMobileNavbar` component

---

### Issue 2: Random Session Timeouts/Disconnections
**Problem:** User gets disconnected and sent back to `/login` after some time on the app.

**Root Causes:**
1. **Overly Aggressive Session Checks:** The `useUserProfile` hook was checking session validity every 2 minutes and attempting token refreshes even on minor network errors
2. **Unnecessary Token Refreshes:** Visibility change handler was forcing token refreshes on every tab switch
3. **Network Error Mishandling:** Non-critical network errors were being treated as auth failures

**Solution:**
1. **Reduced Session Check Frequency:** Changed from every 2 minutes to every 5 minutes
2. **Smarter Error Handling:** Only act on critical auth errors (invalid/malformed tokens), ignore network/temporary issues
3. **Removed Aggressive Token Refresh:** Visibility change handler now only clears session on critical errors, relies on Supabase's built-in auto-refresh
4. **Simplified Periodic Checks:** Removed complex retry logic that was causing false negatives

---

### Issue 3: useUserOrganizationId Loading State
**Problem:** `useUserOrganizationId` kept `loading` state as `true` when no userId was provided, blocking UI renders.

**Solution:**
- Changed hook to set `loading: false` when no userId is provided
- This prevents infinite loading states in downstream hooks like `useUserRole`

---

## 🔧 Files Modified

### 1. `src/components/RoleBasedRedirect.tsx`
**Changes:**
- ✅ Added `organizationId` from `useUserRole()` hook
- ✅ Fixed redirect logic to use `organizationId` instead of `userProfile?.organization_id`
- ✅ Updated useMemo dependency array to use `organizationId`

**Lines modified:** ~7, 11, 49, 63

---

### 2. `src/hooks/useUserProfile.tsx`
**Changes:**
- ✅ Increased periodic session check interval from 2 minutes to 5 minutes
- ✅ Removed aggressive token refresh logic from periodic checks
- ✅ Only act on critical auth errors (invalid/malformed), ignore network errors
- ✅ Simplified visibility change handler to avoid unnecessary refreshes
- ✅ Let Supabase handle automatic token refresh (it's built-in)

**Lines modified:** ~165-220, 230-260

---

### 3. `src/hooks/useUserOrganizationId.tsx`
**Changes:**
- ✅ Set `loading: false` when no userId is provided
- ✅ Updated French comment to English

**Lines modified:** ~15-21

---

### 4. `src/components/RoleBasedSidebar.tsx`
**Changes:**
- ✅ Import `useUserRole` hook
- ✅ Destructure `organizationId` from `useUserRole()`
- ✅ Pass `organizationId` as prop to `RoleBasedMobileNavbar`
- ✅ Updated `RoleBasedMobileNavbar` type definition to accept `organizationId`
- ✅ Fixed organization routes in mobile navbar

**Lines modified:** ~14, 60, 255, 573, 723-726, 793-803

---

### 5. `src/App.tsx` (ProtectedRoute)
**Changes:**
- ✅ Removed timeout wrapper around `getSession()` (unnecessary)
- ✅ Simplified auth check logic
- ✅ Cleaned up console logging

**Lines modified:** ~118-124

---

## ✅ Expected Behavior After Fix

### Login Flow
1. ✅ User enters credentials and clicks login
2. ✅ Supabase creates session in localStorage
3. ✅ `ProtectedRoute` detects session instantly (via `getSession()`)
4. ✅ `useUserProfile` loads user data
5. ✅ `useUserRole` loads role and organization ID
6. ✅ `RoleBasedRedirect` redirects to correct dashboard based on role
7. ✅ **NO redirect loop back to /login**

### Session Persistence
1. ✅ User stays logged in after page refresh
2. ✅ Session persists across tab switches
3. ✅ Supabase auto-refreshes tokens (built-in every hour)
4. ✅ Only critical auth errors cause logout
5. ✅ Network/temporary errors are ignored
6. ✅ **NO random disconnections**

---

## 🧪 Testing Checklist

### Login Test
- [x] Navigate to `/login`
- [x] Enter valid credentials
- [x] Click login
- [x] **Expected:** Redirected to appropriate dashboard (e.g., `/individual/dashboard`)
- [x] **Expected:** No "Loading..." flash followed by redirect to `/login`

### Session Persistence Test
- [x] After successful login, press F5 to refresh
- [x] **Expected:** Stay logged in, no redirect to `/login`
- [x] **Expected:** Dashboard loads normally

### Tab Switch Test
- [x] Login successfully
- [x] Switch to another tab for 5+ minutes
- [x] Come back to the app
- [x] **Expected:** Still logged in
- [x] **Expected:** No forced logout

### Long Session Test
- [x] Login successfully
- [x] Leave app open for 10+ minutes
- [x] Interact with the app
- [x] **Expected:** Still logged in
- [x] **Expected:** No random logout

---

## 🔍 Technical Details

### Why These Changes Work

1. **Proper Organization ID Resolution:**
   - Organization membership is stored in `user_organizations` table (many-to-many)
   - `useUserOrganizationId` queries this table correctly
   - `useUserRole` aggregates all needed data including organization ID
   - Components now use the correct source of truth

2. **Reduced False Positives:**
   - Previous code treated ANY error as an auth failure
   - New code only acts on critical auth errors (invalid tokens, malformed data)
   - Network errors (timeouts, 500s, etc.) are logged but don't cause logout

3. **Leveraging Supabase Built-ins:**
   - Supabase client already has `autoRefreshToken: true`
   - Tokens automatically refresh every hour
   - No need for manual refresh logic
   - Periodic checks now just validate session exists, don't force refreshes

4. **Proper Loading States:**
   - Hooks return `loading: false` when they can't load data (no user)
   - Prevents infinite loading cascades
   - UI can render faster without waiting for impossible data

---

## 📚 References

- [Supabase Auth getSession()](https://supabase.com/docs/reference/javascript/auth-getsession)
- [Supabase Auto-Refresh Tokens](https://supabase.com/docs/guides/auth/sessions#automatic-token-refresh)
- [React Hooks Dependencies](https://react.dev/reference/react/useEffect#dependencies)

---

## ⚠️ Known Remaining Issues

1. **OrganisationFormCreate TypeScript Errors:**
   - `organisation_forms` table not in Supabase generated types
   - **Not related to auth** - needs Supabase type regeneration
   - Does not affect auth functionality

---

**Last Updated:** October 8, 2025  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
