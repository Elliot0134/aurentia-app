import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/contexts/UserContext';

export interface DailyCreditsUsage {
  date: string; // Format YYYY-MM-DD
  credits: number; // Crédits utilisés ce jour
}

export type TimeRange = 'current_month' | 'last_month' | 'year';

export const useCreditsHistory = (timeRange: TimeRange = 'current_month') => {
  const { userProfile } = useUser();
  const [dailyUsage, setDailyUsage] = useState<DailyCreditsUsage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalUsed, setTotalUsed] = useState(0);

  const fetchHistory = useCallback(async () => {
    if (!userProfile?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const now = new Date();
      let startDate: Date;
      let endDate: Date;

      // Déterminer les dates selon le filtre
      switch (timeRange) {
        case 'current_month':
          // Du 1er du mois actuel jusqu'à aujourd'hui
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = now;
          break;

        case 'last_month':
          // Tout le mois précédent
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          endDate = new Date(now.getFullYear(), now.getMonth(), 0); // Dernier jour du mois précédent
          break;

        case 'year':
          // 12 derniers mois
          startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
          endDate = now;
          break;

        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = now;
      }

      // Récupérer l'historique pour la période
      const { data: usageHistory, error: usageError } = await supabase
        .from('ai_tool_usage_history')
        .select('credits_used, created_at')
        .eq('user_id', userProfile.id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true });

      if (usageError) throw usageError;

      // Agréger par jour
      const usageByDay = new Map<string, number>();
      let total = 0;

      (usageHistory || []).forEach((entry) => {
        const date = new Date(entry.created_at);
        const dateKey = date.toISOString().split('T')[0];
        const credits = entry.credits_used || 0;

        usageByDay.set(dateKey, (usageByDay.get(dateKey) || 0) + credits);
        total += credits;
      });

      // Créer un tableau avec tous les jours de la période
      const dailyData: DailyCreditsUsage[] = [];
      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const dateKey = currentDate.toISOString().split('T')[0];
        const creditsUsed = usageByDay.get(dateKey) || 0;

        dailyData.push({
          date: dateKey,
          credits: creditsUsed
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }

      setDailyUsage(dailyData);
      setTotalUsed(total);

    } catch (err) {
      console.error('Erreur lors de la récupération de l\'historique:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  }, [userProfile?.id, timeRange]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    dailyUsage,
    isLoading,
    error,
    totalUsed,
    refresh: fetchHistory
  };
};
