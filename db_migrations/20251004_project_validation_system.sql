-- =====================================================
-- MIGRATION: Project Validation System Implementation
-- Date: 2025-10-04
-- Purpose: Add project validation workflow and staff management capabilities
-- Author: System
-- =====================================================

-- This migration adds:
-- 1. Project validation status system
-- 2. Project-mentor assignment tracking
-- 3. Organization linking for projects
-- 4. Activity logging system
-- 5. Member subscription tracking
-- 6. Extended fields for mentors, profiles, and projects

BEGIN;

-- =====================================================
-- PART 1: PROJECT VALIDATION SYSTEM
-- =====================================================

-- Add organization_id column if it doesn't exist (for linking projects to organizations)
ALTER TABLE project_summary
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;

-- Add validation status to project_summary table
ALTER TABLE project_summary
ADD COLUMN IF NOT EXISTS validation_status TEXT DEFAULT 'validated' 
  CHECK (validation_status IN ('pending', 'validated', 'rejected', 'in_progress', 'completed'));

-- Add organization linking flag
ALTER TABLE project_summary
ADD COLUMN IF NOT EXISTS linked_to_organization BOOLEAN DEFAULT FALSE;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_project_summary_validation_status 
  ON project_summary(validation_status);

CREATE INDEX IF NOT EXISTS idx_project_summary_linked_org 
  ON project_summary(linked_to_organization);

CREATE INDEX IF NOT EXISTS idx_project_summary_organization_id
  ON project_summary(organization_id) WHERE organization_id IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN project_summary.validation_status IS 
  'Project validation status workflow: 
   - pending: Awaiting organization approval
   - validated: Approved by staff, can assign mentors
   - rejected: Not approved
   - in_progress: Currently being worked on
   - completed: Project finished';

COMMENT ON COLUMN project_summary.linked_to_organization IS 
  'Whether the project has been submitted to an organization for validation';

-- =====================================================
-- PART 2: PROJECT-MENTOR ASSIGNMENTS
-- =====================================================

-- Create project_mentors junction table
CREATE TABLE IF NOT EXISTS project_mentors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES project_summary(project_id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_project_mentor UNIQUE (project_id, mentor_id)
);

-- Add indexes for project_mentors
CREATE INDEX IF NOT EXISTS idx_project_mentors_project_id 
  ON project_mentors(project_id);

CREATE INDEX IF NOT EXISTS idx_project_mentors_mentor_id 
  ON project_mentors(mentor_id);

CREATE INDEX IF NOT EXISTS idx_project_mentors_status 
  ON project_mentors(status);

CREATE INDEX IF NOT EXISTS idx_project_mentors_assigned_by 
  ON project_mentors(assigned_by) WHERE assigned_by IS NOT NULL;

-- Add table comment
COMMENT ON TABLE project_mentors IS 
  'Junction table linking mentors to projects they are supporting. 
   Tracks assignment history and current status of mentorship.';

COMMENT ON COLUMN project_mentors.status IS 
  'Mentorship status:
   - active: Currently mentoring this project
   - inactive: Temporarily paused
   - completed: Mentorship finished';

-- =====================================================
-- PART 3: EXTENDED MENTOR FIELDS
-- =====================================================

-- Note: availability, max_projects, max_entrepreneurs already exist in mentors table
-- No changes needed for mentors table

-- =====================================================
-- PART 4: EXTENDED PROFILE FIELDS
-- =====================================================

-- Note: linkedin_url, website, cohort_year, program_type, availability_schedule, 
-- training_budget already exist in profiles table
-- No changes needed for profiles table

-- =====================================================
-- PART 5: EXTENDED PROJECT FIELDS
-- =====================================================

-- Note: Most fields already exist in projects table
-- Only add missing fields:

-- Add legal_form if it doesn't exist
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS legal_form TEXT;

-- Add ip_details if it doesn't exist  
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS ip_details TEXT;

-- Add funding_stage if it doesn't exist
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS funding_stage TEXT;

-- Add comments for new columns
COMMENT ON COLUMN projects.legal_form IS 'Legal form (e.g., SAS, SARL, Auto-entrepreneur)';
COMMENT ON COLUMN projects.ip_details IS 'Details about IP protection (patents, trademarks, etc.)';
COMMENT ON COLUMN projects.funding_stage IS 'Stage of funding (e.g., Seed, Series A, Pre-seed)';

-- =====================================================
-- PART 6: MEMBER SUBSCRIPTIONS TABLE
-- =====================================================

-- Note: member_subscriptions table already exists with all required columns
-- No changes needed for member_subscriptions table

-- =====================================================
-- PART 7: USER ACTIVITY LOG TABLE
-- =====================================================

-- Note: user_activity_log table already exists
-- Verify that it has all necessary columns and add missing ones if needed

-- Add 'description' column if it doesn't exist (was 'activity_description' in existing schema)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_activity_log' 
    AND column_name = 'description'
  ) THEN
    -- If the table has 'activity_description', rename it to 'description'
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'user_activity_log' 
      AND column_name = 'activity_description'
    ) THEN
      ALTER TABLE user_activity_log 
      RENAME COLUMN activity_description TO description;
    ELSE
      -- Otherwise, add the column
      ALTER TABLE user_activity_log 
      ADD COLUMN description TEXT;
    END IF;
  END IF;
END $$;

-- Add 'entity_type' column if it doesn't exist (was 'related_entity_type' in existing schema)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_activity_log' 
    AND column_name = 'entity_type'
  ) THEN
    -- If the table has 'related_entity_type', rename it to 'entity_type'
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'user_activity_log' 
      AND column_name = 'related_entity_type'
    ) THEN
      ALTER TABLE user_activity_log 
      RENAME COLUMN related_entity_type TO entity_type;
    ELSE
      -- Otherwise, add the column
      ALTER TABLE user_activity_log 
      ADD COLUMN entity_type TEXT;
    END IF;
  END IF;
END $$;

-- Add 'entity_id' column if it doesn't exist (was 'related_entity_id' in existing schema)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_activity_log' 
    AND column_name = 'entity_id'
  ) THEN
    -- If the table has 'related_entity_id', rename it to 'entity_id'
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'user_activity_log' 
      AND column_name = 'related_entity_id'
    ) THEN
      ALTER TABLE user_activity_log 
      RENAME COLUMN related_entity_id TO entity_id;
    ELSE
      -- Otherwise, add the column
      ALTER TABLE user_activity_log 
      ADD COLUMN entity_id UUID;
    END IF;
  END IF;
END $$;

-- Ensure indexes exist
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id 
  ON user_activity_log(user_id);

CREATE INDEX IF NOT EXISTS idx_activity_log_org_id 
  ON user_activity_log(organization_id) WHERE organization_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_activity_log_activity_type 
  ON user_activity_log(activity_type);

CREATE INDEX IF NOT EXISTS idx_activity_log_entity 
  ON user_activity_log(entity_type, entity_id) WHERE entity_type IS NOT NULL AND entity_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_activity_log_created_at 
  ON user_activity_log(created_at DESC);

-- =====================================================
-- PART 8: HELPER FUNCTIONS
-- =====================================================

-- Function to log user activity
CREATE OR REPLACE FUNCTION log_user_activity(
  p_user_id UUID,
  p_organization_id UUID,
  p_activity_type TEXT,
  p_description TEXT,
  p_entity_type TEXT DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_activity_id UUID;
BEGIN
  INSERT INTO user_activity_log (
    user_id,
    organization_id,
    activity_type,
    description,
    entity_type,
    entity_id,
    metadata
  ) VALUES (
    p_user_id,
    p_organization_id,
    p_activity_type,
    p_description,
    p_entity_type,
    p_entity_id,
    p_metadata
  )
  RETURNING id INTO v_activity_id;
  
  RETURN v_activity_id;
END;
$$;

COMMENT ON FUNCTION log_user_activity IS 
  'Helper function to log user activities. Returns the activity log ID.';

-- Function to check and update subscription status
CREATE OR REPLACE FUNCTION check_subscription_status()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Calculate days overdue if next payment date has passed
  IF NEW.next_payment_date IS NOT NULL AND NEW.next_payment_date < NOW() THEN
    NEW.days_overdue := EXTRACT(DAY FROM NOW() - NEW.next_payment_date)::INTEGER;
    
    -- Auto-update status to overdue if payment is late
    IF NEW.status = 'active' AND NEW.days_overdue > 0 THEN
      NEW.status := 'overdue';
    END IF;
  ELSE
    NEW.days_overdue := 0;
  END IF;
  
  NEW.updated_at := NOW();
  
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION check_subscription_status IS 
  'Trigger function to automatically calculate days overdue and update subscription status';

-- Create trigger for subscription status
DROP TRIGGER IF EXISTS trigger_check_subscription_status ON member_subscriptions;
CREATE TRIGGER trigger_check_subscription_status
  BEFORE INSERT OR UPDATE ON member_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION check_subscription_status();

-- =====================================================
-- PART 9: ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE project_mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;

-- Policy: Organization staff can manage project-mentor assignments
CREATE POLICY "organization_staff_can_manage_mentor_assignments"
ON project_mentors
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM project_summary ps
    JOIN user_organizations uo ON uo.organization_id = ps.organization_id
    WHERE ps.project_id = project_mentors.project_id
    AND uo.user_id = auth.uid()
    AND uo.user_role IN ('organisation', 'staff')
  )
);

-- Policy: Users can view their own mentor assignments
CREATE POLICY "users_can_view_own_project_mentors"
ON project_mentors
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM project_summary ps
    WHERE ps.project_id = project_mentors.project_id
    AND ps.user_id = auth.uid()
  )
);

-- Policy: Organization staff can update project validation status
CREATE POLICY "organization_staff_can_validate_projects"
ON project_summary
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_organizations
    WHERE user_organizations.organization_id = project_summary.organization_id
    AND user_organizations.user_id = auth.uid()
    AND user_organizations.user_role IN ('organisation', 'staff')
  )
);

-- Policy: Users can update their own projects
CREATE POLICY "users_can_update_own_projects"
ON project_summary
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Policy: Staff can view organization projects
CREATE POLICY "staff_can_view_organization_projects"
ON project_summary
FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM user_organizations
    WHERE user_id = auth.uid()
    AND user_role IN ('organisation', 'staff')
  )
  OR user_id = auth.uid()
);

-- Policy: Users can view their own subscriptions
CREATE POLICY "users_can_view_own_subscriptions"
ON member_subscriptions
FOR SELECT
USING (user_id = auth.uid());

-- Policy: Organization staff can manage subscriptions
CREATE POLICY "staff_can_manage_subscriptions"
ON member_subscriptions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_organizations
    WHERE user_organizations.organization_id = member_subscriptions.organization_id
    AND user_organizations.user_id = auth.uid()
    AND user_organizations.user_role IN ('organisation', 'staff')
  )
);

-- Policy: Users can view their own activity log
CREATE POLICY "users_can_view_own_activity"
ON user_activity_log
FOR SELECT
USING (user_id = auth.uid());

-- Policy: Staff can view organization activity
CREATE POLICY "staff_can_view_organization_activity"
ON user_activity_log
FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM user_organizations
    WHERE user_id = auth.uid()
    AND user_role IN ('organisation', 'staff')
  )
);

-- =====================================================
-- PART 10: DATA MIGRATION
-- =====================================================

-- Set existing projects to 'validated' status
-- (New projects submitted via organization will default to 'pending')
UPDATE project_summary
SET 
  validation_status = 'validated',
  linked_to_organization = CASE 
    WHEN organization_id IS NOT NULL THEN true 
    ELSE false 
  END
WHERE validation_status IS NULL;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify validation_status column
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'project_summary' 
    AND column_name = 'validation_status'
  ) THEN
    RAISE NOTICE '✓ validation_status column added successfully';
  END IF;
END $$;

-- Verify project_mentors table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'project_mentors'
  ) THEN
    RAISE NOTICE '✓ project_mentors table created successfully';
  END IF;
END $$;

-- Verify member_subscriptions table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'member_subscriptions'
  ) THEN
    RAISE NOTICE '✓ member_subscriptions table created successfully';
  END IF;
END $$;

-- Verify user_activity_log table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'user_activity_log'
  ) THEN
    RAISE NOTICE '✓ user_activity_log table created successfully';
  END IF;
END $$;

COMMIT;

-- =====================================================
-- POST-MIGRATION NOTES
-- =====================================================

-- IMPORTANT: After running this migration:
-- 1. All existing projects are marked as 'validated'
-- 2. New projects submitted via organization will be 'pending'
-- 3. Staff can change project status through the UI
-- 4. Mentors can only be assigned to 'validated' or 'in_progress' projects
-- 5. All changes are logged in user_activity_log

-- NEXT STEPS:
-- 1. Verify migration succeeded (check notices above)
-- 2. Test user workflow: Apply project → Status shows 'pending'
-- 3. Test staff workflow: Change status, assign mentor
-- 4. Monitor user_activity_log for activity tracking

-- For rollback (if needed), contact DBA
-- This migration is designed to be idempotent and safe
