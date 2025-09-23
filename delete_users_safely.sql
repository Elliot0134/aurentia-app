-- Script pour supprimer proprement des utilisateurs avec toutes leurs références
-- et prévention des bugs de suppression future

-- 1. Fonction de suppression en cascade sécurisée
CREATE OR REPLACE FUNCTION delete_user_cascade(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count jsonb := '{}'::jsonb;
    org_count integer;
    row_count_var integer;
BEGIN
    -- Vérifier que l'utilisateur existe
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = p_user_id) THEN
        RETURN json_build_object('success', false, 'error', 'Utilisateur non trouvé');
    END IF;

    -- Compter les organisations créées par cet utilisateur
    SELECT COUNT(*) INTO org_count FROM organizations WHERE created_by = p_user_id;

    -- Supprimer dans l'ordre inverse des dépendances

    -- 1. Supprimer les affectations de mentors (avant les mentors)
    DELETE FROM mentor_assignments WHERE assigned_by = p_user_id OR created_by = p_user_id;
    GET DIAGNOSTICS row_count_var = ROW_COUNT;
    deleted_count = deleted_count || jsonb_build_object('mentor_assignments', row_count_var);

    -- 2. Supprimer le profil mentor
    DELETE FROM mentors WHERE user_id = p_user_id;
    GET DIAGNOSTICS row_count_var = ROW_COUNT;
    deleted_count = deleted_count || jsonb_build_object('mentors', row_count_var);

    -- 3. Supprimer les codes d'invitation créés (mais pas utilisés par d'autres)
    DELETE FROM invitation_code WHERE created_by = p_user_id;
    GET DIAGNOSTICS row_count_var = ROW_COUNT;
    deleted_count = deleted_count || jsonb_build_object('invitation_codes', row_count_var);

    -- 4. Supprimer les événements organisés
    DELETE FROM events WHERE organizer_id = p_user_id;
    GET DIAGNOSTICS row_count_var = ROW_COUNT;
    deleted_count = deleted_count || jsonb_build_object('events', row_count_var);

    -- 5. Supprimer les soumissions de formulaires
    DELETE FROM form_submissions WHERE submitted_by = p_user_id OR reviewed_by = p_user_id;
    GET DIAGNOSTICS row_count_var = ROW_COUNT;
    deleted_count = deleted_count || jsonb_build_object('form_submissions', row_count_var);

    -- 6. Supprimer les templates de formulaires créés
    DELETE FROM form_templates WHERE created_by = p_user_id;
    GET DIAGNOSTICS row_count_var = ROW_COUNT;
    deleted_count = deleted_count || jsonb_build_object('form_templates', row_count_var);

    -- 7. Supprimer les livrables
    DELETE FROM deliverables WHERE entrepreneur_id = p_user_id;
    GET DIAGNOSTICS row_count_var = ROW_COUNT;
    deleted_count = deleted_count || jsonb_build_object('deliverables', row_count_var);

    -- 8. Supprimer les logs de confirmation email
    DELETE FROM email_confirmation_logs WHERE user_id = p_user_id;
    GET DIAGNOSTICS row_count_var = ROW_COUNT;
    deleted_count = deleted_count || jsonb_build_object('email_logs', row_count_var);

    -- 9. Supprimer les confirmations email
    DELETE FROM email_confirmations WHERE user_id = p_user_id;
    GET DIAGNOSTICS row_count_var = ROW_COUNT;
    deleted_count = deleted_count || jsonb_build_object('email_confirmations', row_count_var);

    -- 10. Supprimer les paiements
    DELETE FROM payment_intents WHERE user_id = p_user_id;
    GET DIAGNOSTICS row_count_var = ROW_COUNT;
    deleted_count = deleted_count || jsonb_build_object('payment_intents', row_count_var);

    -- 11. Supprimer les abonnements Stripe
    DELETE FROM stripe_subscriptions WHERE user_id = p_user_id;
    GET DIAGNOSTICS row_count_var = ROW_COUNT;
    deleted_count = deleted_count || jsonb_build_object('stripe_subscriptions', row_count_var);

    -- 12. Supprimer les clients Stripe
    DELETE FROM stripe_customers WHERE user_id = p_user_id;
    GET DIAGNOSTICS row_count_var = ROW_COUNT;
    deleted_count = deleted_count || jsonb_build_object('stripe_customers', row_count_var);

    -- 13. Supprimer les intentions d'abonnement
    DELETE FROM subscription_intents WHERE user_id = p_user_id;
    GET DIAGNOSTICS row_count_var = ROW_COUNT;
    deleted_count = deleted_count || jsonb_build_object('subscription_intents', row_count_var);

    -- 14. Supprimer les collaborateurs de projet
    DELETE FROM project_collaborators WHERE user_id = p_user_id OR invited_by = p_user_id;
    GET DIAGNOSTICS row_count_var = ROW_COUNT;
    deleted_count = deleted_count || jsonb_build_object('project_collaborators', row_count_var);

    -- 15. Supprimer les invitations de projet
    DELETE FROM project_invitations WHERE invited_by = p_user_id;
    GET DIAGNOSTICS row_count_var = ROW_COUNT;
    deleted_count = deleted_count || jsonb_build_object('project_invitations', row_count_var);

    -- 16. Supprimer les messages
    DELETE FROM messages WHERE user_id = p_user_id;
    GET DIAGNOSTICS row_count_var = ROW_COUNT;
    deleted_count = deleted_count || jsonb_build_object('messages', row_count_var);

    -- 17. Supprimer les conversations
    DELETE FROM conversation WHERE user_id = p_user_id;
    GET DIAGNOSTICS row_count_var = ROW_COUNT;
    deleted_count = deleted_count || jsonb_build_object('conversations', row_count_var);

    -- 18. Supprimer les données de projet (ATTENTION: données importantes!)
    -- Pour éviter de supprimer accidentellement des projets importants,
    -- on ne supprime que si l'utilisateur n'est pas propriétaire d'organisation
    IF org_count = 0 THEN
        -- Supprimer les données liées aux projets de l'utilisateur
        DELETE FROM rag WHERE user_id = p_user_id;
        GET DIAGNOSTICS row_count_var = ROW_COUNT;
        deleted_count = deleted_count || jsonb_build_object('rag', row_count_var);

        DELETE FROM score_projet WHERE user_id = p_user_id;
        GET DIAGNOSTICS row_count_var = ROW_COUNT;
        deleted_count = deleted_count || jsonb_build_object('score_projet', row_count_var);

        -- Supprimer les projets (avec toutes leurs dépendances)
        DELETE FROM project_summary WHERE user_id = p_user_id;
        GET DIAGNOSTICS row_count_var = ROW_COUNT;
        deleted_count = deleted_count || jsonb_build_object('projects', row_count_var);
    END IF;

    -- 19. Supprimer les organisations créées (ATTENTION: données critiques!)
    -- Pour éviter les suppressions accidentelles, on ne supprime que les orgs vides
    DELETE FROM organizations
    WHERE created_by = p_user_id
    AND id NOT IN (
        SELECT DISTINCT organization_id FROM profiles WHERE organization_id IS NOT NULL
    );
    GET DIAGNOSTICS row_count_var = ROW_COUNT;
    deleted_count = deleted_count || jsonb_build_object('organizations', row_count_var);

    -- 20. Enfin, supprimer le profil utilisateur
    DELETE FROM profiles WHERE id = p_user_id;
    GET DIAGNOSTICS row_count_var = ROW_COUNT;
    deleted_count = deleted_count || jsonb_build_object('profiles', row_count_var);

    -- 21. Supprimer de auth.users (si Supabase le permet)
    -- DELETE FROM auth.users WHERE id = p_user_id;

    RETURN json_build_object(
        'success', true,
        'user_id', p_user_id,
        'deleted_records', deleted_count,
        'warning', CASE WHEN org_count > 0 THEN 'Utilisateur propriétaire d''organisations - certaines données préservées' ELSE null END
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM,
            'user_id', p_user_id
        );
END;
$$;

-- 2. Fonction pour vérifier les références avant suppression
CREATE OR REPLACE FUNCTION check_user_references(p_user_id uuid)
RETURNS TABLE(table_name text, record_count bigint)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM (
        SELECT 'profiles'::text as table_name, COUNT(*) as record_count FROM profiles WHERE id = p_user_id
        UNION ALL
        SELECT 'project_summary'::text, COUNT(*) FROM project_summary WHERE user_id = p_user_id
        UNION ALL
        SELECT 'conversation'::text, COUNT(*) FROM conversation WHERE user_id = p_user_id
        UNION ALL
        SELECT 'messages'::text, COUNT(*) FROM messages WHERE user_id = p_user_id
        UNION ALL
        SELECT 'invitation_code'::text, COUNT(*) FROM invitation_code WHERE created_by = p_user_id
        UNION ALL
        SELECT 'organizations'::text, COUNT(*) FROM organizations WHERE created_by = p_user_id
        UNION ALL
        SELECT 'mentors'::text, COUNT(*) FROM mentors WHERE user_id = p_user_id
        UNION ALL
        SELECT 'mentor_assignments'::text, COUNT(*) FROM mentor_assignments WHERE assigned_by = p_user_id OR created_by = p_user_id
        UNION ALL
        SELECT 'events'::text, COUNT(*) FROM events WHERE organizer_id = p_user_id
        UNION ALL
        SELECT 'deliverables'::text, COUNT(*) FROM deliverables WHERE entrepreneur_id = p_user_id
        UNION ALL
        SELECT 'stripe_customers'::text, COUNT(*) FROM stripe_customers WHERE user_id = p_user_id
        UNION ALL
        SELECT 'stripe_subscriptions'::text, COUNT(*) FROM stripe_subscriptions WHERE user_id = p_user_id
    ) AS results
    ORDER BY record_count DESC, table_name;
END;
$$;

-- 3. Trigger pour empêcher les suppressions d'utilisateurs avec des données critiques
CREATE OR REPLACE FUNCTION prevent_critical_user_deletion()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    -- Vérifier si l'utilisateur a créé des organisations avec des membres
    IF EXISTS (
        SELECT 1 FROM organizations o
        JOIN profiles p ON o.id = p.organization_id
        WHERE o.created_by = OLD.id
        AND p.id != OLD.id  -- Exclure l'utilisateur lui-même
        GROUP BY o.id
        HAVING COUNT(*) > 0
    ) THEN
        RAISE EXCEPTION 'Impossible de supprimer l''utilisateur % : propriétaire d''organisations avec des membres actifs', OLD.id;
    END IF;

    -- Vérifier si l'utilisateur a des projets avec des collaborateurs
    IF EXISTS (
        SELECT 1 FROM project_summary ps
        JOIN project_collaborators pc ON ps.project_id = pc.project_id
        WHERE ps.user_id = OLD.id
        AND pc.user_id != OLD.id  -- Exclure l'utilisateur lui-même
    ) THEN
        RAISE EXCEPTION 'Impossible de supprimer l''utilisateur % : propriétaire de projets avec des collaborateurs', OLD.id;
    END IF;

    RETURN OLD;
END;
$$;

-- Appliquer le trigger (optionnel - commenter si trop restrictif)
-- CREATE TRIGGER prevent_critical_user_deletion_trigger
--     BEFORE DELETE ON profiles
--     FOR EACH ROW EXECUTE FUNCTION prevent_critical_user_deletion();

-- 4. Script d'exécution pour supprimer les deux utilisateurs problématiques
DO $$
DECLARE
    result1 json;
    result2 json;
BEGIN
    RAISE NOTICE 'Vérification des références pour TestUser...';
    PERFORM * FROM check_user_references('f5c21b7a-1501-45ed-863d-b99e8f76766b'::uuid) WHERE record_count > 0;

    RAISE NOTICE 'Suppression de TestUser...';
    SELECT delete_user_cascade('f5c21b7a-1501-45ed-863d-b99e8f76766b'::uuid) INTO result1;
    RAISE NOTICE 'Résultat TestUser: %', result1;

    RAISE NOTICE 'Vérification des références pour Matthieu...';
    PERFORM * FROM check_user_references('36052147-ac37-49d9-b07c-64978e07042c'::uuid) WHERE record_count > 0;

    RAISE NOTICE 'Suppression de Matthieu...';
    SELECT delete_user_cascade('36052147-ac37-49d9-b07c-64978e07042c'::uuid) INTO result2;
    RAISE NOTICE 'Résultat Matthieu: %', result2;

    RAISE NOTICE 'Suppressions terminées avec succès!';
END $$;

-- 5. Commentaires et documentation
COMMENT ON FUNCTION delete_user_cascade(uuid) IS 'Supprime un utilisateur et toutes ses références de manière sécurisée';
COMMENT ON FUNCTION check_user_references(uuid) IS 'Vérifie quelles tables contiennent des références à un utilisateur';
COMMENT ON FUNCTION prevent_critical_user_deletion() IS 'Trigger pour empêcher la suppression d''utilisateurs critiques';