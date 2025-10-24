import { useState, useEffect, useCallback } from 'react';
import { getRecentActivitiesForUser, getTotalActivitiesCountForUser, type IndividualActivity } from '@/services/individualActivityService';
import { useUser } from '@/contexts/UserContext';

export const useIndividualActivities = (initialLimit: number = 15) => {
  const { userProfile } = useUser();
  const userId = userProfile?.id;

  const [activities, setActivities] = useState<IndividualActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  console.log('useIndividualActivities - userId:', userId);

  const fetchActivities = useCallback(async (limit: number = initialLimit, offset: number = 0, append: boolean = false) => {
    console.log('fetchActivities called with:', { userId, limit, offset, append });

    if (!userId) {
      console.log('No userId, returning early');
      return;
    }

    try {
      if (!append) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const [newActivities, total] = await Promise.all([
        getRecentActivitiesForUser(userId, limit, offset),
        offset === 0 ? getTotalActivitiesCountForUser(userId) : Promise.resolve(totalCount)
      ]);

      console.log('fetchActivities results:', { newActivities: newActivities.length, total, offset });

      if (offset === 0) {
        setTotalCount(total);
      }

      if (append) {
        setActivities(prev => [...prev, ...newActivities]);
      } else {
        setActivities(newActivities);
      }

      // Vérifier s'il y a plus d'activités à charger
      setHasMore((offset + newActivities.length) < total);

      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement des activités:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des activités');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [userId, initialLimit, totalCount]);

  // Charger les activités initiales
  useEffect(() => {
    if (userId) {
      fetchActivities(initialLimit, 0, false);
    }
  }, [userId, fetchActivities, initialLimit]);

  // Fonction pour charger plus d'activités
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || !userId) return;

    const currentOffset = activities.length;
    await fetchActivities(initialLimit, currentOffset, true);
  }, [activities.length, fetchActivities, hasMore, initialLimit, loadingMore, userId]);

  // Fonction pour rafraîchir les activités
  const refresh = useCallback(async () => {
    if (!userId) return;
    await fetchActivities(activities.length || initialLimit, 0, false);
  }, [activities.length, fetchActivities, initialLimit, userId]);

  return {
    activities,
    loading,
    loadingMore,
    error,
    hasMore,
    totalCount,
    loadMore,
    refresh
  };
};
