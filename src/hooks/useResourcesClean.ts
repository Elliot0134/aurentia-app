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

export function useFavorites() {
  return {
    favorites: [],
    toggleFavorite: (resourceId: string) => {
      console.log('Toggle favorite for resource:', resourceId);
    },
    isFavorite: (resourceId: string) => false
  };
}