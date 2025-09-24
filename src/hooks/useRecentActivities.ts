import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getRecentActivities, getTotalActivitiesCount, type RecentActivity } from '@/services/recentActivityService';

export const useRecentActivities = (initialLimit: number = 15) => {
  const { id: organisationId } = useParams();
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  console.log('useRecentActivities - organisationId:', organisationId);

  const fetchActivities = useCallback(async (limit: number = initialLimit, offset: number = 0, append: boolean = false) => {
    console.log('fetchActivities called with:', { organisationId, limit, offset, append });
    
    if (!organisationId) {
      console.log('No organisationId, returning early');
      return;
    }

    try {
      if (!append) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const [newActivities, total] = await Promise.all([
        getRecentActivities(organisationId, limit, offset),
        offset === 0 ? getTotalActivitiesCount(organisationId) : Promise.resolve(totalCount)
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
  }, [organisationId, initialLimit, totalCount]);

  // Charger les activités initiales
  useEffect(() => {
    if (organisationId) {
      fetchActivities(initialLimit, 0, false);
    }
  }, [organisationId, fetchActivities, initialLimit]);

  // Fonction pour charger plus d'activités
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || !organisationId) return;

    const currentOffset = activities.length;
    await fetchActivities(initialLimit, currentOffset, true);
  }, [activities.length, fetchActivities, hasMore, initialLimit, loadingMore, organisationId]);

  // Fonction pour rafraîchir les activités
  const refresh = useCallback(async () => {
    if (!organisationId) return;
    await fetchActivities(activities.length || initialLimit, 0, false);
  }, [activities.length, fetchActivities, initialLimit, organisationId]);

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