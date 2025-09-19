import { useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { emailConfirmationService, EmailConfirmationStatus } from '@/services/emailConfirmationService';

export interface EmailConfirmationState {
  isRequired: boolean;
  isConfirmed: boolean;
  isLoading: boolean;
  confirmationStatus: EmailConfirmationStatus | null;
  canResendAt: Date | null;
  error: string | null;
}

export interface EmailConfirmationActions {
  sendConfirmationEmail: () => Promise<boolean>;
  checkStatus: () => Promise<void>;
  refreshStatus: () => void;
}

export interface UseEmailConfirmationReturn {
  state: EmailConfirmationState;
  actions: EmailConfirmationActions;
}

export const useEmailConfirmation = (user: User | null): UseEmailConfirmationReturn => {
  const [state, setState] = useState<EmailConfirmationState>({
    isRequired: false,
    isConfirmed: true, // Par défaut confirmé pour éviter les blocages
    isLoading: true,
    confirmationStatus: null,
    canResendAt: null,
    error: null,
  });

  // Vérifier le statut de confirmation
  const checkStatus = useCallback(async () => {
    if (!user) {
      setState(prev => ({
        ...prev,
        isRequired: false,
        isConfirmed: true,
        isLoading: false,
        confirmationStatus: null,
      }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Vérifier si la confirmation est requise
      const needsConfirmation = await emailConfirmationService.needsEmailConfirmation(user.id);
      
      if (!needsConfirmation) {
        setState(prev => ({
          ...prev,
          isRequired: false,
          isConfirmed: true,
          isLoading: false,
          confirmationStatus: null,
        }));
        return;
      }

      // Récupérer le statut actuel
      const confirmationStatus = await emailConfirmationService.getConfirmationStatus(user.id);
      
      const isConfirmed = confirmationStatus?.status === 'confirmed';
      let canResendAt: Date | null = null;

      // Calculer quand on peut renvoyer l'email
      if (confirmationStatus?.last_sent_at) {
        const lastSent = new Date(confirmationStatus.last_sent_at);
        canResendAt = new Date(lastSent.getTime() + 60000); // 60 secondes
      }

      setState(prev => ({
        ...prev,
        isRequired: needsConfirmation,
        isConfirmed,
        isLoading: false,
        confirmationStatus,
        canResendAt,
        error: null,
      }));

    } catch (error: any) {
      console.error('Erreur vérification confirmation:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Erreur lors de la vérification',
        // En cas d'erreur, considérer comme confirmé pour ne pas bloquer
        isConfirmed: true,
        isRequired: false,
      }));
    }
  }, [user]);

  // Envoyer un email de confirmation
  const sendConfirmationEmail = useCallback(async (): Promise<boolean> => {
    if (!user?.email) return false;

    setState(prev => ({ ...prev, error: null }));

    try {
      const result = await emailConfirmationService.sendConfirmationEmail({
        email: user.email,
        userId: user.id,
        isResend: true,
      });

      if (result.success) {
        // Recalculer le cooldown
        const canResendAt = new Date(Date.now() + 60000); // 60 secondes
        setState(prev => ({
          ...prev,
          canResendAt,
          error: null,
        }));
        
        // Rafraîchir le statut dans quelques secondes
        setTimeout(() => {
          checkStatus();
        }, 2000);

        return true;
      } else {
        setState(prev => ({
          ...prev,
          error: result.error || 'Erreur lors de l\'envoi',
        }));
        return false;
      }
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Erreur lors de l\'envoi',
      }));
      return false;
    }
  }, [user, checkStatus]);

  // Rafraîchir manuellement le statut
  const refreshStatus = useCallback(() => {
    checkStatus();
  }, [checkStatus]);

  // Setup des subscriptions et vérifications initiales
  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  // Subscription aux changements en temps réel
  useEffect(() => {
    if (!user) return;

    let unsubscribe: (() => void) | null = null;

    try {
      unsubscribe = emailConfirmationService.subscribeToConfirmationStatus(
        user.id,
        (confirmationStatus) => {
          if (!confirmationStatus) return;

          setState(prev => ({
            ...prev,
            confirmationStatus,
            isConfirmed: confirmationStatus.status === 'confirmed',
          }));

          // Si confirmé, rafraîchir tout le statut pour mettre à jour isRequired
          if (confirmationStatus.status === 'confirmed') {
            setTimeout(() => {
              checkStatus();
            }, 1000);
          }
        }
      );
    } catch (error) {
      console.warn('Realtime subscription failed:', error);
      // Utiliser le polling comme fallback
      const interval = setInterval(() => {
        checkStatus();
      }, 30000); // Toutes les 30 secondes

      return () => clearInterval(interval);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user, checkStatus]);

  // Polling de secours si pas de changements en temps réel
  useEffect(() => {
    if (!user || !state.isRequired || state.isConfirmed) return;

    const interval = setInterval(() => {
      checkStatus();
    }, 15000); // Toutes les 15 secondes si en attente

    return () => clearInterval(interval);
  }, [user, state.isRequired, state.isConfirmed, checkStatus]);

  return {
    state,
    actions: {
      sendConfirmationEmail,
      checkStatus,
      refreshStatus,
    },
  };
};

// Hook utilitaire pour vérifier rapidement si l'utilisateur est bloqué
export const useEmailConfirmationRequired = (user: User | null): boolean => {
  const { state } = useEmailConfirmation(user);
  return state.isRequired && !state.isConfirmed;
};

// Hook pour obtenir juste le statut de confirmation (plus léger)
export const useEmailConfirmationStatus = (user: User | null) => {
  const [status, setStatus] = useState<{
    isConfirmed: boolean;
    isLoading: boolean;
  }>({
    isConfirmed: true, // Par défaut confirmé
    isLoading: false,
  });

  useEffect(() => {
    if (!user) {
      setStatus({ isConfirmed: true, isLoading: false });
      return;
    }

    let mounted = true;
    
    const checkStatus = async () => {
      try {
        setStatus(prev => ({ ...prev, isLoading: true }));
        
        const needsConfirmation = await emailConfirmationService.needsEmailConfirmation(user.id);
        
        if (mounted) {
          setStatus({
            isConfirmed: !needsConfirmation,
            isLoading: false,
          });
        }
      } catch (error) {
        if (mounted) {
          // En cas d'erreur, considérer comme confirmé pour ne pas bloquer
          setStatus({ isConfirmed: true, isLoading: false });
        }
      }
    };

    checkStatus();

    return () => {
      mounted = false;
    };
  }, [user]);

  return status;
};