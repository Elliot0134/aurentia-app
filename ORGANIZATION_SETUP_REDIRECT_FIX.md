# Organization Setup Redirect Implementation

## Summary
Implemented automatic redirect to organization setup page after email verification for users who sign up with the 'organisation' role without an invitation code.

## Changes Made

### 1. Database Migration (`supabase/migrations/20251008_add_organization_setup_pending.sql`)
- **Added column**: `organization_setup_pending` (BOOLEAN) to `profiles` table
- **Purpose**: Track users who need to complete organization setup
- **Default**: `false`
- **Auto-update**: Sets to `true` for existing users with `user_role = 'organisation'` but no active entry in `user_organizations` table
- **Note**: Uses proper relational check via `user_organizations` table (NOT a direct `organization_id` column)

### 2. Updated Signup Flow (`src/pages/Signup.tsx`)
- **Modified**: Organization role assignment logic (line ~323)
- **Added**: Sets `organization_setup_pending: true` when user selects 'organisation' role without invitation code
- This ensures the user will be redirected to setup after email confirmation

### 3. Updated UserProfile Type (`src/types/userTypes.ts`)
- **Added field**: `organization_setup_pending?: boolean` to `UserProfile` interface
- Allows TypeScript to recognize this field throughout the application

### 4. Updated Profile Fetching (`src/hooks/useUserProfile.tsx`)
- **Modified**: Profile query to include `organization_setup_pending` field
- Ensures the flag is loaded with user profile data

### 5. Updated Role-Based Redirect (`src/components/RoleBasedRedirect.tsx`)
- **Added priority check**: Redirects to `/setup-organization` if `organization_setup_pending` is `true`
- **Priority**: This check happens BEFORE all other route redirects
- **Logic**: Only redirects if not already on the setup page
- Ensures users complete organization setup before accessing other areas

### 6. Updated Organization Flow Wrapper (`src/components/organisation/OrganisationFlowWrapper.tsx`)
- **Added**: Clears `organization_setup_pending` flag after successful organization creation
- Prevents infinite redirect loop once setup is complete

## User Flow

### Scenario: User signs up as 'organisation' WITHOUT invitation code

1. **Signup Page** → User selects "Structure d'accompagnement"
2. **No Invitation Code** → Continues without entering a code
3. **Registration** → User creates account
4. **Flag Set** → `organization_setup_pending = true` in database
5. **Email Confirmation** → User confirms email
6. **Auto-Redirect** → `RoleBasedRedirect` detects flag and redirects to `/setup-organization`
7. **Organization Setup** → User completes organization creation form
8. **Flag Cleared** → `organization_setup_pending = false`
9. **Redirect to Onboarding** → User is sent to organization onboarding flow

### Scenario: User signs up as 'organisation' WITH invitation code

1. **Signup Page** → User selects "Structure d'accompagnement"
2. **Enters Code** → Valid invitation code provided
3. **Registration** → User creates account
4. **No Flag Set** → Organization is assigned via invitation
5. **Email Confirmation** → User confirms email
6. **Normal Redirect** → Goes directly to organization dashboard

## Technical Details

### Priority of Redirects in RoleBasedRedirect
1. **Email verification** (handled in ProtectedRoute)
2. **Organization setup pending** ← NEW (highest priority after email)
3. **Route whitelisting** (public routes, already on correct role path)
4. **Role-based dashboard** (individual, member, staff, etc.)

### Database Schema
```sql
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS organization_setup_pending BOOLEAN DEFAULT false;
```

### TypeScript Interface
```typescript
export interface UserProfile {
  // ... existing fields
  organization_setup_pending?: boolean;
  // ... other fields
}
```

## Testing Checklist

- [ ] Run migration: `organization_setup_pending` column exists
- [ ] Sign up as organization without code → Flag is set to `true`
- [ ] Confirm email → Redirect to `/setup-organization`
- [ ] Complete organization setup → Flag cleared to `false`
- [ ] After setup → Redirect to organization onboarding
- [ ] Sign up with invitation code → No redirect to setup (normal flow)

## Files Modified

1. `supabase/migrations/20251008_add_organization_setup_pending.sql` (NEW)
2. `src/pages/Signup.tsx`
3. `src/types/userTypes.ts`
4. `src/hooks/useUserProfile.tsx`
5. `src/components/RoleBasedRedirect.tsx`
6. `src/components/organisation/OrganisationFlowWrapper.tsx`

## Next Steps

1. **Run the migration** in your Supabase database
2. **Test the signup flow** for organization users without codes
3. **Verify email confirmation** redirects to setup page
4. **Confirm flag is cleared** after organization creation

---

**Date**: October 8, 2025
**Author**: GitHub Copilot
