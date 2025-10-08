import { useState, useEffect, useCallback, useRef } from 'react';
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
    isRequired: true, // Par défaut : confirmation requise
    isConfirmed: false, // Par défaut : non confirmé
    isLoading: true,
    confirmationStatus: null,
    canResendAt: null,
    error: null,
  });
  
  // Use ref to track if we're currently checking to prevent duplicate calls
  const isCheckingRef = useRef(false);
  const lastCheckRef = useRef<number>(0);

  // Vérifier le statut de confirmation
  const checkStatus = useCallback(async () => {
    // Prevent duplicate checks within 1 second
    const now = Date.now();
    if (isCheckingRef.current || (now - lastCheckRef.current < 1000)) {
      console.log('[useEmailConfirmation] Skipping duplicate check');
      return;
    }
    
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

    isCheckingRef.current = true;
    lastCheckRef.current = now;
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Vérifier si la confirmation est requise
      const needsConfirmation = await emailConfirmationService.needsEmailConfirmation(user.id);
      
      // User is confirmed when:
      // - needsConfirmation is false (meaning email_confirmed_at is NOT null AND email_confirmation_required is false)
      const isConfirmed = !needsConfirmation;
      
      if (!needsConfirmation) {
        setState(prev => ({
          ...prev,
          isRequired: false,
          isConfirmed: true,
          isLoading: false,
          confirmationStatus: null,
        }));
        isCheckingRef.current = false;
        return;
      }

      // Récupérer le statut actuel
      const confirmationStatus = await emailConfirmationService.getConfirmationStatus(user.id);
      
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
        // En cas d'erreur, ne pas bloquer seulement si l'utilisateur n'a pas d'email
        // Pour les utilisateurs avec email, on doit vérifier la confirmation
        isConfirmed: !user?.email,
        isRequired: !!user?.email,
      }));
    } finally {
      isCheckingRef.current = false;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]); // Only re-run when user ID changes, not when checkStatus changes

  // Subscription aux changements en temps réel
  useEffect(() => {
    if (!user?.id) return;

    let unsubscribe: (() => void) | null = null;

    try {
      unsubscribe = emailConfirmationService.subscribeToConfirmationStatus(
        user.id,
        (confirmationStatus) => {
          if (!confirmationStatus) return;

          console.log('[useEmailConfirmation] Realtime update:', confirmationStatus.status);

          // Update the confirmation status in state
          setState(prev => ({
            ...prev,
            confirmationStatus,
          }));
          
          // If the email was just confirmed, trigger a full status check
          // This will verify both email_confirmed_at and email_confirmation_required from profiles table
          if (confirmationStatus.status === 'confirmed') {
            console.log('[useEmailConfirmation] Email confirmed in email_confirmations, checking profiles...');
            // The checkStatus has built-in duplicate prevention via refs
            setTimeout(() => {
              checkStatus();
            }, 500);
          }
        }
      );
    } catch (error) {
      console.warn('Realtime subscription failed:', error);
      // No polling fallback - user must manually refresh
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]); // Only depend on user.id, not checkStatus

  // REMOVED: No automatic polling - user must manually check status

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
    isConfirmed: false, // Changé: par défaut non confirmé
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
          // En cas d'erreur, considérer comme confirmé SEULEMENT pour les utilisateurs sans email
          setStatus({ 
            isConfirmed: !user?.email, 
            isLoading: false 
          });
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