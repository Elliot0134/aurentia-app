import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from './useUserProfile';
import { getOnboardingStatus } from '@/services/organisationService';

export const useOrganisationNavigation = () => {
  const navigate = useNavigate();
  const { userProfile } = useUserProfile();
  const [loading, setLoading] = useState(false);

  const navigateToOrganisation = async () => {
    if (!userProfile?.id) {
      console.error('User profile not found');
      alert('Impossible de trouver le profil utilisateur.');
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
        alert('Erreur lors de la récupération de votre organisation.');
        return;
      }

      if (existingOrg) {
        // User has an organization
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
      alert('Erreur lors de la navigation vers votre organisation.');
    } finally {
      setLoading(false);
    }
  };

  return {
    navigateToOrganisation,
    loading
  };
};