import { useState, useEffect } from 'react';
import { stripeService, type PaymentResult } from '@/services/stripeService';
import { toast } from 'sonner';

export const useStripePayment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [paymentError, setPaymentError] = useState<string | null>(null);

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
        }, 2000);
        
      } else {
        throw new Error(result.error || 'Erreur lors du traitement');
      }
      
    } catch (error) {
      console.error('❌ Erreur lors du traitement du paiement:', error);
      setPaymentError(error instanceof Error ? error.message : 'Erreur lors du traitement du paiement');
      setPaymentStatus('error');
      setIsLoading(false);
      toast.error('Erreur lors du traitement du paiement');
    }
  };

  const initiatePayment = async (planId: string, projectId: string): Promise<void> => {
    try {
      setPaymentError(null);
      setPaymentStatus('idle');
      
      const result = await stripeService.initiatePayment(planId, projectId);
      
      if (!result.success) {
        setPaymentError(result.error || 'Erreur lors de l\'initiation du paiement');
        setPaymentStatus('error');
        toast.error(result.error || 'Erreur lors de l\'initiation du paiement');
        return;
      }

      // Payment window opened successfully
      toast.success('Redirection vers le paiement...');
      
    } catch (error) {
      console.error('Erreur lors de l\'initiation du paiement:', error);
      setPaymentError('Erreur inattendue lors de l\'initiation du paiement');
      setPaymentStatus('error');
      toast.error('Erreur inattendue lors de l\'initiation du paiement');
    }
  };

  const resetPaymentState = () => {
    setIsLoading(false);
    setPaymentStatus('idle');
    setPaymentError(null);
  };

  // Check for pending payment on mount and when window gains focus
  useEffect(() => {
    const checkPayment = async () => {
      const pendingPayment = stripeService.checkPendingPayment();
      if (pendingPayment) {
        await processPaymentCallback(pendingPayment.planId, pendingPayment.projectId, pendingPayment.userId);
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
    };
  }, []);

  return {
    isLoading,
    paymentStatus,
    paymentError,
    initiatePayment,
    resetPaymentState
  };
}; 