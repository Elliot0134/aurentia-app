import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import OrganisationFlowWrapper from '@/components/organisation/OrganisationFlowWrapper';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const SetupOrganization = () => {
  const navigate = useNavigate();
  const { userProfile, organizationId, loading } = useUserRole();
  const hasCheckedRef = useRef<string | null>(null);

  useEffect(() => {
    console.log('[SetupOrganization] useEffect triggered', { 
      loading, 
      userProfile: !!userProfile, 
      organizationId,
      hasChecked: hasCheckedRef.current 
    });
    
    // CRITICAL: Wait for loading to complete before checking conditions
    if (loading) {
      console.log('[SetupOrganization] Still loading, waiting...');
      return;
    }
    
    // Si pas de profil utilisateur, rediriger vers login
    if (!userProfile) {
      console.log('[SetupOrganization] No user profile, redirecting to login');
      navigate('/login');
      return;
    }

    // CRITICAL FIX: Only redirect to dashboard if BOTH conditions are met:
    // 1. organizationId exists (user has an organization)
    // 2. organization_setup_pending is false (setup is complete)
    // This prevents the redirect loop where organizationId exists but setup is still marked as pending
    if (organizationId && userProfile.organization_setup_pending === false) {
      // Prevent duplicate redirects for the same organizationId
      if (hasCheckedRef.current === organizationId) {
        console.log('[SetupOrganization] Already redirected for this org, skipping');
        return;
      }
      
      hasCheckedRef.current = organizationId;
      console.log('[SetupOrganization] Organization exists and setup complete, redirecting to dashboard:', organizationId);
      navigate(`/organisation/${organizationId}/dashboard`, { replace: true });
    } else {
      console.log('[SetupOrganization] Staying on setup page:', {
        hasOrg: !!organizationId,
        setupPending: userProfile.organization_setup_pending,
        reason: !organizationId ? 'No organization' : 'Setup still pending'
      });
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
    return <LoadingSpinner message="Chargement..." fullScreen />;
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