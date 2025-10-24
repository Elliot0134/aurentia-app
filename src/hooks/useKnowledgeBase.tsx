import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';
import {
  getProjectKnowledgeBase,
  getOrganizationKnowledgeBase,
  createProjectKnowledgeBaseItem,
  createOrganizationKnowledgeBaseItem,
  updateProjectKnowledgeBaseItem,
  updateOrganizationKnowledgeBaseItem,
  deleteProjectKnowledgeBaseItem,
  deleteOrganizationKnowledgeBaseItem,
  deleteKnowledgeBaseFile,
} from '@/services/knowledgeBaseService';
import type {
  ProjectKnowledgeBaseItem,
  OrganizationKnowledgeBaseItem,
  CreateProjectKnowledgeBaseInput,
  CreateOrganizationKnowledgeBaseInput,
  UpdateKnowledgeBaseItemInput,
} from '@/types/knowledgeBaseTypes';

// =====================================================
// PROJECT KNOWLEDGE BASE HOOKS
// =====================================================

/**
 * Hook to fetch project knowledge base items
 */
export const useProjectKnowledgeBase = (projectId: string | undefined) => {
  return useQuery({
    queryKey: ['projectKnowledgeBase', projectId],
    queryFn: () => {
      if (!projectId) throw new Error('Project ID is required');
      return getProjectKnowledgeBase(projectId);
    },
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to create a project knowledge base item
 */
export const useCreateProjectKnowledgeBaseItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProjectKnowledgeBaseInput) =>
      createProjectKnowledgeBaseItem(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projectKnowledgeBase', data.project_id] });
      queryClient.invalidateQueries({ queryKey: ['projectStorageUsage', data.project_id] });
      toast({
        title: 'Succès',
        description: 'Élément ajouté à la base de connaissance.',
      });
    },
    onError: (error: Error) => {
      console.error('Error creating project knowledge base item:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible d\'ajouter l\'élément.',
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook to update a project knowledge base item
 */
export const useUpdateProjectKnowledgeBaseItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, updates }: { itemId: string; updates: UpdateKnowledgeBaseItemInput }) =>
      updateProjectKnowledgeBaseItem(itemId, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projectKnowledgeBase', data.project_id] });
      toast({
        title: 'Succès',
        description: 'Élément mis à jour.',
      });
    },
    onError: (error: Error) => {
      console.error('Error updating project knowledge base item:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de mettre à jour l\'élément.',
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook to delete a project knowledge base item
 */
export const useDeleteProjectKnowledgeBaseItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId,
      projectId,
      fileUrl,
    }: {
      itemId: string;
      projectId: string;
      fileUrl?: string;
    }) => {
      // Delete file from storage if exists
      if (fileUrl) {
        try {
          // Extract file path from URL
          const urlParts = fileUrl.split('/');
          const bucketIndex = urlParts.findIndex(part => part === 'knowledge-base-files');
          if (bucketIndex !== -1) {
            const filePath = urlParts.slice(bucketIndex + 1).join('/');
            await deleteKnowledgeBaseFile('knowledge-base-files', filePath);
          }
        } catch (error) {
          console.error('Error deleting file from storage:', error);
          // Continue with item deletion even if file deletion fails
        }
      }

      // Delete item from database
      await deleteProjectKnowledgeBaseItem(itemId);
      return projectId;
    },
    onSuccess: (projectId) => {
      queryClient.invalidateQueries({ queryKey: ['projectKnowledgeBase', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projectStorageUsage', projectId] });
      toast({
        title: 'Succès',
        description: 'Élément supprimé de la base de connaissance.',
      });
    },
    onError: (error: Error) => {
      console.error('Error deleting project knowledge base item:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de supprimer l\'élément.',
        variant: 'destructive',
      });
    },
  });
};

// =====================================================
// ORGANIZATION KNOWLEDGE BASE HOOKS
// =====================================================

/**
 * Hook to fetch organization knowledge base items
 */
export const useOrganizationKnowledgeBase = (organizationId: string | undefined) => {
  return useQuery({
    queryKey: ['organizationKnowledgeBase', organizationId],
    queryFn: () => {
      if (!organizationId) throw new Error('Organization ID is required');
      return getOrganizationKnowledgeBase(organizationId);
    },
    enabled: !!organizationId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to create an organization knowledge base item
 */
export const useCreateOrganizationKnowledgeBaseItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateOrganizationKnowledgeBaseInput) =>
      createOrganizationKnowledgeBaseItem(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['organizationKnowledgeBase', data.organization_id],
      });
      queryClient.invalidateQueries({
        queryKey: ['organizationStorageUsage', data.organization_id],
      });
      toast({
        title: 'Succès',
        description: 'Élément ajouté à la base de connaissance.',
      });
    },
    onError: (error: Error) => {
      console.error('Error creating organization knowledge base item:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible d\'ajouter l\'élément.',
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook to update an organization knowledge base item
 */
export const useUpdateOrganizationKnowledgeBaseItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, updates }: { itemId: string; updates: UpdateKnowledgeBaseItemInput }) =>
      updateOrganizationKnowledgeBaseItem(itemId, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['organizationKnowledgeBase', data.organization_id],
      });
      toast({
        title: 'Succès',
        description: 'Élément mis à jour.',
      });
    },
    onError: (error: Error) => {
      console.error('Error updating organization knowledge base item:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de mettre à jour l\'élément.',
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook to delete an organization knowledge base item
 */
export const useDeleteOrganizationKnowledgeBaseItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId,
      organizationId,
      fileUrl,
    }: {
      itemId: string;
      organizationId: string;
      fileUrl?: string;
    }) => {
      // Delete file from storage if exists
      if (fileUrl) {
        try {
          // Extract file path from URL
          const urlParts = fileUrl.split('/');
          const bucketIndex = urlParts.findIndex(part => part === 'org-knowledge-base-files');
          if (bucketIndex !== -1) {
            const filePath = urlParts.slice(bucketIndex + 1).join('/');
            await deleteKnowledgeBaseFile('org-knowledge-base-files', filePath);
          }
        } catch (error) {
          console.error('Error deleting file from storage:', error);
          // Continue with item deletion even if file deletion fails
        }
      }

      // Delete item from database
      await deleteOrganizationKnowledgeBaseItem(itemId);
      return organizationId;
    },
    onSuccess: (organizationId) => {
      queryClient.invalidateQueries({
        queryKey: ['organizationKnowledgeBase', organizationId],
      });
      queryClient.invalidateQueries({
        queryKey: ['organizationStorageUsage', organizationId],
      });
      toast({
        title: 'Succès',
        description: 'Élément supprimé de la base de connaissance.',
      });
    },
    onError: (error: Error) => {
      console.error('Error deleting organization knowledge base item:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de supprimer l\'élément.',
        variant: 'destructive',
      });
    },
  });
};
