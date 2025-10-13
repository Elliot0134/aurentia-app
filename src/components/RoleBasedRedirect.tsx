import { useUserRole } from '@/hooks/useUserRole';
import { Navigate, useLocation } from 'react-router-dom';
import { useMemo } from 'react';

/**
 * RoleBasedRedirect Component
 * 
 * Simple redirect logic based on user role:
 * - Only redirects on root paths or paths that need role-based routing
 * - Does NOT check organization_setup_pending (removed for simplicity)
 * - Founders/staff with organizationId go to their org dashboard
 * - Founders/staff without organizationId go to setup-organization
 * - Members/individuals go to individual dashboard
 * 
 * KISS principle: Keep logic minimal to prevent redirect loops
 */
const RoleBasedRedirect = () => {
  const { userRole, loading: roleLoading, organizationId } = useUserRole();
  const location = useLocation();

  console.log('[RoleBasedRedirect] Current path:', location.pathname);
  console.log('[RoleBasedRedirect] User role:', userRole, '| Org ID:', organizationId, '| Loading:', roleLoading);

  // Wait for loading to complete before any decisions
  if (roleLoading || !userRole) {
    console.log('[RoleBasedRedirect] Still loading, skipping redirect');
    return null;
  }

  const currentPath = location.pathname;

  // Whitelist: Never redirect from these paths
  // This prevents infinite loops
  if (currentPath.startsWith('/login') || 
      currentPath.startsWith('/signup') ||
      currentPath.startsWith('/update-password') ||
      currentPath.startsWith('/organisation') ||
      currentPath.startsWith('/individual') ||
      currentPath.startsWith('/super-admin') ||
      currentPath.startsWith('/setup-organization') ||
      currentPath.startsWith('/verify-email') ||
      currentPath.startsWith('/confirm-email') ||
      currentPath.startsWith('/accept-invitation') ||
      currentPath.startsWith('/auth/callback')) {
    console.log('[RoleBasedRedirect] Path whitelisted, no redirect');
    return null;
  }

  // Simple role-based redirect logic
  const targetPath = useMemo(() => {
    if (!userRole) return null;
    
    switch (userRole) {
      case 'organisation':
      case 'staff':
        // Simple rule: If they have an organizationId, go to org dashboard
        // If not, go to setup-organization
        if (organizationId) {
          return `/organisation/${organizationId}/dashboard`;
        } else {
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

  // Only redirect if we have a target and we're not already there
  if (targetPath && currentPath !== targetPath) {
    console.log('[RoleBasedRedirect] Redirecting to:', targetPath);
    return <Navigate to={targetPath} replace />;
  }

  console.log('[RoleBasedRedirect] No redirect needed');
  return null;
};

export default RoleBasedRedirect;