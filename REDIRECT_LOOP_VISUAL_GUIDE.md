# Setup Organization Redirect Loop - Visual Guide

## 🔴 BEFORE (Broken - Infinite Loop)

```
┌─────────────────────────────────────────────────────────────┐
│                    User clicks "Organisation"                │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│          useOrganisationNavigation checks for org           │
│              → Found! Navigate to /org/123/dashboard         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  Land on /org/123/dashboard                  │
│                  RoleBasedRedirect runs...                   │
│                  organizationId is loading (null)            │
│            → Redirect to /setup-organization  ❌             │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│               Land on /setup-organization                    │
│              SetupOrganization checks org...                 │
│      organizationId loaded now → Found organization!         │
│        → Redirect to /org/123/dashboard  ❌                  │
└─────────────────────────────────────────────────────────────┘
                              ↓
                          🔄 LOOP!
```

## ✅ AFTER (Fixed - No Loop)

```
┌─────────────────────────────────────────────────────────────┐
│                    User clicks "Organisation"                │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│          useOrganisationNavigation checks for org           │
│              → Found! Navigate to /org/123/dashboard         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  Land on /org/123/dashboard                  │
│                  RoleBasedRedirect runs...                   │
│      Path starts with /organisation → No redirect ✅         │
└─────────────────────────────────────────────────────────────┘
                              ↓
                    ✅ SUCCESS - Stays on dashboard!
```

## 🔧 What Changed

### 1. SetupOrganization.tsx
```diff
+ const hasCheckedRef = useRef(false);

  useEffect(() => {
+   // Prevent duplicate checks
+   if (hasCheckedRef.current) return;
    if (loading) return;
+   hasCheckedRef.current = true;
    
-   if (organizationId) {
+   if (organizationId && userProfile.organization_setup_pending === false) {
      navigate(`/organisation/${organizationId}/dashboard`);
    }
  }, [userProfile, organizationId, loading]);
```

**Key Changes**:
- ✅ Prevents multiple checks with `useRef`
- ✅ Only redirects if `organization_setup_pending === false`
- ✅ Waits for loading to complete

### 2. OrganisationFlowWrapper.tsx
```diff
+ const hasCheckedRef = useRef(false);

  useEffect(() => {
    const checkExistingOrganisation = async () => {
+     if (hasCheckedRef.current) return;
+     hasCheckedRef.current = true;
      
      // ... rest of logic
    };
  }, [userId]);
```

**Key Change**:
- ✅ Prevents duplicate async checks

## 🗂️ Database State Check

### Expected State (Working)
```sql
profiles:
  ✅ user_role = 'organisation'
  ✅ organization_setup_pending = false  ← CRITICAL!

user_organizations:
  ✅ user_id = <your_id>
  ✅ organization_id = <org_id>
  ✅ status = 'active'  ← CRITICAL!
  ✅ user_role = 'organisation'

organizations:
  ✅ id = <org_id>
  ⚠️ onboarding_completed = true (optional)
  ⚠️ onboarding_step = 6 (optional)
```

### Run This Query to Check
```sql
-- File: diagnose_organization_complete.sql
-- Replace YOUR_EMAIL_HERE with your email

SELECT 
  p.email,
  p.user_role,
  p.organization_setup_pending,
  uo.organization_id,
  uo.status,
  o.name as org_name,
  CASE 
    WHEN p.organization_setup_pending = true AND uo.organization_id IS NOT NULL THEN
      '🔴 FIX: UPDATE profiles SET organization_setup_pending = false WHERE id = ''' || p.id || ''';'
    WHEN uo.organization_id IS NULL THEN
      '🔴 NO user_organizations entry!'
    WHEN uo.status != 'active' THEN
      '🔴 FIX: UPDATE user_organizations SET status = ''active'' WHERE id = ''' || uo.id || ''';'
    ELSE '✅ All good!'
  END as diagnosis
FROM profiles p
LEFT JOIN user_organizations uo ON p.id = uo.user_id
LEFT JOIN organizations o ON uo.organization_id = o.id
WHERE p.email = 'YOUR_EMAIL_HERE';
```

## 🐛 Common Problems & Quick Fixes

### Problem 1: organization_setup_pending = true
**Symptom**: Keeps redirecting to setup even though org exists

**Quick Fix**:
```sql
UPDATE profiles 
SET organization_setup_pending = false 
WHERE email = 'your@email.com';
```

### Problem 2: No user_organizations entry
**Symptom**: organizationId is always null

**Quick Fix**:
```sql
-- 1. Get your user_id
SELECT id FROM profiles WHERE email = 'your@email.com';
-- Result: abc123...

-- 2. Get your org_id  
SELECT id FROM organizations WHERE created_by = 'abc123...';
-- Result: def456...

-- 3. Create the link
INSERT INTO user_organizations (
  user_id, 
  organization_id, 
  user_role, 
  status, 
  is_primary
) VALUES (
  'abc123...',  -- your user_id
  'def456...',  -- your org_id
  'organisation',
  'active',
  true
);
```

### Problem 3: status != 'active'
**Symptom**: Has user_organizations but still redirects

**Quick Fix**:
```sql
UPDATE user_organizations 
SET status = 'active' 
WHERE user_id = (SELECT id FROM profiles WHERE email = 'your@email.com');
```

## 📊 Console Logs to Look For

### ✅ Good (No Loop):
```
[SetupOrganization] useEffect triggered { loading: false, hasChecked: false }
[SetupOrganization] Already checked, skipping  ← This prevents loop!
[RoleBasedRedirect] Path is whitelisted, no redirect
```

### ❌ Bad (Loop):
```
[SetupOrganization] Organization exists, redirecting...
[RoleBasedRedirect] No organizationId, redirecting to setup
[SetupOrganization] Organization exists, redirecting...
[RoleBasedRedirect] No organizationId, redirecting to setup
... (repeats)
```

## 🎯 Quick Test

1. **Clear cache**: Ctrl+Shift+Delete → Clear all
2. **Refresh**: F5
3. **Check console**: Should see "Already checked, skipping"
4. **Click "Organisation"**: Should go to dashboard directly
5. **Check URL**: Should stay on `/organisation/:id/dashboard`

---

**Visual Guide Complete** ✅
Use `diagnose_organization_complete.sql` to check your database!
