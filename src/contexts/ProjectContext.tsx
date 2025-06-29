import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface ProjectContextType {
  // Current project ID (just for tracking selection)
  currentProjectId: string | null;
  
  // User projects list for selector
  userProjects: Array<{ project_id: string; nom_projet: string; created_at: string }>;
  userProjectsLoading: boolean;
  
  // Functions
  setCurrentProjectId: (projectId: string | null) => void;
  loadUserProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

interface ProjectProviderProps {
  children: ReactNode;
}

export const ProjectProvider: React.FC<ProjectProviderProps> = ({ children }) => {
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [userProjects, setUserProjects] = useState<Array<{ project_id: string; nom_projet: string; created_at: string }>>([]);
  const [userProjectsLoading, setUserProjectsLoading] = useState(false);

  const loadUserProjects = async () => {
    setUserProjectsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setUserProjects([]); // Clear any existing projects
        setUserProjectsLoading(false);
        return;
      }

      // Get projects from project_summary table
      const { data, error } = await supabase
        .from('project_summary')
        .select('project_id, nom_projet, created_at')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setUserProjects(data || []);

    } catch (error) {
      console.error("Error fetching user projects:", error);
      // Only show toast if there's a session (user is authenticated)
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        toast({
          title: "Erreur",
          description: "Impossible de charger vos projets. Veuillez réessayer plus tard.",
          variant: "destructive",
        });
      }
    } finally {
      setUserProjectsLoading(false);
    }
  };

  // Load user projects when authentication state changes
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        // User signed in, load their projects
        loadUserProjects();
      } else {
        // User signed out, clear projects
        setUserProjects([]);
        setCurrentProjectId(null);
      }
    });

    // Load projects on initial mount if user is already authenticated
    loadUserProjects();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const contextValue: ProjectContextType = {
    currentProjectId,
    userProjects,
    userProjectsLoading,
    setCurrentProjectId,
    loadUserProjects,
  };

  return (
    <ProjectContext.Provider value={contextValue}>
      {children}
    </ProjectContext.Provider>
  );
}; 