# Organization RLS Policies Fix - October 8, 2025

## Problem Statement

The original RLS (Row Level Security) policies on the `organizations` and `user_organizations` tables were causing infinite recursion loops and preventing organization creation during onboarding.

### Root Cause

The policies were using direct `EXISTS` queries that created circular dependencies:

1. **organizations** table policies checked membership via `user_organizations`
2. **user_organizations** table policies (if they existed) might check against `organizations`
3. This created an infinite recursion loop when RLS was evaluated

### The Error

```
Could not find the 'organization_id' column of 'profiles' in the schema cache
```

This error occurred because some code was trying to reference `organization_id` in the `profiles` table, which doesn't exist. The relationship is properly maintained through the `user_organizations` junction table.

## Solution

### Key Changes

1. **Created SECURITY DEFINER Helper Functions**
   - `is_organization_member(org_id, check_user_id)` - Checks if a user is a member
   - `is_organization_admin(org_id, check_user_id)` - Checks if a user is an admin
   - These functions use `SECURITY DEFINER` to bypass RLS and prevent recursion

2. **Comprehensive RLS Policies**

   **For `organizations` table (5 policies):**
   - INSERT: Authenticated users can create organizations
   - SELECT: Public organizations viewable by all
   - SELECT: Members can view their organization
   - UPDATE: Creators and admins can update
   - DELETE: Owners can delete

   **For `user_organizations` table (8 policies):**
   - SELECT: Users view their own memberships
   - SELECT: Users view organization member lists
   - INSERT: Users insert their own membership
   - INSERT: Admins can invite new members
   - UPDATE: Users update their own membership
   - UPDATE: Admins can update memberships
   - DELETE: Users can leave organizations
   - DELETE: Admins can remove members

### Why This Works

1. **No Infinite Recursion**: Helper functions use `SECURITY DEFINER` to bypass RLS entirely
2. **Clear Separation**: Each policy has a single, well-defined purpose
3. **Proper Authorization**: Creator-based and role-based access control
4. **Onboarding Support**: New users can create organizations and memberships

## Files Included

- `20251008_fix_organization_rls_policies.sql` - Main migration
- `20251008_fix_organization_rls_policies_test.sql` - Test script
- `20251008_fix_organization_rls_policies_rollback.sql` - Rollback script
- `20251008_RLS_POLICIES_FIX_README.md` - This documentation

## How to Apply

### Step 1: Review Current State

```sql
-- Check current policies
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('organizations', 'user_organizations')
ORDER BY tablename, policyname;
```

### Step 2: Apply Migration

Run the main migration file in your Supabase SQL editor or via CLI:

```bash
psql -h <host> -U <user> -d <database> -f db_migrations/20251008_fix_organization_rls_policies.sql
```

Or in Supabase Dashboard:
1. Go to SQL Editor
2. Copy and paste the migration content
3. Run the query

### Step 3: Test

Run the test script to verify everything is working:

```bash
psql -h <host> -U <user> -d <database> -f db_migrations/20251008_fix_organization_rls_policies_test.sql
```

Expected output:
- Helper functions exist and return boolean values
- 5 policies on organizations table
- 8 policies on user_organizations table
- Both tables have RLS enabled

### Step 4: Verify in Application

1. Try creating a new organization through onboarding
2. Verify members can view their organization
3. Verify admins can update organization details
4. Verify users can view other members

## Rollback

If you need to revert the changes:

```bash
psql -h <host> -U <user> -d <database> -f db_migrations/20251008_fix_organization_rls_policies_rollback.sql
```

**⚠️ WARNING**: After rollback, tables will have NO RLS policies. Apply a new migration immediately.

## Architecture Notes

### Data Model

```
auth.users (Supabase Auth)
    ↓
profiles (1:1 with auth.users)
    ↓
user_organizations (junction table)
    ↓
organizations
```

**Important**: The `profiles` table does NOT have an `organization_id` column. Users can belong to multiple organizations through the `user_organizations` table.

### Helper Functions Flow

```
Policy Check → Helper Function (SECURITY DEFINER) → Direct Table Query (No RLS) → Boolean Result
```

This breaks the recursion cycle because:
1. Policy evaluation calls helper function
2. Helper function bypasses RLS with SECURITY DEFINER
3. Returns simple boolean, no further policy checks needed

## Troubleshooting

### Error: "cannot change name of input parameter"

This means the function already exists with different parameter names. The migration now handles this by dropping functions first.

### Error: "infinite recursion detected in policy"

This means a policy is checking conditions that trigger other RLS policies. Use SECURITY DEFINER functions to break the cycle.

### Error: "organization_id column not found in profiles"

Some code is incorrectly trying to reference `organization_id` in the `profiles` table. Update the code to use the `user_organizations` table instead:

**❌ Wrong:**
```sql
SELECT * FROM profiles WHERE organization_id = '...'
```

**✅ Correct:**
```sql
SELECT p.* FROM profiles p
JOIN user_organizations uo ON p.id = uo.user_id
WHERE uo.organization_id = '...'
```

## Testing Checklist

- [ ] Migration runs without errors
- [ ] Helper functions exist and work
- [ ] All 13 policies are created (5 + 8)
- [ ] RLS is enabled on both tables
- [ ] Users can create organizations
- [ ] Users can join organizations
- [ ] Members can view organization details
- [ ] Admins can update organizations
- [ ] Users can view member lists
- [ ] Public organizations are viewable
- [ ] Private organizations are hidden

## Related Issues

- Organization creation during onboarding
- User role management
- Organization membership
- Public organization directory

## Migration History

- **2025-10-08**: Initial RLS policies fix with helper functions
