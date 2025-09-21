import { supabase } from '@/integrations/supabase/client';

// Configuration des constantes Stripe pour Aurentia
export const AURENTIA_CONFIG = {
  SUBSCRIPTION: {
    PRODUCT_ID: 'prod_SyRjQAbqp3Qlv5',
    PRICE_ID: 'price_1S2UpoLIKukPrwK8M1Oi0qgS',
    MONTHLY_CREDITS: 1500,
    PRICE_EUROS: 12.90
  }
};

export interface SubscriptionStatus {
  isActive: boolean;
  subscriptionId?: string;
  customerId?: string;
  status?: string;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
}

export interface CreateSubscriptionResult {
  success: boolean;
  clientSecret?: string;
  subscriptionId?: string;
  error?: string;
}

export interface SubscriptionManagementResult {
  success: boolean;
  message?: string;
  error?: string;
}

class StripeAurentiaService {
  
  // === GESTION DES CLIENTS ===
  
  /**
   * Trouve ou crée un client Stripe pour un utilisateur Aurentia
   */
  async findOrCreateCustomer(email: string, name?: string, userId?: string): Promise<string | null> {
    try {
      // 1. Chercher d'abord dans Supabase si on a déjà associé ce user
      if (userId) {
        const { data: existingCustomer } = await supabase
          .from('user_stripe_customers')
          .select('stripe_customer_id')
          .eq('user_id', userId)
          .single();

        if (existingCustomer?.stripe_customer_id) {
          console.log(`✅ Client Stripe existant trouvé: ${existingCustomer.stripe_customer_id}`);
          return existingCustomer.stripe_customer_id;
        }
      }

      // 2. Chercher par email dans Stripe
      const { data: customers } = await window.stripeAPI.listCustomers({ email, limit: 1 });
      
      if (customers && customers.length > 0) {
        const customerId = customers[0].id;
        console.log(`✅ Client Stripe trouvé par email: ${customerId}`);
        
        // Sauvegarder l'association dans Supabase
        if (userId) {
          await this.saveCustomerAssociation(userId, customerId, email);
        }
        
        return customerId;
      }

      // 3. Créer un nouveau client
      const customerData: any = { email };
      if (name) customerData.name = name;

      const newCustomer = await window.stripeAPI.createCustomer(customerData);
      console.log(`✅ Nouveau client Stripe créé: ${newCustomer.id}`);

      // Sauvegarder l'association dans Supabase
      if (userId) {
        await this.saveCustomerAssociation(userId, newCustomer.id, email);
      }

      return newCustomer.id;

    } catch (error) {
      console.error('❌ Erreur lors de la gestion du client Stripe:', error);
      return null;
    }
  }

  /**
   * Sauvegarde l'association user_id <-> stripe_customer_id dans Supabase
   */
  private async saveCustomerAssociation(userId: string, customerId: string, email: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_stripe_customers')
        .upsert({
          user_id: userId,
          stripe_customer_id: customerId,
          email: email,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('❌ Erreur sauvegarde association client:', error);
      }
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
    }
  }

  // === GESTION DES ABONNEMENTS ===

  /**
   * Vérifie le statut d'abonnement d'un utilisateur
   */
  async getSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
    try {
      // 1. Récupérer l'ID client Stripe depuis Supabase
      const { data: customerData } = await supabase
        .from('user_stripe_customers')
        .select('stripe_customer_id')
        .eq('user_id', userId)
        .single();

      if (!customerData?.stripe_customer_id) {
        return { isActive: false };
      }

      // 2. Récupérer les abonnements actifs du client
      const subscriptions = await window.stripeAPI.listSubscriptions({
        customer: customerData.stripe_customer_id,
        status: 'active',
        price: AURENTIA_CONFIG.SUBSCRIPTION.PRICE_ID
      });

      if (!subscriptions || subscriptions.length === 0) {
        return { isActive: false };
      }

      const subscription = subscriptions[0];
      
      return {
        isActive: subscription.status === 'active',
        subscriptionId: subscription.id,
        customerId: customerData.stripe_customer_id,
        status: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end || false
      };

    } catch (error) {
      console.error('❌ Erreur vérification statut abonnement:', error);
      return { isActive: false };
    }
  }

  /**
   * Crée un nouvel abonnement Aurentia
   */
  async createSubscription(userId: string, email: string, name?: string): Promise<CreateSubscriptionResult> {
    try {
      // 1. Vérifier si l'utilisateur a déjà un abonnement actif
      const currentStatus = await this.getSubscriptionStatus(userId);
      if (currentStatus.isActive) {
        return {
          success: false,
          error: 'Vous avez déjà un abonnement actif'
        };
      }

      // 2. Créer ou récupérer le client Stripe
      const customerId = await this.findOrCreateCustomer(email, name, userId);
      if (!customerId) {
        return {
          success: false,
          error: 'Erreur lors de la création du client'
        };
      }

      // 3. Créer l'abonnement avec payment intent
      const subscriptionData = {
        customer: customerId,
        items: [{ price: AURENTIA_CONFIG.SUBSCRIPTION.PRICE_ID }],
        payment_behavior: 'default_incomplete',
        payment_settings: {
          save_default_payment_method: 'on_subscription'
        },
        expand: ['latest_invoice.payment_intent']
      };

      const subscription = await window.stripeAPI.createSubscription(subscriptionData);

      // 4. Extraire le client secret pour le paiement côté client
      const clientSecret = subscription.latest_invoice?.payment_intent?.client_secret;

      if (!clientSecret) {
        return {
          success: false,
          error: 'Erreur lors de la création du payment intent'
        };
      }

      // 5. Sauvegarder l'abonnement en attente dans Supabase
      await this.saveSubscriptionRecord(userId, subscription.id, 'pending');

      return {
        success: true,
        clientSecret,
        subscriptionId: subscription.id
      };

    } catch (error) {
      console.error('❌ Erreur création abonnement:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur lors de la création de l\'abonnement'
      };
    }
  }

  /**
   * Annule un abonnement
   */
  async cancelSubscription(userId: string, immediately: boolean = false): Promise<SubscriptionManagementResult> {
    try {
      const status = await this.getSubscriptionStatus(userId);
      
      if (!status.isActive || !status.subscriptionId) {
        return {
          success: false,
          error: 'Aucun abonnement actif trouvé'
        };
      }

      if (immediately) {
        // Annulation immédiate
        await window.stripeAPI.cancelSubscription(status.subscriptionId);
        await this.saveSubscriptionRecord(userId, status.subscriptionId, 'canceled');
        
        return {
          success: true,
          message: 'Abonnement annulé immédiatement'
        };
      } else {
        // Annulation à la fin de la période
        await window.stripeAPI.updateSubscription(status.subscriptionId, {
          cancel_at_period_end: true
        });
        
        return {
          success: true,
          message: 'Abonnement programmé pour annulation à la fin de la période de facturation'
        };
      }

    } catch (error) {
      console.error('❌ Erreur annulation abonnement:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur lors de l\'annulation'
      };
    }
  }

  /**
   * Réactive un abonnement qui était programmé pour annulation
   */
  async reactivateSubscription(userId: string): Promise<SubscriptionManagementResult> {
    try {
      const status = await this.getSubscriptionStatus(userId);
      
      if (!status.subscriptionId) {
        return {
          success: false,
          error: 'Aucun abonnement trouvé'
        };
      }

      await window.stripeAPI.updateSubscription(status.subscriptionId, {
        cancel_at_period_end: false
      });

      return {
        success: true,
        message: 'Abonnement réactivé avec succès'
      };

    } catch (error) {
      console.error('❌ Erreur réactivation abonnement:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur lors de la réactivation'
      };
    }
  }

  // === GESTION DES CRÉDITS ===

  /**
   * Traite le paiement réussi d'un abonnement
   */
  async processSubscriptionPaymentSuccess(userId: string, subscriptionId: string, projectId?: string): Promise<SubscriptionManagementResult> {
    try {
      console.log(`🎉 Traitement paiement abonnement réussi - User: ${userId}, Subscription: ${subscriptionId}`);

      // 1. Mettre à jour le statut de l'abonnement
      await this.saveSubscriptionRecord(userId, subscriptionId, 'active');

      // 2. Ajouter les crédits mensuels
      const { error: creditsError } = await supabase.rpc('billing.add_credits', {
        p_user_id: userId,
        p_amount: AURENTIA_CONFIG.SUBSCRIPTION.MONTHLY_CREDITS,
        p_credit_type: 'monthly',
        p_description: 'Crédits mensuels abonnement Aurentia',
        p_stripe_reference: subscriptionId
      });

      if (creditsError) {
        console.error('❌ Erreur ajout crédits:', creditsError);
        throw new Error('Erreur lors de l\'ajout des crédits');
      }

      // 3. Mettre à jour le statut du projet si fourni
      if (projectId) {
        const { error: projectError } = await supabase
          .from('project_summary')
          .update({ statut_project: 'payment_receive' })
          .eq('project_id', projectId);

        if (projectError) {
          console.error('❌ Erreur mise à jour projet:', projectError);
        }
      }

      // 4. Déclencher les événements UI
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('creditsUpdated'));
        window.dispatchEvent(new CustomEvent('subscriptionUpdated'));
      }

      return {
        success: true,
        message: 'Abonnement activé et crédits ajoutés avec succès'
      };

    } catch (error) {
      console.error('❌ Erreur traitement paiement:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur lors du traitement du paiement'
      };
    }
  }

  /**
   * Sauvegarde un enregistrement d'abonnement dans Supabase
   */
  private async saveSubscriptionRecord(userId: string, subscriptionId: string, status: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .upsert({
          user_id: userId,
          stripe_subscription_id: subscriptionId,
          status: status,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('❌ Erreur sauvegarde abonnement:', error);
      }
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
    }
  }

  // === MÉTHODES UTILITAIRES ===

  /**
   * Formate le prix en euros
   */
  formatPrice(amountInCents: number): string {
    return `${(amountInCents / 100).toFixed(2)}€`;
  }

  /**
   * Récupère les informations détaillées d'un abonnement
   */
  async getSubscriptionDetails(subscriptionId: string): Promise<any> {
    try {
      return await window.stripeAPI.getSubscription(subscriptionId);
    } catch (error) {
      console.error('❌ Erreur récupération détails abonnement:', error);
      return null;
    }
  }
}

export const stripeAurentiaService = new StripeAurentiaService();
