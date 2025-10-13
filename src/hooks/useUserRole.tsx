import { UserRole } from '@/types/userTypes';
import { useUser } from '@/contexts/UserContext';

export const useUserRole = () => {
  const { userProfile, userRole, organizationId, loading } = useUser();
  
  const isIndividual = userRole === 'individual';
  const isMember = userRole === 'member';
  const isStaff = userRole === 'staff';
  const isOrganisation = userRole === 'organisation';
  const isSuperAdmin = userRole === 'super_admin';
  
  // Backward compatibility
  const isAdmin = isStaff || isOrganisation; // For components that still check isAdmin
  
  // Helper functions pour les vérifications de permissions
  const hasOrganizationAccess = () => {
    return organizationId !== null && organizationId !== undefined;
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
        // Pour les admins d'organisation, utiliser l'organization_id du hook
        if (organizationId) {
          return `/organisation/${organizationId}`;
        } else {
          // Si pas d'organization_id, rediriger vers setup
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
    organizationId, // Export the organizationId from user_organizations
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