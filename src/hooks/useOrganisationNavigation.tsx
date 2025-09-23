import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from './useUserProfile';
import { getOnboardingStatus } from '@/services/organisationService';
import { toast } from '@/components/ui/use-toast';

export const useOrganisationNavigation = () => {
  const navigate = useNavigate();
  const { userProfile, loading: userProfileLoading } = useUserProfile();
  const [loading, setLoading] = useState(false);

  const navigateToOrganisation = async () => {
    // Don't proceed if user profile is still loading
    if (userProfileLoading) {
      return;
    }
    
    if (!userProfile?.id) {
      console.error('User profile not found');
      // Instead of showing an alert, redirect to login or handle gracefully
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      // Check if user already has an organization
      const { data: existingOrg, error: orgError } = await (supabase as any)
        .from('organizations')
        .select('id, onboarding_completed')
        .eq('owner_id', userProfile.id)
        .single();

      if (orgError && orgError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error checking existing organization:', orgError);
        toast({
          title: "Erreur",
          description: "Erreur lors de la récupération de votre organisation.",
          variant: "destructive",
        });
        return;
      }

      if (existingOrg) {
        // User has an organization - navigate directly to the final destination
        if (existingOrg.onboarding_completed) {
          navigate(`/organisation/${existingOrg.id}/dashboard`);
        } else {
          navigate(`/organisation/${existingOrg.id}/onboarding`);
        }
      } else {
        navigate('/setup-organization');
      }
    } catch (error) {
      console.error('Error navigating to organisation:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la navigation vers votre organisation.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    navigateToOrganisation,
    loading: loading || userProfileLoading // Include user profile loading state
  };
};