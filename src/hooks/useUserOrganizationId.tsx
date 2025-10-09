import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to get the user's organization_id from the user_organizations table
 * This replaces the need for organization_id in the profiles table
 */
export const useUserOrganizationId = (userId: string | undefined) => {
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchInProgressRef = useRef(false);
  const lastUserIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    const fetchOrganizationId = async () => {
      console.log('[useUserOrganizationId] Fetching for userId:', userId);
      
      // CRITICAL FIX: Prevent infinite loops - check if already fetching for the same userId
      if (fetchInProgressRef.current && lastUserIdRef.current === userId) {
        console.log('[useUserOrganizationId] 🚫 Already fetching for same userId, skipping...');
        return;
      }
      
      // If no userId, set loading to false and return null
      if (!userId) {
        console.log('[useUserOrganizationId] No userId provided, setting loading to false');
        setLoading(false);
        setOrganizationId(null);
        fetchInProgressRef.current = false;
        lastUserIdRef.current = undefined;
        return;
      }

      // CRITICAL FIX: Set fetch in progress flag and track current userId
      fetchInProgressRef.current = true;
      lastUserIdRef.current = userId;
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
        fetchInProgressRef.current = false; // ✅ CRITICAL: Release the lock
      }
    };

    fetchOrganizationId();
  }, [userId]);

  return { organizationId, loading };
};
