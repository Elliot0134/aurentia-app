# 🚀 Quick Migration Guide - Location Field Consolidation

## What This Migration Does

This migration consolidates the duplicate `address` and `location` fields in the profiles table into a single `location` field and adds Google Maps autocomplete to the signup form.

## ✅ Pre-Migration Checklist

- [ ] Backup your database (Supabase does this automatically, but verify)
- [ ] Ensure you have access to Supabase SQL Editor
- [ ] Verify Google Maps API key is configured (`VITE_GOOGLE_MAPS_API_KEY` in `.env`)

## 📋 Migration Steps

### Option 1: Using Supabase SQL Editor (Recommended)

1. **Open Supabase Dashboard**
   - Go to your Supabase project
   - Navigate to SQL Editor

2. **Run the Migration**
   - Open the file: `RUN_LOCATION_MIGRATION.sql`
   - Copy the entire contents
   - Paste into Supabase SQL Editor
   - Click "Run" or press `Cmd/Ctrl + Enter`

3. **Verify Success**
   - You should see notices indicating:
     - Number of rows migrated
     - Column dropped
     - Function updated
     - Profiles backfilled
     - ✅ Migration completed successfully!

### Option 2: Using psql (Alternative)

```bash
# Connect to your Supabase database
psql "your-supabase-connection-string"

# Run the migration file
\i RUN_LOCATION_MIGRATION.sql
```

## 🔍 Verification Queries

After running the migration, verify the changes:

```sql
-- 1. Check that address column is gone and location exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name IN ('location', 'address');
-- Expected: Only 'location' should be returned

-- 2. Check how many profiles have location data
SELECT COUNT(*) as profiles_with_location 
FROM public.profiles 
WHERE location IS NOT NULL AND location != '';

-- 3. Verify the function signature
SELECT proname, pg_get_function_arguments(oid) as arguments
FROM pg_proc 
WHERE proname = 'sync_user_metadata_to_profile';
-- Expected: Should include p_location parameter, not p_address
```

## 📱 Testing the Frontend

1. **Test Signup Form**
   - Go to `/signup`
   - Enter a city/region in the location field
   - Verify autocomplete suggestions appear
   - Complete signup and check profile

2. **Test Profile Page**
   - Go to `/profile` (or `/individual/profile`)
   - Edit location field
   - Verify autocomplete works
   - Save and verify data persists

3. **Test Existing Users**
   - Login with existing account
   - Check that location data is still visible in profile
   - Verify you can edit and save location

## 🔄 Rollback (If Needed)

If something goes wrong, you can rollback:

```sql
BEGIN;

-- Re-add the address column
ALTER TABLE public.profiles ADD COLUMN address text;

-- Restore old function signature (optional, depends on your needs)
-- Note: You'll need the old function definition from the previous migration

COMMIT;
```

Then revert the frontend changes:
```bash
git checkout HEAD -- src/pages/Signup.tsx
```

## 📊 Expected Results

**Before Migration:**
- profiles table: has both `address` and `location` columns
- signup form: uses plain text input for address
- Different fields used in signup vs profile

**After Migration:**
- profiles table: only has `location` column
- signup form: uses Google autocomplete for location
- Consistent field usage everywhere

## 🐛 Troubleshooting

### Issue: Migration fails with "column address does not exist"
**Solution:** The column may have already been removed. This is safe to ignore.

### Issue: Function already exists error
**Solution:** The migration includes `DROP FUNCTION IF EXISTS`. If you still get errors, manually drop it first:
```sql
DROP FUNCTION IF EXISTS public.sync_user_metadata_to_profile(uuid, text, text, text, text, text);
```

### Issue: Autocomplete not working in frontend
**Solution:** 
1. Check `.env` has `VITE_GOOGLE_MAPS_API_KEY` set
2. Verify the API key has Places API enabled in Google Cloud Console
3. Check browser console for errors

### Issue: Lost data during migration
**Solution:** The migration copies data before dropping. If you need to recover:
1. Check your Supabase backup
2. The old address data should be in the location field
3. If needed, contact support for point-in-time recovery

## ✨ What's Changed in the Code

### Files Modified:
1. `src/pages/Signup.tsx`
   - Added AddressAutocompleteInput
   - Changed from `address` to `location`
   - Updated RPC calls

2. `db_migrations/20251007_consolidate_location_field.sql`
   - New migration file

3. `RUN_LOCATION_MIGRATION.sql`
   - Migration script (this guide)

### Files Already Correct (No Changes):
- `src/pages/Profile.tsx` - Already using location with autocomplete
- `src/services/profileService.ts` - Already using location field
- Organizations table - Has its own separate address field

## 📞 Support

If you encounter issues:
1. Check the verification queries above
2. Review the browser console for errors
3. Check Supabase logs for RPC function errors
4. Refer to `LOCATION_FIELD_CONSOLIDATION.md` for detailed implementation notes

## ✅ Success Criteria

Migration is successful when:
- [x] No `address` column in profiles table
- [x] All existing address data is in `location` column
- [x] `sync_user_metadata_to_profile` uses `p_location` parameter
- [x] Signup form shows autocomplete suggestions
- [x] Profile page location editing works with autocomplete
- [x] No console errors
- [x] New signups save location correctly

---

**Ready to migrate? Open `RUN_LOCATION_MIGRATION.sql` and follow Option 1 above!** 🎉
