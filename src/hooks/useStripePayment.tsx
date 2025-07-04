import { useState, useEffect, useRef } from 'react';
import { stripeService, type PaymentResult } from '@/services/stripeService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useStripePayment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isWaitingPayment, setIsWaitingPayment] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
        console.log('✅ Paiement reçu, génération des livrables...');
        clearInterval(pollingIntervalRef.current!);
        pollingIntervalRef.current = null;
        
        // Process the payment success
        await processPaymentCallback(planId, projectId, userId);
      } else if (status === 'pay_1_waiting' || status === 'pay_2_waiting') {
        console.log('⏳ En attente du paiement...');
        // Continue polling
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

  const processPaymentCallback = async (planId: string, projectId: string, userId: string): Promise<void> => {
    try {
      setIsLoading(true);
      setPaymentStatus('processing');
      setPaymentError(null);

      console.log('🔄 Traitement du paiement en cours...');
      
      const result = await stripeService.processPaymentSuccess(planId, projectId, userId);
      
      if (result.success) {
        setPaymentStatus('success');
        toast.success('Paiement validé ! Génération des livrables en cours...');
        
        // Wait a bit to show success state
        setTimeout(() => {
          setIsLoading(false);
          setPaymentStatus('idle');
          setIsWaitingPayment(false);
        }, 2000);
        
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
    setIsLoading(false);
    setPaymentStatus('idle');
    setPaymentError(null);
  };

  const cancelPayment = () => {
    console.log('❌ Annulation du paiement par l\'utilisateur');
    stopStatusPolling();
    localStorage.removeItem('aurentia_payment_data');
    setIsLoading(false);
    setPaymentStatus('idle');
    setPaymentError(null);
    setIsWaitingPayment(false);
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
          console.log('✅ Paiement déjà reçu, traitement immédiat...');
          // Process immediately if payment was already received
          await processPaymentCallback(pendingPayment.planId, pendingPayment.projectId, pendingPayment.userId);
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
    };
  }, []);

  return {
    isLoading,
    paymentStatus,
    paymentError,
    isWaitingPayment,
    initiatePayment,
    resetPaymentState,
    cancelPayment
  };
}; 