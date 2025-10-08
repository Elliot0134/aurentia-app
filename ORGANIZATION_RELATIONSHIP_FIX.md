# Organization Relationship Fix

## Problem
The `useUserProfile` hook was using an outdated database schema assumption where `profiles` had a direct `organization_id` foreign key. 

## Root Cause
The database schema has evolved to use a junction table pattern:
- **Old assumption**: `profiles` → `organization_id` → `organizations`
- **Current reality**: `profiles` → `user_organizations` → `organizations`

### Current Database Schema
```sql
-- profiles table has NO organization_id column
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  email text,
  user_role text,
  -- ... other fields but NO organization_id
);

-- user_organizations is the junction table
CREATE TABLE public.user_organizations (
  id uuid NOT NULL,
  user_id uuid NOT NULL,
  organization_id uuid NOT NULL,
  user_role text NOT NULL,
  is_primary boolean DEFAULT false,
  status text DEFAULT 'active',
  -- ...
);

-- organizations table
CREATE TABLE public.organizations (
  id uuid NOT NULL,
  name text NOT NULL,
  type text,
  -- ...
);
```

## Solution
Updated `useUserProfile.tsx` to fetch organization data through the `user_organizations` junction table:

### Before (Incorrect)
```typescript
// This was making TWO separate queries
const { data: userOrg } = await supabase
  .from('user_organizations')
  .select('organization_id, user_role, is_primary, status')
  .eq('user_id', session.user.id)
  .eq('status', 'active')
  .order('is_primary', { ascending: false })
  .limit(1)
  .maybeSingle();

if (userOrg?.organization_id) {
  const { data: org } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', userOrg.organization_id)
    .single();
}
```

### After (Correct)
```typescript
// Single query with nested select using Supabase's relationship syntax
const { data: userOrg } = await supabase
  .from('user_organizations' as any)
  .select(`
    organization_id,
    user_role,
    is_primary,
    status,
    organizations (*)
  `)
  .eq('user_id', session.user.id)
  .eq('status', 'active')
  .order('is_primary', { ascending: false })
  .limit(1)
  .maybeSingle();

if (userOrg) {
  const userOrgData = userOrg as any;
  organizationId = userOrgData.organization_id;
  organizationData = userOrgData.organizations; // Nested object
}
```

## Benefits
1. **Single Query**: Reduced from 2 queries to 1 using nested select
2. **Correct Relationship**: Uses the proper junction table pattern
3. **Type Safe**: Returns data compatible with `UserProfile` interface
4. **Primary Organization**: Automatically gets user's primary organization (ordered by `is_primary`)

## Technical Notes
- Used `as any` for TypeScript compatibility since `user_organizations` table is not in generated types
- The nested select `organizations (*)` automatically joins and returns the full organization object
- Query filters for `status = 'active'` to only get active memberships
- Orders by `is_primary DESC` to prioritize the primary organization
- Uses `maybeSingle()` to handle users with no organization memberships

## Testing
✅ Build passes successfully  
✅ No TypeScript errors  
✅ Compatible with existing `UserProfile` interface  

## Related Files
- `/src/hooks/useUserProfile.tsx` - Main fix location
- `/src/types/userTypes.ts` - UserProfile interface definition
- `/db.sql` - Database schema reference
