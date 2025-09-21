import { supabase } from '@/integrations/supabase/client';

// Configuration des produits Aurentia
export const AURENTIA_CONFIG = {
  SUBSCRIPTION: {
    PRODUCT_ID: 'prod_SyRjQAbqp3Qlv5',
    PRICE_ID: 'price_1S2UpoLIKukPrwK8M1Oi0qgS',
    NAME: 'Abonnement Entrepreneur',
    AMOUNT: 1290, // en centimes (12,90€)
    CREDITS: 1500 // crédits mensuels accordés
  }
};

export interface AurentiaSubscriptionResult {
  success: boolean;
  subscription_id?: string;
  customer_id?: string;
  client_secret?: string;
  error?: string;
  message?: string;
}

export interface AurentiaSubscriptionStatus {
  has_active_subscription: boolean;
  subscription?: {
    id: string;
    status: string;
    current_period_start: string;
    current_period_end: string;
    cancel_at_period_end: boolean;
  };
  customer_id?: string;
}

class StripeIntegratedService {

  // ====== GESTION DES CLIENTS ======
  
  /**
   * Trouve ou crée un client Stripe pour un utilisateur Aurentia
   */
  async getOrCreateCustomer(userId: string, email: string, name?: string): Promise<{ customer_id: string; created: boolean }> {
    try {
      // 1. Vérifier si le client existe déjà dans notre DB
      const { data: existingCustomer, error: dbError } = await supabase
        .from('stripe_customers')
        .select('stripe_customer_id')
        .eq('user_id', userId)
        .single();

      if (!dbError && existingCustomer) {
        return { customer_id: existingCustomer.stripe_customer_id, created: false };
      }

      // 2. Chercher dans Stripe par email
      const existingStripeCustomers = await this.searchCustomersByEmail(email);
      
      if (existingStripeCustomers.length > 0) {
        const customerId = existingStripeCustomers[0].id;
        
        // Synchroniser avec notre DB
        await this.saveCustomerToDb(customerId, userId, email, name);
        
        return { customer_id: customerId, created: false };
      }

      // 3. Créer un nouveau client
      const newCustomer = await this.createStripeCustomer(email, name, userId);
      await this.saveCustomerToDb(newCustomer.id, userId, email, name);
      
      return { customer_id: newCustomer.id, created: true };

    } catch (error) {
      console.error('❌ Erreur lors de la gestion du client:', error);
      throw new Error('Impossible de créer ou récupérer le client Stripe');
    }
  }

  private async searchCustomersByEmail(email: string): Promise<any[]> {
    // Note: Cette fonction devrait utiliser l'API Stripe pour chercher par email
    // Pour l'instant, on simule en retournant un tableau vide
    // Vous devrez implémenter ceci avec l'API Stripe réelle
    return [];
  }

  private async createStripeCustomer(email: string, name?: string, userId?: string): Promise<any> {
    // Utiliser le MCP Stripe pour créer le client
    const customer = await this.callStripeMCP('create_customer', {
      email,
      name: name || undefined
    });

    return customer;
  }

  private async saveCustomerToDb(customerId: string, userId: string, email: string, name?: string): Promise<void> {
    const { error } = await supabase
      .from('stripe_customers')
      .upsert({
        stripe_customer_id: customerId,
        user_id: userId,
        email,
        name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('❌ Erreur sauvegarde client en DB:', error);
    }
  }

  // ====== GESTION DES ABONNEMENTS ======

  /**
   * Crée un abonnement Entrepreneur pour un utilisateur
   */
  async createSubscription(userId: string, projectId: string): Promise<AurentiaSubscriptionResult> {
    try {
      // 1. Récupérer les infos utilisateur
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email, first_name, last_name')
        .eq('user_id', userId)
        .single();

      if (profileError || !profile) {
        return {
          success: false,
          error: 'Impossible de récupérer les informations utilisateur'
        };
      }

      const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();

      // 2. Créer ou récupérer le client Stripe
      const { customer_id } = await this.getOrCreateCustomer(userId, profile.email, fullName);

      // 3. Vérifier qu'il n'y a pas déjà un abonnement actif
      const existingSubscription = await this.getUserActiveSubscription(userId);
      if (existingSubscription.has_active_subscription) {
        return {
          success: false,
          error: 'Vous avez déjà un abonnement actif'
        };
      }

      // 4. Créer l'abonnement via Stripe
      // Note: Ici vous devriez utiliser l'API Stripe pour créer l'abonnement
      // Pour l'instant, on simule le processus
      
      // 5. Mettre à jour le statut du projet
      await this.updateProjectStatus(projectId, 'subscription_pending');

      // 6. Sauvegarder les données de l'abonnement en attente
      await this.saveSubscriptionIntent(userId, projectId, customer_id);

      return {
        success: true,
        customer_id,
        message: 'Abonnement en cours de création. Vous allez être redirigé vers Stripe.'
      };

    } catch (error) {
      console.error('❌ Erreur création abonnement:', error);
      return {
        success: false,
        error: 'Erreur lors de la création de l\'abonnement'
      };
    }
  }

  /**
   * Vérifie le statut d'abonnement d'un utilisateur
   */
  async getUserActiveSubscription(userId: string): Promise<AurentiaSubscriptionStatus> {
    try {
      // 1. Récupérer le customer_id depuis notre DB
      const { data: customerData, error: dbError } = await supabase
        .from('stripe_customers')
        .select('stripe_customer_id')
        .eq('user_id', userId)
        .single();

      if (dbError || !customerData) {
        return { has_active_subscription: false };
      }

      // 2. Récupérer les abonnements depuis Stripe
      // Note: Utilisez l'API Stripe ici
      const subscriptions = await this.getCustomerSubscriptions(customerData.stripe_customer_id);
      
      // 3. Chercher un abonnement actif pour le produit Entrepreneur
      const activeSubscription = subscriptions.find(sub => 
        sub.status === 'active' && 
        sub.items.data.some(item => item.price.id === AURENTIA_CONFIG.SUBSCRIPTION.PRICE_ID)
      );

      if (!activeSubscription) {
        return { has_active_subscription: false };
      }

      return {
        has_active_subscription: true,
        customer_id: customerData.stripe_customer_id,
        subscription: {
          id: activeSubscription.id,
          status: activeSubscription.status,
          current_period_start: new Date(activeSubscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(activeSubscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: activeSubscription.cancel_at_period_end
        }
      };

    } catch (error) {
      console.error('❌ Erreur vérification abonnement:', error);
      return { has_active_subscription: false };
    }
  }

  /**
   * Annule un abonnement
   */
  async cancelSubscription(userId: string, immediately: boolean = false): Promise<AurentiaSubscriptionResult> {
    try {
      const subscriptionStatus = await this.getUserActiveSubscription(userId);
      
      if (!subscriptionStatus.has_active_subscription || !subscriptionStatus.subscription) {
        return {
          success: false,
          error: 'Aucun abonnement actif trouvé'
        };
      }

      // Annuler l'abonnement via Stripe
      // Note: Utilisez l'API Stripe ici
      await this.cancelStripeSubscription(subscriptionStatus.subscription.id, immediately);

      // Mettre à jour le statut dans notre DB
      await this.updateSubscriptionStatus(userId, 'canceled');

      return {
        success: true,
        message: immediately ? 
          'Abonnement annulé immédiatement' : 
          'Abonnement annulé à la fin de la période de facturation'
      };

    } catch (error) {
      console.error('❌ Erreur annulation abonnement:', error);
      return {
        success: false,
        error: 'Erreur lors de l\'annulation de l\'abonnement'
      };
    }
  }

  // ====== MÉTHODES PRIVÉES ======

  private async getCustomerSubscriptions(customerId: string): Promise<any[]> {
    // Note: Implémentez ceci avec l'API Stripe
    return [];
  }

  private async cancelStripeSubscription(subscriptionId: string, immediately: boolean): Promise<void> {
    // Note: Implémentez ceci avec l'API Stripe
  }

  private async updateProjectStatus(projectId: string, status: string): Promise<void> {
    const { error } = await supabase
      .from('project_summary')
      .update({ statut_project: status, updated_at: new Date().toISOString() })
      .eq('project_id', projectId);

    if (error) {
      console.error('❌ Erreur mise à jour statut projet:', error);
    }
  }

  private async saveSubscriptionIntent(userId: string, projectId: string, customerId: string): Promise<void> {
    const { error } = await supabase
      .from('subscription_intents')
      .insert({
        user_id: userId,
        project_id: projectId,
        stripe_customer_id: customerId,
        product_id: AURENTIA_CONFIG.SUBSCRIPTION.PRODUCT_ID,
        price_id: AURENTIA_CONFIG.SUBSCRIPTION.PRICE_ID,
        status: 'pending',
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('❌ Erreur sauvegarde intention abonnement:', error);
    }
  }

  private async updateSubscriptionStatus(userId: string, status: string): Promise<void> {
    const { error } = await supabase
      .from('subscription_intents')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Erreur mise à jour statut abonnement:', error);
    }
  }

  // ====== MÉTHODES UTILITAIRES ======

  private async callStripeMCP(action: string, params: any): Promise<any> {
    // Cette méthode devrait appeler l'API Stripe via le MCP
    // Pour l'instant, on simule
    console.log(`Appel Stripe MCP: ${action}`, params);
    return {};
  }

  // ====== WEBHOOK HANDLERS ======

  /**
   * Traite les événements webhook de Stripe
   */
  async handleWebhookEvent(eventType: string, data: any): Promise<void> {
    try {
      switch (eventType) {
        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(data);
          break;
        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(data);
          break;
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(data);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(data);
          break;
        default:
          console.log(`Event non géré: ${eventType}`);
      }
    } catch (error) {
      console.error(`❌ Erreur traitement webhook ${eventType}:`, error);
    }
  }

  private async handlePaymentSucceeded(data: any): Promise<void> {
    // Ajouter les crédits mensuels à l'utilisateur
    console.log('💳 Paiement réussi, ajout des crédits');
  }

  private async handleSubscriptionCreated(data: any): Promise<void> {
    // Mettre à jour le statut d'abonnement de l'utilisateur
    console.log('✅ Abonnement créé');
  }

  private async handleSubscriptionUpdated(data: any): Promise<void> {
    // Mettre à jour les informations d'abonnement
    console.log('🔄 Abonnement mis à jour');
  }

  private async handleSubscriptionDeleted(data: any): Promise<void> {
    // Gérer l'annulation d'abonnement
    console.log('❌ Abonnement supprimé');
  }
}

export const stripeIntegratedService = new StripeIntegratedService();
