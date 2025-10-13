import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, RefreshCw, CheckCircle, AlertCircle, LogOut } from 'lucide-react';
import { useEmailConfirmation } from '@/hooks/useEmailConfirmation';
import { EmailConfirmationModal } from '@/components/auth/EmailConfirmationModal';
import { toast } from '@/components/ui/use-toast';
import { User } from '@supabase/supabase-js';

const VerifyEmail = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { state, actions } = useEmailConfirmation(user);
  const [showModal, setShowModal] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [hasShownWelcomeToast, setHasShownWelcomeToast] = useState(false);
  const [hasShownRedirectToast, setHasShownRedirectToast] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Check if user was just confirmed from email link
  const wasConfirmed = searchParams.get('confirmed') === 'true';

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
      setLoading(false);
    };

    checkUser();

    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Only redirect if:
    // 1. Not loading
    // 2. User exists
    // 3. Email is confirmed (isConfirmed = true AND isRequired = false)
    // 4. Haven't shown redirect toast yet
    if (!loading && user && !state.isLoading && state.isConfirmed && !state.isRequired && !hasShownRedirectToast) {
      setHasShownRedirectToast(true);
      
      toast({
        title: "Email confirmé !",
        description: "Redirection vers votre tableau de bord...",
      });
      
      // Clean up URL and redirect
      setTimeout(() => {
        navigate('/individual/dashboard', { replace: true });
      }, 1500);
    }
  }, [loading, user, state.isLoading, state.isConfirmed, state.isRequired, navigate, hasShownRedirectToast]);

  useEffect(() => {
    // Show success message if just confirmed via email link - only once
    if (wasConfirmed && !hasShownWelcomeToast) {
      setHasShownWelcomeToast(true);
      
      toast({
        title: "Email confirmé !",
        description: "Votre compte est maintenant activé. Vérification en cours...",
      });
      
      // Clean up URL
      window.history.replaceState({}, '', '/verify-email');
      
      // Refresh the status to update the UI - wait a bit longer for DB trigger to complete
      setTimeout(() => {
        actions.refreshStatus();
      }, 1500);
    }
  }, [wasConfirmed, hasShownWelcomeToast, actions]);

  // Retry mechanism: if user arrived with confirmed=true but profile hasn't updated yet, retry a few times
  useEffect(() => {
    if (wasConfirmed && !state.isLoading && state.isRequired && retryCount < 3) {
      // Profile hasn't been updated yet, retry after a delay
      const retryTimer = setTimeout(() => {
        console.log(`[VerifyEmail] Retry ${retryCount + 1}/3: Profile not updated yet, refreshing status...`);
        setRetryCount(prev => prev + 1);
        actions.refreshStatus();
      }, 2000); // Wait 2 seconds between retries

      return () => clearTimeout(retryTimer);
    }
  }, [wasConfirmed, state.isLoading, state.isRequired, retryCount, actions]);

  const handleResendEmail = async () => {
    setIsResending(true);
    
    try {
      const success = await actions.sendConfirmationEmail();
      
      if (success) {
        setShowModal(true);
        toast({
          title: "Email renvoyé !",
          description: "Un nouveau lien de confirmation vous a été envoyé.",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de renvoyer l'email. Réessayez plus tard.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleEmailConfirmed = () => {
    setShowModal(false);
    actions.refreshStatus();
    
    toast({
      title: "Email confirmé !",
      description: "Votre compte est maintenant activé.",
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const canResend = !state.canResendAt || new Date() >= state.canResendAt;
  const resendCooldownSeconds = state.canResendAt 
    ? Math.max(0, Math.ceil((state.canResendAt.getTime() - Date.now()) / 1000))
    : 0;

  if (loading || state.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F9F6F2]">
        <div className="flex items-center gap-2 text-gray-600">
          <RefreshCw className="h-5 w-5 animate-spin" />
          Vérification de votre email...
        </div>
      </div>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  // If confirmed AND no longer required, show success message while redirecting
  if (state.isConfirmed && !state.isRequired && hasShownRedirectToast) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F9F6F2]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-xl">Email confirmé !</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              Votre compte est maintenant activé. Redirection en cours...
            </p>
            <RefreshCw className="h-5 w-5 animate-spin mx-auto text-gray-400" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F9F6F2] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
              <Mail className="h-8 w-8 text-orange-600" />
            </div>
          </div>
          <CardTitle className="text-xl">Confirmez votre email</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="text-center text-gray-600">
            <p className="mb-4">
              Pour accéder à votre compte, vous devez confirmer votre adresse email :
            </p>
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="font-medium text-gray-800">{user.email}</p>
            </div>
            <p className="text-sm text-gray-500">
              Un email de confirmation a été envoyé à cette adresse. Cliquez sur le lien dans l'email pour activer votre compte.
            </p>
          </div>

          {/* Statut de confirmation */}
          {state.confirmationStatus && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-blue-700">
                <Mail className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Statut : {state.confirmationStatus.status === 'pending' ? 'En attente' : 'Expiré'}
                </span>
              </div>
              {state.confirmationStatus.expires_at && (
                <p className="text-xs text-blue-600 mt-1">
                  Expire le : {new Date(state.confirmationStatus.expires_at).toLocaleString('fr-FR')}
                </p>
              )}
            </div>
          )}

          {/* Erreur */}
          {state.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={handleResendEmail}
              disabled={!canResend || isResending}
              className="w-full bg-[#FF592C] hover:bg-[#e04a1f]"
            >
              {isResending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Envoi en cours...
                </>
              ) : canResend ? (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Renvoyer l'email de confirmation
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Renvoyer dans {resendCooldownSeconds}s
                </>
              )}
            </Button>

            <Button
              onClick={actions.refreshStatus}
              variant="outline"
              className="w-full"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              J'ai confirmé mon email
            </Button>

            <Button
              onClick={handleSignOut}
              variant="ghost"
              className="w-full text-gray-600 hover:text-gray-800"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Se déconnecter
            </Button>
          </div>

          {/* Aide */}
          <div className="text-center pt-4 border-t">
            <p className="text-xs text-gray-500">
              Vous n'avez pas reçu l'email ? Vérifiez vos spams ou contactez-nous à{' '}
              <a 
                href="mailto:support@aurentia.fr" 
                className="text-[#FF592C] hover:text-[#e04a1f] font-medium"
              >
                support@aurentia.fr
              </a>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Modal de confirmation */}
      {showModal && (
        <EmailConfirmationModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          email={user.email || ''}
          userId={user.id}
          onConfirmed={handleEmailConfirmed}
        />
      )}
    </div>
  );
};

export default VerifyEmail;
