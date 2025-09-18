import { useUserRole } from '@/hooks/useUserRole';
import { Navigate, useLocation } from 'react-router-dom';

const RoleBasedRedirect = () => {
  const { userRole, loading } = useUserRole();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  // Redirection automatique selon le rôle
  const basePath = `/${userRole}`;
  const currentPath = location.pathname;

  // Si l'utilisateur n'est pas sur le bon chemin pour son rôle
  if (!currentPath.startsWith(basePath) && 
      !currentPath.startsWith('/login') && 
      !currentPath.startsWith('/signup') &&
      !currentPath.startsWith('/update-password') &&
      !currentPath.startsWith('/beta')) {
    return <Navigate to={`${basePath}/dashboard`} replace />;
  }

  return null;
};

export default RoleBasedRedirect;