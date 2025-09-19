import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Clock, Mail, RefreshCw } from 'lucide-react';
import { emailConfirmationService, EmailConfirmationStatus } from '@/services/emailConfirmationService';
import { toast } from '@/components/ui/use-toast';

interface EmailConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  userId: string;
  onConfirmed: () => void;
}

type ModalState = 'waiting' | 'confirmed' | 'expired' | 'failed';

export const EmailConfirmationModal: React.FC<EmailConfirmationModalProps> = ({
  isOpen,
  onClose,
  email,
  userId,
  onConfirmed
}) => {
  const [state, setState] = useState<ModalState>('waiting');
  const [confirmationData, setConfirmationData] = useState<EmailConfirmationStatus | null>(null);
  const [canResend, setCanResend] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0); // Nouveau state pour le cooldown
  const [isResending, setIsResending] = useState(false);
  const [pollingActive, setPolllingActive] = useState(false);

  // Fonction de polling fallback
  const pollConfirmationStatus = useCallback(async () => {
    if (!pollingActive) return;
    
    try {
      const status = await emailConfirmationService.getConfirmationStatus(userId);
      if (status) {
        // Créer une nouvelle référence d'objet pour forcer le déclenchement du useEffect
        setConfirmationData({ ...status });

        if (status.status === 'confirmed') {
          setState('confirmed');
          setTimeout(() => {
            onConfirmed();
            onClose();
          }, 2000);
        } else if (status.status === 'expired') {
          setState('expired');
        } else if (status.status === 'failed') {
          setState('failed');
        }
      }
    } catch (error) {
      console.warn('Erreur polling:', error);
    }
  }, [userId, onConfirmed, onClose, pollingActive]);

  // Setup subscription realtime + polling fallback
  useEffect(() => {
    if (!isOpen || !userId) return;

    setPolllingActive(true);
    let unsubscribe: (() => void) | null = null;
    let pollingInterval: NodeJS.Timeout | null = null;

    // Essayer d'abord Realtime
    try {
      unsubscribe = emailConfirmationService.subscribeToConfirmationStatus(
        userId,
        (status) => {
          if (!status) return;
          
          // Créer une nouvelle référence d'objet pour forcer le déclenchement du useEffect
          setConfirmationData({ ...status });
          
          if (status.status === 'confirmed') {
            setState('confirmed');
            setTimeout(() => {
              onConfirmed();
              onClose();
            }, 2000);
          } else if (status.status === 'expired') {
            setState('expired');
          } else if (status.status === 'failed') {
            setState('failed');
          }
        }
      );
      
      console.log('✅ Realtime subscription active');
    } catch (error) {
      console.warn('⚠️ Realtime failed, using polling:', error);
    }

    // Polling de secours toutes les 10 secondes
    pollingInterval = setInterval(() => {
      console.log('EmailConfirmationModal: Polling for status...');
      pollConfirmationStatus();
    }, 10000);
    
    // Premier appel immédiat
    console.log('EmailConfirmationModal: Initial poll for status...');
    pollConfirmationStatus();

    return () => {
      setPolllingActive(false);
      if (unsubscribe) unsubscribe();
      if (pollingInterval) {
        clearInterval(pollingInterval);
        console.log('EmailConfirmationModal: Polling interval cleared.');
      }
    };
  }, [isOpen, userId, pollConfirmationStatus]);

  // Cooldown pour renvoi
  useEffect(() => {
    console.log('EmailConfirmationModal useEffect [isOpen, confirmationData] triggered.');
    let timer: NodeJS.Timeout | null = null;

    if (isOpen) {
      // Initialisation du cooldown au moment de l'ouverture du modal ou du changement de confirmationData
      const now = new Date();
      let initialCanResend = true;
      let initialResendCooldown = 0;

      if (confirmationData?.last_sent_at) {
        const lastSent = new Date(confirmationData.last_sent_at);
        const cooldownMs = 60000; // 60 secondes
        const timeSinceLastSend = now.getTime() - lastSent.getTime();
        const remainingCooldown = Math.ceil((cooldownMs - timeSinceLastSend) / 1000);

        if (remainingCooldown > 0) {
          initialResendCooldown = remainingCooldown;
          initialCanResend = false;
        }
      }
      console.log('EmailConfirmationModal: confirmationData', confirmationData);
      console.log('EmailConfirmationModal: last_sent_at', confirmationData?.last_sent_at);
      console.log('EmailConfirmationModal: initialResendCooldown', initialResendCooldown);
      console.log('EmailConfirmationModal: initialCanResend', initialCanResend);

      setCanResend(initialCanResend);
      setResendCooldown(initialResendCooldown);

      console.log('EmailConfirmationModal useEffect: Initializing cooldown. initialResendCooldown:', initialResendCooldown, 'initialCanResend:', initialCanResend);

      // Démarrer le timer de décrémentation si un cooldown est actif
      if (initialResendCooldown > 0) {
        timer = setInterval(() => {
          setResendCooldown(prevCooldown => {
            const newCooldown = prevCooldown - 1;
            console.log('EmailConfirmationModal useEffect: Decrementing cooldown. Current:', prevCooldown, 'New:', newCooldown);
            if (newCooldown <= 0) {
              setCanResend(true);
              return 0;
            }
            return newCooldown;
          });
        }, 1000);
      }
    } else {
      console.log('EmailConfirmationModal useEffect: Modal is closed or not open, clearing timer.');
    }

    return () => {
      if (timer) {
        clearInterval(timer);
        console.log('EmailConfirmationModal useEffect: Timer cleared.');
      }
    };
  }, [isOpen, confirmationData]);

  // Handler pour renvoyer l'email
  const handleResend = async () => {
    if (!canResend || isResending) return;
    
    setIsResending(true);
    
    try {
      const result = await emailConfirmationService.sendConfirmationEmail({
        email,
        userId,
        isResend: true
      });

      console.log('handleResend: Result from sendConfirmationEmail:', result);

      if (result.success) {
        toast({
          title: "Email renvoyé !",
          description: "Un nouveau lien de confirmation vous a été envoyé.",
        });
        setCanResend(false); // Désactiver le bouton après renvoi
        setResendCooldown(60); // Réinitialiser le cooldown
        console.log('handleResend: Email sent successfully. Cooldown reset to 60s.');
      } else {
        emailConfirmationService.showResultToast(result);
        // Si le renvoi échoue à cause d'une limite de taux, mettre à jour le cooldown avec la valeur du backend
        if (result.message && result.message.includes("Limite de taux atteinte")) {
          console.log('handleResend: Rate limit message detected:', result.message);
          const match = result.message.match(/Réessayer après: (\d+) s/);
          if (match && match[1]) {
            const backendCooldown = parseInt(match[1], 10);
            setResendCooldown(backendCooldown);
            setCanResend(false);
            console.log(`handleResend: Cooldown mis à jour depuis le backend: ${backendCooldown}s`);
          } else {
            console.log('handleResend: Regex match failed for cooldown value.');
          }
        } else {
          console.log('handleResend: No rate limit message or regex failed.');
        }
      }
    } catch (error) {
      console.error('handleResend: Error during resend:', error);
      toast({
        title: "Erreur",
        description: "Impossible de renvoyer l'email. Réessayez plus tard.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  const getStateIcon = () => {
    switch (state) {
      case 'waiting':
        return <Mail className="h-12 w-12 text-aurentia-orange animate-pulse" />;
      case 'confirmed':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'expired':
        return <Clock className="h-8 w-8 text-orange-500" />;
      case 'failed':
        return <AlertCircle className="h-8 w-8 text-red-500" />;
      default:
        return <Mail className="h-8 w-8 text-gray-500" />;
    }
  };

  const getStateTitle = () => {
    switch (state) {
      case 'waiting':
        return 'Confirmez votre email';
      case 'confirmed':
        return 'Email confirmé !';
      case 'expired':
        return 'Lien expiré';
      case 'failed':
        return 'Erreur de confirmation';
      default:
        return 'Confirmation d\'email';
    }
  };

  const getStateDescription = () => {
    switch (state) {
      case 'waiting':
        return (
          <>
            Nous avons envoyé un email de confirmation à <strong>{email}</strong>. Cliquez sur le lien dans l'email pour activer votre compte.
          </>
        );
      case 'confirmed':
        return 'Parfait ! Votre compte est maintenant activé. Redirection en cours...';
      case 'expired':
        return 'Le lien de confirmation a expiré. Vous pouvez demander un nouveau lien ci-dessous.';
      case 'failed':
        return 'Une erreur s\'est produite lors de la confirmation. Veuillez réessayer.';
      default:
        return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Mail className="h-12 w-12 text-aurentia-orange" />
          </div>
          <DialogTitle className="text-xl font-semibold text-center">
            {getStateTitle()}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Description */}
          <p className="text-sm text-gray-600 leading-relaxed text-center">
            {getStateDescription()}
          </p>

          {/* Status info */}
          {state === 'confirmed' && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 text-green-700">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Confirmation réussie</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3">
            {/* Bouton renvoi (waiting ou expired) */}
            {(state === 'waiting' || state === 'expired') && (
              <Button
                onClick={handleResend}
                disabled={!canResend || isResending}
                className="w-full bg-aurentia-orange text-white hover:bg-aurentia-orange/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Envoi en cours...
                  </>
                ) : canResend ? (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Renvoyer l'email
                  </>
                ) : (
                  <>
                    <Clock className="h-4 w-4 mr-2" />
                    Renvoi d'email possible dans {resendCooldown}s
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Info technique */}
          {state === 'waiting' && (
            <div className="bg-aurentia-orange/10 border border-aurentia-orange/30 rounded-lg p-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-4 w-4 text-aurentia-orange mt-0.5 flex-shrink-0" />
                <div className="text-sm text-aurentia-orange-dark">
                  <p className="font-medium mb-1">Pas d'email reçu ?</p>
                  <ul className="space-y-1 text-aurentia-orange-darker">
                    <li>• Vérifiez votre dossier spam/indésirables</li>
                    <li>• Attendez quelques minutes (délai de livraison)</li>
                    <li>• Utilisez le bouton "Renvoyer" si nécessaire</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
