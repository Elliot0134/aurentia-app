import { supabase } from '@/integrations/supabase/client';
import { CollaboratorRole, Collaborator, Invitation } from '@/types/collaboration';

export class CollaboratorsService {
  // Récupérer tous les collaborateurs d'un projet
  static async getProjectCollaborators(projectId: string): Promise<Collaborator[]> {
    const { data, error } = await supabase
      .from('project_collaborators')
      .select('*')
      .eq('project_id', projectId)
      .order('invited_at', { ascending: false });

    if (error) throw error;
    if (!data) return [];

    // Enrichir les données avec les informations des utilisateurs et projets
    const enrichedCollaborators = await Promise.all(
      data.map(async (collab) => {
        // Récupérer les informations de l'utilisateur
        const { data: user } = await supabase
          .from('profiles')
          .select('id, email')
          .eq('id', collab.user_id)
          .single();

        // Récupérer les informations du projet
        const { data: project } = await supabase
          .from('project_summary')
          .select('project_id, nom_projet, description_synthetique')
          .eq('project_id', collab.project_id)
          .single();

        // Récupérer les informations de la personne qui a invité
        const { data: inviter } = await supabase
          .from('profiles')
          .select('id, email')
          .eq('id', collab.invited_by)
          .single();

        return {
          ...collab,
          role: collab.role as CollaboratorRole,
          status: collab.status as 'accepted' | 'suspended',
          user: user || undefined,
          project: project || undefined,
          inviter: inviter || undefined
        } as Collaborator;
      })
    );

    return enrichedCollaborators;
  }

  // Récupérer tous les collaborateurs de l'utilisateur connecté
  static async getUserCollaborators(): Promise<Collaborator[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Récupérer tous les projets de l'utilisateur
    const { data: projects, error: projectsError } = await supabase
      .from('project_summary')
      .select('project_id')
      .eq('user_id', user.id);

    if (projectsError) throw projectsError;
    if (!projects || projects.length === 0) return [];

    // Récupérer tous les collaborateurs de ces projets
    const { data, error } = await supabase
      .from('project_collaborators')
      .select('*')
      .in('project_id', projects.map(p => p.project_id))
      .order('invited_at', { ascending: false });

    if (error) throw error;
    if (!data) return [];

    // Enrichir les données avec les informations des utilisateurs et projets
    const enrichedCollaborators = await Promise.all(
      data.map(async (collab) => {
        // Récupérer les informations de l'utilisateur
        const { data: user } = await supabase
          .from('profiles')
          .select('id, email')
          .eq('id', collab.user_id)
          .single();

        // Récupérer les informations du projet
        const { data: project } = await supabase
          .from('project_summary')
          .select('project_id, nom_projet, description_synthetique')
          .eq('project_id', collab.project_id)
          .single();

        // Récupérer les informations de la personne qui a invité
        const { data: inviter } = await supabase
          .from('profiles')
          .select('id, email')
          .eq('id', collab.invited_by)
          .single();

        return {
          ...collab,
          role: collab.role as CollaboratorRole,
          status: collab.status as 'accepted' | 'suspended',
          user: user || undefined,
          project: project || undefined,
          inviter: inviter || undefined
        } as Collaborator;
      })
    );

    return enrichedCollaborators;
  }

  // Inviter un collaborateur
  static async inviteCollaborator(
    projectId: string,
    email: string,
    role: CollaboratorRole
  ): Promise<{ success: boolean; invitation_id?: string; token?: string; error?: string }> {
    try {
      // Vérifier si l'utilisateur existe déjà comme collaborateur
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (userProfile) {
        const { data: existingCollaborator } = await supabase
          .from('project_collaborators')
          .select('*')
          .eq('project_id', projectId)
          .eq('user_id', userProfile.id)
          .single();

        if (existingCollaborator) {
          return { success: false, error: 'Cet utilisateur est déjà collaborateur sur ce projet' };
        }
      }

      // Vérifier si une invitation existe déjà
      const { data: existingInvitation } = await supabase
        .from('project_invitations')
        .select('*')
        .eq('project_id', projectId)
        .eq('email', email)
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (existingInvitation) {
        return { success: false, error: 'Une invitation est déjà en attente pour cet email' };
      }

      // Générer un token unique
      const token = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // Expire dans 7 jours

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Créer l'invitation
      const { data: invitation, error } = await supabase
        .from('project_invitations')
        .insert({
          project_id: projectId,
          email,
          role,
          token,
          expires_at: expiresAt.toISOString(),
          invited_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Envoyer l'email d'invitation
      await this.sendInvitationEmail(email, token, projectId);

      return {
        success: true,
        invitation_id: invitation.id,
        token: invitation.token
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Accepter une invitation
  static async acceptInvitation(token: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Récupérer l'invitation
      const { data: invitation, error: invitationError } = await supabase
        .from('project_invitations')
        .select('*')
        .eq('token', token)
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (invitationError || !invitation) {
        return { success: false, error: 'Invitation invalide ou expirée' };
      }

      // Récupérer l'utilisateur actuel
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Vous devez être connecté pour accepter une invitation' };
      }

      // Vérifier que l'email correspond
      if (user.email !== invitation.email) {
        return { success: false, error: 'Cette invitation n\'est pas destinée à votre compte' };
      }

      // Vérifier si l'utilisateur n'est pas déjà collaborateur
      const { data: existingCollaborator } = await supabase
        .from('project_collaborators')
        .select('*')
        .eq('project_id', invitation.project_id)
        .eq('user_id', user.id)
        .single();

      if (existingCollaborator) {
        // Marquer l'invitation comme utilisée même si déjà collaborateur
        await supabase
          .from('project_invitations')
          .update({ used: true })
          .eq('id', invitation.id);
        
        return { success: false, error: 'Vous êtes déjà collaborateur sur ce projet' };
      }

      // Ajouter le collaborateur
      const { error: collaboratorError } = await supabase
        .from('project_collaborators')
        .insert({
          project_id: invitation.project_id,
          user_id: user.id,
          role: invitation.role,
          invited_by: invitation.invited_by,
          invited_at: invitation.invited_at,
          accepted_at: new Date().toISOString()
        });

      if (collaboratorError) throw collaboratorError;

      // Marquer l'invitation comme utilisée
      const { error: updateError } = await supabase
        .from('project_invitations')
        .update({ used: true })
        .eq('id', invitation.id);

      if (updateError) throw updateError;

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Mettre à jour le rôle d'un collaborateur
  static async updateCollaboratorRole(
    collaboratorId: string,
    newRole: CollaboratorRole
  ): Promise<Collaborator> {
    const { data, error } = await supabase
      .from('project_collaborators')
      .update({ role: newRole })
      .eq('id', collaboratorId)
      .select()
      .single();

    if (error) throw error;

    // Enrichir les données
    const enrichedData = await this.enrichCollaboratorData(data);
    return enrichedData;
  }

  // Mettre à jour le statut d'un collaborateur
  static async updateCollaboratorStatus(
    collaboratorId: string,
    status: 'accepted' | 'suspended'
  ): Promise<Collaborator> {
    const { data, error } = await supabase
      .from('project_collaborators')
      .update({ status })
      .eq('id', collaboratorId)
      .select()
      .single();

    if (error) throw error;

    // Enrichir les données
    const enrichedData = await this.enrichCollaboratorData(data);
    return enrichedData;
  }

  // Retirer un collaborateur
  static async removeCollaborator(collaboratorId: string): Promise<void> {
    const { error } = await supabase
      .from('project_collaborators')
      .delete()
      .eq('id', collaboratorId);

    if (error) throw error;
  }

  // Récupérer les invitations en attente pour l'utilisateur connecté
  static async getPendingInvitations(): Promise<Invitation[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      console.log('Tentative de récupération des invitations pour:', user.email);

      const { data, error } = await supabase
        .from('project_invitations')
        .select('*')
        .eq('email', user.email)
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .order('invited_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la requête project_invitations:', error);
        throw error;
      }
      
      if (!data) return [];

      console.log('Invitations trouvées:', data);

      // Pour l'instant, retournons les données basiques sans enrichissement
      return data.map(invitation => ({
        ...invitation,
        role: invitation.role as CollaboratorRole,
        project: undefined,
        inviter: undefined
      })) as Invitation[];

    } catch (error) {
      console.error('Erreur dans getPendingInvitations:', error);
      throw error;
    }
  }

  // Récupérer les invitations envoyées par l'utilisateur
  static async getSentInvitations(): Promise<Invitation[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('project_invitations')
      .select('*')
      .eq('invited_by', user.id)
      .order('invited_at', { ascending: false });

    if (error) throw error;
    if (!data) return [];

    // Enrichir les données avec les informations des projets
    const enrichedInvitations = await Promise.all(
      data.map(async (invitation) => {
        const { data: project } = await supabase
          .from('project_summary')
          .select('project_id, nom_projet, description_synthetique')
          .eq('project_id', invitation.project_id)
          .single();

        return {
          ...invitation,
          role: invitation.role as CollaboratorRole,
          project: project || undefined
        } as Invitation;
      })
    );

    return enrichedInvitations;
  }

  // Annuler une invitation
  static async cancelInvitation(invitationId: string): Promise<void> {
    const { error } = await supabase
      .from('project_invitations')
      .delete()
      .eq('id', invitationId);

    if (error) throw error;
  }

  // Vérifier les permissions d'un utilisateur sur un projet
  static async checkUserPermissions(projectId: string, userId: string): Promise<{
    isOwner: boolean;
    isCollaborator: boolean;
    role?: CollaboratorRole;
    permissions: {
      canRead: boolean;
      canWrite: boolean;
      canDelete: boolean;
      canManageCollaborators: boolean;
      canChangeSettings: boolean;
    };
  }> {
    // Vérifier si l'utilisateur est propriétaire du projet
    const { data: project, error: projectError } = await supabase
      .from('project_summary')
      .select('user_id')
      .eq('project_id', projectId)
      .single();

    if (projectError) throw projectError;

    const isOwner = project.user_id === userId;

    if (isOwner) {
      return {
        isOwner: true,
        isCollaborator: false,
        permissions: {
          canRead: true,
          canWrite: true,
          canDelete: true,
          canManageCollaborators: true,
          canChangeSettings: true
        }
      };
    }

    // Vérifier si l'utilisateur est collaborateur
    const { data: collaborator, error: collaboratorError } = await supabase
      .from('project_collaborators')
      .select('role, status')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .eq('status', 'accepted')
      .single();

    if (collaboratorError || !collaborator) {
      return {
        isOwner: false,
        isCollaborator: false,
        permissions: {
          canRead: false,
          canWrite: false,
          canDelete: false,
          canManageCollaborators: false,
          canChangeSettings: false
        }
      };
    }

    const role = collaborator.role as CollaboratorRole;
    const permissions = {
      canRead: true,
      canWrite: role === 'write' || role === 'admin',
      canDelete: role === 'admin',
      canManageCollaborators: role === 'admin',
      canChangeSettings: role === 'admin'
    };

    return {
      isOwner: false,
      isCollaborator: true,
      role,
      permissions
    };
  }

  // Méthode privée pour enrichir les données d'un collaborateur
  private static async enrichCollaboratorData(collab: any): Promise<Collaborator> {
    // Récupérer les informations de l'utilisateur
    const { data: user } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('id', collab.user_id)
      .single();

    // Récupérer les informations du projet
    const { data: project } = await supabase
      .from('project_summary')
      .select('project_id, nom_projet, description_synthetique')
      .eq('project_id', collab.project_id)
      .single();

    // Récupérer les informations de la personne qui a invité
    const { data: inviter } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('id', collab.invited_by)
      .single();

    return {
      ...collab,
      role: collab.role as CollaboratorRole,
      status: collab.status as 'accepted' | 'suspended',
      user: user || undefined,
      project: project || undefined,
      inviter: inviter || undefined
    } as Collaborator;
  }

  // Envoyer l'email d'invitation (méthode privée)
  private static async sendInvitationEmail(email: string, token: string, projectId: string): Promise<void> {
    try {
      // Récupérer les informations du projet
      const { data: project } = await supabase
        .from('project_summary')
        .select('nom_projet')
        .eq('project_id', projectId)
        .single();

      const inviteUrl = `${window.location.origin}/accept-invitation?token=${token}`;
      
      // Utiliser la fonction Edge de Supabase pour envoyer l'email
      const { error } = await supabase.functions.invoke('send-invitation-email', {
        body: { 
          email, 
          inviteUrl,
          projectName: project?.nom_projet || 'Projet Aurentia'
        }
      });

      if (error) {
        console.error('Erreur lors de l\'envoi de l\'email:', error);
        // Ne pas faire échouer l'invitation si l'email ne peut pas être envoyé
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email d\'invitation:', error);
      // Ne pas faire échouer l'invitation si l'email ne peut pas être envoyé
    }
  }
}