import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useSubscriptionStatus = () => {
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          setSubscriptionStatus(null);
          setLoading(false);
          return;
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('subscription_status')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Erreur lors du chargement du statut d\'abonnement:', error);
          setSubscriptionStatus(null);
        } else {
          setSubscriptionStatus(profile.subscription_status || null);
        }
      } catch (error) {
        console.error('Erreur lors du chargement du statut d\'abonnement:', error);
        setSubscriptionStatus(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionStatus();
  }, []);

  return { subscriptionStatus, loading };
};