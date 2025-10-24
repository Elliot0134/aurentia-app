/**
 * Discord Integration Service
 * Handles sending messages to Discord via Webhooks
 */

import type { IntegrationEvent, DiscordCredentials, SendNotificationResult, TestConnectionResult } from '@/types/integrationTypes';
import { discordFormatter } from './discordFormatter';
import { WEBHOOK_TIMEOUT_MS } from '@/lib/integrationConstants';

class DiscordService {
  /**
   * Send a notification to Discord
   */
  async sendNotification(
    credentials: DiscordCredentials,
    event: IntegrationEvent
  ): Promise<SendNotificationResult> {
    const startTime = Date.now();

    try {
      // Format the event into a Discord message
      const message = discordFormatter.formatEvent(event);

      // Send to Discord webhook
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
        throw new Error(`Discord API error: ${response.status} - ${errorText}`);
      }

      return {
        success: true,
        statusCode: response.status,
        duration,
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;

      console.error('[DiscordService] Failed to send notification:', error);

      return {
        success: false,
        error: error.message || 'Unknown error',
        duration,
      };
    }
  }

  /**
   * Test Discord webhook connection
   */
  async testConnection(credentials: DiscordCredentials): Promise<TestConnectionResult> {
    try {
      // Validate webhook URL format
      if (!this.isValidWebhookUrl(credentials.webhookUrl)) {
        return {
          success: false,
          message: 'URL de webhook Discord invalide. Vérifiez que l\'URL commence par https://discord.com/api/webhooks/',
          details: 'Le format attendu est: https://discord.com/api/webhooks/WEBHOOK_ID/WEBHOOK_TOKEN',
        };
      }

      // Send test message
      const testMessage = discordFormatter.createTestMessage();

      const response = await fetch(credentials.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testMessage),
        signal: AbortSignal.timeout(WEBHOOK_TIMEOUT_MS),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Parse Discord error messages
        if (response.status === 404) {
          return {
            success: false,
            message: 'Webhook non trouvé',
            details: 'Le webhook a peut-être été supprimé de Discord. Créez un nouveau webhook dans les paramètres du channel.',
          };
        }

        if (response.status === 401) {
          return {
            success: false,
            message: 'Webhook non autorisé',
            details: 'Le token du webhook est invalide. Vérifiez l\'URL complète du webhook.',
          };
        }

        if (response.status === 429) {
          return {
            success: false,
            message: 'Trop de requêtes',
            details: 'Vous avez dépassé la limite de taux de Discord. Attendez quelques instants avant de réessayer.',
          };
        }

        return {
          success: false,
          message: `Erreur Discord: ${response.status}`,
          details: errorData.message || 'Erreur inconnue',
        };
      }

      return {
        success: true,
        message: 'Connexion réussie! Vérifiez votre channel Discord pour voir le message de test.',
      };
    } catch (error: any) {
      console.error('[DiscordService] Connection test failed:', error);

      // Handle network errors
      if (error.name === 'AbortError' || error.name === 'TimeoutError') {
        return {
          success: false,
          message: 'Délai d\'attente dépassé',
          details: 'La connexion à Discord a pris trop de temps. Vérifiez votre connexion internet.',
        };
      }

      if (error.message?.includes('fetch')) {
        return {
          success: false,
          message: 'Erreur de connexion',
          details: 'Impossible de contacter Discord. Vérifiez votre connexion internet.',
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
   * Validate Discord webhook URL format
   */
  private isValidWebhookUrl(url: string): boolean {
    try {
      const parsed = new URL(url);

      // Must be HTTPS
      if (parsed.protocol !== 'https:') {
        return false;
      }

      // Must be discord.com or discordapp.com domain
      if (parsed.hostname !== 'discord.com' && parsed.hostname !== 'discordapp.com') {
        return false;
      }

      // Must start with /api/webhooks/
      if (!parsed.pathname.startsWith('/api/webhooks/')) {
        return false;
      }

      // Should have the format /api/webhooks/WEBHOOK_ID/WEBHOOK_TOKEN
      const parts = parsed.pathname.split('/');
      if (parts.length !== 5 || !parts[3] || !parts[4]) {
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
  async sendTestMessage(credentials: DiscordCredentials): Promise<void> {
    const testMessage = discordFormatter.createTestMessage();

    const response = await fetch(credentials.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testMessage),
      signal: AbortSignal.timeout(WEBHOOK_TIMEOUT_MS),
    });

    if (!response.ok) {
      throw new Error(`Discord API error: ${response.status}`);
    }
  }
}

export const discordService = new DiscordService();
