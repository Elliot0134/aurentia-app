# Organization Redirect Debug Guide

## The Problem

You're getting redirected from `/organisation/:id/dashboard` → `/setup-organization` → `/organisation/:id/onboarding` even though you've already created an organization and `organization_setup_pending` is `false`.

## Root Cause

The redirect happens because **you don't have an entry in the `user_organizations` table**, even though you may have created an organization.

## How Organization Membership Works

### ❌ WRONG (Old System - Deprecated)
```
profiles.organization_id → Used to link user to organization
```

### ✅ CORRECT (New System - Current)
```
user_organizations table → Junction table that links users to organizations
```

**The `user_organizations` table structure:**
```sql
CREATE TABLE user_organizations (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL,              -- Your user ID
  organization_id uuid NOT NULL,      -- The organization ID
  user_role text NOT NULL,            -- 'organisation', 'staff', or 'member'
  status text DEFAULT 'active',       -- Must be 'active'!
  is_primary boolean DEFAULT false,
  joined_at timestamp,
  created_at timestamp,
  updated_at timestamp
);
```

## The Redirect Flow & Conditions

### 1. OrganisationRouteGuard (First Check)
**Location:** `src/components/organisation/OrganisationRouteGuard.tsx`

**Redirects to `/setup-organization` if:**
```typescript
if ((userRole === 'organisation' || userRole === 'staff') && !organizationId) {
  return <Navigate to="/setup-organization" replace />;
}
```

Where `organizationId` comes from:
- `useUserRole()` hook
  - Which calls `useUserOrganizationId()` hook
    - Which queries `user_organizations` table for YOUR user ID
    - Returns `null` if NO ACTIVE ENTRY EXISTS ❌

### 2. OnboardingGuard (Second Check)
**Location:** `src/components/organisation/OnboardingGuard.tsx`

**Redirects to `/organisation/:id/onboarding` if:**
```typescript
if (!onboardingComplete) {
  navigate(`/organisation/${organisationId}/onboarding`, { replace: true });
}
```

## Diagnostic Steps

### Step 1: Run the diagnostic SQL query

1. Open Supabase Dashboard → SQL Editor
2. Open the file: `debug_organization_state.sql`
3. Replace `'YOUR_EMAIL_HERE'` with your actual email
4. Run the query
5. Check the "diagnosis" column in the last result

### Step 2: Interpret the results

#### ✅ If you see: "Everything looks good"
- Your `user_organizations` entry exists
- The bug is somewhere else (check browser console logs)

#### ❌ If you see: "NO user_organizations entry - THIS IS YOUR PROBLEM!"
- **This is your issue!** You need to create the entry manually OR
- Re-run the onboarding process

#### ⚠️ If you see: "user_organizations status is not active"
- Update the status to 'active':
```sql
UPDATE user_organizations
SET status = 'active'
WHERE user_id = 'YOUR_USER_ID';
```

#### ⚠️ If you see: "Onboarding not complete"
- Complete the onboarding process OR
- Manually mark it as complete:
```sql
UPDATE organizations
SET onboarding_completed = true, onboarding_step = 6
WHERE id = 'YOUR_ORG_ID';
```

## Manual Fix (If user_organizations entry is missing)

If the diagnostic shows you have NO `user_organizations` entry, run this:

```sql
-- Replace the placeholders with your actual values
INSERT INTO user_organizations (
  user_id,
  organization_id,
  user_role,
  status,
  is_primary
)
VALUES (
  'YOUR_USER_ID',           -- Get from profiles table
  'YOUR_ORGANIZATION_ID',   -- Get from organizations table
  'organisation',           -- Your role (organisation, staff, or member)
  'active',                 -- Must be active
  true                      -- Set as primary organization
);
```

## How to Get Your IDs

```sql
-- Get your user_id
SELECT id FROM profiles WHERE email = 'your@email.com';

-- Get your organization_id
SELECT id FROM organizations WHERE created_by = (
  SELECT id FROM profiles WHERE email = 'your@email.com'
);
```

## Why This Happened

The onboarding process SHOULD create the `user_organizations` entry (see lines 500-512 in `OrganisationOnboarding.tsx`), but it might have failed silently OR you created the organization through a different flow that doesn't create the entry.

## Prevention

Going forward, whenever an organization is created, the code MUST:

1. Insert into `organizations` table
2. Insert into `user_organizations` table (to link the creator)
3. Update `profiles.user_role` to 'organisation'
4. Set `profiles.organization_setup_pending` to false

All 4 steps must succeed in a transaction.

## Quick Checklist

- [ ] Run diagnostic SQL query
- [ ] Check if `user_organizations` entry exists
- [ ] If missing, insert the entry manually
- [ ] Check `organizations.onboarding_completed` is `true`
- [ ] Check `profiles.organization_setup_pending` is `false`
- [ ] Refresh the page
- [ ] Check browser console for any errors
- [ ] Try navigating to `/organisation/:id/dashboard`

## Console Logs to Monitor

Open browser DevTools → Console and look for these logs:

```
[useUserRole] { userRole, organizationId, loading }
[OrganisationRouteGuard] { userRole, organizationId, path }
[OnboardingGuard] Checking onboarding status for org: xxx
[OnboardingGuard] Onboarding status: { organisationId, onboardingComplete }
[useOrganisationNavigation] User organization data: {...}
```

These will tell you exactly where the redirect is happening and why.
