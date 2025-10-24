/**
 * Microsoft Teams Integration Service
 * Handles sending messages to Teams via Incoming Webhooks
 */

import type { IntegrationEvent, TeamsCredentials, SendNotificationResult, TestConnectionResult } from '@/types/integrationTypes';
import { teamsFormatter } from './teamsFormatter';
import { WEBHOOK_TIMEOUT_MS } from '@/lib/integrationConstants';

class TeamsService {
  /**
   * Send a notification to Teams
   */
  async sendNotification(
    credentials: TeamsCredentials,
    event: IntegrationEvent
  ): Promise<SendNotificationResult> {
    const startTime = Date.now();

    try {
      // Format the event into a Teams Adaptive Card
      const message = teamsFormatter.formatEvent(event);

      // Send to Teams webhook
      const response = await fetch(credentials.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
        signal: AbortSignal.timeout(WEBHOOK_TIMEOUT_MS),
      });

      const duration = Date.now() - startTime;

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Teams API error: ${response.status} - ${errorText}`);
      }

      return {
        success: true,
        statusCode: response.status,
        duration,
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;

      console.error('[TeamsService] Failed to send notification:', error);

      return {
        success: false,
        error: error.message || 'Unknown error',
        duration,
      };
    }
  }

  /**
   * Test Teams webhook connection
   */
  async testConnection(credentials: TeamsCredentials): Promise<TestConnectionResult> {
    try {
      // Validate webhook URL format
      if (!this.isValidWebhookUrl(credentials.webhookUrl)) {
        return {
          success: false,
          message: 'URL de webhook Teams invalide. Vérifiez que l\'URL commence par https://outlook.office.com/webhook/',
          details: 'Le format attendu est: https://outlook.office.com/webhook/.../IncomingWebhook/...',
        };
      }

      // Send test message
      const testMessage = teamsFormatter.createTestMessage();

      const response = await fetch(credentials.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testMessage),
        signal: AbortSignal.timeout(WEBHOOK_TIMEOUT_MS),
      });

      if (!response.ok) {
        const errorText = await response.text();

        // Parse Teams error messages
        if (response.status === 404) {
          return {
            success: false,
            message: 'Webhook non trouvé',
            details: 'Le webhook a peut-être été supprimé de Teams. Créez un nouveau webhook dans les paramètres du channel.',
          };
        }

        if (response.status === 400) {
          return {
            success: false,
            message: 'Requête invalide',
            details: 'Le format du message est invalide. Vérifiez l\'URL du webhook.',
          };
        }

        if (response.status === 429) {
          return {
            success: false,
            message: 'Trop de requêtes',
            details: 'Vous avez dépassé la limite de taux de Teams. Attendez quelques instants avant de réessayer.',
          };
        }

        return {
          success: false,
          message: `Erreur Teams: ${response.status}`,
          details: errorText || 'Erreur inconnue',
        };
      }

      return {
        success: true,
        message: 'Connexion réussie! Vérifiez votre channel Teams pour voir le message de test.',
      };
    } catch (error: any) {
      console.error('[TeamsService] Connection test failed:', error);

      // Handle network errors
      if (error.name === 'AbortError' || error.name === 'TimeoutError') {
        return {
          success: false,
          message: 'Délai d\'attente dépassé',
          details: 'La connexion à Teams a pris trop de temps. Vérifiez votre connexion internet.',
        };
      }

      if (error.message?.includes('fetch')) {
        return {
          success: false,
          message: 'Erreur de connexion',
          details: 'Impossible de contacter Teams. Vérifiez votre connexion internet.',
        };
      }

      return {
        success: false,
        message: 'Erreur lors du test',
        details: error.message || 'Une erreur inconnue s\'est produite',
      };
    }
  }

  /**
   * Validate Teams webhook URL format
   */
  private isValidWebhookUrl(url: string): boolean {
    try {
      const parsed = new URL(url);

      // Must be HTTPS
      if (parsed.protocol !== 'https:') {
        return false;
      }

      // Must be outlook.office.com or outlook.office365.com domain
      if (
        parsed.hostname !== 'outlook.office.com' &&
        parsed.hostname !== 'outlook.office365.com'
      ) {
        return false;
      }

      // Must contain /webhook/ and /IncomingWebhook/
      if (
        !parsed.pathname.includes('/webhook/') ||
        !parsed.pathname.includes('/IncomingWebhook/')
      ) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Send a simple test message (used by testConnection)
   */
  async sendTestMessage(credentials: TeamsCredentials): Promise<void> {
    const testMessage = teamsFormatter.createTestMessage();

    const response = await fetch(credentials.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testMessage),
      signal: AbortSignal.timeout(WEBHOOK_TIMEOUT_MS),
    });

    if (!response.ok) {
      throw new Error(`Teams API error: ${response.status}`);
    }
  }
}

export const teamsService = new TeamsService();
