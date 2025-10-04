-- =============================================
-- SETUP COLLABORATION SYSTEM FOR AURENTIA
-- =============================================

-- Activer RLS sur les tables si ce n'est pas déjà fait
ALTER TABLE public.project_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_invitations ENABLE ROW LEVEL SECURITY;

-- =============================================
-- POLITIQUES POUR project_collaborators
-- =============================================

-- Supprimer les politiques existantes si elles existent
DROP POLICY IF EXISTS "Users can view collaborators of their projects" ON public.project_collaborators;
DROP POLICY IF EXISTS "Project owners and admins can manage collaborators" ON public.project_collaborators;

-- Politique pour voir les collaborateurs
CREATE POLICY "Users can view collaborators of their projects"
ON public.project_collaborators
FOR SELECT
USING (
  -- Propriétaire du projet
  project_id IN (
    SELECT project_id FROM public.project_summary WHERE user_id = auth.uid()
  ) 
  OR 
  -- Collaborateur du projet
  project_id IN (
    SELECT project_id FROM public.project_collaborators 
    WHERE user_id = auth.uid() AND status = 'accepted'
  )
);

-- Politique pour gérer les collaborateurs
CREATE POLICY "Project owners and admins can manage collaborators"
ON public.project_collaborators
FOR ALL
USING (
  -- Propriétaire du projet
  project_id IN (
    SELECT project_id FROM public.project_summary WHERE user_id = auth.uid()
  )
  OR
  -- Administrateur du projet
  project_id IN (
    SELECT project_id FROM public.project_collaborators 
    WHERE user_id = auth.uid() AND role = 'admin' AND status = 'accepted'
  )
)
WITH CHECK (
  -- Même condition pour les insertions/mises à jour
  project_id IN (
    SELECT project_id FROM public.project_summary WHERE user_id = auth.uid()
  )
  OR
  project_id IN (
    SELECT project_id FROM public.project_collaborators 
    WHERE user_id = auth.uid() AND role = 'admin' AND status = 'accepted'
  )
);

-- =============================================
-- POLITIQUES POUR project_invitations
-- =============================================

-- Supprimer les politiques existantes si elles existent
DROP POLICY IF EXISTS "Users can view relevant invitations" ON public.project_invitations;
DROP POLICY IF EXISTS "Project owners and admins can create invitations" ON public.project_invitations;
DROP POLICY IF EXISTS "Project owners and admins can manage invitations" ON public.project_invitations;

-- Politique pour voir les invitations
CREATE POLICY "Users can view relevant invitations"
ON public.project_invitations
FOR SELECT
USING (
  -- Invitation envoyée par l'utilisateur
  invited_by = auth.uid()
  OR
  -- Invitation destinée à l'utilisateur
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR
  -- Propriétaire du projet
  project_id IN (
    SELECT project_id FROM public.project_summary WHERE user_id = auth.uid()
  )
);

-- Politique pour créer des invitations
CREATE POLICY "Project owners and admins can create invitations"
ON public.project_invitations
FOR INSERT
WITH CHECK (
  -- Propriétaire du projet
  project_id IN (
    SELECT project_id FROM public.project_summary WHERE user_id = auth.uid()
  )
  OR
  -- Administrateur du projet
  project_id IN (
    SELECT project_id FROM public.project_collaborators 
    WHERE user_id = auth.uid() AND role = 'admin' AND status = 'accepted'
  )
);

-- Politique pour gérer les invitations
CREATE POLICY "Project owners and admins can manage invitations"
ON public.project_invitations
FOR ALL
USING (
  -- Invitation envoyée par l'utilisateur
  invited_by = auth.uid()
  OR
  -- Propriétaire du projet
  project_id IN (
    SELECT project_id FROM public.project_summary WHERE user_id = auth.uid()
  )
  OR
  -- Administrateur du projet
  project_id IN (
    SELECT project_id FROM public.project_collaborators 
    WHERE user_id = auth.uid() AND role = 'admin' AND status = 'accepted'
  )
)
WITH CHECK (
  -- Même condition pour les mises à jour
  invited_by = auth.uid()
  OR
  project_id IN (
    SELECT project_id FROM public.project_summary WHERE user_id = auth.uid()
  )
  OR
  project_id IN (
    SELECT project_id FROM public.project_collaborators 
    WHERE user_id = auth.uid() AND role = 'admin' AND status = 'accepted'
  )
);

-- =============================================
-- FONCTIONS POUR LA COLLABORATION
-- =============================================

-- Fonction pour inviter un collaborateur
CREATE OR REPLACE FUNCTION public.invite_collaborator(
  p_project_id UUID,
  p_email TEXT,
  p_role TEXT
)
RETURNS JSON 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
DECLARE
  v_token TEXT;
  v_invitation_id UUID;
  v_existing_user UUID;
  v_existing_collaborator UUID;
  v_existing_invitation UUID;
  v_current_user_id UUID;
BEGIN
  -- Récupérer l'ID de l'utilisateur actuel
  v_current_user_id := auth.uid();
  
  -- Vérifier que l'utilisateur actuel a les permissions
  IF NOT (
    p_project_id IN (SELECT project_id FROM public.project_summary WHERE user_id = v_current_user_id)
    OR
    p_project_id IN (
      SELECT project_id FROM public.project_collaborators 
      WHERE user_id = v_current_user_id AND role = 'admin' AND status = 'accepted'
    )
  ) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Permissions insuffisantes'
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
    AND used = FALSE 
    AND expires_at > NOW();
    
  IF v_existing_invitation IS NOT NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Une invitation est déjà en attente pour cet email'
    );
  END IF;

  -- Générer un token unique
  v_token := encode(gen_random_bytes(32), 'hex');
  
  -- Créer l'invitation
  INSERT INTO public.project_invitations (
    project_id,
    email,
    role,
    invited_by,
    token,
    expires_at
  )
  VALUES (
    p_project_id,
    p_email,
    p_role,
    v_current_user_id,
    v_token,
    NOW() + INTERVAL '7 days'
  )
  RETURNING id INTO v_invitation_id;
  
  -- Retourner les détails
  RETURN json_build_object(
    'success', true,
    'invitation_id', v_invitation_id,
    'token', v_token
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Fonction pour accepter une invitation
CREATE OR REPLACE FUNCTION public.accept_invitation(p_token TEXT)
RETURNS JSON 
LANGUAGE plpgsql 
SECURITY DEFINER
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
    AND used = FALSE;
  
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
  
  -- Récupérer l'email de l'utilisateur
  SELECT email INTO v_user_email FROM auth.users WHERE id = v_user_id;
  
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
    -- Marquer l'invitation comme utilisée
    UPDATE public.project_invitations
    SET used = TRUE
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
    invited_by,
    invited_at,
    accepted_at
  )
  VALUES (
    v_invitation.project_id,
    v_user_id,
    v_invitation.role,
    v_invitation.invited_by,
    v_invitation.invited_at,
    NOW()
  );
  
  -- Marquer l'invitation comme utilisée
  UPDATE public.project_invitations
  SET used = TRUE
  WHERE id = v_invitation.id;
  
  RETURN json_build_object('success', true);
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Fonction pour vérifier les permissions d'un utilisateur
CREATE OR REPLACE FUNCTION public.check_user_project_permissions(
  p_project_id UUID,
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS JSON 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
DECLARE
  v_is_owner BOOLEAN := FALSE;
  v_collaborator RECORD;
  v_permissions JSON;
BEGIN
  -- Vérifier si l'utilisateur est propriétaire
  SELECT EXISTS(
    SELECT 1 FROM public.project_summary 
    WHERE project_id = p_project_id AND user_id = p_user_id
  ) INTO v_is_owner;
  
  IF v_is_owner THEN
    RETURN json_build_object(
      'is_owner', true,
      'is_collaborator', false,
      'role', null,
      'permissions', json_build_object(
        'can_read', true,
        'can_write', true,
        'can_delete', true,
        'can_manage_collaborators', true,
        'can_change_settings', true
      )
    );
  END IF;
  
  -- Vérifier si l'utilisateur est collaborateur
  SELECT role, status INTO v_collaborator
  FROM public.project_collaborators
  WHERE project_id = p_project_id 
    AND user_id = p_user_id 
    AND status = 'accepted';
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'is_owner', false,
      'is_collaborator', false,
      'role', null,
      'permissions', json_build_object(
        'can_read', false,
        'can_write', false,
        'can_delete', false,
        'can_manage_collaborators', false,
        'can_change_settings', false
      )
    );
  END IF;
  
  -- Définir les permissions selon le rôle
  CASE v_collaborator.role
    WHEN 'read' THEN
      v_permissions := json_build_object(
        'can_read', true,
        'can_write', false,
        'can_delete', false,
        'can_manage_collaborators', false,
        'can_change_settings', false
      );
    WHEN 'write' THEN
      v_permissions := json_build_object(
        'can_read', true,
        'can_write', true,
        'can_delete', false,
        'can_manage_collaborators', false,
        'can_change_settings', false
      );
    WHEN 'admin' THEN
      v_permissions := json_build_object(
        'can_read', true,
        'can_write', true,
        'can_delete', true,
        'can_manage_collaborators', true,
        'can_change_settings', true
      );
    ELSE
      v_permissions := json_build_object(
        'can_read', false,
        'can_write', false,
        'can_delete', false,
        'can_manage_collaborators', false,
        'can_change_settings', false
      );
  END CASE;
  
  RETURN json_build_object(
    'is_owner', false,
    'is_collaborator', true,
    'role', v_collaborator.role,
    'permissions', v_permissions
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Accorder les permissions d'exécution
GRANT EXECUTE ON FUNCTION public.invite_collaborator(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_invitation(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_user_project_permissions(UUID, UUID) TO authenticated;