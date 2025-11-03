import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/contexts/UserContext';

export interface CreditStats {
  // Crédits actuels
  monthlyRemaining: number;
  monthlyLimit: number;
  purchasedRemaining: number;
  totalRemaining: number;

  // Crédits utilisés
  usedThisMonth: number;
  usedToday: number;
  usedThisWeek: number;

  // Pourcentages
  monthlyUsagePercent: number; // % des crédits mensuels utilisés
  remainingPercent: number; // % des crédits restants

  // Alertes
  isLowCredits: boolean; // < 20% restants
  isCriticalCredits: boolean; // < 10% restants

  // Projection
  estimatedDaysRemaining: number | null; // Combien de jours avant d'être à court
  averageDailyUsage: number; // Moyenne sur les 7 derniers jours

  // Reset
  lastResetDate: string;
  daysUntilReset: number;
}

export const useCreditStats = () => {
  const { userProfile } = useUser();
  const [stats, setStats] = useState<CreditStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateStats = useCallback(async () => {
    if (!userProfile?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // 1. Récupérer les données du profil
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('monthly_credits_remaining, monthly_credits_limit, purchased_credits_remaining, last_credit_reset')
        .eq('id', userProfile.id)
        .single();

      if (profileError) throw profileError;

      const monthlyRemaining = profile.monthly_credits_remaining || 0;
      const monthlyLimit = profile.monthly_credits_limit || 0;
      const purchasedRemaining = profile.purchased_credits_remaining || 0;
      const totalRemaining = monthlyRemaining + purchasedRemaining;
      const lastResetDate = profile.last_credit_reset;

      // 2. Calculer les dates
      const now = new Date();
      const resetDate = new Date(lastResetDate);
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - 7);

      // 3. Récupérer l'historique d'utilisation depuis le dernier reset
      const { data: usageHistory, error: usageError } = await supabase
        .from('ai_tool_usage_history')
        .select('credits_used, created_at')
        .eq('user_id', userProfile.id)
        .gte('created_at', lastResetDate)
        .order('created_at', { ascending: false });

      if (usageError) throw usageError;

      // 4. Calculer les crédits utilisés par période
      let usedThisMonth = 0;
      let usedToday = 0;
      let usedThisWeek = 0;

      (usageHistory || []).forEach((entry) => {
        const entryDate = new Date(entry.created_at);
        const creditsUsed = entry.credits_used || 0;

        usedThisMonth += creditsUsed;

        if (entryDate >= startOfToday) {
          usedToday += creditsUsed;
        }

        if (entryDate >= startOfWeek) {
          usedThisWeek += creditsUsed;
        }
      });

      // 5. Calculer les pourcentages
      const monthlyUsagePercent = monthlyLimit > 0
        ? Math.round((usedThisMonth / monthlyLimit) * 100)
        : 0;

      const totalInitial = monthlyLimit + purchasedRemaining;
      const remainingPercent = totalInitial > 0
        ? Math.round((totalRemaining / totalInitial) * 100)
        : 100;

      // 6. Déterminer les alertes
      const isLowCredits = remainingPercent < 20 && remainingPercent >= 10;
      const isCriticalCredits = remainingPercent < 10;

      // 7. Calculer la projection
      const daysSinceReset = Math.max(1, Math.ceil((now.getTime() - resetDate.getTime()) / (1000 * 60 * 60 * 24)));
      const averageDailyUsage = daysSinceReset > 0 ? usedThisMonth / daysSinceReset : 0;

      let estimatedDaysRemaining: number | null = null;
      if (averageDailyUsage > 0 && totalRemaining > 0) {
        estimatedDaysRemaining = Math.floor(totalRemaining / averageDailyUsage);
      }

      // 8. Calculer les jours jusqu'au prochain reset (environ 30 jours)
      const nextReset = new Date(resetDate);
      nextReset.setMonth(nextReset.getMonth() + 1);
      const daysUntilReset = Math.ceil((nextReset.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      setStats({
        monthlyRemaining,
        monthlyLimit,
        purchasedRemaining,
        totalRemaining,
        usedThisMonth,
        usedToday,
        usedThisWeek,
        monthlyUsagePercent,
        remainingPercent,
        isLowCredits,
        isCriticalCredits,
        estimatedDaysRemaining,
        averageDailyUsage: Math.round(averageDailyUsage),
        lastResetDate,
        daysUntilReset: Math.max(0, daysUntilReset)
      });

    } catch (err) {
      console.error('Erreur lors du calcul des statistiques de crédits:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  }, [userProfile?.id]);

  useEffect(() => {
    calculateStats();
  }, [calculateStats]);

  return {
    stats,
    isLoading,
    error,
    refresh: calculateStats
  };
};
