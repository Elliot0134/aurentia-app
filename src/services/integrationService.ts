/**
 * Main Integration Service
 * Orchestrates notifications across all integration platforms
 */

import { supabase } from '@/integrations/supabase/client';
import type {
  Integration,
  IntegrationEvent,
  IntegrationCredentials,
  TestConnectionResult,
  SlackCredentials,
  DiscordCredentials,
  TeamsCredentials,
  GoogleCalendarCredentials,
  TrelloCredentials,
  GoogleDriveCredentials,
  GmailCredentials,
} from '@/types/integrationTypes';
import { slackService } from './integrations/slack/slackService';
import { discordService } from './integrations/discord/discordService';
import { teamsService } from './integrations/teams/teamsService';
import { googleCalendarService } from './integrations/google-calendar/googleCalendarService';
import { trelloService } from './integrations/trello/trelloService';
import { googleDriveService } from './integrations/google-drive/googleDriveService';
import { gmailService } from './integrations/gmail/gmailService';
import { encryptionService } from './encryptionService';

class IntegrationService {
  /**
   * Notify all enabled integrations about an event
   * This is the main entry point for triggering notifications
   */
  async notifyEvent(event: IntegrationEvent): Promise<void> {
    try {
      // Get enabled integrations for this user/org
      const integrations = await this.getEnabledIntegrations(event.userId, event.organisationId);

      // Filter integrations that are subscribed to this event type
      const subscribedIntegrations = integrations.filter((integration) =>
        this.isSubscribedToEvent(integration, event.type)
      );

      if (subscribedIntegrations.length === 0) {
        console.log(`[IntegrationService] No integrations subscribed to event: ${event.type}`);
        return;
      }

      console.log(
        `[IntegrationService] Notifying ${subscribedIntegrations.length} integration(s) about: ${event.type}`
      );

      // Send notifications in parallel (don't wait for all to complete)
      // Use Promise.allSettled to not fail if one integration fails
      await Promise.allSettled(
        subscribedIntegrations.map((integration) => this.sendNotification(integration, event))
      );
    } catch (error) {
      console.error('[IntegrationService] Failed to notify integrations:', error);
      // Don't throw - integrations should never block main app functionality
    }
  }

  /**
   * Send notification to a specific integration
   */
  private async sendNotification(integration: Integration, event: IntegrationEvent): Promise<void> {
    const startTime = Date.now();
    let success = false;
    let errorMessage: string | undefined;
    let statusCode: number | undefined;

    try {
      // Decrypt credentials
      const credentials = encryptionService.decrypt<IntegrationCredentials>(integration.credentials);

      // Route to appropriate service based on integration type
      let result;
      switch (integration.integration_type) {
        case 'slack':
          result = await slackService.sendNotification(credentials as SlackCredentials, event);
          break;

        case 'discord':
          result = await discordService.sendNotification(credentials as DiscordCredentials, event);
          break;

        case 'teams':
          result = await teamsService.sendNotification(credentials as TeamsCredentials, event);
          break;

        case 'google_calendar':
          result = await googleCalendarService.sendNotification(
            credentials as GoogleCalendarCredentials,
            event,
            integration.settings
          );
          break;

        case 'trello':
          result = await trelloService.sendNotification(
            credentials as TrelloCredentials,
            event,
            integration.settings
          );
          break;

        case 'google_drive':
          result = await googleDriveService.sendNotification(
            credentials as GoogleDriveCredentials,
            event,
            integration.settings
          );
          break;

        case 'gmail':
          result = await gmailService.sendNotification(
            credentials as GmailCredentials,
            event,
            integration.settings
          );
          break;

        default:
          throw new Error(`Unknown integration type: ${integration.integration_type}`);
      }

      success = result.success;
      statusCode = result.statusCode;
      errorMessage = result.error;

      if (success) {
        // Update last_used_at timestamp
        await supabase
          .from('integrations')
          .update({
            last_used_at: new Date().toISOString(),
            // Clear error message if previously set
            error_message: null,
            status: 'connected',
          })
          .eq('id', integration.id);
      } else {
        // Update integration with error
        await supabase
          .from('integrations')
          .update({
            status: 'error',
            error_message: errorMessage,
          })
          .eq('id', integration.id);
      }
    } catch (error: any) {
      errorMessage = error.message;
      console.error(`[IntegrationService] Failed to notify ${integration.integration_type}:`, error);

      // Update integration status to error
      await supabase
        .from('integrations')
        .update({
          status: 'error',
          error_message: errorMessage,
        })
        .eq('id', integration.id)
        .then(({ error: updateError }) => {
          if (updateError) {
            console.error('[IntegrationService] Failed to update integration status:', updateError);
          }
        });
    } finally {
      // Log the attempt for debugging
      await this.logIntegrationAttempt(
        integration.id,
        event.type,
        success,
        Date.now() - startTime,
        statusCode,
        errorMessage
      );
    }
  }

  /**
   * Get enabled integrations for user/org
   */
  private async getEnabledIntegrations(
    userId: string,
    organisationId?: string
  ): Promise<Integration[]> {
    try {
      const query = supabase.from('integrations').select('*').eq('status', 'connected');

      if (organisationId) {
        query.eq('organisation_id', organisationId);
      } else {
        query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('[IntegrationService] Failed to fetch integrations:', error);
        return [];
      }

      return (data || []) as Integration[];
    } catch (error) {
      console.error('[IntegrationService] Error getting enabled integrations:', error);
      return [];
    }
  }

  /**
   * Check if integration is subscribed to an event type
   */
  private isSubscribedToEvent(integration: Integration, eventType: string): boolean {
    const events = integration.settings?.events;

    if (!events || !Array.isArray(events)) {
      // If no events configured, don't send notifications
      return false;
    }

    return events.includes(eventType);
  }

  /**
   * Log integration attempt for debugging
   */
  private async logIntegrationAttempt(
    integrationId: string,
    eventType: string,
    success: boolean,
    durationMs: number,
    statusCode?: number,
    errorMessage?: string
  ): Promise<void> {
    try {
      await supabase.from('integration_logs').insert({
        integration_id: integrationId,
        event_type: eventType,
        success,
        duration_ms: durationMs,
        status_code: statusCode,
        error_message: errorMessage,
      });
    } catch (error) {
      // Don't throw - logging failures shouldn't block notifications
      console.error('[IntegrationService] Failed to log integration attempt:', error);
    }
  }

  /**
   * Test integration connection
   * This is called from the UI when user clicks "Test Connection"
   */
  async testConnection(integrationId: string): Promise<TestConnectionResult> {
    try {
      const { data: integration, error } = await supabase
        .from('integrations')
        .select('*')
        .eq('id', integrationId)
        .single();

      if (error || !integration) {
        return {
          success: false,
          message: 'Intégration non trouvée',
          details: 'L\'intégration a peut-être été supprimée.',
        };
      }

      // Decrypt credentials
      const credentials = encryptionService.decrypt<IntegrationCredentials>(integration.credentials);

      // Test based on integration type
      let result: TestConnectionResult;

      switch (integration.integration_type) {
        case 'slack':
          result = await slackService.testConnection(credentials as SlackCredentials);
          break;

        case 'discord':
          result = await discordService.testConnection(credentials as DiscordCredentials);
          break;

        case 'teams':
          result = await teamsService.testConnection(credentials as TeamsCredentials);
          break;

        case 'google_calendar':
          result = await googleCalendarService.testConnection(credentials as GoogleCalendarCredentials);
          break;

        case 'trello':
          result = await trelloService.testConnection(credentials as TrelloCredentials);
          break;

        case 'google_drive':
          result = await googleDriveService.testConnection(credentials as GoogleDriveCredentials);
          break;

        case 'gmail':
          result = await gmailService.testConnection(credentials as GmailCredentials);
          break;

        default:
          return {
            success: false,
            message: 'Type d\'intégration inconnu',
            details: integration.integration_type,
          };
      }

      // Update integration status based on test result
      if (result.success) {
        await supabase
          .from('integrations')
          .update({
            status: 'connected',
            connected_at: new Date().toISOString(),
            error_message: null,
          })
          .eq('id', integrationId);
      } else {
        await supabase
          .from('integrations')
          .update({
            status: 'error',
            error_message: result.message,
          })
          .eq('id', integrationId);
      }

      return result;
    } catch (error: any) {
      console.error('[IntegrationService] Connection test failed:', error);

      return {
        success: false,
        message: 'Erreur lors du test de connexion',
        details: error.message || 'Une erreur inconnue s\'est produite',
      };
    }
  }

  /**
   * Get integration logs for debugging
   */
  async getIntegrationLogs(integrationId: string, limit: number = 50) {
    try {
      const { data, error } = await supabase
        .from('integration_logs')
        .select('*')
        .eq('integration_id', integrationId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('[IntegrationService] Failed to fetch logs:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('[IntegrationService] Error getting integration logs:', error);
      return [];
    }
  }

  /**
   * Get integration statistics
   */
  async getIntegrationStats(integrationId: string) {
    try {
      const { data, error } = await supabase
        .from('integration_logs')
        .select('success, duration_ms')
        .eq('integration_id', integrationId);

      if (error || !data) {
        return null;
      }

      const totalCalls = data.length;
      const successfulCalls = data.filter((log) => log.success).length;
      const failedCalls = totalCalls - successfulCalls;
      const successRate = totalCalls > 0 ? (successfulCalls / totalCalls) * 100 : 0;

      const durations = data.filter((log) => log.duration_ms).map((log) => log.duration_ms);
      const avgDuration =
        durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;

      return {
        totalCalls,
        successfulCalls,
        failedCalls,
        successRate: Math.round(successRate),
        avgDuration: Math.round(avgDuration),
      };
    } catch (error) {
      console.error('[IntegrationService] Error getting integration stats:', error);
      return null;
    }
  }
}

// Singleton instance
export const integrationService = new IntegrationService();

// Export for use in mutation callbacks
export { IntegrationService };
