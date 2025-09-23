-- Migration: Add user_organizations table for staff multi-organization support
-- Date: 2025-09-23
-- Description: Allow staff users to belong to multiple organizations

-- Create user_organizations junction table
CREATE TABLE IF NOT EXISTS public.user_organizations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  organization_id uuid NOT NULL,
  user_role text NOT NULL CHECK (user_role = ANY (ARRAY['organisation'::text, 'staff'::text, 'member'::text])),
  joined_at timestamp with time zone DEFAULT now(),
  is_primary boolean DEFAULT false,
  status text DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'inactive'::text, 'pending'::text])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),

  CONSTRAINT user_organizations_pkey PRIMARY KEY (id),
  CONSTRAINT user_organizations_user_id_organization_id_key UNIQUE (user_id, organization_id),
  CONSTRAINT user_organizations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT user_organizations_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_organizations_user_id ON public.user_organizations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_organizations_organization_id ON public.user_organizations(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_organizations_user_role ON public.user_organizations(user_role);
CREATE INDEX IF NOT EXISTS idx_user_organizations_status ON public.user_organizations(status);

-- Enable RLS
ALTER TABLE public.user_organizations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own organization memberships
CREATE POLICY "Users can view their own organization memberships" ON public.user_organizations
  FOR SELECT USING (auth.uid() = user_id);

-- Organization owners and staff can view memberships in their organizations
CREATE POLICY "Organization owners and staff can view memberships" ON public.user_organizations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_organizations uo
      WHERE uo.user_id = auth.uid()
      AND uo.organization_id = user_organizations.organization_id
      AND uo.user_role IN ('organisation', 'staff')
    )
  );

-- Only organization owners can insert/update memberships
CREATE POLICY "Organization owners can manage memberships" ON public.user_organizations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_organizations uo
      WHERE uo.user_id = auth.uid()
      AND uo.organization_id = user_organizations.organization_id
      AND uo.user_role = 'organisation'
    )
  );

-- Migrate existing data from profiles table
-- For users with organization_id in profiles, create entries in user_organizations
INSERT INTO public.user_organizations (user_id, organization_id, user_role, joined_at, is_primary, status)
SELECT
  p.id,
  p.organization_id,
  p.user_role,
  COALESCE(p.created_at, now()),
  true, -- Mark as primary for existing relationships
  CASE
    WHEN p.user_role IN ('organisation', 'staff', 'member') THEN 'active'
    ELSE 'inactive'
  END
FROM public.profiles p
WHERE p.organization_id IS NOT NULL
AND p.user_role IN ('organisation', 'staff', 'member')
ON CONFLICT (user_id, organization_id) DO NOTHING;

-- Ensure each user has exactly one primary organization
-- For staff users, we might need to choose one as primary
UPDATE public.user_organizations
SET is_primary = true
WHERE id IN (
  SELECT DISTINCT ON (user_id) id
  FROM public.user_organizations
  WHERE user_role IN ('organisation', 'staff', 'member')
  ORDER BY user_id, joined_at ASC
);

-- For non-staff users (organisation, member), ensure they only have one organization
-- This is a safety measure to maintain data integrity
DELETE FROM public.user_organizations uo1
WHERE user_role IN ('organisation', 'member')
AND EXISTS (
  SELECT 1 FROM public.user_organizations uo2
  WHERE uo2.user_id = uo1.user_id
  AND uo2.user_role IN ('organisation', 'member')
  AND uo2.id != uo1.id
);

-- Add comments
COMMENT ON TABLE public.user_organizations IS 'Junction table for user-organization relationships, allowing staff to belong to multiple organizations';
COMMENT ON COLUMN public.user_organizations.is_primary IS 'Indicates the primary organization for users belonging to multiple organizations';
COMMENT ON COLUMN public.user_organizations.user_role IS 'Role of the user within this specific organization';