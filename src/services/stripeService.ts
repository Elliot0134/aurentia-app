import { supabase } from '@/integrations/supabase/client';

export interface PaymentPlan {
  id: string;
  name: string;
  price: string;
  stripeUrl: string;
}

export const PAYMENT_PLANS: Record<string, PaymentPlan> = {
  plan1: {
    id: 'plan1',
    name: 'Plan 1',
    price: '2€',
    stripeUrl: 'https://buy.stripe.com/6oU9AUgDs1mgbqhbif0gw04'
  },
  plan2: {
    id: 'plan2', 
    name: 'Plan 2',
    price: '6€',
    stripeUrl: 'https://buy.stripe.com/8x2bJ2gDs8OIgKB8630gw05'
  }
};

export interface PaymentResult {
  success: boolean;
  error?: string;
}

class StripeService {
  
  async initiatePayment(planId: string, projectId: string): Promise<PaymentResult> {
    try {
      // Get current user
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError || !session?.user) {
        return {
          success: false,
          error: 'Vous devez être connecté pour effectuer un paiement'
        };
      }

      const userId = session.user.id;
      const plan = PAYMENT_PLANS[planId];
      
      if (!plan) {
        return {
          success: false,
          error: 'Plan de paiement invalide'
        };
      }

      // Update project status to waiting payment
      const newStatus = planId === 'plan1' ? 'pay_1_waiting' : 'pay_2_waiting';
      const { error: updateError } = await supabase
        .from('project_summary')
        .update({ statut_project: newStatus })
        .eq('project_id', projectId);

      if (updateError) {
        console.error('❌ Erreur mise à jour statut projet:', updateError);
        return {
          success: false,
          error: 'Erreur lors de la mise à jour du statut du projet'
        };
      }

      console.log(`✅ Statut projet mis à jour: ${newStatus}`);

      // Store payment intent data for later processing
      const paymentData = {
        userId,
        projectId,
        planId,
        planName: plan.name,
        timestamp: Date.now()
      };

      // Store in localStorage for retrieval after payment
      localStorage.setItem('aurentia_payment_data', JSON.stringify(paymentData));
      
      // Open Stripe checkout
      window.open(plan.stripeUrl, '_blank');
      
      return { success: true };
      
    } catch (error) {
      console.error('Erreur lors de l\'initiation du paiement:', error);
      return {
        success: false,
        error: 'Erreur lors de l\'initiation du paiement'
      };
    }
  }

  async checkProjectStatus(projectId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('project_summary')
        .select('statut_project')
        .eq('project_id', projectId)
        .single();

      if (error) {
        console.error('❌ Erreur vérification statut projet:', error);
        return null;
      }

      return data?.statut_project || null;
    } catch (error) {
      console.error('❌ Erreur lors de la vérification du statut:', error);
      return null;
    }
  }

  async processPaymentSuccess(planId: string, projectId: string, userId: string): Promise<PaymentResult> {
    try {
      console.log(`🚀 Traitement du paiement réussi - Plan: ${planId}, Projet: ${projectId}, User: ${userId}`);
      
      // Clear payment data from localStorage immediately to prevent re-triggering
      localStorage.removeItem('aurentia_payment_data');

      // Double-check that the project status is 'payment_receive' before proceeding
      const currentStatus = await this.checkProjectStatus(projectId);
      console.log(`🔍 Vérification finale du statut: ${currentStatus}`);
      
      if (currentStatus !== 'payment_receive') {
        console.error(`❌ Statut incorrect pour la génération: ${currentStatus}`);
        return {
          success: false,
          error: `Statut incorrect pour la génération des livrables: ${currentStatus}`
        };
      }

      console.log('✅ Statut confirmé: payment_receive, génération des livrables...');

      // Update user credits for plan1
      if (planId === 'plan1') {
        console.log('💳 Mise à jour des crédits pour Plan 1...');
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            credits_restants: '50',
            credit_limit: '50'
          })
          .eq('id', userId);

        if (updateError) {
          console.error('❌ Erreur mise à jour crédits:', updateError);
          throw new Error('Erreur lors de la mise à jour des crédits');
        }
        
        console.log('✅ Crédits mis à jour: 50 crédits ajoutés');
        
        // Dispatch custom event to notify context about credit update
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('creditsUpdated', { 
            detail: { current: 50, max: 50 } 
          }));
        }
      }
      
      // Call the webhook
      console.log('🌐 Appel du webhook de génération des livrables...');
      const webhookResponse = await fetch('https://n8n.eec-technologies.fr/webhook/generation-livrables-premium', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: projectId,
          user_id: userId,
          plan: planId
        }),
      });

      if (!webhookResponse.ok) {
        throw new Error(`Webhook failed with status: ${webhookResponse.status}`);
      } 
      
      const webhookResult = await webhookResponse.json();
      console.log('✅ Webhook response:', webhookResult);
      
      return { success: true };

    } catch (error) {
      console.error('❌ Erreur lors du traitement du paiement:', error);
      return {
        success: false,
        error: 'Erreur lors du traitement du paiement. Veuillez contacter le support.'
      };
    }
  }

  // Method to check for pending payment on page load
  checkPendingPayment(): { userId: string; projectId: string; planId: string } | null {
    try {
      const paymentDataStr = localStorage.getItem('aurentia_payment_data');
      if (!paymentDataStr) return null;

      const paymentData = JSON.parse(paymentDataStr);
      
      // Check if payment data is not too old (5 minutes max)
      const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
      if (paymentData.timestamp < fiveMinutesAgo) {
        localStorage.removeItem('aurentia_payment_data');
        return null;
      }

      return {
        userId: paymentData.userId,
        projectId: paymentData.projectId,
        planId: paymentData.planId
      };
    } catch (error) {
      console.error('Erreur lors de la vérification du paiement en attente:', error);
      return null;
    }
  }
}

export const stripeService = new StripeService();
