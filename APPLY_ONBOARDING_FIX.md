# Quick Fix Guide - Onboarding Issues

## 🚨 Issues Fixed

1. **RLS Policy Error**: "new row violates row-level security policy for table organizations"
2. **Infinite Loading**: Button stuck on "Finalisation..." after 2+ minutes

## 📋 Steps to Apply the Fix

### Step 1: Apply Database Migration

Open your **Supabase Dashboard** → **SQL Editor** and run this migration:

```sql
-- Copy and paste the entire content of:
-- db_migrations/20251008_fix_organization_rls_policies.sql
```

Or copy this directly:

1. Go to https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new
2. Copy the content from `db_migrations/20251008_fix_organization_rls_policies.sql`
3. Paste and click **Run**

### Step 2: Verify Code Changes

The code fix in `OrganisationOnboarding.tsx` has already been applied. It adds:
- Session validation before database operations
- Automatic session refresh for expired tokens
- Better error handling

### Step 3: Test the Fix

1. **Test Case 1: Quick completion** (< 1 minute)
   - Navigate to organization onboarding
   - Fill out all 6 steps quickly
   - Click "Terminer l'onboarding"
   - ✅ Should create organization successfully

2. **Test Case 2: Delayed completion** (2-3 minutes)
   - Navigate to organization onboarding
   - Take your time filling out the steps (wait 2+ minutes)
   - Click "Terminer l'onboarding"
   - ✅ Session should auto-refresh and complete successfully
   - ✅ No infinite loading state

## 🔍 What Was Fixed

### Database (RLS Policies)
- **Added INSERT policy** - Users can now create organizations
- **Improved SELECT policies** - Proper access control for viewing organizations
- **Updated UPDATE policies** - Only creators/staff can modify organizations
- **Added DELETE policy** - Only creators can delete organizations

### Code (Session Management)
- **Session validation** - Checks token validity before submission
- **Automatic refresh** - Refreshes expired sessions automatically
- **Clear error messages** - User-friendly error when session can't be refreshed

## ✅ Success Indicators

After applying the fix, you should see:
- ✅ No RLS policy violation errors
- ✅ No infinite loading states
- ✅ Successful organization creation
- ✅ Proper redirect to dashboard after completion
- ✅ Success toast message appears

## 🔄 If Issues Persist

1. **Check migration was applied**:
   - Go to Supabase Dashboard → Database → Policies
   - Verify "Authenticated users can create organizations" policy exists

2. **Check browser console** for any errors

3. **Clear browser cache** and try again

4. **Verify session** is valid (not logged out during process)

## 📝 Files Modified

- ✅ `db_migrations/20251008_fix_organization_rls_policies.sql` - New RLS policies
- ✅ `src/pages/organisation/OrganisationOnboarding.tsx` - Session refresh logic
- 📄 `ONBOARDING_FIX_REPORT.md` - Detailed technical report

## 🎯 Expected Flow After Fix

1. User completes 6-step onboarding
2. Clicks "Terminer l'onboarding" button
3. System checks session validity
4. If expired → Auto-refreshes session
5. Creates organization with fresh token
6. Shows success toast
7. Redirects to organization dashboard

---

**Last Updated**: October 8, 2025
**Status**: Ready to apply
