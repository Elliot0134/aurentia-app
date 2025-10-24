/**
 * Slack Integration Service
 * Handles sending messages to Slack via Incoming Webhooks
 */

import type { IntegrationEvent, SlackCredentials, SendNotificationResult, TestConnectionResult } from '@/types/integrationTypes';
import { slackFormatter } from './slackFormatter';
import { WEBHOOK_TIMEOUT_MS } from '@/lib/integrationConstants';

class SlackService {
  /**
   * Send a notification to Slack
   */
  async sendNotification(
    credentials: SlackCredentials,
    event: IntegrationEvent
  ): Promise<SendNotificationResult> {
    const startTime = Date.now();

    try {
      // Format the event into a Slack message
      const message = slackFormatter.formatEvent(event);

      // Send to Slack webhook
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
        throw new Error(`Slack API error: ${response.status} - ${errorText}`);
      }

      return {
        success: true,
        statusCode: response.status,
        duration,
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;

      console.error('[SlackService] Failed to send notification:', error);

      return {
        success: false,
        error: error.message || 'Unknown error',
        duration,
      };
    }
  }

  /**
   * Test Slack webhook connection
   */
  async testConnection(credentials: SlackCredentials): Promise<TestConnectionResult> {
    try {
      // Validate webhook URL format
      if (!this.isValidWebhookUrl(credentials.webhookUrl)) {
        return {
          success: false,
          message: 'URL de webhook Slack invalide. Vérifiez que l\'URL commence par https://hooks.slack.com/',
          details: 'Le format attendu est: https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXX',
        };
      }

      // Send test message
      const testMessage = slackFormatter.createTestMessage();

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

        // Parse Slack error messages
        if (response.status === 404) {
          return {
            success: false,
            message: 'Webhook non trouvé',
            details: 'Le webhook a peut-être été supprimé de Slack. Créez un nouveau webhook.',
          };
        }

        if (response.status === 410) {
          return {
            success: false,
            message: 'Webhook désactivé',
            details: 'Le webhook a été désactivé dans Slack. Créez un nouveau webhook.',
          };
        }

        if (response.status === 429) {
          return {
            success: false,
            message: 'Trop de requêtes',
            details: 'Vous avez dépassé la limite de taux. Attendez quelques instants avant de réessayer.',
          };
        }

        return {
          success: false,
          message: `Erreur Slack: ${response.status}`,
          details: errorText || 'Erreur inconnue',
        };
      }

      return {
        success: true,
        message: 'Connexion réussie! Vérifiez votre channel Slack pour voir le message de test.',
      };
    } catch (error: any) {
      console.error('[SlackService] Connection test failed:', error);

      // Handle network errors
      if (error.name === 'AbortError' || error.name === 'TimeoutError') {
        return {
          success: false,
          message: 'Délai d\'attente dépassé',
          details: 'La connexion à Slack a pris trop de temps. Vérifiez votre connexion internet.',
        };
      }

      if (error.message?.includes('fetch')) {
        return {
          success: false,
          message: 'Erreur de connexion',
          details: 'Impossible de contacter Slack. Vérifiez votre connexion internet.',
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
   * Validate Slack webhook URL format
   */
  private isValidWebhookUrl(url: string): boolean {
    try {
      const parsed = new URL(url);

      // Must be HTTPS
      if (parsed.protocol !== 'https:') {
        return false;
      }

      // Must be hooks.slack.com domain
      if (parsed.hostname !== 'hooks.slack.com') {
        return false;
      }

      // Must start with /services/
      if (!parsed.pathname.startsWith('/services/')) {
        return false;
      }

      // Should have the format /services/T.../B.../...
      const parts = parsed.pathname.split('/');
      if (parts.length !== 5) {
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
  async sendTestMessage(credentials: SlackCredentials): Promise<void> {
    const testMessage = slackFormatter.createTestMessage();

    const response = await fetch(credentials.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testMessage),
      signal: AbortSignal.timeout(WEBHOOK_TIMEOUT_MS),
    });

    if (!response.ok) {
      throw new Error(`Slack API error: ${response.status}`);
    }
  }
}

export const slackService = new SlackService();
