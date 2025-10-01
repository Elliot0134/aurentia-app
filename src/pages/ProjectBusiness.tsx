import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FileText, Download, Settings, DollarSign, Briefcase, Lightbulb, Package, Shield, TrendingUp, Book, ListChecks, BarChart, Globe, HelpCircle, UserPlus, Mail, Eye, Edit, FolderSearch } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
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
import TemplateLivrable from "@/components/deliverables/TemplateLivrable"; // Import TemplateLivrable
import BlurredDeliverableWrapper from "@/components/deliverables/BlurredDeliverableWrapper"; // Import the new wrapper
import DeliverableProgressContainer from "@/components/deliverables/DeliverableProgressContainer"; // Import the new progress container
import * as DialogPrimitive from "@radix-ui/react-dialog"; // Import DialogPrimitive
import { X } from "lucide-react"; // Import X icon
import { supabase } from "@/integrations/supabase/client"; // Import Supabase client
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"; // Import Dialog components
import PlanCard from "@/components/ui/PlanCard"; // Import PlanCard component
import ComingSoonDialog from "@/components/ui/ComingSoonDialog"; // Import ComingSoonDialog
// import { useStripePayment } from "@/hooks/useStripePayment"; // Plus nécessaire avec les crédits
import { useProject } from "@/contexts/ProjectContext";
import { useDeliverableProgress } from "@/hooks/useDeliverableProgress"; // Import the new hook
import ProjectScoreCards from "@/components/project/ProjectScoreCards"; // Import ProjectScoreCards
import ProjectRequiredGuard from '@/components/ProjectRequiredGuard';
import { useUserRole } from '@/hooks/useUserRole'; // Import useUserRole
import { useCreditsDialog } from '@/contexts/CreditsDialogContext'; // Import useCreditsDialog
import { useCreditsSimple } from '@/hooks/useCreditsSimple'; // Import useCreditsSimple

const ProjectBusiness = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { userRole } = useUserRole(); // Get user role
  const { openCreditsDialog } = useCreditsDialog(); // Utiliser le contexte des crédits
  const { purchasedRemaining, monthlyRemaining, refresh: fetchCredits } = useCreditsSimple(); // Utiliser le hook des crédits
  const [selectedPersonaExpress, setSelectedPersonaExpress] = useState<'Particulier' | 'Entreprise' | 'Organismes'>('Particulier');
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
  
  // États pour le popup d'invitation
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'Lecteur' | 'Éditeur'>('Lecteur');
  const [inviteProjects, setInviteProjects] = useState<string[]>([]);
  const [isComingSoonOpen, setIsComingSoonOpen] = useState(false); // State for ComingSoonDialog
  
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
          <img src="/credit-3D.png" alt="Crédits" className="h-8 w-8 inline-block mr-2" /> <span className="text-2xl">600</span>
        </div>
        <DialogDescription className="text-center">
          <span className="font-bold text-[#2D2D2D]">JeFaisQuoi</span> mérite d'exister. Débloquez tous les livrables clés pour créer votre projet sans erreur.
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

  const handleInvite = () => {
    if (!inviteEmail) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer une adresse email",
        variant: "destructive",
      });
      return;
    }

    // Vérifier si l'email est valide
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer une adresse email valide",
        variant: "destructive",
      });
      return;
    }

    // Vérifier qu'au moins un projet est sélectionné
    if (inviteProjects.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner au moins un projet",
        variant: "destructive",
      });
      return;
    }

    // TODO: Implémenter l'envoi réel de l'invitation
    setIsInviteModalOpen(false);
    setInviteEmail('');
    setInviteRole('Lecteur');
    setInviteProjects([]);
    
    toast({
      title: "Succès",
      description: `Invitation envoyée à ${inviteEmail}`,
    });
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
    return <div>Chargement...</div>; // Or a loading spinner component
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] animate-popup-appear"> {/* Ajusté pour centrer verticalement et ajouter une animation de popup */}
        <div className="container mx-auto px-4 py-8 text-center bg-white p-8 rounded-lg shadow-lg max-w-lg w-[90vw]"> {/* Ajout de fond blanc, padding, ombre et largeur maximale, avec une largeur de 90vw pour mobile */}
          <h2 className="text-3xl font-bold mb-4 text-gray-800">Que l'aventure commence !</h2> {/* Nouveau titre */}
          <p className="text-gray-600 mb-6 text-lg">Créez un nouveau projet pour découvrir tout le potentiel de votre idée.</p> {/* Nouveau sous-titre */}
          <Button 
            onClick={() => navigate(userRole === 'member' ? "/member/warning" : "/individual/warning")} 
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
      <div className="mx-auto py-8 animate-fade-in">
        <div className="w-[95vw] md:w-11/12 mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
            <div className="flex flex-col w-full md:w-1/2 md:order-first">
              <h1 className="text-3xl font-semibold">Mes livrables</h1>
            </div>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-3 w-full md:w-1/2 md:order-last">
              <div className="flex items-center gap-3 w-full">
                <Button variant="outline" className="flex items-center gap-2 text-sm w-1/2" onClick={() => {
                  if (projectStatus === 'free') {
                    handleUnlockClick();
                  } else {
                    // TODO: Implement actual modify functionality here
                    toast({
                      title: "Modification",
                      description: "La fonctionnalité de modification sera bientôt disponible.",
                      duration: 3000,
                    });
                  }
                }}>
                  <Settings size={16} />
                  Modifier
                </Button>
                <Button variant="outline" className="flex items-center gap-2 text-sm w-1/2" onClick={() => {
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
                  <Download size={16} />
                  Exporter
                </Button>
              </div>
              <Button
                onClick={() => setIsComingSoonOpen(true)}
                className="flex items-center gap-2 bg-gradient-primary hover:opacity-90 transition-opacity w-full"
                size="sm"
              >
                <UserPlus size={16} />
                Inviter un collaborateur
              </Button>
            </div>
          </div>

          {/* Project Score Cards */}
          <ProjectScoreCards className="mb-8" /> {/* Ajout de la classe mb-8 pour la marge */}

          {/* Retranscription du concept Deliverable */}
          <div className="col-span-full">
            <RetranscriptionConceptLivrable />
          </div>

          {/* Level 1 Deliverables (rest of them in a grid) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 items-stretch auto-rows-fr min-h-[200px]">
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
            <div className="md:h-full">
              <TemplateLivrable
                title="Livrable Template"
                description="Ceci est un livrable template pour démonstration."
                avis="Nouveau"
                justification_avis="Ceci est un livrable template pour démonstration, avec la nouvelle structure."
                iconSrc="/icones-livrables/market-icon.png"
                structure={[
                  {
                    title: "Section 1: Introduction",
                    items: [
                      { title: "Sous-section 1.1", content: "Contenu de la sous-section 1.1." },
                      { title: "Sous-section 1.2", content: "Contenu de la sous-section 1.2." },
                    ],
                  },
                  {
                    title: "Section 2: Détails",
                    items: [
                      { title: "Sous-section 2.1", content: "Contenu de la sous-section 2.1." },
                    ],
                  },
                ]}
              />
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mt-8 items-stretch auto-rows-fr min-h-[200px]">
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
          </div>

          {/* Level 4 Deliverables */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mt-8 items-stretch auto-rows-fr min-h-[200px]">
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
              <DialogTitle className="text-2xl">
                {'☕️ Une pause café ?'}
              </DialogTitle>
              <div className="text-sm text-muted-foreground">
                <>La génération des livrables premium peut durer jusqu'à 10 minutes, dû à la chaîne de raisonnement et aux modèles IA de réflexion apporfondies utilisés. <br /><br /> En attendant, profitez-en pour vous faire un petit café car la suite de l'aventure ne sera sûrement pas de tout repos !</>
              </div>
            </DialogHeader>
            
            {/* Deliverable Progress Section - Toujours affichée maintenant */}
            <div className="mt-6 space-y-3">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Génération en cours :</h4>
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
              <DialogTitle className="text-2xl text-center">Générer les livrables ?</DialogTitle>
              <DialogDescription className="text-center">
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
              <DialogTitle className="text-2xl text-center">{popupContent?.title}</DialogTitle>
            </DialogHeader>
            {popupContent?.content}
            <div className="absolute right-4 top-4 flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => {
                  // TODO: Implement actual modify functionality here
                  toast({
                    title: "Modification",
                    description: "La fonctionnalité de modification sera bientôt disponible.",
                    duration: 3000,
                  });
                }}
              >
                <Edit className="h-4 w-4" />
                <span className="sr-only">Modifier</span>
              </Button>
              <DialogPrimitive.Close className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                <X className="h-4 w-4" />
                <span className="sr-only">Fermer</span>
              </DialogPrimitive.Close>
            </div>
          </DialogContent>
        </Dialog>

        {/* Popup d'invitation */}
        <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
          <DialogContent className="rounded-xl w-[90vw] mx-auto my-4 sm:max-w-[425px] sm:w-full">
            <DialogHeader>
              <DialogTitle>Inviter un nouveau collaborateur</DialogTitle>
              <DialogDescription>
                Envoyez une invitation par email pour donner accès à votre projet.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Adresse email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="collaborateur@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="placeholder:text-xs"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Rôle</Label>
                <Select value={inviteRole} onValueChange={(value) => setInviteRole(value as 'Lecteur' | 'Éditeur')}>
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lecteur">
                      <div className="flex items-center">
                        <Eye className="w-4 h-4 mr-2" />
                        Lecteur - Peut consulter le projet
                      </div>
                    </SelectItem>
                    <SelectItem value="Éditeur">
                      <div className="flex items-center">
                        <Edit className="w-4 h-4 mr-2" />
                        Éditeur - Peut modifier le projet
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="projects">Projets</Label>
                <MultiSelect
                  options={userProjects.map(project => ({
                    value: project.project_id,
                    label: (
                      <div className="flex items-center gap-2">
                        <FolderSearch className="w-4 h-4" />
                        {project.nom_projet}
                      </div>
                    ),
                  }))}
                  value={inviteProjects}
                  onChange={setInviteProjects}
                  placeholder="Sélectionner les projets..."
                />
              </div>
            </div>
            <DialogFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsInviteModalOpen(false)} className="mr-2 flex-1">
                Annuler
              </Button>
              <Button onClick={handleInvite} className="flex-1">
                Envoyer l'invitation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Coming Soon Dialog */}
        <ComingSoonDialog
          isOpen={isComingSoonOpen}
          onClose={() => setIsComingSoonOpen(false)}
          description="La fonctionnalité d'invitation de collaborateurs sera bientôt disponible. Restez à l'écoute pour les mises à jour !"
        />
      </div>
    </ProjectRequiredGuard>
  );
};

export default ProjectBusiness;
