import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';

// Interface simplifiée - seulement ce dont nous avons besoin
export interface UserCredits {
  monthly_remaining: number;
  monthly_limit: number;
  purchased_remaining: number;
}

export const useCreditsSimple = () => {
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCredits = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setError('Utilisateur non connecté');
        return;
      }

      // Reset crédits si cycle terminé
      await supabase.rpc('reset_credits_based_on_billing_cycle', { 
        p_user_id: session.user.id 
      });

      // Accès direct à la table billing.user_credits
      const { data, error: queryError } = await supabase
        .from('billing.user_credits')
        .select('monthly_credits_remaining, purchased_credits_remaining')
        .eq('user_id', session.user.id)
        .single();

      if (queryError) {
        console.error('❌ Erreur récupération crédits:', queryError);
        // Si l'utilisateur n'a pas de ligne, l'initialiser
        if (queryError.code === 'PGRST116') {
          await supabase.rpc('initialize_user_credits', { p_user_id: session.user.id });
          // Retry après initialisation
          const { data: retryData, error: retryError } = await supabase
            .from('billing.user_credits')
            .select('monthly_credits_remaining, purchased_credits_remaining')
            .eq('user_id', session.user.id)
            .single();
          
          if (retryError) {
            setError('Erreur lors de la récupération des crédits');
            return;
          }
          
          setCredits({
            monthly_remaining: retryData.monthly_credits_remaining || 50,
            monthly_limit: 50,
            purchased_remaining: retryData.purchased_credits_remaining || 0
          });
          return;
        }
        setError('Erreur lors de la récupération des crédits');
        return;
      }

      if (data) {
        setCredits({
          monthly_remaining: data.monthly_credits_remaining || 0,
          monthly_limit: 1500,
          purchased_remaining: data.purchased_credits_remaining || 0
        });
      } else {
        // Valeurs par défaut si aucune donnée trouvée
        setCredits({
          monthly_remaining: 50,
          monthly_limit: 50,
          purchased_remaining: 0
        });
      }
    } catch (err) {
      console.error('❌ Erreur fetchCredits:', err);
      setError('Erreur inattendue');
    } finally {
      setIsLoading(false);
    }
  };

  // Initialisation des crédits simplifiée (à adapter selon le système final)
  const initializeCredits = async (userId: string) => {
    try {
      // Pour l'instant, utiliser les valeurs par défaut
      setCredits({
        monthly_remaining: 1500,
        monthly_limit: 1500,
        purchased_remaining: 0
      });
    } catch (err) {
      console.error('❌ Erreur initializeCredits:', err);
    }
  };

  // Charger les crédits au montage
  useEffect(() => {
    fetchCredits();
  }, []);

  return {
    credits,
    isLoading,
    error,
    refresh: fetchCredits,
    // Propriétés calculées pour faciliter l'utilisation
    monthlyRemaining: credits?.monthly_remaining || 0,
    monthlyLimit: credits?.monthly_limit || 1500,
    purchasedRemaining: credits?.purchased_remaining || 0,
    hasCredits: (credits?.monthly_remaining || 0) > 0
  };
};
