import React, { useEffect, useState } from 'react';
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

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!organisationId) {
        toast({
          title: "Erreur",
          description: "ID d'organisation manquant",
          variant: "destructive",
        });
        navigate('/dashboard');
        return;
      }

      try {
        // Vérifier le statut d'onboarding en utilisant le service
        const onboardingStatus = await getOnboardingStatus(organisationId);
        const onboardingComplete = onboardingStatus.onboarding_completed;

        setIsOnboardingComplete(onboardingComplete);

        // Si l'onboarding n'est pas complété, rediriger vers la page d'onboarding
        if (!onboardingComplete) {
          try {
            // Récupérer le nom de l'organisation pour le message
            const organisation = await getOrganisation(organisationId);
            toast({
              title: "Onboarding requis",
              description: `Veuillez compléter la configuration de ${organisation.name || 'votre organisation'} avant de continuer.`,
            });
          } catch {
            toast({
              title: "Onboarding requis",
              description: "Veuillez compléter la configuration de votre organisation avant de continuer.",
            });
          }
          navigate(`/organisation/${organisationId}/onboarding`);
          return;
        }

      } catch (error: any) {
        console.error('Erreur lors de la vérification de l\'onboarding:', error);
        toast({
          title: "Erreur",
          description: error.message || "Une erreur s'est produite",
          variant: "destructive",
        });
        navigate('/dashboard');
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