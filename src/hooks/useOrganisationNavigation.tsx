import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from './useUserRole';
import { toast } from '@/components/ui/use-toast';

export const useOrganisationNavigation = () => {
  const navigate = useNavigate();
  const { userProfile, organizationId, loading: userRoleLoading } = useUserRole();
  const [loading, setLoading] = useState(false);

  const navigateToOrganisation = useCallback(async () => {
    console.log('[useOrganisationNavigation] =====NAVIGATION START=====');
    console.log('[useOrganisationNavigation] User role loading:', userRoleLoading);
    console.log('[useOrganisationNavigation] Organization ID:', organizationId);
    console.log('[useOrganisationNavigation] User profile:', userProfile?.id);
    
    // CRITICAL FIX: Don't proceed if user role data is still loading
    if (userRoleLoading) {
      console.log('[useOrganisationNavigation] 🚫 User role still loading, skipping...');
      return;
    }
    
    if (!userProfile?.id) {
      console.error('[useOrganisationNavigation] ❌ User profile not found');
      navigate('/login');
      return;
    }

    console.log('[useOrganisationNavigation] 🚀 Starting navigation for user:', userProfile.id);
    setLoading(true);
    
    try {
      // CRITICAL FIX: Use organizationId from useUserRole instead of making another DB query
      // This ensures consistency with RoleBasedRedirect and prevents race conditions
      // CRITICAL FIX: Use organizationId from useUserRole instead of making another DB query
      // This ensures consistency with RoleBasedRedirect and prevents race conditions
      if (organizationId) {
        // User has an organization - navigate directly to dashboard
        console.log('[useOrganisationNavigation] ✅ Organization found from useUserRole, navigating to dashboard:', organizationId);
        navigate(`/organisation/${organizationId}/dashboard`);
      } else {
        // User doesn't have an organization - redirect to setup
        console.log('[useOrganisationNavigation] ❌ No organization found from useUserRole, redirecting to setup');
        navigate('/setup-organization');
      }
    } catch (error) {
      console.error('[useOrganisationNavigation] 💥 Error navigating to organisation:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la navigation vers votre organisation.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [navigate, organizationId, userProfile, userRoleLoading]);

  return {
    navigateToOrganisation,
    loading: loading || userRoleLoading // Include user role loading state
  };
};