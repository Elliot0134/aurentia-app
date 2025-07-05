import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface ProjectContextType {
  // Current project ID (just for tracking selection)
  currentProjectId: string | null;
  
  // User projects list for selector
  userProjects: Array<{ project_id: string; nom_projet: string; created_at: string; statut_project: string }>;
  userProjectsLoading: boolean;
  
  // Deliverables for current project
  deliverableNames: string[];
  deliverablesLoading: boolean;
  
  // User credits
  userCredits: { current: number; max: number } | null;
  creditsLoading: boolean;
  
  // Functions
  setCurrentProjectId: (projectId: string | null) => void;
  loadUserProjects: () => Promise<void>;
  deleteProject: (projectId: string) => Promise<boolean>;
  loadUserCredits: () => Promise<void>;
  updateUserCredits: (newCredits: number) => Promise<void>;
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

// Configuration des livrables basée sur la DB
const DELIVERABLES_CONFIG = [
  { name: 'Cible B2C', table: 'persona_express_b2c' },
  { name: 'Cible B2B', table: 'persona_express_b2b' },
  { name: 'Cible Organismes', table: 'persona_express_organismes' },
  { name: 'Pitch', table: 'pitch' },
  { name: 'Concurrence', table: 'concurrence' },
  { name: 'Marché', table: 'marche' },
  { name: 'Proposition de valeur', table: 'proposition_valeur' },
  { name: 'Business Model', table: 'business_model' },
  { name: 'Analyse des ressources', table: 'ressources_requises' },
  { name: 'Vision/Mission', table: 'vision_mission' }
];

export const ProjectProvider: React.FC<ProjectProviderProps> = ({ children }) => {
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [userProjects, setUserProjects] = useState<Array<{ project_id: string; nom_projet: string; created_at: string; statut_project: string }>>([]);
  const [userProjectsLoading, setUserProjectsLoading] = useState(false);
  const [deliverableNames, setDeliverableNames] = useState<string[]>([]);
  const [deliverablesLoading, setDeliverablesLoading] = useState(false);
  const [userCredits, setUserCredits] = useState<{ current: number; max: number } | null>(null);
  const [creditsLoading, setCreditsLoading] = useState(false);

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
        .select('project_id, nom_projet, created_at, statut_project')
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

  const loadDeliverables = async (projectId: string) => {
    if (!projectId) {
      setDeliverableNames([]);
      return;
    }

    setDeliverablesLoading(true);
    console.log(`🔄 Récupération des livrables pour le projet: ${projectId}`);

    try {
      const foundDeliverables: string[] = [];

      for (const config of DELIVERABLES_CONFIG) {
        try {
          const { data, error } = await supabase
            .from(config.table)
            .select('*')
            .eq('project_id', projectId)
            .single();
          
          // PGRST116 = pas de résultat trouvé, pas une vraie erreur
          if (!error && data) {
            foundDeliverables.push(config.name);
          }
        } catch (error) {
          // Ignore les erreurs individuelles
          console.log(`❌ Erreur pour ${config.table}:`, error);
        }
      }

      setDeliverableNames(foundDeliverables);
      
      // AFFICHAGE DANS LA CONSOLE comme demandé
      console.log('📋 === LIVRABLES POSSÉDÉS ===');
      foundDeliverables.forEach((name, index) => {
        console.log(`${index + 1}. ${name}`);
      });
      console.log(`📊 Total: ${foundDeliverables.length} livrables`);
      console.log('=============================');

    } catch (error) {
      console.error('❌ Erreur lors de la récupération des livrables:', error);
      setDeliverableNames([]);
    } finally {
      setDeliverablesLoading(false);
    }
  };

  // Load deliverables when current project changes
  useEffect(() => {
    if (currentProjectId) {
      loadDeliverables(currentProjectId);
    } else {
      setDeliverableNames([]);
    }
  }, [currentProjectId]);

  const loadUserCredits = async () => {
    setCreditsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        setUserCredits(null);
        setCreditsLoading(false);
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('credits_restants, credit_limit')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Erreur lors du chargement des crédits:', error);
        setUserCredits(null);
        return;
      }

      const current = parseInt(profile.credits_restants || '0', 10);
      const max = parseInt(profile.credit_limit || '0', 10);
      
      setUserCredits({ current, max });

    } catch (error) {
      console.error('Erreur lors du chargement des crédits:', error);
      setUserCredits(null);
    } finally {
      setCreditsLoading(false);
    }
  };

  const updateUserCredits = async (newCredits: number) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        console.error('Utilisateur non connecté');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ credits_restants: newCredits.toString() })
        .eq('id', session.user.id);

      if (error) {
        console.error('Erreur lors de la mise à jour des crédits:', error);
        return;
      }

      // Mettre à jour l'état local
      if (userCredits) {
        setUserCredits({ ...userCredits, current: newCredits });
      }

    } catch (error) {
      console.error('Erreur lors de la mise à jour des crédits:', error);
    }
  };

  // Load user credits when authentication state changes
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        // User signed in, load their projects and credits
        loadUserProjects();
        loadUserCredits();
      } else {
        // User signed out, clear projects and credits
        setUserProjects([]);
        setCurrentProjectId(null);
        setDeliverableNames([]);
        setUserCredits(null);
      }
    });

    // Listen for credit updates from Stripe service
    const handleCreditsUpdated = (event: CustomEvent) => {
      setUserCredits(event.detail);
    };

    window.addEventListener('creditsUpdated', handleCreditsUpdated as EventListener);

    // Load projects and credits on initial mount if user is already authenticated
    loadUserProjects();
    loadUserCredits();

    return () => {
      authListener.subscription.unsubscribe();
      window.removeEventListener('creditsUpdated', handleCreditsUpdated as EventListener);
    };
  }, []);

  const deleteProject = async (projectId: string): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour supprimer un projet.",
          variant: "destructive",
        });
        return false;
      }

      // Delete from all related tables
      const tablesToDelete = [
        'project_summary',
        'persona_express_b2c',
        'persona_express_b2b', 
        'persona_express_organismes',
        'mini_swot',
        'success_story',
        'pitch',
        'concurrence',
        'marche',
        'proposition_valeur',
        'business_model',
        'ressources_requises',
        'rag',
        'vision_mission_valeurs'
      ];

      // Delete from each table
      for (const table of tablesToDelete) {
        try {
          await supabase
            .from(table)
            .delete()
            .eq('project_id', projectId)
            .eq('user_id', session.user.id);
        } catch (error) {
          console.log(`Erreur lors de la suppression de ${table}:`, error);
          // Continue deleting from other tables even if one fails
        }
      }

      // If we're deleting the current project, clear it
      if (currentProjectId === projectId) {
        setCurrentProjectId(null);
      }

      // Reload the projects list
      await loadUserProjects();

      toast({
        title: "Succès",
        description: "Le projet a été supprimé avec succès.",
      });

      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du projet:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le projet. Veuillez réessayer.",
        variant: "destructive",
      });
      return false;
    }
  };

  const contextValue: ProjectContextType = {
    currentProjectId,
    userProjects,
    userProjectsLoading,
    deliverableNames,
    deliverablesLoading,
    userCredits,
    creditsLoading,
    setCurrentProjectId,
    loadUserProjects,
    deleteProject,
    loadUserCredits,
    updateUserCredits,
  };

  return (
    <ProjectContext.Provider value={contextValue}>
      {children}
    </ProjectContext.Provider>
  );
};
