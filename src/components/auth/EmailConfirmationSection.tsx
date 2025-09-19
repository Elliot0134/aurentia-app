import React, { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Shield,
  Info
} from 'lucide-react';
import { useEmailConfirmation } from '@/hooks/useEmailConfirmation';
import { EmailConfirmationModal } from './EmailConfirmationModal';

interface EmailConfirmationSectionProps {
  user: User;
  className?: string;
}

export const EmailConfirmationSection: React.FC<EmailConfirmationSectionProps> = ({
  user,
  className = ""
}) => {
  const { state, actions } = useEmailConfirmation(user);
  const [showModal, setShowModal] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleResendEmail = async () => {
    setIsResending(true);
    
    try {
      const success = await actions.sendConfirmationEmail();
      
      if (success) {
        setShowModal(true);
      }
    } finally {
      setIsResending(false);
    }
  };

  const handleEmailConfirmed = () => {
    setShowModal(false);
    actions.refreshStatus();
  };

  const getStatusBadge = () => {
    if (state.isLoading) {
      return (
        <Badge variant="outline" className="gap-1">
          <RefreshCw className="h-3 w-3 animate-spin" />
          Vérification...
        </Badge>
      );
    }

    if (!state.isRequired || state.isConfirmed) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 border-green-200 gap-1">
          <CheckCircle className="h-3 w-3" />
          Confirmé
        </Badge>
      );
    }

    if (state.confirmationStatus?.status === 'expired') {
      return (
        <Badge variant="destructive" className="gap-1">
          <Clock className="h-3 w-3" />
          Expiré
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="border-orange-200 text-orange-800 bg-orange-50 gap-1">
        <AlertCircle className="h-3 w-3" />
        En attente
      </Badge>
    );
  };

  const getStatusDescription = () => {
    if (state.isLoading) {
      return "Vérification du statut de votre email...";
    }

    if (!state.isRequired || state.isConfirmed) {
      return "Votre adresse email a été confirmée avec succès.";
    }

    if (state.confirmationStatus?.status === 'expired') {
      return "Votre lien de confirmation a expiré. Vous pouvez en demander un nouveau.";
    }

    return "Un email de confirmation vous a été envoyé. Cliquez sur le lien pour activer votre compte.";
  };

  const canResend = !state.canResendAt || new Date() >= state.canResendAt;
  const resendCooldownSeconds = state.canResendAt 
    ? Math.max(0, Math.ceil((state.canResendAt.getTime() - Date.now()) / 1000))
    : 0;

  return (
    <div className={className}>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Confirmation d'email
            </CardTitle>
            {getStatusBadge()}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Adresse email */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-500" />
              <span className="font-medium text-gray-900">{user.email}</span>
            </div>
          </div>

          {/* Description du statut */}
          <p className="text-sm text-gray-600">
            {getStatusDescription()}
          </p>

          {/* Détails de la confirmation en attente */}
          {state.confirmationStatus && !state.isConfirmed && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-blue-700">
                  <Info className="h-4 w-4" />
                  <span className="text-sm font-medium">Détails de la confirmation</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-blue-600">Envoyé le :</span>
                    <p className="font-medium text-blue-800">
                      {state.confirmationStatus.created_at 
                        ? new Date(state.confirmationStatus.created_at).toLocaleString('fr-FR')
                        : 'N/A'
                      }
                    </p>
                  </div>
                  <div>
                    <span className="text-blue-600">Expire le :</span>
                    <p className="font-medium text-blue-800">
                      {new Date(state.confirmationStatus.expires_at).toLocaleString('fr-FR')}
                    </p>
                  </div>
                </div>

                {state.confirmationStatus.attempts > 0 && (
                  <div className="text-xs text-blue-600">
                    <span>Tentatives : </span>
                    <span className="font-medium">
                      {state.confirmationStatus.attempts}/{state.confirmationStatus.max_attempts}
                    </span>
                  </div>
                )}
              </div>
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
          {(state.isRequired && !state.isConfirmed) && (
            <div className="space-y-3">
              <Button
                onClick={handleResendEmail}
                disabled={!canResend || isResending || state.isLoading}
                className="w-full"
                variant="outline"
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
                    <Clock className="h-4 w-4 mr-2" />
                    Renvoyer dans {resendCooldownSeconds}s
                  </>
                )}
              </Button>

              <Button
                onClick={actions.refreshStatus}
                variant="ghost"
                className="w-full"
                disabled={state.isLoading}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                J'ai confirmé mon email
              </Button>
            </div>
          )}

          {/* Informations de sécurité */}
          <div className="bg-gray-50 border rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-gray-600">
                <p className="font-medium mb-1">Sécurité :</p>
                <ul className="space-y-1">
                  <li>• Les liens de confirmation expirent après 24 heures</li>
                  <li>• Chaque lien ne peut être utilisé qu'une seule fois</li>
                  <li>• Maximum 5 tentatives d'envoi par heure</li>
                </ul>
              </div>
            </div>
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

// Version compacte pour l'affichage dans d'autres composants
export const EmailConfirmationBadge: React.FC<{ user: User | null; className?: string }> = ({
  user,
  className = ""
}) => {
  const { state } = useEmailConfirmation(user);

  if (!user || !state.isRequired || state.isConfirmed) {
    return null;
  }

  if (state.isLoading) {
    return (
      <Badge variant="outline" className={`${className} gap-1`}>
        <RefreshCw className="h-3 w-3 animate-spin" />
        Vérification...
      </Badge>
    );
  }

  return (
    <Badge 
      variant="outline" 
      className={`${className} border-orange-200 text-orange-800 bg-orange-50 gap-1`}
    >
      <AlertCircle className="h-3 w-3" />
      Email non confirmé
    </Badge>
  );
};

// Hook utilitaire pour utiliser juste le badge
export const useEmailConfirmationBadge = (user: User | null) => {
  const { state } = useEmailConfirmation(user);
  
  return {
    shouldShow: user && state.isRequired && !state.isConfirmed && !state.isLoading,
    isLoading: state.isLoading,
    status: state.confirmationStatus?.status || 'unknown',
  };
};