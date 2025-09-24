import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserProject {
  project_id: string;
  nom_projet: string;
  description_synthetique?: string;
  created_at: string;
  organization_id?: string;
  organization_name?: string;
}

export const useUserProjects = (userId?: string) => {
  const [projects, setProjects] = useState<UserProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProjects = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        setError(null);

        // Récupérer les projets de l'utilisateur depuis form_business_idea avec organisation
        const { data: businessIdeas, error: businessError } = await (supabase as any)
          .from('form_business_idea')
          .select(`
            project_id,
            nom_projet,
            project_sentence,
            created_at,
            organization_id,
            organizations!form_business_idea_organization_id_fkey (
              id,
              name
            )
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (businessError) {
          console.error('Error fetching business ideas:', businessError);
        }

        const userProjects: UserProject[] = (businessIdeas || []).map((project: any) => ({
          project_id: project.project_id,
          nom_projet: project.nom_projet,
          description_synthetique: project.project_sentence,
          created_at: project.created_at,
          organization_id: project.organization_id,
          organization_name: project.organizations?.name
        }));

        setProjects(userProjects);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement des projets');
        console.error('Error fetching user projects:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProjects();
  }, [userId]);

  return {
    projects,
    loading,
    error,
    refetch: () => {
      setLoading(true);
      setError(null);
      // Le useEffect se redéclenchera automatiquement
    }
  };
};