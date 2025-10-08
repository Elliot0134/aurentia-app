-- Migration: Add address field to profiles and create organisation_applications table
-- Date: 2025-10-07
-- Description: 
--   1. Add address field to profiles table for location-based organization discovery
--   2. Create organisation_applications table to track user applications to organizations

-- Step 1: Add address field to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS address text;

-- Add index for address searches (for better performance with location queries)
CREATE INDEX IF NOT EXISTS idx_profiles_address ON public.profiles(address);

-- Step 2: Create organisation_applications table
CREATE TABLE IF NOT EXISTS public.organisation_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  message text, -- Optional message from the user
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  reviewed_at timestamp with time zone,
  reviewed_by uuid REFERENCES public.profiles(id),
  
  -- Ensure a user can only have one pending application per organization at a time
  CONSTRAINT unique_user_org_pending_application UNIQUE (user_id, organization_id)
);

-- Add indexes for organisation_applications
CREATE INDEX IF NOT EXISTS idx_org_applications_user_id ON public.organisation_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_org_applications_org_id ON public.organisation_applications(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_applications_status ON public.organisation_applications(status);

-- Add RLS policies for organisation_applications
ALTER TABLE public.organisation_applications ENABLE ROW LEVEL SECURITY;

-- Users can view their own applications
CREATE POLICY "Users can view their own applications"
ON public.organisation_applications
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create applications for themselves
CREATE POLICY "Users can create applications"
ON public.organisation_applications
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update (cancel) their own pending applications
CREATE POLICY "Users can update their own pending applications"
ON public.organisation_applications
FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending')
WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Organization staff and admins can view applications to their organization
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

-- Add trigger to update updated_at timestamp
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

-- Add comments for documentation
COMMENT ON TABLE public.organisation_applications IS 'Tracks user applications to join public organizations';
COMMENT ON COLUMN public.profiles.address IS 'User address for location-based organization discovery';
