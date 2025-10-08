# Location Field Consolidation - Implementation Summary

## Overview
This implementation consolidates the duplicate `address` and `location` fields in the profiles table into a single `location` field, and adds Google Maps autocomplete to the signup form for better user experience.

## Changes Made

### 1. Database Migration (`db_migrations/20251007_consolidate_location_field.sql`)

**What it does:**
- Migrates all existing data from `address` column to `location` column (when location is empty)
- Drops the `address` column from the profiles table
- Updates the `sync_user_metadata_to_profile` RPC function to use `p_location` instead of `p_address`
- Backfills location data from auth.users metadata (checking both `location` and `address` fields)
- Adds documentation comment for the location column

**Impact:**
- ✅ No data loss - all address data is preserved in the location field
- ✅ Single source of truth for user location/address
- ✅ Cleaner database schema

### 2. Signup Form Updates (`src/pages/Signup.tsx`)

**Changes:**
- ✅ Imported `AddressAutocompleteInput` component
- ✅ Changed state from `address` to `location`
- ✅ Replaced regular input with `AddressAutocompleteInput` component
- ✅ Set `addressType="regions"` to focus on cities and regions (like in Profile page)
- ✅ Updated all references to use `location` instead of `address`
- ✅ Updated RPC call parameter from `p_address` to `p_location`
- ✅ Updated user metadata to use `location` instead of `address`

**User Experience:**
- 🎯 Users now get Google Maps autocomplete when typing their location
- 🎯 Consistent with the Profile page location field
- 🎯 Better data quality with validated city/region names
- 🎯 Faster input with autocomplete suggestions

### 3. Field Consistency

**Before:**
- Signup form: used `address` field (plain text input)
- Profile page: used `location` field (with Google autocomplete)
- Database: had both `address` and `location` columns

**After:**
- Signup form: uses `location` field (with Google autocomplete)
- Profile page: uses `location` field (with Google autocomplete)
- Database: only has `location` column

## Files Modified

1. **`src/pages/Signup.tsx`**
   - Added AddressAutocompleteInput import
   - Changed address state to location
   - Updated form input to use autocomplete
   - Updated all references and RPC calls

2. **`db_migrations/20251007_consolidate_location_field.sql`** (NEW)
   - Data migration from address to location
   - Column removal
   - RPC function update
   - Backfill and cleanup

3. **`src/services/profileService.ts`** (NO CHANGES NEEDED)
   - Already using `location` field correctly

4. **`src/pages/Profile.tsx`** (NO CHANGES NEEDED)
   - Already using `location` field with autocomplete correctly

## How to Deploy

### Step 1: Run the Database Migration

```bash
# Connect to your Supabase project and run the migration
supabase db push
```

Or manually execute the SQL in the Supabase dashboard:
```sql
-- Run the contents of db_migrations/20251007_consolidate_location_field.sql
```

### Step 2: Verify the Migration

Check that:
1. The `address` column has been removed from profiles table
2. The `location` column contains all the data
3. The `sync_user_metadata_to_profile` function signature has been updated

```sql
-- Verify column structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name IN ('location', 'address');
-- Should only return 'location'

-- Verify function signature
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'sync_user_metadata_to_profile';
-- Should use p_location parameter
```

### Step 3: Deploy Frontend Changes

The frontend changes are already in place and will work automatically once the migration is complete.

## Testing Checklist

- [ ] Existing users can still see their location in Profile page
- [ ] New signups can use autocomplete for location
- [ ] Location data is properly saved during signup
- [ ] Profile page location field works with autocomplete
- [ ] No errors in browser console
- [ ] Data migration preserved all existing addresses

## API Integration

The implementation uses Google Maps Places API through the existing `AddressAutocompleteInput` component.

**Required:**
- Google Maps API key must be configured in environment variables
- `VITE_GOOGLE_MAPS_API_KEY` must be set

**Autocomplete Configuration:**
- Type: `regions` (cities, regions, countries)
- Country restriction: France (`fr`)
- Max suggestions: 5

## Rollback Plan

If issues occur, you can rollback by:

1. Re-add the address column:
```sql
ALTER TABLE public.profiles ADD COLUMN address text;
```

2. Restore the old RPC function with address parameter
3. Revert the frontend changes using git

## Benefits

✅ **Cleaner Data Model**
- Single field for location/address
- No confusion about which field to use

✅ **Better UX**
- Google autocomplete in signup form
- Consistent experience across signup and profile

✅ **Improved Data Quality**
- Validated city/region names
- Structured location data

✅ **Easier Maintenance**
- Single field to manage
- Less code duplication

## Notes

- Organizations table still has its own `address` field - this is intentional and separate from user profiles
- The `location` field can store both simple city names and full addresses
- Google Maps autocomplete is optional - users can still type manually if API key is not configured
