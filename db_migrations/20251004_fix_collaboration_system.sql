-- Migration: Fix Collaboration System
-- Date: 2025-10-04
-- Description: Corrections et améliorations du système de collaboration

-- =============================================
-- 1. Vérifier que les tables ont les bonnes colonnes
-- =============================================

-- Vérifier que project_invitations a toutes les colonnes nécessaires
DO $$
BEGIN
    -- Ajouter accepted_at et accepted_by si elles n'existent pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'project_invitations' AND column_name = 'accepted_at'
    ) THEN
        ALTER TABLE public.project_invitations 
        ADD COLUMN accepted_at timestamp with time zone;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'project_invitations' AND column_name = 'accepted_by'
    ) THEN
        ALTER TABLE public.project_invitations 
        ADD COLUMN accepted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
END
$$;

-- =============================================
-- 2. Corriger les fonctions pour utiliser 'status' au lieu de 'used'
-- =============================================

-- Fonction pour nettoyer les invitations expirées
CREATE OR REPLACE FUNCTION public.cleanup_expired_invitations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  UPDATE public.project_invitations
  SET status = 'expired'
  WHERE expires_at < now() AND status = 'pending';
END;
$$;

-- =============================================
-- 3. Améliorer la fonction invite_collaborator pour être plus robuste
-- =============================================

CREATE OR REPLACE FUNCTION public.invite_collaborator(
  p_project_id UUID,
  p_email TEXT,
  p_role TEXT
)
RETURNS JSON 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_token UUID;
  v_invitation_id UUID;
  v_existing_user UUID;
  v_existing_collaborator UUID;
  v_existing_invitation UUID;
  v_current_user_id UUID;
  v_project_owner UUID;
BEGIN
  -- Récupérer l'ID de l'utilisateur actuel
  v_current_user_id := auth.uid();
  
  IF v_current_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Utilisateur non authentifié'
    );
  END IF;
  
  -- Vérifier que le projet existe et récupérer le propriétaire
  SELECT user_id INTO v_project_owner
  FROM public.project_summary 
  WHERE project_id = p_project_id;
  
  IF v_project_owner IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Projet non trouvé'
    );
  END IF;

  -- Vérifier que l'utilisateur actuel a les permissions
  IF NOT (
    v_project_owner = v_current_user_id OR
    EXISTS (
      SELECT 1 FROM public.project_collaborators 
      WHERE project_id = p_project_id 
        AND user_id = v_current_user_id 
        AND role = 'admin' 
        AND status = 'active'
    )
  ) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Seuls les propriétaires et administrateurs du projet peuvent inviter des collaborateurs'
    );
  END IF;

  -- Valider l'email
  IF p_email IS NULL OR p_email = '' OR p_email !~ '^[^@]+@[^@]+\.[^@]+$' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Adresse email invalide'
    );
  END IF;

  -- Valider le rôle
  IF p_role NOT IN ('viewer', 'editor', 'admin') THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Rôle invalide. Utilisez: viewer, editor, ou admin'
    );
  END IF;

  -- Vérifier si l'utilisateur existe déjà
  SELECT id INTO v_existing_user
  FROM public.profiles
  WHERE email = p_email;

  -- Si l'utilisateur existe, vérifier s'il n'est pas déjà collaborateur
  IF v_existing_user IS NOT NULL THEN
    SELECT id INTO v_existing_collaborator
    FROM public.project_collaborators
    WHERE project_id = p_project_id AND user_id = v_existing_user;
    
    IF v_existing_collaborator IS NOT NULL THEN
      RETURN json_build_object(
        'success', false,
        'error', 'Cet utilisateur est déjà collaborateur sur ce projet'
      );
    END IF;
  END IF;

  -- Vérifier s'il existe déjà une invitation en attente
  SELECT id INTO v_existing_invitation
  FROM public.project_invitations
  WHERE project_id = p_project_id 
    AND email = p_email 
    AND status = 'pending' 
    AND expires_at > NOW();
    
  IF v_existing_invitation IS NOT NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Une invitation est déjà en attente pour cet email'
    );
  END IF;

  -- Générer un token unique
  v_token := gen_random_uuid();
  
  -- Créer l'invitation
  INSERT INTO public.project_invitations (
    project_id,
    email,
    role,
    invited_by,
    token,
    expires_at,
    status
  )
  VALUES (
    p_project_id,
    p_email,
    p_role,
    v_current_user_id,
    v_token,
    NOW() + INTERVAL '7 days',
    'pending'
  )
  RETURNING id INTO v_invitation_id;
  
  -- Retourner les détails
  RETURN json_build_object(
    'success', true,
    'invitation_id', v_invitation_id,
    'token', v_token,
    'expires_at', NOW() + INTERVAL '7 days'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- =============================================
-- 4. Améliorer la fonction accept_invitation
-- =============================================

CREATE OR REPLACE FUNCTION public.accept_invitation(p_token UUID)
RETURNS JSON 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_invitation RECORD;
  v_user_id UUID;
  v_existing_collaborator UUID;
  v_user_email TEXT;
BEGIN
  -- Récupérer l'invitation
  SELECT * INTO v_invitation
  FROM public.project_invitations
  WHERE token = p_token
    AND expires_at > NOW()
    AND status = 'pending';
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Invitation invalide ou expirée'
    );
  END IF;
  
  -- Récupérer l'ID et l'email de l'utilisateur actuel
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Vous devez être connecté pour accepter une invitation'
    );
  END IF;
  
  -- Récupérer l'email de l'utilisateur depuis profiles
  SELECT email INTO v_user_email FROM public.profiles WHERE id = v_user_id;
  
  -- Vérifier que l'email correspond
  IF v_invitation.email <> v_user_email THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Cette invitation n''est pas destinée à votre compte'
    );
  END IF;
  
  -- Vérifier si l'utilisateur n'est pas déjà collaborateur
  SELECT id INTO v_existing_collaborator
  FROM public.project_collaborators
  WHERE project_id = v_invitation.project_id AND user_id = v_user_id;
  
  IF v_existing_collaborator IS NOT NULL THEN
    -- Marquer l'invitation comme acceptée même si déjà collaborateur
    UPDATE public.project_invitations
    SET status = 'accepted', accepted_at = NOW(), accepted_by = v_user_id
    WHERE id = v_invitation.id;
    
    RETURN json_build_object(
      'success', false, 
      'error', 'Vous êtes déjà collaborateur sur ce projet'
    );
  END IF;
  
  -- Ajouter le collaborateur
  INSERT INTO public.project_collaborators (
    project_id,
    user_id,
    role,
    status,
    joined_at,
    updated_at
  )
  VALUES (
    v_invitation.project_id,
    v_user_id,
    v_invitation.role,
    'active',
    NOW(),
    NOW()
  );
  
  -- Marquer l'invitation comme acceptée
  UPDATE public.project_invitations
  SET status = 'accepted', accepted_at = NOW(), accepted_by = v_user_id
  WHERE id = v_invitation.id;
  
  RETURN json_build_object(
    'success', true,
    'project_id', v_invitation.project_id,
    'role', v_invitation.role
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- =============================================
-- 5. Fonction pour supprimer un collaborateur
-- =============================================

CREATE OR REPLACE FUNCTION public.remove_collaborator(
  p_collaborator_id UUID
)
RETURNS JSON 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_current_user_id UUID;
  v_collaborator RECORD;
  v_project_owner UUID;
BEGIN
  v_current_user_id := auth.uid();
  
  IF v_current_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Non authentifié');
  END IF;
  
  -- Récupérer les informations du collaborateur
  SELECT * INTO v_collaborator
  FROM public.project_collaborators
  WHERE id = p_collaborator_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Collaborateur non trouvé');
  END IF;
  
  -- Récupérer le propriétaire du projet
  SELECT user_id INTO v_project_owner
  FROM public.project_summary
  WHERE project_id = v_collaborator.project_id;
  
  -- Vérifier les permissions
  IF NOT (
    v_project_owner = v_current_user_id OR
    (v_collaborator.user_id = v_current_user_id) OR
    EXISTS (
      SELECT 1 FROM public.project_collaborators 
      WHERE project_id = v_collaborator.project_id 
        AND user_id = v_current_user_id 
        AND role = 'admin' 
        AND status = 'active'
    )
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Permissions insuffisantes');
  END IF;
  
  -- Supprimer le collaborateur
  DELETE FROM public.project_collaborators WHERE id = p_collaborator_id;
  
  RETURN json_build_object('success', true);
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- =============================================
-- 6. Fonction pour mettre à jour le rôle d'un collaborateur
-- =============================================

CREATE OR REPLACE FUNCTION public.update_collaborator_role(
  p_collaborator_id UUID,
  p_new_role TEXT
)
RETURNS JSON 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_current_user_id UUID;
  v_collaborator RECORD;
  v_project_owner UUID;
BEGIN
  v_current_user_id := auth.uid();
  
  IF v_current_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Non authentifié');
  END IF;
  
  -- Valider le rôle
  IF p_new_role NOT IN ('viewer', 'editor', 'admin') THEN
    RETURN json_build_object('success', false, 'error', 'Rôle invalide');
  END IF;
  
  -- Récupérer les informations du collaborateur
  SELECT * INTO v_collaborator
  FROM public.project_collaborators
  WHERE id = p_collaborator_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Collaborateur non trouvé');
  END IF;
  
  -- Récupérer le propriétaire du projet
  SELECT user_id INTO v_project_owner
  FROM public.project_summary
  WHERE project_id = v_collaborator.project_id;
  
  -- Vérifier les permissions (seuls le propriétaire et les admins peuvent changer les rôles)
  IF NOT (
    v_project_owner = v_current_user_id OR
    EXISTS (
      SELECT 1 FROM public.project_collaborators 
      WHERE project_id = v_collaborator.project_id 
        AND user_id = v_current_user_id 
        AND role = 'admin' 
        AND status = 'active'
    )
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Permissions insuffisantes');
  END IF;
  
  -- Mettre à jour le rôle
  UPDATE public.project_collaborators 
  SET role = p_new_role, updated_at = NOW()
  WHERE id = p_collaborator_id;
  
  RETURN json_build_object('success', true, 'new_role', p_new_role);
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- =============================================
-- 7. Fonction pour mettre à jour le statut d'un collaborateur
-- =============================================

CREATE OR REPLACE FUNCTION public.update_collaborator_status(
  p_collaborator_id UUID,
  p_new_status TEXT
)
RETURNS JSON 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_current_user_id UUID;
  v_collaborator RECORD;
  v_project_owner UUID;
BEGIN
  v_current_user_id := auth.uid();
  
  IF v_current_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Non authentifié');
  END IF;
  
  -- Valider le statut
  IF p_new_status NOT IN ('active', 'suspended', 'inactive') THEN
    RETURN json_build_object('success', false, 'error', 'Statut invalide');
  END IF;
  
  -- Récupérer les informations du collaborateur
  SELECT * INTO v_collaborator
  FROM public.project_collaborators
  WHERE id = p_collaborator_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Collaborateur non trouvé');
  END IF;
  
  -- Récupérer le propriétaire du projet
  SELECT user_id INTO v_project_owner
  FROM public.project_summary
  WHERE project_id = v_collaborator.project_id;
  
  -- Vérifier les permissions
  IF NOT (
    v_project_owner = v_current_user_id OR
    EXISTS (
      SELECT 1 FROM public.project_collaborators 
      WHERE project_id = v_collaborator.project_id 
        AND user_id = v_current_user_id 
        AND role = 'admin' 
        AND status = 'active'
    )
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Permissions insuffisantes');
  END IF;
  
  -- Mettre à jour le statut
  UPDATE public.project_collaborators 
  SET status = p_new_status, updated_at = NOW()
  WHERE id = p_collaborator_id;
  
  RETURN json_build_object('success', true, 'new_status', p_new_status);
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- =============================================
-- 8. Vue pour les statistiques de collaboration
-- =============================================

CREATE OR REPLACE VIEW public.collaboration_stats AS
SELECT 
  ps.user_id,
  COUNT(DISTINCT pc.project_id) as projects_as_collaborator,
  COUNT(DISTINCT ps.project_id) as projects_owned,
  COUNT(DISTINCT pi.id) as invitations_sent,
  COUNT(DISTINCT CASE WHEN pi.status = 'pending' THEN pi.id END) as pending_invitations
FROM public.profiles pr
LEFT JOIN public.project_summary ps ON pr.id = ps.user_id
LEFT JOIN public.project_collaborators pc ON pr.id = pc.user_id AND pc.status = 'active'
LEFT JOIN public.project_invitations pi ON pr.id = pi.invited_by
GROUP BY ps.user_id;

-- =============================================
-- 9. Index pour améliorer les performances
-- =============================================

-- Index pour les invitations
CREATE INDEX IF NOT EXISTS idx_project_invitations_email_status 
ON public.project_invitations(email, status) WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_project_invitations_token 
ON public.project_invitations(token) WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_project_invitations_project_status 
ON public.project_invitations(project_id, status);

-- Index pour les collaborateurs
CREATE INDEX IF NOT EXISTS idx_project_collaborators_project_user 
ON public.project_collaborators(project_id, user_id);

CREATE INDEX IF NOT EXISTS idx_project_collaborators_user_status 
ON public.project_collaborators(user_id, status) WHERE status = 'active';

-- =============================================
-- 10. Politique RLS pour la vue des statistiques
-- =============================================

ALTER TABLE public.collaboration_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own collaboration stats"
ON public.collaboration_stats FOR SELECT
USING (user_id = auth.uid());

-- =============================================
-- 11. Trigger pour nettoyer automatiquement les invitations expirées
-- =============================================

CREATE OR REPLACE FUNCTION public.auto_cleanup_expired_invitations()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Nettoyer les invitations expirées à chaque nouvelle insertion
  UPDATE public.project_invitations
  SET status = 'expired'
  WHERE expires_at < NOW() AND status = 'pending';
  
  RETURN NEW;
END;
$$;

-- Créer le trigger
DROP TRIGGER IF EXISTS trigger_auto_cleanup_invitations ON public.project_invitations;
CREATE TRIGGER trigger_auto_cleanup_invitations
  AFTER INSERT ON public.project_invitations
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.auto_cleanup_expired_invitations();

-- =============================================
-- COMMENTAIRES
-- =============================================

COMMENT ON FUNCTION public.invite_collaborator IS 'Invite un utilisateur à collaborer sur un projet. Vérifie les permissions et évite les doublons.';
COMMENT ON FUNCTION public.accept_invitation IS 'Accepte une invitation de collaboration avec un token valide.';
COMMENT ON FUNCTION public.remove_collaborator IS 'Supprime un collaborateur d''un projet (propriétaire, admin, ou auto-suppression).';
COMMENT ON FUNCTION public.update_collaborator_role IS 'Met à jour le rôle d''un collaborateur (propriétaire et admin uniquement).';
COMMENT ON FUNCTION public.update_collaborator_status IS 'Met à jour le statut d''un collaborateur (actif, suspendu, inactif).';
COMMENT ON VIEW public.collaboration_stats IS 'Statistiques de collaboration par utilisateur.';