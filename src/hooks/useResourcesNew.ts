import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Resource, ResourceWithStats, ResourceFilters } from '@/types/resources';
import { supabase } from '@/integrations/supabase/client';

// API Functions for Supabase
async function fetchResources(filters?: ResourceFilters): Promise<ResourceWithStats[]> {
  try {
    let query = supabase
      .from('resources')
      .select('*')
      .eq('is_published', true);

    // Apply filters
    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%, description.ilike.%${filters.search}%`);
    }
    
    if (filters?.category && filters.category !== 'all') {
      query = query.eq('category', filters.category);
    }
    
    if (filters?.type && filters.type !== 'all') {
      query = query.eq('type', filters.type);
    }
    
    if (filters?.difficulty && filters.difficulty !== 'all') {
      query = query.eq('difficulty', filters.difficulty);
    }

    // Apply sorting
    if (filters?.sortBy) {
      const sortField = filters.sortBy === 'recent' ? 'created_at' : 
                       filters.sortBy === 'popular' ? 'download_count' :
                       filters.sortBy === 'rating' ? 'average_rating' : 'name';
      const sortOrder = filters.sortOrder === 'asc' ? true : false;
      query = query.order(sortField, { ascending: sortOrder });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching resources:', error);
      throw error;
    }

    // Transform data to include calculated fields
    const transformedData: ResourceWithStats[] = (data || []).map(resource => ({
      ...resource,
      rating_count: resource.total_ratings || 0,
      is_favorite: false
    }));

    return transformedData;
  } catch (error) {
    console.error('Error in fetchResources:', error);
    throw error;
  }
}

async function fetchResourceById(id: string): Promise<ResourceWithStats | null> {
  try {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching resource:', error);
      throw error;
    }

    if (!data) return null;

    return {
      ...data,
      rating_count: data.total_ratings || 0,
      is_favorite: false
    };
  } catch (error) {
    console.error('Error in fetchResourceById:', error);
    throw error;
  }
}

async function downloadResource(resourceId: string): Promise<void> {
  try {
    // Increment download count
    const { error } = await supabase
      .from('resources')
      .update({ 
        download_count: supabase.raw('download_count + 1')
      })
      .eq('id', resourceId);

    if (error) {
      console.error('Error updating download count:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in downloadResource:', error);
    throw error;
  }
}

async function updateResourceRating(resourceId: string, rating: number, comment?: string): Promise<void> {
  try {
    const userIp = 'user-ip'; // TODO: Get real user IP or user ID
    
    const { error } = await supabase
      .from('resource_ratings')
      .upsert({
        resource_id: resourceId,
        user_ip: userIp,
        rating,
        comment: comment || null
      }, {
        onConflict: 'resource_id,user_ip'
      });

    if (error) {
      console.error('Error updating rating:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in updateResourceRating:', error);
    throw error;
  }
}

// React Query Hooks
export function useResources(filters?: ResourceFilters) {
  return useQuery({
    queryKey: ['resources', filters],
    queryFn: () => fetchResources(filters),
    staleTime: 5 * 60 * 1000,
  });
}

export function useResourceDetails(id: string) {
  return useQuery({
    queryKey: ['resource', id],
    queryFn: () => fetchResourceById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useResourceDownload() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: downloadResource,
    onSuccess: (_, resourceId) => {
      // Invalidate and refetch resources to update download count
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      queryClient.invalidateQueries({ queryKey: ['resource', resourceId] });
    },
  });
}

export function useUpdateResourceRating() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ resourceId, rating, comment }: { 
      resourceId: string; 
      rating: number; 
      comment?: string;
    }) => updateResourceRating(resourceId, rating, comment),
    onSuccess: (_, { resourceId }) => {
      // Invalidate and refetch to update ratings
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      queryClient.invalidateQueries({ queryKey: ['resource', resourceId] });
    },
  });
}

export function useFavorites() {
  return {
    favorites: [],
    toggleFavorite: (resourceId: string) => {
      console.log('Toggle favorite for resource:', resourceId);
    },
    isFavorite: (resourceId: string) => false
  };
}