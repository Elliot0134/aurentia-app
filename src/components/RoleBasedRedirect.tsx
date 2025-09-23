import { useUserRole } from '@/hooks/useUserRole';
import { Navigate, useLocation } from 'react-router-dom';

const RoleBasedRedirect = () => {
  const { userRole, loading: roleLoading, userProfile } = useUserRole();
  const location = useLocation();

  if (roleLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  const currentPath = location.pathname;

  // Ne pas faire de redirection pour les routes publiques, organisation, ou individual (pour permettre le retour)
  if (currentPath.startsWith('/login') || 
      currentPath.startsWith('/signup') ||
      currentPath.startsWith('/update-password') ||
      currentPath.startsWith('/organisation') ||
      currentPath.startsWith('/individual')) {
    return null;
  }

  // Redirection automatique selon le rôle
  if (userRole) {
    let targetPath: string;
    
    switch (userRole) {
      case 'organisation':
      case 'staff':
        // For organization admins, redirect to their organization if they have one
        const orgId = userProfile?.organization_id;
        if (orgId) {
          targetPath = `/organisation/${orgId}/dashboard`;
        } else {
          // If no organization, redirect to individual space
          targetPath = '/individual/dashboard';
        }
        break;
      case 'super_admin':
        targetPath = '/super-admin/dashboard';
        break;
      case 'member':
        targetPath = '/member/dashboard';
        break;
      case 'individual':
      default:
        targetPath = '/individual/dashboard';
        break;
    }
    
    // Si l'utilisateur n'est pas sur le bon chemin pour son rôle
    if (!currentPath.startsWith(targetPath.split('/').slice(0, -1).join('/')) && 
        !currentPath.startsWith(`/${userRole}`) && 
        !((userRole === 'organisation' || userRole === 'staff') && currentPath.startsWith('/organisation'))) {
      return <Navigate to={targetPath} replace />;
    }
  }

  return null;
};

export default RoleBasedRedirect;