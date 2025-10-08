# Organization Dashboard Redirect Fix

## Problem Summary
When clicking the sidebar button to navigate to `/organisation/:id/dashboard`, users were being redirected through:
1. `/setup-organization` 
2. `/organisation/:id/onboarding`

Even though:
- The organization exists in the `organizations` table
- The user is in the `user_organizations` table with `status = 'active'`
- The `profiles.organization_setup_pending` is `false`
- The organization setup was completed

## Root Causes

### 1. Wrong Component on `/setup-organization` Route
**File**: `src/App.tsx` (Line ~309)
- **Issue**: Route was using `OrganisationOnboarding` component instead of `SetupOrganization`
- **Impact**: Setup page showed the full onboarding flow instead of the simple setup form

### 2. Onboarding Completion Check
**File**: `src/hooks/useOrganisationNavigation.tsx`
- **Issue**: Hook was checking `organizations.onboarding_completed` flag and redirecting to `/organisation/:id/onboarding` if false
- **Impact**: Even after setup, users were sent to onboarding if the flag wasn't set

### 3. OnboardingGuard Component
**File**: `src/components/organisation/OnboardingGuard.tsx`
- **Issue**: Component redirects to onboarding if `onboarding_completed` is false
- **Status**: Not currently used in App.tsx (good!)

## Solutions Implemented

### ✅ Fix 1: Correct Setup Organization Route
**File**: `src/App.tsx`

**Changed**:
```tsx
// BEFORE (Wrong)
import {
  // ... other imports
  OrganisationOnboarding
} from "./pages/organisation";

<Route path="/setup-organization" element={<OrganisationOnboarding />} />

// AFTER (Correct)
import SetupOrganization from "./pages/SetupOrganization";

<Route path="/setup-organization" element={<SetupOrganization />} />
```

**Why**: `SetupOrganization` is a simple form to create an organization, while `OrganisationOnboarding` is a 6-step detailed onboarding process. The setup should be simple.

### ✅ Fix 2: Remove Onboarding Redirect Logic
**File**: `src/hooks/useOrganisationNavigation.tsx`

**Changed**:
```tsx
// BEFORE (with onboarding check)
const { data: userOrg, error: userOrgError } = await (supabase as any)
  .from('user_organizations')
  .select(`
    organization_id,
    organizations!inner (
      id,
      onboarding_completed  // ← This field caused redirects
    )
  `)
  .eq('user_id', userProfile.id)
  .eq('status', 'active')
  .maybeSingle();

if (userOrg?.organizations) {
  const org = userOrg.organizations;
  if (org.onboarding_completed) {
    navigate(`/organisation/${org.id}/dashboard`);
  } else {
    navigate(`/organisation/${org.id}/onboarding`);  // ← Unwanted redirect
  }
}

// AFTER (direct to dashboard)
const { data: userOrg, error: userOrgError } = await (supabase as any)
  .from('user_organizations')
  .select(`
    organization_id,
    organizations!inner (
      id
    )
  `)
  .eq('user_id', userProfile.id)
  .eq('status', 'active')
  .maybeSingle();

if (userOrg?.organizations) {
  const org = userOrg.organizations;
  navigate(`/organisation/${org.id}/dashboard`);  // ← Always go to dashboard
}
```

**Why**: After setup is complete, users should go directly to their dashboard, not to onboarding.

### ✅ Fix 3: Removed Onboarding Route (as requested)
**File**: Deleted route from `src/App.tsx`

The route `/organisation/:id/onboarding` has been effectively removed by:
1. Not importing `OrganisationOnboarding` in the routes
2. Not using `OnboardingGuard` anywhere
3. Removing onboarding checks from navigation logic

## Current Flow

### ✅ Correct Flow Now:
1. User clicks "Organisation" button in sidebar
2. `useOrganisationNavigation` checks if user has organization via `user_organizations`
3. If yes → Navigate to `/organisation/:id/dashboard` ✅
4. If no → Navigate to `/setup-organization` (correct simple form)

### ✅ Setup Flow:
1. User goes to `/setup-organization`
2. Sees `SetupOrganization` page with `OrganisationFlowWrapper`
3. Fills out `OrganisationSetupForm` (simple form)
4. On success:
   - Sets `onboarding_completed = true` and `onboarding_step = 6`
   - Creates entry in `user_organizations`
   - Sets `organization_setup_pending = false`
5. Redirects to `/organisation/:id/dashboard` ✅

## Files Modified

1. ✅ `src/App.tsx` - Fixed import and route
2. ✅ `src/hooks/useOrganisationNavigation.tsx` - Removed onboarding check
3. ℹ️ `src/components/organisation/OnboardingGuard.tsx` - Not used (can be deleted later)
4. ℹ️ `src/pages/organisation/OrganisationOnboarding.tsx` - Not used in main flow (can be repurposed)

## What About `onboarding_completed`?

The `onboarding_completed` field in the `organizations` table is still set to `true` by `OrganisationSetupForm`, which is fine. It just doesn't gate access to the dashboard anymore.

**Recommendation**: You can use this field for:
- Analytics (track which orgs completed setup)
- Optional extended onboarding (separate from access control)
- Feature flags (show tips to new organizations)

## Testing

To verify the fix works:

1. **As an organization user with existing organization**:
   ```
   Click sidebar "Organisation" button
   → Should go directly to /organisation/:id/dashboard
   ```

2. **As an organization user without organization**:
   ```
   Click sidebar "Organisation" button
   → Should go to /setup-organization
   → Complete simple form
   → Redirect to /organisation/:id/dashboard
   ```

3. **Verify database state**:
   ```sql
   SELECT 
     p.id as user_id,
     p.user_role,
     p.organization_setup_pending,
     uo.organization_id,
     uo.status,
     o.onboarding_completed,
     o.onboarding_step
   FROM profiles p
   LEFT JOIN user_organizations uo ON p.id = uo.user_id
   LEFT JOIN organizations o ON uo.organization_id = o.id
   WHERE p.user_role = 'organisation';
   ```

   Expected for working setup:
   - `organization_setup_pending = false`
   - `user_organizations.status = 'active'`
   - `user_organizations.organization_id` exists
   - `organizations.onboarding_completed = true` (optional)

## Summary

✅ Fixed `/setup-organization` route to use correct component
✅ Removed onboarding redirect logic from navigation
✅ Users now go directly to dashboard when clicking sidebar button
✅ `/organisation/:id/onboarding` route effectively removed from flow

**Date**: October 8, 2025
**Issue**: Unwanted redirects to setup and onboarding
**Status**: ✅ RESOLVED
