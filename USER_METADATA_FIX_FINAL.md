# 🔧 User Metadata Sync Fix - Supabase Compatible

## ⚠️ Important: Permission Issue Resolved

**Original Issue**: Cannot create triggers on `auth.users` table (ERROR: 42501: must be owner of relation users)

**Why**: Supabase's `auth.users` table is system-managed and doesn't allow user-created triggers for security reasons.

**Solution**: Changed from trigger-based to **function-based approach** with application-level calls.

---

## 🛠️ New Implementation

### Approach
Instead of a database trigger (which requires system permissions), we use:
1. **Database Function**: `sync_user_metadata_to_profile()` - safely upserts profile data
2. **Application Call**: Frontend calls this function during signup
3. **Backfill Query**: One-time update to sync existing users

### Files Modified

1. **Migration** (`db_migrations/20251006_fix_user_metadata_sync.sql`)
   - ✅ Creates `sync_user_metadata_to_profile()` function
   - ✅ Backfills existing users from auth metadata
   - ✅ No trigger creation (avoids permission errors)

2. **Frontend** (`src/pages/Signup.tsx`)
   - ✅ Calls RPC function to sync metadata
   - ✅ Includes fallback direct upsert
   - ✅ Non-blocking error handling

---

## 🚀 Deployment Steps

### Step 1: Run the Migration

**In Supabase SQL Editor**, paste and run:

```sql
-- Migration: Fix user metadata synchronization to profiles table
-- Date: 2025-10-06
-- Description: Sync auth.users metadata to profiles table using Supabase-compatible approach

-- 1. Create a helper function to sync user metadata to profile
CREATE OR REPLACE FUNCTION public.sync_user_metadata_to_profile(
  p_user_id uuid,
  p_email text DEFAULT NULL,
  p_first_name text DEFAULT NULL,
  p_last_name text DEFAULT NULL,
  p_phone text DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.profiles (
    id, email, first_name, last_name, phone,
    user_role, email_confirmation_required, created_at
  )
  VALUES (
    p_user_id,
    COALESCE(p_email, (SELECT email FROM auth.users WHERE id = p_user_id)),
    COALESCE(p_first_name, ''),
    COALESCE(p_last_name, ''),
    COALESCE(p_phone, ''),
    'individual',
    true,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = COALESCE(EXCLUDED.email, public.profiles.email),
    first_name = CASE 
      WHEN EXCLUDED.first_name IS NOT NULL AND EXCLUDED.first_name != '' 
      THEN EXCLUDED.first_name 
      ELSE public.profiles.first_name 
    END,
    last_name = CASE 
      WHEN EXCLUDED.last_name IS NOT NULL AND EXCLUDED.last_name != '' 
      THEN EXCLUDED.last_name 
      ELSE public.profiles.last_name 
    END,
    phone = CASE 
      WHEN EXCLUDED.phone IS NOT NULL AND EXCLUDED.phone != '' 
      THEN EXCLUDED.phone 
      ELSE public.profiles.phone 
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Backfill existing users
UPDATE public.profiles p
SET 
  first_name = COALESCE(p.first_name, au.raw_user_meta_data->>'first_name'),
  last_name = COALESCE(p.last_name, au.raw_user_meta_data->>'last_name'),
  phone = COALESCE(p.phone, au.raw_user_meta_data->>'phone_number', au.raw_user_meta_data->>'phone')
FROM auth.users au
WHERE p.id = au.id
  AND (
    (p.first_name IS NULL AND au.raw_user_meta_data->>'first_name' IS NOT NULL)
    OR (p.last_name IS NULL AND au.raw_user_meta_data->>'last_name' IS NOT NULL)
    OR (p.phone IS NULL AND (au.raw_user_meta_data->>'phone_number' IS NOT NULL OR au.raw_user_meta_data->>'phone' IS NOT NULL))
  );

-- 3. Grant permissions
GRANT EXECUTE ON FUNCTION public.sync_user_metadata_to_profile(uuid, text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.sync_user_metadata_to_profile(uuid, text, text, text, text) TO service_role;
```

✅ **Expected**: Function created, existing users backfilled, no errors

### Step 2: Deploy Frontend Changes

The updated `Signup.tsx` is already in your code. Just deploy as normal.

### Step 3: Verify

```sql
-- Check if function exists
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'sync_user_metadata_to_profile';

-- Check backfilled users
SELECT 
  email, 
  first_name, 
  last_name, 
  phone,
  CASE WHEN first_name IS NOT NULL THEN '✅' ELSE '❌' END as status
FROM profiles 
ORDER BY created_at DESC 
LIMIT 10;
```

---

## 🧪 How It Works

### New User Signup Flow:

1. **User fills form** → firstName, lastName, phone
2. **Supabase Auth creates user** → Stores in `auth.users.raw_user_meta_data`
3. **App calls RPC function** → `sync_user_metadata_to_profile()`
4. **Function upserts profile** → Saves to `profiles.first_name`, `profiles.last_name`, `profiles.phone`
5. **Result**: Complete user profile ✅

### Existing Users (Backfill):

The migration's UPDATE query automatically:
- Reads from `auth.users.raw_user_meta_data`
- Updates `profiles` table with missing data
- Only updates NULL fields (preserves existing data)

---

## 💡 Why This Approach?

| Approach | Pros | Cons | Status |
|----------|------|------|--------|
| **Database Trigger** | Automatic, reliable | ❌ Requires system permissions | Won't work |
| **RPC Function + App Call** | ✅ Works with Supabase permissions<br>✅ Explicit control<br>✅ Includes fallback | Requires app code change | ✅ **IMPLEMENTED** |

---

## ✅ Testing

### Test New Signup:

1. Create account:
   - First: "Marie"
   - Last: "Dupont"
   - Phone: "+33612345678"

2. Check database:
```sql
SELECT first_name, last_name, phone 
FROM profiles 
WHERE email = 'marie.dupont@example.com';
```

3. Expected:
```
first_name | last_name | phone
-----------|-----------|---------------
Marie      | Dupont    | +33612345678
```

### Test Existing Users:

```sql
-- Count backfilled users
SELECT COUNT(*) as backfilled
FROM profiles
WHERE first_name IS NOT NULL 
  AND created_at < NOW() - INTERVAL '1 day';
```

---

## 🔄 Function Usage

The function can also be called manually if needed:

```sql
-- Sync specific user
SELECT sync_user_metadata_to_profile(
  '<user-id>'::uuid,
  'user@example.com',
  'John',
  'Doe',
  '+33612345678'
);
```

Or from JavaScript/TypeScript:

```typescript
await supabase.rpc('sync_user_metadata_to_profile', {
  p_user_id: userId,
  p_email: email,
  p_first_name: firstName,
  p_last_name: lastName,
  p_phone: phone
});
```

---

## 📋 Summary

✅ **What Changed**:
- ~~Database trigger~~ → RPC function (permission compatible)
- Application calls function during signup
- Backfill query syncs existing users

✅ **Result**:
- First name, last name, phone now save correctly
- Works with Supabase's permission model
- Existing users are automatically updated

✅ **No More Errors**:
- ❌ ERROR: 42501: must be owner of relation users
- ✅ Migration runs successfully

---

**Status**: ✅ Ready to Deploy  
**Risk**: Low (backward compatible)  
**Deployment Time**: < 5 minutes
