
import { FormEvent, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useUserRole } from "@/hooks/useUserRole";
import { CollaboratorsService } from "@/services/collaborators.service";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Users } from "lucide-react";
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { getDefaultDashboard } = useUserRole();
  
  // États pour la gestion des invitations
  const [invitationToken, setInvitationToken] = useState<string | null>(null);
  const [invitationData, setInvitationData] = useState<any>(null);
  const [showInvitationModal, setShowInvitationModal] = useState(false);
  const [invitationLoading, setInvitationLoading] = useState(false);

  useEffect(() => {
    // Vérifier s'il y a un token d'invitation dans l'URL
    const token = searchParams.get('invitation_token');
    if (token) {
      setInvitationToken(token);
      checkInvitation(token);
    }

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        // Si l'utilisateur vient de se connecter et qu'il y a une invitation, la traiter
        if (invitationToken) {
          await handleAcceptInvitation();
        } else {
          // Sinon, rediriger vers le tableau de bord par défaut
          const defaultDashboardPath = getDefaultDashboard();
          navigate(defaultDashboardPath);
        }
      }
    });

    // Check if user is already signed in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Si l'utilisateur est connecté et qu'il y a un token d'invitation, afficher le modal
        if (invitationToken && invitationData) {
          setShowInvitationModal(true);
        } else if (!invitationToken) {
          // Sinon, rediriger vers le tableau de bord
          const defaultDashboardPath = getDefaultDashboard();
          navigate(defaultDashboardPath);
        }
      }
    };
    
    checkUser();

    return () => {
      // Cleanup listener
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [navigate, getDefaultDashboard, searchParams, invitationToken]);

  // Vérifier la validité de l'invitation
  const checkInvitation = async (token: string) => {
    try {
      const invitation = await CollaboratorsService.getInvitationByToken(token);
      if (invitation) {
        setInvitationData(invitation);
        // Vérifier si l'utilisateur est connecté pour afficher le modal
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setShowInvitationModal(true);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'invitation:', error);
      // Si l'invitation est invalide ou a expiré, nettoyer les états et supprimer le token de l'URL
      setInvitationToken(null);
      setInvitationData(null);
      navigate('/login', { replace: true });
      
      toast({
        title: "Invitation invalide",
        description: "Le lien d'invitation est invalide ou a expiré",
        variant: "destructive",
      });
    }
  };

  // Accepter l'invitation
  const handleAcceptInvitation = async () => {
    if (!invitationToken || !invitationData) return;

    setInvitationLoading(true);
    try {
      const result = await CollaboratorsService.acceptInvitation(invitationToken);
      if (result.success) {
        toast({
          title: "Invitation acceptée",
          description: `Vous avez rejoint le projet "${invitationData.projectName}" avec succès`,
        });
        
        // Fermer le modal et nettoyer les états
        setShowInvitationModal(false);
        setInvitationToken(null);
        setInvitationData(null);
        
        // Supprimer le token de l'URL
        navigate('/login', { replace: true });
        
        // Rediriger vers la page du projet ou le tableau de bord après un délai
        setTimeout(() => {
          navigate(getDefaultDashboard());
        }, 1000);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Erreur lors de l\'acceptation de l\'invitation:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'accepter l'invitation",
        variant: "destructive",
      });
    } finally {
      setInvitationLoading(false);
    }
  };

  // Refuser l'invitation
  const handleRejectInvitation = () => {
    setShowInvitationModal(false);
    setInvitationToken(null);
    setInvitationData(null);
    // Supprimer le token de l'URL
    navigate('/login', { replace: true });
    toast({
      title: "Invitation refusée",
      description: "Vous avez refusé l'invitation de collaboration",
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      // Auth state listener will handle navigation
      // For direct sign-in, we can also explicitly navigate here
      const defaultDashboardPath = getDefaultDashboard();
      navigate(defaultDashboardPath);
    } catch (error: any) {
      toast({
        title: "Erreur de connexion",
        description: error.message || "Une erreur s'est produite lors de la connexion",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          redirectTo: `${window.location.origin}/auth/callback`, // Rediriger vers une page de callback pour gérer la redirection côté client
        },
      });
      
      if (error) throw error;
      
      // La redirection sera gérée par le listener onAuthStateChange ou une page de callback
    } catch (error: any) {
      toast({
        title: "Erreur de connexion",
        description: error.message || "Une erreur s'est produite lors de la connexion avec Google",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-sm animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold mb-2 bg-gradient-to-r from-aurentia-pink to-aurentia-orange bg-clip-text text-transparent">
            Bienvenue sur Aurentia
          </h1>
          <p className="text-gray-600">
            Transformez vos idées en projets viables
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-aurentia-pink/30 focus:border-aurentia-pink transition"
              placeholder="votre@email.com"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <button type="button" className="text-sm text-aurentia-pink hover:text-aurentia-orange transition" onClick={() => setShowForgotPassword(true)}>
                Mot de passe oublié
              </button>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-aurentia-pink/30 focus:border-aurentia-pink transition"
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full btn-primary py-3"
              disabled={loading}
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </div>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-400">ou</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            disabled={loading}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M18.1716 8.36791H17.5001V8.33333H10.0001V11.6667H14.7097C14.0221 13.6071 12.1801 15 10.0001 15C7.23866 15 5.00008 12.7614 5.00008 10C5.00008 7.23858 7.23866 5 10.0001 5C11.2959 5 12.4784 5.48098 13.3618 6.26625L15.8001 3.82791C14.2918 2.46425 12.2584 1.66667 10.0001 1.66667C5.39758 1.66667 1.66675 5.3975 1.66675 10C1.66675 14.6025 5.39758 18.3333 10.0001 18.3333C14.6026 18.3333 18.3334 14.6025 18.3334 10C18.3334 9.44125 18.2726 8.89625 18.1716 8.36791Z" fill="#FFC107"/>
              <path d="M2.62744 6.12425L5.36494 8.1485C6.10119 6.30508 7.90036 5 10.0001 5C11.2959 5 12.4784 5.48098 13.3618 6.26625L15.8001 3.82791C14.2918 2.46425 12.2584 1.66667 10.0001 1.66667C6.87911 1.66667 4.21619 3.47633 2.62744 6.12425Z" fill="#FF3D00"/>
              <path d="M10.0001 18.3333C12.2126 18.3333 14.2084 17.5646 15.7068 16.2481L13.0326 13.9888C12.1352 14.6441 11.0468 15 10.0001 15C7.83019 15 5.99769 13.6221 5.30185 11.6975L2.48352 13.8695C4.05185 16.5783 6.74269 18.3333 10.0001 18.3333Z" fill="#4CAF50"/>
              <path d="M18.1716 8.36791H17.5001V8.33333H10.0001V11.6667H14.7097C14.3809 12.6051 13.7889 13.4221 13.0309 13.9896L13.0326 13.9879L15.7068 16.2471C15.5068 16.4279 18.3334 14.1667 18.3334 10C18.3334 9.44125 18.2726 8.89625 18.1716 8.36791Z" fill="#1976D2"/>
            </svg>
            <span>Continuer avec Google</span>
          </button>

        </form>

        {showForgotPassword && (
          <div className="mt-6 space-y-4">
            <h2 className="text-xl font-semibold text-center">Réinitialiser le mot de passe</h2>
            <div className="space-y-2">
              <label htmlFor="forgot-password-email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="forgot-password-email"
                type="email"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-aurentia-pink/30 focus:border-aurentia-pink transition"
                placeholder="votre@email.com"
                required
                disabled={loading}
              />
            </div>
            <button
              type="button"
              className="w-full btn-primary py-3"
              onClick={async () => {
                setLoading(true);
                try {
                  const { data, error } = await supabase.functions.invoke('send-password-reset', {
                    body: { email: forgotPasswordEmail },
                  });
                  if (error) throw error;
                  toast({
                    title: "Email envoyé",
                    description: data.message || "Veuillez vérifier votre email pour le lien de réinitialisation.",
                  });
                  setShowForgotPassword(false);
                  setForgotPasswordEmail("");
                } catch (error: any) {
                  toast({
                    title: "Erreur",
                    description: error.message || "Une erreur s'est produite.",
                    variant: "destructive",
                  });
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
            >
              {loading ? "Envoi..." : "Envoyer le lien de réinitialisation"}
            </button>
            <button
              type="button"
              className="w-full text-sm text-gray-600 hover:text-gray-800 transition"
              onClick={() => setShowForgotPassword(false)}
              disabled={loading}
            >
              Annuler
            </button>
          </div>
        )}

        <div className="mt-6 text-center text-sm">
          Pas encore de compte ?{" "}
          <a href="/signup" className="text-aurentia-pink hover:text-aurentia-orange transition">
            Inscrivez-vous
          </a>
        </div>
      </div>

      {/* Modal d'invitation */}
      <Dialog open={showInvitationModal} onOpenChange={setShowInvitationModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="text-blue-600" size={24} />
              Invitation de collaboration
            </DialogTitle>
            <DialogDescription>
              Vous avez été invité à collaborer sur un projet Aurentia
            </DialogDescription>
          </DialogHeader>
          
          {invitationData && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">
                  {invitationData.projectName}
                </h3>
                {invitationData.projectDescription && (
                  <p className="text-blue-700 text-sm">
                    {invitationData.projectDescription}
                  </p>
                )}
                <div className="mt-2 text-sm text-blue-600">
                  <strong>Rôle :</strong> {
                    invitationData.role === 'admin' ? 'Administrateur' :
                    invitationData.role === 'editor' ? 'Éditeur' : 'Lecteur'
                  }
                </div>
              </div>
              
              <p className="text-sm text-gray-600">
                En acceptant cette invitation, vous rejoindrez l'équipe de ce projet et pourrez collaborer selon vos permissions.
              </p>
            </div>
          )}

          <DialogFooter className="flex gap-2 sm:justify-between">
            <Button
              variant="outline"
              onClick={handleRejectInvitation}
              disabled={invitationLoading}
              className="flex items-center gap-2"
            >
              <XCircle size={16} />
              Refuser
            </Button>
            <Button
              onClick={handleAcceptInvitation}
              disabled={invitationLoading}
              className="bg-gradient-primary text-white flex items-center gap-2"
            >
              {invitationLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Acceptation...
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  Accepter
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;
