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
        // NEW: Check user_organizations table for active membership
        const { data: userOrg, error: userOrgError } = await supabase
          .from('user_organizations' as any)
          .select('id, organization_id, status')
          .eq('user_id', userProfile.id)
          .eq('status', 'active')
          .limit(1)
          .maybeSingle();

        if (userOrgError && userOrgError.code !== 'PGRST116') {
          console.error('Error checking user_organizations:', userOrgError);
          setHasOrganization(false);
          setLoading(false);
          return;
        }

        if (userOrg) {
          setHasOrganization(true);
          setLoading(false);
          return;
        }

        // Fallback: Check if user owns/created an organization
        const { data: ownedOrg, error: ownedOrgError } = await supabase
          .from('organizations' as any)
          .select('id')
          .eq('created_by', userProfile.id)
          .limit(1)
          .maybeSingle();

        if (ownedOrgError && ownedOrgError.code !== 'PGRST116') {
          console.error('Error checking owned organizations:', ownedOrgError);
          setHasOrganization(false);
        } else {
          setHasOrganization(!!ownedOrg);
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