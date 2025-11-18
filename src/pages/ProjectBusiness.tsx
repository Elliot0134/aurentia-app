import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Download, UserPlus, Edit } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import RetranscriptionConceptLivrable from "@/components/deliverables/RetranscriptionConceptLivrable";
import PersonaExpressLivrable from "@/components/deliverables/PersonaExpressLivrable";
import MiniSwotLivrable from "@/components/deliverables/MiniSwotLivrable";
import MaSuccessStoryLivrable from "@/components/deliverables/MaSuccessStoryLivrable";
import PitchLivrable from "@/components/deliverables/PitchLivrable";
import AnalyseDeLaConcurrenceLivrable from "@/components/deliverables/AnalyseDeLaConcurrenceLivrable";
import BusinessModelLivrable from "@/components/deliverables/BusinessModelLivrable";
import PropositionDeValeurLivrable from "@/components/deliverables/PropositionDeValeurLivrable";
import AnalyseDeMarcheLivrable from "@/components/deliverables/AnalyseDeMarcheLivrable"; // Import the new deliverable
import AnalyseDesRessourcesLivrable from "@/components/deliverables/AnalyseDesRessourcesLivrable";
import VisionMissionValeursLivrable from "@/components/deliverables/VisionMissionValeursLivrable"; // Import the new deliverable
import CadreJuridiqueLivrable from "@/components/deliverables/CadreJuridiqueLivrable"; // Import CadreJuridiqueLivrable
import BlurredDeliverableWrapper from "@/components/deliverables/BlurredDeliverableWrapper"; // Import the new wrapper
import DeliverableProgressContainer from "@/components/deliverables/DeliverableProgressContainer"; // Import the new progress container
import * as DialogPrimitive from "@radix-ui/react-dialog"; // Import DialogPrimitive
import { X } from "lucide-react"; // Import X icon
import { supabase } from "@/integrations/supabase/client"; // Import Supabase client
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"; // Import Dialog components
import PlanCard from "@/components/ui/PlanCard"; // Import PlanCard component
import { useProject } from "@/contexts/ProjectContext";
import { useDeliverableProgress } from "@/hooks/useDeliverableProgress"; // Import the new hook
import ProjectScoreCards from "@/components/project/ProjectScoreCards"; // Import ProjectScoreCards
import ProjectRequiredGuard from '@/components/ProjectRequiredGuard';
import { useUserRole } from '@/hooks/useUserRole'; // Import useUserRole
import { useCreditsDialog } from '@/contexts/CreditsDialogContext'; // Import useCreditsDialog
import { useCreditsSimple } from '@/hooks/useCreditsSimple'; // Import useCreditsSimple
import { DeliverablesLoadingProvider } from '@/contexts/DeliverablesLoadingContext'; // Import DeliverablesLoadingProvider
import { useProjectPermissions } from '@/hooks/useProjectPermissions'; // Import useProjectPermissions
import { useCollaborators } from '@/hooks/useCollaborators'; // Import useCollaborators hook
import ProjectInviteModal from '@/components/collaboration/ProjectInviteModal'; // Import ProjectInviteModal
import usePageTitle from '@/hooks/usePageTitle';

const ProjectBusiness = () => {
  usePageTitle("Livrables");
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { userRole } = useUserRole(); // Get user role
  const { openCreditsDialog } = useCreditsDialog(); // Utiliser le contexte des crédits
  const { purchasedRemaining, monthlyRemaining, refresh: fetchCredits } = useCreditsSimple(); // Utiliser le hook des crédits
  const permissions = useProjectPermissions(projectId); // Get permissions for this project
  const { inviteCollaborator, loading: collaboratorsLoading, error: collaboratorsError } = useCollaborators(); // Get collaborators hook

  // Get persona from URL params (source of truth)
  const [searchParams, setSearchParams] = useSearchParams();
  const validPersonas = ['particulier', 'entreprise', 'organismes'];
  const personaFromUrl = searchParams.get('persona') || 'particulier';
  const selectedPersonaExpress = (validPersonas.includes(personaFromUrl.toLowerCase())
    ? (personaFromUrl.charAt(0).toUpperCase() + personaFromUrl.slice(1))
    : 'Particulier') as 'Particulier' | 'Entreprise' | 'Organismes';

  // Function to update persona in URL
  const setSelectedPersonaExpress = (persona: 'Particulier' | 'Entreprise' | 'Organismes') => {
    const newParams = new URLSearchParams(searchParams);
    const lowerPersona = persona.toLowerCase();
    if (lowerPersona !== 'particulier') {
      newParams.set('persona', lowerPersona);
    } else {
      newParams.delete('persona');
    }
    setSearchParams(newParams);
  };

  const [loading, setLoading] = useState(true); // Set loading to true initially
  const [project, setProject] = useState<{ nom_projet?: string; description_projet?: string } | null>(null); // State for project data
  const [userSubscriptionStatus, setUserSubscriptionStatus] = useState<string | null>(null); // New state for user subscription status

  useEffect(() => {
    if (!projectId) {
      navigate('/individual/project-business'); // Redirect to projects dashboard if projectId is missing
    }
  }, [projectId, navigate]);
  const [projectStatus, setProjectStatus] = useState<string | null>(null); // State for project status
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupContent, setPopupContent] = useState<{ title: React.ReactNode; content: React.ReactNode; buttonColor?: string } | null>(null);
  const [isGenerateDeliverablesConfirmOpen, setIsGenerateDeliverablesConfirmOpen] = useState(false); // New state for confirmation popup

  // État pour le modal d'invitation
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  
  // États pour la génération des livrables premium
  const { userProjects } = useProject();
  
  // Deliverable progress hook - actif pendant la génération premium
  const { deliverables, isLoading: isDeliverablesLoading, error: deliverablesError } = useDeliverableProgress(projectId, projectStatus === 'premium_en_cours');

  // Définir les livrables de niveau 2 avec leurs clés pour les icônes
  const level2Deliverables = [
    { key: 'concurrence', id: 'statut_concurrence', name: 'Analyse de la Concurrence', status: null, icon: '/icones-livrables/concurrence-icon.png', color: '#e74c3c' },
    { key: 'pestel', id: 'statut_pestel', name: 'Analyse du Marché (PESTEL)', status: null, icon: '/icones-livrables/market-icon.png', color: '#3498db' },
    { key: 'proposition_valeur', id: 'statut_proposition_valeur', name: 'Proposition de Valeur', status: null, icon: '/icones-livrables/proposition-valeur-icon.png', color: '#9b59b6' },
    { key: 'business_model', id: 'statut_business_model', name: 'Business Model', status: null, icon: '/icones-livrables/business-model-icon.png', color: '#57a68b' },
    { key: 'ressources', id: 'statut_ressources', name: 'Analyse des Ressources', status: null, icon: '/icones-livrables/ressources-icon.png', color: '#f39c12' },
  ];

  // handlePayment supprimée - plus nécessaire avec le système de crédits

  const openPopup = (title: React.ReactNode, content: React.ReactNode, buttonColor?: string) => {
    setPopupContent({ title, content, buttonColor });
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setPopupContent(null);
  };

  const handleGenerateDeliverables = async () => {
    setIsGenerateDeliverablesConfirmOpen(false);
    if (!projectId) {
      toast({
        title: "Erreur",
        description: "ID du projet manquant",
        variant: "destructive",
      });
      return;
    }

    const DELIVERABLE_COST = 600; // Coût des livrables premium en crédits

    // 1. Récupérer l'utilisateur actuel
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Erreur",
        description: "Utilisateur non authentifié.",
        variant: "destructive",
      });
      return;
    }

    // 2. Vérifier si assez de crédits disponibles
    const totalAvailableCredits = purchasedRemaining + monthlyRemaining;
    if (totalAvailableCredits < DELIVERABLE_COST) {
      toast({
        title: "Crédits insuffisants",
        description: `Vous avez ${totalAvailableCredits} crédits, ${DELIVERABLE_COST} requis. Veuillez en acheter davantage.`,
        variant: "destructive",
      });
      closePopup();
      openCreditsDialog();
      return;
    }

    // Fermer le popup de confirmation avant de lancer la génération
    closePopup();

    try {
      // 3. Débiter les crédits avec priorité (achetés en premier)
      let newPurchasedCredits = purchasedRemaining;
      let newMonthlyCredits = monthlyRemaining;

      if (purchasedRemaining >= DELIVERABLE_COST) {
        // Débiter uniquement des crédits achetés
        newPurchasedCredits -= DELIVERABLE_COST;
      } else {
        // Débiter tous les crédits achetés + le reste des mensuels
        newMonthlyCredits = totalAvailableCredits - DELIVERABLE_COST;
        newPurchasedCredits = 0;
      }

      // 4. Mettre à jour les crédits dans Supabase
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          purchased_credits_remaining: newPurchasedCredits,
          monthly_credits_remaining: newMonthlyCredits
        } as any) // Workaround for stale Supabase types
        .eq('id', user.id);

      if (updateError) throw updateError;

      // 5. Mettre le statut du projet en "payment_receive" pour déclencher la génération
      const { error: statusError } = await supabase
        .from('project_summary')
        .update({ statut_project: 'payment_receive' })
        .eq('project_id', projectId);

      if (statusError) throw statusError;

      // 6. Appeler le webhook de génération des livrables premium
      const webhookResponse = await fetch('https://n8n.srv906204.hstgr.cloud/webhook/generation-livrables-premium', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          user_id: user.id,
          type: 'premium_credits'
        }),
      });

      if (!webhookResponse.ok) {
        throw new Error(`Webhook failed: ${webhookResponse.status}`);
      }

      // 7. Démarrer la génération et afficher le popup "Pause café"
      fetchCredits();

      toast({
        title: "Génération en cours",
        description: `${DELIVERABLE_COST} crédits débités. Génération des livrables premium...`,
      });

      // Recharger la page pour mettre à jour le statut du projet et afficher le popup si nécessaire
      window.location.reload();

    } catch (error) {
      console.error("Error generating premium deliverables:", error);
      
      // Réinitialiser les états en cas d'erreur
      // Pas de changement d'état local nécessaire, le polling s'arrêtera
      
      toast({
        title: "Erreur",
        description: "Erreur lors de la génération des livrables premium.",
        variant: "destructive",
      });
    }
  };

  const handleUnlockClick = () => {
    if (userSubscriptionStatus === 'active') {
      setIsGenerateDeliverablesConfirmOpen(true);
      return;
    }

    const commonDeliverables = [
      "Analyse concurrentielle",
      <>Analyse du marché <span className="text-gray-500 italic text-lg">(PESTEL)</span></>,
      "Proposition de valeur",
      "Business model",
      <>Analyse des ressources requises <span className="text-gray-500 italic text-lg">(Impréssionant)</span></>,
    ];

    const niveau1Deliverables = commonDeliverables;
    const niveau2Deliverables = commonDeliverables;

    openPopup(
      "Générer les livrabels premium pour :",
      <>
        <div className="bg-gray-100 p-2 rounded-md flex items-center justify-center text-center mb-4 font-bold w-fit mx-auto">
          <img src="/credit-3D.png" alt="Crédits" className="h-8 w-8 inline-block mr-2" /> <span className="text-2xl font-sans">600</span>
        </div>
        <DialogDescription className="text-center text-base font-sans text-text-muted">
          <span className="font-bold text-text-primary">{project?.nom_projet || "Ce projet"}</span> mérite d'exister. Débloquez tous les livrables clés pour créer votre projet sans erreur.
        </DialogDescription>
        <DialogFooter className="flex justify-center gap-4 mt-8">
          <Button variant="outline" onClick={closePopup} className="flex-1">
            Non
          </Button>
          <Button onClick={handleGenerateDeliverables} className="flex-1 bg-gradient-primary hover:opacity-90">
            Let's go!
          </Button>
        </DialogFooter>
      </>
    );
  };

  // Gérer l'invitation d'un nouveau collaborateur
  const handleInviteCollaborator = async (inviteData: { email: string; role: string; projects: string[] }) => {
    const result = await inviteCollaborator(inviteData);

    if (result.success) {
      toast({
        title: "Invitation envoyée",
        description: `L'invitation a été envoyée à ${inviteData.email}`,
      });
      setIsInviteModalOpen(false);
    } else {
      toast({
        title: "Erreur",
        description: result.error || "Impossible d'envoyer l'invitation",
        variant: "destructive",
      });
    }

    return result;
  };

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      setProject(null);
      return;
    }

    const fetchProject = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('project_summary')
        .select('nom_projet, description_synthetique, statut_project') // Select the project name, description, and status
        .eq('project_id', projectId)
        .single();

      if (error) {
        console.error("Error fetching project:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les détails du projet.",
          variant: "destructive",
        });
        setProject(null);
        setProjectStatus(null);
      } else {
        setProject({
          nom_projet: data?.nom_projet || "Projet sans nom",
          description_projet: data?.description_synthetique || "Aucune description",
        });
        setProjectStatus(data?.statut_project || null);
        console.log("fetchProject: projectStatus set to", data?.statut_project);
      }
      setLoading(false);
    };

    fetchProject();
  }, [projectId]); // Refetch when projectId changes

  // Fetch user's subscription status
  useEffect(() => {
    const fetchUserSubscriptionStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('subscription_status')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error("Error fetching user subscription status:", error);
        } else {
          setUserSubscriptionStatus(data?.subscription_status || null);
        }
      }
    };

    fetchUserSubscriptionStatus();
  }, []);

  // useEffects Stripe supprimés - plus nécessaires avec le système de crédits

  // Polling for project status to control "Pause café" popup
  useEffect(() => {
    const relevantStatuses = ['payment_receive', 'premium_en_cours'];
    if (!projectId || !relevantStatuses.includes(projectStatus || '')) {
      return; // Ne pas démarrer le polling si le statut n'est pas pertinent
    }

    console.log(`Polling started for project status: ${projectStatus}`);

    const intervalId = setInterval(async () => {
      try {
        const { data, error } = await supabase
          .from('project_summary')
          .select('statut_project')
          .eq('project_id', projectId)
          .single();

        if (error) {
          console.error('Error polling project status:', error);
          return; // Continue polling
        }

        // Mettre à jour le statut local s'il a changé
        if (data && data.statut_project !== projectStatus) {
          console.log(`Project status changed from ${projectStatus} to ${data.statut_project}`);
          setProjectStatus(data.statut_project);
        }
        
        // Si le statut est "premium_terminé", le polling s'arrêtera au prochain rendu car la condition initiale du useEffect ne sera plus remplie.
        if (data.statut_project === 'premium_terminé') {
            toast({
                title: "Livrables prêts !",
                description: "Tous vos livrables premium ont été générés avec succès.",
            });
        }

      } catch (err) {
        console.error('Polling failed:', err);
      }
    }, 2000); // Poll every 2 seconds

    return () => {
      console.log('Polling stopped.');
      clearInterval(intervalId);
    };
  }, [projectId, projectStatus]);

  // Listen for project status updates (e.g., when payment is cancelled)
  useEffect(() => {
    const handleProjectStatusUpdate = (event: CustomEvent) => {
      const { projectId: updatedProjectId, newStatus } = event.detail;
      if (updatedProjectId === projectId) {
        console.log('📡 Received projectStatusUpdated event, updating status to:', newStatus);
        setProjectStatus(newStatus);
      }
    };

    window.addEventListener('projectStatusUpdated', handleProjectStatusUpdate as EventListener);
    
    return () => {
      window.removeEventListener('projectStatusUpdated', handleProjectStatusUpdate as EventListener);
    };
  }, [projectId]);

  // Les listeners pour 'deliverablesCompleted' ont été supprimés car la logique est maintenant gérée par le polling sur `statut_project`.

  if (loading) {
    return (
      <ProjectRequiredGuard>
        <DeliverablesLoadingProvider>
          <div className="container-aurentia py-8 animate-fade-in">
            <div>
              {/* Header avec titre */}
              <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
                <div className="flex flex-col w-full md:w-1/2 md:order-first">
                  <div className="skeleton h-10 w-64 rounded bg-gray-200"></div>
                </div>
                <div className="flex flex-col md:flex-row items-start md:items-center gap-3 w-full md:w-1/2 md:order-last">
                  <div className="flex items-center gap-3 w-full justify-end">
                    <div className="skeleton h-10 w-10 rounded bg-gray-200"></div>
                    <div className="skeleton h-10 w-10 rounded bg-gray-200"></div>
                  </div>
                </div>
              </div>

              {/* Project Score Cards Skeleton */}
              <div className="mb-8">
                <div className="skeleton h-6 w-40 mb-4 rounded bg-gray-200"></div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Skeleton carte principale */}
                  <div className="card-static" style={{ minHeight: '240px' }}>
                    <div className="flex flex-col h-full items-center justify-center text-center gap-4">
                      <div className="skeleton h-16 w-24 rounded-lg bg-gray-200"></div>
                      <div className="skeleton h-5 w-48 rounded bg-gray-200"></div>
                      <div className="skeleton h-4 w-full lg:w-[85%] mx-auto rounded bg-gray-200"></div>
                    </div>
                  </div>
                  {/* Grid 2x2 pour skeletons secondaires */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="card-static" style={{ minHeight: '120px' }}>
                        <div className="flex flex-col justify-center h-full gap-2">
                          <div className="skeleton h-8 w-16 rounded bg-gray-200"></div>
                          <div className="skeleton h-4 w-32 rounded bg-gray-200"></div>
                          <div className="skeleton h-3 w-24 rounded bg-gray-200"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mes livrables Skeleton */}
              <div className="col-span-full mb-8">
                <div className="skeleton h-6 w-32 mb-4 rounded bg-gray-200"></div>
                <div className="bg-[#f4f4f5] rounded-xl px-4 py-2 h-[80px] mb-4 animate-pulse">
                  <div className="flex gap-4 h-full items-center">
                    <div className="w-12 h-12 bg-[#e0e0e0] rounded-lg"></div>
                    <div className="flex-grow flex flex-col min-w-0 gap-2">
                      <div className="h-4 bg-[#e0e0e0] rounded w-3/4"></div>
                      <div className="h-3 bg-[#e0e0e0] rounded w-full"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Level 1 Deliverables Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 items-stretch auto-rows-fr min-h-[200px]">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-[#f4f4f5] rounded-xl px-4 py-2 h-full mb-4 animate-pulse">
                    <div className="flex gap-4 h-full items-center">
                      <div className="w-12 h-12 bg-[#e0e0e0] rounded-lg"></div>
                      <div className="flex-grow flex flex-col min-w-0 gap-2">
                        <div className="h-4 bg-[#e0e0e0] rounded w-3/4"></div>
                        <div className="h-3 bg-[#e0e0e0] rounded w-full"></div>
                        <div className="h-5 bg-[#e0e0e0] rounded-full w-20"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Level 2 Button Skeleton */}
              <div className="grid grid-cols-12 gap-4 md:gap-5 mt-8">
                <div className="col-span-12 text-center">
                  <div className="skeleton h-10 w-64 mx-auto rounded-lg bg-gray-200"></div>
                </div>
              </div>

              {/* Level 2 Deliverables Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 mt-8 items-stretch auto-rows-fr min-h-[200px]">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="bg-[#f4f4f5] rounded-xl px-4 py-2 h-full mb-4 animate-pulse">
                    <div className="flex gap-4 h-full items-center">
                      <div className="w-12 h-12 bg-[#e0e0e0] rounded-lg"></div>
                      <div className="flex-grow flex flex-col min-w-0 gap-2">
                        <div className="h-4 bg-[#e0e0e0] rounded w-3/4"></div>
                        <div className="h-3 bg-[#e0e0e0] rounded w-full"></div>
                        <div className="h-5 bg-[#e0e0e0] rounded-full w-20"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DeliverablesLoadingProvider>
      </ProjectRequiredGuard>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] animate-popup-appear">
        <div className="container mx-auto px-4 py-8 text-center bg-white p-8 rounded-lg shadow-lg max-w-lg w-[90vw]">
          <h2 className="text-3xl font-heading text-text-primary mb-4">Que l'aventure commence !</h2>
          <p className="text-base font-sans text-text-muted mb-6">Créez un nouveau projet pour découvrir tout le potentiel de votre idée.</p>
          <Button 
            onClick={() => navigate("/individual/warning")} 
            className="mt-4 px-4 py-2 rounded-lg bg-gradient-primary hover:from-blue-600 hover:to-purple-700 text-white text-lg font-semibold shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            Créer un nouveau projet
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ProjectRequiredGuard>
      <DeliverablesLoadingProvider>
        <div className="container-aurentia py-8 animate-fade-in">
        <div>
          <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
            <div className="flex flex-col w-full md:w-1/2 md:order-first">
              <h1 className="text-4xl font-heading text-text-primary">Mes livrables</h1>
            </div>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-3 w-full md:w-1/2 md:order-last">
              <div className="flex items-center gap-3 w-full justify-end">
                {permissions.canRead && (
                  <Button variant="outline" className="h-10 w-10 p-0" onClick={() => {
                    if (projectStatus === 'free') {
                      handleUnlockClick();
                    } else {
                      // TODO: Implement actual export functionality here
                      toast({
                        title: "Exportation",
                        description: "La fonctionnalité d'exportation sera bientôt disponible.",
                        duration: 3000,
                      });
                    }
                  }}>
                    <Download size={18} />
                  </Button>
                )}
                {permissions.canInvite && (
                  <Button
                    onClick={() => setIsInviteModalOpen(true)}
                    className="h-10 w-10 p-0 bg-gradient-primary hover:opacity-90 transition-opacity"
                    title="Inviter un collaborateur"
                  >
                    <UserPlus size={18} />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Project Score Cards */}
          <div className="mb-8">
            <h2 className="text-xl font-sans font-semibold text-text-primary mb-4">Note du projet</h2>
            <ProjectScoreCards />
          </div>

          {/* Retranscription du concept Deliverable */}
          <div className="col-span-full mb-8">
            <h2 className="text-xl font-sans font-semibold text-text-primary mb-4">Mes livrables</h2>
            <RetranscriptionConceptLivrable />
          </div>

          {/* Level 1 Deliverables (rest of them in a grid) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 items-stretch auto-rows-fr min-h-[200px]">
            <div className="md:h-full">
              <PersonaExpressLivrable />
            </div>
            <div className="md:h-full">
              <MiniSwotLivrable />
            </div>
            <div className="md:h-full">
              <MaSuccessStoryLivrable />
            </div>
            <div className="md:h-full">
              <PitchLivrable />
            </div>
            <div className="md:h-full">
              <VisionMissionValeursLivrable projectId={projectId} />
            </div>
            {/* Cadre Juridique Livrable */}
            <div className="md:h-full">
              <CadreJuridiqueLivrable
                title="Cadre Juridique"
                description="Analyse du cadre légal et réglementaire de votre projet."
                projectId={projectId}
              />
            </div>
          </div>

          {/* Level 2 Deliverables */}
          <div className="grid grid-cols-12 gap-4 md:gap-5 mt-8">
            <div className="col-span-12 text-center">
              {projectStatus === 'free' ? (
                <button className="btn-primary" onClick={handleUnlockClick}>Débloquer les prochains livrables</button>
              ) : (
                <button className="btn-primary">Niveau 2</button>
              )}
            </div>
          </div>

          {/* Analyse de la Concurrence, Analyse de Marché, Proposition de Valeur et Business Model Deliverables */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 mt-8 items-stretch auto-rows-fr min-h-[200px]">
            {/* Analyse de la Concurrence Deliverable */}
            <div className="md:h-full">
              <BlurredDeliverableWrapper isBlurred={projectStatus === 'free'} onUnlockClick={handleUnlockClick}>
                <AnalyseDeLaConcurrenceLivrable projectStatus={projectStatus} />
              </BlurredDeliverableWrapper>
            </div>

            {/* Analyse de Marché Deliverable */}
            <div className="md:h-full">
              <BlurredDeliverableWrapper isBlurred={projectStatus === 'free'} onUnlockClick={handleUnlockClick}>
                <AnalyseDeMarcheLivrable projectId={projectId} />
              </BlurredDeliverableWrapper>
            </div>

            {/* Proposition de Valeur Deliverable */}
            <div className="md:h-full">
              <BlurredDeliverableWrapper isBlurred={projectStatus === 'free'} onUnlockClick={handleUnlockClick}>
                <PropositionDeValeurLivrable />
              </BlurredDeliverableWrapper>
            </div>

            {/* Business Model Deliverable */}
            <div className="md:h-full">
              <BlurredDeliverableWrapper isBlurred={projectStatus === 'free'} onUnlockClick={handleUnlockClick}>
                <BusinessModelLivrable
                  title="Business Model"
                  description="Modèle économique structuré de votre entreprise"
                  textColor="#57a68b"
                  buttonColor="#57a68b"
                />
              </BlurredDeliverableWrapper>
            </div>

            {/* Analyse des Ressources Deliverable */}
            <div className="md:h-full">
              <BlurredDeliverableWrapper isBlurred={projectStatus === 'free'} onUnlockClick={handleUnlockClick}>
                <AnalyseDesRessourcesLivrable />
              </BlurredDeliverableWrapper>
            </div>
          </div>
        </div>

        {/* Payment Loading Dialog - Maintenant pour les livrables premium avec crédits */}
        <Dialog open={projectStatus === 'premium_en_cours'} onOpenChange={() => {}}>
          <DialogContent className="w-[95vw] max-w-[500px] rounded-lg sm:w-full" onEscapeKeyDown={(e) => e.preventDefault()} onInteractOutside={(e) => e.preventDefault()} hideCloseButton={true}>
            <DialogHeader>
              <DialogTitle className="text-2xl font-heading text-text-primary">
                {'☕️ Une pause café ?'}
              </DialogTitle>
              <div className="text-base font-sans text-text-muted">
                <>La génération des livrables premium peut durer jusqu'à 10 minutes, dû à la chaîne de raisonnement et aux modèles IA de réflexion apporfondies utilisés. <br /><br /> En attendant, profitez-en pour vous faire un petit café car la suite de l'aventure ne sera sûrement pas de tout repos !</>
              </div>
            </DialogHeader>
            
            {/* Deliverable Progress Section - Toujours affichée maintenant */}
            <div className="mt-6 space-y-3">
              <h4 className="text-sm font-sans font-semibold text-text-primary mb-3">Génération en cours :</h4>
              {deliverables
                .filter(deliverable => deliverable.key !== 'juridique') // Exclure le livrable juridique
                .map((deliverable) => (
                  <DeliverableProgressContainer
                    key={deliverable.key}
                    deliverable={deliverable}
                  />
                ))}
            </div>
            
            <div className="flex justify-center items-center py-4">
              <div className="loader">
                <div className="circle"></div>
                <div className="circle"></div>
                <div className="circle"></div>
                <div className="square"></div>
              </div>
            </div>
            {/* Bouton d'annulation supprimé - plus nécessaire avec le système de crédits */}
          </DialogContent>
        </Dialog>

        {/* Generate Deliverables Confirmation Dialog */}
        <Dialog open={isGenerateDeliverablesConfirmOpen} onOpenChange={setIsGenerateDeliverablesConfirmOpen}>
          <DialogContent className="w-[95vw] max-w-[400px] rounded-lg sm:w-full">
            <DialogHeader>
              <DialogTitle className="text-2xl font-heading text-text-primary text-center">Générer les livrables ?</DialogTitle>
              <DialogDescription className="text-center text-base font-sans text-text-muted">
                Êtes-vous sûr de vouloir générer les livrables premium pour ce projet ?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex justify-center gap-4">
              <Button variant="outline" onClick={() => setIsGenerateDeliverablesConfirmOpen(false)} className="flex-1">
                Non
              </Button>
              <Button onClick={handleGenerateDeliverables} className="flex-1 bg-gradient-primary hover:opacity-90">
                Oui
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Popup Dialog */}
        <Dialog open={isPopupOpen} onOpenChange={setIsPopupOpen}>
          <DialogContent className="w-[95vw] max-w-[500px] rounded-lg sm:w-full">
            <DialogHeader>
              <DialogTitle className="text-2xl font-sans text-text-primary text-center">{popupContent?.title}</DialogTitle>
            </DialogHeader>
            {popupContent?.content}
            <div className="absolute right-4 top-4">
              <DialogPrimitive.Close className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                <X className="h-4 w-4" />
                <span className="sr-only">Fermer</span>
              </DialogPrimitive.Close>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal d'invitation de collaborateurs */}
        {projectId && project && (
          <ProjectInviteModal
            isOpen={isInviteModalOpen}
            onClose={() => setIsInviteModalOpen(false)}
            onInvite={handleInviteCollaborator}
            projectId={projectId}
            projectName={project.nom_projet || 'ce projet'}
            loading={collaboratorsLoading}
            error={collaboratorsError}
          />
        )}
        </div>
      </DeliverablesLoadingProvider>
    </ProjectRequiredGuard>
  );
};

export default ProjectBusiness;
