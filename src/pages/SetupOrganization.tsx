import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import OrganisationOnboardingPage from './organisation/OrganisationOnboarding';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

/**
 * SetupOrganization Page
 * 
 * This page is used when an organization user doesn't have an organization yet.
 * It simply renders the OrganisationOnboarding component.
 * 
 * The key difference from accessing OrganisationOnboarding directly:
 * - This page is accessed when the user has NO organization (from OrganisationRouteGuard)
 * - We skip the "onboarding already completed" redirect check because we know they need to set up
 * - Once setup is complete, the onboarding component will redirect to dashboard
 */
const SetupOrganization = () => {
  const { loading, organizationId } = useUserRole();
  const navigate = useNavigate();
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    // Prevent multiple redirects
    if (hasRedirectedRef.current) {
      console.log('[SetupOrganization] Already redirected, skipping');
      return;
    }

    // If user already has an organization, redirect them to dashboard
    // This prevents the loop: they shouldn't be on setup if they have an org
    if (!loading && organizationId) {
      console.log('[SetupOrganization] User already has organization, redirecting to dashboard');
      hasRedirectedRef.current = true;
      navigate(`/organisation/${organizationId}/dashboard`, { replace: true });
    }
  }, [loading, organizationId, navigate]);

  // Show loading while checking
  if (loading) {
    return <LoadingSpinner message="Chargement..." fullScreen />;
  }

  // If they have an organization, don't render anything (redirect will happen)
  if (organizationId) {
    return <LoadingSpinner message="Redirection..." fullScreen />;
  }

  console.log('[SetupOrganization] Rendering OrganisationOnboarding for new setup');
  
  // Render the onboarding component for new organization setup
  // Pass a special flag or use the component directly
  return <OrganisationOnboardingPage />;
};

export default SetupOrganization;
