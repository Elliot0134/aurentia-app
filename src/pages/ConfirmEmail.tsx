import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Clock, Mail, RefreshCw } from 'lucide-react';
import { emailConfirmationService, EmailVerificationResponse } from '@/services/emailConfirmationService';
import { toast } from '@/components/ui/use-toast';

type ConfirmationState = 'verifying' | 'success' | 'error' | 'expired';

interface ConfirmationPageState {
  state: ConfirmationState;
  result: EmailVerificationResponse | null;
  isResending: boolean;
}

export const ConfirmEmail: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [pageState, setPageState] = useState<ConfirmationPageState>({
    state: 'verifying',
    result: null,
    isResending: false,
  });

  const autoRedirect = searchParams.get('redirect') !== 'false';

  // Vérifier le token au chargement
  useEffect(() => {
    if (!token) {
      setPageState({
        state: 'error',
        result: {
          success: false,
          error: 'Token de confirmation manquant',
          code: 'INVALID_TOKEN'
        },
        isResending: false,
      });
      return;
    }

    verifyToken(token);
  }, [token]);

  const verifyToken = async (tokenToVerify: string) => {
    setPageState(prev => ({ ...prev, state: 'verifying' }));

    try {
      const result = await emailConfirmationService.verifyEmailToken({
        token: tokenToVerify
      });

      if (result.success) {
        setPageState({
          state: 'success',
          result,
          isResending: false,
        });

        // Toast de succès
        emailConfirmationService.showVerificationToast(result);

        // Redirection automatique après 3 secondes
        if (autoRedirect) {
          setTimeout(() => {
            navigate('/login?confirmed=true');
          }, 3000);
        }
      } else {
        const newState: ConfirmationState = result.code === 'TOKEN_EXPIRED' ? 'expired' : 'error';
        
        setPageState({
          state: newState,
          result,
          isResending: false,
        });

        // Toast d'erreur
        emailConfirmationService.showVerificationToast(result);
      }
    } catch (error: any) {
      setPageState({
        state: 'error',
        result: {
          success: false,
          error: error.message || 'Erreur lors de la vérification',
          code: 'INTERNAL_ERROR'
        },
        isResending: false,
      });

      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite.",
        variant: "destructive",
      });
    }
  };

  const handleResendEmail = async () => {
    if (!pageState.result?.email || pageState.isResending) return;

    setPageState(prev => ({ ...prev, isResending: true }));

    try {
      const result = await emailConfirmationService.sendConfirmationEmail({
        email: pageState.result.email,
        isResend: true
      });

      emailConfirmationService.showResultToast(result);

      if (result.success) {
        // Rediriger vers une page d'attente ou rester ici
        toast({
          title: "Email renvoyé",
          description: "Un nouveau lien de confirmation vous a été envoyé. Cette page se fermera dans 10 secondes.",
        });

        setTimeout(() => {
          navigate('/login?resent=true');
        }, 10000);
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de renvoyer l'email. Réessayez plus tard.",
        variant: "destructive",
      });
    } finally {
      setPageState(prev => ({ ...prev, isResending: false }));
    }
  };

  const getStateIcon = () => {
    switch (pageState.state) {
      case 'verifying':
        return <RefreshCw className="h-16 w-16 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case 'expired':
        return <Clock className="h-16 w-16 text-orange-500" />;
      case 'error':
        return <AlertCircle className="h-16 w-16 text-red-500" />;
      default:
        return <Mail className="h-16 w-16 text-gray-500" />;
    }
  };

  const getStateTitle = () => {
    switch (pageState.state) {
      case 'verifying':
        return 'Vérification en cours...';
      case 'success':
        return 'Email confirmé !';
      case 'expired':
        return 'Lien expiré';
      case 'error':
        return 'Erreur de confirmation';
      default:
        return 'Confirmation d\'email';
    }
  };

  const getStateDescription = () => {
    const result = pageState.result;
    
    switch (pageState.state) {
      case 'verifying':
        return 'Nous vérifions votre lien de confirmation. Veuillez patienter...';
      case 'success':
        return `Parfait ! Votre email ${result?.email || ''} a été confirmé avec succès. Votre compte est maintenant actif.`;
      case 'expired':
        return `Le lien de confirmation pour ${result?.email || 'votre email'} a expiré. Vous pouvez demander un nouveau lien ci-dessous.`;
      case 'error':
        return getErrorMessage(result?.code, result?.error);
      default:
        return '';
    }
  };

  const getErrorMessage = (code?: string, error?: string) => {
    switch (code) {
      case 'INVALID_TOKEN':
        return 'Le lien de confirmation est invalide ou incorrect. Vérifiez que vous avez copié le lien complet depuis votre email.';
      case 'ALREADY_CONFIRMED':
        return 'Cet email a déjà été confirmé. Vous pouvez vous connecter directement à votre compte.';
      case 'TOKEN_EXPIRED':
        return 'Le lien de confirmation a expiré. Les liens sont valides pendant 24 heures seulement.';
      case 'CONFIRMATION_FAILED':
        return 'Une erreur technique s\'est produite lors de la confirmation. Veuillez réessayer.';
      case 'INTERNAL_ERROR':
        return 'Erreur interne du serveur. Nos équipes ont été notifiées.';
      default:
        return error || 'Une erreur inconnue s\'est produite lors de la confirmation.';
    }
  };

  const getActionButtons = () => {
    const result = pageState.result;

    switch (pageState.state) {
      case 'success':
        return (
          <div className="space-y-3">
            {autoRedirect && (
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-3">
                  Redirection automatique vers la connexion dans 3 secondes...
                </p>
              </div>
            )}
            <Button 
              onClick={() => navigate('/login?confirmed=true')} 
              className="w-full"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Se connecter maintenant
            </Button>
          </div>
        );

      case 'expired':
        return (
          <div className="space-y-3">
            {result?.email && (
              <Button
                onClick={handleResendEmail}
                disabled={pageState.isResending}
                className="w-full"
              >
                {pageState.isResending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Renvoyer le lien de confirmation
                  </>
                )}
              </Button>
            )}
            <Button 
              onClick={() => navigate('/signup')} 
              variant="outline"
              className="w-full"
            >
              Retour à l'inscription
            </Button>
          </div>
        );

      case 'error':
        return (
          <div className="space-y-3">
            {/* Bouton retry pour certaines erreurs */}
            {['CONFIRMATION_FAILED', 'INTERNAL_ERROR'].includes(result?.code || '') && token && (
              <Button
                onClick={() => verifyToken(token)}
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Réessayer
              </Button>
            )}

            {/* Bouton renvoi si email disponible */}
            {result?.email && result?.code !== 'ALREADY_CONFIRMED' && (
              <Button
                onClick={handleResendEmail}
                disabled={pageState.isResending}
                className="w-full"
              >
                {pageState.isResending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Demander un nouveau lien
                  </>
                )}
              </Button>
            )}

            {/* Redirection selon le type d'erreur */}
            {result?.code === 'ALREADY_CONFIRMED' ? (
              <Button 
                onClick={() => navigate('/login')} 
                className="w-full"
              >
                Se connecter
              </Button>
            ) : (
              <Button 
                onClick={() => navigate('/signup')} 
                variant="outline"
                className="w-full"
              >
                Retour à l'inscription
              </Button>
            )}
          </div>
        );

      case 'verifying':
      default:
        return (
          <Button 
            onClick={() => navigate('/')} 
            variant="outline" 
            className="w-full"
            disabled={pageState.state === 'verifying'}
          >
            Retour à l'accueil
          </Button>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            {getStateIcon()}
          </div>
          <CardTitle className="text-2xl font-bold">
            {getStateTitle()}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Description */}
          <div className="text-center">
            <p className="text-gray-600 leading-relaxed">
              {getStateDescription()}
            </p>
          </div>

          {/* Détails techniques si erreur */}
          {pageState.state === 'error' && pageState.result?.code && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-xs text-red-600 font-mono">
                Code d'erreur: {pageState.result.code}
              </p>
              {token && (
                <p className="text-xs text-red-500 mt-1 break-all">
                  Token: {token.substring(0, 16)}...
                </p>
              )}
            </div>
          )}

          {/* Informations supplémentaires pour succès */}
          {pageState.state === 'success' && pageState.result?.confirmedAt && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-700">
                <strong>Confirmé le:</strong> {new Date(pageState.result.confirmedAt).toLocaleString('fr-FR')}
              </p>
              {pageState.result.userId && (
                <p className="text-xs text-green-600 mt-1 font-mono">
                  ID utilisateur: {pageState.result.userId.substring(0, 8)}...
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          {getActionButtons()}

          {/* Footer d'aide */}
          <div className="text-center pt-4 border-t">
            <p className="text-xs text-gray-400">
              Problème persistant ? Contactez-nous à{' '}
              <a 
                href="mailto:support@aurentia.fr" 
                className="text-blue-500 hover:text-blue-700"
              >
                support@aurentia.fr
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfirmEmail;