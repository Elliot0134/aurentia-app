import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { useUserProfile } from "@/hooks/useUserProfile";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { getDefaultDashboard } = useUserRole();
  const { userProfile, loading: userProfileLoading } = useUserProfile();
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          // Check if user validated beta access code (for OAuth signups)
          const hasBetaAccess = localStorage.getItem('aurentia_has_beta_access') === 'true';
          if (hasBetaAccess && session.user) {
            try {
              // Update profile with beta access for new OAuth users
              const { error: profileError } = await supabase
                .from('profiles')
                .update({ has_beta_access: true })
                .eq('id', session.user.id);

              if (profileError) {
                console.error('Erreur lors de la mise à jour du profil avec beta access:', profileError);
              }
            } catch (profileErr) {
              console.error('Erreur lors de la mise à jour du beta access:', profileErr);
            }
          }

          // Attendre que le profil utilisateur soit chargé
          if (!userProfileLoading) {
            if (userProfile?.user_role) {
              // Rôle déjà défini, rediriger vers le tableau de bord par défaut
              navigate(getDefaultDashboard(), { replace: true });
            } else {
              // Pas de rôle défini, rediriger vers l'onboarding pour la configuration initiale
              // (OAuth users go directly to onboarding flow)
              navigate("/onboarding", { replace: true });
            }
          }
        } else {
          // Pas de session, rediriger vers la page de connexion
          navigate("/login", { replace: true });
        }
      } catch (error) {
        console.error("Erreur lors de la gestion du callback d'authentification:", error);
        navigate("/login", { replace: true });
      } finally {
        setAuthLoading(false);
      }
    };

    handleAuthCallback();
  }, [navigate, getDefaultDashboard, userProfile, userProfileLoading]);

  if (authLoading || userProfileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Chargement de l'authentification...</div>
      </div>
    );
  }

  return null;
};

export default AuthCallback;
