import { InvitationCode } from '@/types/organisationTypes';

// Couleurs des statuts d'invitation pour l'affichage
export const INVITATION_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-green-100 text-green-800',
  expired: 'bg-red-100 text-red-800',
  revoked: 'bg-gray-100 text-gray-800',
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-red-100 text-red-800'
};

// Labels français des statuts d'invitation
export const INVITATION_STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  accepted: 'Acceptée',
  expired: 'Expirée',
  revoked: 'Révoquée',
  active: 'Active',
  inactive: 'Expirée'
};

// Labels français des rôles d'invitation
export const INVITATION_ROLE_LABELS: Record<string, string> = {
  member: 'Membre (Adhérent)',
  staff: 'Staff (Administrateur)',
  organisation: 'Organisation (Propriétaire)',
  mentor: 'Mentor', // Legacy support
  entrepreneur: 'Entrepreneur' // Legacy support
};

// Options pour les selects de rôle d'invitation
export const INVITATION_ROLE_OPTIONS = [
  { value: 'member', label: 'Membre (Adhérent)' },
  { value: 'staff', label: 'Staff (Administrateur)' },
  { value: 'mentor', label: 'Mentor' },
  { value: 'organisation', label: 'Organisation (Propriétaire)' }
] as const;

// Fonctions utilitaires pour récupérer les couleurs et labels
export const getInvitationStatusColor = (status: string): string => {
  return INVITATION_STATUS_COLORS[status] || INVITATION_STATUS_COLORS.pending;
};

export const getInvitationStatusLabel = (status: string): string => {
  return INVITATION_STATUS_LABELS[status] || status;
};

export const getInvitationRoleLabel = (role: string): string => {
  return INVITATION_ROLE_LABELS[role] || role;
};