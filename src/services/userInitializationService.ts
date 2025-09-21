import { supabase } from '@/integrations/supabase/client';

/**
 * Service pour gérer l'initialisation des nouveaux utilisateurs
 */
class UserInitializationService {
  
  /**
   * Initialise les crédits d'un nouvel utilisateur
   */
  async initializeUserCredits(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('initialize_user_credits', { 
        p_user_id: userId 
      });

      if (error) {
        console.error('❌ Erreur initialisation crédits:', error);
        return false;
      }

      console.log('✅ Crédits initialisés pour utilisateur:', userId);
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation des crédits:', error);
      return false;
    }
  }

  /**
   * Vérifie et initialise les crédits si nécessaire
   */
  async ensureUserCreditsExist(userId: string): Promise<boolean> {
    try {
      // Vérifier si l'utilisateur a déjà des crédits
      const { data, error } = await supabase
        .from('billing.user_credits')
        .select('user_id')
        .eq('user_id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // Pas de ligne trouvée, initialiser
        return await this.initializeUserCredits(userId);
      }

      if (error) {
        console.error('❌ Erreur vérification crédits:', error);
        return false;
      }

      // Utilisateur a déjà des crédits
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la vérification des crédits:', error);
      return false;
    }
  }

  /**
   * Reset les crédits basé sur le cycle de facturation
   */
  async resetCreditsBasedOnBillingCycle(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('reset_credits_based_on_billing_cycle', { 
        p_user_id: userId 
      });

      if (error) {
        console.error('❌ Erreur reset crédits:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Erreur lors du reset des crédits:', error);
      return false;
    }
  }
}

export const userInitializationService = new UserInitializationService();
