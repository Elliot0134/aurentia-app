-- =====================================================
-- Migration: Add Extended Fields for Organisation Module
-- Date: 2025-10-04
-- Purpose: Add missing fields identified in data audit
-- =====================================================

BEGIN;

-- =====================================================
-- PART 1: MENTORS TABLE UPDATES
-- =====================================================

-- Add availability tracking
ALTER TABLE mentors
ADD COLUMN IF NOT EXISTS availability JSONB DEFAULT '{"days_per_week": 0, "hours_per_week": 0, "preferred_days": []}'::jsonb,
ADD COLUMN IF NOT EXISTS max_projects INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS max_entrepreneurs INTEGER DEFAULT 10;

COMMENT ON COLUMN mentors.availability IS 'JSON structure: {days_per_week, hours_per_week, preferred_days[]}';
COMMENT ON COLUMN mentors.max_projects IS 'Maximum number of projects a mentor can handle simultaneously';
COMMENT ON COLUMN mentors.max_entrepreneurs IS 'Maximum number of entrepreneurs a mentor can mentor';

-- =====================================================
-- PART 2: PROFILES TABLE UPDATES
-- =====================================================

-- Add professional and social links
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS website TEXT;

-- Add cohort and program information
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS cohort_year INTEGER,
ADD COLUMN IF NOT EXISTS program_type TEXT;

-- Add availability and budget
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS availability_schedule JSONB DEFAULT '{"days_per_month": 0, "preferred_schedule": []}'::jsonb,
ADD COLUMN IF NOT EXISTS training_budget DECIMAL(10,2) DEFAULT 0;

COMMENT ON COLUMN profiles.linkedin_url IS 'LinkedIn profile URL';
COMMENT ON COLUMN profiles.website IS 'Personal or business website URL';
COMMENT ON COLUMN profiles.cohort_year IS 'Year of cohort/promotion (e.g., 2024)';
COMMENT ON COLUMN profiles.program_type IS 'Type of program enrolled in';
COMMENT ON COLUMN profiles.availability_schedule IS 'JSON structure: {days_per_month, preferred_schedule[]}';
COMMENT ON COLUMN profiles.training_budget IS 'Available training budget in euros';

-- =====================================================
-- PART 3: PROJECTS TABLE UPDATES (new projects table)
-- =====================================================

-- Add business context fields
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS business_type TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS stage TEXT CHECK (stage IN ('idea', 'prototype', 'mvp', 'market', 'growth'));

-- Add resource and legal fields
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS required_resources TEXT[],
ADD COLUMN IF NOT EXISTS legal_status TEXT,
ADD COLUMN IF NOT EXISTS ip_status TEXT CHECK (ip_status IN ('none', 'pending', 'registered', 'protected'));

-- Add financial fields
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS revenue DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS funding_planned BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS funding_amount DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS team_size INTEGER DEFAULT 1;

COMMENT ON COLUMN projects.business_type IS 'Type of business (e.g., SaaS, E-commerce, Consulting)';
COMMENT ON COLUMN projects.city IS 'City where the project is based';
COMMENT ON COLUMN projects.stage IS 'Current stage of project development';
COMMENT ON COLUMN projects.required_resources IS 'Array of required resources/skills';
COMMENT ON COLUMN projects.legal_status IS 'Legal structure status (e.g., created, in-progress, not-started)';
COMMENT ON COLUMN projects.ip_status IS 'Intellectual property protection status';
COMMENT ON COLUMN projects.revenue IS 'Current revenue if applicable';
COMMENT ON COLUMN projects.funding_planned IS 'Whether funding is planned';
COMMENT ON COLUMN projects.funding_amount IS 'Amount of funding planned';
COMMENT ON COLUMN projects.team_size IS 'Number of people in the team';

-- =====================================================
-- PART 4: NEW TABLE - Member Subscriptions
-- =====================================================

CREATE TABLE IF NOT EXISTS member_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  subscription_type TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'overdue', 'cancelled', 'pending')),
  last_payment_date TIMESTAMPTZ,
  next_payment_date TIMESTAMPTZ,
  days_overdue INTEGER DEFAULT 0,
  payment_frequency TEXT DEFAULT 'monthly' CHECK (payment_frequency IN ('monthly', 'quarterly', 'yearly', 'one-time')),
  auto_renew BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

-- =====================================================
-- PART 5: PROJECT VALIDATION AND MENTOR ASSIGNMENT
-- =====================================================

-- Add validation status to project_summary
ALTER TABLE project_summary
ADD COLUMN IF NOT EXISTS validation_status TEXT DEFAULT 'validated' 
  CHECK (validation_status IN ('pending', 'validated', 'rejected', 'in_progress', 'completed'));

ALTER TABLE project_summary
ADD COLUMN IF NOT EXISTS linked_to_organization BOOLEAN DEFAULT FALSE;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_project_summary_validation_status 
  ON project_summary(validation_status);

CREATE INDEX IF NOT EXISTS idx_project_summary_linked_org 
  ON project_summary(linked_to_organization);

CREATE INDEX IF NOT EXISTS idx_project_summary_organization_id
  ON project_summary(organization_id);

COMMENT ON COLUMN project_summary.validation_status IS 'Validation status: pending (awaiting review), validated (approved), rejected (denied), in_progress (being worked on), completed (finished)';
COMMENT ON COLUMN project_summary.linked_to_organization IS 'Whether project has been submitted to organization for validation';

-- Create project_mentors table for mentor assignments
CREATE TABLE IF NOT EXISTS project_mentors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES project_summary(project_id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_project_mentor UNIQUE (project_id, mentor_id)
);

CREATE INDEX IF NOT EXISTS idx_project_mentors_project_id ON project_mentors(project_id);
CREATE INDEX IF NOT EXISTS idx_project_mentors_mentor_id ON project_mentors(mentor_id);
CREATE INDEX IF NOT EXISTS idx_project_mentors_status ON project_mentors(status);

COMMENT ON TABLE project_mentors IS 'Links mentors to projects they are supporting';
COMMENT ON COLUMN project_mentors.status IS 'Status of the mentorship: active (ongoing), inactive (paused), completed (finished)';

-- =====================================================
-- PART 6: NEW TABLE - Member Subscriptions (CONTINUED)
-- =====================================================
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique active subscription per user per organization
  CONSTRAINT unique_active_subscription UNIQUE (user_id, organization_id, status)
);

COMMENT ON TABLE member_subscriptions IS 'Track member subscription payments and status';
COMMENT ON COLUMN member_subscriptions.days_overdue IS 'Number of days the payment is overdue (auto-calculated)';
COMMENT ON COLUMN member_subscriptions.payment_frequency IS 'How often the subscription renews';
COMMENT ON COLUMN member_subscriptions.auto_renew IS 'Whether the subscription auto-renews';

-- Indexes for member_subscriptions
CREATE INDEX IF NOT EXISTS idx_member_subscriptions_user_org ON member_subscriptions(user_id, organization_id);
CREATE INDEX IF NOT EXISTS idx_member_subscriptions_status ON member_subscriptions(status) WHERE status = 'overdue';
CREATE INDEX IF NOT EXISTS idx_member_subscriptions_next_payment ON member_subscriptions(next_payment_date) WHERE status = 'active';

-- Function to auto-update days_overdue
CREATE OR REPLACE FUNCTION update_subscription_overdue_days()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'overdue' AND NEW.next_payment_date IS NOT NULL THEN
    NEW.days_overdue := GREATEST(0, EXTRACT(DAY FROM (NOW() - NEW.next_payment_date))::INTEGER);
  ELSE
    NEW.days_overdue := 0;
  END IF;
  
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_subscription_overdue
  BEFORE INSERT OR UPDATE ON member_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_overdue_days();

-- =====================================================
-- PART 5: NEW TABLE - User Activity Log
-- =====================================================

CREATE TABLE IF NOT EXISTS user_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  activity_description TEXT,
  related_entity_type TEXT, -- 'project', 'event', 'conversation', 'deliverable', 'subscription'
  related_entity_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE user_activity_log IS 'Comprehensive activity log for users within organizations';
COMMENT ON COLUMN user_activity_log.activity_type IS 'Type of activity (e.g., login, project_created, event_attended, message_sent)';
COMMENT ON COLUMN user_activity_log.related_entity_type IS 'Type of entity the activity is related to';
COMMENT ON COLUMN user_activity_log.related_entity_id IS 'UUID of the related entity';
COMMENT ON COLUMN user_activity_log.metadata IS 'Additional JSON metadata for the activity';

-- Indexes for activity log
CREATE INDEX IF NOT EXISTS idx_activity_log_user ON user_activity_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_org ON user_activity_log(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_entity ON user_activity_log(related_entity_type, related_entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_type ON user_activity_log(activity_type);

-- =====================================================
-- PART 6: HELPER FUNCTIONS
-- =====================================================

-- Function to log user activity
CREATE OR REPLACE FUNCTION log_user_activity(
  p_user_id UUID,
  p_organization_id UUID,
  p_activity_type TEXT,
  p_description TEXT DEFAULT NULL,
  p_entity_type TEXT DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS UUID AS $$
DECLARE
  v_activity_id UUID;
BEGIN
  INSERT INTO user_activity_log (
    user_id,
    organization_id,
    activity_type,
    activity_description,
    related_entity_type,
    related_entity_id,
    metadata
  ) VALUES (
    p_user_id,
    p_organization_id,
    p_activity_type,
    p_description,
    p_entity_type,
    p_entity_id,
    p_metadata
  ) RETURNING id INTO v_activity_id;
  
  RETURN v_activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check subscription status
CREATE OR REPLACE FUNCTION check_subscription_status(p_user_id UUID, p_organization_id UUID)
RETURNS TABLE (
  is_paid BOOLEAN,
  days_overdue INTEGER,
  next_payment_date TIMESTAMPTZ,
  subscription_status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE WHEN ms.status = 'active' THEN true ELSE false END as is_paid,
    COALESCE(ms.days_overdue, 0) as days_overdue,
    ms.next_payment_date,
    COALESCE(ms.status, 'none'::TEXT) as subscription_status
  FROM member_subscriptions ms
  WHERE ms.user_id = p_user_id 
    AND ms.organization_id = p_organization_id
  ORDER BY ms.created_at DESC
  LIMIT 1;
  
  -- If no subscription found, return default values
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0, NULL::TIMESTAMPTZ, 'none'::TEXT;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PART 7: ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE member_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;

-- Policies for member_subscriptions
CREATE POLICY "Users can view their own subscriptions"
  ON member_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Organization staff can view member subscriptions"
  ON member_subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations uo
      WHERE uo.organization_id = member_subscriptions.organization_id
        AND uo.user_id = auth.uid()
        AND uo.user_role IN ('organisation', 'staff')
        AND uo.status = 'active'
    )
  );

CREATE POLICY "Organization staff can manage subscriptions"
  ON member_subscriptions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations uo
      WHERE uo.organization_id = member_subscriptions.organization_id
        AND uo.user_id = auth.uid()
        AND uo.user_role IN ('organisation', 'staff')
        AND uo.status = 'active'
    )
  );

-- Policies for user_activity_log
CREATE POLICY "Users can view their own activity"
  ON user_activity_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Organization staff can view member activity"
  ON user_activity_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations uo
      WHERE uo.organization_id = user_activity_log.organization_id
        AND uo.user_id = auth.uid()
        AND uo.user_role IN ('organisation', 'staff')
        AND uo.status = 'active'
    )
  );

CREATE POLICY "System can insert activity logs"
  ON user_activity_log FOR INSERT
  WITH CHECK (true); -- Allow system to log activities

-- =====================================================
-- PART 8: SAMPLE DATA (OPTIONAL - COMMENT OUT FOR PRODUCTION)
-- =====================================================

-- Uncomment to add sample subscriptions for testing
/*
INSERT INTO member_subscriptions (user_id, organization_id, subscription_type, amount, status, last_payment_date, next_payment_date)
SELECT 
  uo.user_id,
  uo.organization_id,
  'monthly_basic',
  50.00,
  CASE 
    WHEN random() < 0.7 THEN 'active'
    WHEN random() < 0.9 THEN 'overdue'
    ELSE 'pending'
  END,
  NOW() - INTERVAL '30 days',
  NOW() + INTERVAL '30 days'
FROM user_organizations uo
WHERE uo.user_role = 'member'
  AND uo.status = 'active'
ON CONFLICT DO NOTHING;
*/

COMMIT;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify new columns exist
DO $$
BEGIN
  RAISE NOTICE 'Verifying new columns...';
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mentors' AND column_name = 'availability') THEN
    RAISE NOTICE '✓ mentors.availability column added';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'linkedin_url') THEN
    RAISE NOTICE '✓ profiles.linkedin_url column added';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'stage') THEN
    RAISE NOTICE '✓ projects.stage column added';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'member_subscriptions') THEN
    RAISE NOTICE '✓ member_subscriptions table created';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_activity_log') THEN
    RAISE NOTICE '✓ user_activity_log table created';
  END IF;
  
  RAISE NOTICE 'Migration completed successfully!';
END $$;
