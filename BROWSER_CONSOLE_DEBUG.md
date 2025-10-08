# Browser Console Debug Guide

## 🔍 How to Check What's Causing the Redirect

### Step 1: Open Browser DevTools
1. Press **F12** or right-click → Inspect
2. Click on the **Console** tab
3. Clear the console (🚫 button or Ctrl+L)

### Step 2: Reproduce the Issue
1. Navigate to `/setup-organization` in the URL bar
2. Watch the console logs

### Step 3: Look for These Specific Logs

#### ✅ If you see this pattern (GOOD - No loop):
```
[SetupOrganization] useEffect triggered { loading: false, organizationId: '65fb9604...', hasChecked: false }
[SetupOrganization] Organization exists and setup complete, redirecting to dashboard: 65fb9604...
[RoleBasedRedirect] Current path: /organisation/65fb9604.../dashboard
[RoleBasedRedirect] Path is whitelisted, no redirect
```

#### ❌ If you see this pattern (BAD - Loop detected):
```
[SetupOrganization] Organization exists and setup complete, redirecting to dashboard: 65fb9604...
[RoleBasedRedirect] Organization setup pending - redirecting to setup
[SetupOrganization] Organization exists and setup complete, redirecting to dashboard: 65fb9604...
[RoleBasedRedirect] Organization setup pending - redirecting to setup
... (repeats)
```

#### 🔴 If you see this (organization_setup_pending is TRUE):
```
[RoleBasedRedirect] Organization setup pending: true
[RoleBasedRedirect] Organization setup pending - redirecting to setup
```

### Step 4: Check the Values

Look for these specific log entries and note the values:

```javascript
[RoleBasedRedirect] Current path: ?
[RoleBasedRedirect] User role: ?
[RoleBasedRedirect] Organization ID: ?
[RoleBasedRedirect] Loading: ?
[RoleBasedRedirect] Organization setup pending: ?  ← THIS IS KEY!
```

### Step 5: Check useUserRole Hook

Also look for:
```javascript
[useUserRole] { 
  userRole: ?, 
  organizationId: ?,
  profileLoading: ?,
  orgIdLoading: ?,
  loading: ?
}
```

### What to Report Back

Copy and paste the **first 20-30 lines** of console logs after you navigate to `/setup-organization`.

Pay special attention to:
- `organization_setup_pending` value
- `organizationId` value  
- Any log that says "redirecting"

---

## 🎯 Quick Diagnosis Based on Logs

| Log Pattern | Issue | Fix |
|-------------|-------|-----|
| `Organization setup pending: true` | `organization_setup_pending` flag is wrong | Run: `UPDATE profiles SET organization_setup_pending = false WHERE id = '67b4760e...'` |
| `Organization ID: null` but DB shows it exists | `useUserOrganizationId` hook not loading | Check `user_organizations` query |
| `Already checked, skipping` appears twice | React StrictMode double-rendering | Normal in dev, ignore |
| `Path is whitelisted, no redirect` | Everything working! | No issue |

---

## 🔧 Expected Console Output (Working State)

```
[useUserProfile] Loading profile...
[useUserOrganizationId] Fetching for userId: 67b4760e-1633-4591-aba9-1a06c638b54f
[useUserOrganizationId] Query result: { organizationId: '65fb9604-bc02-42e0-bfb7-f5d5b357c620', ... }
[useUserRole] { userRole: 'organisation', organizationId: '65fb9604...', loading: false }
[RoleBasedRedirect] Current path: /organisation/65fb9604.../dashboard
[RoleBasedRedirect] User role: organisation
[RoleBasedRedirect] Organization ID: 65fb9604-bc02-42e0-bfb7-f5d5b357c620
[RoleBasedRedirect] Loading: false
[RoleBasedRedirect] Organization setup pending: false  ← Should be FALSE!
[RoleBasedRedirect] Path is whitelisted, no redirect  ← No redirect!
```

If you see anything different, especially if `organization_setup_pending: true`, that's your culprit!
