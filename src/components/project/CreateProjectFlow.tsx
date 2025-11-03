import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import ProgressDots from '@/components/onboarding/ProgressDots';
import { supabase } from '@/integrations/supabase/client';
import { useProject } from '@/contexts/ProjectContext';
import { ProjectCreationData } from '@/types/projectCreation';
import { useFreeDeliverableProgress } from '@/hooks/useFreeDeliverableProgress';
import FreeDeliverableProgressContainer from '@/components/deliverables/FreeDeliverableProgressContainer';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Import all step components
import StepBasicInfo from './slides/StepBasicInfo';
import StepProductsServices from './slides/StepProductsServices';
import StepClientele from './slides/StepClientele';
import StepNeeds from './slides/StepNeeds';
import StepTypeLocation from './slides/StepTypeLocation';
import StepTeam from './slides/StepTeam';
import StepAdditionalInfo from './slides/StepAdditionalInfo';
import StepConfirmation from './slides/StepConfirmation';
import StepRetranscription from './slides/StepRetranscription';

const STORAGE_KEY = 'aurentia-project-draft';

const CreateProjectFlow = () => {
  const navigate = useNavigate();
  const { loadUserProjects } = useProject();

  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<ProjectCreationData>({
    currentStep: 0,
    projectType: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingRetranscription, setIsLoadingRetranscription] = useState(false);

  // Organizations selection (for members)
  const [availableOrganizations, setAvailableOrganizations] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedOrganization, setSelectedOrganization] = useState<string>('');

  // Hook pour le suivi des livrables gratuits - actif au step 8 avec projectID
  const { deliverables } = useFreeDeliverableProgress(data.projectID || '', !!data.projectID && currentStep === 8);

  const totalSteps = 9;
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

  // Load draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(STORAGE_KEY);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setData(parsed);
        setCurrentStep(parsed.currentStep || 0);

        toast({
          title: 'Brouillon récupéré',
          description: 'Nous avons retrouvé votre projet en cours. Vous pouvez reprendre là où vous étiez.',
        });
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (data.projectName || data.projectIdeaSentence) {
      // Only save if there's actual data
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, currentStep }));
    }
  }, [data, currentStep]);

  // Clear localStorage on successful submission
  const clearDraft = () => {
    localStorage.removeItem(STORAGE_KEY);
  };

  // Update data
  const updateData = (field: keyof ProjectCreationData, value: any) => {
    setData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Load organizations
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) return;

        const { data: userProfile } = await supabase
          .from('profiles')
          .select('user_role, id')
          .eq('id', session.user.id)
          .single();

        if (userProfile?.user_role === 'member') {
          const { data: userOrg } = await supabase
            .from('user_organizations')
            .select('organization_id, organizations(id, name)')
            .eq('user_id', userProfile.id)
            .eq('status', 'active')
            .single();

          if (userOrg?.organizations) {
            setAvailableOrganizations([userOrg.organizations as any]);
            setSelectedOrganization((userOrg.organizations as any).id);
          }
        } else {
          const { data: orgs } = await supabase.from('organizations').select('id, name').eq('is_public', true).order('name');

          if (orgs) {
            setAvailableOrganizations(orgs);
          }
        }
      } catch (error) {
        console.error('Error loading organizations:', error);
      }
    };

    fetchOrganizations();
  }, []);

  // Can proceed to next step
  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return !!data.projectName && !!data.projectIdeaSentence;
      case 1:
        return !!data.productsServices && !!data.problemSolved;
      case 2:
        return !!data.clienteleCible;
      case 3:
        return !!data.needs;
      case 4:
        return !!data.projectType && (data.projectType === 'Digital' || (data.projectType && !!data.geographicArea));
      case 5:
        return !!data.teamSize;
      case 6:
        return true; // Optional fields
      case 7:
        return true; // Confirmation page
      case 8:
        return true; // Retranscription (pre-filled)
      default:
        return false;
    }
  };

  // Handle next
  const handleNext = async () => {
    if (!canProceed()) {
      toast({
        title: 'Information requise',
        description: 'Veuillez compléter cette étape avant de continuer.',
        variant: 'destructive',
      });
      return;
    }

    // STEP 7 → 8 : Appel webhook pour générer la retranscription
    if (currentStep === 7) {
      setIsLoadingRetranscription(true);

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const userId = session?.user?.id || null;

        const formData = {
          userId,
          projectName: data.projectName,
          projectIdeaSentence: data.projectIdeaSentence,
          productsServices: data.productsServices,
          problemSolved: data.problemSolved,
          clienteleCible: data.clienteleCible,
          needs: data.needs,
          projectType: data.projectType,
          geographicArea: data.projectType === 'Physique' || data.projectType === 'Les deux' ? data.geographicArea : '',
          additionalInfo: data.additionalInfo,
          whyEntrepreneur: data.whyEntrepreneur,
          teamSize: data.teamSize,
          organizationId: selectedOrganization === 'none' ? null : selectedOrganization || null,
        };

        console.log('📤 Sending to webhook:', formData);

        const response = await fetch('https://n8n.srv906204.hstgr.cloud/webhook/form-business-idea', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          const result = await response.json();
          const webhookData = result[0];

          if (webhookData) {
            setData((prev) => ({
              ...prev,
              descriptionSynthetique: webhookData.DescriptionSynthetique || '',
              produitServiceRetranscription: webhookData['Produit/Service'] || '',
              propositionValeur: webhookData.PropositionValeur || '',
              elementDistinctif: webhookData.ElementDistinctif || '',
              clienteleCibleRetranscription: webhookData.ClienteleCible || '',
              problemResoudreRetranscription: webhookData.ProblemResoudre || '',
              vision3Ans: webhookData.Vision3Ans || '',
              businessModel: webhookData.BusinessModel || '',
              competences: webhookData.Compétences || '',
              monPourquoiRetranscription: webhookData.MotivationEntrepreneur || '',
              equipeFondatrice: webhookData.EquipeFondatrice || '',
              projectID: webhookData.ProjectID || '',
            }));

            console.log('✅ Retranscription received, projectID:', webhookData.ProjectID);
          }
        } else {
          throw new Error(`Webhook responded with status ${response.status}`);
        }
      } catch (error) {
        console.error('❌ Error calling webhook:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de générer la retranscription. Veuillez réessayer.',
          variant: 'destructive',
        });
        setIsLoadingRetranscription(false);
        return; // Don't advance if error
      } finally {
        setIsLoadingRetranscription(false);
      }
    }

    // Advance to next step
    setCurrentStep((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle back
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle submit (final step)
  const handleSubmit = async () => {
    console.log('🚀 Final submission');
    setIsSubmitting(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userId = session?.user?.id || null;

      const finalData = {
        userId,
        projectID: data.projectID,
        projectName: data.projectName,
        descriptionSynthetique: data.descriptionSynthetique,
        produitServiceRetranscription: data.produitServiceRetranscription,
        propositionValeur: data.propositionValeur,
        elementDistinctif: data.elementDistinctif,
        clienteleCibleRetranscription: data.clienteleCibleRetranscription,
        problemResoudreRetranscription: data.problemResoudreRetranscription,
        vision3Ans: data.vision3Ans,
        businessModel: data.businessModel,
        competences: data.competences,
        monPourquoiRetranscription: data.monPourquoiRetranscription,
        equipeFondatrice: data.equipeFondatrice,
        productsServices: data.productsServices,
        problemSolved: data.problemSolved,
        clienteleCible: data.clienteleCible,
        needs: data.needs,
        projectType: data.projectType,
        geographicArea: data.geographicArea,
        additionalInfo: data.additionalInfo,
        whyEntrepreneur: data.whyEntrepreneur,
        teamSize: data.teamSize,
        projectIdeaSentence: data.projectIdeaSentence,
      };

      console.log('📤 Sending final data to retranscription webhook');

      const response = await fetch('https://n8n.srv906204.hstgr.cloud/webhook/retranscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData),
      });

      if (response.ok) {
        const result = await response.json();
        const webhookData = result[0];
        const projectId = webhookData?.project_id;

        if (projectId) {
          toast({
            title: 'Projet créé ! 🎉',
            description: 'Vos livrables sont en cours de génération.',
          });

          // Clear the draft from localStorage
          clearDraft();

          // Reload user projects
          await loadUserProjects();

          // Redirect to the project
          navigate(`/individual/project-business/${projectId}`);
        } else {
          throw new Error('project_id not found in webhook response');
        }
      } else {
        throw new Error(`Webhook responded with status ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Error submitting form:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer le projet. Veuillez réessayer.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render current slide
  const renderSlide = () => {
    const slideVariants = {
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
    };

    const slideTransition = {
      x: { type: 'spring', stiffness: 200, damping: 25 },
      opacity: { duration: 0.5, ease: 'easeInOut' },
      filter: { duration: 0.5, ease: 'easeInOut' },
    };

    const slides = [
      <StepBasicInfo key="step0" data={data} onChange={updateData} />,
      <StepProductsServices key="step1" data={data} onChange={updateData} />,
      <StepClientele key="step2" data={data} onChange={updateData} />,
      <StepNeeds key="step3" data={data} onChange={updateData} />,
      <StepTypeLocation key="step4" data={data} onChange={updateData} />,
      <StepTeam key="step5" data={data} onChange={updateData} />,
      <StepAdditionalInfo key="step6" data={data} onChange={updateData} />,
      <StepConfirmation key="step7" data={data} organizations={availableOrganizations} selectedOrg={selectedOrganization} />,
      <StepRetranscription key="step8" data={data} onChange={updateData} isLoading={isLoadingRetranscription} />,
    ];

    return (
      <AnimatePresence mode="wait" custom={1}>
        <motion.div
          key={currentStep}
          custom={1}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={slideTransition}
          className="w-full"
        >
          {slides[currentStep]}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between py-12 px-4 pb-32 md:pb-12">
      {/* Main content - Centered */}
      <div className="flex-1 flex items-center justify-center w-full pb-8 md:pb-0">{renderSlide()}</div>

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
              {currentStep > 0 && (
                <motion.button
                  onClick={handleBack}
                  disabled={isSubmitting || isLoadingRetranscription}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                  whileTap={{ scale: 0.9 }}
                  className="flex items-center justify-center mb-1"
                >
                  <ChevronLeft className="w-9 h-9 text-gray-400 dark:text-gray-500" strokeWidth={2.5} />
                </motion.button>
              )}

              <motion.button
                onClick={currentStep === totalSteps - 1 ? handleSubmit : handleNext}
                disabled={!canProceed() || isSubmitting || isLoadingRetranscription}
                className="relative"
                whileTap={{ scale: 0.92 }}
              >
                {/* Mobile: Circle button with progressive fill */}
                <span className="flex items-center justify-center w-16 h-16 rounded-full shadow-xl transition-all duration-200 disabled:opacity-50 relative overflow-hidden">
                  {/* Gray background */}
                  <span className="absolute inset-0 bg-gray-200 dark:bg-gray-700 rounded-full" />

                  {/* Orange fill from bottom to top */}
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-t from-[#FF6B35] to-[#FF8A5B] rounded-full"
                    initial={{ height: '0%' }}
                    animate={{ height: `${progressPercentage}%` }}
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
                  {currentStep === totalSteps - 1 ? (
                    <CheckCircle className="w-8 h-8 relative z-10 text-white drop-shadow-sm" strokeWidth={2.5} />
                  ) : (
                    <ChevronRight className="w-8 h-8 relative z-10 text-white drop-shadow-sm" strokeWidth={2.5} />
                  )}
                </span>
              </motion.button>
            </motion.div>
          </div>

          {/* DESKTOP: Normal layout */}
          {currentStep > 0 && (
            <motion.button
              onClick={handleBack}
              disabled={isSubmitting || isLoadingRetranscription}
              className="hidden md:flex items-center gap-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 font-medium px-6 py-2.5 rounded-lg transition-all duration-200"
              whileHover={{ x: -4 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeft className="w-4 h-4" />
              Retour
            </motion.button>
          )}

          <motion.button
            onClick={currentStep === totalSteps - 1 ? handleSubmit : handleNext}
            disabled={!canProceed() || isSubmitting || isLoadingRetranscription}
            className="hidden md:flex items-center relative overflow-hidden bg-[#FF6B35] hover:bg-[#FF5722] text-white px-10 py-3 text-base font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.span className="relative z-10">
              {isSubmitting || isLoadingRetranscription
                ? 'Traitement...'
                : currentStep === totalSteps - 1
                ? 'Générer mes livrables'
                : 'Continuer'}
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

      {/* Loading Dialog - Step 8 only (deliverables generation) */}
      <Dialog open={isSubmitting && currentStep === totalSteps - 1} onOpenChange={() => {}}>
        <DialogContent
          className="w-[95vw] max-w-[500px] rounded-lg sm:w-full"
          onEscapeKeyDown={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          hideCloseButton={true}
        >
          <DialogHeader>
            <DialogTitle className="text-2xl">🚀 Génération de vos livrables</DialogTitle>
            <DialogDescription>
              La génération peut prendre quelques minutes. Nous créons du contenu personnalisé basé sur vos réponses !
            </DialogDescription>
          </DialogHeader>

          {/* Deliverable Progress - réutiliser le composant existant */}
          <div className="mt-6 space-y-3">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Génération en cours :</h4>
            {deliverables.map((deliverable) => (
              <FreeDeliverableProgressContainer key={deliverable.key} deliverable={deliverable} />
            ))}
          </div>

          <div className="flex justify-center items-center py-4">
            <div className="spinner"></div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateProjectFlow;
