# Public Organizations Discovery Feature - Implementation Guide

## Overview
This feature allows users without an organization to discover and apply to public organizations. It includes:
1. **Address field** in signup for location-based discovery
2. **Public Organizations Modal** to browse and apply to organizations
3. **Organization Applications System** to track applications
4. **One-time Setup Guide Modal** for organization role users

## Files Created/Modified

### New Components
- `src/components/PublicOrganizationsModal.tsx` - Modal to display and apply to public organizations
- `src/components/OrganizationSetupGuideModal.tsx` - One-time modal guiding organization users to setup

### Modified Files
- `src/pages/Signup.tsx` - Added address field to signup form
- `src/components/RoleBasedSidebar.tsx` - Integrated new modals and updated "Rejoindre une organisation" button
- `src/types/userTypes.ts` - Added address field to UserProfile interface
- `db.sql` - Added address field to profiles table

### New Migrations
1. `db_migrations/20251007_add_address_and_org_applications.sql`
2. `db_migrations/20251007_update_sync_function_with_address.sql`

## Database Changes

### 1. Run Migration: Add Address and Applications Table

Execute this in your Supabase SQL Editor:

```sql
-- Migration: Add address field to profiles and create organisation_applications table

-- Step 1: Add address field to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS address text;

-- Add index for address searches
CREATE INDEX IF NOT EXISTS idx_profiles_address ON public.profiles(address);

-- Step 2: Create organisation_applications table
CREATE TABLE IF NOT EXISTS public.organisation_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  message text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  reviewed_at timestamp with time zone,
  reviewed_by uuid REFERENCES public.profiles(id),
  
  CONSTRAINT unique_user_org_pending_application UNIQUE (user_id, organization_id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_org_applications_user_id ON public.organisation_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_org_applications_org_id ON public.organisation_applications(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_applications_status ON public.organisation_applications(status);

-- Enable RLS
ALTER TABLE public.organisation_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own applications"
ON public.organisation_applications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create applications"
ON public.organisation_applications FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending applications"
ON public.organisation_applications FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending')
WITH CHECK (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Organization staff can view applications to their org"
ON public.organisation_applications
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_organizations
    WHERE user_organizations.user_id = auth.uid()
    AND user_organizations.organization_id = organisation_applications.organization_id
    AND user_organizations.user_role IN ('organisation', 'staff')
    AND user_organizations.status = 'active'
  )
);

-- Organization staff and admins can update (approve/reject) applications to their organization
CREATE POLICY "Organization staff can update applications to their org"
ON public.organisation_applications
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_organizations
    WHERE user_organizations.user_id = auth.uid()
    AND user_organizations.organization_id = organisation_applications.organization_id
    AND user_organizations.user_role IN ('organisation', 'staff')
    AND user_organizations.status = 'active'
  )
);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_organisation_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_organisation_applications_updated_at
BEFORE UPDATE ON public.organisation_applications
FOR EACH ROW
EXECUTE FUNCTION update_organisation_applications_updated_at();

-- Add comments
COMMENT ON TABLE public.organisation_applications IS 'Tracks user applications to join public organizations';
COMMENT ON COLUMN public.profiles.address IS 'User address for location-based organization discovery';
```

### 2. Run Migration: Update Sync Function with Address

Execute this in your Supabase SQL Editor:

```sql
-- Migration: Update sync_user_metadata_to_profile function to include address

-- Drop the old function
DROP FUNCTION IF EXISTS public.sync_user_metadata_to_profile(uuid, text, text, text, text);

-- Create updated function with address parameter
CREATE OR REPLACE FUNCTION public.sync_user_metadata_to_profile(
  p_user_id uuid,
  p_email text DEFAULT NULL,
  p_first_name text DEFAULT NULL,
  p_last_name text DEFAULT NULL,
  p_phone text DEFAULT NULL,
  p_address text DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.profiles (
    id, email, first_name, last_name, phone, address,
    user_role, email_confirmation_required, created_at
  )
  VALUES (
    p_user_id,
    COALESCE(p_email, (SELECT email FROM auth.users WHERE id = p_user_id)),
    COALESCE(p_first_name, ''),
    COALESCE(p_last_name, ''),
    COALESCE(p_phone, ''),
    COALESCE(p_address, ''),
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
    END,
    address = CASE 
      WHEN EXCLUDED.address IS NOT NULL AND EXCLUDED.address != '' 
      THEN EXCLUDED.address 
      ELSE public.profiles.address 
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.sync_user_metadata_to_profile(uuid, text, text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.sync_user_metadata_to_profile(uuid, text, text, text, text, text) TO service_role;

-- Backfill address from metadata
UPDATE public.profiles p
SET address = COALESCE(p.address, au.raw_user_meta_data->>'address')
FROM auth.users au
WHERE p.id = au.id
  AND p.address IS NULL 
  AND au.raw_user_meta_data->>'address' IS NOT NULL;
```

## Features Explained

### 1. Address Field in Signup
- Users enter their address during signup
- Address is stored in `profiles.address`
- Used for location-based organization discovery

### 2. Public Organizations Modal
**Triggered by:** Clicking "Rejoindre une organisation" in sidebar (when user has no organization)

**Features:**
- Displays all public organizations (`is_public = true` and `onboarding_completed = true`)
- Search functionality (name, description, address, type, geographic focus)
- Optional proximity filter with distance slider (50-200km)
- Organization cards show:
  - Logo and banner
  - Name, type, and description
  - Address and geographic focus
  - "Postuler" (Apply) button

**Behavior:**
- On apply, creates a record in `organisation_applications` with status 'pending'
- Prevents duplicate applications
- Shows toast notification on success
- Application is tracked but action is currently mocked (no actual join yet)

### 3. Organization Applications System
**Table:** `organisation_applications`

**Fields:**
- `user_id`: Applicant
- `organization_id`: Target organization
- `status`: pending, approved, rejected, cancelled
- `message`: Optional message from user
- `reviewed_by`: Staff member who reviewed

**RLS Policies:**
- Users can view/create/update their own applications
- Organization staff can view/update applications to their org

### 4. Organization Setup Guide Modal
**Triggered for:** Users with role 'organisation' without an `organization_id`

**Behavior:**
- Appears once after email confirmation (stored in localStorage)
- Guides user to create their organization
- Two options:
  - "Créer mon organisation" → Navigate to `/organisation/onboarding`
  - "Plus tard" → Dismiss modal (won't show again)

## User Flows

### Flow 1: Individual User Discovers Organizations
1. User signs up with address
2. Logs in, sees "Rejoindre une organisation" in sidebar
3. Clicks button → PublicOrganizationsModal opens
4. Browses organizations, optionally filters by proximity
5. Clicks "Postuler" on an organization
6. Application created with status 'pending'
7. Toast shows success message

### Flow 2: Organization Role User Setup
1. User signs up selecting "Structure d'accompagnement" role
2. Confirms email
3. Logs in for the first time
4. OrganizationSetupGuideModal appears automatically
5. User can:
   - Click "Créer mon organisation" → Go to onboarding
   - Click "Plus tard" → Dismiss (modal won't show again)

## Next Steps (Future Implementation)

The current implementation creates applications but doesn't automatically join users. To complete the feature:

1. **Organization Dashboard for Applications**
   - Create page at `/organisation/{id}/applications`
   - Display pending applications
   - Approve/Reject buttons
   - On approve: Update user's `organization_id` and `user_role` to 'member'

2. **Notification System**
   - Notify users when their application is approved/rejected
   - Email notifications

3. **Advanced Proximity Filter**
   - Integrate geocoding API (Google Maps, MapBox)
   - Calculate actual distances
   - Sort organizations by distance

4. **Application Withdrawal**
   - Allow users to cancel their pending applications

## Testing Checklist

- [ ] Address field appears in signup form
- [ ] Address is saved to database
- [ ] "Rejoindre une organisation" button appears for users without organization
- [ ] PublicOrganizationsModal opens when button is clicked
- [ ] Only public organizations are displayed
- [ ] Search filters work correctly
- [ ] Proximity filter checkbox appears (if user has address)
- [ ] Distance slider adjusts filter
- [ ] Apply button creates application record
- [ ] Duplicate applications are prevented
- [ ] Toast notifications appear
- [ ] Organization setup guide modal appears for organization role users (once)
- [ ] Modal is dismissed permanently when "Plus tard" is clicked
- [ ] "Créer mon organisation" navigates to onboarding

## Troubleshooting

### Organizations not appearing in modal
- Check `organizations.is_public = true`
- Check `organizations.onboarding_completed = true`
- Check RLS policies on organizations table

### Application not created
- Check RLS policies on `organisation_applications`
- Check user is authenticated
- Verify organization_id exists

### Setup guide modal not appearing
- Check user role is 'organisation'
- Check organization_id is null
- Clear localStorage if testing multiple times

## Database Queries for Testing

```sql
-- View all public organizations
SELECT id, name, address, is_public, onboarding_completed
FROM public.organizations
WHERE is_public = true AND onboarding_completed = true;

-- View all applications
SELECT 
  oa.*,
  p.first_name || ' ' || p.last_name as applicant_name,
  o.name as organization_name
FROM public.organisation_applications oa
JOIN public.profiles p ON p.id = oa.user_id
JOIN public.organizations o ON o.id = oa.organization_id
ORDER BY oa.created_at DESC;

-- View users with address
SELECT id, first_name, last_name, address
FROM public.profiles
WHERE address IS NOT NULL;
```
