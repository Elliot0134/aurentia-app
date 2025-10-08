import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to get the user's organization_id from the user_organizations table
 * This replaces the need for organization_id in the profiles table
 */
export const useUserOrganizationId = (userId: string | undefined) => {
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrganizationId = async () => {
      console.log('[useUserOrganizationId] Fetching for userId:', userId);
      
      // If no userId, set loading to false and return null
      if (!userId) {
        console.log('[useUserOrganizationId] No userId provided, setting loading to false');
        setLoading(false);
        setOrganizationId(null);
        return;
      }

      // Start loading
      setLoading(true);

      try {
        const { data, error } = await (supabase as any)
          .from('user_organizations')
          .select('organization_id, user_role, status')
          .eq('user_id', userId)
          .eq('status', 'active')
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('[useUserOrganizationId] Error fetching organization_id:', error);
        }

        console.log('[useUserOrganizationId] Query result:', { 
          userId,
          data, 
          organizationId: data?.organization_id,
          userRole: data?.user_role,
          status: data?.status,
          error 
        });
        
        const orgId = data?.organization_id || null;
        console.log('[useUserOrganizationId] Setting organizationId to:', orgId);
        setOrganizationId(orgId);
      } catch (err) {
        console.error('[useUserOrganizationId] Exception fetching organization_id:', err);
        setOrganizationId(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizationId();
  }, [userId]);

  return { organizationId, loading };
};
