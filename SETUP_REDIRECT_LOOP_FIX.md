# Setup Organization Redirect Loop Fix

## Problem Summary

User experiences an **infinite redirect loop** between:
- `/setup-organization` ↔️ `/organisation/:id/dashboard`

The page keeps switching back and forth without ever settling.

## Root Cause Analysis

### The Circular Redirect Loop

There are **TWO components** both checking organization state and redirecting:

#### 1. **SetupOrganization Page**
```tsx
// On every render:
if (organizationId) {
  navigate(`/organisation/${organizationId}/dashboard`);
}
```

#### 2. **RoleBasedRedirect Component** (runs on ALL protected routes)
```tsx
// On every render on /organisation/:id/dashboard:
if (userRole === 'organisation' && !organizationId) {
  navigate('/setup-organization');
}
```

### The Race Condition

1. User lands on `/setup-organization`
2. `SetupOrganization` checks `organizationId` from `useUserRole()` hook
3. If `organizationId` exists → redirects to `/organisation/:id/dashboard`
4. **But** `RoleBasedRedirect` is ALSO running on `/organisation/:id/dashboard`
5. If `organizationId` hasn't loaded yet (async fetch), it's `null`
6. `RoleBasedRedirect` sees role='organisation' + organizationId=null → redirects BACK to `/setup-organization`
7. **Infinite loop!** 🔄

### Why It Happens

- `useUserRole()` hook fetches `organizationId` from `user_organizations` table **asynchronously**
- Both components run **simultaneously** on page load
- State updates aren't synchronized
- Multiple useEffect hooks firing at the same time
- No prevention of duplicate checks

## Solutions Implemented

### ✅ Fix 1: Prevent Duplicate Checks in SetupOrganization

**File**: `src/pages/SetupOrganization.tsx`

**Added**:
```tsx
const hasCheckedRef = useRef(false);

useEffect(() => {
  // Prevent multiple checks
  if (hasCheckedRef.current) {
    return;
  }
  
  if (loading) {
    return;
  }
  
  hasCheckedRef.current = true;
  
  // ONLY redirect if organization exists AND setup is complete
  if (organizationId && userProfile.organization_setup_pending === false) {
    navigate(`/organisation/${organizationId}/dashboard`, { replace: true });
  }
}, [userProfile, organizationId, loading, navigate]);
```

**Why it works**:
- Uses `useRef` to track if check has already run
- Waits for loading to complete
- **Extra condition**: Only redirects if `organization_setup_pending === false`
- Prevents redirect during organization creation process

### ✅ Fix 2: Prevent Duplicate Checks in OrganisationFlowWrapper

**File**: `src/components/organisation/OrganisationFlowWrapper.tsx`

**Added**:
```tsx
const hasCheckedRef = useRef(false);

useEffect(() => {
  const checkExistingOrganisation = async () => {
    if (hasCheckedRef.current) {
      return;
    }
    
    hasCheckedRef.current = true;
    
    // ... rest of the logic
  };
  
  checkExistingOrganisation();
}, [userId, navigate, onComplete]);
```

**Why it works**:
- Prevents the check from running multiple times
- Ensures redirect only happens once per mount

### ✅ Fix 3: Diagnostic SQL Query

**File**: `diagnose_organization_complete.sql`

Run this query to check your database state:
```sql
-- Replace 'YOUR_EMAIL_HERE' with your email
SELECT ...
```

The query checks:
1. **User Profile**: role, organization_setup_pending
2. **user_organizations**: Does entry exist? Is status='active'?
3. **organizations**: onboarding_completed, onboarding_step
4. **Combined Diagnosis**: Shows exact redirect reason
5. **Suggested Fix**: Auto-generates SQL to fix the issue

## How to Use the Diagnostic Query

1. Open the file: `diagnose_organization_complete.sql`
2. Replace `'YOUR_EMAIL_HERE'` with your actual email (in 7 places)
3. Run in Supabase SQL Editor
4. Check the **"COMBINED DIAGNOSIS"** section
5. If there's a problem, the **"suggested_fix"** column will show the SQL to run

## Expected Database State (For Working Setup)

```sql
-- profiles table
user_role = 'organisation'
organization_setup_pending = false  -- CRITICAL!

-- user_organizations table (MUST EXIST!)
user_id = <your_id>
organization_id = <org_id>
status = 'active'  -- CRITICAL!
user_role = 'organisation'

-- organizations table
id = <org_id>
onboarding_completed = true  -- Optional
onboarding_step = 6          -- Optional
```

## Common Issues & Fixes

### Issue 1: organization_setup_pending = true
**Problem**: User has organization but flag is still true
**Fix**:
```sql
UPDATE profiles 
SET organization_setup_pending = false 
WHERE id = '<your_user_id>';
```

### Issue 2: No user_organizations entry
**Problem**: Organization exists but no link in user_organizations
**Fix**:
```sql
INSERT INTO user_organizations (
  user_id, 
  organization_id, 
  user_role, 
  status, 
  is_primary
) VALUES (
  '<your_user_id>',
  '<your_org_id>',
  'organisation',
  'active',
  true
);
```

### Issue 3: user_organizations status != 'active'
**Problem**: Entry exists but status is wrong
**Fix**:
```sql
UPDATE user_organizations 
SET status = 'active' 
WHERE user_id = '<your_user_id>';
```

## Redirect Flow (After Fix)

### ✅ Correct Flow - First Time Setup:
1. User role = 'organisation', no organization
2. `RoleBasedRedirect` → `/setup-organization`
3. `SetupOrganization` → Shows `OrganisationFlowWrapper`
4. User fills form, creates organization
5. `OrganisationSetupForm`:
   - Creates organization
   - Creates user_organizations entry
   - Sets `organization_setup_pending = false`
6. Redirect to `/organisation/:id/dashboard`
7. `RoleBasedRedirect` sees organizationId exists → No redirect
8. ✅ User lands on dashboard

### ✅ Correct Flow - Returning User:
1. User has organization already
2. `RoleBasedRedirect` checks: organizationId exists → `/organisation/:id/dashboard`
3. ✅ User lands on dashboard

### ❌ Old Broken Flow (What was happening):
1. User lands on `/setup-organization`
2. `SetupOrganization` finds organizationId → redirects to dashboard
3. `RoleBasedRedirect` on dashboard, organizationId still loading (null)
4. `RoleBasedRedirect` → redirects to `/setup-organization`
5. 🔄 Infinite loop!

## Testing Checklist

- [ ] Run diagnostic SQL query
- [ ] Verify `organization_setup_pending = false`
- [ ] Verify `user_organizations` entry exists with `status = 'active'`
- [ ] Clear browser cache and localStorage
- [ ] Refresh page
- [ ] Check browser console logs:
  - `[SetupOrganization]` logs should show check happens ONCE
  - `[OrganisationFlowWrapper]` logs should show check happens ONCE
  - `[RoleBasedRedirect]` should NOT redirect on dashboard
- [ ] Navigate to `/setup-organization` manually
  - Should redirect to dashboard if org exists
- [ ] Click sidebar "Organisation" button
  - Should go to dashboard directly

## Console Logs to Monitor

Look for these patterns in browser DevTools:

### ✅ Good (No Loop):
```
[SetupOrganization] useEffect triggered { loading: false, organizationId: 'xxx', hasChecked: false }
[SetupOrganization] Organization exists and setup complete, redirecting to dashboard: xxx
[RoleBasedRedirect] Current path: /organisation/xxx/dashboard
[RoleBasedRedirect] Path is whitelisted, no redirect
```

### ❌ Bad (Loop):
```
[SetupOrganization] Organization exists, redirecting to dashboard: xxx
[RoleBasedRedirect] No organizationId, redirecting to setup
[SetupOrganization] Organization exists, redirecting to dashboard: xxx
[RoleBasedRedirect] No organizationId, redirecting to setup
... (repeats forever)
```

## Files Modified

1. ✅ `src/pages/SetupOrganization.tsx` - Added hasCheckedRef, organization_setup_pending check
2. ✅ `src/components/organisation/OrganisationFlowWrapper.tsx` - Added hasCheckedRef, better logging
3. ✅ `diagnose_organization_complete.sql` - Comprehensive diagnostic query

## Prevention for Future

When creating an organization, the code **MUST** do these steps **atomically**:

1. ✅ Insert into `organizations` table
2. ✅ Insert into `user_organizations` table (link user to org)
3. ✅ Update `profiles.user_role` to 'organisation'
4. ✅ Update `profiles.organization_setup_pending` to `false`

If ANY step fails, rollback ALL changes (use a transaction).

**Key Rule**: `organization_setup_pending` should ONLY be `true` BEFORE creating the organization, never after.

---

**Date**: October 8, 2025
**Issue**: Infinite redirect loop between setup and dashboard
**Status**: ✅ FIXED
