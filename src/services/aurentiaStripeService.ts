import { supabase } from '@/integrations/supabase/client';

// Configuration Aurentia
export const AURENTIA_CONFIG = {
  SUBSCRIPTION: {
    PRODUCT_ID: 'prod_SyRjQAbqp3Qlv5',
    PRICE_ID: 'price_1S2UpoLIKukPrwK8M1Oi0qgS',
    NAME: 'Abonnement Entrepreneur',
    AMOUNT: 1290, // en centimes (12,90€)
    CREDITS: 1500 // crédits mensuels
  }
};

export interface SubscriptionManagementResult {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

export interface UserSubscriptionInfo {
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

class AurentiaStripeService {

  // ====== GESTION DES CLIENTS ======

  /**
   * Trouve ou crée un client Stripe pour un utilisateur
   */
  async getOrCreateCustomer(userId: string, email: string, name?: string): Promise<string> {
    try {
      // 1. Vérifier si le client existe dans notre DB
      const { data: existingCustomer } = await (supabase as any)
        .from('stripe_customers')
        .select('stripe_customer_id')
        .eq('user_id', userId)
        .single();

      if (existingCustomer) {
        return existingCustomer.stripe_customer_id;
      }

      // 2. Pour l'instant, on ne peut pas chercher par email sans Edge Function
      // On va créer directement un nouveau client
      // TODO: Implémenter la recherche par email plus tard

      // 3. Créer un nouveau client - pour l'instant on simule
      // En attendant l'implémentation des Edge Functions
      const mockCustomerId = `cus_mock_${userId.substring(0, 8)}`;
      
      await this.saveCustomerToDb(mockCustomerId, userId, email, name);
      return mockCustomerId;

    } catch (error) {
      console.error('❌ Erreur gestion client:', error);
      throw new Error('Impossible de créer ou récupérer le client');
    }
  }

  private async saveCustomerToDb(customerId: string, userId: string, email: string, name?: string): Promise<void> {
    const { error } = await (supabase as any)
      .from('stripe_customers')
      .upsert({
        stripe_customer_id: customerId,
        user_id: userId,
        email,
        name,
      });

    if (error) {
      console.error('❌ Erreur sauvegarde client:', error);
    }
  }

  // ====== GESTION DES ABONNEMENTS ======

  /**
   * Vérifie le statut d'abonnement d'un utilisateur
   */
  async getUserSubscriptionStatus(userId: string): Promise<UserSubscriptionInfo> {
    try {
      // 1. Récupérer le customer ID
      const { data: customerData } = await (supabase as any)
        .from('stripe_customers')
        .select('stripe_customer_id')
        .eq('user_id', userId)
        .single();

      if (!customerData) {
        return { has_active_subscription: false };
      }

      // 2. Récupérer les abonnements depuis notre DB locale
      const { data: subscriptions, error } = await (supabase as any)
        .from('stripe_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .eq('price_id', AURENTIA_CONFIG.SUBSCRIPTION.PRICE_ID);

      if (error) {
        console.error('❌ Erreur récupération abonnements:', error);
        return { has_active_subscription: false };
      }

      // 3. Chercher un abonnement actif pour le produit Entrepreneur
      const activeSubscription = subscriptions.find(sub => sub.status === 'active');

      if (!activeSubscription) {
        return { has_active_subscription: false, customer_id: customerData.stripe_customer_id };
      }

      return {
        has_active_subscription: true,
        customer_id: customerData.stripe_customer_id,
        subscription: {
          id: activeSubscription.stripe_subscription_id,
          status: activeSubscription.status,
          current_period_start: activeSubscription.current_period_start,
          current_period_end: activeSubscription.current_period_end,
          cancel_at_period_end: activeSubscription.cancel_at_period_end
        }
      };

    } catch (error) {
      console.error('❌ Erreur vérification abonnement:', error);
      return { has_active_subscription: false };
    }
  }

  /**
   * Crée un lien de paiement pour l'abonnement (version simplifiée)
   */
  async createSubscriptionPaymentLink(userId: string, projectId: string): Promise<SubscriptionManagementResult> {
    try {
      // 1. Récupérer les infos utilisateur depuis la table profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('❌ Erreur profil:', profileError);
        return {
          success: false,
          error: 'Impossible de récupérer les informations utilisateur'
        };
      }

      if (!profile || !profile.email) {
        // Fallback sur les métadonnées utilisateur auth
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !user.email) {
          return {
            success: false,
            error: 'Aucun email utilisateur trouvé'
          };
        }
        
        // Utiliser les données auth comme fallback
        const email = user.email;
        const fullName = user.user_metadata?.first_name || user.user_metadata?.full_name || '';
        
        const customerId = await this.getOrCreateCustomer(userId, email, fullName);
        
        // Continuer avec le lien de paiement
        const staticPaymentUrl = 'https://buy.stripe.com/4gMfZidrg5Cwamd4TR0gw09';
        
        await this.saveSubscriptionIntent(userId, projectId, customerId);
        await this.updateProjectStatus(projectId, 'subscription_pending');

        return {
          success: true,
          data: {
            payment_url: staticPaymentUrl,
            customer_id: customerId
          },
          message: 'Redirection vers le paiement en cours...'
        };
      }

      // 2. Vérifier qu'il n'y a pas déjà un abonnement actif
      const subscriptionStatus = await this.getUserSubscriptionStatus(userId);
      if (subscriptionStatus.has_active_subscription) {
        return {
          success: false,
          error: 'Vous avez déjà un abonnement actif'
        };
      }

      // 3. Créer ou récupérer le client
      const email = profile.email;
      const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.full_name || '';
      const customerId = await this.getOrCreateCustomer(userId, email, fullName);

      // 4. Pour l'instant, utiliser l'ancien système (lien statique) 
      // en attendant l'implémentation complète des Edge Functions
      const staticPaymentUrl = 'https://buy.stripe.com/4gMfZidrg5Cwamd4TR0gw09';
      
      // 5. Sauvegarder l'intention d'abonnement
      await this.saveSubscriptionIntent(userId, projectId, customerId);

      // 6. Mettre à jour le statut du projet
      await this.updateProjectStatus(projectId, 'subscription_pending');

      return {
        success: true,
        data: {
          payment_url: staticPaymentUrl,
          customer_id: customerId
        },
        message: 'Redirection vers le paiement en cours...'
      };

    } catch (error) {
      console.error('❌ Erreur création lien paiement:', error);
      return {
        success: false,
        error: 'Erreur lors de la création du lien de paiement'
      };
    }
  }

  /**
   * Annule un abonnement (version simplifiée)
   */
  async cancelSubscription(userId: string, immediately: boolean = false): Promise<SubscriptionManagementResult> {
    try {
      const subscriptionStatus = await this.getUserSubscriptionStatus(userId);
      
      if (!subscriptionStatus.has_active_subscription || !subscriptionStatus.subscription) {
        return {
          success: false,
          error: 'Aucun abonnement actif trouvé'
        };
      }

      // Pour l'instant, juste mettre à jour le statut local
      // TODO: Implémenter l'appel API Stripe réel
      await this.updateSubscriptionInDb(
        subscriptionStatus.subscription.id,
        immediately ? 'canceled' : 'active',
        undefined,
        undefined,
        !immediately
      );

      return {
        success: true,
        message: immediately ? 
          'Abonnement annulé immédiatement' : 
          'Abonnement sera annulé à la fin de la période de facturation'
      };

    } catch (error) {
      console.error('❌ Erreur annulation abonnement:', error);
      return {
        success: false,
        error: 'Erreur lors de l\'annulation de l\'abonnement'
      };
    }
  }

  /**
   * Réactive un abonnement annulé
   */
  async reactivateSubscription(userId: string): Promise<SubscriptionManagementResult> {
    try {
      const subscriptionStatus = await this.getUserSubscriptionStatus(userId);
      
      if (!subscriptionStatus.subscription || 
          (subscriptionStatus.subscription.status !== 'active' || !subscriptionStatus.subscription.cancel_at_period_end)) {
        return {
          success: false,
          error: 'Aucun abonnement à réactiver trouvé'
        };
      }

      // Pour l'instant, juste mettre à jour le statut local
      await this.updateSubscriptionInDb(
        subscriptionStatus.subscription.id,
        'active',
        undefined,
        undefined,
        false
      );

      return {
        success: true,
        message: 'Abonnement réactivé avec succès'
      };

    } catch (error) {
      console.error('❌ Erreur réactivation abonnement:', error);
      return {
        success: false,
        error: 'Erreur lors de la réactivation de l\'abonnement'
      };
    }
  }

  // ====== MÉTHODES PRIVÉES ======

  private async saveSubscriptionIntent(userId: string, projectId: string, customerId: string): Promise<void> {
    const { error } = await (supabase as any)
      .from('subscription_intents')
      .insert({
        user_id: userId,
        project_id: projectId,
        stripe_customer_id: customerId,
        product_id: AURENTIA_CONFIG.SUBSCRIPTION.PRODUCT_ID,
        price_id: AURENTIA_CONFIG.SUBSCRIPTION.PRICE_ID,
        status: 'pending'
      });

    if (error) {
      console.error('❌ Erreur sauvegarde intention:', error);
    }
  }

  private async updateProjectStatus(projectId: string, status: string): Promise<void> {
    const { error } = await supabase
      .from('project_summary')
      .update({ 
        statut_project: status,
        updated_at: new Date().toISOString()
      })
      .eq('project_id', projectId);

    if (error) {
      console.error('❌ Erreur mise à jour projet:', error);
    }
  }

  private async updateSubscriptionInDb(
    subscriptionId: string,
    status: string,
    currentPeriodStart?: string,
    currentPeriodEnd?: string,
    cancelAtPeriodEnd?: boolean
  ): Promise<void> {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    if (currentPeriodStart) updateData.current_period_start = currentPeriodStart;
    if (currentPeriodEnd) updateData.current_period_end = currentPeriodEnd;
    if (cancelAtPeriodEnd !== undefined) updateData.cancel_at_period_end = cancelAtPeriodEnd;

    const { error } = await (supabase as any)
      .from('stripe_subscriptions')
      .update(updateData)
      .eq('stripe_subscription_id', subscriptionId);

    if (error) {
      console.error('❌ Erreur mise à jour abonnement:', error);
    }
  }

  // ====== MÉTHODES UTILITAIRES ======

  /**
   * Récupère l'historique des paiements d'un utilisateur
   */
  async getUserPaymentHistory(userId: string): Promise<any[]> {
    try {
      // Pour l'instant, retourner un tableau vide
      // TODO: Implémenter avec Edge Functions
      return [];
    } catch (error) {
      console.error('❌ Erreur historique paiements:', error);
      return [];
    }
  }

  /**
   * Calcule les statistiques d'abonnement
   */
  async getSubscriptionStats(): Promise<any> {
    try {
      const { data: stats } = await (supabase as any)
        .from('stripe_subscriptions')
        .select(`
          status,
          count(*)
        `)
        .eq('product_id', AURENTIA_CONFIG.SUBSCRIPTION.PRODUCT_ID);

      return stats || [];
    } catch (error) {
      console.error('❌ Erreur statistiques:', error);
      return [];
    }
  }
}

export const aurentiaStripeService = new AurentiaStripeService();
