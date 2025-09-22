import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import OrganisationFlowWrapper from '@/components/organisation/OrganisationFlowWrapper';

const SetupOrganization = () => {
  const navigate = useNavigate();
  const { userProfile, loading } = useUserRole();

  useEffect(() => {
    // Si l'utilisateur a déjà une organisation, rediriger
    if (!loading && userProfile?.organization_id) {
      navigate(`/organisation/${userProfile.organization_id}/dashboard`);
    }
    
    // Si l'utilisateur n'est pas du bon rôle, rediriger
    if (!loading && userProfile?.user_role !== 'organisation') {
      navigate('/individual/dashboard');
    }
  }, [userProfile, loading, navigate]);

  const handleComplete = () => {
    // Recharger les données utilisateur et rediriger
    window.location.reload();
  };

  const handleBack = () => {
    navigate('/individual/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aurentia-pink mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Erreur de chargement du profil utilisateur</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <OrganisationFlowWrapper
        userId={userProfile.id}
        userEmail={userProfile.email || ''}
        userName={userProfile.email || 'Utilisateur'}
        onComplete={handleComplete}
        onBack={handleBack}
      />
    </div>
  );
};

export default SetupOrganization;