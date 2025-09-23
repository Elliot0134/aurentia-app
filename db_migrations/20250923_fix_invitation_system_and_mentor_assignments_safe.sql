-- Migration pour corriger le système d'invitation et les affectations de mentors (Version 2 - Safe)
-- Date: 2025-09-23
-- Cette version gère les conflits avec les éléments existants

-- 1. Supprimer les politiques RLS existantes si elles existent
DROP POLICY IF EXISTS "Organization members can view mentor assignments" ON mentor_assignments;
DROP POLICY IF EXISTS "Organization admins can manage mentor assignments" ON mentor_assignments;

-- 2. Supprimer les vues existantes si elles existent
DROP VIEW IF EXISTS organization_entrepreneurs;
DROP VIEW IF EXISTS organization_mentors;

-- 3. Corriger le mapping des types d'invitation pour être cohérent
-- Le problème actuel : le code frontend utilise 'entrepreneur'/'mentor' mais la DB attend 'organisation_member'/'organisation_staff'

-- Mise à jour du système de mapping des invitations
-- Créer une fonction pour mapper les rôles UI vers les user_roles DB
CREATE OR REPLACE FUNCTION map_ui_role_to_user_role(ui_role text)
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT CASE
    WHEN ui_role = 'entrepreneur' THEN 'member'
    WHEN ui_role = 'mentor' THEN 'staff'
    WHEN ui_role = 'super_admin' THEN 'super_admin'
    ELSE ui_role
  END;
$$;

-- Fonction inverse pour mapper les user_roles vers les rôles UI
CREATE OR REPLACE FUNCTION map_user_role_to_ui_role(user_role text)
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT CASE
    WHEN user_role = 'member' THEN 'entrepreneur'
    WHEN user_role = 'staff' THEN 'mentor'
    WHEN user_role = 'super_admin' THEN 'super_admin'
    ELSE user_role
  END;
$$;

-- 4. Ajouter une colonne pour traquer le rôle assigné lors de l'utilisation du code
ALTER TABLE invitation_code
ADD COLUMN IF NOT EXISTS assigned_role text CHECK (assigned_role IN ('individual', 'member', 'staff', 'organisation', 'super_admin', 'entrepreneur', 'mentor'));

-- 5. Mise à jour des codes existants pour avoir le bon assigned_role
UPDATE invitation_code
SET assigned_role = map_user_role_to_ui_role(
    CASE
        WHEN type = 'organisation_member' THEN 'member'
        WHEN type = 'organisation_staff' THEN 'staff'
        WHEN type = 'super_admin' THEN 'super_admin'
        ELSE type
    END
)
WHERE assigned_role IS NULL;

-- 6. Corriger la table mentor_assignments pour supporter les affectations
-- Ajouter une colonne pour l'assigneur et la raison de l'affectation
ALTER TABLE mentor_assignments
ADD COLUMN IF NOT EXISTS assigned_by uuid REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS assignment_reason text,
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES profiles(id);

-- 7. Créer une vue pour faciliter la gestion des entrepreneurs
CREATE OR REPLACE VIEW organization_entrepreneurs AS
SELECT
    p.id,
    p.email,
    p.first_name,
    p.last_name,
    p.phone,
    p.user_role,
    p.organization_id,
    p.created_at as joined_at,
    COALESCE(project_stats.project_count, 0) as project_count,
    COALESCE(deliverable_stats.total_deliverables, 0) as total_deliverables,
    COALESCE(deliverable_stats.completed_deliverables, 0) as completed_deliverables,
    -- Calculer le mentor assigné
    ma.mentor_id,
    mentor_profiles.first_name as mentor_first_name,
    mentor_profiles.last_name as mentor_last_name,
    mentor_profiles.email as mentor_email,
    -- Statut basé sur l'activité récente
    CASE
        WHEN p.created_at > NOW() - INTERVAL '30 days' THEN 'pending'
        WHEN recent_activity.last_activity > NOW() - INTERVAL '7 days' THEN 'active'
        ELSE 'inactive'
    END as status,
    recent_activity.last_activity
FROM profiles p
LEFT JOIN (
    SELECT
        ps.user_id,
        COUNT(*) as project_count
    FROM project_summary ps
    GROUP BY ps.user_id
) project_stats ON p.id = project_stats.user_id
LEFT JOIN (
    SELECT
        d.entrepreneur_id,
        COUNT(*) as total_deliverables,
        COUNT(CASE WHEN d.status IN ('completed', 'approved') THEN 1 END) as completed_deliverables
    FROM deliverables d
    GROUP BY d.entrepreneur_id
) deliverable_stats ON p.id = deliverable_stats.entrepreneur_id
LEFT JOIN (
    SELECT DISTINCT ON (ma.entrepreneur_id)
        ma.entrepreneur_id,
        ma.mentor_id,
        ma.assigned_at
    FROM mentor_assignments ma
    WHERE ma.status = 'active'
    ORDER BY ma.entrepreneur_id, ma.assigned_at DESC
) ma ON p.id = ma.entrepreneur_id
LEFT JOIN mentors m ON ma.mentor_id = m.id
LEFT JOIN profiles mentor_profiles ON m.user_id = mentor_profiles.id
LEFT JOIN (
    SELECT
        p.id as user_id,
        MAX(GREATEST(
            COALESCE(ps.updated_at, '1970-01-01'::timestamp),
            COALESCE(conv.updated_at, '1970-01-01'::timestamp)
        )) as last_activity
    FROM profiles p
    LEFT JOIN project_summary ps ON p.id = ps.user_id
    LEFT JOIN conversation conv ON p.id = conv.user_id
    GROUP BY p.id
) recent_activity ON p.id = recent_activity.user_id
WHERE p.user_role = 'member' AND p.organization_id IS NOT NULL;

-- 8. Créer une vue pour faciliter la gestion des mentors
CREATE OR REPLACE VIEW organization_mentors AS
SELECT
    m.id,
    p.id as user_id,
    p.email,
    p.first_name,
    p.last_name,
    p.phone,
    p.user_role,
    p.organization_id,
    p.created_at as joined_at,
    m.expertise,
    m.bio,
    m.linkedin_url,
    m.status,
    m.total_entrepreneurs,
    m.success_rate,
    m.rating,
    -- Compter les entrepreneurs actuellement assignés
    COALESCE(active_assignments.current_entrepreneurs, 0) as current_entrepreneurs
FROM mentors m
JOIN profiles p ON m.user_id = p.id
LEFT JOIN (
    SELECT
        mentor_id,
        COUNT(*) as current_entrepreneurs
    FROM mentor_assignments
    WHERE status = 'active'
    GROUP BY mentor_id
) active_assignments ON m.id = active_assignments.mentor_id
WHERE p.user_role IN ('staff', 'organisation');

-- 9. Fonction pour assigner un mentor à un entrepreneur
CREATE OR REPLACE FUNCTION assign_mentor_to_entrepreneur(
    p_mentor_id uuid,
    p_entrepreneur_id uuid,
    p_project_id uuid DEFAULT NULL,
    p_assigned_by uuid DEFAULT auth.uid(),
    p_notes text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    assignment_id uuid;
    mentor_org_id uuid;
    entrepreneur_org_id uuid;
BEGIN
    -- Vérifier que les deux utilisateurs sont dans la même organisation
    SELECT p.organization_id INTO mentor_org_id
    FROM profiles p
    JOIN mentors m ON p.id = m.user_id
    WHERE m.id = p_mentor_id;

    SELECT organization_id INTO entrepreneur_org_id
    FROM profiles
    WHERE id = p_entrepreneur_id;

    IF mentor_org_id IS NULL OR entrepreneur_org_id IS NULL OR mentor_org_id != entrepreneur_org_id THEN
        RAISE EXCEPTION 'Le mentor et l''entrepreneur doivent être dans la même organisation';
    END IF;

    -- Désactiver les assignations précédentes pour cet entrepreneur
    UPDATE mentor_assignments
    SET status = 'completed'
    WHERE entrepreneur_id = p_entrepreneur_id AND status = 'active';

    -- Créer la nouvelle assignation
    INSERT INTO mentor_assignments (
        mentor_id,
        entrepreneur_id,
        project_id,
        assigned_by,
        notes,
        status
    ) VALUES (
        p_mentor_id,
        p_entrepreneur_id,
        p_project_id,
        p_assigned_by,
        p_notes,
        'active'
    ) RETURNING id INTO assignment_id;

    -- Mettre à jour le compteur du mentor
    UPDATE mentors
    SET total_entrepreneurs = total_entrepreneurs + 1
    WHERE id = p_mentor_id;

    RETURN assignment_id;
END;
$$;

-- 10. Fonction pour créer un code d'invitation avec le bon mapping
CREATE OR REPLACE FUNCTION create_invitation_code_with_mapping(
    p_organization_id uuid,
    p_ui_role text, -- 'entrepreneur' ou 'mentor' ou 'super_admin'
    p_created_by uuid DEFAULT auth.uid(),
    p_expires_at timestamp with time zone DEFAULT NULL,
    p_max_uses integer DEFAULT 1
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    code_id uuid;
    generated_code text;
    db_type text;
    user_role text;
BEGIN
    -- Générer un code unique
    generated_code := 'INV-' || upper(substring(gen_random_uuid()::text from 1 for 6));

    -- Mapper le rôle UI vers le user_role
    user_role := map_ui_role_to_user_role(p_ui_role);

    -- Mapper vers le type d'invitation approprié
    db_type := CASE
        WHEN user_role = 'member' THEN 'organisation_member'
        WHEN user_role = 'staff' THEN 'organisation_staff'
        WHEN user_role = 'super_admin' THEN 'super_admin'
        ELSE 'organisation_member'
    END;

    -- Insérer le code
    INSERT INTO invitation_code (
        code,
        type,
        organization_id,
        created_by,
        expires_at,
        max_uses,
        assigned_role,
        current_uses,
        is_active
    ) VALUES (
        generated_code,
        db_type,
        p_organization_id,
        p_created_by,
        COALESCE(p_expires_at, NOW() + INTERVAL '30 days'),
        p_max_uses,
        user_role,
        0,
        true
    ) RETURNING id INTO code_id;

    RETURN code_id;
END;
$$;

-- 11. Fonction pour utiliser un code d'invitation avec le bon mapping de rôle
CREATE OR REPLACE FUNCTION use_invitation_code_with_role_mapping(
    p_code text,
    p_user_id uuid DEFAULT auth.uid()
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    code_record record;
    target_role text;
    result json;
BEGIN
    -- Récupérer le code et vérifier sa validité
    SELECT * INTO code_record
    FROM invitation_code
    WHERE code = p_code
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > NOW())
    AND current_uses < max_uses;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Code d''invitation invalide, expiré ou épuisé';
    END IF;

    -- Déterminer le rôle cible basé sur assigned_role ou type
    target_role := COALESCE(
        code_record.assigned_role,
        CASE
            WHEN code_record.type = 'organisation_member' THEN 'member'
            WHEN code_record.type = 'organisation_staff' THEN 'staff'
            WHEN code_record.type = 'super_admin' THEN 'super_admin'
            ELSE 'member'
        END
    );

    -- Si assigned_role contient un rôle UI, le mapper vers user_role
    IF target_role IN ('entrepreneur', 'mentor') THEN
        target_role := map_ui_role_to_user_role(target_role);
    END IF;

    -- Mettre à jour le profil utilisateur
    UPDATE profiles
    SET
        user_role = target_role,
        organization_id = code_record.organization_id,
        invitation_code_used = p_code
    WHERE id = p_user_id;

    -- Incrémenter l'utilisation du code
    UPDATE invitation_code
    SET current_uses = current_uses + 1
    WHERE id = code_record.id;

    -- Désactiver le code si max_uses est atteint
    UPDATE invitation_code
    SET is_active = false
    WHERE id = code_record.id
    AND current_uses + 1 >= max_uses;

    -- Si c'est un mentor (staff), créer l'entrée dans la table mentors
    IF target_role = 'staff' THEN
        INSERT INTO mentors (
            user_id,
            organization_id,
            status,
            total_entrepreneurs,
            success_rate,
            rating
        ) VALUES (
            p_user_id,
            code_record.organization_id,
            'active',
            0,
            0,
            0
        ) ON CONFLICT (user_id, organization_id) DO NOTHING;
    END IF;

    -- Construire le résultat
    SELECT json_build_object(
        'success', true,
        'user_role', target_role,
        'organization_id', code_record.organization_id,
        'assigned_role', COALESCE(
            CASE WHEN code_record.assigned_role IN ('entrepreneur', 'mentor') THEN code_record.assigned_role ELSE map_user_role_to_ui_role(target_role) END,
            map_user_role_to_ui_role(target_role)
        )
    ) INTO result;

    RETURN result;
END;
$$;

-- 12. Politique RLS pour mentor_assignments
CREATE POLICY "Organization members can view mentor assignments" ON mentor_assignments
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles p1
            JOIN mentors m ON p1.id = m.user_id
            WHERE m.id = mentor_assignments.mentor_id
            AND p1.organization_id IN (
                SELECT organization_id FROM profiles
                WHERE id = auth.uid()
            )
        )
        OR
        entrepreneur_id = auth.uid()
    );

CREATE POLICY "Organization admins can manage mentor assignments" ON mentor_assignments
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles p1
            JOIN mentors m ON p1.id = m.user_id
            WHERE m.id = mentor_assignments.mentor_id
            AND is_organization_admin(p1.organization_id)
        )
    );

-- 13. Grants pour les nouvelles fonctions
GRANT EXECUTE ON FUNCTION map_ui_role_to_user_role(text) TO authenticated;
GRANT EXECUTE ON FUNCTION map_user_role_to_ui_role(text) TO authenticated;
GRANT EXECUTE ON FUNCTION assign_mentor_to_entrepreneur(uuid, uuid, uuid, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION create_invitation_code_with_mapping(uuid, text, uuid, timestamp with time zone, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION use_invitation_code_with_role_mapping(text, uuid) TO authenticated;

-- 14. Activer RLS sur mentor_assignments
ALTER TABLE mentor_assignments ENABLE ROW LEVEL SECURITY;

-- 15. Créer des index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_mentor_assignments_entrepreneur_id ON mentor_assignments(entrepreneur_id);
CREATE INDEX IF NOT EXISTS idx_mentor_assignments_mentor_id ON mentor_assignments(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_assignments_status ON mentor_assignments(status);
CREATE INDEX IF NOT EXISTS idx_invitation_code_assigned_role ON invitation_code(assigned_role);

-- 16. Insérer des données de test si nécessaire (organisation par défaut)
INSERT INTO organizations (id, name, type, primary_color, secondary_color)
VALUES ('00000000-0000-0000-0000-000000000001'::uuid, 'Aurentia Test Organization', 'incubator', '#ff5932', '#1a1a1a')
ON CONFLICT (id) DO NOTHING;

COMMENT ON FUNCTION map_ui_role_to_user_role(text) IS 'Mappe les rôles UI (entrepreneur/mentor) vers les user_roles DB';
COMMENT ON FUNCTION map_user_role_to_ui_role(text) IS 'Mappe les user_roles DB vers les rôles UI';
COMMENT ON FUNCTION assign_mentor_to_entrepreneur IS 'Assigne un mentor à un entrepreneur dans la même organisation';
COMMENT ON FUNCTION create_invitation_code_with_mapping IS 'Crée un code d''invitation avec le bon mapping des rôles';
COMMENT ON FUNCTION use_invitation_code_with_role_mapping IS 'Utilise un code d''invitation avec le bon mapping des rôles';
COMMENT ON VIEW organization_entrepreneurs IS 'Vue des entrepreneurs d''une organisation avec leurs statistiques';
COMMENT ON VIEW organization_mentors IS 'Vue des mentors d''une organisation avec leurs statistiques';