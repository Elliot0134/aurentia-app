import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { stripeService, type PaymentResult, SUBSCRIPTION_PLAN, PREMIUM_DELIVERABLES_COST } from '../services/stripeService';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';

export const useStripePayment = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isWaitingSubscription, setIsWaitingSubscription] = useState(false);
  const [isWaitingDeliverables, setIsWaitingDeliverables] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const deliverablesPollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasShownSuccessToast = useRef<boolean>(false);
  const hasShownCompletionToast = useRef<boolean>(false);

  const startStatusPolling = (projectId: string, userId: string) => {
    console.log(`🔄 Démarrage du polling pour le projet ${projectId}`);
    setCurrentProjectId(projectId);
    setCurrentUserId(userId);
    setIsWaitingSubscription(true);
    setPaymentStatus('processing');

    // Start polling every 4 seconds
    pollingIntervalRef.current = setInterval(async () => {
      const status = await stripeService.checkProjectStatus(projectId);
      console.log(`🔍 Vérification statut projet: ${status}`);
      
      if (status === 'payment_receive') {
        console.log('✅ Paiement reçu, arrêt du polling et déclenchement du webhook...');
        
        // Stop subscription polling
        clearInterval(pollingIntervalRef.current!);
        pollingIntervalRef.current = null;
        setIsWaitingSubscription(false);
        
        // Trigger the webhook call
        await processSubscriptionCallback(projectId, userId);
        setIsWaitingDeliverables(true);
        
      } else if (status === 'subscription_waiting') {
        console.log('⏳ En attente de l\'abonnement...');
        // Continue polling
      } else if (status === 'subscription_active') {
        console.log('✅ Abonnement actif détecté, arrêt du polling.');
        
        // Stop subscription polling
        clearInterval(pollingIntervalRef.current!);
        pollingIntervalRef.current = null;
        setIsWaitingSubscription(false);
        setPaymentStatus('success');
        
        // Only show toast once
        if (!hasShownSuccessToast.current) {
          toast.success('Abonnement activé !');
          hasShownSuccessToast.current = true;
        }
        
      } else if (status === 'free') {
        console.log('ℹ️ Projet en statut gratuit, arrêt du polling');
        clearInterval(pollingIntervalRef.current!);
        pollingIntervalRef.current = null;
        setIsWaitingSubscription(false);
        setPaymentStatus('idle');
      } else {
        console.log('❌ Statut inattendu:', status);
        // Stop polling if status is unexpected
        clearInterval(pollingIntervalRef.current!);
        pollingIntervalRef.current = null;
        setIsWaitingSubscription(false);
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
    setIsWaitingSubscription(false);
    setCurrentProjectId(null);
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
        
        // Dispatch custom event to notify UI to refresh deliverables content
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('deliverablesCompleted', {
            detail: { projectId: projectId }
          }));
        }
        
        navigate(`/project-business/${projectId}`);
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

  const processSubscriptionCallback = async (projectId: string, userId: string): Promise<void> => {
    try {
      setIsLoading(true);
      setPaymentStatus('processing');
      setPaymentError(null);

      console.log('🔄 Traitement de l\'abonnement en cours...');
      
      const result = await stripeService.processSubscriptionSuccess(projectId, userId);
      
      if (result.success) {
        setPaymentStatus('success');
        
        // Only show success toast once
        if (!hasShownSuccessToast.current) {
          toast.success('Abonnement validé ! Génération des livrables en cours...');
          hasShownSuccessToast.current = true;
        }
        
        // Start deliverables polling
        startDeliverablesPolling(projectId);
        
        setIsLoading(false);
        
      } else {
        throw new Error(result.error || 'Erreur lors du traitement');
      }
      
    } catch (error) {
      console.error('❌ Erreur lors du traitement de l\'abonnement:', error);
      setPaymentError(error instanceof Error ? error.message : 'Erreur lors du traitement de l\'abonnement');
      setPaymentStatus('error');
      setIsLoading(false);
      setIsWaitingSubscription(false);
      toast.error('Erreur lors du traitement de l\'abonnement');
    }
  };

  const initiateSubscription = async (projectId: string): Promise<void> => {
    try {
      console.log(`🚀 Initiation de l'abonnement - Projet: ${projectId}`);
      setPaymentError(null);
      setPaymentStatus('idle');
      
      const result = await stripeService.initiateSubscription(projectId);
      
      if (!result.success) {
        console.error('❌ Échec de l\'initiation de l\'abonnement:', result.error);
        setPaymentError(result.error || 'Erreur lors de l\'initiation de l\'abonnement');
        setPaymentStatus('error');
        toast.error(result.error || 'Erreur lors de l\'initiation de l\'abonnement');
        return;
      }

      console.log('✅ Initiation de l\'abonnement réussie, démarrage du polling...');

      // Get current user for polling
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Start polling for subscription status
        startStatusPolling(projectId, session.user.id);
      } else {
        console.error('❌ Aucune session utilisateur trouvée');
        setPaymentError('Session utilisateur non trouvée');
        setPaymentStatus('error');
      }

      // Subscription window opened successfully
      toast.success('Redirection vers l\'abonnement...');
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'initiation de l\'abonnement:', error);
      setPaymentError('Erreur inattendue lors de l\'initiation de l\'abonnement');
      setPaymentStatus('error');
      toast.error('Erreur inattendue lors de l\'initiation de l\'abonnement');
    }
  };

  const generatePremiumDeliverables = async (projectId: string): Promise<void> => {
    try {
      console.log(`🚀 Génération des livrables premium - Projet: ${projectId}`);
      setPaymentError(null);
      setPaymentStatus('idle');
      
      const result = await stripeService.initiatePremiumGeneration(projectId);
      
      if (!result.success) {
        console.error('❌ Échec de la génération des livrables premium:', result.error);
        setPaymentError(result.error || 'Erreur lors de la génération des livrables premium');
        setPaymentStatus('error');
        toast.error(result.error || 'Erreur lors de la génération des livrables premium');
        return;
      }

      console.log('✅ Génération des livrables premium réussie');
      setPaymentStatus('success');
      
      // Start deliverables polling
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentProjectId(projectId);
        setCurrentUserId(session.user.id);
        startDeliverablesPolling(projectId);
      }

      toast.success(result.message || 'Génération des livrables premium en cours...');
      
    } catch (error) {
      console.error('❌ Erreur lors de la génération des livrables premium:', error);
      setPaymentError('Erreur inattendue lors de la génération des livrables premium');
      setPaymentStatus('error');
      toast.error('Erreur inattendue lors de la génération des livrables premium');
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
  };

  const cancelSubscription = async () => {
    console.log('❌ Annulation de l\'abonnement par l\'utilisateur');
    
    // Reset project status to "free" if we have current project info and it's in waiting state
    if (currentProjectId) {
      try {
        // First check the current status
        const currentStatus = await stripeService.checkProjectStatus(currentProjectId);
        console.log('🔍 Statut actuel du projet:', currentStatus);
        
        // Only update to "free" if currently in waiting state
        if (currentStatus === 'subscription_waiting') {
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
    localStorage.removeItem('aurentia_subscription_data');
    setIsLoading(false);
    setPaymentStatus('idle');
    setPaymentError(null);
    setIsWaitingSubscription(false);
    setIsWaitingDeliverables(false);
    hasShownSuccessToast.current = false;
    hasShownCompletionToast.current = false;
    toast.info('Abonnement annulé');
  };

  // Check for pending subscription on mount and when window gains focus
  useEffect(() => {
    const checkSubscription = async () => {
      const pendingSubscription = stripeService.checkPendingSubscription();
      if (pendingSubscription) {
        console.log('🔍 Données d\'abonnement trouvées dans localStorage, vérification du statut...');
        
        // Check current project status before starting polling
        const currentStatus = await stripeService.checkProjectStatus(pendingSubscription.projectId);
        console.log(`📊 Statut actuel du projet: ${currentStatus}`);
        
        // Only start polling if the project is still in waiting state
        if (currentStatus === 'subscription_waiting') {
          console.log('✅ Projet toujours en attente, redémarrage du polling...');
          startStatusPolling(pendingSubscription.projectId, pendingSubscription.userId);
        } else if (currentStatus === 'payment_receive') {
          console.log('✅ Paiement déjà reçu, vérification des livrables...');
          const deliverablesComplete = await stripeService.checkDeliverablesCompletion(pendingSubscription.projectId);
          if (!deliverablesComplete) {
            console.log('⏳ Livrables non complets, redémarrage du polling des livrables...');
            startDeliverablesPolling(pendingSubscription.projectId);
          } else {
            console.log('✅ Livrables déjà complets, nettoyage des données...');
            localStorage.removeItem('aurentia_subscription_data');
          }
        } else if (currentStatus === 'subscription_active') {
          console.log('✅ Abonnement déjà actif, nettoyage des données...');
          localStorage.removeItem('aurentia_subscription_data');
        } else {
          console.log('ℹ️ Projet plus en attente d\'abonnement, nettoyage des données...');
          localStorage.removeItem('aurentia_subscription_data');
        }
      }
    };

    // Check immediately
    checkSubscription();

    // Check when window gains focus (user comes back from Stripe)
    const handleFocus = () => {
      // Small delay to ensure localStorage is updated
      setTimeout(checkSubscription, 1000);
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
    isWaitingSubscription,
    isWaitingDeliverables,
    initiateSubscription,
    generatePremiumDeliverables,
    resetPaymentState,
    cancelSubscription,
    // Informations sur l'abonnement et les coûts
    subscriptionPlan: SUBSCRIPTION_PLAN,
    premiumCost: PREMIUM_DELIVERABLES_COST
  };
};
