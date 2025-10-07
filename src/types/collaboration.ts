export type CollaboratorRole = 'owner' | 'admin' | 'editor' | 'viewer';
export type CollaboratorStatus = 'active' | 'inactive' | 'suspended';
export type InvitationStatus = 'pending' | 'accepted' | 'rejected' | 'expired';

export interface Collaborator {
  id: string;
  project_id: string;
  user_id: string;
  role: CollaboratorRole;
  status: CollaboratorStatus;
  permissions?: any;
  joined_at: string;
  updated_at: string;
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
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  invited_at: string;
  accepted_at?: string;
  accepted_by?: string;
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
    case 'viewer':
      return {
        canRead: true,
        canWrite: false,
        canDelete: false,
        canManageCollaborators: false,
        canChangeSettings: false
      };
    case 'editor':
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
        canChangeSettings: false
      };
    case 'owner':
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
    case 'viewer':
      return 'Lecteur';
    case 'editor':
      return 'Éditeur';
    case 'admin':
      return 'Administrateur';
    case 'owner':
      return 'Propriétaire';
    default:
      return 'Inconnu';
  }
};

export const getStatusLabel = (status: CollaboratorStatus): string => {
  switch (status) {
    case 'active':
      return 'Actif';
    case 'inactive':
      return 'Inactif';
    case 'suspended':
      return 'Suspendu';
    default:
      return 'Inconnu';
  }
};