import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import type { ResourceContent } from '@/types/resourceTypes';
import { normalizeResourceContent } from '@/types/resourceTypes';

// Type aliases from Supabase generated types
type OrganizationResourceRow = Database['public']['Tables']['organization_resources']['Row'];
type OrganizationResourceInsert = Database['public']['Tables']['organization_resources']['Insert'];
type OrganizationResourceUpdate = Database['public']['Tables']['organization_resources']['Update'];

export interface OrganizationResource extends OrganizationResourceRow {
  // Computed fields
  is_favorited?: boolean;
  author_name?: string;
  author_avatar?: string;
}

export interface ResourceFilters {
  search?: string;
  resource_type?: string;
  category?: string;
  status?: string;
  visibility?: string;
  tags?: string[];
}

export interface CreateResourceData {
  organization_id: string;
  title: string;
  description?: string;
  slug?: string;
  cover_image_url?: string;
  resource_type?: 'guide' | 'template' | 'document' | 'custom';
  category?: string;
  tags?: string[];
  content?: ResourceContent;
  status?: 'draft' | 'published' | 'archived';
  visibility?: 'public' | 'private' | 'personal' | 'custom';
  assigned_to?: string[];
}

export interface UpdateResourceData {
  title?: string;
  description?: string;
  slug?: string;
  cover_image_url?: string;
  resource_type?: 'guide' | 'template' | 'document' | 'custom';
  category?: string;
  tags?: string[];
  content?: ResourceContent;
  status?: 'draft' | 'published' | 'archived';
  visibility?: 'public' | 'private' | 'personal' | 'custom';
  assigned_to?: string[];
  published_at?: string;
}

/**
 * Get all resources for an organization with optional filtering
 */
export async function getOrganizationResources(
  organizationId: string,
  filters?: ResourceFilters
): Promise<OrganizationResource[]> {
  try {
    // Validation stricte de l'organization_id
    if (!organizationId || organizationId.trim() === '') {
      const errorMsg = 'Organization ID is required to fetch resources';
      console.error('❌ getOrganizationResources: Invalid organization_id', organizationId);
      throw new Error(errorMsg);
    }

    console.log('🔍 Fetching resources for organization:', organizationId);

    let query = supabase
      .from('organization_resources')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters?.resource_type && filters.resource_type !== 'all') {
      query = query.eq('resource_type', filters.resource_type);
    }

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters?.visibility && filters.visibility !== 'all') {
      query = query.eq('visibility', filters.visibility);
    }

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.tags && filters.tags.length > 0) {
      query = query.contains('tags', filters.tags);
    }

    // Full-text search
    if (filters?.search) {
      query = query.textSearch('search_vector', filters.search, {
        type: 'websearch',
        config: 'english'
      });
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Error fetching organization resources:', error);

      // Provide user-friendly error messages
      if (error.code === 'PGRST116' || error.message.includes('permission denied')) {
        throw new Error('You do not have permission to view resources for this organization. Please check your organization membership.');
      } else if (error.code === '42P01') {
        throw new Error('Resources system is not properly configured. Please contact support.');
      } else {
        throw new Error(`Failed to load resources: ${error.message || 'Unknown error'}`);
      }
    }

    console.log(`✅ Found ${data?.length || 0} resources for organization ${organizationId}`);

    // Log détaillé pour debug
    if (data && data.length > 0) {
      console.log('📦 First resource sample:', {
        id: data[0].id,
        title: data[0].title,
        org_id: data[0].organization_id,
        resource_type: data[0].resource_type
      });
    }

    // Get current user for favorite checking
    const { data: { user } } = await supabase.auth.getUser();

    // Get favorites for current user
    let userFavorites: string[] = [];
    if (user) {
      const { data: favorites } = await supabase
        .from('resource_favorites')
        .select('resource_id')
        .eq('user_id', user.id);

      userFavorites = (favorites || []).map(f => f.resource_id);
    }

    // Get author info for all resources if needed
    const createdByIds = [...new Set(data?.map(r => r.created_by).filter(Boolean) as string[])];
    let authorsMap: Record<string, any> = {};

    if (createdByIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url')
        .in('id', createdByIds);

      if (profiles) {
        authorsMap = profiles.reduce((acc, profile) => {
          acc[profile.id] = profile;
          return acc;
        }, {} as Record<string, any>);
      }
    }

    // Map and enhance results
    return (data || []).map((resource: any) => {
      const profile = resource.created_by ? authorsMap[resource.created_by] : null;

      // Normalize the content to ensure all required fields exist
      const normalizedContent = resource.content
        ? normalizeResourceContent(resource.content as ResourceContent)
        : { blocks: [], version: '1.0', tags: [] };

      return {
        ...resource,
        content: normalizedContent,
        is_favorited: user ? userFavorites.includes(resource.id) : false,
        author_name: profile
          ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown'
          : 'Unknown',
        author_avatar: profile?.avatar_url || null
      } as OrganizationResource;
    });
  } catch (error) {
    console.error('❌ Error in getOrganizationResources:', error);

    // Re-throw if already a user-friendly error
    if (error instanceof Error && error.message.startsWith('You do not have permission')) {
      throw error;
    }
    if (error instanceof Error && error.message.startsWith('Organization ID is required')) {
      throw error;
    }
    if (error instanceof Error && error.message.startsWith('Resources system is not')) {
      throw error;
    }
    if (error instanceof Error && error.message.startsWith('Failed to load resources:')) {
      throw error;
    }

    // Generic fallback
    throw new Error('Failed to load resources. Please try again or contact support if the problem persists.');
  }
}

/**
 * Get a single resource by ID
 */
export async function getResourceById(resourceId: string): Promise<OrganizationResource | null> {
  try {
    const { data, error } = await supabase
      .from('organization_resources')
      .select('*')
      .eq('id', resourceId)
      .single();

    if (error) {
      console.error('Error fetching resource:', error);
      throw error;
    }

    if (!data) return null;

    // Get current user for favorite checking
    const { data: { user } } = await supabase.auth.getUser();

    let is_favorited = false;
    if (user) {
      const { data: favorite } = await supabase
        .from('resource_favorites')
        .select('id')
        .eq('resource_id', resourceId)
        .eq('user_id', user.id)
        .single();

      is_favorited = !!favorite;
    }

    // Get author info if available
    let profile = null;
    if (data.created_by) {
      const { data: authorProfile } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url')
        .eq('id', data.created_by)
        .single();

      profile = authorProfile;
    }

    // Normalize the content to ensure all required fields exist
    const normalizedContent = data.content
      ? normalizeResourceContent(data.content as ResourceContent)
      : { blocks: [], version: '1.0', tags: [] };

    return {
      ...data,
      content: normalizedContent,
      is_favorited,
      author_name: profile
        ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown'
        : 'Unknown',
      author_avatar: profile?.avatar_url || null
    } as OrganizationResource;
  } catch (error) {
    console.error('Error in getResourceById:', error);
    throw error;
  }
}

/**
 * Create a new resource
 */
export async function createResource(resourceData: CreateResourceData): Promise<OrganizationResource | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User must be authenticated to create resources');
    }

    const dataToInsert: OrganizationResourceInsert = {
      ...resourceData,
      created_by: user.id,
      resource_type: resourceData.resource_type || 'guide',
      status: resourceData.status || 'draft',
      visibility: resourceData.visibility || 'organization',
      content: (resourceData.content || { blocks: [], version: '1.0' }) as any,
      published_at: resourceData.status === 'published' ? new Date().toISOString() : null
    };

    const { data, error } = await supabase
      .from('organization_resources')
      .insert(dataToInsert)
      .select('*')
      .single();

    if (error) {
      console.error('Error creating resource:', error);
      throw error;
    }

    if (!data) return null;

    // Get author info if available
    let profile = null;
    if (data.created_by) {
      const { data: authorProfile } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url')
        .eq('id', data.created_by)
        .single();

      profile = authorProfile;
    }

    return {
      ...data,
      is_favorited: false,
      author_name: profile
        ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown'
        : 'Unknown',
      author_avatar: profile?.avatar_url || null
    } as OrganizationResource;
  } catch (error) {
    console.error('Error in createResource:', error);
    throw error;
  }
}

/**
 * Update an existing resource
 */
export async function updateResource(
  resourceId: string,
  updates: UpdateResourceData
): Promise<OrganizationResource | null> {
  try {
    // If status is being changed to published, set published_at
    const dataToUpdate: OrganizationResourceUpdate = {
      ...updates,
      content: updates.content ? (updates.content as any) : undefined
    };
    if (updates.status === 'published' && !updates.published_at) {
      dataToUpdate.published_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('organization_resources')
      .update(dataToUpdate)
      .eq('id', resourceId)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating resource:', error);
      throw error;
    }

    if (!data) return null;

    // Get current user for favorite checking
    const { data: { user } } = await supabase.auth.getUser();

    let is_favorited = false;
    if (user) {
      const { data: favorite } = await supabase
        .from('resource_favorites')
        .select('id')
        .eq('resource_id', resourceId)
        .eq('user_id', user.id)
        .single();

      is_favorited = !!favorite;
    }

    // Get author info if available
    let profile = null;
    if (data.created_by) {
      const { data: authorProfile } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url')
        .eq('id', data.created_by)
        .single();

      profile = authorProfile;
    }

    return {
      ...data,
      is_favorited,
      author_name: profile
        ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown'
        : 'Unknown',
      author_avatar: profile?.avatar_url || null
    } as OrganizationResource;
  } catch (error) {
    console.error('Error in updateResource:', error);
    throw error;
  }
}

/**
 * Delete a resource
 */
export async function deleteResource(resourceId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('organization_resources')
      .delete()
      .eq('id', resourceId);

    if (error) {
      console.error('Error deleting resource:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteResource:', error);
    return false;
  }
}

/**
 * Duplicate an existing resource
 */
export async function duplicateResource(resourceId: string): Promise<OrganizationResource | null> {
  try {
    // Get the original resource
    const original = await getResourceById(resourceId);
    if (!original) {
      throw new Error('Resource not found');
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User must be authenticated to duplicate resources');
    }

    // Create duplicate with modified title
    const duplicateData: CreateResourceData = {
      organization_id: original.organization_id,
      title: `${original.title} (Copy)`,
      description: original.description || undefined,
      cover_image_url: original.cover_image_url || undefined,
      resource_type: original.resource_type as any,
      category: original.category || undefined,
      tags: original.tags || undefined,
      content: original.content as any as ResourceContent,
      status: 'draft', // Always create duplicates as drafts
      visibility: original.visibility as any,
      assigned_to: original.assigned_to || undefined
    };

    return await createResource(duplicateData);
  } catch (error) {
    console.error('Error in duplicateResource:', error);
    throw error;
  }
}

/**
 * Toggle favorite status for a resource
 */
export async function toggleResourceFavorite(resourceId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User must be authenticated to favorite resources');
    }

    // Check if already favorited
    const { data: existing } = await supabase
      .from('resource_favorites')
      .select('id')
      .eq('resource_id', resourceId)
      .eq('user_id', user.id)
      .single();

    if (existing) {
      // Remove favorite
      const { error } = await supabase
        .from('resource_favorites')
        .delete()
        .eq('resource_id', resourceId)
        .eq('user_id', user.id);

      if (error) throw error;
      return false; // Now unfavorited
    } else {
      // Add favorite
      const { error } = await supabase
        .from('resource_favorites')
        .insert({
          resource_id: resourceId,
          user_id: user.id
        });

      if (error) throw error;
      return true; // Now favorited
    }
  } catch (error) {
    console.error('Error in toggleResourceFavorite:', error);
    throw error;
  }
}

/**
 * Track a resource view
 */
export async function trackResourceView(resourceId: string): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return; // Don't track anonymous views

    // Insert view record
    await supabase
      .from('resource_views')
      .insert({
        resource_id: resourceId,
        user_id: user.id
      });

    // Increment view count
    const { data: currentResource } = await supabase
      .from('organization_resources')
      .select('view_count')
      .eq('id', resourceId)
      .single();

    if (currentResource) {
      await supabase
        .from('organization_resources')
        .update({ view_count: (currentResource.view_count || 0) + 1 })
        .eq('id', resourceId);
    }
  } catch (error) {
    console.error('Error tracking resource view:', error);
    // Don't throw - view tracking failure shouldn't break the app
  }
}

/**
 * Get user's favorite resources
 */
export async function getUserFavoriteResources(organizationId: string): Promise<OrganizationResource[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
      .from('resource_favorites')
      .select(`
        resource_id,
        organization_resources!inner (*)
      `)
      .eq('user_id', user.id)
      .eq('organization_resources.organization_id', organizationId);

    if (error) {
      console.error('Error fetching favorite resources:', error);
      throw error;
    }

    if (!data || data.length === 0) return [];

    // Get author info for all resources
    const createdByIds = [...new Set(data.map((fav: any) => fav.organization_resources?.created_by).filter(Boolean) as string[])];
    let authorsMap: Record<string, any> = {};

    if (createdByIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url')
        .in('id', createdByIds);

      if (profiles) {
        authorsMap = profiles.reduce((acc, profile) => {
          acc[profile.id] = profile;
          return acc;
        }, {} as Record<string, any>);
      }
    }

    return (data || []).map((fav: any) => {
      const resource = fav.organization_resources;
      const profile = resource?.created_by ? authorsMap[resource.created_by] : null;
      return {
        ...resource,
        is_favorited: true,
        author_name: profile
          ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown'
          : 'Unknown',
        author_avatar: profile?.avatar_url || null
      } as OrganizationResource;
    });
  } catch (error) {
    console.error('Error in getUserFavoriteResources:', error);
    return [];
  }
}
