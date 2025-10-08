# Organization Creation Fix - Using Proper Database Structure

## Problem
The error "Could not find the 'organization_id' column of 'profiles' in the schema cache" occurred because the code was trying to use `profiles.organization_id` which doesn't exist in your database schema.

## Solution
**NO `organization_id` column needed in `profiles` table!** 

Your database already has the proper relational structure with the `user_organizations` table. This is the **correct way** to handle user-organization relationships because:

1. ✅ **Follows database normalization best practices**
2. ✅ **Supports multiple organizations per user** (if needed in the future)
3. ✅ **Avoids data redundancy and inconsistency**
4. ✅ **Cleaner separation of concerns**

## Changes Made

### 1. **New Hook: `useUserOrganizationId`**
   - File: `/src/hooks/useUserOrganizationId.tsx`
   - Fetches the user's `organization_id` from `user_organizations` table
   - Replaces the need for `profiles.organization_id`

### 2. **Updated `OrganisationSetupForm.tsx`**
   - Removed: `organization_id` update in `profiles` table
   - Added: Create entry in `user_organizations` table with:
     - `user_id`
     - `organization_id`
     - `user_role: 'organisation'`
     - `is_primary: true`
     - `status: 'active'`

### 3. **Updated `OrganisationFlowWrapper.tsx`**
   - Changed: Check `user_organizations` instead of `profiles.organization_id`
   - Uses proper relational query to find user's organization

### 4. **Updated `SetupOrganization.tsx`**
   - Uses new `useUserOrganizationId` hook
   - Checks organization membership via `user_organizations` table

### 5. **Updated `useUserRole.tsx`**
   - Now includes `organizationId` from `useUserOrganizationId` hook
   - `getBasePath()` and `hasOrganizationAccess()` use the new organizationId
   - Exports `organizationId` for components that need it

### 6. **Updated Database Migration**
   - File: `/db_migrations/20251008_fix_organization_rls_policies.sql`
   - Added comprehensive RLS policies for `organizations` table
   - Added comprehensive RLS policies for `user_organizations` table
   - Ensures proper security while allowing organization creation

## Database Structure (Current - Correct)

```sql
-- profiles table (NO organization_id column)
CREATE TABLE profiles (
  id uuid PRIMARY KEY,
  email text,
  user_role text,
  -- ... other fields
  -- NO organization_id HERE!
);

-- user_organizations table (Handles the relationship)
CREATE TABLE user_organizations (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  organization_id uuid REFERENCES organizations(id),
  user_role text,
  is_primary boolean,
  status text,
  -- ... other fields
);

-- organizations table
CREATE TABLE organizations (
  id uuid PRIMARY KEY,
  name text,
  created_by uuid,
  -- ... other fields
);
```

## Organization Creation Flow

1. **User clicks "Create Organization"**
2. **`OrganisationSetupForm` submits:**
   ```typescript
   // 1. Create organization
   const newOrganization = await createOrganisation(organizationData);
   
   // 2. Update user role in profiles
   await supabase.from('profiles').update({ user_role: 'organisation' });
   
   // 3. Create user_organizations entry (NEW - PROPER WAY)
   await supabase.from('user_organizations').insert({
     user_id: userId,
     organization_id: newOrganization.id,
     user_role: 'organisation',
     is_primary: true,
     status: 'active'
   });
   ```

3. **User is now linked to organization via `user_organizations` table**

## How to Get User's Organization ID

### Old Way (WRONG):
```typescript
// ❌ DON'T DO THIS
const orgId = userProfile?.organization_id;
```

### New Way (CORRECT):
```typescript
// ✅ DO THIS
import { useUserOrganizationId } from '@/hooks/useUserOrganizationId';

const { organizationId, loading } = useUserOrganizationId(userId);
```

Or use the updated `useUserRole` hook:
```typescript
// ✅ ALSO CORRECT
import { useUserRole } from '@/hooks/useUserRole';

const { organizationId } = useUserRole();
```

## Migration Steps

1. **Run the migration:**
   ```sql
   -- Execute: /db_migrations/20251008_fix_organization_rls_policies.sql
   ```

2. **Verify RLS policies:**
   ```sql
   -- Check organizations policies
   SELECT * FROM pg_policies WHERE tablename = 'organizations';
   
   -- Check user_organizations policies
   SELECT * FROM pg_policies WHERE tablename = 'user_organizations';
   ```

3. **Test organization creation:**
   - Go to `/setup-organization`
   - Fill in organization details
   - Click "Create Organization"
   - Should successfully create organization and link user

## Benefits of This Approach

1. **Scalability**: Users can belong to multiple organizations in the future
2. **Data Integrity**: One source of truth for user-organization relationships
3. **Flexibility**: Easy to add roles, permissions, and membership status
4. **Performance**: Proper indexing on relational table
5. **Security**: RLS policies on both tables for fine-grained access control

## Files Modified

- ✅ `/src/hooks/useUserOrganizationId.tsx` (NEW)
- ✅ `/src/hooks/useUserRole.tsx`
- ✅ `/src/components/organisation/OrganisationSetupForm.tsx`
- ✅ `/src/components/organisation/OrganisationFlowWrapper.tsx`
- ✅ `/src/pages/SetupOrganization.tsx`
- ✅ `/db_migrations/20251008_fix_organization_rls_policies.sql`

## Testing Checklist

- [ ] User can create a new organization
- [ ] User is properly linked in `user_organizations` table
- [ ] User's role is updated to 'organisation' in `profiles`
- [ ] User is redirected to organization dashboard after creation
- [ ] Organization onboarding flow works correctly
- [ ] User can access organization features
- [ ] RLS policies prevent unauthorized access

## Next Steps

If you have other components that reference `userProfile?.organization_id`, they should be updated to use:
- `useUserOrganizationId(userId)` hook, or
- `organizationId` from `useUserRole()` hook

Search for these patterns and update them:
```bash
# Find files that might need updating
grep -r "organization_id" src/ --include="*.tsx" --include="*.ts"
```
