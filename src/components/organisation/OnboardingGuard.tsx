import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getOnboardingStatus, getOrganisation } from "@/services/organisationService";
import { toast } from "@/components/ui/use-toast";

interface OnboardingGuardProps {
  children: React.ReactNode;
}

const OnboardingGuard: React.FC<OnboardingGuardProps> = ({ children }) => {
  const { id: organisationId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const hasCheckedRef = useRef<string | null>(null); // Store the last checked org ID

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      // Prevent duplicate checks for the same organization ID
      if (hasCheckedRef.current === organisationId) {
        console.log('[OnboardingGuard] Already checked for org:', organisationId);
        return;
      }

      if (!organisationId) {
        toast({
          title: "Erreur",
          description: "ID d'organisation manquant",
          variant: "destructive",
        });
        navigate('/individual/dashboard');
        return;
      }

      console.log('[OnboardingGuard] Checking onboarding status for org:', organisationId);
      hasCheckedRef.current = organisationId;
      setIsLoading(true);

      try {
        // Vérifier le statut d'onboarding en utilisant le service
        const onboardingStatus = await getOnboardingStatus(organisationId);
        const onboardingComplete = onboardingStatus.onboarding_completed;

        console.log('[OnboardingGuard] Onboarding status:', {
          organisationId,
          onboardingComplete,
          onboarding_step: onboardingStatus.onboarding_step
        });

        setIsOnboardingComplete(onboardingComplete);

        // Si l'onboarding n'est pas complété, rediriger vers la page de setup
        if (!onboardingComplete) {
          console.log('[OnboardingGuard] Onboarding not complete, redirecting to setup');
          toast({
            title: "Configuration requise",
            description: "Veuillez compléter la configuration de votre organisation.",
          });
          navigate(`/organisation/${organisationId}/onboarding`, { replace: true });
          return;
        }

        console.log('[OnboardingGuard] Onboarding complete, rendering children');
      } catch (error: any) {
        console.error('[OnboardingGuard] Error checking onboarding:', error);
        toast({
          title: "Erreur",
          description: error.message || "Une erreur s'est produite",
          variant: "destructive",
        });
        navigate('/individual/dashboard', { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [organisationId, navigate]);

  // Afficher un loading pendant la vérification
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aurentia-pink mx-auto mb-4"></div>
          <p className="text-gray-500">Vérification de l'organisation...</p>
        </div>
      </div>
    );
  }

  // Si l'onboarding n'est pas complété, ce composant ne doit pas rendre ses enfants
  // car l'utilisateur a déjà été redirigé vers la page d'onboarding
  if (!isOnboardingComplete) {
    return null;
  }

  // Si tout est OK, rendre les enfants
  return <>{children}</>;
};

export default OnboardingGuard;