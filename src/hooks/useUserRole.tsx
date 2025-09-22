import { useUserProfile } from './useUserProfile';
import { UserRole } from '@/types/userTypes';

export const useUserRole = () => {
  const { userProfile, loading } = useUserProfile();
  
  const userRole: UserRole = userProfile?.user_role || 'individual';
  
  const isIndividual = userRole === 'individual';
  const isMember = userRole === 'member';
  const isStaff = userRole === 'staff';
  const isOrganisation = userRole === 'organisation';
  const isSuperAdmin = userRole === 'super_admin';
  
  // Backward compatibility
  const isAdmin = isStaff || isOrganisation; // For components that still check isAdmin
  
  // Helper functions pour les vérifications de permissions
  const hasOrganizationAccess = () => {
    return userProfile?.organization_id !== null && userProfile?.organization_id !== undefined;
  };

  const canManageUsers = () => {
    return isStaff || isOrganisation || isSuperAdmin;
  };

  const canCreateInvitationCodes = () => {
    return isStaff || isOrganisation || isSuperAdmin;
  };

  const canAccessSuperAdminFeatures = () => {
    return isSuperAdmin;
  };

  const canAccessAdminFeatures = () => {
    return isStaff || isOrganisation || isSuperAdmin;
  };

  const canAccessMemberFeatures = () => {
    return isMember || isStaff || isOrganisation || isSuperAdmin;
  };

  const canManageOrganization = () => {
    return isOrganisation || isSuperAdmin;
  };

  const canManageStaff = () => {
    return isOrganisation || isSuperAdmin;
  };

  // Fonction pour obtenir le chemin de base selon le rôle
  const getBasePath = () => {
    switch (userRole) {
      case 'super_admin':
        return '/super-admin';
      case 'organisation':
      case 'staff':
        // Pour les admins d'organisation, vérifier que l'organization_id existe
        if (userProfile?.organization_id) {
          return `/organisation/${userProfile.organization_id}`;
        } else {
          // Si pas d'organization_id, rediriger vers setup au lieu du fallback
          console.warn('Utilisateur organisation sans organization_id, redirection vers setup');
          return '/setup-organization';
        }
      case 'member':
        return '/member';
      case 'individual':
      default:
        return '/individual';
    }
  };

  // Fonction pour obtenir le dashboard par défaut
  const getDefaultDashboard = () => {
    return `${getBasePath()}/dashboard`;
  };

  return {
    userRole,
    userProfile,
    loading,
    isIndividual,
    isMember,
    isStaff,
    isOrganisation,
    isSuperAdmin,
    isAdmin, // Backward compatibility
    hasOrganizationAccess,
    canManageUsers,
    canCreateInvitationCodes,
    canAccessSuperAdminFeatures,
    canAccessAdminFeatures,
    canAccessMemberFeatures,
    canManageOrganization,
    canManageStaff,
    getBasePath,
    getDefaultDashboard
  };
};