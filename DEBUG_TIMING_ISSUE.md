# Redirect Loop Debug - Console Logs Analysis

## 🐛 If Hard Refresh Didn't Work, Try This:

Your database is perfect. The code has safeguards. So if you're still seeing a loop, it's likely a **timing/race condition**.

## 🔍 Advanced Debug: Add Detailed Logging

### Step 1: Check Current Console Logs

Open DevTools Console and look for this **exact sequence**:

```javascript
// What you SHOULD see (working):
[useUserRole] { userRole: 'organisation', organizationId: '65fb9604...', loading: false }
[SetupOrganization] useEffect triggered { loading: false, organizationId: '65fb9604...', hasChecked: false }
[SetupOrganization] Organization exists and setup complete, redirecting to dashboard: 65fb9604...
[RoleBasedRedirect] Current path: /organisation/65fb9604.../dashboard
[RoleBasedRedirect] Path is whitelisted, no redirect
✅ SUCCESS - No loop!

// What you might see (broken):
[useUserRole] { userRole: 'organisation', organizationId: null, loading: false }  ← NULL!
[SetupOrganization] useEffect triggered { loading: false, organizationId: null, hasChecked: false }
[SetupOrganization] No organization or setup pending, staying on setup page
[useUserRole] { userRole: 'organisation', organizationId: '65fb9604...', loading: false }  ← NOW it loads!
[SetupOrganization] useEffect triggered { loading: false, organizationId: '65fb9604...', hasChecked: true }
[SetupOrganization] Already checked, skipping  ← Prevented redirect!
❌ STUCK on setup page because hasCheckedRef blocked the redirect!
```

## 🎯 The Real Problem (If Logs Show This)

If you see `organizationId: null` first, then `organizationId: '65fb9604...'` later:

**The issue is**: `hasCheckedRef` is preventing the redirect when the org ID finally loads!

### The Fix: Reset hasCheckedRef when organizationId changes

Let me create a better version of SetupOrganization.tsx:

```tsx
// IMPROVED VERSION - Handles async organizationId loading
useEffect(() => {
  console.log('[SetupOrganization] useEffect triggered', { 
    loading, 
    userProfile: !!userProfile, 
    organizationId,
    hasChecked: hasCheckedRef.current 
  });
  
  // Wait for loading to complete
  if (loading) {
    console.log('[SetupOrganization] Still loading, waiting...');
    return;
  }
  
  // No user profile → login
  if (!userProfile) {
    console.log('[SetupOrganization] No user profile, redirecting to login');
    navigate('/login');
    return;
  }

  // IMPORTANT: Only block duplicate checks if we're about to redirect
  // If organizationId changed from null to a value, allow the check again
  if (organizationId && userProfile.organization_setup_pending === false) {
    if (hasCheckedRef.current) {
      console.log('[SetupOrganization] Already checked and found org, skipping duplicate redirect');
      return;
    }
    
    hasCheckedRef.current = true;
    console.log('[SetupOrganization] Organization exists and setup complete, redirecting to dashboard:', organizationId);
    navigate(`/organisation/${organizationId}/dashboard`, { replace: true });
  } else {
    console.log('[SetupOrganization] No organization or setup pending, staying on setup page', {
      hasOrg: !!organizationId,
      setupPending: userProfile.organization_setup_pending
    });
  }
}, [userProfile, organizationId, loading, navigate]);
```

The key change: **Only set hasCheckedRef when actually redirecting**, not before!

---

## 📋 What to Report

Copy and paste your **exact console logs** (first 30 lines) when you:

1. Navigate to `/setup-organization`
2. Wait 3 seconds
3. Copy all logs

Look for:
- How many times `[useUserRole]` logs appear
- What `organizationId` value is each time (null or actual ID?)
- If `hasCheckedRef` blocked a redirect

This will tell us if we need to update the SetupOrganization logic.
