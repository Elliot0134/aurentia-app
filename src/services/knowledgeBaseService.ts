import { supabase } from '@/integrations/supabase/client';
import type {
  ProjectKnowledgeBaseItem,
  OrganizationKnowledgeBaseItem,
  CreateProjectKnowledgeBaseInput,
  CreateOrganizationKnowledgeBaseInput,
  UpdateKnowledgeBaseItemInput,
  StorageUsage,
} from '@/types/knowledgeBaseTypes';

// =====================================================
// PROJECT KNOWLEDGE BASE OPERATIONS
// =====================================================

/**
 * Fetch all knowledge base items for a project
 */
export const getProjectKnowledgeBase = async (
  projectId: string
): Promise<ProjectKnowledgeBaseItem[]> => {
  const { data, error } = await supabase
    .from('project_knowledge_base')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching project knowledge base:', error);
    throw new Error(error.message);
  }

  return data as ProjectKnowledgeBaseItem[];
};

/**
 * Get a single project knowledge base item
 */
export const getProjectKnowledgeBaseItem = async (
  itemId: string
): Promise<ProjectKnowledgeBaseItem> => {
  const { data, error } = await supabase
    .from('project_knowledge_base')
    .select('*')
    .eq('id', itemId)
    .single();

  if (error) {
    console.error('Error fetching project knowledge base item:', error);
    throw new Error(error.message);
  }

  return data as ProjectKnowledgeBaseItem;
};

/**
 * Create a new project knowledge base item
 */
export const createProjectKnowledgeBaseItem = async (
  input: CreateProjectKnowledgeBaseInput
): Promise<ProjectKnowledgeBaseItem> => {
  const { data, error } = await supabase
    .from('project_knowledge_base')
    .insert([
      {
        project_id: input.project_id,
        user_id: input.user_id,
        title: input.title,
        content_type: input.content_type,
        content_data: input.content_data,
        file_size: input.file_size || 0,
        file_url: input.file_url,
        tags: input.tags || [],
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating project knowledge base item:', error);
    throw new Error(error.message);
  }

  return data as ProjectKnowledgeBaseItem;
};

/**
 * Update a project knowledge base item
 */
export const updateProjectKnowledgeBaseItem = async (
  itemId: string,
  updates: UpdateKnowledgeBaseItemInput
): Promise<ProjectKnowledgeBaseItem> => {
  const { data, error} = await supabase
    .from('project_knowledge_base')
    .update(updates)
    .eq('id', itemId)
    .select()
    .single();

  if (error) {
    console.error('Error updating project knowledge base item:', error);
    throw new Error(error.message);
  }

  return data as ProjectKnowledgeBaseItem;
};

/**
 * Delete a project knowledge base item
 */
export const deleteProjectKnowledgeBaseItem = async (
  itemId: string
): Promise<void> => {
  const { error } = await supabase
    .from('project_knowledge_base')
    .delete()
    .eq('id', itemId);

  if (error) {
    console.error('Error deleting project knowledge base item:', error);
    throw new Error(error.message);
  }
};

// =====================================================
// ORGANIZATION KNOWLEDGE BASE OPERATIONS
// =====================================================

/**
 * Fetch all knowledge base items for an organization
 */
export const getOrganizationKnowledgeBase = async (
  organizationId: string
): Promise<OrganizationKnowledgeBaseItem[]> => {
  const { data, error } = await supabase
    .from('organization_knowledge_base')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching organization knowledge base:', error);
    throw new Error(error.message);
  }

  return data as OrganizationKnowledgeBaseItem[];
};

/**
 * Get a single organization knowledge base item
 */
export const getOrganizationKnowledgeBaseItem = async (
  itemId: string
): Promise<OrganizationKnowledgeBaseItem> => {
  const { data, error } = await supabase
    .from('organization_knowledge_base')
    .select('*')
    .eq('id', itemId)
    .single();

  if (error) {
    console.error('Error fetching organization knowledge base item:', error);
    throw new Error(error.message);
  }

  return data as OrganizationKnowledgeBaseItem;
};

/**
 * Create a new organization knowledge base item
 */
export const createOrganizationKnowledgeBaseItem = async (
  input: CreateOrganizationKnowledgeBaseInput
): Promise<OrganizationKnowledgeBaseItem> => {
  const { data, error } = await supabase
    .from('organization_knowledge_base')
    .insert([
      {
        organization_id: input.organization_id,
        created_by: input.created_by,
        title: input.title,
        content_type: input.content_type,
        content_data: input.content_data,
        file_size: input.file_size || 0,
        file_url: input.file_url,
        tags: input.tags || [],
        visibility: input.visibility || 'organization',
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating organization knowledge base item:', error);
    throw new Error(error.message);
  }

  return data as OrganizationKnowledgeBaseItem;
};

/**
 * Update an organization knowledge base item
 */
export const updateOrganizationKnowledgeBaseItem = async (
  itemId: string,
  updates: UpdateKnowledgeBaseItemInput
): Promise<OrganizationKnowledgeBaseItem> => {
  const { data, error } = await supabase
    .from('organization_knowledge_base')
    .update(updates)
    .eq('id', itemId)
    .select()
    .single();

  if (error) {
    console.error('Error updating organization knowledge base item:', error);
    throw new Error(error.message);
  }

  return data as OrganizationKnowledgeBaseItem;
};

/**
 * Delete an organization knowledge base item
 */
export const deleteOrganizationKnowledgeBaseItem = async (
  itemId: string
): Promise<void> => {
  const { error } = await supabase
    .from('organization_knowledge_base')
    .delete()
    .eq('id', itemId);

  if (error) {
    console.error('Error deleting organization knowledge base item:', error);
    throw new Error(error.message);
  }
};

// =====================================================
// STORAGE OPERATIONS
// =====================================================

/**
 * Get storage usage for a project or organization
 */
export const getStorageUsage = async (
  entityType: 'project' | 'organization',
  entityId: string
): Promise<StorageUsage | null> => {
  const { data, error } = await supabase
    .from('knowledge_base_storage_usage')
    .select('*')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows returned, which is OK
    console.error('Error fetching storage usage:', error);
    throw new Error(error.message);
  }

  return data as StorageUsage | null;
};

/**
 * Upload a file to knowledge base storage
 */
export const uploadKnowledgeBaseFile = async (
  file: File,
  bucket: 'knowledge-base-files' | 'org-knowledge-base-files',
  folderPath: string
): Promise<{ url: string; path: string }> => {
  const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
  const filePath = `${folderPath}/${fileName}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      upsert: false,
      contentType: file.type,
    });

  if (error) {
    console.error('Error uploading file:', error);
    throw new Error(error.message);
  }

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);

  return {
    url: urlData.publicUrl,
    path: filePath,
  };
};

/**
 * Delete a file from knowledge base storage
 */
export const deleteKnowledgeBaseFile = async (
  bucket: 'knowledge-base-files' | 'org-knowledge-base-files',
  filePath: string
): Promise<void> => {
  const { error } = await supabase.storage.from(bucket).remove([filePath]);

  if (error) {
    console.error('Error deleting file:', error);
    throw new Error(error.message);
  }
};

/**
 * Format bytes to human-readable size
 */
export const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};
