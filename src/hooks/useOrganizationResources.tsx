import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  getOrganizationResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
  duplicateResource,
  toggleResourceFavorite,
  trackResourceView,
  getUserFavoriteResources,
  type OrganizationResource,
  type ResourceFilters,
  type CreateResourceData,
  type UpdateResourceData
} from '@/services/resourcesService';

export interface UseOrganizationResourcesReturn {
  resources: OrganizationResource[];
  loading: boolean;
  error: string | null;
  fetchResources: (filters?: ResourceFilters) => Promise<void>;
  getResource: (id: string) => Promise<OrganizationResource | null>;
  addResource: (data: CreateResourceData) => Promise<OrganizationResource | null>;
  editResource: (id: string, data: UpdateResourceData) => Promise<OrganizationResource | null>;
  removeResource: (id: string) => Promise<boolean>;
  duplicateResource: (id: string) => Promise<OrganizationResource | null>;
  toggleFavorite: (id: string) => Promise<boolean>;
  trackView: (id: string) => Promise<void>;
  getFavorites: () => Promise<OrganizationResource[]>;
  refetch: () => Promise<void>;
}

export const useOrganizationResources = (organizationId?: string): UseOrganizationResourcesReturn => {
  const [resources, setResources] = useState<OrganizationResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResources = async (filters?: ResourceFilters) => {
    if (!organizationId) {
      console.warn('⚠️ useOrganizationResources: No organizationId provided');
      setError('Organization ID is missing. Please navigate to this page from your organization dashboard.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('📥 Fetching resources for org:', organizationId);
      const data = await getOrganizationResources(organizationId, filters);
      setResources(data);
      console.log('✅ Successfully loaded', data.length, 'resources');
    } catch (err) {
      console.error('❌ Error fetching resources:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load resources';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getResource = async (id: string): Promise<OrganizationResource | null> => {
    try {
      setError(null);
      return await getResourceById(id);
    } catch (err) {
      console.error('Error fetching resource:', err);
      setError(err instanceof Error ? err.message : 'Failed to load resource');
      return null;
    }
  };

  const addResource = async (data: CreateResourceData): Promise<OrganizationResource | null> => {
    try {
      setError(null);
      const newResource = await createResource(data);
      if (newResource) {
        setResources(prev => [newResource, ...prev]);
      }
      return newResource;
    } catch (err) {
      console.error('Error creating resource:', err);
      setError(err instanceof Error ? err.message : 'Failed to create resource');
      return null;
    }
  };

  const editResource = async (id: string, data: UpdateResourceData): Promise<OrganizationResource | null> => {
    try {
      setError(null);
      const updated = await updateResource(id, data);
      if (updated) {
        setResources(prev => prev.map(r => r.id === id ? updated : r));
      }
      return updated;
    } catch (err) {
      console.error('Error updating resource:', err);
      setError(err instanceof Error ? err.message : 'Failed to update resource');
      return null;
    }
  };

  const removeResource = async (id: string): Promise<boolean> => {
    try {
      setError(null);
      const success = await deleteResource(id);
      if (success) {
        setResources(prev => prev.filter(r => r.id !== id));
      }
      return success;
    } catch (err) {
      console.error('Error deleting resource:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete resource');
      return false;
    }
  };

  const duplicateResourceHandler = async (id: string): Promise<OrganizationResource | null> => {
    try {
      setError(null);
      const duplicate = await duplicateResource(id);
      if (duplicate) {
        setResources(prev => [duplicate, ...prev]);
      }
      return duplicate;
    } catch (err) {
      console.error('Error duplicating resource:', err);
      setError(err instanceof Error ? err.message : 'Failed to duplicate resource');
      return null;
    }
  };

  const toggleFavorite = async (id: string): Promise<boolean> => {
    try {
      setError(null);
      const isFavorited = await toggleResourceFavorite(id);

      // Update local state
      setResources(prev => prev.map(r =>
        r.id === id ? { ...r, is_favorited: isFavorited } : r
      ));

      return isFavorited;
    } catch (err) {
      console.error('Error toggling favorite:', err);
      setError(err instanceof Error ? err.message : 'Failed to toggle favorite');
      return false;
    }
  };

  const trackView = async (id: string): Promise<void> => {
    try {
      await trackResourceView(id);

      // Update local view count
      setResources(prev => prev.map(r =>
        r.id === id ? { ...r, view_count: r.view_count + 1 } : r
      ));
    } catch (err) {
      console.error('Error tracking view:', err);
      // Don't set error for view tracking failures
    }
  };

  const getFavorites = async (): Promise<OrganizationResource[]> => {
    if (!organizationId) return [];

    try {
      setError(null);
      return await getUserFavoriteResources(organizationId);
    } catch (err) {
      console.error('Error fetching favorites:', err);
      setError(err instanceof Error ? err.message : 'Failed to load favorites');
      return [];
    }
  };

  const refetch = async () => {
    await fetchResources();
  };

  useEffect(() => {
    if (organizationId) {
      console.log('🔄 Organization ID changed, fetching resources for:', organizationId);
      fetchResources();
    } else {
      console.warn('⚠️ No organizationId in useOrganizationResources');
      setError('Organization ID is missing. Please ensure you are accessing this page from your organization dashboard.');
      setLoading(false);
    }
  }, [organizationId]);

  // Real-time subscription for resource changes
  useEffect(() => {
    if (!organizationId) return;

    // Subscribe to resource changes for this organization
    const resourceChannel = supabase
      .channel(`resources_${organizationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'organization_resources',
          filter: `organization_id=eq.${organizationId}`,
        },
        () => {
          console.log('📡 Real-time: Resource change detected, refetching...');
          fetchResources();
        }
      )
      .subscribe();

    return () => {
      resourceChannel.unsubscribe();
    };
  }, [organizationId, fetchResources]);

  return {
    resources,
    loading,
    error,
    fetchResources,
    getResource,
    addResource,
    editResource,
    removeResource,
    duplicateResource: duplicateResourceHandler,
    toggleFavorite,
    trackView,
    getFavorites,
    refetch
  };
};
