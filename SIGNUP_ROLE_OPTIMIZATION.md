# Signup Role Assignment Optimization

## Summary
Optimized the signup flow to set the correct `user_role` from the beginning, eliminating unnecessary database updates and potential race conditions.

## Problem Identified
The previous implementation had a suboptimal flow:
1. `sync_user_metadata_to_profile` created profile with hardcoded `user_role = 'individual'`
2. Then a second UPDATE query changed the role to `'organisation'` if needed
3. The fallback upsert also hardcoded `'individual'`

This caused:
- **2 database writes instead of 1** (inefficient)
- **Potential race condition** if queries executed out of order
- **Incorrect data** if the second UPDATE failed

## Solution Implemented

### 1. Updated Database Function (`20251008_fix_sync_function_role_param.sql`)
Added optional `p_user_role` parameter to `sync_user_metadata_to_profile`:
```sql
CREATE OR REPLACE FUNCTION public.sync_user_metadata_to_profile(
  p_user_id uuid,
  p_email text DEFAULT NULL,
  p_first_name text DEFAULT NULL,
  p_last_name text DEFAULT NULL,
  p_phone text DEFAULT NULL,
  p_location text DEFAULT NULL,
  p_user_role text DEFAULT 'individual'  -- NEW parameter
)
```

- **Defaults to 'individual'** for backward compatibility
- **Sets role correctly on INSERT**
- **Updates role on CONFLICT** if a non-default role is provided

### 2. Updated Signup Flow (`Signup.tsx`)

**Before**:
```typescript
// Step 1: Sync with hardcoded 'individual' role
rpc('sync_user_metadata_to_profile', { ... })

// Step 2: Update role to 'organisation' if needed
supabase.from('profiles').update({ 
  user_role: 'organisation',
  organization_setup_pending: true 
})
```

**After**:
```typescript
// Determine correct role upfront
const initialUserRole = (invitationCode && codeValidation?.valid) 
  ? codeValidation.role 
  : (selectedRole || 'individual');

// Step 1: Sync with CORRECT role from the start
rpc('sync_user_metadata_to_profile', { 
  ...
  p_user_role: initialUserRole  // ✅ Role set correctly immediately
})

// Step 2: Only set organization_setup_pending flag if needed
if (selectedRole === 'organisation') {
  supabase.from('profiles').update({ 
    organization_setup_pending: true  // Only the flag, role already set
  })
}
```

## Benefits

✅ **Single database write** for role assignment (down from 2)  
✅ **No race conditions** - role is set correctly from the start  
✅ **Consistent behavior** - fallback upsert also uses correct role  
✅ **Better logging** - clearer console output showing which role was set  
✅ **Backward compatible** - existing code without role parameter still works  

## Migration Order

Run migrations in this order:
1. `20251008_add_organization_setup_pending.sql` - Adds the flag column
2. `20251008_fix_sync_function_role_param.sql` - Updates the sync function

## Testing Verification

### Test Case 1: Individual User Signup
1. Select "Entrepreneur" role
2. Complete signup
3. **Verify**: `user_role = 'individual'` (single write)

### Test Case 2: Organization User with Invitation
1. Select "Structure d'accompagnement"
2. Enter valid invitation code
3. Complete signup
4. **Verify**: `user_role` = role from invitation (e.g., 'organisation', 'staff', 'member')

### Test Case 3: Organization User WITHOUT Invitation
1. Select "Structure d'accompagnement"
2. Skip invitation code
3. Complete signup
4. **Verify**: 
   - `user_role = 'organisation'` ✅
   - `organization_setup_pending = true` ✅
   - Only 2 DB writes total (sync + flag update)

## Code Quality Improvements

- **Removed redundant code** that tried to update an already-set role
- **Clearer intent** - role determination happens upfront
- **Better separation of concerns** - role setting vs. flag setting
- **More maintainable** - easier to understand the flow

---

**Date**: October 8, 2025  
**Status**: ✅ Complete and Optimized
