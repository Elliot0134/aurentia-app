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
        // Check if user has an organization_id (is a member) OR owns an organization
        const hasOrgId = !!userProfile.organization_id;
        const hasOrgRole = userProfile.user_role === 'organisation' || userProfile.user_role === 'staff' || userProfile.user_role === 'member';

        if (hasOrgId || hasOrgRole) {
          setHasOrganization(true);
          setLoading(false);
          return;
        }

        // Fallback: Check if user owns an organization (legacy check)
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