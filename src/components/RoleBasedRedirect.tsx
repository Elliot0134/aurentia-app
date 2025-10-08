import { useUserRole } from '@/hooks/useUserRole';
import { Navigate, useLocation } from 'react-router-dom';
import { useMemo } from 'react';

const RoleBasedRedirect = () => {
  const { userRole, loading: roleLoading, userProfile, organizationId } = useUserRole();
  const location = useLocation();

  console.log('[RoleBasedRedirect] Current path:', location.pathname);
  console.log('[RoleBasedRedirect] User role:', userRole);
  console.log('[RoleBasedRedirect] Organization ID:', organizationId);
  console.log('[RoleBasedRedirect] Loading:', roleLoading);
  console.log('[RoleBasedRedirect] Organization setup pending:', userProfile?.organization_setup_pending);

  // Don't do anything while loading OR if no user role
  if (roleLoading || !userRole) {
    console.log('[RoleBasedRedirect] Skipping - still loading or no role');
    return null;
  }

  const currentPath = location.pathname;

  // PRIORITY CHECK: If user needs to setup organization, redirect them there first
  // BUT only if they don't already have an organization (organizationId exists means setup is done)
  if (userProfile?.organization_setup_pending && !organizationId && !currentPath.startsWith('/setup-organization')) {
    console.log('[RoleBasedRedirect] Organization setup pending - redirecting to setup');
    return <Navigate to="/setup-organization" replace />;
  }

  // Ne pas faire de redirection pour les routes publiques, organisation, ou individual (pour permettre le retour)
  if (currentPath.startsWith('/login') || 
      currentPath.startsWith('/signup') ||
      currentPath.startsWith('/update-password') ||
      currentPath.startsWith('/organisation') ||
      currentPath.startsWith('/individual') ||
      currentPath.startsWith('/super-admin') ||
      currentPath.startsWith('/setup-organization')) {
    console.log('[RoleBasedRedirect] Path is whitelisted, no redirect');
    return null;
  }

  // Redirection automatique selon le rôle
  const targetPath = useMemo(() => {
    if (!userRole) return null;
    
    switch (userRole) {
      case 'organisation':
      case 'staff':
        // For organization admins, redirect to their organization if they have one
        // Use organizationId from useUserRole hook (which gets it from user_organizations)
        if (organizationId) {
          return `/organisation/${organizationId}/dashboard`;
        } else {
          // If no organization, redirect to setup
          return '/setup-organization';
        }
      case 'super_admin':
        return '/super-admin/dashboard';
      case 'member':
      case 'individual':
      default:
        return '/individual/dashboard';
    }
  }, [userRole, organizationId]);

  console.log('[RoleBasedRedirect] Target path:', targetPath);
  console.log('[RoleBasedRedirect] Will redirect:', targetPath && currentPath !== targetPath);

  if (targetPath && currentPath !== targetPath) {
    console.log('[RoleBasedRedirect] Redirecting to:', targetPath);
    return <Navigate to={targetPath} replace />;
  }

  return null;
};

export default RoleBasedRedirect;