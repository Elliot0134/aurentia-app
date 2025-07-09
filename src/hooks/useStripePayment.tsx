import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { stripeService, type PaymentResult } from '../services/stripeService';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';

export const useStripePayment = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isWaitingPayment, setIsWaitingPayment] = useState(false);
  const [isWaitingDeliverables, setIsWaitingDeliverables] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const deliverablesPollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasShownSuccessToast = useRef<boolean>(false);
  const hasShownCompletionToast = useRef<boolean>(false);

  const startStatusPolling = (projectId: string, planId: string, userId: string) => {
    console.log(`🔄 Démarrage du polling pour le projet ${projectId}, plan ${planId}`);
    setCurrentProjectId(projectId);
    setCurrentPlanId(planId);
    setCurrentUserId(userId);
    setIsWaitingPayment(true);
    setPaymentStatus('processing');

    // Start polling every 4 seconds
    pollingIntervalRef.current = setInterval(async () => {
      const status = await stripeService.checkProjectStatus(projectId);
      console.log(`🔍 Vérification statut projet: ${status}`);
      
      if (status === 'payment_receive') {
        console.log('✅ Paiement reçu, arrêt du polling Stripe et déclenchement du webhook...');
        
        // Stop Stripe polling
        clearInterval(pollingIntervalRef.current!);
        pollingIntervalRef.current = null;
        setIsWaitingPayment(false);
        
        // Trigger the webhook call via processPaymentCallback
        await processPaymentCallback(planId, projectId, userId);
        setIsWaitingDeliverables(true);
        
      } else if (status === 'pay_1_waiting' || status === 'pay_2_waiting') {
        console.log('⏳ En attente du paiement...');
        // Continue polling
      } else if (status === 'plan1' || status === 'plan2') {
        console.log('✅ Statut plan détecté, arrêt du polling Stripe et considération comme succès.');
        
        // Stop Stripe polling
        clearInterval(pollingIntervalRef.current!);
        pollingIntervalRef.current = null;
        setIsWaitingPayment(false);
        setPaymentStatus('success'); // Set status to success as payment is already processed
        
        // Only show toast once
        if (!hasShownSuccessToast.current) {
          toast.success('Paiement déjà validé !');
          hasShownSuccessToast.current = true;
        }
        
      } else if (status === 'free') {
        console.log('ℹ️ Projet en statut gratuit, arrêt du polling');
        clearInterval(pollingIntervalRef.current!);
        pollingIntervalRef.current = null;
        setIsWaitingPayment(false);
        setPaymentStatus('idle');
      } else {
        console.log('❌ Statut inattendu:', status);
        // Stop polling if status is unexpected
        clearInterval(pollingIntervalRef.current!);
        pollingIntervalRef.current = null;
        setIsWaitingPayment(false);
        setPaymentStatus('error');
        setPaymentError('Statut de paiement inattendu');
      }
    }, 4000);
  };

  const stopStatusPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setIsWaitingPayment(false);
    setCurrentProjectId(null);
    setCurrentPlanId(null);
    setCurrentUserId(null);
  };

  const startDeliverablesPolling = (projectId: string) => {
    console.log(`🔄 Démarrage du polling des livrables pour le projet ${projectId}`);
    setIsWaitingDeliverables(true);

    // Start polling every 4 seconds for deliverables
    deliverablesPollingIntervalRef.current = setInterval(async () => {
      const deliverablesComplete = await stripeService.checkDeliverablesCompletion(projectId);
      
      if (deliverablesComplete) {
        console.log('✅ Tous les livrables sont générés !');
        clearInterval(deliverablesPollingIntervalRef.current!);
        deliverablesPollingIntervalRef.current = null;
        setIsWaitingDeliverables(false);
        
        // Only show completion toast once
        if (!hasShownCompletionToast.current) {
          toast.success('Le chargement des livrables est terminé !');
          hasShownCompletionToast.current = true;
        }
        
        navigate(`/project-business/${projectId}`); // Navigate here
      } else {
        console.log('⏳ Livrables en cours de génération...');
        // Continue polling
      }
    }, 4000);
  };

  const stopDeliverablesPolling = () => {
    if (deliverablesPollingIntervalRef.current) {
      clearInterval(deliverablesPollingIntervalRef.current);
      deliverablesPollingIntervalRef.current = null;
    }
    setIsWaitingDeliverables(false);
  };

  const processPaymentCallback = async (planId: string, projectId: string, userId: string): Promise<void> => {
    try {
      setIsLoading(true);
      setPaymentStatus('processing');
      setPaymentError(null);

      console.log('🔄 Traitement du paiement en cours...');
      
      const result = await stripeService.processPaymentSuccess(planId, projectId, userId);
      
      if (result.success) {
        setPaymentStatus('success');
        
        // Only show success toast once
        if (!hasShownSuccessToast.current) {
          toast.success('Paiement validé ! Génération des livrables en cours...');
          hasShownSuccessToast.current = true;
        }
        
        // Start deliverables polling here, and let it handle navigation and popup hiding
        startDeliverablesPolling(projectId); // Ensure this is called
        
        setIsLoading(false);
        
      } else {
        throw new Error(result.error || 'Erreur lors du traitement');
      }
      
    } catch (error) {
      console.error('❌ Erreur lors du traitement du paiement:', error);
      setPaymentError(error instanceof Error ? error.message : 'Erreur lors du traitement du paiement');
      setPaymentStatus('error');
      setIsLoading(false);
      setIsWaitingPayment(false);
      toast.error('Erreur lors du traitement du paiement');
    }
  };

  const initiatePayment = async (planId: string, projectId: string): Promise<void> => {
    try {
      console.log(`🚀 Initiation du paiement - Plan: ${planId}, Projet: ${projectId}`);
      setPaymentError(null);
      setPaymentStatus('idle');
      
      const result = await stripeService.initiatePayment(planId, projectId);
      
      if (!result.success) {
        console.error('❌ Échec de l\'initiation du paiement:', result.error);
        setPaymentError(result.error || 'Erreur lors de l\'initiation du paiement');
        setPaymentStatus('error');
        toast.error(result.error || 'Erreur lors de l\'initiation du paiement');
        return;
      }

      console.log('✅ Initiation du paiement réussie, démarrage du polling...');

      // Get current user for polling
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Start polling for payment status
        startStatusPolling(projectId, planId, session.user.id);
      } else {
        console.error('❌ Aucune session utilisateur trouvée');
        setPaymentError('Session utilisateur non trouvée');
        setPaymentStatus('error');
      }

      // Payment window opened successfully
      toast.success('Redirection vers le paiement...');
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'initiation du paiement:', error);
      setPaymentError('Erreur inattendue lors de l\'initiation du paiement');
      setPaymentStatus('error');
      toast.error('Erreur inattendue lors de l\'initiation du paiement');
    }
  };

  const resetPaymentState = () => {
    stopStatusPolling();
    stopDeliverablesPolling();
    setIsLoading(false);
    setPaymentStatus('idle');
    setPaymentError(null);
    hasShownSuccessToast.current = false;
    hasShownCompletionToast.current = false;
  };  const cancelPayment = async () => {
    console.log('❌ Annulation du paiement par l\'utilisateur');
    
    // Reset project status to "free" if we have current project info and it's in waiting state
    if (currentProjectId) {
      try {
        // First check the current status
        const currentStatus = await stripeService.checkProjectStatus(currentProjectId);
        console.log('🔍 Statut actuel du projet:', currentStatus);
        
        // Only update to "free" if currently in waiting state
        if (currentStatus === 'pay_1_waiting' || currentStatus === 'pay_2_waiting') {
          const { error } = await supabase
            .from('project_summary')
            .update({ statut_project: 'free' })
            .eq('project_id', currentProjectId);

          if (error) {
            console.error('❌ Erreur lors de la remise à zéro du statut projet:', error);
          } else {
            console.log(`✅ Statut projet remis de "${currentStatus}" à "free"`);
            // Dispatch custom event to notify UI to refresh project status/buttons
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('projectStatusUpdated', {
                detail: { projectId: currentProjectId, newStatus: 'free' }
              }));
            }
          }
        } else {
          console.log(`ℹ️ Pas de changement de statut nécessaire, statut actuel: ${currentStatus}`);
        }
      } catch (error) {
        console.error('❌ Erreur lors de la remise à zéro du statut projet:', error);
      }
    }

    stopStatusPolling();
    stopDeliverablesPolling();
    localStorage.removeItem('aurentia_payment_data');
    setIsLoading(false);
    setPaymentStatus('idle');
    setPaymentError(null);
    setIsWaitingPayment(false);
    setIsWaitingDeliverables(false);
    hasShownSuccessToast.current = false;
    hasShownCompletionToast.current = false;
    toast.info('Paiement annulé');
  };

  // Check for pending payment on mount and when window gains focus
  useEffect(() => {
    const checkPayment = async () => {
      const pendingPayment = stripeService.checkPendingPayment();
      if (pendingPayment) {
        console.log('🔍 Données de paiement trouvées dans localStorage, vérification du statut...');
        
        // Check current project status before starting polling
        const currentStatus = await stripeService.checkProjectStatus(pendingPayment.projectId);
        console.log(`📊 Statut actuel du projet: ${currentStatus}`);
        
        // Only start polling if the project is still in waiting state
        if (currentStatus === 'pay_1_waiting' || currentStatus === 'pay_2_waiting') {
          console.log('✅ Projet toujours en attente, redémarrage du polling...');
          startStatusPolling(pendingPayment.projectId, pendingPayment.planId, pendingPayment.userId);
        } else if (currentStatus === 'payment_receive') {
          console.log('✅ Paiement déjà reçu, vérification des livrables...');
          const deliverablesComplete = await stripeService.checkDeliverablesCompletion(pendingPayment.projectId);
          if (!deliverablesComplete) {
            console.log('⏳ Livrables non complets, redémarrage du polling des livrables...');
            startDeliverablesPolling(pendingPayment.projectId);
            // Do not remove from localStorage yet, keep it for polling
          } else {
            console.log('✅ Livrables déjà complets, nettoyage des données...');
            localStorage.removeItem('aurentia_payment_data');
          }
        } else if (currentStatus === 'plan1' || currentStatus === 'plan2') {
          console.log('✅ Statut plan détecté, nettoyage des données...');
          // Assuming webhook was already triggered by processPaymentCallback
          localStorage.removeItem('aurentia_payment_data');
        } else {
          console.log('ℹ️ Projet plus en attente de paiement, nettoyage des données...');
          // Clear localStorage if project is no longer in waiting state
          localStorage.removeItem('aurentia_payment_data');
        }
      }
    };

    // Check immediately
    checkPayment();

    // Check when window gains focus (user comes back from Stripe)
    const handleFocus = () => {
      // Small delay to ensure localStorage is updated
      setTimeout(checkPayment, 1000);
    };

    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      stopStatusPolling();
      stopDeliverablesPolling();
    };
  }, []);

  return {
    isLoading,
    paymentStatus,
    paymentError,
    isWaitingPayment,
    isWaitingDeliverables,
    initiatePayment,
    resetPaymentState,
    cancelPayment
  };
};
