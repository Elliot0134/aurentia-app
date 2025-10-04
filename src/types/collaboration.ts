export type CollaboratorRole = 'read' | 'write' | 'admin';
export type CollaboratorStatus = 'accepted' | 'suspended';
export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'cancelled';

export interface Collaborator {
  id: string;
  project_id: string;
  user_id: string;
  role: CollaboratorRole;
  status: CollaboratorStatus;
  invited_by: string;
  invited_at: string;
  accepted_at: string;
  user?: {
    id: string;
    email: string;
  };
  project?: {
    project_id: string;
    nom_projet: string;
    description_synthetique?: string;
  };
  inviter?: {
    id: string;
    email: string;
  };
}

export interface Invitation {
  id: string;
  project_id: string;
  email: string;
  role: CollaboratorRole;
  invited_by: string;
  token: string;
  expires_at: string;
  used: boolean;
  invited_at: string;
  project?: {
    project_id: string;
    nom_projet: string;
    description_synthetique?: string;
  };
  inviter?: {
    id: string;
    email: string;
  };
}

export interface CollaboratorPermissions {
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  canManageCollaborators: boolean;
  canChangeSettings: boolean;
}

export const getPermissions = (role: CollaboratorRole): CollaboratorPermissions => {
  switch (role) {
    case 'read':
      return {
        canRead: true,
        canWrite: false,
        canDelete: false,
        canManageCollaborators: false,
        canChangeSettings: false
      };
    case 'write':
      return {
        canRead: true,
        canWrite: true,
        canDelete: false,
        canManageCollaborators: false,
        canChangeSettings: false
      };
    case 'admin':
      return {
        canRead: true,
        canWrite: true,
        canDelete: true,
        canManageCollaborators: true,
        canChangeSettings: true
      };
    default:
      return {
        canRead: false,
        canWrite: false,
        canDelete: false,
        canManageCollaborators: false,
        canChangeSettings: false
      };
  }
};

export const getRoleLabel = (role: CollaboratorRole): string => {
  switch (role) {
    case 'read':
      return 'Lecteur';
    case 'write':
      return 'Éditeur';
    case 'admin':
      return 'Administrateur';
    default:
      return 'Inconnu';
  }
};

export const getStatusLabel = (status: CollaboratorStatus): string => {
  switch (status) {
    case 'accepted':
      return 'Actif';
    case 'suspended':
      return 'Suspendu';
    default:
      return 'Inconnu';
  }
};