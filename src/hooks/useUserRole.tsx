import { useUserProfile } from './useUserProfile';
import { UserRole } from '@/types/userTypes';

export const useUserRole = () => {
  const { userProfile, loading } = useUserProfile();
  
  const userRole: UserRole = userProfile?.user_role || 'individual';
  
  const isIndividual = userRole === 'individual';
  const isMember = userRole === 'member';
  const isAdmin = userRole === 'admin';
  const isSuperAdmin = userRole === 'super_admin';
  
  // Helper functions pour les vérifications de permissions
  const hasOrganizationAccess = () => {
    return userProfile?.organization_id !== null && userProfile?.organization_id !== undefined;
  };

  const canManageUsers = () => {
    return isAdmin || isSuperAdmin;
  };

  const canCreateInvitationCodes = () => {
    return isAdmin || isSuperAdmin;
  };

  const canAccessSuperAdminFeatures = () => {
    return isSuperAdmin;
  };

  const canAccessAdminFeatures = () => {
    return isAdmin || isSuperAdmin;
  };

  const canAccessMemberFeatures = () => {
    return isMember || isAdmin || isSuperAdmin;
  };

  // Fonction pour obtenir le chemin de base selon le rôle
  const getBasePath = () => {
    switch (userRole) {
      case 'super_admin':
        return '/super-admin';
      case 'admin':
        return '/admin';
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
    isAdmin,
    isSuperAdmin,
    hasOrganizationAccess,
    canManageUsers,
    canCreateInvitationCodes,
    canAccessSuperAdminFeatures,
    canAccessAdminFeatures,
    canAccessMemberFeatures,
    getBasePath,
    getDefaultDashboard
  };
};