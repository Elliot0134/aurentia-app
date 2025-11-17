import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useCreditsSimple, UserCredits } from '@/hooks/useCreditsSimple'; // Import useCreditsSimple and UserCredits

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
  userCredits: UserCredits | null; // Use UserCredits from useCreditsSimple
  creditsLoading: boolean;
  
  // Functions
  setCurrentProjectId: (projectId: string | null) => void;
  loadUserProjects: () => Promise<void>;
  deleteProject: (projectId: string) => Promise<boolean>;
  loadUserCredits: () => void; // Add loadUserCredits to the context type
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
  { name: 'Vision/Mission', table: 'vision_mission_valeurs' }
];

export const ProjectProvider: React.FC<ProjectProviderProps> = ({ children }) => {
  // Initialiser avec la valeur du localStorage si disponible
  const [currentProjectId, setCurrentProjectIdState] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('currentProjectId');
    }
    return null;
  });
  
  const [userProjects, setUserProjects] = useState<Array<{ project_id: string; nom_projet: string; created_at: string; statut_project: string }>>([]);
  const [userProjectsLoading, setUserProjectsLoading] = useState(false);
  const [deliverableNames, setDeliverableNames] = useState<string[]>([]);
  const [deliverablesLoading, setDeliverablesLoading] = useState(false);
  
  // Use the useCreditsSimple hook
  const { credits: userCredits, isLoading: creditsLoading, refresh: loadUserCredits } = useCreditsSimple();

  // Wrapper pour setCurrentProjectId qui persiste dans localStorage
  const setCurrentProjectId = (projectId: string | null) => {
    setCurrentProjectIdState(projectId);
    if (typeof window !== 'undefined') {
      if (projectId) {
        localStorage.setItem('currentProjectId', projectId);
      } else {
        localStorage.removeItem('currentProjectId');
      }
    }
  };

  const loadUserProjects = async () => {
    setUserProjectsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setUserProjects([]); // Clear any existing projects
        setUserProjectsLoading(false);
        return;
      }

      // Get projects where user is the OWNER
      const { data: ownedProjects, error: ownedError } = await supabase
        .from('project_summary')
        .select('project_id, nom_projet, created_at, statut_project')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (ownedError) throw ownedError;

      // Get projects where user is a COLLABORATOR
      const { data: collaboratorProjects, error: collabError } = await supabase
        .from('project_collaborators')
        .select(`
          project_id,
          project_summary!inner(
            project_id,
            nom_projet,
            created_at,
            statut_project
          )
        `)
        .eq('user_id', session.user.id)
        .eq('status', 'active');

      if (collabError) {
        console.error("Error fetching collaborative projects:", collabError);
        // Don't throw - just log and continue with owned projects
      }

      // Combine and deduplicate projects
      const allProjects = [...(ownedProjects || [])];

      if (collaboratorProjects) {
        collaboratorProjects.forEach((collab: {
          project_id: string;
          project_summary: {
            project_id: string;
            nom_projet: string;
            created_at: string;
            statut_project: string;
          };
        }) => {
          const projectData = collab.project_summary;
          // Only add if not already in list (user might be both owner and collaborator)
          if (projectData && !allProjects.find(p => p.project_id === projectData.project_id)) {
            allProjects.push({
              project_id: projectData.project_id,
              nom_projet: projectData.nom_projet,
              created_at: projectData.created_at,
              statut_project: projectData.statut_project
            });
          }
        });
      }

      // Sort by creation date
      allProjects.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setUserProjects(allProjects);

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

  // Valider le currentProjectId quand les projets sont chargés
  useEffect(() => {
    if (currentProjectId && userProjects.length > 0) {
      // Vérifier si le projet actuel existe toujours dans les projets de l'utilisateur
      const projectExists = userProjects.some(project => project.project_id === currentProjectId);
      if (!projectExists) {
        console.log(`🔄 Projet ${currentProjectId} n'existe plus, sélection du premier projet disponible`);
        // Si le projet n'existe plus, sélectionner le premier projet disponible
        setCurrentProjectId(userProjects[0]?.project_id || null);
      }
    } else if (!currentProjectId && userProjects.length > 0) {
      // Si aucun projet n'est sélectionné, sélectionner le premier automatiquement
      console.log(`🔄 Sélection automatique du premier projet: ${userProjects[0].project_id}`);
      setCurrentProjectId(userProjects[0].project_id);
    }
  }, [userProjects, currentProjectId]);

  // Load deliverables when current project changes
  useEffect(() => {
    if (currentProjectId) {
      loadDeliverables(currentProjectId);
    } else {
      setDeliverableNames([]);
    }
  }, [currentProjectId]);

  // Load user credits when authentication state changes
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        // User signed in, load their projects and credits
        loadUserProjects();
        loadUserCredits(); // Call fetchBalance from useCredits
      } else {
        // User signed out, clear projects and credits
        setUserProjects([]);
        setCurrentProjectId(null);
        setDeliverableNames([]);
        // userCredits and creditsLoading are managed by useCredits hook
      }
    });

    // Load projects and credits on initial mount if user is already authenticated
    loadUserProjects();
    loadUserCredits(); // Call fetchBalance from useCredits

    return () => {
      authListener.subscription.unsubscribe();
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

      // Delete from all related tables (excluding project_summary and form_business_idea as they will cascade)
      const tablesToDelete = [
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
        'vision_mission_valeurs',
      ];

      // Delete from form_business_idea first, as it might be a parent table.
      try {
        await supabase
          .from('form_business_idea')
          .delete()
          .eq('project_id', projectId)
          .eq('user_id', session.user.id);
      } catch (error) {
        console.log(`Erreur lors de la suppression de form_business_idea:`, error);
      }

      // Then delete from project_summary. This should trigger cascades to other tables.
      try {
        await supabase
          .from('project_summary')
          .delete()
          .eq('project_id', projectId)
          .eq('user_id', session.user.id);
      } catch (error) {
        console.log(`Erreur lors de la suppression de project_summary:`, error);
        // If project_summary deletion fails, we might still need to try deleting from other tables directly
      }

      // For any tables that might not be covered by ON DELETE CASCADE, attempt direct deletion as a fallback.
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
      // Trigger webhook for RAG deletion
      try {
        const webhookUrl = 'https://n8n.srv906204.hstgr.cloud/webhook/supp-rag';
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: session.user.id,
            project_id: projectId,
          }),
        });

        if (!response.ok) {
          console.error('Erreur lors de l\'appel du webhook RAG:', response.statusText);
        } else {
          console.log('Webhook RAG appelé avec succès.');
        }
      } catch (webhookError) {
        console.error('Erreur lors de l\'appel du webhook RAG:', webhookError);
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
    loadUserCredits, // Include loadUserCredits in the context value
  };

  return (
    <ProjectContext.Provider value={contextValue}>
      {children}
    </ProjectContext.Provider>
  );
};
