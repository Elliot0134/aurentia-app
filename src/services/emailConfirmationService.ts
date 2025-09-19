import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface EmailConfirmationRequest {
  email: string;
  userId?: string;
  isResend?: boolean;
}

export interface EmailConfirmationResponse {
  success: boolean;
  message?: string;
  confirmationId?: string;
  expiresAt?: string;
  error?: string;
  retryAfter?: number;
  limits?: {
    email_count: number;
    email_limit: number;
    ip_count: number;
    ip_limit: number;
    user_count: number;
    user_limit: number;
  };
}

export interface EmailVerificationRequest {
  token: string;
}

export interface EmailVerificationResponse {
  success: boolean;
  message?: string;
  confirmedAt?: string;
  email?: string;
  userId?: string;
  error?: string;
  code?: 'INVALID_TOKEN' | 'ALREADY_CONFIRMED' | 'TOKEN_EXPIRED' | 'CONFIRMATION_FAILED' | 'INTERNAL_ERROR';
  expiresAt?: string;
}

export interface EmailConfirmationStatus {
  id: string;
  user_id: string | null;
  email: string;
  status: 'pending' | 'confirmed' | 'expired' | 'failed' | 'cancelled';
  expires_at: string;
  confirmed_at: string | null;
  attempts: number;
  max_attempts: number;
  last_sent_at: string | null;
  created_at: string;
  updated_at: string;
}

class EmailConfirmationService {
  /**
   * Envoie un email de confirmation
   */
  async sendConfirmationEmail(request: EmailConfirmationRequest): Promise<EmailConfirmationResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('send-confirmation-email', {
        body: {
          ...request,
          userAgent: navigator.userAgent,
        },
      });

      if (error) {
        console.error('Erreur fonction send-confirmation-email:', error);
        // Log the full error object to see the response body
        console.error('Détails de l\'erreur de la fonction Edge:', error);
        
        // Tenter de parser le corps de la réponse si disponible
        let errorMessage = error.message || 'Erreur lors de l\'envoi';
        let retryAfter: number | undefined;
        let limits: any;

        try {
          // Supabase Edge Functions errors might have a 'context' property with the actual response
          if (error.context && typeof error.context === 'object' && error.context.errors && error.context.errors.length > 0) {
            const edgeFunctionError = error.context.errors[0];
            if (edgeFunctionError.message) {
              errorMessage = edgeFunctionError.message;
            }
            if (edgeFunctionError.details && edgeFunctionError.details.retryAfter) {
              retryAfter = edgeFunctionError.details.retryAfter;
            }
            if (edgeFunctionError.details && edgeFunctionError.details.limits) {
              limits = edgeFunctionError.details.limits;
            }
          } else if (error.message.includes('429')) { // Fallback for generic 429 message
            errorMessage = 'Trop de tentatives. Veuillez patienter avant de réessayer.';
            retryAfter = 3600; // Default to 1 hour
          }
        } catch (parseError) {
          console.warn('Erreur lors du parsing du détail de l\'erreur de la fonction Edge:', parseError);
        }

        return {
          success: false,
          error: errorMessage,
          retryAfter: retryAfter,
          limits: limits
        };
      }

      return data;
    } catch (error: any) {
      console.error('Erreur sendConfirmationEmail (catch global):', error);
      
      // Gestion d'erreurs spécifique
      if (error.message?.includes('429')) {
        return {
          success: false,
          error: 'Trop de tentatives. Veuillez patienter avant de réessayer.',
          retryAfter: 3600 // 1 heure par défaut
        };
      }

      return {
        success: false,
        message: 'Échec de l\'envoi',
        error: error.message || 'Erreur lors de l\'envoi de l\'email de confirmation',
      };
    }
  }

  /**
   * Vérifie et confirme un token d'email
   */
  async verifyEmailToken(request: EmailVerificationRequest): Promise<EmailVerificationResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('confirm-email', {
        body: {
          ...request,
          userAgent: navigator.userAgent,
        },
      });

      if (error) {
        console.error('Erreur fonction confirm-email:', error);
        throw new Error(error.message || 'Erreur lors de la confirmation');
      }

      return data;
    } catch (error: any) {
      console.error('Erreur verifyEmailToken:', error);
      return {
        success: false,
        error: error.message || 'Erreur lors de la vérification du token',
        code: 'INTERNAL_ERROR'
      };
    }
  }

  /**
   * Récupère le statut d'une confirmation d'email pour l'utilisateur actuel
   */
  async getConfirmationStatus(userId: string): Promise<EmailConfirmationStatus | null> {
    try {
      // Utiliser la fonction PostgreSQL get_email_confirmation_status pour contourner la RLS
      // et récupérer le statut de confirmation pour l'utilisateur spécifié.
      const { data, error } = await supabase.rpc('get_email_confirmation_status', { p_user_id: userId });

      if (error) {
        console.error('Erreur getConfirmationStatus via RPC:', error);
        return null;
      }

      console.log('DEBUG - getConfirmationStatus RPC data:', data);

      // La fonction RPC retourne un JSON, nous devons le parser et le caster.
      if (data) {
        const statusData = data as EmailConfirmationStatus;
        console.log('DEBUG - getConfirmationStatus RPC parsed status:', statusData);
        return statusData;
      }
      
      return null;
    } catch (error) {
      console.error('Erreur getConfirmationStatus (catch global):', error);
      return null;
    }
  }

  /**
   * Vérifie si un utilisateur a besoin de confirmer son email
   */
  async needsEmailConfirmation(userId: string): Promise<boolean> {
    try {
      const { count, error } = await supabase
        .from('email_confirmations' as any) // Temporarily bypass type checking
        .select('id', { count: 'exact' })
        .eq('user_id', userId)
        .eq('status', 'pending');

      if (error) {
        console.error('Erreur needsEmailConfirmation:', error);
        return false;
      }

      return (count || 0) > 0;
    } catch (error) {
      console.error('Erreur needsEmailConfirmation:', error);
      return false;
    }
  }

  /**
   * Subscribe aux changements de statut d'une confirmation
   */
  subscribeToConfirmationStatus(
    userId: string,
    onStatusChange: (status: EmailConfirmationStatus | null) => void
  ) {
    const channel = supabase
      .channel('email-confirmation-status')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'email_confirmations', // This table name is a string literal, so 'as any' is not needed here
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('DEBUG - Realtime changement confirmation:', payload);
          
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            onStatusChange(payload.new as EmailConfirmationStatus);
          } else if (payload.eventType === 'DELETE') {
            onStatusChange(null);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  /**
   * Annule une confirmation en cours
   */
  async cancelConfirmation(confirmationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('email_confirmations' as any) // Temporarily bypass type checking
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', confirmationId);

      if (error) {
        console.error('Erreur cancelConfirmation:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur cancelConfirmation:', error);
      return false;
    }
  }

  /**
   * Utilitaire pour afficher des toasts selon le résultat
   */
  showResultToast(result: EmailConfirmationResponse) {
    if (result.success) {
      toast({
        title: "Email envoyé !",
        description: result.message || "Vérifiez votre boîte de réception.",
      });
    } else {
      toast({
        title: "Erreur",
        description: result.error || "Impossible d'envoyer l'email.",
        variant: "destructive",
      });
    }
  }

  showVerificationToast(result: EmailVerificationResponse) {
    if (result.success) {
      toast({
        title: "Email confirmé !",
        description: result.message || "Votre compte est maintenant actif.",
      });
    } else {
      let description = result.error || "Impossible de confirmer l'email.";
      
      // Messages personnalisés selon le code d'erreur
      switch (result.code) {
        case 'INVALID_TOKEN':
          description = "Le lien de confirmation est invalide ou incorrect.";
          break;
        case 'ALREADY_CONFIRMED':
          description = "Cet email a déjà été confirmé.";
          break;
        case 'TOKEN_EXPIRED':
          description = "Le lien de confirmation a expiré. Demandez un nouveau lien.";
          break;
        case 'CONFIRMATION_FAILED':
          description = "Erreur lors de la confirmation. Veuillez réessayer.";
          break;
      }

      toast({
        title: "Erreur de confirmation",
        description,
        variant: "destructive",
      });
    }
  }

  /**
   * Formatage de temps restant avant expiration
   */
  formatTimeRemaining(expiresAt: string): string {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diffMs = expires.getTime() - now.getTime();

    if (diffMs <= 0) {
      return "Expiré";
    }

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}min`;
    }

    return `${diffMinutes}min`;
  }
}

export const emailConfirmationService = new EmailConfirmationService();
