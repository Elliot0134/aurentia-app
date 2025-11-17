import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile, UserRole } from '@/types/userTypes';

export interface UserContextType {
  userProfile: UserProfile | null;
  userRole: UserRole;
  organizationId: string | null;
  loading: boolean;
  refetchProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);
  const fetchInProgressRef = useRef(false);

  const fetchUserProfile = useCallback(async () => {
    // Prevent concurrent fetches
    if (fetchInProgressRef.current) {
      console.log('[UserContext] Fetch already in progress, skipping...');
      return;
    }

    fetchInProgressRef.current = true;
    console.log('[UserContext] Fetching user profile and organization...');

    try {
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        console.log('[UserContext] No active session');
        if (mountedRef.current) {
          setUserProfile(null);
          setOrganizationId(null);
          setLoading(false);
        }
        return;
      }

      console.log('[UserContext] Session valid, fetching profile for user:', session.user.id);

      // Fetch profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles' as any)
        .select('email,first_name,last_name,user_role,subscription_status,stripe_customer_id,organization_setup_pending,organization_setup_dismissed,avatar_url,has_beta_access')
        .eq('id', session.user.id)
        .single();

      if (!mountedRef.current) return;

      if (profileError) {
        console.error('[UserContext] Profile fetch failed:', profileError);
        setUserProfile(null);
        setOrganizationId(null);
        setLoading(false);
        return;
      }

      if (profile) {
        const profileData = profile as any;

        // Fetch organization data in parallel
        let orgId = null;
        let organizationData = null;

        try {
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
            orgId = userOrgData.organization_id;
            organizationData = userOrgData.organizations;
            console.log('[UserContext] Organization loaded:', orgId);
          }
        } catch (orgError) {
          console.warn('[UserContext] Exception fetching organization:', orgError);
        }

        const finalProfile = {
          id: session.user.id,
          ...profileData,
          organization_id: orgId,
          organization: organizationData
        } as UserProfile;

        console.log('[UserContext] ✅ Profile and organization loaded successfully');
        setUserProfile(finalProfile);
        setOrganizationId(orgId);
      } else {
        setUserProfile(null);
        setOrganizationId(null);
      }

    } catch (error) {
      console.error('[UserContext] Unexpected error:', error);
      if (mountedRef.current) {
        setUserProfile(null);
        setOrganizationId(null);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
      fetchInProgressRef.current = false;
    }
  }, []);

  useEffect(() => {
    console.log('[UserContext] Provider mounting, fetching profile...');
    mountedRef.current = true;

    // Fetch on mount
    fetchUserProfile();

    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      console.log('[UserContext] Auth state changed:', event);
      if (!mountedRef.current) return;

      // Ignore INITIAL_SESSION to prevent loops
      if (event === 'INITIAL_SESSION') {
        console.log('[UserContext] 🚫 Ignoring INITIAL_SESSION');
        return;
      }

      // Refetch on sign in
      if (event === 'SIGNED_IN') {
        setTimeout(() => {
          if (mountedRef.current) {
            fetchUserProfile();
          }
        }, 200);
      } else if (event === 'SIGNED_OUT') {
        setUserProfile(null);
        setOrganizationId(null);
        setLoading(false);
      }
    });

    return () => {
      console.log('[UserContext] Provider unmounting');
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  const userRole: UserRole = userProfile?.user_role || 'individual';

  const value: UserContextType = {
    userProfile,
    userRole,
    organizationId,
    loading,
    refetchProfile: fetchUserProfile
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
