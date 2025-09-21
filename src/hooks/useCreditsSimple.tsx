import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';

// L'interface correspond maintenant directement à la réponse JSON de la fonction RPC.
export interface UserCredits {
  monthly_credits_remaining: number;
  monthly_credits_limit: number;
  purchased_credits_remaining: number;
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

      // Appel de la fonction RPC pour réinitialiser les crédits si nécessaire
      await (supabase.rpc as any)('reset_credits_if_needed', { p_user_id: session.user.id });

      // Appel de la fonction RPC pour récupérer les crédits depuis le schéma billing
      const { data, error: rpcError } = await (supabase.rpc as any)('get_user_credits', {
        p_user_id: session.user.id
      });

      if (rpcError) {
        console.error('❌ Erreur récupération crédits via RPC:', rpcError);
        setError('Erreur lors de la récupération des crédits');
        return;
      }

      // La fonction RPC retourne maintenant un objet JSON.
      // Si l'objet est vide, cela signifie qu'il n'y a pas de crédits.
      if (data && Object.keys(data).length > 0) {
        setCredits(data);
      } else {
        // Initialise avec des valeurs par défaut si aucune donnée de crédit n'est trouvée.
        setCredits({
          monthly_credits_remaining: 0,
          monthly_credits_limit: 0,
          purchased_credits_remaining: 0
        });
      }
    } catch (err) {
      console.error('❌ Erreur fetchCredits:', err);
      setError('Erreur inattendue');
    } finally {
      setIsLoading(false);
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
    // Propriétés calculées pour faciliter l'utilisation dans les composants
    monthlyRemaining: credits?.monthly_credits_remaining || 0,
    monthlyLimit: credits?.monthly_credits_limit || 0,
    purchasedRemaining: credits?.purchased_credits_remaining || 0,
    hasCredits: (credits?.monthly_credits_remaining || 0) > 0
  };
};
