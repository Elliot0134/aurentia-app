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

      // Accès direct à la table user_credits dans le schéma billing
      const { data, error: queryError } = await supabase
        .schema('billing')
        .from('user_credits')
        .select('monthly_credits_remaining, monthly_credits_limit, purchased_credits_remaining')
        .eq('user_id', session.user.id)
        .single();

      if (queryError) {
        console.error('❌ Erreur récupération crédits:', queryError);
        setError('Erreur lors de la récupération des crédits');
        return;
      }

      if (data) {
        setCredits({
          monthly_remaining: data.monthly_credits_remaining || 0,
          monthly_limit: data.monthly_credits_limit || 1500,
          purchased_remaining: data.purchased_credits_remaining || 0
        });
      } else {
        // Valeurs par défaut si aucune donnée trouvée
        setCredits({
          monthly_remaining: 1500,
          monthly_limit: 1500,
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
