import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';

export interface UserCredits {
  monthly_credits_remaining: number;
  monthly_credits_limit: number;
  purchased_credits_remaining: number;
  last_credit_reset: string;
}

export interface CreditConsumptionResult {
  success: boolean;
  consumed_monthly?: number;
  consumed_purchased?: number;
  total_consumed?: number;
  error?: string;
  remaining_total?: number;
  requested?: number;
}

export const useCredits = () => {
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCredits = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setError('Utilisateur non connecté');
        return;
      }

      console.log('🔍 User ID recherché:', session.user.id, 'Email:', session.user.email);

      // Lire directement depuis la table profiles
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('monthly_credits_remaining, purchased_credits_remaining, monthly_credits_limit, last_credit_reset')
        .eq('id', session.user.id)
        .maybeSingle(); // Utiliser maybeSingle au lieu de single

      if (profileError) {
        console.error('❌ Erreur récupération crédits:', profileError);
        setError('Erreur lors de la récupération des crédits');
        return;
      }

      if (data) {
        console.log('\ud83d\udc4d Donn\u00e9es cr\u00e9dits r\u00e9cup\u00e9r\u00e9es:', data);
        setCredits({
          monthly_credits_remaining: data.monthly_credits_remaining || 0,
          purchased_credits_remaining: data.purchased_credits_remaining || 0,
          monthly_credits_limit: data.monthly_credits_limit || 0,
          last_credit_reset: data.last_credit_reset || new Date().toISOString()
        });
      } else {
        // Pas de profil trouvé, faire un UPDATE au lieu d'INSERT
        console.log('📝 Mise à jour du profil avec crédits par défaut');
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            monthly_credits_remaining: 50,
            purchased_credits_remaining: 0,
            monthly_credits_limit: 50,
            last_credit_reset: new Date().toISOString()
          })
          .eq('id', session.user.id);

        if (updateError) {
          console.error('❌ Erreur update profil:', updateError);
        }

        setCredits({
          monthly_credits_remaining: 50,
          monthly_credits_limit: 50,
          purchased_credits_remaining: 0,
          last_credit_reset: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error('❌ Erreur fetchCredits:', err);
      setError('Erreur inattendue');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const consumeCredits = useCallback(async (amount: number = 1): Promise<CreditConsumptionResult> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        return { success: false, error: 'Utilisateur non connecté' };
      }

      const { data, error: rpcError } = await supabase.rpc('consume_credits', {
        p_user_id: session.user.id,
        p_amount: amount
      });

      if (rpcError) {
        console.error('❌ Erreur consommation crédits:', rpcError);
        return { success: false, error: 'Erreur lors de la consommation des crédits' };
      }

      // Actualiser les crédits après consommation
      if (data.success) {
        await fetchCredits();
      }

      return data;
    } catch (err) {
      console.error('❌ Erreur consumeCredits:', err);
      return { success: false, error: 'Erreur inattendue' };
    }
  }, [fetchCredits]);

  const addPurchasedCredits = useCallback(async (amount: number): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return false;

      const { data, error: rpcError } = await supabase.rpc('add_purchased_credits', {
        p_user_id: session.user.id,
        p_amount: amount
      });

      if (rpcError) {
        console.error('❌ Erreur ajout crédits:', rpcError);
        return false;
      }

      if (data.success) {
        await fetchCredits();
        return true;
      }

      return false;
    } catch (err) {
      console.error('❌ Erreur addPurchasedCredits:', err);
      return false;
    }
  }, [fetchCredits]);

  const resetMonthlyCredits = useCallback(async (): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return false;

      const { data, error: rpcError } = await supabase.rpc('reset_monthly_credits', {
        p_user_id: session.user.id
      });

      if (rpcError) {
        console.error('❌ Erreur reset crédits:', rpcError);
        return false;
      }

      if (data.success) {
        await fetchCredits();
        return true;
      }

      return false;
    } catch (err) {
      console.error('❌ Erreur resetMonthlyCredits:', err);
      return false;
    }
  }, [fetchCredits]);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  return {
    credits,
    isLoading,
    error,
    refresh: fetchCredits,
    consumeCredits,
    addPurchasedCredits,
    resetMonthlyCredits,
    // Propriétés calculées
    monthlyRemaining: credits?.monthly_credits_remaining || 0,
    monthlyLimit: credits?.monthly_credits_limit || 0,
    purchasedRemaining: credits?.purchased_credits_remaining || 0,
    totalRemaining: (credits?.monthly_credits_remaining || 0) + (credits?.purchased_credits_remaining || 0),
    hasCredits: ((credits?.monthly_credits_remaining || 0) + (credits?.purchased_credits_remaining || 0)) > 0
  };
};

// Alias pour la compatibilité
export const useCreditsSimple = useCredits;
