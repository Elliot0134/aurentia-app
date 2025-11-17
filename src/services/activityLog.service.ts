import { supabase } from '@/integrations/supabase/client';
import { ActivityLogEntry, ActivityAction } from '@/types/collaboration';

export class ActivityLogService {
  /**
   * Log an activity to the project activity log
   */
  static async logActivity(
    projectId: string,
    userId: string,
    action: ActivityAction,
    metadata?: Record<string, any>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('project_activity_log')
        .insert({
          project_id: projectId,
          user_id: userId,
          action,
          metadata: metadata || {}
        });

      if (error) {
        console.error('Error logging activity:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error in logActivity:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get activity log for a project
   */
  static async getProjectActivityLog(
    projectId: string,
    limit: number = 50
  ): Promise<ActivityLogEntry[]> {
    try {
      const { data, error } = await supabase
        .from('project_activity_log')
        .select(`
          *,
          user:user_id(id, email)
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching activity log:', error);
        return [];
      }

      return (data || []).map(entry => ({
        id: entry.id,
        project_id: entry.project_id,
        user_id: entry.user_id,
        action: entry.action as ActivityAction,
        metadata: entry.metadata || {},
        created_at: entry.created_at,
        user: entry.user ? {
          id: entry.user.id,
          email: entry.user.email
        } : undefined
      }));
    } catch (error) {
      console.error('Error in getProjectActivityLog:', error);
      return [];
    }
  }

  /**
   * Log ownership transfer
   */
  static async logOwnershipTransfer(
    projectId: string,
    fromUserId: string,
    toUserId: string,
    toUserEmail: string
  ): Promise<{ success: boolean; error?: string }> {
    return this.logActivity(projectId, fromUserId, 'ownership_transferred', {
      from_user_id: fromUserId,
      to_user_id: toUserId,
      to_user_email: toUserEmail,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log collaborator addition
   */
  static async logCollaboratorAdded(
    projectId: string,
    inviterId: string,
    newCollaboratorId: string,
    newCollaboratorEmail: string,
    role: string
  ): Promise<{ success: boolean; error?: string }> {
    return this.logActivity(projectId, inviterId, 'collaborator_added', {
      new_collaborator_id: newCollaboratorId,
      new_collaborator_email: newCollaboratorEmail,
      role,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log collaborator removal
   */
  static async logCollaboratorRemoved(
    projectId: string,
    removerId: string,
    removedCollaboratorId: string,
    removedCollaboratorEmail: string
  ): Promise<{ success: boolean; error?: string }> {
    return this.logActivity(projectId, removerId, 'collaborator_removed', {
      removed_collaborator_id: removedCollaboratorId,
      removed_collaborator_email: removedCollaboratorEmail,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log role change
   */
  static async logRoleChanged(
    projectId: string,
    changerId: string,
    targetUserId: string,
    targetUserEmail: string,
    oldRole: string,
    newRole: string
  ): Promise<{ success: boolean; error?: string }> {
    return this.logActivity(projectId, changerId, 'role_changed', {
      target_user_id: targetUserId,
      target_user_email: targetUserEmail,
      old_role: oldRole,
      new_role: newRole,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log share code creation
   */
  static async logShareCodeCreated(
    projectId: string,
    creatorId: string,
    code: string,
    role: string,
    maxUses: number
  ): Promise<{ success: boolean; error?: string }> {
    return this.logActivity(projectId, creatorId, 'share_code_created', {
      code,
      role,
      max_uses: maxUses,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log share code deactivation
   */
  static async logShareCodeDeactivated(
    projectId: string,
    deactivatorId: string,
    code: string
  ): Promise<{ success: boolean; error?: string }> {
    return this.logActivity(projectId, deactivatorId, 'share_code_deactivated', {
      code,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log invitation sent
   */
  static async logInvitationSent(
    projectId: string,
    inviterId: string,
    inviteeEmail: string,
    role: string
  ): Promise<{ success: boolean; error?: string }> {
    return this.logActivity(projectId, inviterId, 'invitation_sent', {
      invitee_email: inviteeEmail,
      role,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log invitation accepted
   */
  static async logInvitationAccepted(
    projectId: string,
    accepterId: string,
    accepterEmail: string,
    role: string
  ): Promise<{ success: boolean; error?: string }> {
    return this.logActivity(projectId, accepterId, 'invitation_accepted', {
      accepter_email: accepterEmail,
      role,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log invitation rejected
   */
  static async logInvitationRejected(
    projectId: string,
    rejecterId: string,
    rejecterEmail: string
  ): Promise<{ success: boolean; error?: string }> {
    return this.logActivity(projectId, rejecterId, 'invitation_rejected', {
      rejecter_email: rejecterEmail,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log invitation cancelled
   */
  static async logInvitationCancelled(
    projectId: string,
    cancellerId: string,
    inviteeEmail: string
  ): Promise<{ success: boolean; error?: string }> {
    return this.logActivity(projectId, cancellerId, 'invitation_cancelled', {
      invitee_email: inviteeEmail,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log invitation resent
   */
  static async logInvitationResent(
    projectId: string,
    resenderId: string,
    inviteeEmail: string,
    role: string
  ): Promise<{ success: boolean; error?: string }> {
    return this.logActivity(projectId, resenderId, 'invitation_resent', {
      invitee_email: inviteeEmail,
      role,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get human-readable description of an activity
   */
  static getActivityDescription(entry: ActivityLogEntry): string {
    const userEmail = entry.user?.email || 'Un utilisateur';

    switch (entry.action) {
      case 'ownership_transferred':
        return `${userEmail} a transféré la propriété du projet à ${entry.metadata.to_user_email || 'un autre utilisateur'}`;

      case 'collaborator_added':
        return `${userEmail} a ajouté ${entry.metadata.new_collaborator_email || 'un collaborateur'} avec le rôle ${entry.metadata.role || 'non spécifié'}`;

      case 'collaborator_removed':
        return `${userEmail} a retiré ${entry.metadata.removed_collaborator_email || 'un collaborateur'} du projet`;

      case 'role_changed':
        return `${userEmail} a changé le rôle de ${entry.metadata.target_user_email || 'un utilisateur'} de ${entry.metadata.old_role || '?'} à ${entry.metadata.new_role || '?'}`;

      case 'share_code_created':
        return `${userEmail} a créé un code d'invitation (${entry.metadata.code}) pour le rôle ${entry.metadata.role || 'non spécifié'}`;

      case 'share_code_deactivated':
        return `${userEmail} a désactivé le code d'invitation ${entry.metadata.code || ''}`;

      case 'invitation_sent':
        return `${userEmail} a envoyé une invitation à ${entry.metadata.invitee_email || 'un utilisateur'} avec le rôle ${entry.metadata.role || 'non spécifié'}`;

      case 'invitation_accepted':
        return `${entry.metadata.accepter_email || userEmail} a accepté l'invitation et rejoint le projet comme ${entry.metadata.role || 'collaborateur'}`;

      case 'invitation_rejected':
        return `${entry.metadata.rejecter_email || userEmail} a refusé l'invitation`;

      case 'invitation_cancelled':
        return `${userEmail} a annulé l'invitation de ${entry.metadata.invitee_email || 'un utilisateur'}`;

      case 'invitation_resent':
        return `${userEmail} a renvoyé l'invitation à ${entry.metadata.invitee_email || 'un utilisateur'}`;

      default:
        return `${userEmail} a effectué une action: ${entry.action}`;
    }
  }

  /**
   * Get activity icon name based on action type
   */
  static getActivityIcon(action: ActivityAction): string {
    switch (action) {
      case 'ownership_transferred':
        return 'crown';
      case 'collaborator_added':
        return 'user-plus';
      case 'collaborator_removed':
        return 'user-minus';
      case 'role_changed':
        return 'shield';
      case 'share_code_created':
        return 'link';
      case 'share_code_deactivated':
        return 'link-off';
      case 'invitation_sent':
        return 'mail';
      case 'invitation_accepted':
        return 'check-circle';
      case 'invitation_rejected':
        return 'x-circle';
      case 'invitation_cancelled':
        return 'mail-x';
      case 'invitation_resent':
        return 'mail-forward';
      default:
        return 'activity';
    }
  }
}
