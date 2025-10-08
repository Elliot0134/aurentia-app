import React, { useState, useEffect, useRef } from 'react';
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
  const hasCheckedRef = useRef(false);

  // Vérifier si l'utilisateur a déjà une organisation
  useEffect(() => {
    const checkExistingOrganisation = async () => {
      // Prevent duplicate checks
      if (hasCheckedRef.current) {
        console.log('[OrganisationFlowWrapper] Already checked, skipping');
        return;
      }
      
      // Validate userId before making the query
      if (!userId) {
        console.error('[OrganisationFlowWrapper] UserId is required');
        setLoading(false);
        return;
      }

      console.log('[OrganisationFlowWrapper] Checking for existing organization for user:', userId);
      hasCheckedRef.current = true;

      try {
        // Vérifier si l'utilisateur a une organisation via user_organizations
        const { data: userOrg, error: userOrgError } = await (supabase as any)
          .from('user_organizations')
          .select('organization_id, user_role, status')
          .eq('user_id', userId)
          .eq('status', 'active')
          .single();

        if (userOrgError && userOrgError.code !== 'PGRST116') {
          console.error('[OrganisationFlowWrapper] Error fetching user_organizations:', userOrgError);
          setLoading(false);
          return;
        }

        if (userOrg?.organization_id) {
          console.log('[OrganisationFlowWrapper] Organization found:', userOrg.organization_id);
          // L'utilisateur a déjà une organisation, rediriger vers le dashboard
          setOrganisationId(userOrg.organization_id);
          
          if (onComplete) {
            onComplete();
          } else {
            navigate(`/organisation/${userOrg.organization_id}/dashboard`);
          }
          return;
        } else {
          console.log('[OrganisationFlowWrapper] No organization found, showing setup form');
          // Pas d'organisation, commencer par le setup
          setCurrentStep('setup');
        }
      } catch (error) {
        console.error('[OrganisationFlowWrapper] Error checking existing organization:', error);
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
        // Sinon, récupérer l'organisation depuis user_organizations
        const { data: userOrg, error: userOrgError } = await (supabase as any)
          .from('user_organizations')
          .select('organization_id')
          .eq('user_id', userId)
          .eq('status', 'active')
          .single();

        if (userOrgError) {
          throw userOrgError;
        }

        if (!userOrg?.organization_id) {
          throw new Error('Organisation non trouvée après création');
        }

        orgId = userOrg.organization_id;
      }

      // Appeler le callback de succès qui redirigera vers le dashboard
      if (onComplete) {
        onComplete();
      } else {
        // Rediriger vers le dashboard de l'organisation
        navigate(`/organisation/${orgId}/dashboard`, { replace: true });
      }

    } catch (error) {
      console.error('Erreur lors de la redirection:', error);
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