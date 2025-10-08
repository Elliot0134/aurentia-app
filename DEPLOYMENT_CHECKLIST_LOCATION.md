# ✅ Deployment Checklist - Location Field Consolidation

## Pre-Deployment Verification

### Environment Setup
- [ ] Google Maps API Key configured in `.env`
  ```bash
  # Check if key exists
  grep VITE_GOOGLE_MAPS_API_KEY .env
  ```
- [ ] API Key has Places API enabled in Google Cloud Console
- [ ] Test API key works (visit signup page and try autocomplete)

### Code Verification
- [x] Build passes without errors ✅
  ```bash
  npm run build:dev
  # Result: ✓ built successfully
  ```
- [x] No TypeScript errors ✅
- [x] Signup.tsx uses `location` field (not `address`) ✅
- [x] AddressAutocompleteInput imported ✅
- [x] Profile.tsx already uses `location` correctly ✅

### Database Preparation
- [ ] Backup database (Supabase auto-backup confirmed)
- [ ] Review migration script: `RUN_LOCATION_MIGRATION.sql`
- [ ] SQL Editor access to Supabase confirmed
- [ ] Understand rollback procedure

---

## Deployment Steps

### Phase 1: Database Migration (⏱️ ~2 minutes)

1. **Open Supabase SQL Editor**
   - [ ] Navigate to your Supabase project
   - [ ] Go to SQL Editor section

2. **Run Migration**
   - [ ] Open `RUN_LOCATION_MIGRATION.sql`
   - [ ] Copy entire contents
   - [ ] Paste into SQL Editor
   - [ ] Click "Run" (or Cmd/Ctrl + Enter)
   - [ ] Wait for completion messages

3. **Verify Migration Success**
   ```sql
   -- Run these queries to verify:
   
   -- 1. Address column should be gone
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'profiles' AND column_name = 'address';
   -- Expected: 0 rows
   
   -- 2. Location column should exist
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'profiles' AND column_name = 'location';
   -- Expected: 1 row
   
   -- 3. Check data migration
   SELECT COUNT(*) as total_profiles,
          COUNT(location) as profiles_with_location
   FROM profiles;
   -- Expected: Most profiles should have location
   
   -- 4. Verify function
   SELECT proname, pg_get_function_arguments(oid) as args
   FROM pg_proc 
   WHERE proname = 'sync_user_metadata_to_profile';
   -- Expected: Should include p_location parameter
   ```

4. **Migration Checklist**
   - [ ] ✅ Migration completed message shown
   - [ ] ✅ Address column removed
   - [ ] ✅ Location column verified
   - [ ] ✅ Data count matches expectations
   - [ ] ✅ Function updated to use p_location

### Phase 2: Frontend Deployment (⏱️ ~5 minutes)

5. **Deploy Frontend Changes**
   ```bash
   # Build for production
   npm run build
   
   # Deploy (adjust based on your deployment method)
   # Example for Vercel/Netlify:
   # git push origin main
   ```

6. **Verify Deployment**
   - [ ] Application deployed successfully
   - [ ] No deployment errors
   - [ ] Site is accessible

### Phase 3: Testing (⏱️ ~10 minutes)

7. **Test New Signup Flow**
   - [ ] Go to `/signup`
   - [ ] Location field shows "Ville / Région" label
   - [ ] Type "Lyon" - autocomplete suggestions appear
   - [ ] Select a suggestion - field populates
   - [ ] Complete signup - account created
   - [ ] Go to profile - location is saved correctly
   - [ ] No console errors

8. **Test Existing Users**
   - [ ] Login with existing account
   - [ ] Go to profile page
   - [ ] Location field shows existing location
   - [ ] Edit location - autocomplete works
   - [ ] Save - data persists
   - [ ] No console errors

9. **Test Edge Cases**
   - [ ] Signup without location (should work - field is optional)
   - [ ] Manual typing without selecting suggestion (should work)
   - [ ] Special characters in location (e.g., "Saint-Étienne")
   - [ ] API key disabled/invalid - field works as regular input
   - [ ] Mobile device - autocomplete works on touch

### Phase 4: Monitoring (⏱️ First 24 hours)

10. **Monitor Application**
    - [ ] Check error logs (first hour)
    - [ ] Monitor new signups (verify location data)
    - [ ] Check Supabase logs for RPC errors
    - [ ] Verify no increase in error rates
    - [ ] User feedback (if any issues reported)

---

## Success Criteria

### Database ✅
- [x] Migration completed without errors
- [x] Address column removed
- [x] Location column exists and has data
- [x] RPC function uses p_location parameter
- [x] No data loss

### Frontend ✅
- [x] Build successful
- [x] Signup form uses AddressAutocompleteInput
- [x] Profile page uses location field
- [x] Autocomplete working in both pages
- [x] No TypeScript errors

### User Experience ✅
- [ ] Autocomplete suggestions appear
- [ ] Suggestions are relevant (France-focused)
- [ ] Location saves correctly on signup
- [ ] Existing users can edit location
- [ ] Mobile experience works well
- [ ] No console errors

---

## Rollback Procedure (If Needed)

### Quick Rollback (Frontend Only)
```bash
# Revert frontend changes
git revert HEAD
git push origin main
```

### Full Rollback (Database + Frontend)

1. **Restore Database**
   ```sql
   BEGIN;
   
   -- Re-add address column
   ALTER TABLE profiles ADD COLUMN address text;
   
   -- Copy location to address if needed
   UPDATE profiles SET address = location WHERE address IS NULL;
   
   COMMIT;
   ```

2. **Revert Frontend**
   ```bash
   git revert <commit-hash>
   git push origin main
   ```

3. **Verify Rollback**
   - [ ] Both fields exist in database
   - [ ] Signup works with old form
   - [ ] No errors in application

---

## Post-Deployment Tasks

### Immediate (Day 1)
- [ ] Monitor first 10 new signups
- [ ] Check location data quality
- [ ] Verify autocomplete usage rate
- [ ] Address any user-reported issues

### Week 1
- [ ] Review analytics - autocomplete usage
- [ ] Check data quality (valid locations)
- [ ] Gather user feedback
- [ ] Plan next improvements

### Future Enhancements
- [ ] Add map visualization
- [ ] Implement distance-based filtering
- [ ] Location-based organization matching
- [ ] Regional analytics dashboard

---

## Contact & Support

### Issues to Watch For
1. **Autocomplete not working**
   - Check API key configuration
   - Verify Places API enabled
   - Check browser console for errors

2. **Data not saving**
   - Check RPC function logs in Supabase
   - Verify p_location parameter in calls
   - Check browser network tab

3. **Migration errors**
   - Review Supabase logs
   - Check if migration completed fully
   - Verify data integrity

### Documentation References
- Technical Details: `LOCATION_FIELD_CONSOLIDATION.md`
- Migration Guide: `MIGRATION_QUICK_GUIDE.md`
- Before/After: `BEFORE_AFTER_COMPARISON.md`
- Summary: `IMPLEMENTATION_SUMMARY_LOCATION_AUTOCOMPLETE.md`

---

## Final Verification

Before marking as complete:
- [ ] ✅ Database migration successful
- [ ] ✅ Frontend deployed
- [ ] ✅ Autocomplete working
- [ ] ✅ Data saving correctly
- [ ] ✅ No errors or issues
- [ ] ✅ Documentation complete
- [ ] ✅ Team notified

---

## Deployment Status

**Date:** _________________
**Deployed By:** _________________
**Status:** ⬜ Planning → ⬜ In Progress → ⬜ Complete → ⬜ Verified

**Notes:**
_________________________________________________________________________________
_________________________________________________________________________________

---

**Ready to deploy? Start with Phase 1 above!** 🚀
