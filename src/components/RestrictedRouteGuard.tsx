import { Navigate, useLocation } from 'react-router-dom';
import { useUserProfile } from '@/hooks/useUserProfile';

/**
 * Guard component that blocks access to restricted routes for users WITHOUT beta access
 *
 * Users with has_beta_access = true can access all routes (grandfathered users)
 * Users with has_beta_access = false are restricted to:
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

  // If user has beta access, allow all routes (grandfathered users)
  if (userProfile?.has_beta_access === true) {
    return <>{children}</>;
  }

  // Define allowed routes for users WITHOUT beta access
  const allowedRoutes = [
    '/individual/dashboard',
    '/individual/project-business',
    '/individual/chatbot',
    '/individual/plan-action',
    '/individual/collaborateurs',
    '/messages',
    // Supporting routes needed for app functionality
    '/individual/profile',
    '/individual/roadmap',
    '/individual/project/',
    '/individual/form-business-idea',
    '/individual/create-project-form',
    '/individual/warning',
    '/individual/knowledge',
    '/individual/my-organization',
    '/individual/knowledge-base',
  ];

  // Check if current path matches any allowed route
  const isAllowed = allowedRoutes.some(route =>
    location.pathname.startsWith(route) || location.pathname === route
  );

  // If route is not allowed, redirect to the first available page (Livrables)
  if (!isAllowed) {
    console.log(`[RestrictedRouteGuard] Blocked access to ${location.pathname} (no beta access)`);
    return <Navigate to="/individual/project-business" replace />;
  }

  return <>{children}</>;
};

export default RestrictedRouteGuard;
