
import { FormEvent, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useUserRole } from "@/hooks/useUserRole";
import { CollaboratorsService } from "@/services/collaborators.service";
import usePageTitle from "@/hooks/usePageTitle";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, Users, Eye, EyeOff, Mail } from "lucide-react";

const Login = () => {
  usePageTitle("Connexion");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { getDefaultDashboard } = useUserRole();
  
  // États pour la gestion des invitations
  const [invitationToken, setInvitationToken] = useState<string | null>(null);
  const [invitationData, setInvitationData] = useState<any>(null);
  const [showInvitationModal, setShowInvitationModal] = useState(false);
  const [invitationLoading, setInvitationLoading] = useState(false);

  useEffect(() => {
    // Vérifier s'il y a un paramètre de confirmation dans l'URL
    const confirmationParam = searchParams.get('confirmation');
    const emailParam = searchParams.get('email');
    if (confirmationParam === 'true' && emailParam) {
      setConfirmationEmail(emailParam);
      setShowConfirmationDialog(true);
      // Nettoyer l'URL après avoir récupéré les paramètres
      navigate('/login', { replace: true });
    }

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
      const { error } = await supabase.auth.signInWithOAuth({
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
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#f8f8f6' }}>
      <div className="w-full max-w-[450px]">
        {/* Logo Aurentia */}
        <div className="flex items-center justify-center mb-6 opacity-0 animate-[fadeInUp_0.6s_ease-out_0.1s_forwards]">
          <img
            src="/aurentia-logo-long.svg"
            alt="Aurentia"
            className="h-10"
          />
        </div>

        {/* Main Card */}
        <div className="rounded-2xl shadow-sm border border-gray-100 p-8 bg-white opacity-0 animate-[fadeInUp_0.6s_ease-out_0.2s_forwards]" style={{ fontFamily: 'var(--font-base)' }}>
          <div className="text-center mb-8 opacity-0 animate-[fadeInBlur_0.8s_ease-out_0.4s_forwards]">
            <h1 className="text-2xl font-semibold mb-2 font-biz-ud-mincho" style={{ color: 'var(--text-gris-profond)' }}>
              Bienvenue
            </h1>
            <p className="text-gray-500 text-sm">
              Connectez-vous avec votre compte Apple ou Google
            </p>
          </div>

          {/* OAuth Buttons */}
          <div className="flex gap-3 mb-6 opacity-0 animate-[fadeInBlur_0.8s_ease-out_0.6s_forwards]">
            <button
              type="button"
              className="flex-1 flex items-center justify-center py-2.5 px-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm active:scale-[0.98] transition-all duration-200 ease-in-out"
              disabled={loading}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
              </svg>
            </button>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="flex-1 flex items-center justify-center py-2.5 px-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm active:scale-[0.98] transition-all duration-200 ease-in-out"
              disabled={loading}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-6 opacity-0 animate-[fadeInBlur_0.8s_ease-out_0.8s_forwards]">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200"></span>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 text-gray-500 bg-white">Ou continuer avec</span>
            </div>
          </div>

          {/* Content switcher with fade transition */}
          <div className="relative min-h-[240px] opacity-0 animate-[fadeInBlur_0.8s_ease-out_1s_forwards]">
            {/* Email/Password Form */}
            <div
              className={`transition-all duration-500 ${
                showForgotPassword
                  ? "opacity-0 blur-sm pointer-events-none absolute inset-0"
                  : "opacity-100 blur-0"
              }`}
            >
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">
                      Mot de passe
                    </Label>
                    <button
                      type="button"
                      className="text-sm hover:text-gray-700 hover:underline underline-offset-2 transition-all duration-200"
                      style={{ color: 'var(--text-gris-profond)' }}
                      onClick={() => setShowForgotPassword(true)}
                    >
                      Mot de passe oublié ?
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-12"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById('password') as HTMLInputElement;
                        if (input) {
                          input.style.filter = 'blur(4px)';
                          setTimeout(() => {
                            setShowPassword(!showPassword);
                            setTimeout(() => {
                              input.style.filter = 'blur(0px)';
                            }, 50);
                          }, 150);
                        }
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition z-10"
                      disabled={loading}
                    >
                      {showPassword ? (
                        <Eye className="h-5 w-5 transition-transform duration-200 hover:scale-110" />
                      ) : (
                        <EyeOff className="h-5 w-5 transition-transform duration-200 hover:scale-110" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-aurentia-orange text-white py-3 rounded-lg hover:bg-aurentia-orange/90 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 ease-in-out text-base"
                    disabled={loading}
                  >
                    {loading ? "Connexion..." : "Se connecter"}
                  </button>
                </div>
              </form>
            </div>

            {/* Forgot Password Section */}
            <div
              className={`transition-all duration-500 ${
                showForgotPassword
                  ? "opacity-100 blur-0"
                  : "opacity-0 blur-sm pointer-events-none absolute inset-0"
              }`}
            >
              <div className="space-y-4">
                <h2 className="text-lg sm:text-xl font-semibold text-left font-biz-ud-mincho" style={{ color: 'var(--text-gris-profond)' }}>Réinitialiser le mot de passe</h2>
                <div className="space-y-2">
                  <Label htmlFor="forgot-password-email">
                    Email
                  </Label>
                  <Input
                    id="forgot-password-email"
                    type="email"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    placeholder="votre@email.com"
                    required
                    disabled={loading}
                  />
                </div>
                <button
                  type="button"
                  className="w-full bg-aurentia-orange text-white py-3 rounded-lg hover:bg-aurentia-orange/90 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 ease-in-out text-base"
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
                  className="w-full text-sm text-gray-600 hover:text-gray-800 hover:underline underline-offset-2 transition-all duration-200"
                  onClick={() => setShowForgotPassword(false)}
                  disabled={loading}
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>

          {/* Sign up link */}
          <div className="mt-8 text-center text-sm text-gray-600 opacity-0 animate-[fadeInBlur_0.8s_ease-out_1.2s_forwards]">
            Pas encore de compte ?<br />
            <a href="/signup" className="underline underline-offset-4 hover:text-[#FF592C] transition-colors duration-200" style={{ color: 'var(--text-gris-profond)' }}>
              Inscrivez-vous
            </a>
          </div>
        </div>

        {/* Terms and Privacy Policy */}
        <div className="mt-6 text-center text-xs text-gray-500 opacity-0 animate-[fadeInBlur_0.8s_ease-out_1.4s_forwards]" style={{ fontFamily: 'var(--font-base)' }}>
          En continuant, vous acceptez nos{" "}
          <a href="#" className="underline underline-offset-4 hover:text-gray-700 transition-colors duration-200">
            Conditions d'utilisation
          </a>
          {" "}et notre{" "}
          <a href="#" className="underline underline-offset-4 hover:text-gray-700 transition-colors duration-200">
            Politique de confidentialité
          </a>
          .
        </div>
      </div>

      {/* Modal de confirmation d'inscription */}
      <Dialog open={showConfirmationDialog} onOpenChange={setShowConfirmationDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="text-emerald-600" size={24} />
              Email de confirmation envoyé
            </DialogTitle>
            <DialogDescription>
              Vérifiez votre boîte de réception pour confirmer votre compte
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
              <p className="text-emerald-900 text-sm mb-2">
                Un email de confirmation a été envoyé à :
              </p>
              <p className="text-emerald-700 font-semibold break-all">
                {confirmationEmail}
              </p>
            </div>

            <p className="text-sm text-gray-600">
              Veuillez cliquer sur le lien dans l'email pour activer votre compte.
              Si vous ne voyez pas l'email, vérifiez votre dossier spam.
            </p>
          </div>

          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button
              onClick={() => setShowConfirmationDialog(false)}
              className="bg-gradient-primary text-white"
            >
              <CheckCircle size={16} className="mr-2" />
              Compris
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
