import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CollaborativeProject {
  project_id: string;
  nom_projet: string;
  description_synthetique: string | null;
  created_at: string;
  // Collaboration info
  my_role: 'viewer' | 'editor' | 'admin';
  owner_email: string;
  owner_name: string | null;
}

export const useCollaborativeProjects = () => {
  const [collaborativeProjects, setCollaborativeProjects] = useState<CollaborativeProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadCollaborativeProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get all projects where user is a collaborator (not owner)
      const { data: collaborations, error: collabError } = await supabase
        .from('project_collaborators')
        .select(`
          project_id,
          role,
          status
        `)
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (collabError) throw collabError;

      if (!collaborations || collaborations.length === 0) {
        setCollaborativeProjects([]);
        return;
      }

      // Get project details for each collaboration
      const projectIds = collaborations.map(c => c.project_id);
      const { data: projects, error: projectsError } = await supabase
        .from('project_summary')
        .select('project_id, nom_projet, description_synthetique, created_at, user_id')
        .in('project_id', projectIds);

      if (projectsError) throw projectsError;

      if (!projects) {
        setCollaborativeProjects([]);
        return;
      }

      // Get owner details for each project
      const ownerIds = [...new Set(projects.map(p => p.user_id))];
      const { data: owners, error: ownersError } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name')
        .in('id', ownerIds);

      if (ownersError) throw ownersError;

      // Map owner info to projects
      const ownersMap = new Map(
        (owners || []).map(owner => [
          owner.id,
          {
            email: owner.email,
            name: owner.first_name && owner.last_name
              ? `${owner.first_name} ${owner.last_name}`
              : owner.first_name || owner.last_name || null
          }
        ])
      );

      // Combine data
      const enrichedProjects: CollaborativeProject[] = projects.map(project => {
        const collaboration = collaborations.find(c => c.project_id === project.project_id);
        const owner = ownersMap.get(project.user_id) || { email: '', name: null };

        return {
          project_id: project.project_id,
          nom_projet: project.nom_projet,
          description_synthetique: project.description_synthetique,
          created_at: project.created_at,
          my_role: collaboration?.role || 'viewer',
          owner_email: owner.email,
          owner_name: owner.name
        };
      });

      setCollaborativeProjects(enrichedProjects);
    } catch (err: any) {
      console.error('Error loading collaborative projects:', err);
      setError(err.message);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les projets collaboratifs',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCollaborativeProjects();

    // Subscribe to changes in collaborations
    const subscription = supabase
      .channel('collaborative_projects_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'project_collaborators'
      }, () => {
        loadCollaborativeProjects();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    collaborativeProjects,
    loading,
    error,
    refresh: loadCollaborativeProjects
  };
};
