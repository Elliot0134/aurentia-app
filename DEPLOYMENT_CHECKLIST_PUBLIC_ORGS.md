# Deployment Checklist - Public Organizations Feature

## Pre-Deployment Checklist

### 1. Database Migrations ⚠️ REQUIRED
Run these SQL scripts in your Supabase SQL Editor:

- [ ] **Migration 1:** `db_migrations/20251007_add_address_and_org_applications.sql`
  - Adds `address` column to `profiles` table
  - Creates `organisation_applications` table
  - Sets up RLS policies
  - Creates indexes for performance

- [ ] **Migration 2:** `db_migrations/20251007_update_sync_function_with_address.sql`
  - Updates `sync_user_metadata_to_profile` function to include address parameter
  - Backfills existing user addresses from metadata

### 2. Code Review
- [ ] Review `src/components/PublicOrganizationsModal.tsx`
- [ ] Review `src/components/OrganizationSetupGuideModal.tsx`
- [ ] Review changes to `src/pages/Signup.tsx`
- [ ] Review changes to `src/components/RoleBasedSidebar.tsx`
- [ ] Review changes to `src/types/userTypes.ts`

### 3. Environment Check
- [ ] Verify Supabase connection is working
- [ ] Check that organizations table has `is_public` column
- [ ] Verify at least one organization has `is_public = true` and `onboarding_completed = true`

### 4. Build & Test
- [ ] Run `npm install` (if needed)
- [ ] Run `npm run build` to ensure no build errors
- [ ] Test locally with `npm run dev`

## Post-Deployment Testing

### Test Scenario 1: Individual User Flow
- [ ] Create new account as "Individual"
- [ ] Fill in address field during signup
- [ ] Confirm email
- [ ] Login to dashboard
- [ ] Verify "Rejoindre une organisation" button appears in sidebar
- [ ] Click button - modal should open
- [ ] Verify public organizations are displayed
- [ ] Test search functionality
- [ ] If address was provided, verify proximity filter checkbox appears
- [ ] Test proximity filter with distance slider
- [ ] Click "Postuler" on an organization
- [ ] Verify toast notification appears
- [ ] Check database - verify application record was created

### Test Scenario 2: Organization Role User Flow
- [ ] Create new account as "Structure d'accompagnement"
- [ ] Fill in address field during signup
- [ ] Confirm email
- [ ] Login for first time
- [ ] Verify "Organization Setup Guide" modal appears
- [ ] Test "Plus tard" button - modal should dismiss and not appear again
- [ ] Logout and login again - verify modal doesn't reappear
- [ ] Create another org account to test "Créer mon organisation" button
- [ ] Verify navigation to `/organisation/onboarding`

### Test Scenario 3: Duplicate Prevention
- [ ] As a user who already applied to an organization
- [ ] Try to apply again to the same organization
- [ ] Verify toast shows "Candidature déjà envoyée"
- [ ] Verify no duplicate record in database

### Test Scenario 4: Mobile Responsiveness
- [ ] Test on mobile viewport (< 768px)
- [ ] Verify mobile navbar shows "Rejoindre une organisation" button
- [ ] Open modal on mobile
- [ ] Verify modal is responsive and scrollable
- [ ] Test all modal features on mobile

## Database Verification Queries

### Check Address Field
```sql
-- Verify address column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'address';

-- Check users with addresses
SELECT id, first_name, last_name, address, created_at
FROM profiles
WHERE address IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;
```

### Check Applications Table
```sql
-- Verify table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'organisation_applications';

-- View all applications
SELECT 
  oa.id,
  oa.status,
  p.first_name || ' ' || p.last_name as applicant,
  o.name as organization,
  oa.created_at
FROM organisation_applications oa
JOIN profiles p ON p.id = oa.user_id
JOIN organizations o ON o.id = oa.organization_id
ORDER BY oa.created_at DESC;
```

### Check Public Organizations
```sql
-- List all public organizations that should appear in modal
SELECT 
  id,
  name,
  address,
  type,
  is_public,
  onboarding_completed,
  created_at
FROM organizations
WHERE is_public = true 
AND onboarding_completed = true
ORDER BY name;

-- If no results, create a test public organization:
UPDATE organizations
SET is_public = true, onboarding_completed = true
WHERE id = 'YOUR_ORG_ID';
```

### Check RLS Policies
```sql
-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'organisation_applications';

-- View policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'organisation_applications';
```

### Check Sync Function
```sql
-- Verify function exists with correct signature
SELECT 
  routine_name,
  routine_type,
  specific_name,
  data_type
FROM information_schema.routines
WHERE routine_name = 'sync_user_metadata_to_profile'
AND routine_schema = 'public';

-- Test the function (replace with real user_id)
SELECT sync_user_metadata_to_profile(
  'YOUR_USER_ID'::uuid,
  'test@example.com',
  'Test',
  'User',
  '1234567890',
  '123 Test Street, City'
);
```

## Rollback Plan

If you need to rollback:

### 1. Remove Address Column (Optional)
```sql
ALTER TABLE public.profiles DROP COLUMN IF EXISTS address;
DROP INDEX IF EXISTS idx_profiles_address;
```

### 2. Remove Applications Table
```sql
DROP TABLE IF EXISTS public.organisation_applications CASCADE;
DROP FUNCTION IF EXISTS update_organisation_applications_updated_at();
```

### 3. Restore Old Sync Function
```sql
-- Restore function without address parameter
-- (Use the version from db_migrations/20251006_fix_user_metadata_sync.sql)
```

### 4. Rollback Code
```bash
git revert <commit_hash>
npm run build
# Deploy previous version
```

## Performance Considerations

### Indexes
- [ ] `idx_profiles_address` - For address searches
- [ ] `idx_org_applications_user_id` - For user application queries
- [ ] `idx_org_applications_org_id` - For organization application queries
- [ ] `idx_org_applications_status` - For filtering by status

### Monitoring
Monitor these queries for performance:
- Fetching public organizations (with filters)
- Creating applications
- Checking for duplicate applications

## Security Checklist

- [ ] RLS policies are enabled on `organisation_applications`
- [ ] Users can only view their own applications
- [ ] Users cannot approve their own applications
- [ ] Organization staff can only view/update applications to their org
- [ ] SQL injection prevention (using parameterized queries)
- [ ] XSS prevention (React escapes by default)

## Documentation Updated

- [ ] `PUBLIC_ORGANIZATIONS_FEATURE_GUIDE.md` - Complete guide
- [ ] `PUBLIC_ORGANIZATIONS_QUICK_SUMMARY.md` - Quick reference
- [ ] `PUBLIC_ORGANIZATIONS_VISUAL_FLOW.md` - Flow diagrams
- [ ] `db.sql` - Updated schema documentation

## Known Limitations (Future Enhancements)

⚠️ **Current Version Limitations:**
1. Application approval is not implemented (manual process)
2. No notification system for application status changes
3. Proximity filter is simplified (no actual distance calculation)
4. No application management UI for organizations yet

📋 **Recommended Next Steps:**
1. Build organization applications dashboard
2. Implement approve/reject functionality
3. Add email notifications
4. Integrate geocoding API for accurate distance calculation
5. Add application message field to UI
6. Implement application withdrawal feature

## Support & Troubleshooting

### Common Issues

**Issue: Organizations not appearing in modal**
- Solution: Check `is_public = true` and `onboarding_completed = true`

**Issue: Application fails to create**
- Solution: Check RLS policies and user authentication

**Issue: Setup guide modal appears multiple times**
- Solution: Clear localStorage: `localStorage.removeItem('org_setup_guide_seen_USER_ID')`

**Issue: Address not saving**
- Solution: Verify sync function updated correctly

## Success Criteria

✅ Feature is considered successfully deployed when:
- Users can enter address during signup
- Address is saved to database
- Public organizations modal opens and displays organizations
- Users can apply to organizations
- Applications are tracked in database
- Duplicate applications are prevented
- Setup guide appears for org users (once only)
- All tests pass
- No console errors
- Performance is acceptable (< 2s to load organizations)

---

**Deployment Date:** _________________

**Deployed By:** _________________

**Notes:** _________________
