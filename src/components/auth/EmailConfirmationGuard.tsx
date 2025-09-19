import React, { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { useEmailConfirmation } from '@/hooks/useEmailConfirmation';
import { EmailConfirmationModal } from './EmailConfirmationModal';
import { toast } from '@/components/ui/use-toast';

interface EmailConfirmationGuardProps {
  user: User;
  children: React.ReactNode;
  fallbackMode?: 'block' | 'banner'; // 'block' bloque l'accès, 'banner' affiche juste un avertissement
}

export const EmailConfirmationGuard: React.FC<EmailConfirmationGuardProps> = ({
  user,
  children,
  fallbackMode = 'block'
}) => {
  const { state, actions } = useEmailConfirmation(user);
  const [showModal, setShowModal] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // Si pas de confirmation requise ou déjà confirmé, afficher le contenu
  if (!state.isRequired || state.isConfirmed) {
    return <>{children}</>;
  }

  // En cours de chargement
  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="flex items-center gap-2 text-gray-600">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Vérification de votre email...
        </div>
      </div>
    );
  }

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

  const canResend = !state.canResendAt || new Date() >= state.canResendAt;
  const resendCooldownSeconds = state.canResendAt 
    ? Math.max(0, Math.ceil((state.canResendAt.getTime() - Date.now()) / 1000))
    : 0;

  // Mode banner : affiche un avertissement mais laisse accéder au contenu
  if (fallbackMode === 'banner') {
    return (
      <div>
        <Alert className="mb-6 border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <div className="flex items-center justify-between">
              <span>
                <strong>Confirmez votre email :</strong> Vérifiez votre boîte de réception pour activer toutes les fonctionnalités.
              </span>
              <Button
                onClick={handleResendEmail}
                disabled={!canResend || isResending}
                variant="outline"
                size="sm"
                className="ml-4 border-orange-300 text-orange-700 hover:bg-orange-100"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    Envoi...
                  </>
                ) : canResend ? (
                  <>
                    <Mail className="h-3 w-3 mr-1" />
                    Renvoyer
                  </>
                ) : (
                  `Renvoyer dans ${resendCooldownSeconds}s`
                )}
              </Button>
            </div>
          </AlertDescription>
        </Alert>

        {/* Modal de confirmation si ouvert */}
        {showModal && (
          <EmailConfirmationModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            email={user.email || ''}
            userId={user.id}
            onConfirmed={handleEmailConfirmed}
          />
        )}

        {children}
      </div>
    );
  }

  // Mode block : bloque complètement l'accès
  return (
    <div className="flex items-center justify-center min-h-[80vh] p-4">
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
              className="w-full"
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
          </div>

          {/* Aide */}
          <div className="text-center pt-4 border-t">
            <p className="text-xs text-gray-500">
              Problème ? Vérifiez vos spams ou contactez-nous à{' '}
              <a 
                href="mailto:support@aurentia.fr" 
                className="text-blue-600 hover:text-blue-800"
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

// Hook utilitaire pour utiliser le guard de manière conditionnelle
export const useEmailConfirmationGuard = (user: User | null, enabled: boolean = true) => {
  const { state } = useEmailConfirmation(user);
  
  return {
    shouldBlock: enabled && user && state.isRequired && !state.isConfirmed && !state.isLoading,
    isLoading: state.isLoading,
    needsConfirmation: state.isRequired && !state.isConfirmed,
  };
};