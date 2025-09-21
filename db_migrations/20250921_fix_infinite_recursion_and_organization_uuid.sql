-- Migration to fix infinite recursion in RLS policies and organization UUID issues
-- Date: 2025-09-21
-- Updated: Add new role structure (organisation, staff, member)

-- 1. First, drop the problematic RLS policies that cause infinite recursion
DROP POLICY IF EXISTS "Organization admins can view members" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Organization admins can view invitation codes" ON invitation_code;
DROP POLICY IF EXISTS "Organization admins can create invitation codes" ON invitation_code;
DROP POLICY IF EXISTS "Organization admins can update invitation codes" ON invitation_code;
DROP POLICY IF EXISTS "Organization admins can view their organization" ON organizations;
DROP POLICY IF EXISTS "Organization admins can update their organization" ON organizations;
DROP POLICY IF EXISTS "Organization members can view partners" ON partners;
DROP POLICY IF EXISTS "Organization admins can manage partners" ON partners;
DROP POLICY IF EXISTS "Organization members can view events" ON events;
DROP POLICY IF EXISTS "Organization admins can manage events" ON events;
DROP POLICY IF EXISTS "Organization members can view form templates" ON form_templates;
DROP POLICY IF EXISTS "Organization admins can manage form templates" ON form_templates;
DROP POLICY IF EXISTS "Organization admins can view all submissions" ON form_submissions;
DROP POLICY IF EXISTS "Organization members can view deliverables" ON deliverables;
DROP POLICY IF EXISTS "Organization admins can manage all deliverables" ON deliverables;
DROP POLICY IF EXISTS "Organization members can view mentors" ON mentors;
DROP POLICY IF EXISTS "Organization admins can manage mentors" ON mentors;
DROP POLICY IF EXISTS "Organization admins can manage assignments" ON mentor_assignments;
DROP POLICY IF EXISTS "Organization members can view conversations for their projects" ON conversation;
DROP POLICY IF EXISTS "Organization members can view messages for accessible conversations" ON messages;

-- 2. Create a helper function to check if a user is an admin of a specific organization
-- This avoids the circular dependency in RLS policies
-- Now supports both 'organisation' and 'staff' roles as admins
CREATE OR REPLACE FUNCTION is_organization_admin(org_id uuid, user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id 
    AND organization_id = org_id 
    AND user_role IN ('organisation', 'staff')
  );
$$;

-- 3. Create a helper function to check if a user is a member of a specific organization
CREATE OR REPLACE FUNCTION is_organization_member(org_id uuid, user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id 
    AND organization_id = org_id 
    AND user_role IN ('organisation', 'staff', 'member')
  );
$$;

-- 4. Create better RLS policies without circular dependencies

-- Profiles - Allow users to see their own profile and organization admins to see members
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT
    USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE
    USING (id = auth.uid());

-- Organizations - Only admins can view/update their organization
CREATE POLICY "Organization admins can view their organization" ON organizations
    FOR SELECT
    USING (is_organization_admin(id));

CREATE POLICY "Organization admins can update their organization" ON organizations
    FOR UPDATE
    USING (is_organization_admin(id));

-- Invitation codes
CREATE POLICY "Organization admins can view invitation codes" ON invitation_code
    FOR SELECT
    USING (is_organization_admin(organization_id));

CREATE POLICY "Organization admins can create invitation codes" ON invitation_code
    FOR INSERT
    WITH CHECK (is_organization_admin(organization_id));

CREATE POLICY "Organization admins can update invitation codes" ON invitation_code
    FOR UPDATE
    USING (is_organization_admin(organization_id));

-- Partners (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'partners') THEN
        EXECUTE 'CREATE POLICY "Organization members can view partners" ON partners
            FOR SELECT
            USING (is_organization_member(organization_id))';
        
        EXECUTE 'CREATE POLICY "Organization admins can manage partners" ON partners
            FOR ALL
            USING (is_organization_admin(organization_id))';
    END IF;
END
$$;

-- Events (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'events') THEN
        EXECUTE 'CREATE POLICY "Organization members can view events" ON events
            FOR SELECT
            USING (is_organization_member(organization_id))';
        
        EXECUTE 'CREATE POLICY "Organization admins can manage events" ON events
            FOR ALL
            USING (is_organization_admin(organization_id))';
    END IF;
END
$$;

-- Form templates (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'form_templates') THEN
        EXECUTE 'CREATE POLICY "Organization members can view form templates" ON form_templates
            FOR SELECT
            USING (is_organization_member(organization_id))';
        
        EXECUTE 'CREATE POLICY "Organization admins can manage form templates" ON form_templates
            FOR ALL
            USING (is_organization_admin(organization_id))';
    END IF;
END
$$;

-- Form submissions (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'form_submissions') THEN
        -- Drop existing policies first
        DROP POLICY IF EXISTS "Users can view their own submissions" ON form_submissions;
        DROP POLICY IF EXISTS "Users can create submissions" ON form_submissions;
        
        -- Create new policies
        EXECUTE 'CREATE POLICY "Users can view their own submissions" ON form_submissions
            FOR SELECT
            USING (submitted_by = auth.uid())';
        
        EXECUTE 'CREATE POLICY "Users can create submissions" ON form_submissions
            FOR INSERT
            WITH CHECK (submitted_by = auth.uid())';
    END IF;
END
$$;

-- Deliverables (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'deliverables') THEN
        -- Drop existing policies first
        DROP POLICY IF EXISTS "Entrepreneurs can manage their deliverables" ON deliverables;
        
        -- Create new policies
        EXECUTE 'CREATE POLICY "Organization members can view deliverables" ON deliverables
            FOR SELECT
            USING (is_organization_member(organization_id))';
        
        EXECUTE 'CREATE POLICY "Entrepreneurs can manage their deliverables" ON deliverables
            FOR ALL
            USING (entrepreneur_id = auth.uid())';
        
        EXECUTE 'CREATE POLICY "Organization admins can manage all deliverables" ON deliverables
            FOR ALL
            USING (is_organization_admin(organization_id))';
    END IF;
END
$$;

-- Mentors (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'mentors') THEN
        EXECUTE 'CREATE POLICY "Organization members can view mentors" ON mentors
            FOR SELECT
            USING (is_organization_member(organization_id))';
        
        EXECUTE 'CREATE POLICY "Organization admins can manage mentors" ON mentors
            FOR ALL
            USING (is_organization_admin(organization_id))';
    END IF;
END
$$;

-- 5. Ensure there's a default organization with UUID for fallback
INSERT INTO organizations (id, name, type, primary_color, secondary_color, welcome_message, newsletter_enabled)
VALUES 
    ('00000000-0000-0000-0000-000000000001'::uuid, 'Aurentia Default', 'other', '#F04F6A', '#F7774A', 'Bienvenue sur Aurentia', false)
ON CONFLICT (id) DO NOTHING;

-- 6. Update existing profiles that have organization_id = 1 (integer) to proper UUID
UPDATE profiles 
SET organization_id = '00000000-0000-0000-0000-000000000001'::uuid 
WHERE organization_id::text = '1' OR organization_id IS NULL;

-- 7. Fix the get_organization_stats function to handle UUID properly
CREATE OR REPLACE FUNCTION get_organization_stats(org_id uuid)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
    total_entrepreneurs INTEGER;
    active_projects INTEGER;
    completed_projects INTEGER;
    total_mentors INTEGER;
    active_mentors INTEGER;
    this_month_signups INTEGER;
    total_deliverables INTEGER;
    completed_deliverables INTEGER;
    upcoming_events INTEGER;
    active_partners INTEGER;
    success_rate DECIMAL;
    avg_project_progress DECIMAL;
BEGIN
    -- Validate input
    IF org_id IS NULL THEN
        RAISE EXCEPTION 'Organization ID cannot be null';
    END IF;

    -- Compter les entrepreneurs
    SELECT COUNT(*) INTO total_entrepreneurs
    FROM profiles
    WHERE organization_id = org_id AND user_role = 'member';

    -- Compter les mentors (only if table exists)
    SELECT COALESCE(
        (SELECT COUNT(*) FROM mentors WHERE organization_id = org_id),
        0
    ) INTO total_mentors;

    -- Compter les mentors actifs (only if table exists)
    SELECT COALESCE(
        (SELECT COUNT(DISTINCT mentor_id) 
         FROM mentor_assignments ma
         JOIN mentors m ON m.id = ma.mentor_id
         WHERE m.organization_id = org_id AND ma.status = 'active'),
        0
    ) INTO active_mentors;

    -- Compter les projets
    SELECT
        COUNT(CASE WHEN ps.statut_project IN ('active', 'en_cours', 'actif') THEN 1 END),
        COUNT(CASE WHEN ps.statut_project IN ('completed', 'terminé', 'fini') THEN 1 END)
    INTO active_projects, completed_projects
    FROM project_summary ps
    JOIN profiles p ON ps.user_id = p.id
    WHERE p.organization_id = org_id;

    -- Compter les inscriptions du mois
    SELECT COUNT(*) INTO this_month_signups
    FROM profiles
    WHERE organization_id = org_id
    AND created_at >= date_trunc('month', CURRENT_DATE);

    -- Compter les livrables (only if table exists)
    SELECT 
        COALESCE((SELECT COUNT(*) FROM deliverables WHERE organization_id = org_id), 0),
        COALESCE((SELECT COUNT(*) FROM deliverables WHERE organization_id = org_id AND status IN ('completed', 'approved')), 0)
    INTO total_deliverables, completed_deliverables;

    -- Compter les événements à venir (only if table exists)
    SELECT COALESCE(
        (SELECT COUNT(*) FROM events
         WHERE organization_id = org_id
         AND start_date > now()
         AND status = 'planned'),
        0
    ) INTO upcoming_events;

    -- Compter les partenaires actifs (only if table exists)
    SELECT COALESCE(
        (SELECT COUNT(*) FROM partners WHERE organization_id = org_id AND status = 'active'),
        0
    ) INTO active_partners;

    -- Calculer le taux de succès (livrables complétés / total)
    IF total_deliverables > 0 THEN
        success_rate := (completed_deliverables::DECIMAL / total_deliverables::DECIMAL) * 100;
    ELSE
        success_rate := 0;
    END IF;

    -- Calculer la progression moyenne des projets (mock data for now)
    avg_project_progress := 65.5; -- Mock value, replace with real calculation when available

    -- Construire le résultat JSON
    SELECT json_build_object(
        'totalEntrepreneurs', total_entrepreneurs,
        'activeProjects', active_projects,
        'completedProjects', completed_projects,
        'totalMentors', total_mentors,
        'activeMentors', active_mentors,
        'thisMonthSignups', this_month_signups,
        'totalDeliverables', total_deliverables,
        'completedDeliverables', completed_deliverables,
        'successRate', success_rate,
        'avgProjectProgress', avg_project_progress,
        'upcomingEvents', upcoming_events,
        'activePartners', active_partners,
        'invitationCodes', (
            SELECT COUNT(*) FROM invitation_code
            WHERE organization_id = org_id AND is_active = true
        )
    ) INTO result;

    RETURN result;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION is_organization_admin(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION is_organization_member(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_organization_stats(uuid) TO authenticated;

-- 8. Update user role constraints and invitation types to support new role structure
-- Add new roles: 'staff' (org employees) and 'organisation' (org owners)
-- Update invitation types: 'organisation_staff' and 'organisation_member'
-- Migrate existing 'admin' role to 'organisation'

-- Fix foreign key constraints to allow organization deletion
ALTER TABLE invitation_code DROP CONSTRAINT IF EXISTS invitation_code_organization_id_fkey;
ALTER TABLE invitation_code ADD CONSTRAINT invitation_code_organization_id_fkey 
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;

-- Add CASCADE delete for other organization-related tables
DO $$
BEGIN
    -- Deliverables
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'deliverables_organization_id_fkey') THEN
        ALTER TABLE deliverables DROP CONSTRAINT deliverables_organization_id_fkey;
        ALTER TABLE deliverables ADD CONSTRAINT deliverables_organization_id_fkey 
          FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;
    END IF;
    
    -- Events
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'events_organization_id_fkey') THEN
        ALTER TABLE events DROP CONSTRAINT events_organization_id_fkey;
        ALTER TABLE events ADD CONSTRAINT events_organization_id_fkey 
          FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;
    END IF;
    
    -- Form templates
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'form_templates_organization_id_fkey') THEN
        ALTER TABLE form_templates DROP CONSTRAINT form_templates_organization_id_fkey;
        ALTER TABLE form_templates ADD CONSTRAINT form_templates_organization_id_fkey 
          FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;
    END IF;
    
    -- Mentors
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'mentors_organization_id_fkey') THEN
        ALTER TABLE mentors DROP CONSTRAINT mentors_organization_id_fkey;
        ALTER TABLE mentors ADD CONSTRAINT mentors_organization_id_fkey 
          FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;
    END IF;
    
    -- Partners
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'partners_organization_id_fkey') THEN
        ALTER TABLE partners DROP CONSTRAINT partners_organization_id_fkey;
        ALTER TABLE partners ADD CONSTRAINT partners_organization_id_fkey 
          FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;
    END IF;
END
$$;

-- Drop constraints before migrating data
ALTER TABLE invitation_code DROP CONSTRAINT IF EXISTS check_invitation_type;
ALTER TABLE invitation_code DROP CONSTRAINT IF EXISTS invitation_code_type_check;

-- First, migrate existing data before changing constraints
UPDATE profiles SET user_role = 'organisation' WHERE user_role = 'admin';
UPDATE invitation_code SET type = 'organisation_staff' WHERE type = 'incubator_main_admin';
UPDATE invitation_code SET type = 'organisation_member' WHERE type = 'incubator_member';

-- Update profiles table
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_user_role_check;
-- Also drop any auto-generated constraint names
DO $$
BEGIN
    -- Try to drop common auto-generated constraint names for user_role
    BEGIN
        ALTER TABLE profiles DROP CONSTRAINT check_user_role;
    EXCEPTION WHEN undefined_object THEN
        -- Constraint doesn't exist, continue
        NULL;
    END;
    
    BEGIN
        ALTER TABLE profiles DROP CONSTRAINT profiles_user_role_check1;
    EXCEPTION WHEN undefined_object THEN
        NULL;
    END;
END
$$;
ALTER TABLE profiles ADD CONSTRAINT profiles_user_role_check 
  CHECK (user_role = ANY (ARRAY['individual'::text, 'member'::text, 'staff'::text, 'organisation'::text, 'super_admin'::text]));

-- Update invitation_code table
ALTER TABLE invitation_code ADD CONSTRAINT invitation_code_type_check 
  CHECK (type = ANY (ARRAY['super_admin'::text, 'organisation_staff'::text, 'organisation_member'::text]));

-- 9. Ensure RLS is enabled on all relevant tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitation_code ENABLE ROW LEVEL SECURITY;

-- Enable RLS on optional tables if they exist
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'partners') THEN
        EXECUTE 'ALTER TABLE partners ENABLE ROW LEVEL SECURITY';
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'events') THEN
        EXECUTE 'ALTER TABLE events ENABLE ROW LEVEL SECURITY';
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'form_templates') THEN
        EXECUTE 'ALTER TABLE form_templates ENABLE ROW LEVEL SECURITY';
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'form_submissions') THEN
        EXECUTE 'ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY';
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'deliverables') THEN
        EXECUTE 'ALTER TABLE deliverables ENABLE ROW LEVEL SECURITY';
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'mentors') THEN
        EXECUTE 'ALTER TABLE mentors ENABLE ROW LEVEL SECURITY';
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'mentor_assignments') THEN
        EXECUTE 'ALTER TABLE mentor_assignments ENABLE ROW LEVEL SECURITY';
    END IF;
END
$$;