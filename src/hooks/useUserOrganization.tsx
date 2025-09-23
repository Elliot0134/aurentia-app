import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from './useUserProfile';

export const useUserOrganization = () => {
  const { userProfile, loading: userProfileLoading } = useUserProfile();
  const [hasOrganization, setHasOrganization] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserOrganization = async () => {
      if (userProfileLoading) {
        return;
      }

      if (!userProfile?.id) {
        setHasOrganization(false);
        setLoading(false);
        return;
      }

      try {
        // Check if user already has an organization
        const { data: existingOrg, error: orgError } = await (supabase as any)
          .from('organizations')
          .select('id, onboarding_completed')
          .eq('owner_id', userProfile.id)
          .single();

        if (orgError && orgError.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.error('Error checking existing organization:', orgError);
          setHasOrganization(false);
        } else {
          setHasOrganization(!!existingOrg);
        }
      } catch (error) {
        console.error('Error checking user organization:', error);
        setHasOrganization(false);
      } finally {
        setLoading(false);
      }
    };

    checkUserOrganization();
  }, [userProfile, userProfileLoading]);

  return {
    hasOrganization,
    loading: loading || userProfileLoading
  };
};