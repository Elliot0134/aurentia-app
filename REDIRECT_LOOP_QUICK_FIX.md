# Quick Fix Summary - Redirect Loop

## 🔴 The Problem
Infinite redirect loop: `/setup-organization` ↔️ `/organisation/:id/dashboard`

## 🎯 Root Cause
**Race condition** between two components:
1. `SetupOrganization` checks if org exists → redirects to dashboard
2. `RoleBasedRedirect` on dashboard, organizationId still loading (null) → redirects to setup
3. **Loop!** 🔄

## ✅ The Fix

### 1. Added duplicate check prevention
Both `SetupOrganization.tsx` and `OrganisationFlowWrapper.tsx` now use:
```tsx
const hasCheckedRef = useRef(false);
// Prevents useEffect from running twice
```

### 2. Added extra condition in SetupOrganization
```tsx
// ONLY redirect if organization exists AND setup is complete
if (organizationId && userProfile.organization_setup_pending === false) {
  navigate(`/organisation/${organizationId}/dashboard`);
}
```

## 🔍 Diagnostic Query

**File**: `diagnose_organization_complete.sql`

1. Open Supabase SQL Editor
2. Replace `'YOUR_EMAIL_HERE'` with your email (7 places)
3. Run the query
4. Check **"COMBINED DIAGNOSIS"** section for the issue
5. Use **"suggested_fix"** column for the SQL fix

## 🩺 Common Issues

### Issue: organization_setup_pending = true (when it should be false)
```sql
UPDATE profiles 
SET organization_setup_pending = false 
WHERE email = 'your@email.com';
```

### Issue: No user_organizations entry
```sql
-- Get your IDs first:
SELECT id FROM profiles WHERE email = 'your@email.com';
SELECT id FROM organizations WHERE created_by = (SELECT id FROM profiles WHERE email = 'your@email.com');

-- Then insert:
INSERT INTO user_organizations (user_id, organization_id, user_role, status, is_primary)
VALUES ('<user_id>', '<org_id>', 'organisation', 'active', true);
```

### Issue: user_organizations status != 'active'
```sql
UPDATE user_organizations 
SET status = 'active' 
WHERE user_id = (SELECT id FROM profiles WHERE email = 'your@email.com');
```

## ✅ Testing Steps

1. Clear browser cache & localStorage
2. Refresh page
3. Check console logs - should see "Already checked, skipping"
4. Try navigating to `/setup-organization`
   - Should redirect to dashboard (if org exists)
5. Click sidebar "Organisation" button
   - Should go directly to dashboard

## 📝 Files Changed

- ✅ `src/pages/SetupOrganization.tsx`
- ✅ `src/components/organisation/OrganisationFlowWrapper.tsx`
- 📄 `diagnose_organization_complete.sql` (new)
- 📄 `SETUP_REDIRECT_LOOP_FIX.md` (detailed docs)

---

**Quick Fix Applied** ✅
