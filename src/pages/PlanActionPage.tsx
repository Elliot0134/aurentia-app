import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from "@/integrations/supabase/client";
import { useProject } from "@/contexts/ProjectContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import SimpleTeamTable from "@/components/ui/SimpleTeamTable";
import ProgressDots from '@/components/onboarding/ProgressDots';
import { format } from "date-fns";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { fr } from "date-fns/locale";
import { CalendarIcon, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Import des nouveaux composants du plan d'action
import { useActionPlanData, HierarchicalElement } from "@/hooks/useActionPlanData";
import ActionPlanClassification from "@/components/actionplan/ActionPlanClassification";
import ActionPlanLivrables from "@/components/actionplan/ActionPlanLivrables";
import ActionPlanHierarchy from "@/components/actionplan/ActionPlanHierarchy";
import ActionPlanModal from "@/components/actionplan/ActionPlanModal";
import ProjectRequiredGuard from '@/components/ProjectRequiredGuard';
import { useUserRole } from '@/hooks/useUserRole'; // Import useUserRole

const PlanActionPage = () => {
  const navigate = useNavigate();
  const { projectId: urlProjectId } = useParams();
  const { currentProjectId, userProjects, userProjectsLoading } = useProject(); // Add userProjectsLoading
  const { userRole } = useUserRole(); // Get user role
  const activeProjectId = currentProjectId || urlProjectId || (userProjects.length > 0 ? userProjects[0].project_id : null);

  const [statusActionPlan, setStatusActionPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false); // Initialisé à false, sera géré par useEffect
  const [showWarning, setShowWarning] = useState(false);
  const [showInfoPopup, setShowInfoPopup] = useState(false);

  // États pour le plan d'action
  const [selectedElement, setSelectedElement] = useState<HierarchicalElement | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // État local pour les mises à jour optimistes de statut
  const [localStatusUpdates, setLocalStatusUpdates] = useState<Record<string, string>>({});

  // Hook pour récupérer les données du plan d'action
  const { data: actionPlanData, isLoading: actionPlanLoading, error: actionPlanError, refetch: refetchActionPlan } = useActionPlanData(
    statusActionPlan === 'Terminé' ? activeProjectId : null
  );

  // Fusionner les données du serveur avec les mises à jour locales
  const mergedActionPlanData = actionPlanData ? {
    ...actionPlanData,
    hierarchicalData: actionPlanData.hierarchicalData.map(element => ({
      ...element,
      statut: (localStatusUpdates[element.element_id] as 'À faire' | 'En cours' | 'Terminé') || element.statut
    }))
  } : null;

  // Get current step from URL params (source of truth)
  const [searchParams, setSearchParams] = useSearchParams();
  const stepFromUrl = parseInt(searchParams.get('step') || '1');
  const currentStep = stepFromUrl >= 1 && stepFromUrl <= 5 ? stepFromUrl : 1;

  // Function to update step in URL
  const updateCurrentStep = (step: number) => {
    const newParams = new URLSearchParams(searchParams);
    if (step && step !== 1) {
      newParams.set('step', String(step));
    } else {
      newParams.delete('step');
    }
    setSearchParams(newParams);
  };

  // Navigation direction for framer-motion
  const [direction, setDirection] = useState(0);

  const [formData, setFormData] = useState({
    // 1. ÉQUIPE & DISPONIBILITÉ
    teamMembers: [{ person: '', role: [], timeAvailable: '' }],
    // 2. BUDGET & APPROCHE
    budget: 0,
    investmentStyle: '',
    // 3. TIMING & URGENCE
    launchDate: null as Date | null,
    urgencyLevel: '',
    // 4. VOTRE STYLE DE TRAVAIL
    riskTaking: 50,
    preferredMethod: '',
    // 5. CE QUE VOUS AVEZ DÉJÀ
    resources: '',
  });

  const totalSteps = 5;

  const stepTitles = [
    "Équipe & Disponibilité",
    "Budget & Approche",
    "Timing & Urgence",
    "Style de travail",
    "Ressources disponibles"
  ];

  const handleTeamMemberChange = (index: number, field: string, value: any) => {
    const newTeamMembers = [...formData.teamMembers];
    (newTeamMembers[index] as any)[field] = value;
    setFormData({ ...formData, teamMembers: newTeamMembers });
  };

  const addTeamMember = () => {
    setFormData({
      ...formData,
      teamMembers: [...formData.teamMembers, { person: '', role: [], timeAvailable: '' }],
    });
  };

  const removeTeamMember = (index: number) => {
    const newTeamMembers = formData.teamMembers.filter((_, i) => i !== index);
    setFormData({ ...formData, teamMembers: newTeamMembers });
  };


  const handleNext = () => {
    if (currentStep < totalSteps) {
      setDirection(1);
      updateCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setDirection(-1);
      updateCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    if (!activeProjectId) {
      alert('Aucun projet sélectionné.');
      return;
    }

    try {
      // Contournement temporaire de l'erreur de typage
      const { error } = await supabase
        .from('project_summary' as any)
        .update({ status_action_plan: 'En cours' as any } as any)
        .eq('project_id', activeProjectId);

      if (error) throw error;

      // Send form data to webhook
      const payload = {
        project_id: activeProjectId,
        ...formData,
        launchDate: formData.launchDate ? formData.launchDate.toISOString() : null,
      };

      const response = await fetch('https://n8n.srv906204.hstgr.cloud/webhook/action-plan-responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.warn('Webhook failed, but continuing...');
      }

      setStatusActionPlan('En cours');
      setShowForm(false);
      alert('Plan d\'action généré avec succès ! Le statut a été mis à jour en "En cours".');
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour:', err);
      alert('Erreur lors de la génération du plan d\'action.');
    }
  };

  const handleGeneratePlanClick = () => {
    setShowWarning(true);
  };

  const handleConfirmWarning = () => {
    setShowWarning(false);
    setShowForm(true);
  };

  // Fonctions pour gérer la modal du plan d'action
  const handleElementClick = (element: HierarchicalElement) => {
    setSelectedElement(element);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedElement(null);
  };

  const handleStatusChange = async (elementId: string, newStatus: string) => {
    try {
      console.log('🔄 Mise à jour optimiste du statut:', { elementId, newStatus });
      
      // Mise à jour optimiste immédiate de l'affichage
      setLocalStatusUpdates(prev => ({
        ...prev,
        [elementId]: newStatus
      }));
      
      // Mise à jour en base de données en arrière-plan
      const { data, error } = await (supabase as any)
        .schema('action_plan')
        .from('taches')
        .update({
          statut: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('tache_id', elementId);

      if (error) {
        console.error("❌ Erreur lors de la mise à jour en base:", error);
        // En cas d'erreur, annuler la mise à jour optimiste
        setLocalStatusUpdates(prev => {
          const newUpdates = { ...prev };
          delete newUpdates[elementId];
          return newUpdates;
        });
        return;
      }

      console.log('✅ Statut mis à jour en base avec succès');
      
    } catch (err: any) {
      console.error("💥 Erreur inattendue:", err);
      // En cas d'erreur, annuler la mise à jour optimiste
      setLocalStatusUpdates(prev => {
        const newUpdates = { ...prev };
        delete newUpdates[elementId];
        return newUpdates;
      });
    }
  };

  // Vérifier si on doit afficher le plan d'action complet
  const shouldShowActionPlan = statusActionPlan === 'Terminé';

  // Move useEffect to the top with other hooks
  useEffect(() => {
    const fetchStatusActionPlan = async () => {
      if (!activeProjectId) {
        setError("Aucun projet sélectionné.");
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('project_summary')
          .select('status_action_plan')
          .eq('project_id', activeProjectId)
          .single();

        if (error) {
          console.warn("Could not fetch status_action_plan, assuming it's empty or column does not exist:", error.message);
          setStatusActionPlan(null);
        } else {
          const fetchedStatus = (data as any)?.status_action_plan || null;
          setStatusActionPlan(fetchedStatus);
        }
      } catch (err: any) {
        console.error("Erreur lors de la récupération du status_action_plan:", err.message);
        setError("Erreur lors du chargement du plan d'action.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatusActionPlan();
  }, [activeProjectId]);

  const getStepContent = (step = currentStep) => {
    switch (step) {
      case 1:
        return (
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Équipe & Disponibilité</h2>
              <p className="text-gray-600 mt-2">Définissez les membres de votre équipe et leurs rôles</p>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <SimpleTeamTable
                  teamMembers={formData.teamMembers}
                  onTeamMemberChange={handleTeamMemberChange}
                  onAddTeamMember={addTeamMember}
                  onRemoveTeamMember={removeTeamMember}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Budget & Approche</h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="block text-base md:text-lg text-gray-800">
                  Budget total : <span className="font-semibold">{formData.budget}€</span>
                </label>
                <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                  <Slider
                    min={0}
                    max={200000}
                    step={1000}
                    value={[formData.budget]}
                    onValueChange={(value) => setFormData({ ...formData, budget: value[0] })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-4">
                    <span>0€</span>
                    <span>200 000€</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-base md:text-lg text-gray-800">
                  Façon de dépenser
                </label>
                <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                  <RadioGroup
                    value={formData.investmentStyle}
                    onValueChange={(value) => setFormData({ ...formData, investmentStyle: value })}
                    className="flex flex-col space-y-3"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="econome" id="econome" />
                      <label htmlFor="econome" className="text-base font-normal cursor-pointer">Économe (on cherche les solutions pas chères)</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="equilibre" id="equilibre" />
                      <label htmlFor="equilibre" className="text-base font-normal cursor-pointer">Équilibré (on investit quand c'est utile)</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="ambitieux" id="ambitieux" />
                      <label htmlFor="ambitieux" className="text-base font-normal cursor-pointer">Ambitieux (on investit pour aller plus vite)</label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Timing & Urgence</h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="block text-base md:text-lg text-gray-800">
                  Date souhaitée de lancement
                </label>
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal bg-white border-gray-300 hover:bg-gray-50 hover:text-gray-900 focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]",
                          !formData.launchDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.launchDate ? format(formData.launchDate, "PPP", { locale: fr }) : <span>Sélectionnez une date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.launchDate || undefined}
                        onSelect={(date) => setFormData({ ...formData, launchDate: date || null })}
                        initialFocus
                        locale={fr}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-base md:text-lg text-gray-800">
                  Niveau d'urgence
                </label>
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <Select
                    value={formData.urgencyLevel}
                    onValueChange={(value) => setFormData({ ...formData, urgencyLevel: value })}
                  >
                    <SelectTrigger className="w-full bg-white border-gray-300 focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]">
                      <SelectValue placeholder="Sélectionnez le niveau d'urgence" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pas_presse">Pas pressé</SelectItem>
                      <SelectItem value="rythme_normal">Rythme normal</SelectItem>
                      <SelectItem value="assez_urgent">Assez urgent</SelectItem>
                      <SelectItem value="tres_urgent">Très urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Style de travail</h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="block text-base md:text-lg text-gray-800">
                  Prise de risque : <span className="font-semibold">{formData.riskTaking}%</span>
                </label>
                <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                  <div className="flex justify-between text-sm text-gray-500 mb-4">
                    <span>Prudent</span>
                    <span>Fonceur</span>
                  </div>
                  <Slider
                    min={0}
                    max={100}
                    step={1}
                    value={[formData.riskTaking]}
                    onValueChange={(value) => setFormData({ ...formData, riskTaking: value[0] })}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-base md:text-lg text-gray-800">
                  Comment aimez-vous avancer ?
                </label>
                <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                  <RadioGroup
                    value={formData.preferredMethod}
                    onValueChange={(value) => setFormData({ ...formData, preferredMethod: value })}
                    className="flex flex-col space-y-3"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="tout_preparer" id="tout_preparer" />
                      <label htmlFor="tout_preparer" className="text-base font-normal cursor-pointer">Tout préparer (on lance quand c'est parfait)</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="tester_rapidement" id="tester_rapidement" />
                      <label htmlFor="tester_rapidement" className="text-base font-normal cursor-pointer">Tester rapidement (on lance vite et on améliore)</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="suivre_chiffres" id="suivre_chiffres" />
                      <label htmlFor="suivre_chiffres" className="text-base font-normal cursor-pointer">Suivre les chiffres (on décide avec les données)</label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Ressources disponibles</h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="block text-base md:text-lg text-gray-800">
                  Décrivez les ressources dont vous disposez
                </label>
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <Textarea
                    className="w-full p-3 text-base md:text-lg border-0 focus:ring-2 focus:ring-[#FF6B35] rounded-lg transition-all h-48 resize-y"
                    placeholder="Décrivez les ressources que vous disposez actuellement (sites internet, graphiques, produit fini, prototype, fournisseurs, etc.)"
                    value={formData.resources}
                    onChange={(e) => setFormData({ ...formData, resources: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Afficher le popup "Que l'aventure commence !" si aucun projet n'est sélectionné
  if (userProjectsLoading) {
    return <LoadingSpinner message="Chargement..." fullScreen />;
  }

  if (!activeProjectId) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] animate-popup-appear">
        <div className="container mx-auto px-4 py-8 text-center bg-white p-8 rounded-lg shadow-lg max-w-lg w-[90vw]">
          <h2 className="text-3xl font-bold mb-4 text-gray-800">Que l'aventure commence !</h2>
          <p className="text-gray-600 mb-6 text-lg">Créez un nouveau projet pour découvrir tout le potentiel de votre idée.</p>
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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen animate-fade-in">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Chargement du statut du plan d'action...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen animate-fade-in">
        <div className="flex justify-center items-center h-64">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  // Si le formulaire est affiché, utiliser le layout du formulaire de création de projet
  if (showForm) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-between py-12 px-4 pb-32 md:pb-12">
        {/* Main content - Centered */}
        <div className="flex-1 flex items-center justify-center w-full pb-8 md:pb-0">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={{
                enter: (direction: number) => ({
                  x: direction > 0 ? 50 : -50,
                  opacity: 0,
                  filter: 'blur(10px)',
                }),
                center: {
                  x: 0,
                  opacity: 1,
                  filter: 'blur(0px)',
                },
                exit: (direction: number) => ({
                  x: direction < 0 ? 50 : -50,
                  opacity: 0,
                  filter: 'blur(10px)',
                }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 200, damping: 25 },
                opacity: { duration: 0.5, ease: 'easeInOut' },
                filter: { duration: 0.5, ease: 'easeInOut' },
              }}
              className="w-full"
            >
              {getStepContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom controls */}
        <div className="w-full max-w-4xl mx-auto mt-8 md:mt-12 space-y-8">
          {/* Navigation buttons */}
          <div className="md:flex md:items-center md:justify-center md:gap-4">
            {/* MOBILE: Circle button on right with back button */}
            <div className="md:hidden fixed bottom-8 left-0 right-0 z-50 px-6">
              <motion.div
                className="flex items-center justify-end gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                {currentStep > 1 && (
                  <motion.button
                    onClick={handlePrevious}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                    whileTap={{ scale: 0.9 }}
                    className="flex items-center justify-center mb-1"
                  >
                    <ChevronLeft className="w-9 h-9 text-gray-400" strokeWidth={2.5} />
                  </motion.button>
                )}

                <motion.button
                  onClick={currentStep === totalSteps ? handleSubmit : handleNext}
                  className="relative"
                  whileTap={{ scale: 0.92 }}
                >
                  {/* Mobile: Circle button with progressive fill */}
                  <span className="flex items-center justify-center w-16 h-16 rounded-full shadow-xl transition-all duration-200 relative overflow-hidden">
                    {/* Gray background */}
                    <span className="absolute inset-0 bg-gray-200 rounded-full" />

                    {/* Orange fill from bottom to top */}
                    <motion.span
                      className="absolute inset-0 bg-gradient-to-t from-[#FF6B35] to-[#FF8A5B] rounded-full"
                      initial={{ height: '0%' }}
                      animate={{ height: `${(currentStep / totalSteps) * 100}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      style={{ bottom: 0, top: 'auto' }}
                    />

                    {/* Ambient wave animation - continuous */}
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: 'radial-gradient(circle at 50% 120%, rgba(255,255,255,0.3) 0%, transparent 70%)',
                      }}
                      animate={{
                        scale: [1, 1.4, 1],
                        opacity: [0.3, 0.6, 0.3],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: 'radial-gradient(circle at 50% 120%, rgba(255,255,255,0.2) 0%, transparent 60%)',
                      }}
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.2, 0.5, 0.2],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: 0.5,
                      }}
                    />

                    {/* Arrow icon */}
                    {currentStep === totalSteps ? (
                      <CheckCircle className="w-8 h-8 relative z-10 text-white drop-shadow-sm" strokeWidth={2.5} />
                    ) : (
                      <ChevronRight className="w-8 h-8 relative z-10 text-white drop-shadow-sm" strokeWidth={2.5} />
                    )}
                  </span>
                </motion.button>
              </motion.div>
            </div>

            {/* DESKTOP: Normal layout */}
            {currentStep > 1 && (
              <motion.button
                onClick={handlePrevious}
                className="hidden md:flex items-center gap-2 text-gray-400 hover:text-gray-600 font-medium px-6 py-2.5 rounded-lg transition-all duration-200"
                whileHover={{ x: -4 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronLeft className="w-4 h-4" />
                Retour
              </motion.button>
            )}

            <motion.button
              onClick={currentStep === totalSteps ? handleSubmit : handleNext}
              className="hidden md:flex items-center relative overflow-hidden bg-[#FF6B35] hover:bg-[#FF5722] text-white px-10 py-3 text-base font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.span className="relative z-10">
                {currentStep === totalSteps ? 'Générer le plan d\'action' : 'Continuer'}
              </motion.span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: '-100%' }}
                whileHover={{
                  x: '100%',
                  transition: { duration: 0.6, ease: 'easeInOut' },
                }}
              />
            </motion.button>
          </div>

          {/* Progress dots - Hidden on mobile, visible on desktop */}
          <div className="hidden md:block">
            <ProgressDots totalSteps={totalSteps} currentStep={currentStep} />
          </div>
        </div>

        {/* Dialogs */}
        {/* Dialog d'avertissement */}
        <Dialog open={showWarning} onOpenChange={setShowWarning}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-gray-800">Attention !</DialogTitle>
              <DialogDescription className="text-gray-600">
                Écrivez bien, répondez le plus possible aux questions. Au plus vous répondez aux questions, au plus vous écrivez, au plus précis sera le plan d'action et correspondra à vos attentes.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowWarning(false)}
              >
                Annuler
              </Button>
              <Button
                onClick={handleConfirmWarning}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                Continuer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog d'information */}
        <Dialog open={showInfoPopup} onOpenChange={setShowInfoPopup}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-800 mb-2">
                Qu'est-ce que le Plan d'Action ?
              </DialogTitle>
              <DialogDescription className="text-base text-gray-700 space-y-4">
                <p className="leading-relaxed">
                  Le Plan d'Action est votre feuille de route personnalisée pour transformer votre idée en réalité.
                  Il s'adapte à votre situation unique : votre équipe, votre budget, vos délais et votre style de travail.
                </p>

                <div className="space-y-3 pt-2">
                  <h3 className="text-lg font-semibold text-gray-800">📋 Ce qu'il contient :</h3>

                  <div className="pl-4 space-y-3">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">🎯 Classification de votre projet</h4>
                      <p className="text-sm text-gray-600">
                        Une analyse de votre projet pour identifier son profil et ses caractéristiques spécifiques.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">📦 Livrables recommandés</h4>
                      <p className="text-sm text-gray-600">
                        Les documents et éléments clés à créer pour structurer votre projet (personas, business model, pitch, etc.).
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">🗂️ Hiérarchie d'actions structurées</h4>
                      <p className="text-sm text-gray-600">
                        Un découpage en <strong>phases</strong>, <strong>jalons</strong> et <strong>tâches</strong> concrètes pour avancer étape par étape.
                      </p>
                      <ul className="list-disc list-inside text-sm text-gray-600 mt-2 pl-2 space-y-1">
                        <li><strong>Phases</strong> : Les grandes étapes de votre projet</li>
                        <li><strong>Jalons</strong> : Les objectifs intermédiaires à atteindre</li>
                        <li><strong>Tâches</strong> : Les actions concrètes à réaliser au quotidien</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 mt-4 border border-orange-200">
                  <p className="text-sm text-gray-700 font-medium">
                    💡 <strong>Conseil :</strong> Pour obtenir un plan d'action le plus précis possible,
                    prenez le temps de répondre en détail au questionnaire. Plus vos réponses seront complètes,
                    plus votre plan sera adapté à votre situation.
                  </p>
                </div>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex justify-end">
              <Button
                onClick={() => setShowInfoPopup(false)}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
              >
                J'ai compris
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Layout normal pour les autres états
  return (
    <ProjectRequiredGuard>
      <div className="container mx-auto px-4 py-8 min-h-screen animate-fade-in">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">Plan d'action</h1>
                <p className="text-gray-600 text-base">
                  Découvrez les étapes clés pour concrétiser votre projet.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  className="bg-white border border-gray-200 hover:bg-gray-50"
                  onClick={() => setShowInfoPopup(true)}
                >
                  En savoir +
                </Button>
              </div>
            </div>
          </div>

          {/* Condition 1: Statut vide (null) */}
          {statusActionPlan === null && !showForm && (
            <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg p-6 text-center shadow-sm border border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Générer un plan d'action</h2>
              <p className="text-gray-600 text-base mb-6">
                Votre plan d'action n'a pas encore été généré. Cliquez sur le bouton ci-dessous pour commencer.
              </p>
              <Button
                style={{ backgroundColor: '#ff5932' }}
                className="hover:opacity-90 text-white px-8 py-4 text-lg"
                onClick={handleGeneratePlanClick}
              >
                Générer le plan d'action
              </Button>
            </div>
          )}

          {/* Dialog d'avertissement (pour l'état non-formulaire) */}
          <Dialog open={showWarning} onOpenChange={setShowWarning}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold text-gray-800">Attention !</DialogTitle>
                <DialogDescription className="text-gray-600">
                  Écrivez bien, répondez le plus possible aux questions. Au plus vous répondez aux questions, au plus vous écrivez, au plus précis sera le plan d'action et correspondra à vos attentes.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowWarning(false)}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleConfirmWarning}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Continuer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Dialog d'information (pour l'état non-formulaire) */}
          <Dialog open={showInfoPopup} onOpenChange={setShowInfoPopup}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-gray-800 mb-2">
                  Qu'est-ce que le Plan d'Action ?
                </DialogTitle>
                <DialogDescription className="text-base text-gray-700 space-y-4">
                  <p className="leading-relaxed">
                    Le Plan d'Action est votre feuille de route personnalisée pour transformer votre idée en réalité.
                    Il s'adapte à votre situation unique : votre équipe, votre budget, vos délais et votre style de travail.
                  </p>

                  <div className="space-y-3 pt-2">
                    <h3 className="text-lg font-semibold text-gray-800">📋 Ce qu'il contient :</h3>

                    <div className="pl-4 space-y-3">
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-1">🎯 Classification de votre projet</h4>
                        <p className="text-sm text-gray-600">
                          Une analyse de votre projet pour identifier son profil et ses caractéristiques spécifiques.
                        </p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-800 mb-1">📦 Livrables recommandés</h4>
                        <p className="text-sm text-gray-600">
                          Les documents et éléments clés à créer pour structurer votre projet (personas, business model, pitch, etc.).
                        </p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-800 mb-1">🗂️ Hiérarchie d'actions structurées</h4>
                        <p className="text-sm text-gray-600">
                          Un découpage en <strong>phases</strong>, <strong>jalons</strong> et <strong>tâches</strong> concrètes pour avancer étape par étape.
                        </p>
                        <ul className="list-disc list-inside text-sm text-gray-600 mt-2 pl-2 space-y-1">
                          <li><strong>Phases</strong> : Les grandes étapes de votre projet</li>
                          <li><strong>Jalons</strong> : Les objectifs intermédiaires à atteindre</li>
                          <li><strong>Tâches</strong> : Les actions concrètes à réaliser au quotidien</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 mt-4 border border-orange-200">
                    <p className="text-sm text-gray-700 font-medium">
                      💡 <strong>Conseil :</strong> Pour obtenir un plan d'action le plus précis possible,
                      prenez le temps de répondre en détail au questionnaire. Plus vos réponses seront complètes,
                      plus votre plan sera adapté à votre situation.
                    </p>
                  </div>
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex justify-end">
                <Button
                  onClick={() => setShowInfoPopup(false)}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                >
                  J'ai compris
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Condition 2: Statut "En cours" */}
          {statusActionPlan === 'En cours' && (
            <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg p-6 text-center shadow-sm border border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Création de votre plan d'action personnalisé en cours...</h2>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aurentia-orange"></div>
            </div>
          )}
          
          {/* Condition 3: Statut "Terminé" */}
          {statusActionPlan === 'Terminé' && (
            <div className="space-y-6">
              {actionPlanLoading && (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aurentia-orange"></div>
                  <span className="ml-3 text-gray-600">Chargement du plan d'action...</span>
                </div>
              )}

              {actionPlanError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800">Erreur lors du chargement : {actionPlanError}</p>
                </div>
              )}

              {!actionPlanLoading && !actionPlanError && mergedActionPlanData && (
                <>
                  {/* Section 1: Classification du projet */}
                  <ActionPlanClassification
                    userResponses={mergedActionPlanData.userResponses}
                    classificationProjet={mergedActionPlanData.classificationProjet}
                  />

                  {/* Section 2: Livrables */}
                  <ActionPlanLivrables
                    livrables={mergedActionPlanData.livrables}
                  />

                  {/* Section 3: Hiérarchie Phases → Jalons → Tâches */}
                  <ActionPlanHierarchy
                    hierarchicalData={mergedActionPlanData.hierarchicalData}
                    onElementClick={handleElementClick}
                    onEdit={(element) => {
                      // Convertir l'élément modifié en appel de changement de statut
                      const originalElement = mergedActionPlanData.hierarchicalData.find(e => e.element_id === element.element_id);
                      if (originalElement && element.statut !== originalElement.statut) {
                        handleStatusChange(element.element_id, element.statut);
                      }
                    }}
                  />

                  {/* Modal de détails */}
                  <ActionPlanModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    element={selectedElement}
                  />
                </>
              )}
            </div>
          )}

          {/* Ce bloc n'est plus nécessaire si les 3 conditions ci-dessus sont exhaustives */}
          {/* {statusActionPlan && statusActionPlan !== 'En cours' && statusActionPlan !== 'Terminé' && !showForm && (
            <div className="flex justify-center items-center h-64">
              <p className="text-gray-600">Votre plan d'action est : {statusActionPlan}</p>
            </div>
          )} */}
        </div>
      </div>
    </ProjectRequiredGuard>
  );
};

export default PlanActionPage;
