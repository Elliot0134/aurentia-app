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
import BlurredDeliverableWrapper from "@/components/deliverables/BlurredDeliverableWrapper"; // Import the new wrapper
import { supabase } from "@/integrations/supabase/client"; // Import Supabase client
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"; // Import Dialog components
import PlanCard from "@/components/ui/PlanCard"; // Import PlanCard component
import { useStripePayment } from "@/hooks/useStripePayment";
import { useProject } from "@/contexts/ProjectContext";

const ProjectBusiness = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [selectedPersonaExpress, setSelectedPersonaExpress] = useState<'Particulier' | 'Entreprise' | 'Organismes'>('Particulier');
  const [loading, setLoading] = useState(true); // Set loading to true initially
  const [project, setProject] = useState<{ nom_projet?: string; description_projet?: string } | null>(null); // State for project data
  const [projectStatus, setProjectStatus] = useState<string | null>(null); // State for project status
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupContent, setPopupContent] = useState<{ title: React.ReactNode; content: React.ReactNode; buttonColor?: string } | null>(null);
  
  // États pour le popup d'invitation
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'Lecteur' | 'Éditeur'>('Lecteur');
  const [inviteProjects, setInviteProjects] = useState<string[]>([]);
  
  // Stripe payment hook
  const { isLoading: isPaymentLoading, paymentStatus, initiatePayment } = useStripePayment();
  const { userProjects } = useProject();

  const handlePayment = async (planId: string) => {
    if (!projectId) {
      toast({
        title: "Erreur",
        description: "ID du projet manquant",
        variant: "destructive",
      });
      return;
    }
    
    await initiatePayment(planId, projectId);
  };

  const openPopup = (title: React.ReactNode, content: React.ReactNode, buttonColor?: string) => {
    setPopupContent({ title, content, buttonColor });
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setPopupContent(null);
  };

  const handleUnlockClick = () => {
    const commonDeliverables = [
      "Analyse concurrentielle",
      <>Analyse du marché <span className="text-gray-500 italic">(PESTEL)</span></>,
      "Proposition de valeur",
      "Business model",
      <>Analyse des ressources requises <span className="text-gray-500 italic">(Impréssionant)</span></>,
    ];

    const niveau1Deliverables = commonDeliverables;
    const niveau2Deliverables = commonDeliverables;

    openPopup(
      <>
        Accédez à vos{" "}
        <span className="bg-clip-text text-transparent bg-gradient-primary">
          documents clés
        </span>{" "}
        et{" "}
        <span className="bg-clip-text text-transparent bg-gradient-primary">
          Aurentia AI
        </span>
      </>,
      <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch mt-8">
        <PlanCard
          title="Niveau 1"
          price="2,90€"
          oldPrice="12,90€"
          deliverables={niveau1Deliverables}
          buttonText="J'en profite !"
          pdfSection={
            <div className="bg-gray-100 p-3 rounded-lg text-gray-800 text-center font-bold flex items-center justify-center gap-2">
              PDF de votre projet
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Popover>
                      <PopoverTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-gray-500 cursor-pointer" />
                      </PopoverTrigger>
                      <PopoverContent className="sm:fixed sm:inset-0 sm:flex sm:items-center sm:justify-center sm:transform-none md:static md:translate-x-0 md:translate-y-0">
                        <p>Un PDF complet de votre projet</p>
                      </PopoverContent>
                    </Popover>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Un PDF complet de votre projet</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          }
          creditsSection={
            <div className="bg-gray-100 p-3 rounded-lg text-gray-800 text-center">
              <div className="flex items-center justify-center gap-2">
                <span className="font-bold">50 crédits Aurentia IA</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Popover>
                        <PopoverTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-gray-500 cursor-pointer" />
                        </PopoverTrigger>
                        <PopoverContent className="sm:fixed sm:inset-0 sm:flex sm:items-center sm:justify-center sm:transform-none md:static md:translate-x-0 md:translate-y-0">
                          <p>1 crédit = un message avec notre Agent IA connecté à votre projet</p>
                        </PopoverContent>
                      </Popover>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>1 crédit = un message avec notre Agent IA connecté à votre projet</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          }
          className="flex-1"
          onButtonClick={() => handlePayment('plan1')}
        />
        <PlanCard
          title="Niveau 2"
          price="6,90€"
          oldPrice="24,90€"
          deliverables={niveau2Deliverables}
          buttonText="J'en profite encore + !"
          onButtonClick={() => handlePayment('plan2')}
          pdfSection={
            <div className="bg-gray-100 p-3 rounded-lg text-gray-800 text-center font-bold flex items-center justify-center gap-2">
              PDF de votre projet
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Popover>
                      <PopoverTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-gray-500 cursor-pointer" />
                      </PopoverTrigger>
                      <PopoverContent className="sm:fixed sm:inset-0 sm:flex sm:items-center sm:justify-center sm:transform-none md:static md:translate-x-0 md:translate-y-0">
                        <p>Un PDF complet de votre projet</p>
                      </PopoverContent>
                    </Popover>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Un PDF complet de votre projet</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          }
          creditsSection={
            <div className="bg-gray-100 p-3 rounded-lg text-gray-800 text-center">
              <div className="flex items-center justify-center gap-2">
                <span className="font-bold">200 crédits Aurentia IA</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Popover>
                        <PopoverTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-gray-500 cursor-pointer" />
                        </PopoverTrigger>
                        <PopoverContent className="sm:fixed sm:inset-0 sm:flex sm:items-center sm:justify-center sm:transform-none md:static md:translate-x-0 md:translate-y-0">
                          <p>1 crédit = un message avec notre Agent IA connecté à votre projet</p>
                        </PopoverContent>
                      </Popover>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>1 crédit = un message avec notre Agent IA connecté à votre projet</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          }
          className="flex-1"
        />
      </div>
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
      }
      setLoading(false);
    };

    fetchProject();
  }, [projectId]); // Refetch when projectId changes

  if (loading) {
    return <div>Chargement...</div>; // Or a loading spinner component
  }

  if (!project) {
    return <div>Projet non trouvé.</div>; // Or an error message
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
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
              onClick={() => setIsInviteModalOpen(true)}
              className="flex items-center gap-2 bg-gradient-primary hover:opacity-90 transition-opacity w-full"
              size="sm"
            >
              <UserPlus size={16} />
              Inviter un collaborateur
            </Button>
          </div>
          <div className="flex flex-col w-full md:w-1/2 md:order-first">
            <div>
              <h1 className="text-2xl font-semibold">{project.nom_projet || "Projet sans nom"}</h1>
            </div>
          </div>
        </div>
        <p className="text-gray-600 text-sm mt-1 mb-6">{project.description_projet || "Aucune description"}</p>

        {/* Level 1 Deliverables */}
        <div className="grid grid-cols-12 gap-4 md:gap-5">
          {/* Retranscription du concept Deliverable */}
          <div className="col-span-12">
            <RetranscriptionConceptLivrable />
          </div>
          <div className="col-span-12 md:grid md:grid-cols-2 md:gap-5">
            <div className="col-span-12 md:col-span-1 md:h-full">
              <PersonaExpressLivrable />
            </div>
            <div className="col-span-12 md:col-span-1 md:h-full">
              <MiniSwotLivrable />
            </div>
          </div>
          <div className="col-span-12 md:grid md:grid-cols-2 md:gap-5 mt-4 md:mt-0">
            <div className="col-span-12 md:col-span-1 md:h-full">
              <MaSuccessStoryLivrable />
            </div>
            <div className="col-span-12 md:col-span-1 md:h-full">
              <PitchLivrable />
            </div>
          </div>
          <div className="col-span-12 md:grid md:grid-cols-2 md:gap-5 mt-4 md:mt-0">
            <div className="col-span-12 md:col-span-1 md:h-full">
              <VisionMissionValeursLivrable projectId={projectId} />
            </div>
          </div>
        </div>

        {/* Level 2 Deliverables */}
        {projectStatus === 'free' && (
          <div className="grid grid-cols-12 gap-4 md:gap-5 mt-8">
            <div className="col-span-12 text-center">
              <button className="btn-primary" onClick={handleUnlockClick}>Débloquer les prochains livrables</button>
            </div>
          </div>
        )}

        {/* Analyse de la Concurrence and Analyse de Marché Deliverables */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 mt-8 items-stretch">
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
        </div>

        {/* Level 3 Deliverables - Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 mt-8">
          {/* Proposition de Valeur Deliverable */}
          <div>
            <BlurredDeliverableWrapper isBlurred={projectStatus === 'free'} onUnlockClick={handleUnlockClick}>
              <PropositionDeValeurLivrable />
            </BlurredDeliverableWrapper>
          </div>

          {/* Business Model Deliverable */}
          <div>
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
        <div className="grid grid-cols-12 gap-4 md:gap-5 mt-8">
          <div className="col-span-12">
            <BlurredDeliverableWrapper isBlurred={projectStatus === 'free'} onUnlockClick={handleUnlockClick}>
              <AnalyseDesRessourcesLivrable />
            </BlurredDeliverableWrapper>
          </div>
        </div>
      </div>

      {/* Payment Loading Dialog */}
      <Dialog open={isPaymentLoading} onOpenChange={() => {}}>
        <DialogContent className="w-[95vw] max-w-[500px] rounded-lg sm:w-full" onEscapeKeyDown={(e) => e.preventDefault()} onInteractOutside={(e) => e.preventDefault()} hideCloseButton={true}>
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {paymentStatus === 'processing' ? '☕️ Une pause café ?' : 'Traitement du paiement'}
            </DialogTitle>
            <DialogDescription>
              {paymentStatus === 'processing' 
                ? <>La génération des livrables premium peut durer jusqu'à 10 minutes, dû à la chaîne de raisonnement et aux modèles IA de réflexion apporfondies utilisés. <br /><br /> En attendant, profitez-en pour vous faire un petit café car la suite de l'aventure ne sera sûrement pas de tout repos !</>
                : 'Traitement de votre paiement en cours...'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center items-center py-4">
            <div className="loader">
              <div className="circle"></div>
              <div className="circle"></div>
              <div className="circle"></div>
              <div className="square"></div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Popup Dialog */}
      <Dialog open={isPopupOpen} onOpenChange={setIsPopupOpen}>
        <DialogContent className="w-[90vw] md:w-[70vw] max-w-none overflow-y-auto max-h-[90vh] md:h-[90vh] rounded-lg md:flex md:flex-col md:justify-center md:items-center"> {/* Set width to 90% on mobile, 70% on desktop, remove max-width, add scrollability, and rounded corners */}
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold text-[#2D2D2D]">{popupContent?.title}</DialogTitle>
            <DialogDescription>
              <p className="text-center text-base mb-4">
                <span className="font-bold text-[#2D2D2D]">{project.nom_projet || "Votre projet"}</span> mérite d'exister. Débloquez tous les livrables clés pour créer votre projet sans erreur.
              </p>
              {popupContent?.content}
            </DialogDescription>
          </DialogHeader>
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

      {/* CSS for custom loader */}
      <style>{`
        .loader {
          position: relative;
          width: 50px;
          height: 50px;
        }
        
        .circle {
          position: absolute;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: linear-gradient(45deg, #f97316, #ef4444);
          animation: circle-animation 2s infinite ease-in-out;
        }
        
        .circle:nth-child(1) {
          top: 0;
          left: 0;
          animation-delay: 0s;
        }
        
        .circle:nth-child(2) {
          top: 0;
          right: 0;
          animation-delay: 0.5s;
        }
        
        .circle:nth-child(3) {
          bottom: 0;
          left: 0;
          animation-delay: 1s;
        }
        
        .square {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 10px;
          height: 10px;
          background: linear-gradient(45deg, #f97316, #ef4444);
          animation: square-animation 2s infinite ease-in-out;
          animation-delay: 1.5s;
        }
        
        @keyframes circle-animation {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }
        
        @keyframes square-animation {
          0%, 80%, 100% {
            transform: scale(0) rotate(0deg);
          }
          40% {
            transform: scale(1) rotate(180deg);
          }
        }
      `}</style>
    </div>
  );
};

export default ProjectBusiness;
