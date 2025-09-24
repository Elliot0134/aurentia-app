-- Migration pour désactiver les codes d'invitation après utilisation
-- Date: 2025-09-23

-- Modifier la fonction use_invitation_code_with_role_mapping pour désactiver
-- immédiatement les codes d'invitation après utilisation

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

    -- Désactiver le code après utilisation (chaque code n'est utilisable qu'une seule fois)
    UPDATE invitation_code
    SET is_active = false
    WHERE id = code_record.id;

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