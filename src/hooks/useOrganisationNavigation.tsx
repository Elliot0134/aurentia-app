import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from './useUserProfile';
import { toast } from '@/components/ui/use-toast';

export const useOrganisationNavigation = () => {
  const navigate = useNavigate();
  const { userProfile, loading: userProfileLoading } = useUserProfile();
  const [loading, setLoading] = useState(false);

  const navigateToOrganisation = useCallback(async () => {
    // Don't proceed if user profile is still loading
    if (userProfileLoading) {
      console.log('[useOrganisationNavigation] User profile still loading, skipping...');
      return;
    }
    
    if (!userProfile?.id) {
      console.error('[useOrganisationNavigation] User profile not found');
      // Instead of showing an alert, redirect to login or handle gracefully
      navigate('/login');
      return;
    }

    console.log('[useOrganisationNavigation] Starting navigation for user:', userProfile.id);
    setLoading(true);
    
    try {
      // Check if user has an organization via user_organizations table (not owner_id!)
      const { data: userOrg, error: userOrgError } = await (supabase as any)
        .from('user_organizations')
        .select(`
          organization_id,
          organizations!inner (
            id
          )
        `)
        .eq('user_id', userProfile.id)
        .eq('status', 'active')
        .maybeSingle();

      if (userOrgError && userOrgError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('[useOrganisationNavigation] Error checking user organization:', userOrgError);
        toast({
          title: "Erreur",
          description: "Erreur lors de la récupération de votre organisation.",
          variant: "destructive",
        });
        return;
      }

      console.log('[useOrganisationNavigation] User organization data:', userOrg);

      if (userOrg?.organizations) {
        // User has an organization - navigate directly to dashboard
        const org = userOrg.organizations;
        console.log('[useOrganisationNavigation] Organization found, navigating to dashboard:', org.id);
        navigate(`/organisation/${org.id}/dashboard`);
      } else {
        // User doesn't have an organization - redirect to setup
        console.log('[useOrganisationNavigation] No organization found, redirecting to setup');
        navigate('/setup-organization');
      }
    } catch (error) {
      console.error('[useOrganisationNavigation] Error navigating to organisation:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la navigation vers votre organisation.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [navigate, userProfile, userProfileLoading]);

  return {
    navigateToOrganisation,
    loading: loading || userProfileLoading // Include user profile loading state
  };
};