-- Create staff table for organization staff management
-- This table stores staff-specific information separate from the mentors table
-- Staff members can also be mentors (dual role)

CREATE TABLE IF NOT EXISTS public.staff (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  organization_id uuid NOT NULL,
  user_organization_id uuid,
  job_role text,
  manager_id uuid,
  bio text,
  linkedin_url text,
  status text NOT NULL DEFAULT 'active'::text,
  joined_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),

  CONSTRAINT staff_pkey PRIMARY KEY (id),
  CONSTRAINT staff_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT staff_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE,
  CONSTRAINT staff_user_organization_id_fkey FOREIGN KEY (user_organization_id) REFERENCES public.user_organizations(id) ON DELETE SET NULL,
  CONSTRAINT staff_manager_id_fkey FOREIGN KEY (manager_id) REFERENCES public.staff(id) ON DELETE SET NULL,
  CONSTRAINT staff_status_check CHECK (status = ANY (ARRAY['active'::text, 'inactive'::text, 'pending'::text])),

  -- Ensure a user can only be staff once per organization
  CONSTRAINT staff_user_organization_unique UNIQUE (user_id, organization_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_staff_user_id ON public.staff(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_organization_id ON public.staff(organization_id);
CREATE INDEX IF NOT EXISTS idx_staff_manager_id ON public.staff(manager_id);
CREATE INDEX IF NOT EXISTS idx_staff_status ON public.staff(status);

-- Enable Row Level Security
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view staff in their organization
CREATE POLICY "Users can view staff in their organization"
  ON public.staff
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id
      FROM public.user_organizations
      WHERE user_id = auth.uid()
        AND status = 'active'
    )
  );

-- RLS Policy: Organization owners and existing staff can insert new staff
CREATE POLICY "Organization owners and staff can insert staff"
  ON public.staff
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT uo.organization_id
      FROM public.user_organizations uo
      WHERE uo.user_id = auth.uid()
        AND uo.status = 'active'
        AND uo.user_role IN ('organisation', 'staff')
    )
  );

-- RLS Policy: Organization owners and staff can update staff
CREATE POLICY "Organization owners and staff can update staff"
  ON public.staff
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT uo.organization_id
      FROM public.user_organizations uo
      WHERE uo.user_id = auth.uid()
        AND uo.status = 'active'
        AND uo.user_role IN ('organisation', 'staff')
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT uo.organization_id
      FROM public.user_organizations uo
      WHERE uo.user_id = auth.uid()
        AND uo.status = 'active'
        AND uo.user_role IN ('organisation', 'staff')
    )
  );

-- RLS Policy: Only organization owners can delete staff
CREATE POLICY "Organization owners can delete staff"
  ON public.staff
  FOR DELETE
  USING (
    organization_id IN (
      SELECT uo.organization_id
      FROM public.user_organizations uo
      WHERE uo.user_id = auth.uid()
        AND uo.status = 'active'
        AND uo.user_role = 'organisation'
    )
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_staff_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on row update
CREATE TRIGGER update_staff_updated_at_trigger
  BEFORE UPDATE ON public.staff
  FOR EACH ROW
  EXECUTE FUNCTION public.update_staff_updated_at();

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.staff TO authenticated;

-- Comment on table
COMMENT ON TABLE public.staff IS 'Stores staff members of organizations with their roles and hierarchy';
COMMENT ON COLUMN public.staff.job_role IS 'Staff job role (e.g., HR, Commerce, Marketing)';
COMMENT ON COLUMN public.staff.manager_id IS 'Reference to another staff member who is the manager';
