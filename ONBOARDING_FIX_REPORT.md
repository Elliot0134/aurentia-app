# Onboarding Fix Report - October 8, 2025

## Issues Identified

### Issue 1: RLS Policy Violation Error
**Error:** `new row violates row-level security policy for table organizations`

**Root Cause:**
- The `organizations` table had RLS policies for SELECT and UPDATE operations
- **Missing INSERT policy** - authenticated users could not create new organizations
- When clicking "Terminer l'onboarding", the system tried to create a new organization but was blocked by RLS

**Files Affected:**
- Database RLS policies on `public.organizations` table
- Creation flow in `OrganisationOnboarding.tsx`

### Issue 2: Infinite Loading State After 2 Minutes
**Symptom:** Button shows "Finalisation..." indefinitely after ~2 minutes of completing the onboarding form

**Root Cause:**
- Supabase session tokens have a limited validity period
- When users take time to complete the 6-step onboarding (2+ minutes), the session token may expire
- The `handleSubmit` function didn't check or refresh the session before making database calls
- Expired token causes silent failures, leaving the loading state stuck

**Files Affected:**
- `/src/pages/organisation/OrganisationOnboarding.tsx` - submit handler

## Solutions Implemented

### Fix 1: Added INSERT Policy for Organizations Table

**File:** `/db_migrations/20251008_fix_organization_rls_policies.sql`

Created comprehensive RLS policies:

```sql
-- Policy 1: Allow authenticated users to insert organizations
CREATE POLICY "Authenticated users can create organizations" ON public.organizations
  FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

-- Policy 2-5: SELECT, UPDATE, DELETE policies for proper access control
```

**What this fixes:**
- Users can now create organizations during onboarding
- Proper security: only the creator (created_by = auth.uid()) can insert
- Organization members and staff can view/update their organizations
- Public organizations are viewable by everyone

### Fix 2: Session Validation and Refresh in Submit Handler

**File:** `/src/pages/organisation/OrganisationOnboarding.tsx`

Added session validation before database operations:

```typescript
// Refresh the session to ensure we have a valid token
const { data: { session }, error: sessionError } = await supabase.auth.getSession();

if (sessionError || !session) {
  // Try to refresh the session
  const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
  
  if (refreshError || !refreshData.session) {
    throw new Error("Votre session a expiré. Veuillez vous reconnecter.");
  }
}
```

**What this fixes:**
- Checks session validity before attempting to create/update organization
- Automatically refreshes expired sessions
- Provides clear error message if session cannot be refreshed
- Prevents silent failures and infinite loading states

## How to Apply the Fixes

### Step 1: Apply Database Migration

Run the SQL migration in your Supabase dashboard or via CLI:

```bash
# Via Supabase CLI
supabase db push

# Or manually in Supabase SQL Editor
# Copy and execute: db_migrations/20251008_fix_organization_rls_policies.sql
```

### Step 2: Code Changes

The code changes in `OrganisationOnboarding.tsx` have already been applied.

### Step 3: Verify

1. **Test RLS Fix:**
   - Navigate to organization onboarding
   - Complete all 6 steps
   - Click "Terminer l'onboarding"
   - Should successfully create organization without RLS error

2. **Test Session Refresh:**
   - Navigate to organization onboarding
   - Wait 2-3 minutes before clicking "Terminer l'onboarding"
   - Should automatically refresh session and complete successfully
   - No infinite loading state

## Expected Behavior After Fix

### Immediate Completion (< 2 minutes)
1. User completes onboarding steps
2. Clicks "Terminer l'onboarding"
3. Session is valid, organization is created immediately
4. Success toast appears
5. Redirects to dashboard after 1.5 seconds

### Delayed Completion (> 2 minutes)
1. User takes time to complete onboarding
2. Clicks "Terminer l'onboarding"
3. **Session is refreshed automatically** (new!)
4. Organization is created with fresh token
5. Success toast appears
6. Redirects to dashboard after 1.5 seconds

### Error Cases
- **If session cannot be refreshed:** Clear error message "Votre session a expiré. Veuillez vous reconnecter."
- **If RLS still fails:** Check that migration was applied correctly
- **If validation fails:** Appropriate field validation messages

## Additional Notes

### Why Session Expiry Matters
- Supabase JWT tokens typically last 1 hour by default
- However, some operations may check token freshness more strictly
- Multi-step forms like onboarding can take several minutes
- Without refresh logic, tokens become stale mid-operation

### RLS Policy Design
The new policies follow security best practices:
- ✅ Users can only create organizations they own (`created_by = auth.uid()`)
- ✅ Only organization members can view private organizations
- ✅ Only staff/admins can update organizations
- ✅ Public organizations are visible to everyone
- ✅ Owners can delete their organizations

### Testing Checklist
- [ ] Quick onboarding completion (< 1 minute)
- [ ] Slow onboarding completion (2-3 minutes)
- [ ] Session expiry during onboarding
- [ ] Multiple organization creation attempts
- [ ] Organization update after creation
- [ ] Public organization visibility

## Rollback Plan

If issues arise, rollback by:

1. **Remove new RLS policies:**
```sql
DROP POLICY "Authenticated users can create organizations" ON public.organizations;
-- And revert to previous policies
```

2. **Revert code changes:**
```bash
git checkout HEAD~1 src/pages/organisation/OrganisationOnboarding.tsx
```

## Related Files

- `/src/pages/organisation/OrganisationOnboarding.tsx` - Main onboarding component
- `/src/services/organisationService.ts` - Organization CRUD operations
- `/src/hooks/useUserProfile.tsx` - User session management
- `/db_migrations/20251008_fix_organization_rls_policies.sql` - RLS policy fixes
- `/db_migrations/20250921_add_organization_onboarding_fields.sql` - Previous RLS policies

## Success Metrics

After deploying these fixes:
- 0 RLS policy violation errors during onboarding
- 0 infinite loading states
- 100% successful onboarding completions for valid data
- Graceful session refresh for users taking > 2 minutes
