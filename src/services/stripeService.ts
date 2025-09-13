import { supabase } from '@/integrations/supabase/client';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: string;
  credits: number;
  stripeUrl: string;
}

export interface CreditPack {
  id: string;
  name: string;
  credits: number;
  price: string;
  stripeUrl: string;
}

export const SUBSCRIPTION_PLAN: SubscriptionPlan = {
  id: 'monthly_subscription',
  name: 'Abonnement Mensuel Aurentia',
  price: '12,90€',
  credits: 1500,
  stripeUrl: 'https://buy.stripe.com/4gMfZidrg5Cwamd4TR0gw09'
};

// Function to create a payment intent record in database before redirecting to Stripe
const createPaymentIntent = async (userId: string, projectId: string): Promise<string | null> => {
  try {
    // Generate a unique payment intent ID
    const paymentIntentId = `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`🔄 Tentative de création payment intent: ${paymentIntentId} pour user: ${userId}, project: ${projectId}`);
    
    // Store payment intent in database in the public schema
    const { data, error } = await supabase
      .from('payment_intents')
      .insert({
        payment_intent_id: paymentIntentId,
        user_id: userId,
        project_id: projectId,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select();
    
    if (error) {
      console.error('❌ Erreur création payment intent:', error);
      console.error('❌ Détails de l\'erreur:', JSON.stringify(error, null, 2));
      return null;
    }
    
    console.log(`✅ Payment intent créé avec succès:`, data);
    console.log(`✅ Payment intent ID: ${paymentIntentId}`);
    return paymentIntentId;
  } catch (error) {
    console.error('❌ Erreur lors de la création du payment intent:', error);
    return null;
  }
};

// Function to generate Stripe URL with payment intent reference
const generateStripeUrlWithPaymentIntent = (baseUrl: string, paymentIntentId: string): string => {
  const url = new URL(baseUrl);
  
  // Add payment intent ID as client_reference_id (this should work with Payment Links)
  url.searchParams.append('client_reference_id', paymentIntentId);
  
  return url.toString();
};

// Packs de crédits (à configurer plus tard)
export const CREDIT_PACKS: Record<string, CreditPack> = {
  pack_10: {
    id: 'pack_10',
    name: 'Pack Starter',
    credits: 3000,
    price: '10€',
    stripeUrl: '' // À configurer
  },
  pack_20: {
    id: 'pack_20',
    name: 'Pack Pro',
    credits: 7000,
    price: '20€',
    stripeUrl: '' // À configurer
  },
  pack_50: {
    id: 'pack_50',
    name: 'Pack Expert',
    credits: 20000,
    price: '50€',
    stripeUrl: '' // À configurer
  }
};

// Coût fixe pour TOUS les livrables premium
export const PREMIUM_DELIVERABLES_COST = 1000;

export interface PaymentResult {
  success: boolean;
  error?: string;
  message?: string;
}

class StripeService {
  
  async initiateSubscription(projectId: string): Promise<PaymentResult> {
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

      // Update project status to waiting subscription
      const { error: updateError } = await supabase
        .from('project_summary')
        .update({ statut_project: 'subscription_waiting' })
        .eq('project_id', projectId);

      if (updateError) {
        console.error('❌ Erreur mise à jour statut projet:', updateError);
        return {
          success: false,
          error: 'Erreur lors de la mise à jour du statut du projet'
        };
      }

      console.log(`✅ Statut projet mis à jour: subscription_waiting`);

      // Store subscription intent data for later processing
      const subscriptionData = {
        userId,
        projectId,
        type: 'subscription',
        planName: SUBSCRIPTION_PLAN.name,
        timestamp: Date.now()
      };

      // Create payment intent record in database
      const paymentIntentId = await createPaymentIntent(userId, projectId);
      
      if (!paymentIntentId) {
        return {
          success: false,
          error: 'Erreur lors de la création de l\'intention de paiement'
        };
      }
      
      // Store in localStorage for retrieval after payment (with payment intent ID)
      const subscriptionDataWithIntent = {
        ...subscriptionData,
        paymentIntentId
      };
      localStorage.setItem('aurentia_subscription_data', JSON.stringify(subscriptionDataWithIntent));
      
      // Generate Stripe URL with payment intent reference
      const stripeUrlWithPaymentIntent = generateStripeUrlWithPaymentIntent(
        SUBSCRIPTION_PLAN.stripeUrl,
        paymentIntentId
      );
      
      console.log(`🔗 Ouverture du lien Stripe avec payment intent: ${paymentIntentId}`);
      
      // Open Stripe checkout with payment intent reference
      window.open(stripeUrlWithPaymentIntent, '_blank');
      
      return { success: true };
      
    } catch (error) {
      console.error('Erreur lors de l\'initiation de l\'abonnement:', error);
      return {
        success: false,
        error: 'Erreur lors de l\'initiation de l\'abonnement'
      };
    }
  }

  async initiatePremiumGeneration(projectId: string): Promise<PaymentResult> {
    try {
      // Get current user
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError || !session?.user) {
        return {
          success: false,
          error: 'Vous devez être connecté pour générer les livrables premium'
        };
      }

      const userId = session.user.id;

      // Vérifier si l'utilisateur peut générer gratuitement ou a assez de crédits
      const { data: canGenerate, error: checkError } = await supabase
        .rpc('billing.can_generate_premium_for_free', { p_user_id: userId });

      if (checkError) {
        console.error('❌ Erreur vérification premier livrable gratuit:', checkError);
        return {
          success: false,
          error: 'Erreur lors de la vérification des droits'
        };
      }

      if (!canGenerate) {
        // Vérifier les crédits disponibles
        const { data: balance, error: balanceError } = await supabase
          .rpc('billing.get_user_balance', { p_user_id: userId });

        if (balanceError || !balance) {
          console.error('❌ Erreur récupération solde:', balanceError);
          return {
            success: false,
            error: 'Erreur lors de la vérification du solde'
          };
        }

        if (balance.total_credits < PREMIUM_DELIVERABLES_COST) {
          return {
            success: false,
            error: `Crédits insuffisants. Vous avez ${balance.total_credits} crédits, ${PREMIUM_DELIVERABLES_COST} requis.`
          };
        }
      }

      // Générer les livrables premium
      const { data: result, error: generateError } = await supabase
        .rpc('billing.generate_premium_deliverables', {
          p_user_id: userId,
          p_project_id: projectId
        });

      if (generateError) {
        console.error('❌ Erreur génération livrables premium:', generateError);
        return {
          success: false,
          error: 'Erreur lors de la génération des livrables premium'
        };
      }

      // Update project status to payment_receive pour déclencher la génération
      const { error: updateError } = await supabase
        .from('project_summary')
        .update({ statut_project: 'payment_receive' })
        .eq('project_id', projectId);

      if (updateError) {
        console.error('❌ Erreur mise à jour statut projet:', updateError);
        return {
          success: false,
          error: 'Erreur lors de la mise à jour du statut du projet'
        };
      }

      return {
        success: true,
        message: result.free ? 'Premier livrable premium généré gratuitement !' : 'Livrables premium générés avec succès !'
      };
      
    } catch (error) {
      console.error('Erreur lors de la génération des livrables premium:', error);
      return {
        success: false,
        error: 'Erreur lors de la génération des livrables premium'
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

  async processSubscriptionSuccess(projectId: string, userId: string): Promise<PaymentResult> {
    try {
      console.log(`🚀 Traitement de l'abonnement réussi - Projet: ${projectId}, User: ${userId}`);
      
      // Clear subscription data from localStorage immediately to prevent re-triggering
      localStorage.removeItem('aurentia_subscription_data');

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

      console.log('✅ Statut confirmé: payment_receive, traitement de l\'abonnement...');

      // ÉTAPE 1: Ajouter les crédits mensuels d'abonnement
      console.log('💳 Ajout des crédits mensuels d\'abonnement...');
      const { error: creditsError } = await supabase.rpc('billing.add_credits', {
        p_user_id: userId,
        p_amount: 1500, // Crédits mensuels selon la configuration
        p_credit_type: 'monthly',
        p_description: 'Crédits mensuels abonnement Aurentia',
        p_stripe_reference: `subscription_${projectId}`
      });

      if (creditsError) {
        console.error('❌ Erreur lors de l\'ajout des crédits:', creditsError);
        throw new Error('Erreur lors de l\'ajout des crédits d\'abonnement');
      }

      console.log('✅ Crédits mensuels ajoutés avec succès');

      // ÉTAPE 2: Déclencher les événements de mise à jour UI
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('creditsUpdated'));
        window.dispatchEvent(new CustomEvent('subscriptionUpdated'));
      }

      // ÉTAPE 3: Appel du webhook pour génération des livrables premium
      // Note: Le statut d'abonnement sera mis à jour dans profiles.subscription_status par le workflow N8n
      console.log('🌐 Appel du webhook de génération des livrables premium...');
      const webhookResponse = await fetch('https://n8n.srv906204.hstgr.cloud/webhook/generation-livrables-premium', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: projectId,
          user_id: userId,
          type: 'subscription'
        }),
      });

      if (!webhookResponse.ok) {
        throw new Error(`Webhook failed with status: ${webhookResponse.status}`);
      }
      
      const webhookResult = await webhookResponse.json();
      console.log('✅ Webhook response:', webhookResult);
      
      return { success: true };

    } catch (error) {
      console.error('❌ Erreur lors du traitement de l\'abonnement:', error);
      return {
        success: false,
        error: 'Erreur lors du traitement de l\'abonnement. Veuillez contacter le support.'
      };
    }
  }

  // Method to check if all deliverables are generated
  async checkDeliverablesCompletion(projectId: string): Promise<boolean> {
    try {
      console.log('🔍 Vérification de la génération des livrables pour le projet:', projectId);
      
      // Check ressources_requises table
      const { data: ressourcesData, error: ressourcesError } = await supabase
        .from('ressources_requises')
        .select('ressources_materielles, ressources_humaines, ressources_techniques')
        .eq('project_id', projectId)
        .single();

      if (ressourcesError) {
        console.log('❌ Erreur lors de la vérification des ressources:', ressourcesError);
        return false;
      }

      // Check if all three resource fields are filled
      const ressourcesComplete = ressourcesData && 
        ressourcesData.ressources_materielles && 
        ressourcesData.ressources_humaines && 
        ressourcesData.ressources_techniques;

      console.log('📊 État des ressources:', {
        materielles: !!ressourcesData?.ressources_materielles,
        humaines: !!ressourcesData?.ressources_humaines,
        techniques: !!ressourcesData?.ressources_techniques,
        complete: ressourcesComplete
      });

      if (!ressourcesComplete) {
        return false;
      }

      // Check other premium deliverables tables
      const tablesToCheck = [
        'concurrence',
        'marche', 
        'business_model',
        'proposition_valeur'
      ];

      for (const table of tablesToCheck) {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .eq('project_id', projectId)
          .single();

        if (error || !data) {
          console.log(`❌ Table ${table} non complète ou erreur:`, error);
          return false;
        }

        // Check if the table has meaningful data (not just empty fields)
        const hasData = Object.values(data).some(value => 
          value && typeof value === 'string' && value.trim().length > 0
        );

        if (!hasData) {
          console.log(`❌ Table ${table} vide ou incomplète`);
          return false;
        }

        console.log(`✅ Table ${table} complète`);
      }

      console.log('✅ Tous les livrables sont générés !');
      return true;

    } catch (error) {
      console.error('❌ Erreur lors de la vérification des livrables:', error);
      return false;
    }
  }

  // Method to check for pending subscription on page load
  checkPendingSubscription(): { userId: string; projectId: string; type: string } | null {
    try {
      const subscriptionDataStr = localStorage.getItem('aurentia_subscription_data');
      if (!subscriptionDataStr) return null;

      const subscriptionData = JSON.parse(subscriptionDataStr);
      
      // Check if subscription data is not too old (5 minutes max)
      const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
      if (subscriptionData.timestamp < fiveMinutesAgo) {
        localStorage.removeItem('aurentia_subscription_data');
        return null;
      }

      return {
        userId: subscriptionData.userId,
        projectId: subscriptionData.projectId,
        type: subscriptionData.type
      };
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'abonnement en attente:', error);
      return null;
    }
  }

  // Method to get user credits balance
  async getUserBalance(userId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .rpc('billing.get_user_balance', { p_user_id: userId });

      if (error) {
        console.error('❌ Erreur récupération solde utilisateur:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération du solde:', error);
      return null;
    }
  }

  // Method to check if user can generate premium for free
  async canGeneratePremiumForFree(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('billing.can_generate_premium_for_free', { p_user_id: userId });

      if (error) {
        console.error('❌ Erreur vérification premier livrable gratuit:', error);
        return false;
      }

      return data || false;
    } catch (error) {
      console.error('❌ Erreur lors de la vérification du premier livrable gratuit:', error);
      return false;
    }
  }
}

export const stripeService = new StripeService();
