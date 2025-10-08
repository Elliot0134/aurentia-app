# Fix: User Metadata Not Syncing to Profiles Table

## 🐛 Problem Identified

**Issue**: When users sign up, their first name, last name, and phone number are saved to `auth.users.raw_user_meta_data` but NOT to the `profiles` table columns (`first_name`, `last_name`, `phone`).

### Root Cause
1. **No database trigger** to automatically sync metadata from `auth.users` to `profiles` table
2. **Frontend signup flow** saves to auth metadata but doesn't explicitly update profiles table
3. This causes profile data to be incomplete, affecting:
   - User profile displays
   - Email templates (can't use first name)
   - Organization member lists
   - Any feature relying on user names from the profiles table

## ✅ Solution Implemented

### 1. Database Trigger (Migration: `20251006_fix_user_metadata_sync.sql`)

Created a **trigger function** that automatically:
- ✅ Creates/updates profile record when a user signs up
- ✅ Syncs `first_name`, `last_name`, and `phone` from auth metadata
- ✅ Handles both `phone_number` and `phone` metadata keys
- ✅ Uses `UPSERT` to handle existing profiles
- ✅ Backfills existing users with missing data

**Trigger Details:**
```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### 2. Frontend Fallback (Updated `Signup.tsx`)

Added explicit profile creation/update as a **safety net**:
- ✅ Immediately after user creation, upsert profile with metadata
- ✅ Ensures data is saved even if trigger fails
- ✅ Logs any errors for debugging
- ✅ Doesn't fail signup if profile update fails

### 3. Verification Tools

Created `verify_user_metadata.sql` to:
- ✅ Check users with missing profile data
- ✅ Count affected users
- ✅ Verify trigger installation
- ✅ Identify data sync issues

## 📋 How to Deploy

### Step 1: Run the Migration
```bash
# Connect to Supabase and run:
psql <your-database-url> -f db_migrations/20251006_fix_user_metadata_sync.sql
```

Or via Supabase Dashboard:
1. Go to SQL Editor
2. Copy content of `db_migrations/20251006_fix_user_metadata_sync.sql`
3. Run the migration

### Step 2: Verify Installation
```bash
# Run verification script
psql <your-database-url> -f verify_user_metadata.sql
```

Expected output:
- ✅ Trigger `on_auth_user_created` exists
- ✅ Function `handle_new_user` exists
- ✅ Number of backfilled users shown

### Step 3: Test New Signups

1. Create a new test account with:
   - First name: "Test"
   - Last name: "User"
   - Phone: "+33612345678"

2. Check the profiles table:
```sql
SELECT id, email, first_name, last_name, phone 
FROM profiles 
WHERE email = 'test@example.com';
```

Expected result:
```
id      | email              | first_name | last_name | phone
--------|--------------------|-----------|-----------|--------------
uuid... | test@example.com   | Test      | User      | +33612345678
```

## 🔍 Verification Queries

### Check specific user metadata sync
```sql
SELECT 
    au.email,
    au.raw_user_meta_data->>'first_name' as auth_first_name,
    p.first_name as profile_first_name,
    au.raw_user_meta_data->>'last_name' as auth_last_name,
    p.last_name as profile_last_name
FROM auth.users au
JOIN profiles p ON au.id = p.id
WHERE au.email = 'user@example.com';
```

### Count users with complete profiles
```sql
SELECT 
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE first_name IS NOT NULL) as has_first_name,
    COUNT(*) FILTER (WHERE last_name IS NOT NULL) as has_last_name,
    COUNT(*) FILTER (WHERE phone IS NOT NULL) as has_phone
FROM profiles;
```

## 🚀 Benefits

1. **Automatic Sync**: All future signups will have complete profile data
2. **Backfilled Data**: Existing users' metadata is now synced
3. **Dual Safety**: Both database trigger + frontend ensure data is saved
4. **Better UX**: User names now appear correctly throughout the app
5. **Email Personalization**: Can now use first names in emails

## 📝 Clean Architecture Principles Applied

✅ **Separation of Concerns**: Database handles data integrity via triggers
✅ **Defensive Programming**: Frontend fallback ensures data is saved
✅ **Idempotent Operations**: UPSERT allows safe re-runs
✅ **Comprehensive Logging**: All operations are logged for debugging
✅ **Graceful Degradation**: Signup doesn't fail if profile update fails

## 🔄 Rollback (If Needed)

If you need to rollback:

```sql
-- Remove trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Remove function
DROP FUNCTION IF EXISTS public.handle_new_user();
```

Note: This won't remove already synced data, only prevents future auto-sync.

## 📊 Impact Analysis

**Before Fix:**
- ❌ User names missing from profiles table
- ❌ Profile displays show empty names
- ❌ Organization member lists incomplete
- ❌ Email templates can't personalize

**After Fix:**
- ✅ Complete user profiles with names and phone
- ✅ All UI components show correct user info
- ✅ Emails can be personalized with first names
- ✅ Better user experience overall

## 🔗 Related Files

- Migration: `db_migrations/20251006_fix_user_metadata_sync.sql`
- Frontend: `src/pages/Signup.tsx` (lines 142-161)
- Verification: `verify_user_metadata.sql`
- Database Schema: `db.sql` (profiles table, lines 760-794)

## ✨ Testing Checklist

- [ ] Run migration successfully
- [ ] Verify trigger exists
- [ ] Test new signup with first/last name
- [ ] Check profile table has complete data
- [ ] Verify existing users are backfilled
- [ ] Test profile display shows names correctly
- [ ] Confirm email templates use first names
- [ ] Test Google OAuth signup
- [ ] Verify organization member names appear

## 🆘 Troubleshooting

**Issue**: Trigger doesn't fire
```sql
-- Check trigger status
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
```

**Issue**: Function errors
```sql
-- Check function definition
\df+ public.handle_new_user
```

**Issue**: Data not syncing
```sql
-- Manually sync a specific user
UPDATE profiles p
SET 
  first_name = au.raw_user_meta_data->>'first_name',
  last_name = au.raw_user_meta_data->>'last_name',
  phone = au.raw_user_meta_data->>'phone_number'
FROM auth.users au
WHERE p.id = au.id AND au.id = '<user_id>';
```

---

**Author**: GitHub Copilot  
**Date**: October 6, 2025  
**Status**: ✅ Ready for Deployment
