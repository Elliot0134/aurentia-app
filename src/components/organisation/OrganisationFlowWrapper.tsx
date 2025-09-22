import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { getOrganisation, getOnboardingStatus } from "@/services/organisationService";
import OrganisationSetupForm from "./OrganisationSetupForm";

interface OrganisationFlowWrapperProps {
  userId: string;
  userEmail: string;
  userName: string;
  onComplete?: () => void;
  onBack?: () => void;
}

const OrganisationFlowWrapper = ({ 
  userId, 
  userEmail, 
  userName, 
  onComplete,
  onBack 
}: OrganisationFlowWrapperProps) => {
  const [currentStep, setCurrentStep] = useState<'setup' | 'redirect-to-onboarding'>('setup');
  const [organisationId, setOrganisationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Vérifier si l'utilisateur a déjà une organisation
  useEffect(() => {
    const checkExistingOrganisation = async () => {
      try {
        const { data: profile, error: profileError } = await (supabase as any)
          .from('profiles')
          .select('organization_id, user_role')
          .eq('id', userId)
          .single();

        if (profileError) {
          console.error('Erreur lors de la récupération du profil:', profileError);
          setLoading(false);
          return;
        }

        if (profile?.organization_id && profile?.user_role === 'organisation') {
          // L'utilisateur a déjà une organisation, vérifier si l'onboarding est terminé
          try {
            const onboardingStatus = await getOnboardingStatus(profile.organization_id);
            setOrganisationId(profile.organization_id);
            
            if (onboardingStatus.onboarding_completed) {
              // Onboarding déjà terminé, rediriger vers le dashboard
              if (onComplete) {
                onComplete();
              } else {
                navigate(`/organisation/${profile.organization_id}/dashboard`);
              }
              return;
            } else {
              // Organisation créée mais onboarding pas terminé, rediriger vers la page d'onboarding
              navigate(`/organisation/${profile.organization_id}/onboarding`);
              return;
            }
          } catch (orgError) {
            console.error('Erreur lors de la récupération de l\'organisation:', orgError);
            // L'organisation n'existe pas, recommencer le setup
            setCurrentStep('setup');
          }
        } else {
          // Pas d'organisation, commencer par le setup
          setCurrentStep('setup');
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'organisation existante:', error);
        setCurrentStep('setup');
      } finally {
        setLoading(false);
      }
    };

    checkExistingOrganisation();
  }, [userId, navigate, onComplete]);

  const handleSetupSuccess = async (organisationData?: any) => {
    try {
      let orgId: string;

      // Si des données d'organisation sont fournies, utiliser leur ID
      if (organisationData?.id) {
        orgId = organisationData.id;
      } else {
        // Sinon, récupérer l'organisation depuis le profil utilisateur
        const { data: profile, error: profileError } = await (supabase as any)
          .from('profiles')
          .select('organization_id')
          .eq('id', userId)
          .single();

        if (profileError) {
          throw profileError;
        }

        if (!profile?.organization_id) {
          throw new Error('Organisation non trouvée après création');
        }

        orgId = profile.organization_id;
      }

      // Rediriger vers la page d'onboarding dédiée
      navigate(`/organisation/${orgId}/onboarding`);

    } catch (error) {
      console.error('Erreur lors de la transition vers l\'onboarding:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-aurentia-pink border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de votre organisation...</p>
        </div>
      </div>
    );
  }

  if (currentStep === 'setup') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <OrganisationSetupForm
          userId={userId}
          userEmail={userEmail}
          userName={userName}
          onSuccess={handleSetupSuccess}
          onBack={handleBack}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <p className="text-gray-600">Redirection en cours...</p>
      </div>
    </div>
  );
};

export default OrganisationFlowWrapper;