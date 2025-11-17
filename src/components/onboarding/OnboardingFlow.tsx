import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProgressDots from './ProgressDots';
import ThemeSelection from './slides/ThemeSelection';
import PersonalInfo from './slides/PersonalInfo';
import DiscoverySource from './slides/DiscoverySource';
import UserTypeSelection from './slides/UserTypeSelection';
import GoalsSelection from './slides/GoalsSelection';
import PlanSelection from './slides/PlanSelection';
import {
  OnboardingData,
  ThemePreference,
  DiscoverySource as DiscoverySourceType,
  UserType,
  EntrepreneurGoal,
  StructureGoal,
  PlanType,
} from '@/types/onboarding';
import { supabase } from '@/integrations/supabase/client';

const OnboardingFlow = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    currentStep: 0,
    goals: [],
    preferredLanguage: 'fr',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate total steps based on user type
  const getTotalSteps = () => {
    if (!data.userType) return 6; // Default before userType is selected
    // Structure users don't see plan selection
    return data.userType === 'structure' ? 5 : 6;
  };

  const totalSteps = getTotalSteps();

  // Calculate progress percentage for arrow fill (0% to 100%)
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

  // Update data
  const updateData = (field: keyof OnboardingData, value: any) => {
    setData((prev) => ({
      ...prev,
      [field]: value,
      currentStep,
    }));
  };

  // Handle goal toggle
  const toggleGoal = (goal: EntrepreneurGoal | StructureGoal) => {
    setData((prev) => {
      const goals = prev.goals || [];
      const isSelected = goals.includes(goal);

      return {
        ...prev,
        goals: isSelected
          ? goals.filter((g) => g !== goal)
          : [...goals, goal],
        currentStep,
      };
    });
  };

  // Save to Supabase
  const saveOnboardingData = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('No active session');
      }

      // Update user profile with onboarding data
      const { error } = await supabase.from('profiles').update({
        onboarding_completed: true,
        onboarding_data: {
          ...data,
          completedAt: new Date().toISOString(),
        },
        theme_preference: data.theme || 'light',
        preferred_language: data.preferredLanguage || 'fr',
        first_name: data.firstName || null,
        location: data.country || null,
      }).eq('id', session.user.id);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      return false;
    }
  };

  // Can proceed to next step
  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return !!data.theme;
      case 1:
        return (
          !!data.firstName &&
          !!data.birthDate?.day &&
          !!data.birthDate?.month &&
          !!data.birthDate?.year &&
          !!data.country
        );
      case 2:
        return !!data.discoverySource;
      case 3:
        return !!data.userType;
      case 4:
        return data.goals && data.goals.length > 0;
      case 5:
        return !!data.selectedPlan;
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

    // If we're at the last step
    if (currentStep === totalSteps - 1) {
      setIsSubmitting(true);
      const success = await saveOnboardingData();

      if (success) {
        toast({
          title: 'Bienvenue sur Aurentia! 🎉',
          description: 'Votre compte a été configuré avec succès.',
        });
        // Redirect to dashboard
        navigate('/individual/dashboard');
      } else {
        toast({
          title: 'Erreur',
          description: 'Une erreur est survenue. Veuillez réessayer.',
          variant: 'destructive',
        });
      }
      setIsSubmitting(false);
      return;
    }

    setCurrentStep((prev) => prev + 1);
  };

  // Handle back
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Apply theme to document when selected
  useEffect(() => {
    if (data.theme) {
      if (data.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [data.theme]);

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

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
      <ThemeSelection
        key="theme"
        selectedTheme={data.theme}
        onSelect={(theme: ThemePreference) => updateData('theme', theme)}
      />,
      <PersonalInfo key="personal" data={data} onChange={updateData} />,
      <DiscoverySource
        key="discovery"
        selectedSource={data.discoverySource}
        onSelect={(source: DiscoverySourceType) =>
          updateData('discoverySource', source)
        }
      />,
      <UserTypeSelection
        key="usertype"
        selectedType={data.userType}
        onSelect={(type: UserType) => updateData('userType', type)}
      />,
      data.userType && (
        <GoalsSelection
          key="goals"
          userType={data.userType}
          selectedGoals={data.goals || []}
          onToggle={toggleGoal}
        />
      ),
      data.userType !== 'structure' && (
        <PlanSelection
          key="plan"
          selectedPlan={data.selectedPlan}
          onSelect={(plan: PlanType) => updateData('selectedPlan', plan)}
        />
      ),
    ].filter(Boolean);

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
      {/* Main content */}
      <div className="flex-1 flex items-center justify-center w-full pb-8 md:pb-0">
        {renderSlide()}
      </div>

      {/* Bottom controls */}
      <div className="w-full max-w-4xl mx-auto mt-8 md:mt-12 space-y-8">
        {/* Navigation buttons */}
        <div className="md:flex md:items-center md:justify-center md:gap-4">
          {/* Mobile: Circle button on right with back button - shown from start */}
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
                  disabled={isSubmitting}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                  whileTap={{ scale: 0.9 }}
                  className="flex items-center justify-center mb-1"
                >
                  {/* Just the arrow icon, no background, no shadow */}
                  <ChevronLeft className="w-9 h-9 text-gray-400 dark:text-gray-500" strokeWidth={2.5} />
                </motion.button>
              )}

              <motion.button
                onClick={handleNext}
                disabled={!canProceed() || isSubmitting}
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
                  <ChevronRight className="w-8 h-8 relative z-10 text-white drop-shadow-sm" strokeWidth={2.5} />
                </span>
              </motion.button>
            </motion.div>
          </div>

          {/* Desktop: Normal layout */}
          {currentStep > 0 && (
            <motion.button
              onClick={handleBack}
              disabled={isSubmitting}
              className="hidden md:flex items-center gap-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 font-medium px-6 py-2.5 rounded-lg transition-all duration-200"
              whileHover={{ x: -4 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeft className="w-4 h-4" />
              Retour
            </motion.button>
          )}

          <motion.button
            onClick={handleNext}
            disabled={!canProceed() || isSubmitting}
            className="hidden md:flex items-center relative overflow-hidden bg-[#FF6B35] hover:bg-[#FF5722] text-white px-10 py-3 text-base font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.span className="relative z-10">
              {isSubmitting
                ? 'Finalisation...'
                : currentStep === totalSteps - 1
                ? 'Commencer'
                : 'Continuer'}
            </motion.span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              initial={{ x: '-100%' }}
              whileHover={{
                x: '100%',
                transition: { duration: 0.6, ease: 'easeInOut' }
              }}
            />
          </motion.button>
        </div>

        {/* Progress dots - Hidden on mobile, visible on desktop */}
        <div className="hidden md:block">
          <ProgressDots totalSteps={totalSteps} currentStep={currentStep} />
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;
