import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/userTypes';

export const useUserProfile = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);
  const fetchInProgressRef = useRef(false);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchUserProfile = useCallback(async (forceRefresh = false) => {
    // Prévenir les appels simultanés
    if (fetchInProgressRef.current && !forceRefresh) {
      console.log('[useUserProfile] Fetch already in progress, skipping...');
      return;
    }

    fetchInProgressRef.current = true;
    console.log('[useUserProfile] Starting fetchUserProfile...', forceRefresh ? '(forced)' : '');

    // Clear any existing timeout
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    // Set a timeout
    fetchTimeoutRef.current = setTimeout(() => {
      console.warn('[useUserProfile] Fetch timeout after 8 seconds');
      if (mountedRef.current) {
        setLoading(false);
        fetchInProgressRef.current = false;
      }
    }, 8000);

    try {
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('[useUserProfile] Session error:', sessionError);
        if (mountedRef.current) {
          setUserProfile(null);
          setLoading(false);
        }
        return;
      }

      if (!session?.user) {
        console.log('[useUserProfile] No active session');
        if (mountedRef.current) {
          setUserProfile(null);
          setLoading(false);
        }
        return;
      }

      console.log('[useUserProfile] Session valid, fetching profile for user:', session.user.id);

      // Fetch profile - un seul essai, pas de retry automatique
      const { data: profile, error: profileError } = await supabase
        .from('profiles' as any)
        .select('email,first_name,last_name,user_role,subscription_status,stripe_customer_id,organization_setup_pending')
        .eq('id', session.user.id)
        .single();

      if (!mountedRef.current) return;

      if (profileError) {
        console.error('[useUserProfile] Profile fetch failed:', profileError);
        setUserProfile(null);
        setLoading(false);
        return;
      }

      if (profile) {
        const profileData = profile as any;

        // Get organization data through user_organizations junction table
        let organizationData = null;
        let organizationId = null;

        try {
          // Fetch the user's primary organization membership with organization details
          const { data: userOrg, error: userOrgError } = await supabase
            .from('user_organizations' as any)
            .select(`
              organization_id,
              user_role,
              is_primary,
              status,
              organizations (*)
            `)
            .eq('user_id', session.user.id)
            .eq('status', 'active')
            .order('is_primary', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (!userOrgError && userOrg) {
            const userOrgData = userOrg as any;
            organizationId = userOrgData.organization_id;
            organizationData = userOrgData.organizations;
            console.log('[useUserProfile] Organization loaded:', organizationId);
          } else if (userOrgError) {
            console.warn('[useUserProfile] Error fetching organization:', userOrgError);
          }
        } catch (orgError) {
          console.warn('[useUserProfile] Exception fetching organization data:', orgError);
          // Don't fail profile loading for org data issues
        }

        const finalProfile = {
          id: session.user.id,
          ...profileData,
          organization_id: organizationId,
          organization: organizationData
        } as UserProfile;

        console.log('[useUserProfile] Profile loaded successfully');
        setUserProfile(finalProfile);
      } else {
        setUserProfile(null);
      }

    } catch (error) {
      console.error('[useUserProfile] Unexpected error in fetchUserProfile:', error);
      if (mountedRef.current) {
        setUserProfile(null);
      }
    } finally {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      if (mountedRef.current) {
        setLoading(false);
      }
      fetchInProgressRef.current = false;
    }
  }, []);

  useEffect(() => {
    console.log('[useUserProfile] useEffect mounting');
    mountedRef.current = true;

    // Fetch immédiatement au montage
    console.log('[useUserProfile] Fetching profile on mount...');
    fetchUserProfile();

    // Listen to auth state changes UNIQUEMENT pour les événements critiques
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      console.log('[useUserProfile] Auth state changed:', event);
      if (!mountedRef.current) return;

      // Refetch UNIQUEMENT sur sign in
      if (event === 'SIGNED_IN') {
        // Petit délai pour laisser Supabase se stabiliser
        setTimeout(() => {
          if (mountedRef.current) {
            fetchUserProfile();
          }
        }, 200);
      } else if (event === 'SIGNED_OUT') {
        // Clear profile immédiatement
        setUserProfile(null);
        setLoading(false);
      }
      // TOKEN_REFRESHED ne nécessite PAS de refetch du profile
    });

    return () => {
      console.log('[useUserProfile] useEffect cleanup');
      mountedRef.current = false;
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  // SUPPRESSION des checks périodiques agressifs
  // SUPPRESSION du check sur visibilitychange

  console.log('[useUserProfile] Current state - loading:', loading, 'userProfile:', userProfile?.id);

  return { userProfile, loading, refetch: fetchUserProfile };
};