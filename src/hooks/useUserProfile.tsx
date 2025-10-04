import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/userTypes';

export const useUserProfile = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setUserProfile(null);
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles' as any)
        .select('email,organization_id,user_role') // Sélectionner seulement les colonnes qui existent
        .eq('id', user.id)
        .single();

      if (profile) {
        const profileData = profile as any;
        // Récupérer l'organisation si elle existe
        let organizationData = null;
        if (profileData.organization_id) {
          const { data: org } = await supabase
            .from('organizations' as any)
            .select('*')
            .eq('id', profileData.organization_id)
            .single();
          organizationData = org;
        }

        setUserProfile({
          id: user.id, // Add the user ID from auth
          ...profileData,
          organization: organizationData
        } as UserProfile);
      }
    } catch (error) {
      console.error('Erreur récupération profil:', error);
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();

    // Écouter les changements d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchUserProfile();
    });

    return () => subscription.unsubscribe();
  }, []);

  return { userProfile, loading, refetch: fetchUserProfile };
};
