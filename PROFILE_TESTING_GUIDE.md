# Testing Guide: Profile Fields Integration

## 🧪 Pre-Testing Setup

### 1. Run Database Migration
Execute this migration in your Supabase SQL Editor:
```sql
\i db_migrations/20251007_ensure_profile_fields.sql
```

Or copy-paste the content of `db_migrations/20251007_ensure_profile_fields.sql` directly.

### 2. Verify Environment Variables
Check your `.env` file has:
```env
VITE_GOOGLE_MAPS_API_KEY=AIzaSyDD-eg5dT7TkT9EPjVuaLlJC5NeC9OJduQ
```

### 3. Start Development Server
```bash
npm run dev
```

## ✅ Test Scenarios

### Test 1: Initial Page Load
**Steps:**
1. Navigate to `/profile` page
2. Observe loading state

**Expected:**
- ✅ Shows "Chargement de votre profil..." briefly
- ✅ Profile fields appear after loading completes
- ✅ Email is displayed (read-only)
- ✅ First name, last name, phone, location, company fields visible
- ✅ "Membre depuis" date is displayed

**Fail Conditions:**
- ❌ Infinite loading spinner
- ❌ Fields show "undefined" or empty when data exists
- ❌ Console errors

---

### Test 2: Page Refresh
**Steps:**
1. Load profile page successfully
2. Press F5 or Ctrl+R to refresh
3. Observe behavior

**Expected:**
- ✅ Shows loading state again
- ✅ Profile data reloads correctly
- ✅ No infinite loading
- ✅ All fields populated correctly

**Fail Conditions:**
- ❌ Stuck on "Loading..." forever
- ❌ Data disappears after refresh
- ❌ Different data shown after refresh

---

### Test 3: Edit First Name
**Steps:**
1. Click "Modifier" button
2. Change first name field
3. Click "Sauvegarder"

**Expected:**
- ✅ Fields become editable
- ✅ Save button shows "Sauvegarde..." during save
- ✅ Success toast notification appears
- ✅ First name updates in UI
- ✅ Edit mode exits automatically
- ✅ Data persists after page refresh

**Verify in Supabase:**
```sql
SELECT first_name FROM profiles WHERE id = 'your-user-id';
```

**Fail Conditions:**
- ❌ Changes don't save
- ❌ No toast notification
- ❌ Error in console

---

### Test 4: Edit Last Name
**Steps:**
1. Click "Modifier" button
2. Change last name field
3. Click "Sauvegarder"

**Expected:**
- ✅ Last name field is editable
- ✅ Changes save successfully
- ✅ Last name updates in UI and database

**Verify in Supabase:**
```sql
SELECT last_name FROM profiles WHERE id = 'your-user-id';
```

---

### Test 5: Edit Phone Number
**Steps:**
1. Click "Modifier" button
2. Enter phone number (e.g., "+33 6 12 34 56 78")
3. Click "Sauvegarder"

**Expected:**
- ✅ Phone number saves
- ✅ Displays correctly after save

**Verify in Supabase:**
```sql
SELECT phone FROM profiles WHERE id = 'your-user-id';
```

---

### Test 6: Location with Google Maps Autocomplete
**Steps:**
1. Click "Modifier" button
2. Click in "Localisation" field
3. Type "Paris" (or any city)
4. Wait for autocomplete suggestions
5. Select a suggestion
6. Click "Sauvegarder"

**Expected:**
- ✅ Autocomplete dropdown appears while typing
- ✅ Shows 5 or fewer suggestions
- ✅ Suggestions have icons and descriptions
- ✅ Selected location populates the field
- ✅ Location saves to database
- ✅ Displays correctly after save

**Keyboard Navigation:**
- ✅ Arrow Down: Move to next suggestion
- ✅ Arrow Up: Move to previous suggestion
- ✅ Enter: Select highlighted suggestion
- ✅ Escape: Close dropdown

**Verify in Supabase:**
```sql
SELECT location FROM profiles WHERE id = 'your-user-id';
```

**Fail Conditions:**
- ❌ No autocomplete dropdown
- ❌ Dropdown is empty
- ❌ Google Maps API key error in console
- ❌ Can't select suggestions

---

### Test 7: Edit Company Name
**Steps:**
1. Click "Modifier" button
2. Change company field
3. Click "Sauvegarder"

**Expected:**
- ✅ Company name saves
- ✅ Updates in UI and database

**Verify in Supabase:**
```sql
SELECT company FROM profiles WHERE id = 'your-user-id';
```

---

### Test 8: Cancel Edit
**Steps:**
1. Click "Modifier" button
2. Change multiple fields
3. Click "Annuler" button

**Expected:**
- ✅ All fields revert to original values
- ✅ Edit mode exits
- ✅ No data is saved

**Verify:**
- Check fields show original values
- Refresh page and confirm no changes

---

### Test 9: Edit Multiple Fields at Once
**Steps:**
1. Click "Modifier" button
2. Change first name, last name, phone, location, and company
3. Click "Sauvegarder"

**Expected:**
- ✅ All fields save successfully
- ✅ All values update in UI
- ✅ All values persist in database

**Verify in Supabase:**
```sql
SELECT first_name, last_name, phone, location, company 
FROM profiles 
WHERE id = 'your-user-id';
```

---

### Test 10: Facturation Tab Loading
**Steps:**
1. Navigate to profile page
2. Click "Facturation" tab while page is still loading
3. Observe behavior

**Expected:**
- ✅ Shows "Chargement des informations..." while loading
- ✅ Shows subscription manager after loading completes
- ✅ OR shows "Vous n'avez pas encore de projet actif" if no project

**Fail Conditions:**
- ❌ Infinite loading in Facturation tab
- ❌ Crashes or errors
- ❌ Shows subscription manager before data is loaded

---

### Test 11: Tab Navigation During Load
**Steps:**
1. Refresh profile page
2. Quickly switch between tabs before loading completes
3. Observe behavior

**Expected:**
- ✅ All tabs show loading state appropriately
- ✅ Content appears after loading completes
- ✅ No crashes or errors

---

### Test 12: Error Handling
**Steps:**
1. Open browser DevTools
2. Go to Network tab
3. Set to "Offline" mode
4. Try to save profile changes

**Expected:**
- ✅ Error toast notification appears
- ✅ Edit mode stays active
- ✅ Changes are not lost
- ✅ User can try again after going back online

---

## 🔍 Database Verification Queries

### Check Profile Data
```sql
SELECT 
  id,
  email,
  first_name,
  last_name,
  phone,
  location,
  company,
  created_at
FROM profiles 
WHERE id = 'your-user-id';
```

### Check Auth Metadata Sync
```sql
SELECT 
  id,
  email,
  raw_user_meta_data->>'first_name' as metadata_first_name,
  raw_user_meta_data->>'last_name' as metadata_last_name,
  raw_user_meta_data->>'phone' as metadata_phone,
  raw_user_meta_data->>'location' as metadata_location,
  raw_user_meta_data->>'company' as metadata_company
FROM auth.users 
WHERE id = 'your-user-id';
```

### Compare Profile and Auth Data
```sql
SELECT 
  p.first_name as profile_first_name,
  au.raw_user_meta_data->>'first_name' as auth_first_name,
  p.last_name as profile_last_name,
  au.raw_user_meta_data->>'last_name' as auth_last_name,
  p.location as profile_location,
  au.raw_user_meta_data->>'location' as auth_location
FROM profiles p
JOIN auth.users au ON p.id = au.id
WHERE p.id = 'your-user-id';
```

## 🐛 Common Issues & Solutions

### Issue: Google Maps Autocomplete Not Working
**Symptoms:** No dropdown, or "API key not configured" in console

**Solutions:**
1. Check `.env` has `VITE_GOOGLE_MAPS_API_KEY`
2. Restart dev server after adding env variable
3. Verify API key is valid in Google Cloud Console
4. Check browser console for specific errors

### Issue: Changes Don't Save
**Symptoms:** Click save, but data doesn't update

**Solutions:**
1. Check browser console for errors
2. Verify RLS policies on `profiles` table
3. Ensure user is authenticated
4. Check Supabase logs for database errors

### Issue: Infinite Loading
**Symptoms:** "Loading..." never stops

**Solutions:**
1. Check browser console for errors
2. Verify user has a row in `profiles` table
3. Check `useProject` hook is working correctly
4. Inspect network tab for failed requests

### Issue: Data Appears Empty
**Symptoms:** Fields show "Non renseigné" when data exists

**Solutions:**
1. Run migration to ensure columns exist
2. Check data in Supabase directly
3. Verify `profileService.getProfile()` returns data
4. Check field names match database columns

## 📊 Success Criteria

All tests pass when:
- ✅ Profile loads without infinite spinner
- ✅ All fields editable and saveable
- ✅ Google Maps autocomplete works for location
- ✅ Changes persist in database
- ✅ Auth metadata syncs correctly
- ✅ Error handling works gracefully
- ✅ Loading states display appropriately
- ✅ Tab navigation works during loading

## 🎉 Final Checklist

- [ ] Migration executed successfully
- [ ] Google Maps API key configured
- [ ] All 12 test scenarios pass
- [ ] Database queries return expected data
- [ ] No console errors during normal operation
- [ ] Profile data persists after refresh
- [ ] Location autocomplete working
- [ ] Loading states display correctly
- [ ] Error handling tested

---

**Status:** Ready for testing! 🚀

If all tests pass, the implementation is complete and production-ready.
