import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import OrganisationFlowWrapper from '@/components/organisation/OrganisationFlowWrapper';

const SetupOrganization = () => {
  const navigate = useNavigate();
  const { userProfile, organizationId, loading } = useUserRole();

  useEffect(() => {
    console.log('[SetupOrganization] useEffect triggered', { loading, userProfile: !!userProfile, organizationId });
    
    // Wait for loading to complete before checking conditions
    if (loading) return;
    
    // Si pas de profil utilisateur, rediriger vers login
    if (!userProfile) {
      console.log('[SetupOrganization] No user profile, redirecting to login');
      navigate('/login');
      return;
    }

    // Si l'utilisateur a déjà une organisation, rediriger vers le dashboard
    if (organizationId) {
      console.log('[SetupOrganization] Organization exists, redirecting to dashboard:', organizationId);
      navigate(`/organisation/${organizationId}/dashboard`, { replace: true });
    } else {
      console.log('[SetupOrganization] No organization, staying on setup page');
    }
  }, [userProfile, organizationId, loading, navigate]);

  const handleComplete = async () => {
    // Récupérer l'organisation nouvellement créée
    if (userProfile?.id) {
      const { data: userOrg } = await (supabase as any)
        .from('user_organizations')
        .select('organization_id')
        .eq('user_id', userProfile.id)
        .eq('status', 'active')
        .single();
      
      if (userOrg?.organization_id) {
        // Rediriger directement vers le dashboard de l'organisation
        navigate(`/organisation/${userOrg.organization_id}/dashboard`, { replace: true });
      } else {
        // Si pas d'organisation trouvée, recharger la page
        window.location.reload();
      }
    } else {
      window.location.reload();
    }
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

  if (!userProfile?.id) {
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