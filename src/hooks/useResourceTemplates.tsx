import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import type { ResourceContent } from '@/types/resourceTypes';

export interface ResourceTemplate {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  category: string | null;
  icon: string | null;
  tags: string[] | null;
  content: ResourceContent;
  is_public: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  creator?: {
    email: string;
    first_name?: string;
    last_name?: string;
  };
}

export function useResourceTemplates(organizationId: string | undefined | null) {
  const queryClient = useQueryClient();

  // Fetch templates
  const {
    data: templates = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['resource-templates', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from('resource_templates')
        .select(`
          *,
          creator:created_by(
            email,
            first_name:raw_user_meta_data->first_name,
            last_name:raw_user_meta_data->last_name
          )
        `)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching templates:', error);
        throw error;
      }

      return data as ResourceTemplate[];
    },
    enabled: !!organizationId,
  });

  // Get current user to filter templates
  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  // Filter templates: show public ones + user's private ones
  const filteredTemplates = templates.filter(
    (template) => template.is_public || template.created_by === currentUser?.id
  );

  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const { error } = await supabase
        .from('resource_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resource-templates'] });
      toast({
        title: 'Modèle supprimé',
        description: 'Le modèle a été supprimé avec succès',
      });
    },
    onError: (error) => {
      console.error('Error deleting template:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le modèle',
        variant: 'destructive',
      });
    },
  });

  // Update template mutation
  const updateTemplateMutation = useMutation({
    mutationFn: async ({
      templateId,
      updates,
    }: {
      templateId: string;
      updates: Partial<ResourceTemplate>;
    }) => {
      const { error } = await supabase
        .from('resource_templates')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', templateId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resource-templates'] });
      toast({
        title: 'Modèle mis à jour',
        description: 'Le modèle a été mis à jour avec succès',
      });
    },
    onError: (error) => {
      console.error('Error updating template:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le modèle',
        variant: 'destructive',
      });
    },
  });

  return {
    templates: filteredTemplates,
    allTemplates: templates,
    isLoading,
    error,
    deleteTemplate: deleteTemplateMutation.mutate,
    updateTemplate: updateTemplateMutation.mutate,
    isDeleting: deleteTemplateMutation.isPending,
    isUpdating: updateTemplateMutation.isPending,
    currentUserId: currentUser?.id,
  };
}

export default useResourceTemplates;
