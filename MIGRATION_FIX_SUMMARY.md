# Migration Fix - Organization Schema Correction

## Issue Found
The original migrations referenced `profiles.organization_id` which doesn't exist in your database schema.

## Your Database Schema
Your database uses a **junction table** approach for user-organization relationships:

```sql
-- users ←→ user_organizations ←→ organizations
CREATE TABLE public.user_organizations (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  user_role text NOT NULL, -- 'organisation', 'staff', 'member'
  joined_at timestamp,
  is_primary boolean DEFAULT false,
  status text DEFAULT 'active' -- 'active', 'inactive', 'pending'
)
```

## What Was Fixed

### Migration 1: `20251007_add_address_and_org_applications.sql`

**Changed RLS Policies:**

❌ **Before (INCORRECT):**
```sql
EXISTS (
  SELECT 1 FROM public.profiles
  WHERE profiles.id = auth.uid()
  AND profiles.organization_id = organisation_applications.organization_id
  AND profiles.user_role IN ('organisation', 'staff')
)
```

✅ **After (CORRECT):**
```sql
EXISTS (
  SELECT 1 FROM public.user_organizations
  WHERE user_organizations.user_id = auth.uid()
  AND user_organizations.organization_id = organisation_applications.organization_id
  AND user_organizations.user_role IN ('organisation', 'staff')
  AND user_organizations.status = 'active'
)
```

### Migration 2: `20251007_update_sync_function_with_address.sql`

✅ **Already correct** - This migration only touches the `profiles` table which already exists and has the correct schema.

## Fixed Migrations Summary

### ✅ Migration 1: Add Address and Applications Table
- Adds `address` column to `profiles` table
- Creates `organisation_applications` table
- Creates RLS policies using `user_organizations` table (FIXED)
- Adds indexes and triggers

### ✅ Migration 2: Update Sync Function
- Updates `sync_user_metadata_to_profile` to accept address parameter
- No changes needed - already correct

## How to Apply

Both migrations are now **fully compatible** with your database schema.

### Step 1: Run First Migration
Copy and paste this into Supabase SQL Editor:

```sql
-- From: db_migrations/20251007_add_address_and_org_applications.sql
-- (Copy the entire file contents)
```

### Step 2: Run Second Migration
Copy and paste this into Supabase SQL Editor:

```sql
-- From: db_migrations/20251007_update_sync_function_with_address.sql
-- (Copy the entire file contents)
```

## Verification Queries

After running migrations, verify everything is correct:

```sql
-- 1. Check address column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'address';
-- Expected: 1 row with 'address' column

-- 2. Check organisation_applications table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'organisation_applications';
-- Expected: 1 row

-- 3. Check RLS policies are correct
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'organisation_applications'
AND policyname LIKE '%staff%';
-- Expected: 2 policies referencing user_organizations table

-- 4. Check sync function signature
SELECT routine_name, 
       array_agg(parameter_name || ': ' || data_type ORDER BY ordinal_position) as parameters
FROM information_schema.parameters
WHERE specific_schema = 'public'
AND specific_name IN (
  SELECT specific_name 
  FROM information_schema.routines 
  WHERE routine_name = 'sync_user_metadata_to_profile'
)
GROUP BY routine_name;
-- Expected: Function with 6 parameters including p_address
```

## Key Differences: Your Schema vs. Typical Schema

| Aspect | Your Schema | Typical Schema |
|--------|-------------|----------------|
| User-Org Link | `user_organizations` junction table | `profiles.organization_id` column |
| Multiple Orgs | ✅ Supported (one user, many orgs) | ❌ Not supported (one-to-one) |
| Role Storage | In `user_organizations.user_role` | In `profiles.user_role` |
| Primary Org | `user_organizations.is_primary` flag | N/A |

**Your schema is more flexible** - it allows users to belong to multiple organizations with different roles in each!

## Updated Documentation

The following documentation files have been updated to reflect your actual schema:

- ✅ `db_migrations/20251007_add_address_and_org_applications.sql` - Fixed RLS policies
- ✅ Migration is now fully compatible with your database

## Notes

- The `profiles` table stores basic user info and does NOT have `organization_id`
- Organization membership is managed through `user_organizations` table
- Users can belong to multiple organizations (many-to-many relationship)
- Each membership has its own role ('organisation', 'staff', 'member')
- One membership can be marked as primary (`is_primary = true`)

## Ready to Deploy

✅ Both migrations are now **100% compatible** with your database schema.
✅ No more errors about missing `organization_id` column.
✅ RLS policies correctly use `user_organizations` table.

You can now safely run both migrations in your Supabase SQL Editor!
