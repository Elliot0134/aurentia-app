import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

// Types for all project data
interface ProjectData {
  project_summary?: any | null;
  originalite?: any | null;
  pertinence?: any | null;
  complexite?: any | null;
  marche?: any | null;
  b2c?: any | null;
  b2b?: any | null;
  organisms?: any | null;
  concurrence?: any[] | null;
  proposition_valeur?: any | null;
  business_model?: any | null;
  ma_success_story?: any | null;
  pitch?: any | null;
  persona_express?: any | null;
  persona_express_b2c?: any | null;
  persona_express_b2b?: any | null;
  persona_express_organismes?: any | null;
  mini_swot?: any | null;
  ressources_requises?: any | null;
  success_story?: any | null;
  // Add other data types as needed
}

interface ProjectContextType {
  // Current project data
  currentProject: ProjectData | null;
  currentProjectId: string | null;
  loading: boolean;
  error: string | null;
  
  // User projects list for selector
  userProjects: Array<{ project_id: string; nom_projet: string; created_at: string }>;
  userProjectsLoading: boolean;
  
  // Functions
  loadProject: (projectId: string) => Promise<void>;
  clearProject: () => void;
  refreshProject: () => Promise<void>;
  loadUserProjects: () => Promise<void>;
  updateProjectData: (data: Partial<ProjectData>) => void;
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
  const [currentProject, setCurrentProject] = useState<ProjectData | null>(null);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

      // Get projects from project_summary table instead of form_business_idea
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
        setCurrentProject(null);
        setCurrentProjectId(null);
      }
    });

    // Load projects on initial mount if user is already authenticated
    loadUserProjects();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const loadProject = async (projectId: string) => {
    if (!projectId) return;

    setLoading(true);
    setError(null);
    setCurrentProjectId(projectId);

    try {
      const projectData: ProjectData = {};

      // Fetch project summary first (critical data)
      const { data: projectSummaryData, error: projectSummaryError } = await supabase
        .from('project_summary')
        .select('*')
        .eq('project_id', projectId)
        .single();

      if (projectSummaryError && projectSummaryError.code !== 'PGRST116') {
        throw projectSummaryError;
      }
      projectData.project_summary = projectSummaryData;

      // Helper function to safely fetch data without console errors
      const safelyFetchData = async (tableName: string, useSingle = true) => {
        try {
          const query = supabase.from(tableName).select('*').eq('project_id', projectId);
          const { data, error } = useSingle ? await query.single() : await query;
          
          if (error) {
            // Only log actual errors, not "not found" situations
            if (error.code !== 'PGRST116' && !error.message?.includes('does not exist')) {
              console.warn(`Warning for ${tableName}:`, error.message);
            }
            return null;
          }
          return data;
        } catch (err: any) {
          // Only log unexpected errors
          if (!err.message?.includes('does not exist') && !err.message?.includes('Not Found')) {
            console.warn(`Warning for ${tableName}:`, err.message);
          }
          return null;
        }
      };

      // Fetch data sequentially to avoid flooding console with errors
      const fetchDataSafely = async () => {
        const results: any = {};
        
        // List of tables to fetch (excluding the problematic ones)
        const tablesToFetch = [
          { name: 'originalite', single: true },
          { name: 'pertinence', single: true },
          { name: 'complexite', single: true },
          { name: 'concurrence', single: false },
          { name: 'proposition_valeur', single: true },
          { name: 'business_model', single: true },
          { name: 'pitch', single: true },
          { name: 'persona_express_b2c', single: true },
          { name: 'persona_express_b2b', single: true },
          { name: 'persona_express_organismes', single: true },
          { name: 'mini_swot', single: true },
          { name: 'ressources_requises', single: true },
          { name: 'ma_success_story', single: true }
        ];

        // Fetch all tables to ensure deliverables display properly
        for (const table of tablesToFetch) {
          const data = await safelyFetchData(table.name, table.single);
          if (data) {
            results[table.name] = data;
          }
        }

        return results;
      };

      const results = await fetchDataSafely();

      // Assign results to projectData
      projectData.originalite = results.originalite;
      projectData.pertinence = results.pertinence;
      projectData.complexite = results.complexite;
      projectData.concurrence = results.concurrence;
      projectData.proposition_valeur = results.proposition_valeur;
      projectData.business_model = results.business_model;
      projectData.pitch = results.pitch;
      projectData.persona_express_b2c = results.persona_express_b2c;
      projectData.persona_express_b2b = results.persona_express_b2b;
      projectData.persona_express_organismes = results.persona_express_organismes;
      projectData.mini_swot = results.mini_swot;
      projectData.ressources_requises = results.ressources_requises;
      projectData.ma_success_story = results.ma_success_story;

      // Fallback to test data for complexite if not found
      if (!projectData.complexite) {
        try {
          const testComplexiteData = await import('../test-complexite-data.json');
          projectData.complexite = testComplexiteData.default as any;
        } catch (importError) {
          // Silent fallback
        }
      }

      // Set the current project (no caching)
      setCurrentProject(projectData);

      console.log(`✅ Project "${projectSummaryData?.nom_projet || projectId}" loaded successfully`);

    } catch (error) {
      console.error("Error fetching project data:", error);
      setError("Impossible de charger les données du projet. Veuillez réessayer plus tard.");
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du projet. Veuillez réessayer plus tard.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const clearProject = () => {
    setCurrentProject(null);
    setCurrentProjectId(null);
    setError(null);
  };

  const refreshProject = async () => {
    if (currentProjectId) {
      // Always reload fresh data
      await loadProject(currentProjectId);
    }
  };

  const updateProjectData = (data: Partial<ProjectData>) => {
    if (currentProject && currentProjectId) {
      const updatedProject = { ...currentProject, ...data };
      setCurrentProject(updatedProject);
    }
  };

  const contextValue: ProjectContextType = {
    currentProject,
    currentProjectId,
    loading,
    error,
    userProjects,
    userProjectsLoading,
    loadProject,
    clearProject,
    refreshProject,
    loadUserProjects,
    updateProjectData,
  };

  return (
    <ProjectContext.Provider value={contextValue}>
      {children}
    </ProjectContext.Provider>
  );
}; 