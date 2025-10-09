# Testing Plan: Organization Redirect Loop Fix

## Pre-Testing Setup

### 1. Apply Database Fix (if needed)
```bash
# Run this SQL script in your Supabase SQL Editor
# File: fix_organization_setup_pending.sql
```

### 2. Clear Browser Cache
- Clear localStorage
- Clear sessionStorage  
- Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)

## Test Scenarios

### Scenario 1: Existing Organization User (MAIN FIX)

**Setup:**
- User role: `organisation` or `staff`
- Has entry in `user_organizations` table
- `organization_setup_pending = false`

**Test Steps:**
1. Login as organization user
2. Navigate to `/organisation/:id/dashboard`
3. Verify: Should land on dashboard WITHOUT any redirects
4. Check browser console: No error messages
5. Navigate to different org pages (members, events, etc.)
6. Verify: All navigation works smoothly

**Expected Result:** ✅ No redirect loop, dashboard loads normally

---

### Scenario 2: New Organization Setup

**Setup:**
- User role: `individual` → will change to `organisation`
- No entry in `user_organizations` table
- No organization created yet

**Test Steps:**
1. Login as individual user
2. Navigate to `/setup-organization`
3. Fill out organization form
4. Submit form
5. Verify: Redirected to `/organisation/:id/dashboard`
6. Check database: `organization_setup_pending = false`
7. Logout and login again
8. Verify: Goes directly to org dashboard

**Expected Result:** ✅ Setup completes, proper redirect, no loops

---

### Scenario 3: Organization User Without Setup (Edge Case)

**Setup:**
- User role: `organisation`
- NO entry in `user_organizations` table
- `organization_setup_pending = true`

**Test Steps:**
1. Login as organization user (without org)
2. Should auto-redirect to `/setup-organization`
3. Complete setup
4. Verify: Redirected to dashboard
5. Check: `organization_setup_pending = false`

**Expected Result:** ✅ Redirected to setup, completes successfully

---

### Scenario 4: Loading States

**Test Steps:**
1. Login with slow network connection (Chrome DevTools → Network → Slow 3G)
2. Navigate to `/organisation/:id/dashboard`
3. Verify: See loading spinner with "Vérification des permissions..."
4. Verify: Spinner uses aurentia-pink color
5. Verify: After loading, lands on correct page

**Expected Result:** ✅ Proper loading states, no flashing/jumping

---

### Scenario 5: Different User Roles

**Test for each role:**

**Individual User:**
- Navigate to `/organisation/any-id/dashboard`
- Expected: Redirect to `/individual/dashboard`

**Member User:**
- Navigate to `/organisation/any-id/dashboard`  
- Expected: Redirect to `/individual/my-organization`

**Staff User (with org):**
- Navigate to `/organisation/:id/dashboard`
- Expected: Access granted, dashboard loads

**Super Admin:**
- Navigate to `/organisation/:id/dashboard`
- Expected: Access granted (if has org) OR redirect to setup

---

### Scenario 6: Direct URL Access

**Test Steps:**
1. Copy organization dashboard URL
2. Logout
3. Login as the organization user
4. Paste URL in browser and hit enter
5. Verify: Loads dashboard directly (no redirects)

**Expected Result:** ✅ Direct access works, no loops

---

### Scenario 7: RoleBasedRedirect Integration

**Test Steps:**
1. Login as organization user
2. Navigate to root `/`
3. Verify: Auto-redirects to `/organisation/:id/dashboard`
4. No intermediate redirects through setup

**Expected Result:** ✅ Smart redirect to correct dashboard

---

## Console Logging Verification

During testing, check browser console for these logs:

### Good Logs (Expected):
```
[useUserRole] { userRole: 'organisation', organizationId: 'xxx-xxx', loading: false }
[OrganisationRouteGuard] Access granted
[SetupOrganization] Organization exists and setup complete, redirecting to dashboard
```

### Bad Logs (Should NOT see):
```
[OrganisationRouteGuard] No organizationId, redirecting to setup (when org exists)
Multiple rapid redirects in succession
[SetupOrganization] Staying on setup page (when org already exists)
```

---

## Database Verification Queries

### Check User State:
```sql
SELECT 
  p.email,
  p.user_role,
  p.organization_setup_pending,
  uo.organization_id,
  o.name as org_name
FROM profiles p
LEFT JOIN user_organizations uo ON p.id = uo.user_id AND uo.status = 'active'
LEFT JOIN organizations o ON uo.organization_id = o.id
WHERE p.email = 'test@example.com';
```

### Find Inconsistent Data:
```sql
SELECT COUNT(*) as issues
FROM profiles p
INNER JOIN user_organizations uo ON p.id = uo.user_id AND uo.status = 'active'
WHERE p.organization_setup_pending = true;
-- Should return 0
```

---

## Performance Testing

### Loading Speed:
1. Measure time from navigation to dashboard render
2. Should be < 2 seconds on normal connection
3. Should show loading spinner for duration

### No Redundant Queries:
1. Open Network tab
2. Navigate to organization dashboard
3. Verify: Each query happens only once
4. No repeated profile/organization fetches

---

## Regression Testing

Verify these still work:

- [ ] Individual dashboard access
- [ ] Member organization view
- [ ] Super admin dashboard
- [ ] Project collaboration
- [ ] Event creation/editing
- [ ] Invitation code generation
- [ ] Profile updates
- [ ] Logout/Login cycle

---

## Sign-Off Checklist

Before marking as complete:

- [ ] No infinite redirect loops for org users
- [ ] Organization setup works for new orgs
- [ ] All user roles redirect correctly
- [ ] Loading states appear properly
- [ ] No console errors
- [ ] Database state is consistent
- [ ] Direct URL access works
- [ ] Browser back/forward buttons work
- [ ] All regression tests pass
- [ ] Documentation is complete

---

## Known Issues / Limitations

None identified after this fix.

---

## Rollback Plan

If issues arise:

1. Revert Git commits for the following files:
   - OrganisationRouteGuard.tsx
   - OrganisationFlowWrapper.tsx
   - SetupOrganization.tsx

2. Run this SQL to reset flags:
```sql
UPDATE profiles 
SET organization_setup_pending = false 
WHERE user_role IN ('organisation', 'staff');
```

3. Clear all user sessions:
```sql
-- In auth.sessions if needed
```

---

## Contact

For issues or questions about this fix, refer to:
- `ORGANIZATION_REDIRECT_LOOP_FIX.md` - Complete technical documentation
- `fix_organization_setup_pending.sql` - Database repair script
