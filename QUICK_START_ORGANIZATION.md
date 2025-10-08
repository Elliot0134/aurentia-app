# Quick Start: Organization Creation

## ✅ What Was Fixed

The error **"Could not find the 'organization_id' column of 'profiles'"** is now **RESOLVED**.

Your code now properly uses the `user_organizations` table instead of trying to add `organization_id` to `profiles`.

## 🎯 How It Works Now

### Database Structure (Clean & Proper)
```
profiles table          user_organizations table        organizations table
┌──────────────┐       ┌──────────────────────┐         ┌──────────────┐
│ id           │◄──────┤ user_id             │         │ id           │
│ email        │       │ organization_id     ├────────►│ name         │
│ user_role    │       │ user_role           │         │ created_by   │
│ ...          │       │ is_primary          │         │ ...          │
└──────────────┘       │ status              │         └──────────────┘
                       └──────────────────────┘
```

### Organization Creation Flow
```typescript
1. User fills form → OrganisationSetupForm
2. Create organization in 'organizations' table ✅
3. Update user_role in 'profiles' table ✅  
4. Create link in 'user_organizations' table ✅ (NEW!)
5. Redirect to dashboard ✅
```

## 🚀 To Deploy This Fix

### Step 1: Run the Migration
```bash
# Connect to your Supabase instance and run:
psql $DATABASE_URL -f db_migrations/20251008_fix_organization_rls_policies.sql
```

Or in Supabase Dashboard:
1. Go to SQL Editor
2. Copy content from `db_migrations/20251008_fix_organization_rls_policies.sql`
3. Run the migration

### Step 2: Test Organization Creation
1. Navigate to `/setup-organization`
2. Fill in the organization details
3. Click "Create Organization"
4. ✅ Should successfully create and redirect to dashboard

### Step 3: Verify Database
```sql
-- Check if user_organizations entry was created
SELECT * FROM user_organizations WHERE user_id = '<your-user-id>';

-- Should show:
-- user_id: <your-id>
-- organization_id: <new-org-id>
-- user_role: 'organisation'
-- is_primary: true
-- status: 'active'
```

## 📝 Code Usage Examples

### Getting User's Organization ID

**Option 1: Using useUserRole (Recommended)**
```typescript
import { useUserRole } from '@/hooks/useUserRole';

const MyComponent = () => {
  const { organizationId, loading } = useUserRole();
  
  if (loading) return <div>Loading...</div>;
  if (!organizationId) return <div>No organization</div>;
  
  return <div>Organization: {organizationId}</div>;
};
```

**Option 2: Using useUserOrganizationId**
```typescript
import { useUserOrganizationId } from '@/hooks/useUserOrganizationId';

const MyComponent = () => {
  const { organizationId, loading } = useUserOrganizationId(userId);
  
  // ... same as above
};
```

### Checking Organization Membership
```typescript
const { hasOrganizationAccess } = useUserRole();

if (hasOrganizationAccess()) {
  // User has an active organization
}
```

## 🔍 What Changed in Code

### Files Modified:
- ✅ `src/hooks/useUserOrganizationId.tsx` - NEW hook to fetch org ID
- ✅ `src/hooks/useUserRole.tsx` - Now exports `organizationId`
- ✅ `src/components/organisation/OrganisationSetupForm.tsx` - Creates user_organizations entry
- ✅ `src/components/organisation/OrganisationFlowWrapper.tsx` - Checks user_organizations
- ✅ `src/pages/SetupOrganization.tsx` - Uses new hook
- ✅ `db_migrations/20251008_fix_organization_rls_policies.sql` - RLS policies

### Key Changes:

**BEFORE (Wrong):**
```typescript
// ❌ Trying to use organization_id from profiles (doesn't exist)
await supabase
  .from('profiles')
  .update({ 
    user_role: 'organisation',
    organization_id: newOrg.id  // ❌ This column doesn't exist!
  });
```

**AFTER (Correct):**
```typescript
// ✅ Update only user_role in profiles
await supabase
  .from('profiles')
  .update({ user_role: 'organisation' });

// ✅ Create proper relationship in user_organizations
await supabase
  .from('user_organizations')
  .insert({
    user_id: userId,
    organization_id: newOrg.id,
    user_role: 'organisation',
    is_primary: true,
    status: 'active'
  });
```

## ⚠️ Important Notes

1. **No migration needed to add organization_id to profiles** - we're NOT doing that!
2. **user_organizations table already exists** - we just use it properly now
3. **RLS policies are crucial** - the migration adds them for security
4. **Backwards compatible** - existing code using user_organizations still works

## 🐛 Troubleshooting

### "Still getting organization_id error"
- Make sure you've deployed the code changes
- Clear browser cache and reload
- Check that the migration was run successfully

### "Can't create organization"
- Verify RLS policies exist: `SELECT * FROM pg_policies WHERE tablename = 'organizations';`
- Check user is authenticated: `SELECT auth.uid();`
- Look at browser console for specific error

### "Organization created but can't see dashboard"
- Check user_organizations table: `SELECT * FROM user_organizations WHERE user_id = auth.uid();`
- Verify status is 'active'
- Check browser console for navigation errors

## ✨ Summary

- **NO `organization_id` in profiles table** ✅
- **Uses proper `user_organizations` relational table** ✅
- **Follows database normalization best practices** ✅
- **Secure RLS policies in place** ✅
- **Clean, maintainable code** ✅

You're all set! 🎉
