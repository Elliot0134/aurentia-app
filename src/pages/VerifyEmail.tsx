import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, RefreshCw, CheckCircle, AlertCircle, LogOut, Headphones } from 'lucide-react';
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

  const handleEmailConfirmed = async () => {
    setShowModal(false);
    await actions.refreshStatus();

    toast({
      title: "Email confirmé !",
      description: "Redirection vers votre tableau de bord...",
    });

    // Redirect to dashboard after confirmation
    setTimeout(() => {
      navigate('/individual/dashboard', { replace: true });
    }, 1500);
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

  return (
    <div className="flex items-center justify-center min-h-screen p-4" style={{ backgroundColor: '#f8f8f6' }}>
      <div className="w-full max-w-[450px]">
        {/* Logo Aurentia */}
        <div className="flex items-center justify-center mb-6 opacity-0 animate-[fadeInUp_0.6s_ease-out_0.1s_forwards]">
          <img
            src="/Aurentia-logo-long.svg"
            alt="Aurentia"
            className="h-10"
          />
        </div>

        {/* Main Card */}
        <Card className="rounded-2xl shadow-sm border border-gray-100 p-8 bg-white opacity-0 animate-[fadeInUp_0.6s_ease-out_0.2s_forwards]">
          <CardHeader className="text-center p-0 mb-6 opacity-0 animate-[fadeInBlur_0.8s_ease-out_0.4s_forwards]">
            <div className="flex justify-center mb-3">
              <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center">
                <Mail className="h-7 w-7 text-orange-600" />
              </div>
            </div>
            <CardTitle className="text-xl font-semibold text-gray-800 mb-2">Vérifiez votre email</CardTitle>
            <p className="text-sm text-gray-500">
              Nous avons envoyé un lien de confirmation à
            </p>
          </CardHeader>

          <CardContent className="space-y-5 p-0 opacity-0 animate-[fadeInBlur_0.8s_ease-out_0.6s_forwards]">
            {/* Email display */}
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="font-medium text-gray-800 text-sm">{user.email}</p>
            </div>

            {/* Erreur */}
            {state.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}

            {/* Actions */}
            <div className="space-y-2.5 pt-1">
              <button
                onClick={async () => {
                  await actions.refreshStatus();
                  // Redirect to onboarding after email confirmation
                  setTimeout(() => {
                    navigate('/onboarding', { replace: true });
                  }, 500);
                }}
                className="w-full bg-aurentia-orange text-white py-3 rounded-lg hover:bg-aurentia-orange/90 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 ease-in-out text-base"
              >
                <CheckCircle className="h-4 w-4 mr-2 inline" />
                J'ai confirmé mon email
              </button>
            </div>

            {/* Aide et déconnexion */}
            <div className="space-y-4 mt-8">
              <p className="text-sm text-center text-gray-500">
                Vous ne voyez pas l'email ? Vérifiez vos spams
              </p>

              {/* Two buttons side by side */}
              <div className="grid grid-cols-2 gap-2.5">
                <Button
                  onClick={handleResendEmail}
                  disabled={!canResend || isResending}
                  variant="outline"
                  className="py-5"
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Envoi...
                    </>
                  ) : canResend ? (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Renvoyer
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      {resendCooldownSeconds}s
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => window.location.href = 'mailto:support@aurentia.fr'}
                  variant="outline"
                  className="py-5"
                >
                  <Headphones className="h-4 w-4 mr-2" />
                  Support
                </Button>
              </div>

              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-gray-700 py-2 text-sm transition-all duration-200 hover:translate-x-1"
              >
                Se déconnecter
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </CardContent>
      </Card>
      </div>

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
