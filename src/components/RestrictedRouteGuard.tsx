import { Navigate, useLocation } from 'react-router-dom';
import { useUserProfile } from '@/hooks/useUserProfile';

/**
 * Guard component that blocks access to restricted routes for NEW users with restricted access
 *
 * Users with has_beta_access = false can access all routes (grandfathered/old users)
 * Users with has_beta_access = true (NEW users) are restricted to ONLY:
 * - /individual/dashboard (Tableau de bord)
 * - /individual/project-business/* (Livrables)
 * - /individual/chatbot/* (Assistant IA)
 * - /individual/plan-action (Plan d'action)
 * - /individual/collaborateurs (Collaborateurs)
 * - /messages (Messages)
 */
const RestrictedRouteGuard = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { userProfile, loading } = useUserProfile();

  // Wait for profile to load
  if (loading) {
    return <>{children}</>;
  }

  // If user has_beta_access = false, they are grandfathered - allow all routes
  if (userProfile?.has_beta_access === false) {
    return <>{children}</>;
  }

  // Only apply restrictions to /individual/* routes (don't affect /organisation/* routes)
  if (!location.pathname.startsWith('/individual')) {
    return <>{children}</>;
  }

  // Define allowed routes for users WITH restricted access (has_beta_access = true)
  const allowedRoutes = [
    '/individual/dashboard',
    '/individual/project-business',
    '/individual/chatbot',
    '/individual/plan-action',
    '/individual/collaborateurs',
    '/messages',
  ];

  // Check if current path matches any allowed route
  const isAllowed = allowedRoutes.some(route =>
    location.pathname.startsWith(route) || location.pathname === route
  );

  // If route is not allowed, redirect to dashboard
  if (!isAllowed) {
    console.log(`[RestrictedRouteGuard] Blocked access to ${location.pathname} (restricted user)`);
    return <Navigate to="/individual/dashboard" replace />;
  }

  return <>{children}</>;
};

export default RestrictedRouteGuard;
