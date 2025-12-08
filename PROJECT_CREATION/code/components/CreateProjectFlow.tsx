'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { toast } from 'sonner'; // ou votre système de toast
import { createClient } from '@/lib/supabase/client';
import { ProjectCreationData, Organization } from '@/types/projectCreation';

// Import des composants slides
import ProgressDots from './ProgressDots';
import StepBasicInfo from './slides/StepBasicInfo';
import StepProductsServices from './slides/StepProductsServices';
import StepClientele from './slides/StepClientele';
import StepNeeds from './slides/StepNeeds';
import StepTypeLocation from './slides/StepTypeLocation';
import StepTeam from './slides/StepTeam';
import StepAdditionalInfo from './slides/StepAdditionalInfo';
import StepConfirmation from './slides/StepConfirmation';
import StepRetranscription from './slides/StepRetranscription';

// Import optionnel pour le dialog de chargement
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const STORAGE_KEY = 'radia-project-draft';

// URLs des webhooks N8N - À adapter selon votre configuration
const WEBHOOK_RETRANSCRIPTION = 'https://n8n.srv906204.hstgr.cloud/webhook/form-business-idea';
const WEBHOOK_SUBMIT = 'https://n8n.srv906204.hstgr.cloud/webhook/retranscription';

const CreateProjectFlow = () => {
  const router = useRouter();
  const supabase = createClient();

  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<ProjectCreationData>({
    currentStep: 0,
    projectType: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingRetranscription, setIsLoadingRetranscription] = useState(false);

  // Organizations selection (pour les membres)
  const [availableOrganizations, setAvailableOrganizations] = useState<Organization[]>([]);
  const [selectedOrganization, setSelectedOrganization] = useState<string>('');

  const totalSteps = 9;
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

  // Charger le brouillon depuis localStorage au montage
  useEffect(() => {
    const savedDraft = localStorage.getItem(STORAGE_KEY);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setData(parsed);
        setCurrentStep(parsed.currentStep || 0);

        toast.success('Brouillon récupéré', {
          description: 'Nous avons retrouvé votre projet en cours.',
        });
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  }, []);

  // Sauvegarder dans localStorage à chaque changement
  useEffect(() => {
    if (data.projectName || data.projectIdeaSentence) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, currentStep }));
    }
  }, [data, currentStep]);

  // Effacer le brouillon après soumission réussie
  const clearDraft = () => {
    localStorage.removeItem(STORAGE_KEY);
  };

  // Mettre à jour les données
  const updateData = (field: keyof ProjectCreationData, value: any) => {
    setData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Charger les organisations
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
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
            setAvailableOrganizations([userOrg.organizations as Organization]);
            setSelectedOrganization((userOrg.organizations as Organization).id);
          }
        } else {
          const { data: orgs } = await supabase
            .from('organizations')
            .select('id, name')
            .eq('is_public', true)
            .order('name');

          if (orgs) {
            setAvailableOrganizations(orgs);
          }
        }
      } catch (error) {
        console.error('Error loading organizations:', error);
      }
    };

    fetchOrganizations();
  }, [supabase]);

  // Validation pour passer à l'étape suivante
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
        return true; // Champs optionnels
      case 7:
        return true; // Page de confirmation
      case 8:
        return true; // Retranscription (pré-remplie)
      default:
        return false;
    }
  };

  // Gestion du bouton "Suivant"
  const handleNext = async () => {
    if (!canProceed()) {
      toast.error('Information requise', {
        description: 'Veuillez compléter cette étape avant de continuer.',
      });
      return;
    }

    // STEP 7 → 8 : Appel webhook pour générer la retranscription
    if (currentStep === 7) {
      setIsLoadingRetranscription(true);

      try {
        const { data: { session } } = await supabase.auth.getSession();
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

        const response = await fetch(WEBHOOK_RETRANSCRIPTION, {
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
              vision3Ans: webhookData.vision || '',
              businessModel: webhookData.BusinessModel || '',
              competences: webhookData.Compétences || '',
              monPourquoiRetranscription: webhookData.MotivationEntrepreneur || '',
              equipeFondatrice: webhookData.team || '',
              projectID: webhookData.ProjectID || '',
            }));
          }
        } else {
          throw new Error(`Webhook responded with status ${response.status}`);
        }
      } catch (error) {
        console.error('❌ Error calling webhook:', error);
        toast.error('Erreur', {
          description: 'Impossible de générer la retranscription. Veuillez réessayer.',
        });
        setIsLoadingRetranscription(false);
        return;
      } finally {
        setIsLoadingRetranscription(false);
      }
    }

    // Avancer à l'étape suivante
    setCurrentStep((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Gestion du bouton "Retour"
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Gestion de la soumission finale
  const handleSubmit = async () => {
    console.log('🚀 Final submission');
    setIsSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
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

      console.log('📤 Sending final data to webhook');

      const response = await fetch(WEBHOOK_SUBMIT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData),
      });

      if (response.ok) {
        const result = await response.json();
        const webhookData = result[0];
        const projectId = webhookData?.project_id;

        if (projectId) {
          toast.success('Projet créé ! 🎉', {
            description: 'Vos livrables sont en cours de génération.',
          });

          // Effacer le brouillon
          clearDraft();

          // Rediriger vers le projet
          router.push(`/project/${projectId}`);
        } else {
          throw new Error('project_id not found in webhook response');
        }
      } else {
        throw new Error(`Webhook responded with status ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Error submitting form:', error);
      toast.error('Erreur', {
        description: 'Impossible de créer le projet. Veuillez réessayer.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Rendu du slide actuel
  const renderSlide = () => {
    const slideVariants = {
      enter: { x: 50, opacity: 0, filter: 'blur(10px)' },
      center: { x: 0, opacity: 1, filter: 'blur(0px)' },
      exit: { x: -50, opacity: 0, filter: 'blur(10px)' },
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
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
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
      {/* Contenu principal */}
      <div className="flex-1 flex items-center justify-center w-full pb-8 md:pb-0">
        {renderSlide()}
      </div>

      {/* Contrôles de navigation */}
      <div className="w-full max-w-4xl mx-auto mt-8 md:mt-12 space-y-8">
        <div className="md:flex md:items-center md:justify-center md:gap-4">
          
          {/* MOBILE: Bouton circulaire avec progression */}
          <div className="md:hidden fixed bottom-6 right-6 z-50 pointer-events-none">
            <motion.div
              className="flex items-center gap-2 pointer-events-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {currentStep > 0 && (
                <motion.button
                  onClick={handleBack}
                  disabled={isSubmitting || isLoadingRetranscription}
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
                <span className="flex items-center justify-center w-14 h-14 rounded-full shadow-xl relative overflow-hidden">
                  <span className="absolute inset-0 bg-gray-200 dark:bg-gray-700 rounded-full" />
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-t from-[#FF6B35] to-[#FF8A5B] rounded-full"
                    initial={{ height: '0%' }}
                    animate={{ height: `${progressPercentage}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    style={{ bottom: 0, top: 'auto' }}
                  />
                  {currentStep === totalSteps - 1 ? (
                    <CheckCircle className="w-7 h-7 relative z-10 text-white drop-shadow-sm" strokeWidth={2.5} />
                  ) : (
                    <ChevronRight className="w-7 h-7 relative z-10 text-white drop-shadow-sm" strokeWidth={2.5} />
                  )}
                </span>
              </motion.button>
            </motion.div>
          </div>

          {/* DESKTOP: Layout normal */}
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
            <span className="relative z-10">
              {isSubmitting || isLoadingRetranscription
                ? 'Traitement...'
                : currentStep === totalSteps - 1
                ? 'Générer mes livrables'
                : 'Continuer'}
            </span>
          </motion.button>
        </div>

        {/* Progress dots - Desktop uniquement */}
        <div className="hidden md:block">
          <ProgressDots totalSteps={totalSteps} currentStep={currentStep} />
        </div>
      </div>

      {/* Dialog de chargement - Step final */}
      <Dialog open={isSubmitting && currentStep === totalSteps - 1}>
        <DialogContent className="w-[95vw] max-w-[500px] rounded-lg sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-2xl">🚀 Génération de vos livrables</DialogTitle>
            <DialogDescription>
              La génération peut prendre quelques minutes. Nous créons du contenu personnalisé basé sur vos réponses !
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#FF6B35] border-t-transparent" />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateProjectFlow;
