import { useUserRole } from '@/hooks/useUserRole';
import { Navigate, useLocation } from 'react-router-dom';

interface OrganisationRouteGuardProps {
  children: React.ReactNode;
}

/**
 * Guard qui protège les routes d'organisation
 * Seuls les rôles 'organisation' et 'staff' peuvent accéder aux routes /organisation/:id/*
 * Les membres ('member') sont redirigés vers leur espace membre
 */
const OrganisationRouteGuard = ({ children }: OrganisationRouteGuardProps) => {
  const { userRole, organizationId, loading } = useUserRole();
  const location = useLocation();

  console.log('[OrganisationRouteGuard]', { 
    userRole, 
    organizationId, 
    loading, 
    path: location.pathname 
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Vérification des permissions...</div>
      </div>
    );
  }

  // Vérifier si l'utilisateur a le bon rôle pour accéder aux routes d'organisation
  const canAccessOrganisationRoutes = userRole === 'organisation' || userRole === 'staff' || userRole === 'super_admin';

  if (!canAccessOrganisationRoutes) {
    console.log('[OrganisationRouteGuard] Cannot access, role:', userRole);
    // Rediriger les membres vers leur espace membre
    if (userRole === 'member') {
      return <Navigate to="/individual/my-organization" replace />;
    }
    
    // Rediriger les utilisateurs individuels vers leur dashboard
    if (userRole === 'individual') {
      return <Navigate to="/individual/dashboard" replace />;
    }
    
    // Par défaut, rediriger vers login
    return <Navigate to="/login" replace />;
  }

  // Vérifier que l'utilisateur a bien un organizationId (depuis user_organizations) pour les routes d'organisation
  if ((userRole === 'organisation' || userRole === 'staff') && !organizationId) {
    console.log('[OrganisationRouteGuard] No organizationId, redirecting to setup');
    return <Navigate to="/setup-organization" replace />;
  }

  console.log('[OrganisationRouteGuard] Access granted');
  return <>{children}</>;
};

export default OrganisationRouteGuard;