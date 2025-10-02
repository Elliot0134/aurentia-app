import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { format } from "date-fns";
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
  
  // Navigation states
  const [currentStep, setCurrentStep] = useState(1);
  const [slideDirection, setSlideDirection] = useState('next');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [previousStep, setPreviousStep] = useState(currentStep);

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
      setSlideDirection('next');
      setIsTransitioning(true);
      setPreviousStep(currentStep);
      
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, 50);
      
      setTimeout(() => {
        setIsTransitioning(false);
      }, 350);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setSlideDirection('prev');
      setIsTransitioning(true);
      setPreviousStep(currentStep);
      
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
      }, 50);
      
      setTimeout(() => {
        setIsTransitioning(false);
      }, 350);
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

  const getStepContent = (step = currentStep) => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Équipe & Disponibilité</h2>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <span className="text-2xl">👥</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Équipe du projet</h3>
                    <p className="text-sm text-gray-600">Définissez les membres de votre équipe et leurs rôles</p>
                  </div>
                </div>
                
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
          <div className="space-y-4">
            <div className="text-center mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Budget & Approche</h2>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                <label className="block text-base md:text-lg font-semibold text-gray-800 mb-4">
                  💰 Budget total : {formData.budget}€
                </label>
                <div className="bg-white rounded-lg p-4">
                  <Slider
                    min={0}
                    max={200000}
                    step={1000}
                    value={[formData.budget]}
                    onValueChange={(value) => setFormData({ ...formData, budget: value[0] })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <span>0€</span>
                    <span>200 000€</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                <label className="block text-base md:text-lg font-semibold text-gray-800 mb-4">
                  🎯 Façon de dépenser
                </label>
                <div className="bg-white rounded-lg p-4">
                  <RadioGroup
                    value={formData.investmentStyle}
                    onValueChange={(value) => setFormData({ ...formData, investmentStyle: value })}
                    className="flex flex-col space-y-3"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="econome" id="econome" />
                      <label htmlFor="econome" className="text-base font-normal">💰 Économe (on cherche les solutions pas chères)</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="equilibre" id="equilibre" />
                      <label htmlFor="equilibre" className="text-base font-normal">⚖️ Équilibré (on investit quand c'est utile)</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="ambitieux" id="ambitieux" />
                      <label htmlFor="ambitieux" className="text-base font-normal">🚀 Ambitieux (on investit pour aller plus vite)</label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Timing & Urgence</h2>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200">
                <label className="block text-base md:text-lg font-semibold text-gray-800 mb-4">
                  📅 Date souhaitée de lancement
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal bg-white border-gray-300 focus:border-orange-500 hover:bg-gray-50 hover:text-gray-900",
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

              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg p-4 border border-yellow-200">
                <label className="block text-base md:text-lg font-semibold text-gray-800 mb-4">
                  ⚡ Niveau d'urgence
                </label>
                <Select
                  value={formData.urgencyLevel}
                  onValueChange={(value) => setFormData({ ...formData, urgencyLevel: value })}
                >
                  <SelectTrigger className="w-full bg-white border-gray-300 focus:border-yellow-500">
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
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Style de travail</h2>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4 border border-indigo-200">
                <label className="block text-base md:text-lg font-semibold text-gray-800 mb-4">
                  🎲 Prise de risque : {formData.riskTaking}%
                </label>
                <div className="bg-white rounded-lg p-4">
                  <div className="flex justify-between text-sm text-gray-500 mb-2">
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

              <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-lg p-4 border border-rose-200">
                <label className="block text-base md:text-lg font-semibold text-gray-800 mb-4">
                  🚀 Comment aimez-vous avancer ?
                </label>
                <div className="bg-white rounded-lg p-4">
                  <RadioGroup
                    value={formData.preferredMethod}
                    onValueChange={(value) => setFormData({ ...formData, preferredMethod: value })}
                    className="flex flex-col space-y-3"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="tout_preparer" id="tout_preparer" />
                      <label htmlFor="tout_preparer" className="text-base font-normal">🎯 Tout préparer (on lance quand c'est parfait)</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="tester_rapidement" id="tester_rapidement" />
                      <label htmlFor="tester_rapidement" className="text-base font-normal">⚡ Tester rapidement (on lance vite et on améliore)</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="suivre_chiffres" id="suivre_chiffres" />
                      <label htmlFor="suivre_chiffres" className="text-base font-normal">📊 Suivre les chiffres (on décide avec les données)</label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="text-center mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Ressources disponibles</h2>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg p-4 border border-violet-200">
                <label className="block text-base md:text-lg font-semibold text-gray-800 mb-4">
                  📝 Ressources disponibles
                </label>
                <div className="bg-white rounded-lg p-4">
                  <Textarea
                    className="w-full p-3 text-base md:text-lg border-2 border-gray-200 rounded-lg focus:border-slate-500 focus:outline-none transition-colors h-48 resize-y"
                    placeholder="Décrivrez les ressources que vous disposez actuellement (sites internet, chaque graphique, produit fini, prototype, fournisseur, etc.)"
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
    return <div>Chargement...</div>; // Ou un composant de chargement
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
                <Button variant="secondary" className="bg-white border border-gray-200 hover:bg-gray-50">
                  En savoir +
                </Button>
              </div>
            </div>
          </div>

          {/* Condition 1: Statut vide (null) */}
          {statusActionPlan === null && (
            <>
              {!showForm && ( // Affiche le prompt initial si le formulaire n'est pas encore affiché
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
              {showForm && ( // Affiche le questionnaire si showForm est true
                <div className="min-h-screen bg-[#F8F6F1] flex flex-col md:justify-center py-10 container mx-auto px-4">
                  {/* Header */}
                  <div className="text-center">
                    <h1 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                      Questionnaire Plan d'Action
                    </h1>
                    <p className="text-gray-600 text-base mb-6">Répondez aux questions suivantes pour générer votre plan d'action personnalisé</p>

                    {/* Progress Bar */}
                    <div className="max-w-4xl mx-auto mb-8">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-gray-500">Étape {currentStep} sur {totalSteps}</span>
                        <span className="text-sm font-medium text-gray-500">{Math.round((currentStep / totalSteps) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Form Content with Slide Animation */}
                    <div className="max-w-4xl mx-auto">
                      <div className="relative overflow-hidden min-h-[500px]">
                        {isTransitioning ? (
                          <>
                            {/* Previous content sliding out */}
                            <div 
                              className={`absolute inset-0 ${
                                slideDirection === 'next' ? 'animate-slide-out-left' : 'animate-slide-out-right'
                              }`}
                              style={{ willChange: 'transform' }}
                            >
                              <div className="p-4 md:p-6 text-left">
                                {getStepContent(previousStep)}
                              </div>
                            </div>
                            
                            {/* New content sliding in */}
                            <div 
                              className={`absolute inset-0 ${
                                slideDirection === 'next' ? 'animate-slide-in-right' : 'animate-slide-in-left'
                              }`}
                              style={{ willChange: 'transform' }}
                            >
                              <div className="p-4 md:p-6 text-left">
                                {getStepContent()}
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="p-4 md:p-6 text-left">
                            {getStepContent()}
                          </div>
                        )}
                      </div>

                      {/* Navigation Buttons */}
                      <div className="flex justify-between items-center mt-6 px-4 pb-[80px]">
                        <button
                          onClick={handlePrevious}
                          disabled={currentStep === 1}
                          className={`flex items-center space-x-2 px-4 py-2 rounded-full font-semibold transition-all duration-300 ${
                            currentStep === 1
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                          }`}
                        >
                          <ChevronLeft size={18} />
                          <span>Précédent</span>
                        </button>

                        {currentStep < totalSteps ? (
                          <button
                            onClick={handleNext}
                            className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-full font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                          >
                            <span>Suivant</span>
                            <ChevronRight size={18} />
                          </button>
                        ) : (
                          <button
                            onClick={handleSubmit}
                            className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-2 rounded-full font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                          >
                            <span>Générer le plan d'action</span>
                            <CheckCircle size={18} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* CSS for slide animations */}
                  <style>{`
                    .animate-slide-out-left {
                      animation: slide-out-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                      animation-fill-mode: forwards;
                    }
                    
                    .animate-slide-out-right {
                      animation: slide-out-right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                      animation-fill-mode: forwards;
                    }
                    
                    .animate-slide-in-left {
                      animation: slide-in-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                      animation-fill-mode: forwards;
                    }
                    
                    .animate-slide-in-right {
                      animation: slide-in-right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                      animation-fill-mode: forwards;
                    }
                    
                    @keyframes slide-out-left {
                      0% {
                        transform: translate3d(0, 0, 0);
                        opacity: 1;
                      }
                      100% {
                        transform: translate3d(-100%, 0, 0);
                        opacity: 0;
                      }
                    }
                    
                    @keyframes slide-out-right {
                      0% {
                        transform: translate3d(0, 0, 0);
                        opacity: 1;
                      }
                      100% {
                        transform: translate3d(100%, 0, 0);
                        opacity: 0;
                      }
                    }
                    
                    @keyframes slide-in-left {
                      0% {
                        transform: translate3d(-100%, 0, 0);
                        opacity: 0;
                      }
                      100% {
                        transform: translate3d(0, 0, 0);
                        opacity: 1;
                      }
                    }
                    
                    @keyframes slide-in-right {
                      0% {
                        transform: translate3d(100%, 0, 0);
                        opacity: 0;
                      }
                      100% {
                        transform: translate3d(0, 0, 0);
                        opacity: 1;
                      }
                    }
                  `}</style>
                </div>
              )}
            </>
          )}

          {/* Dialog d'avertissement (peut rester en dehors des conditions principales) */}
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
          
          {/* Condition 2: Statut "En cours" */}
          {statusActionPlan === 'En cours' && (
            <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg p-6 text-center shadow-sm border border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Création de votre plan d'action personnalisé en cours...</h2>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
          )}
          
          {/* Condition 3: Statut "Terminé" */}
          {statusActionPlan === 'Terminé' && (
            <div className="space-y-6">
              {actionPlanLoading && (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
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
                    onStatusChange={handleStatusChange}
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
