import OnboardingFlow from '@/components/onboarding/OnboardingFlow';

/**
 * Onboarding Page
 * Clean page with no navbar or sidebar
 * First-time user experience flow
 */
const Onboarding = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-500">
      <OnboardingFlow />
    </div>
  );
};

export default Onboarding;
