# Public Organizations Discovery - Quick Summary

## What Was Implemented

### 1. **Address Field in Signup** ✅
- Added address input field in signup form
- Stores user address in `profiles.address`
- Used for location-based organization discovery
- Updated signup logic to sync address to database

### 2. **Public Organizations Modal** ✅
- Beautiful modal showing all public organizations
- Features:
  - Search by name, description, address, type
  - Proximity filter (50-200km slider) for users with address
  - Organization cards with logo, banner, name, description, address
  - "Postuler" button to apply
- Opens when clicking "Rejoindre une organisation" in sidebar

### 3. **Organization Applications System** ✅
- New table: `organisation_applications`
- Tracks application status (pending, approved, rejected, cancelled)
- RLS policies for security
- Prevents duplicate applications
- Shows toast notifications

### 4. **Organization Setup Guide Modal** ✅
- One-time modal for users with 'organisation' role but no organization
- Appears after first login post-email confirmation
- Guides user to create their organization
- Uses localStorage to show only once

## Key Files

### New Components
```
src/components/PublicOrganizationsModal.tsx
src/components/OrganizationSetupGuideModal.tsx
```

### Modified Components
```
src/pages/Signup.tsx (added address field)
src/components/RoleBasedSidebar.tsx (integrated modals)
src/types/userTypes.ts (added address to UserProfile)
```

### Database Migrations
```
db_migrations/20251007_add_address_and_org_applications.sql
db_migrations/20251007_update_sync_function_with_address.sql
```

## To Deploy

### 1. Run Database Migrations
Copy and execute the SQL from these files in Supabase SQL Editor:
1. `db_migrations/20251007_add_address_and_org_applications.sql`
2. `db_migrations/20251007_update_sync_function_with_address.sql`

### 2. Deploy Code
```bash
npm run build
# Deploy to your hosting
```

## How It Works

### User Without Organization
1. Sign up with address
2. See "Rejoindre une organisation" button in sidebar
3. Click → Modal opens with all public organizations
4. Browse/search/filter organizations
5. Click "Postuler" on desired organization
6. Application saved with status 'pending'
7. **Currently mocked** - No automatic join (toast only)

### Organization Role User (First Login)
1. Sign up selecting "Structure d'accompagnement"
2. Confirm email
3. Login → Setup guide modal appears
4. Choose:
   - "Créer mon organisation" → Go to onboarding
   - "Plus tard" → Dismiss (won't show again)

## Current Behavior

✅ **What Works:**
- Address field in signup
- Public organizations discovery modal
- Application creation (pending status)
- Toast notifications
- One-time setup guide for org users
- Prevent duplicate applications

🔄 **What's Mocked:**
- Application approval/rejection flow
- Actual joining of organization after apply

## Next Phase (Future)

To complete the feature, implement:
1. **Applications Dashboard** for organization admins
2. **Approve/Reject** buttons
3. **On approval:** Update user's `organization_id` and role to 'member'
4. **Notifications** to users about application status

## Testing

Test the following scenarios:
1. ✅ Signup with address field
2. ✅ "Rejoindre une organisation" button appears
3. ✅ Modal shows only public organizations
4. ✅ Search and filters work
5. ✅ Apply creates application record
6. ✅ Duplicate prevention works
7. ✅ Setup guide appears for org role users
8. ✅ Setup guide only shows once

## Important Notes

- Applications are tracked but **not automatically approved**
- Organizations must have `is_public = true` and `onboarding_completed = true` to appear
- Proximity filter is simplified (checks for address existence only)
- For production, integrate a geocoding API for real distance calculation
- The setup guide uses localStorage per user ID to track if seen

## Database Schema

### New Table: organisation_applications
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key to auth.users)
- organization_id (uuid, foreign key to organizations)
- status (text: pending/approved/rejected/cancelled)
- message (text, optional)
- created_at, updated_at, reviewed_at
- reviewed_by (uuid, foreign key to profiles)
```

### Updated: profiles
```sql
+ address (text)
```

## Support

See `PUBLIC_ORGANIZATIONS_FEATURE_GUIDE.md` for detailed documentation.
