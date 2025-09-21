-- Migration complète pour finaliser l'intégration des organisations
-- Cette version inclut TOUTES les tables et colonnes nécessaires
-- Version optimisée utilisant le système de conversation existant

-- 1. S'assurer que les colonnes essentielles existent dans profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id),
ADD COLUMN IF NOT EXISTS first_name text,
ADD COLUMN IF NOT EXISTS last_name text,
ADD COLUMN IF NOT EXISTS phone text;

-- 2. Ajouter les colonnes manquantes à organizations
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS logo text,
ADD COLUMN IF NOT EXISTS website text,
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS settings jsonb DEFAULT '{
    "notifications": {
        "emailNotifications": true,
        "projectUpdates": true,
        "mentorAssignments": true,
        "weeklyReports": false,
        "systemAlerts": true
    },
    "branding": {
        "primaryColor": "#ff5932",
        "secondaryColor": "#1a1a1a"
    },
    "security": {
        "twoFactorRequired": false,
        "passwordPolicy": "medium",
        "sessionTimeout": 480
    }
}';

-- 3. Créer la table des partenaires
CREATE TABLE IF NOT EXISTS partners (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
    name text NOT NULL,
    type text NOT NULL CHECK (type IN ('investor', 'accelerator', 'incubator', 'corporate', 'government', 'university', 'other')),
    description text,
    logo text,
    website text,
    email text,
    phone text,
    collaboration_type text[] DEFAULT '{}',
    rating integer DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'prospect')),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 4. Créer la table des événements
CREATE TABLE IF NOT EXISTS events (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    start_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone NOT NULL,
    type text NOT NULL CHECK (type IN ('workshop', 'meeting', 'webinar', 'networking', 'presentation', 'training', 'other')),
    location text,
    organizer_id uuid REFERENCES profiles(id),
    is_recurring boolean DEFAULT false,
    max_participants integer,
    participants text[] DEFAULT '{}',
    status text DEFAULT 'planned' CHECK (status IN ('planned', 'ongoing', 'completed', 'cancelled')),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 5. Créer la table des modèles de formulaires
CREATE TABLE IF NOT EXISTS form_templates (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    category text NOT NULL CHECK (category IN ('onboarding', 'feedback', 'evaluation', 'survey', 'application', 'custom')),
    fields jsonb NOT NULL DEFAULT '[]',
    created_by uuid REFERENCES profiles(id),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 6. Créer la table des soumissions de formulaires
CREATE TABLE IF NOT EXISTS form_submissions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    form_id uuid REFERENCES form_templates(id) ON DELETE CASCADE,
    submitted_by uuid REFERENCES profiles(id),
    data jsonb NOT NULL DEFAULT '{}',
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'approved', 'rejected')),
    submitted_at timestamp with time zone DEFAULT now(),
    reviewed_by uuid REFERENCES profiles(id),
    reviewed_at timestamp with time zone,
    notes text
);

-- 7. Créer la table des livrables
CREATE TABLE IF NOT EXISTS deliverables (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
    project_id uuid REFERENCES project_summary(project_id) ON DELETE CASCADE,
    entrepreneur_id uuid REFERENCES profiles(id),
    title text NOT NULL,
    description text,
    type text NOT NULL CHECK (type IN ('business-model', 'market-analysis', 'pitch', 'legal', 'financial', 'prototype', 'presentation', 'other')),
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'reviewed', 'approved')),
    quality_score integer CHECK (quality_score >= 0 AND quality_score <= 100),
    due_date timestamp with time zone,
    completed_at timestamp with time zone,
    file_url text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 8. Créer la table des mentors/experts
CREATE TABLE IF NOT EXISTS mentors (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
    expertise text[] DEFAULT '{}',
    bio text,
    linkedin_url text,
    status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    total_entrepreneurs integer DEFAULT 0,
    success_rate decimal DEFAULT 0,
    rating decimal DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, organization_id)
);

-- 9. Créer la table des relations mentor-entrepreneur
CREATE TABLE IF NOT EXISTS mentor_assignments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    mentor_id uuid REFERENCES mentors(id) ON DELETE CASCADE,
    entrepreneur_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    project_id uuid REFERENCES project_summary(project_id) ON DELETE CASCADE,
    assigned_at timestamp with time zone DEFAULT now(),
    status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    notes text,
    UNIQUE(mentor_id, entrepreneur_id, project_id)
);

-- 10. Chat system: Using existing conversation and messages tables
-- No need to create new tables as the existing conversation/messages system
-- already provides all the functionality needed for organization chat
-- conversation table: id, user_id, project_id, title, created_at, updated_at
-- messages table: id, conversation_id, sender, content, created_at

-- 11. Ajouter les indexes pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_profiles_organization_id ON profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_role ON profiles(user_role);
CREATE INDEX IF NOT EXISTS idx_invitation_code_organization_id ON invitation_code(organization_id);
CREATE INDEX IF NOT EXISTS idx_invitation_code_is_active ON invitation_code(is_active);

-- Index pour partners
CREATE INDEX IF NOT EXISTS idx_partners_organization_id ON partners(organization_id);
CREATE INDEX IF NOT EXISTS idx_partners_type ON partners(type);
CREATE INDEX IF NOT EXISTS idx_partners_status ON partners(status);

-- Index pour events
CREATE INDEX IF NOT EXISTS idx_events_organization_id ON events(organization_id);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON events(organizer_id);

-- Index pour form_templates
CREATE INDEX IF NOT EXISTS idx_form_templates_organization_id ON form_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_form_templates_category ON form_templates(category);
CREATE INDEX IF NOT EXISTS idx_form_templates_is_active ON form_templates(is_active);

-- Index pour form_submissions
CREATE INDEX IF NOT EXISTS idx_form_submissions_form_id ON form_submissions(form_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_submitted_by ON form_submissions(submitted_by);
CREATE INDEX IF NOT EXISTS idx_form_submissions_status ON form_submissions(status);

-- Index pour deliverables
CREATE INDEX IF NOT EXISTS idx_deliverables_organization_id ON deliverables(organization_id);
CREATE INDEX IF NOT EXISTS idx_deliverables_project_id ON deliverables(project_id);
CREATE INDEX IF NOT EXISTS idx_deliverables_entrepreneur_id ON deliverables(entrepreneur_id);
CREATE INDEX IF NOT EXISTS idx_deliverables_status ON deliverables(status);
CREATE INDEX IF NOT EXISTS idx_deliverables_type ON deliverables(type);

-- Index pour mentors
CREATE INDEX IF NOT EXISTS idx_mentors_user_id ON mentors(user_id);
CREATE INDEX IF NOT EXISTS idx_mentors_organization_id ON mentors(organization_id);
CREATE INDEX IF NOT EXISTS idx_mentors_status ON mentors(status);

-- Index pour mentor_assignments
CREATE INDEX IF NOT EXISTS idx_mentor_assignments_mentor_id ON mentor_assignments(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_assignments_entrepreneur_id ON mentor_assignments(entrepreneur_id);
CREATE INDEX IF NOT EXISTS idx_mentor_assignments_project_id ON mentor_assignments(project_id);

-- Index pour conversation/messages (existing tables)
-- These indexes likely already exist, but ensure they're optimized for organization usage
CREATE INDEX IF NOT EXISTS idx_conversation_project_id ON conversation(project_id);
CREATE INDEX IF NOT EXISTS idx_conversation_user_id ON conversation(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- 12. Activer RLS sur toutes les nouvelles tables
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_assignments ENABLE ROW LEVEL SECURITY;

-- Note: conversation and messages tables already have RLS enabled

-- 13. Politiques RLS pour la sécurité

-- Politiques pour profiles
CREATE POLICY "Organization admins can view members" ON profiles
    FOR SELECT
    USING (
        auth.uid() IN (
            SELECT id FROM profiles
            WHERE organization_id = profiles.organization_id
            AND user_role = 'admin'
        )
    );

-- Politiques pour invitation_code
CREATE POLICY "Organization admins can view invitation codes" ON invitation_code
    FOR SELECT
    USING (
        auth.uid() IN (
            SELECT id FROM profiles
            WHERE organization_id = invitation_code.organization_id
            AND user_role = 'admin'
        )
    );

CREATE POLICY "Organization admins can create invitation codes" ON invitation_code
    FOR INSERT
    WITH CHECK (
        auth.uid() IN (
            SELECT id FROM profiles
            WHERE organization_id = invitation_code.organization_id
            AND user_role = 'admin'
        )
    );

-- Politiques pour organizations
CREATE POLICY "Organization admins can view their organization" ON organizations
    FOR SELECT
    USING (
        auth.uid() IN (
            SELECT id FROM profiles
            WHERE organization_id = organizations.id
            AND user_role = 'admin'
        )
    );

CREATE POLICY "Organization admins can update their organization" ON organizations
    FOR UPDATE
    USING (
        auth.uid() IN (
            SELECT id FROM profiles
            WHERE organization_id = organizations.id
            AND user_role = 'admin'
        )
    );

-- Politiques pour partners
CREATE POLICY "Organization members can view partners" ON partners
    FOR SELECT
    USING (
        auth.uid() IN (
            SELECT id FROM profiles
            WHERE organization_id = partners.organization_id
        )
    );

CREATE POLICY "Organization admins can manage partners" ON partners
    FOR ALL
    USING (
        auth.uid() IN (
            SELECT id FROM profiles
            WHERE organization_id = partners.organization_id
            AND user_role = 'admin'
        )
    );

-- Politiques pour events
CREATE POLICY "Organization members can view events" ON events
    FOR SELECT
    USING (
        auth.uid() IN (
            SELECT id FROM profiles
            WHERE organization_id = events.organization_id
        )
    );

CREATE POLICY "Organization admins can manage events" ON events
    FOR ALL
    USING (
        auth.uid() IN (
            SELECT id FROM profiles
            WHERE organization_id = events.organization_id
            AND user_role = 'admin'
        )
    );

-- Politiques pour form_templates
CREATE POLICY "Organization members can view form templates" ON form_templates
    FOR SELECT
    USING (
        auth.uid() IN (
            SELECT id FROM profiles
            WHERE organization_id = form_templates.organization_id
        )
    );

CREATE POLICY "Organization admins can manage form templates" ON form_templates
    FOR ALL
    USING (
        auth.uid() IN (
            SELECT id FROM profiles
            WHERE organization_id = form_templates.organization_id
            AND user_role = 'admin'
        )
    );

-- Politiques pour form_submissions
CREATE POLICY "Users can view their own submissions" ON form_submissions
    FOR SELECT
    USING (submitted_by = auth.uid());

CREATE POLICY "Users can create submissions" ON form_submissions
    FOR INSERT
    WITH CHECK (submitted_by = auth.uid());

CREATE POLICY "Organization admins can view all submissions" ON form_submissions
    FOR SELECT
    USING (
        auth.uid() IN (
            SELECT p.id FROM profiles p
            JOIN form_templates ft ON ft.organization_id = p.organization_id
            WHERE ft.id = form_submissions.form_id
            AND p.user_role = 'admin'
        )
    );

-- Politiques pour deliverables
CREATE POLICY "Organization members can view deliverables" ON deliverables
    FOR SELECT
    USING (
        auth.uid() IN (
            SELECT id FROM profiles
            WHERE organization_id = deliverables.organization_id
        )
    );

CREATE POLICY "Entrepreneurs can manage their deliverables" ON deliverables
    FOR ALL
    USING (entrepreneur_id = auth.uid());

CREATE POLICY "Organization admins can manage all deliverables" ON deliverables
    FOR ALL
    USING (
        auth.uid() IN (
            SELECT id FROM profiles
            WHERE organization_id = deliverables.organization_id
            AND user_role = 'admin'
        )
    );

-- Politiques pour mentors
CREATE POLICY "Organization members can view mentors" ON mentors
    FOR SELECT
    USING (
        auth.uid() IN (
            SELECT id FROM profiles
            WHERE organization_id = mentors.organization_id
        )
    );

CREATE POLICY "Organization admins can manage mentors" ON mentors
    FOR ALL
    USING (
        auth.uid() IN (
            SELECT id FROM profiles
            WHERE organization_id = mentors.organization_id
            AND user_role = 'admin'
        )
    );

-- Politiques pour mentor_assignments
CREATE POLICY "Mentors can view their assignments" ON mentor_assignments
    FOR SELECT
    USING (
        mentor_id IN (
            SELECT id FROM mentors WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Entrepreneurs can view their mentor assignments" ON mentor_assignments
    FOR SELECT
    USING (entrepreneur_id = auth.uid());

CREATE POLICY "Organization admins can manage assignments" ON mentor_assignments
    FOR ALL
    USING (
        auth.uid() IN (
            SELECT p.id FROM profiles p
            JOIN mentors m ON m.organization_id = p.organization_id
            WHERE m.id = mentor_assignments.mentor_id
            AND p.user_role = 'admin'
        )
    );

-- Politiques pour conversation/messages (existing tables) - may already exist
-- These policies ensure organization members can use the chat system properly
CREATE POLICY "Organization members can view conversations for their projects" ON conversation
    FOR SELECT
    USING (
        auth.uid() IN (
            SELECT p.id FROM profiles p
            JOIN project_summary ps ON ps.user_id = p.id
            WHERE ps.project_id = conversation.project_id
        ) OR
        user_id = auth.uid()
    );

CREATE POLICY "Organization members can view messages for accessible conversations" ON messages
    FOR SELECT
    USING (
        conversation_id IN (
            SELECT c.id FROM conversation c
            WHERE c.user_id = auth.uid() OR
            c.project_id IN (
                SELECT ps.project_id FROM project_summary ps
                JOIN profiles p ON ps.user_id = p.id
                WHERE p.id = auth.uid()
            )
        )
    );

-- 14. Fonction pour calculer les statistiques d'organisation
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
    -- Compter les entrepreneurs
    SELECT COUNT(*) INTO total_entrepreneurs
    FROM profiles
    WHERE organization_id = org_id AND user_role = 'member';

    -- Compter les mentors
    SELECT COUNT(*) INTO total_mentors
    FROM mentors
    WHERE organization_id = org_id;

    -- Compter les mentors actifs (avec au moins un assignment)
    SELECT COUNT(DISTINCT mentor_id) INTO active_mentors
    FROM mentor_assignments ma
    JOIN mentors m ON m.id = ma.mentor_id
    WHERE m.organization_id = org_id AND ma.status = 'active';

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

    -- Compter les livrables
    SELECT
        COUNT(*),
        COUNT(CASE WHEN status IN ('completed', 'approved') THEN 1 END)
    INTO total_deliverables, completed_deliverables
    FROM deliverables
    WHERE organization_id = org_id;

    -- Compter les événements à venir
    SELECT COUNT(*) INTO upcoming_events
    FROM events
    WHERE organization_id = org_id
    AND start_date > now()
    AND status = 'planned';

    -- Compter les partenaires actifs
    SELECT COUNT(*) INTO active_partners
    FROM partners
    WHERE organization_id = org_id AND status = 'active';

    -- Calculer le taux de succès (livrables complétés / total)
    IF total_deliverables > 0 THEN
        success_rate := (completed_deliverables::DECIMAL / total_deliverables::DECIMAL) * 100;
    ELSE
        success_rate := 0;
    END IF;

    -- Calculer la progression moyenne des projets
    SELECT COALESCE(AVG(CAST(avancement_global AS DECIMAL)), 0) INTO avg_project_progress
    FROM project_summary ps
    JOIN profiles p ON ps.user_id = p.id
    WHERE p.organization_id = org_id
    AND ps.statut_project IN ('active', 'en_cours', 'actif');

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

-- Donner les permissions sur la fonction
GRANT EXECUTE ON FUNCTION get_organization_stats(uuid) TO authenticated;

-- 15. Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 16. Triggers pour maintenir updated_at sur toutes les tables
CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partners_updated_at
    BEFORE UPDATE ON partners
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_form_templates_updated_at
    BEFORE UPDATE ON form_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deliverables_updated_at
    BEFORE UPDATE ON deliverables
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mentors_updated_at
    BEFORE UPDATE ON mentors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Note: conversation table already has updated_at triggers if needed