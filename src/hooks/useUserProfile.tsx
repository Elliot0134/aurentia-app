import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/userTypes';

export const useUserProfile = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);
  const lastFetchRef = useRef<number>(0);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchUserProfile = useCallback(async (forceRefresh = false) => {
    const now = Date.now();

    // Prevent too frequent fetches (unless forced)
    if (!forceRefresh && now - lastFetchRef.current < 1000) {
      console.log('[useUserProfile] Skipping fetch - too soon since last fetch');
      return;
    }

    lastFetchRef.current = now;
    console.log('[useUserProfile] Starting fetchUserProfile...', forceRefresh ? '(forced)' : '');

    // Clear any existing timeout
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    // Set a reasonable timeout
    fetchTimeoutRef.current = setTimeout(() => {
      console.warn('[useUserProfile] Fetch timeout after 10 seconds');
      if (mountedRef.current) {
        setLoading(false);
      }
    }, 10000);

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

      // Fetch profile with retry logic
      let profile = null;
      let profileError = null;

      for (let attempt = 1; attempt <= 2; attempt++) {
        const { data, error } = await supabase
          .from('profiles' as any)
          .select('email,first_name,last_name,user_role,subscription_status,stripe_customer_id,organization_setup_pending')
          .eq('id', session.user.id)
          .single();

        if (!error) {
          profile = data;
          break;
        }

        profileError = error;

        // If it's a token error and we haven't tried refreshing yet, try to refresh
        if (attempt === 1 && (error.message?.includes('JWT') || error.message?.includes('token'))) {
          console.log('[useUserProfile] Token error, attempting refresh...');
          try {
            const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
            if (refreshError) {
              console.error('[useUserProfile] Session refresh failed:', refreshError);
              break;
            }
            if (!refreshData.session) {
              console.log('[useUserProfile] No session after refresh');
              break;
            }
            console.log('[useUserProfile] Session refreshed, retrying profile fetch');
            // Continue to retry with refreshed session
          } catch (refreshException) {
            console.error('[useUserProfile] Exception during refresh:', refreshException);
            break;
          }
        }
      }

      if (profileError && !profile) {
        console.error('[useUserProfile] Profile fetch failed after retries:', profileError);
        if (mountedRef.current) {
          setUserProfile(null);
          setLoading(false);
        }
        return;
      }

      if (!mountedRef.current) return;

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
    }
  }, []);

  useEffect(() => {
    console.log('[useUserProfile] useEffect mounting');
    mountedRef.current = true;
    let isFetching = false;

    // Debounced fetch to prevent race conditions
    const debouncedFetch = async () => {
      if (isFetching) {
        console.log('[useUserProfile] Already fetching, skipping...');
        return;
      }
      isFetching = true;
      await fetchUserProfile();
      isFetching = false;
    };

    // Fetch immediately on mount to check existing session
    console.log('[useUserProfile] Fetching profile on mount...');
    debouncedFetch();

    // Listen to auth state changes for future updates
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      console.log('[useUserProfile] Auth state changed:', event);
      if (!mountedRef.current) return;

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // Refetch profile on sign in or token refresh
        await debouncedFetch();
      } else if (event === 'SIGNED_OUT') {
        // Clear profile on sign out
        setUserProfile(null);
        setLoading(false);
      }
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

  // Periodic session check to prevent stale sessions (less aggressive)
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!mountedRef.current) return;
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.warn('[useUserProfile] Session check error:', error);
          // Only act on critical auth errors - ignore network issues
          const isCriticalAuthError = error.message?.toLowerCase().includes('invalid') || 
                                      error.message?.toLowerCase().includes('malformed');
          
          if (isCriticalAuthError) {
            console.error('[useUserProfile] Critical auth error detected:', error.message);
            if (mountedRef.current) {
              setUserProfile(null);
              setLoading(false);
            }
          } else {
            console.log('[useUserProfile] Non-critical error during session check, ignoring:', error.message);
          }
        } else if (!session) {
          console.log('[useUserProfile] Periodic check: no valid session');
          if (mountedRef.current) {
            setUserProfile(null);
            setLoading(false);
          }
        }
        // If session exists and profile exists, do nothing - no need to refetch
      } catch (error) {
        console.error('[useUserProfile] Periodic check error:', error);
      }
    }, 300000); // Check every 5 minutes instead of 2 (less aggressive)

    return () => clearInterval(interval);
  }, [fetchUserProfile]);

  // Handle visibility change (when user switches tabs or comes back)
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (!mountedRef.current) return;
      
      if (!document.hidden && userProfile) {
        console.log('[useUserProfile] Tab became visible, checking session...');
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          
          // Only act on critical auth errors
          const isCriticalAuthError = error?.message?.toLowerCase().includes('invalid') || 
                                      error?.message?.toLowerCase().includes('malformed');
          
          if (isCriticalAuthError || (!error && !session)) {
            console.error('[useUserProfile] Session invalid on visibility change (critical error or no session)');
            setUserProfile(null);
            setLoading(false);
          } else if (error) {
            console.log('[useUserProfile] Non-critical error on visibility change, ignoring:', error.message);
          }
          // If session is valid and no critical error, do nothing - Supabase handles auto-refresh
        } catch (error) {
          console.error('[useUserProfile] Error during visibility change check:', error);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [userProfile, fetchUserProfile]);

  console.log('[useUserProfile] Current state - loading:', loading, 'userProfile:', userProfile?.id);

  return { userProfile, loading, refetch: fetchUserProfile };
};
