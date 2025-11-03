import { useUser } from '@/contexts/UserContext';
import { Navigate } from 'react-router-dom';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const AUTHORIZED_EMAIL = 'elliotcommerce@gmail.com';

interface StyleguideGuardProps {
  children: React.ReactNode;
}

export default function StyleguideGuard({ children }: StyleguideGuardProps) {
  const { userProfile, loading } = useUser();

  if (loading) {
    return <LoadingSpinner message="Vérification de l'accès..." fullScreen />;
  }

  // Security check: email must match exactly
  if (!userProfile || userProfile.email !== AUTHORIZED_EMAIL) {
    // Silent redirect - no error message to prevent information disclosure
    return <Navigate to="/individual/dashboard" replace />;
  }

  return <>{children}</>;
}
