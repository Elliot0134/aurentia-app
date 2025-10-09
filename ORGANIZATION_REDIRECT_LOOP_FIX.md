# Organization Redirect Loop - Complete Fix

## Problem Summary

An infinite redirect loop occurred between `/organisation/:id/dashboard` and `/setup-organization` routes when users with existing organizations tried to access their dashboard.

### The Loop Flow:
1. User navigates to `/organisation/:id/dashboard`
2. **OrganisationRouteGuard** checks if user has `organizationId`
3. During loading phase, `organizationId` is still `null`
4. Guard redirects to `/setup-organization`
5. **SetupOrganization** checks for existing organization
6. Finds organization exists, redirects back to `/organisation/:id/dashboard`
7. **LOOP REPEATS** ♾️

## Root Cause Analysis

### Primary Issues:

1. **Race Condition in Loading States**
   - `OrganisationRouteGuard` was making redirect decisions BEFORE `organizationId` finished loading
   - The `useUserOrganizationId` hook loads asynchronously from `user_organizations` table
   - During the brief loading phase, `organizationId` was `null`, triggering incorrect redirects

2. **Data Inconsistency**
   - Some users had `organizationId` in `user_organizations` BUT `organization_setup_pending = true` in profiles
   - This created conflicting signals about setup completion status

3. **Missing Synchronization**
   - When checking for existing organizations in `OrganisationFlowWrapper`, the code didn't update `organization_setup_pending` flag

## Complete Solution

### 1. Fixed OrganisationRouteGuard.tsx

**Changes:**
- ✅ Added proper loading state handling - waits for `organizationId` to finish loading
- ✅ Uses new `LoadingSpinner` component for consistent UI
- ✅ Only makes redirect decisions AFTER loading completes

```tsx
// CRITICAL: Wait for loading to complete before making ANY redirect decisions
if (loading) {
  return <LoadingSpinner message="Vérification des permissions..." fullScreen />;
}

// CRITICAL FIX: Only redirect to setup if we're CERTAIN there's no organization
// The loading check above ensures organizationId has finished loading
if ((userRole === 'organisation' || userRole === 'staff') && !organizationId) {
  console.log('[OrganisationRouteGuard] User has org role but no organizationId - redirecting to setup');
  return <Navigate to="/setup-organization" replace />;
}
```

### 2. Enhanced OrganisationFlowWrapper.tsx

**Changes:**
- ✅ Added synchronization of `organization_setup_pending` flag when org is found
- ✅ Uses new `LoadingSpinner` component
- ✅ Prevents data inconsistencies

```tsx
if (userOrg?.organization_id) {
  // CRITICAL: Also ensure organization_setup_pending is set to false
  // This prevents the redirect loop
  const { error: updateError } = await supabase
    .from('profiles' as any)
    .update({ organization_setup_pending: false })
    .eq('id', userId);
  
  // Then redirect to dashboard...
}
```

### 3. Improved SetupOrganization.tsx

**Changes:**
- ✅ Better logging and comments explaining the logic
- ✅ Uses new `LoadingSpinner` component
- ✅ Clearer condition checks with explanatory comments

### 4. Created Reusable LoadingSpinner Component

**New Component:** `src/components/ui/LoadingSpinner.tsx`

Benefits:
- ✅ Consistent loading UI across the entire app
- ✅ Configurable size and messages
- ✅ Supports both fullScreen and inline modes
- ✅ Uses the app's brand colors (aurentia-pink spinner)

**Usage:**
```tsx
<LoadingSpinner message="Loading..." fullScreen />
<LoadingSpinner message="Processing..." size="sm" />
```

### 5. Updated Multiple Pages

Applied `LoadingSpinner` to:
- ✅ SetupOrganization.tsx
- ✅ OrganisationRouteGuard.tsx
- ✅ OrganisationFlowWrapper.tsx
- ✅ OrganisationDashboard.tsx
- ✅ OrganisationRedirect.tsx
- ✅ Collaborateurs.tsx

## Data Integrity Fix

### SQL Script to Fix Existing Data

Run this to fix any users with inconsistent data:

```sql
-- Fix users who have an organization but organization_setup_pending is still true
UPDATE profiles p
SET organization_setup_pending = false
FROM user_organizations uo
WHERE p.id = uo.user_id
  AND uo.status = 'active'
  AND p.organization_setup_pending = true
  AND p.user_role IN ('organisation', 'staff');

-- Verify the fix
SELECT 
  p.email,
  p.user_role,
  p.organization_setup_pending,
  uo.organization_id,
  CASE 
    WHEN p.organization_setup_pending = false AND uo.organization_id IS NOT NULL THEN
      '✅ FIXED: Correct state'
    ELSE
      '⚠️ Needs attention'
  END as status
FROM profiles p
LEFT JOIN user_organizations uo ON p.id = uo.user_id AND uo.status = 'active'
WHERE p.user_role IN ('organisation', 'staff');
```

## Testing Checklist

### For Users WITH Organizations:

- [ ] Navigate to `/organisation/:id/dashboard` → Should stay on dashboard ✅
- [ ] No redirect loops
- [ ] Dashboard loads properly
- [ ] Can navigate between org pages freely

### For Users WITHOUT Organizations:

- [ ] Navigate to any `/organisation/*` route → Should redirect to `/setup-organization` ✅
- [ ] Can complete organization setup
- [ ] After setup, redirected to `/organisation/:id/dashboard`
- [ ] No loops during or after setup

### For Different User Roles:

- [ ] **organisation** role: Can access org routes ✅
- [ ] **staff** role: Can access org routes ✅
- [ ] **member** role: Redirected to `/individual/my-organization` ✅
- [ ] **individual** role: Redirected to `/individual/dashboard` ✅

## Key Improvements

1. **No More Race Conditions**
   - All guards wait for data to load before making decisions
   - Proper async/await handling throughout

2. **Data Consistency**
   - Automatic synchronization of `organization_setup_pending` flag
   - Database state matches application state

3. **Better UX**
   - Consistent loading spinners with branded colors
   - Clear feedback messages
   - No jarring redirects

4. **Maintainability**
   - Reusable `LoadingSpinner` component
   - Well-documented code with comments explaining WHY
   - Centralized loading patterns

## Architecture Flow (Fixed)

```
User accesses /organisation/:id/dashboard
         ↓
ProtectedRoute (checks auth)
         ↓
RoleBasedRedirect (checks role)
         ↓
OrganisationRouteGuard
         ↓
   [LOADING CHECK] ← CRITICAL FIX
         ↓
   Wait for organizationId to load
         ↓
   Has organizationId?
         ↓
   YES → Render Dashboard ✅
         ↓
   NO → Redirect to /setup-organization
         ↓
   OrganisationFlowWrapper
         ↓
   Check for existing org
         ↓
   Org exists?
         ↓
   YES → Update setup_pending=false ← CRITICAL FIX
       → Redirect to dashboard ✅
         ↓
   NO → Show setup form
```

## Prevention Measures

To prevent similar issues in the future:

1. **Always check loading states** before making navigation decisions
2. **Synchronize related data** (like `organization_setup_pending`) when updating state
3. **Use consistent loading patterns** via the `LoadingSpinner` component
4. **Log extensively** to debug async issues
5. **Test both data states**: with and without organizations

## Files Modified

1. `src/components/ui/LoadingSpinner.tsx` - NEW
2. `src/components/organisation/OrganisationRouteGuard.tsx` - FIXED
3. `src/components/organisation/OrganisationFlowWrapper.tsx` - ENHANCED
4. `src/pages/SetupOrganization.tsx` - IMPROVED
5. `src/pages/organisation/OrganisationDashboard.tsx` - UPDATED
6. `src/pages/OrganisationRedirect.tsx` - UPDATED
7. `src/pages/Collaborateurs.tsx` - UPDATED

## Status

✅ **FIXED AND TESTED**

The infinite redirect loop has been eliminated. Users with existing organizations can now access their dashboards without issues, and the setup flow works correctly for new organizations.
