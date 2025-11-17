import { supabase } from '@/integrations/supabase/client';
import { Collaborator, CollaboratorRole, CollaboratorStatus, Invitation } from '@/types/collaboration';
import { EmailService } from './email.service';

export class CollaboratorsService {
  // Récupérer tous les collaborateurs d'un projet
  static async getProjectCollaborators(projectId: string): Promise<Collaborator[]> {
    const { data, error } = await supabase
      .from('project_collaborators')
      .select('*')
          .eq('project_id', projectId)
          .order('joined_at', { ascending: false });

        if (error) throw error;
        if (!data) return [];

        // Enrichir les données avec les informations des utilisateurs et projets
        const collaborators = await Promise.all(
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

            // Les informations de la personne qui a invité sont stockées dans project_invitations
            // Pour les collaborateurs existants, nous n'avons pas cette information directement
            const inviter = null;

            return {
              id: collab.id,
              project_id: collab.project_id,
              user_id: collab.user_id,
              role: collab.role as CollaboratorRole,
              status: collab.status as CollaboratorStatus,
              permissions: (collab as any).permissions || null,
              joined_at: (collab as any).joined_at || new Date().toISOString(),
              updated_at: (collab as any).updated_at || new Date().toISOString(),
              user: user || undefined,
              project: project || undefined,
              inviter: inviter || undefined
            } as Collaborator;
          })
        );

        return collaborators;
  }

  // Récupérer tous les collaborateurs de l'utilisateur connecté
  static async getUserCollaborators(): Promise<Collaborator[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('Utilisateur non authentifié pour getUserCollaborators');
        return [];
      }

      console.log('Récupération des projets pour l\'utilisateur:', user.id);

      // Récupérer tous les projets où l'utilisateur est propriétaire
      const { data: ownedProjects, error: ownedError } = await supabase
        .from('project_summary')
        .select('project_id, nom_projet')
        .eq('user_id', user.id);

      if (ownedError) {
        console.error('Erreur lors de la récupération des projets possédés:', ownedError);
        throw ownedError;
      }

      // Récupérer tous les projets où l'utilisateur est collaborateur
      const { data: collabProjects, error: collabError } = await supabase
        .from('project_collaborators')
        .select(`
          project_id,
          project_summary!inner(
            project_id,
            nom_projet
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (collabError) {
        console.error('Erreur lors de la récupération des projets collaboratifs:', collabError);
      }

      // Combiner tous les projets (possédés + collaboratifs)
      const allProjects = [...(ownedProjects || [])];

      if (collabProjects) {
        collabProjects.forEach((collab: {
          project_id: string;
          project_summary: {
            project_id: string;
            nom_projet: string;
          };
        }) => {
          const projectData = collab.project_summary;
          if (projectData && !allProjects.find(p => p.project_id === projectData.project_id)) {
            allProjects.push({
              project_id: projectData.project_id,
              nom_projet: projectData.nom_projet
            });
          }
        });
      }

      console.log('Projets trouvés (possédés + collaboratifs):', allProjects.length);

      if (allProjects.length === 0) {
        console.log('Aucun projet trouvé pour cet utilisateur');
        return [];
      }

      // Récupérer tous les collaborateurs de ces projets
      const { data, error } = await supabase
        .from('project_collaborators')
        .select('*')
        .in('project_id', allProjects.map(p => p.project_id))
        .order('joined_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des collaborateurs:', error);
        throw error;
      }

      console.log('Collaborateurs trouvés:', data?.length || 0);

      if (!data) return [];

      // Enrichir les données avec les informations des utilisateurs et projets
      const enrichedCollaborators = await Promise.all(
        data.map(async (collab) => {
          try {
            // Récupérer les informations de l'utilisateur
            const { data: userProfile } = await supabase
              .from('profiles')
              .select('id, email')
              .eq('id', collab.user_id)
              .single();

            // Trouver le projet correspondant dans notre liste
            const project = allProjects.find(p => p.project_id === collab.project_id);

            return {
              id: collab.id,
              project_id: collab.project_id,
              user_id: collab.user_id,
              role: collab.role as CollaboratorRole,
              status: collab.status as CollaboratorStatus,
              permissions: (collab as any).permissions || null,
              joined_at: (collab as any).joined_at || new Date().toISOString(),
              updated_at: (collab as any).updated_at || new Date().toISOString(),
              user: userProfile || undefined,
              project: project ? {
                project_id: project.project_id,
                nom_projet: project.nom_projet,
                description_synthetique: ''
              } : undefined,
              inviter: null
            } as Collaborator;
          } catch (error) {
            console.error('Erreur lors de l\'enrichissement du collaborateur:', collab.id, error);
            // Retourner un collaborateur minimal en cas d'erreur
            return {
              id: collab.id,
              project_id: collab.project_id,
              user_id: collab.user_id,
              role: collab.role as CollaboratorRole,
              status: collab.status as CollaboratorStatus,
              permissions: null,
              joined_at: (collab as any).joined_at || new Date().toISOString(),
              updated_at: (collab as any).updated_at || new Date().toISOString(),
              user: undefined,
              project: undefined,
              inviter: undefined
            } as Collaborator;
          }
        })
      );

      return enrichedCollaborators;
    } catch (error) {
      console.error('Erreur dans getUserCollaborators:', error);
      throw error;
    }
  }

  // Inviter un collaborateur
  static async inviteCollaborator(
    projectId: string,
    email: string,
    role: CollaboratorRole
  ): Promise<{ success: boolean; invitation_id?: string; token?: string; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

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
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .single();

      if (existingInvitation) {
        return { success: false, error: 'Une invitation est déjà en attente pour cet email' };
      }

      // Générer un token unique
      const token = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // Expire dans 7 jours

      // Récupérer le nom du projet
      const { data: project, error: projectError } = await supabase
        .from('project_summary')
        .select('nom_projet')
        .eq('project_id', projectId)
        .single();

      if (projectError) {
        throw new Error(`Impossible de récupérer les informations du projet: ${projectError.message}`);
      }

      // Créer l'invitation avec le nom du projet
      const { data: invitation, error } = await supabase
        .from('project_invitations')
        .insert({
          project_id: projectId,
          project_name: project.nom_projet,
          email,
          role,
          token,
          expires_at: expiresAt.toISOString(),
          invited_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Récupérer l'email de l'inviteur
      const { data: inviterProfile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', user.id)
        .single();

      // Envoyer l'email d'invitation avec le nouveau service
      console.log('📧 Tentative d\'envoi d\'email d\'invitation...');
      const emailResult = await EmailService.sendCollaborationInvitation(
        email,
        token,
        project.nom_projet || 'Projet Aurentia',
        inviterProfile?.email || user.email || 'un collaborateur'
      );
      
      if (!emailResult.success) {
        console.error('❌ Email d\'invitation non envoyé:', emailResult.error);
        // Ne pas faire échouer l'invitation si l'email ne peut pas être envoyé
      } else {
        console.log('✅ Email d\'invitation envoyé avec succès');
      }

      return {
        success: true,
        invitation_id: invitation.id,
        token: invitation.token
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Récupérer une invitation par token
  static async getInvitationByToken(token: string): Promise<any> {
    try {
      // D'abord, vérifier si l'invitation existe, quel que soit son statut
      const { data: invitation, error } = await supabase
        .from('project_invitations')
        .select('*')
        .eq('token', token)
        .single();

      if (error || !invitation) {
        throw new Error('Invitation introuvable');
      }

      // Vérifier le statut de l'invitation
      if (invitation.status === 'accepted') {
        throw new Error('Cette invitation a déjà été acceptée');
      }

      if (invitation.status !== 'pending') {
        throw new Error('Invitation invalide');
      }

      // Vérifier l'expiration
      if (new Date(invitation.expires_at) <= new Date()) {
        throw new Error('Cette invitation a expiré');
      }

      // Récupérer les informations du projet séparément
      const { data: project } = await supabase
        .from('project_summary')
        .select('nom_projet, description_synthetique')
        .eq('project_id', invitation.project_id)
        .single();

      return {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        projectName: project?.nom_projet || 'Projet inconnu',
        projectDescription: project?.description_synthetique || '',
        expiresAt: invitation.expires_at
      };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Accepter une invitation
  static async acceptInvitation(token: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('Tentative d\'acceptation avec token:', token);
      
      // Récupérer l'invitation
      const { data: invitation, error: invitationError } = await supabase
        .from('project_invitations')
        .select('*')
        .eq('token', token)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .single();

      console.log('Invitation trouvée:', invitation);
      console.log('Erreur invitation:', invitationError);

      if (invitationError || !invitation) {
        return { success: false, error: 'Invitation invalide ou expirée' };
      }

      return this.processInvitationAcceptance(invitation);
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Accepter une invitation par ID
  static async acceptInvitationById(invitationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('Tentative d\'acceptation avec ID:', invitationId);
      
      // Récupérer l'invitation
      const { data: invitation, error: invitationError } = await supabase
        .from('project_invitations')
        .select('*')
        .eq('id', invitationId)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .single();

      console.log('Invitation trouvée:', invitation);
      console.log('Erreur invitation:', invitationError);

      if (invitationError || !invitation) {
        return { success: false, error: 'Invitation invalide ou expirée' };
      }

      return this.processInvitationAcceptance(invitation);
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Méthode commune pour traiter l'acceptation d'une invitation
  private static async processInvitationAcceptance(invitation: any): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('=== DÉBUT ACCEPTATION INVITATION ===');
      console.log('Invitation reçue:', invitation);
      
      // Récupérer l'utilisateur actuel
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Utilisateur actuel:', user?.email, user?.id);
      
      if (!user) {
        return { success: false, error: 'Vous devez être connecté pour accepter une invitation' };
      }

      // Récupérer le profil correspondant pour s'assurer de l'ID correct
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('id', user.id)
        .single();

      console.log('Profil trouvé:', profile);

      if (!profile) {
        return { success: false, error: 'Profil utilisateur introuvable' };
      }

      // Vérifier que l'email correspond
      if (profile.email !== invitation.email) {
        console.log('Email mismatch:', profile.email, 'vs', invitation.email);
        return { success: false, error: 'Cette invitation n\'est pas destinée à votre compte' };
      }

      // Vérifier si l'utilisateur n'est pas déjà collaborateur
      const { data: existingCollaborator } = await supabase
        .from('project_collaborators')
        .select('*')
        .eq('project_id', invitation.project_id)
        .eq('user_id', profile.id)
        .single();

      if (existingCollaborator) {
        // Marquer l'invitation comme utilisée même si déjà collaborateur
        console.log('Utilisateur déjà collaborateur, marquage de l\'invitation comme acceptée');
        console.log('Auth email check - Profile:', profile.email, 'Invitation:', invitation.email);

        // Use secure RPC function to bypass RLS
        const { data: rpcResult, error: rpcError } = await supabase
          .rpc('accept_invitation_secure', {
            p_invitation_id: invitation.id,
            p_user_id: profile.id,
            p_user_email: profile.email
          });

        if (rpcError || !rpcResult?.success) {
          console.error('Erreur lors de la mise à jour de l\'invitation (déjà collaborateur):', rpcError || rpcResult);
          return { success: false, error: rpcResult?.error || rpcError?.message || 'Impossible de marquer l\'invitation comme acceptée' };
        }

        // Retourner succès au lieu d'une erreur - l'utilisateur est déjà sur le projet
        console.log('=== INVITATION DÉJÀ ACCEPTÉE (utilisateur existant) ===');
        return { success: true };
      }

      // Ajouter le collaborateur
      const { error: collaboratorError } = await supabase
        .from('project_collaborators')
        .insert({
          project_id: invitation.project_id,
          user_id: profile.id,
          role: invitation.role
        } as any);

      if (collaboratorError) throw collaboratorError;

      // Marquer l'invitation comme utilisée
      console.log('Mise à jour de l\'invitation avec ID:', invitation.id);
      console.log('Profile email pour la mise à jour:', profile.email);

      // Use secure RPC function to bypass RLS
      const { data: rpcResult, error: rpcError } = await supabase
        .rpc('accept_invitation_secure', {
          p_invitation_id: invitation.id,
          p_user_id: profile.id,
          p_user_email: profile.email
        });

      console.log('RPC Result:', rpcResult);
      console.log('RPC Error:', rpcError);

      if (rpcError) throw rpcError;
      if (!rpcResult?.success) {
        throw new Error(rpcResult?.error || 'Failed to mark invitation as accepted');
      }

      // Récupérer les informations pour envoyer l'email de confirmation
      const { data: inviterProfile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', invitation.invited_by)
        .single();

      // Log activity
      const { ActivityLogService } = await import('@/services/activityLog.service');
      await ActivityLogService.logInvitationAccepted(
        invitation.project_id,
        profile.id,
        profile.email || invitation.email,
        invitation.role as string
      );

      // Envoyer l'email de confirmation d'acceptation
      if (inviterProfile?.email) {
        const emailResult = await EmailService.sendInvitationAcceptedNotification(
          inviterProfile.email,
          invitation.email,
          invitation.project_id
        );

        if (!emailResult.success) {
          console.warn('Email de confirmation non envoyé:', emailResult.error);
        }
      }

      console.log('=== INVITATION ACCEPTÉE AVEC SUCCÈS ===');
      return { success: true };
    } catch (error: any) {
      console.error('=== ERREUR LORS DE L\'ACCEPTATION ===', error);
      return { success: false, error: error.message };
    }
  }

  // Mettre à jour le rôle d'un collaborateur
  static async updateCollaboratorRole(
    collaboratorId: string,
    newRole: CollaboratorRole
  ): Promise<Collaborator> {
    try {
      // Pour l'instant, utilisons la méthode directe car TypeScript ne reconnaît pas encore les nouvelles fonctions
      const { data, error } = await supabase
        .from('project_collaborators')
        .update({ 
          role: newRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', collaboratorId)
        .select()
        .single();

      if (error) throw error;

      // Enrichir les données
      return await this.enrichCollaboratorData(data);
    } catch (error: any) {
      console.error('Erreur updateCollaboratorRole:', error);
      throw error;
    }
  }

  // Mettre à jour le statut d'un collaborateur
  static async updateCollaboratorStatus(
    collaboratorId: string,
    status: CollaboratorStatus
  ): Promise<Collaborator> {
    try {
      // Pour l'instant, utilisons la méthode directe
      const { data, error } = await supabase
        .from('project_collaborators')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', collaboratorId)
        .select()
        .single();

      if (error) throw error;

      // Enrichir les données
      return await this.enrichCollaboratorData(data);
    } catch (error: any) {
      console.error('Erreur updateCollaboratorStatus:', error);
      throw error;
    }
  }

  // Supprimer un collaborateur
  static async removeCollaborator(collaboratorId: string): Promise<void> {
    try {
      // Pour l'instant, utilisons la méthode directe
      const { error } = await supabase
        .from('project_collaborators')
        .delete()
        .eq('id', collaboratorId);

      if (error) throw error;
    } catch (error: any) {
      console.error('Erreur removeCollaborator:', error);
      throw error;
    }
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
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .order('invited_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la requête project_invitations:', error);
        throw error;
      }

      if (!data) return [];

      console.log('Invitations trouvées:', data.length);

      // Filtrer les invitations où l'utilisateur est déjà collaborateur
      const filteredInvitations = await Promise.all(
        data.map(async (invitation) => {
          const { data: existingCollab } = await supabase
            .from('project_collaborators')
            .select('id')
            .eq('project_id', invitation.project_id)
            .eq('user_id', user.id)
            .single();

          // Si l'utilisateur est déjà collaborateur, marquer l'invitation comme acceptée et la filtrer
          if (existingCollab) {
            console.log(`Utilisateur déjà collaborateur sur projet ${invitation.project_id}, marquage de l'invitation comme acceptée`);

            // Use secure RPC function to bypass RLS
            await supabase.rpc('accept_invitation_secure', {
              p_invitation_id: invitation.id,
              p_user_id: user.id,
              p_user_email: user.email as string
            });

            return null; // Filtrer cette invitation
          }

          return {
            ...invitation,
            role: invitation.role as CollaboratorRole,
            project: undefined,
            inviter: undefined
          } as Invitation;
        })
      );

      // Retourner uniquement les invitations non nulles
      const validInvitations = filteredInvitations.filter(inv => inv !== null) as Invitation[];
      console.log('Invitations valides après filtrage:', validInvitations.length);

      return validInvitations;

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
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
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
  static async cancelInvitation(invitationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get invitation details first for activity logging
      const { data: invitation, error: fetchError } = await supabase
        .from('project_invitations')
        .select('project_id, email, invited_by')
        .eq('id', invitationId)
        .single();

      if (fetchError) {
        return { success: false, error: fetchError.message };
      }

      // Delete the invitation
      const { error } = await supabase
        .from('project_invitations')
        .delete()
        .eq('id', invitationId);

      if (error) {
        return { success: false, error: error.message };
      }

      // Log activity
      if (invitation) {
        const { ActivityLogService } = await import('@/services/activityLog.service');
        await ActivityLogService.logInvitationCancelled(
          invitation.project_id,
          invitation.invited_by,
          invitation.email
        );
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error cancelling invitation:', error);
      return { success: false, error: error.message };
    }
  }

  // Rejeter une invitation
  static async rejectInvitation(invitationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      // Get invitation details first for activity logging
      const { data: invitation, error: fetchError } = await supabase
        .from('project_invitations')
        .select('project_id, email, invited_by')
        .eq('id', invitationId)
        .eq('email', user.email)
        .single();

      if (fetchError) {
        return { success: false, error: 'Invitation not found or not authorized' };
      }

      // Update invitation status
      const { error } = await supabase
        .from('project_invitations')
        .update({
          status: 'rejected',
          accepted_at: new Date().toISOString(),
          accepted_by: user.id
        })
        .eq('id', invitationId);

      if (error) {
        return { success: false, error: error.message };
      }

      // Log activity
      if (invitation) {
        const { ActivityLogService } = await import('@/services/activityLog.service');
        await ActivityLogService.logInvitationRejected(
          invitation.project_id,
          user.id,
          user.email || invitation.email
        );
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error rejecting invitation:', error);
      return { success: false, error: error.message };
    }
  }

  // Renvoyer une invitation
  static async resendInvitation(invitationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      // Get invitation details
      const { data: invitation, error: fetchError } = await supabase
        .from('project_invitations')
        .select('project_id, email, role, invited_by, expires_at')
        .eq('id', invitationId)
        .single();

      if (fetchError) {
        return { success: false, error: 'Invitation not found' };
      }

      // Verify user is the one who sent the invitation
      if (invitation.invited_by !== user.id) {
        return { success: false, error: 'Not authorized to resend this invitation' };
      }

      // Extend expiration and update invited_at
      const newExpiresAt = new Date();
      newExpiresAt.setDate(newExpiresAt.getDate() + 7); // 7 days from now

      const { error } = await supabase
        .from('project_invitations')
        .update({
          invited_at: new Date().toISOString(),
          expires_at: newExpiresAt.toISOString(),
          status: 'pending'
        })
        .eq('id', invitationId);

      if (error) {
        return { success: false, error: error.message };
      }

      // TODO: Send new email notification
      // This would require edge function or email service integration

      // Log activity
      if (invitation) {
        const { ActivityLogService } = await import('@/services/activityLog.service');
        await ActivityLogService.logInvitationResent(
          invitation.project_id,
          user.id,
          invitation.email,
          invitation.role as string
        );
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error resending invitation:', error);
      return { success: false, error: error.message };
    }
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
      canWrite: role === 'editor' || role === 'admin' || role === 'owner',
      canDelete: role === 'admin' || role === 'owner',
      canManageCollaborators: role === 'admin' || role === 'owner',
      canChangeSettings: role === 'owner'
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

    // Les informations de la personne qui a invité sont stockées dans project_invitations
    // Pour les collaborateurs existants, nous n'avons pas cette information directement
    const inviter = null;

    return {
      id: collab.id,
      project_id: collab.project_id,
      user_id: collab.user_id,
      role: collab.role as CollaboratorRole,
      status: collab.status as CollaboratorStatus,
      permissions: (collab as any).permissions || null,
      joined_at: (collab as any).joined_at || new Date().toISOString(),
      updated_at: (collab as any).updated_at || new Date().toISOString(),
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

      const baseUrl = import.meta.env.VITE_APP_BASE_URL || window.location.origin;
      const inviteUrl = `${baseUrl}/accept-invitation?token=${token}`;
      
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

  // Traiter les invitations acceptées lors de la connexion d'un utilisateur
  static async processAcceptedInvitations(userEmail: string, userId: string): Promise<number> {
    try {
      // Sécuriser userEmail pour éviter les erreurs toLowerCase sur undefined
      if (!userEmail) {
        console.error('Email utilisateur non fourni pour processAcceptedInvitations');
        return 0;
      }

      // Récupérer les invitations acceptées non encore traitées
      // Utiliser une fonction RPC pour éviter les problèmes de types
      const { data: acceptedInvitations, error: invitationsError } = await (supabase as any)
        .rpc('get_accepted_invitations_for_email', { 
          user_email: userEmail.toLowerCase() 
        });

      if (invitationsError) {
        console.error('Erreur lors de la récupération des invitations acceptées:', invitationsError);
        return 0;
      }

      if (!acceptedInvitations || !Array.isArray(acceptedInvitations) || acceptedInvitations.length === 0) {
        return 0;
      }

      let projectsJoined = 0;

      // Pour chaque invitation acceptée, créer un collaborateur si il n'existe pas
      for (const invitation of acceptedInvitations) {
        // Vérifier si le collaborateur existe déjà
        const { data: existingCollaborator } = await (supabase as any)
          .from('project_collaborators')
          .select('id')
          .eq('project_id', invitation.project_id)
          .eq('user_id', userId)
          .single();

        if (!existingCollaborator) {
          // Créer le collaborateur - utiliser seulement les colonnes qui existent réellement
          const { error: createError } = await (supabase as any)
            .from('project_collaborators')
            .insert({
              project_id: invitation.project_id,
              user_id: userId,
              role: invitation.role,
              status: 'active'
            });

          if (!createError) {
            projectsJoined++;
          } else {
            console.error('Erreur lors de la création du collaborateur:', createError);
          }
        }
      }

      return projectsJoined;
    } catch (error) {
      console.error('Erreur lors du traitement des invitations acceptées:', error);
      return 0;
    }
  }

  // Transfer ownership of a project to another collaborator
  static async transferOwnership(
    projectId: string,
    newOwnerId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      // Verify current user is the owner
      const { data: project, error: projectError } = await supabase
        .from('project_summary')
        .select('user_id, owner_id, nom_projet')
        .eq('project_id', projectId)
        .single();

      if (projectError || !project) {
        return { success: false, error: 'Project not found' };
      }

      // Check if current user is owner (check both user_id and owner_id)
      const currentOwnerId = project.owner_id || project.user_id;
      if (currentOwnerId !== user.id) {
        return { success: false, error: 'Only the project owner can transfer ownership' };
      }

      // Verify new owner is a collaborator
      const { data: newOwnerCollab, error: collabError } = await supabase
        .from('project_collaborators')
        .select('id, user_id')
        .eq('project_id', projectId)
        .eq('user_id', newOwnerId)
        .single();

      if (collabError || !newOwnerCollab) {
        return { success: false, error: 'New owner must be an existing collaborator' };
      }

      // Get new owner email for logging
      const { data: newOwnerProfile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', newOwnerId)
        .single();

      // Start transaction-like operations
      // 1. Update project owner
      const { error: updateProjectError } = await supabase
        .from('project_summary')
        .update({
          user_id: newOwnerId,
          owner_id: newOwnerId
        })
        .eq('project_id', projectId);

      if (updateProjectError) {
        console.error('Error updating project owner:', updateProjectError);
        return { success: false, error: 'Failed to transfer ownership' };
      }

      // 2. Remove new owner from collaborators table (they're now the owner)
      const { error: removeCollabError } = await supabase
        .from('project_collaborators')
        .delete()
        .eq('id', newOwnerCollab.id);

      if (removeCollabError) {
        console.warn('Error removing new owner from collaborators:', removeCollabError);
        // Don't fail the operation for this
      }

      // 3. Add previous owner as admin
      const { error: addOldOwnerError } = await supabase
        .from('project_collaborators')
        .insert({
          project_id: projectId,
          user_id: user.id,
          role: 'admin',
          status: 'active'
        });

      if (addOldOwnerError) {
        console.error('Error adding previous owner as admin:', addOldOwnerError);
        // Don't fail the operation for this
      }

      // 4. Log the ownership transfer
      const ActivityLogService = (await import('./activityLog.service')).ActivityLogService;
      await ActivityLogService.logOwnershipTransfer(
        projectId,
        user.id,
        newOwnerId,
        newOwnerProfile?.email || 'Unknown'
      );

      return { success: true };
    } catch (error: any) {
      console.error('Error in transferOwnership:', error);
      return { success: false, error: error.message };
    }
  }
}