import { useUserRole } from '@/hooks/useUserRole';
import { Navigate, useLocation } from 'react-router-dom';
import { useMemo } from 'react';

const RoleBasedRedirect = () => {
  const { userRole, loading: roleLoading, userProfile, organizationId } = useUserRole();
  const location = useLocation();

  console.log('[RoleBasedRedirect] =====DEBUG START=====');
  console.log('[RoleBasedRedirect] Current path:', location.pathname);
  console.log('[RoleBasedRedirect] User role:', userRole);
  console.log('[RoleBasedRedirect] Organization ID:', organizationId);
  console.log('[RoleBasedRedirect] Loading:', roleLoading);
  console.log('[RoleBasedRedirect] Organization setup pending:', userProfile?.organization_setup_pending);
  console.log('[RoleBasedRedirect] User profile ID:', userProfile?.id);
  console.log('[RoleBasedRedirect] =====DEBUG END=====');

  // CRITICAL FIX: Don't do anything while loading OR if no user role
  // This is the key fix - we must wait for organizationId to finish loading
  // before making any redirect decisions to prevent the loop
  if (roleLoading || !userRole) {
    console.log('[RoleBasedRedirect] 🚫 SKIPPING - still loading or no role');
    return null;
  }

  const currentPath = location.pathname;

  // CRITICAL FIX: Always whitelist /organisation paths first to prevent redirect loops
  // This must come BEFORE any redirect logic
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

  // PRIORITY CHECK: If user needs to setup organization, redirect them there first
  // BUT only if they don't already have an organization (organizationId exists means setup is done)
  if (userProfile?.organization_setup_pending && !organizationId) {
    console.log('[RoleBasedRedirect] Organization setup pending - redirecting to setup');
    return <Navigate to="/setup-organization" replace />;
  }

  // Redirection automatique selon le rôle
  const targetPath = useMemo(() => {
    if (!userRole) return null;
    
    switch (userRole) {
      case 'organisation':
      case 'staff':
        // CRITICAL FIX: For organization users, only redirect if they're NOT already on an org route
        // and they don't have an organization. This prevents the redirect loop.
        if (organizationId) {
          // User has organization - only redirect if they're on a non-organization page
          if (!currentPath.startsWith('/organisation') && !currentPath.startsWith('/setup-organization')) {
            return `/organisation/${organizationId}/dashboard`;
          }
          // Already on org route, don't redirect
          return null;
        } else {
          // No organization - redirect to setup only if not already there or on org route
          if (!currentPath.startsWith('/setup-organization') && !currentPath.startsWith('/organisation')) {
            return '/setup-organization';
          }
          return null;
        }
      case 'super_admin':
        return '/super-admin/dashboard';
      case 'member':
      case 'individual':
      default:
        return '/individual/dashboard';
    }
  }, [userRole, organizationId, currentPath]);

  console.log('[RoleBasedRedirect] Target path:', targetPath);
  console.log('[RoleBasedRedirect] Will redirect:', targetPath && currentPath !== targetPath);
  console.log('[RoleBasedRedirect] Current path === target path?', currentPath === targetPath);

  if (targetPath && currentPath !== targetPath) {
    console.log('[RoleBasedRedirect] 🚀 REDIRECTING FROM:', currentPath, 'TO:', targetPath);
    return <Navigate to={targetPath} replace />;
  }

  console.log('[RoleBasedRedirect] ✅ NO REDIRECT - staying on current path');
  return null;
};

export default RoleBasedRedirect;