import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useOnboardingStatus = () => {
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          setOnboardingCompleted(null);
          setLoading(false);
          return;
        }

        // Check profile for onboarding_completed flag
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Error checking onboarding status:', error);
          setOnboardingCompleted(null);
        } else {
          setOnboardingCompleted(profile?.onboarding_completed || false);
        }
      } catch (error) {
        console.error('Error in onboarding status check:', error);
        setOnboardingCompleted(null);
      } finally {
        setLoading(false);
      }
    };

    checkOnboardingStatus();
  }, []);

  return { onboardingCompleted, loading };
};
