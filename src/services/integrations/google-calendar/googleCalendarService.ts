/**
 * Google Calendar Integration Service
 * Handles syncing Aurentia events to Google Calendar
 */

import type {
  IntegrationEvent,
  GoogleCalendarCredentials,
  SendNotificationResult,
  TestConnectionResult,
} from '@/types/integrationTypes';
import type {
  GoogleCalendarEvent,
  GoogleCalendarSettings,
  SyncEventResult,
  GoogleCalendarListResponse,
} from './googleCalendarTypes';
import { googleCalendarFormatter } from './googleCalendarFormatter';

const GOOGLE_CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3';
const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const REQUEST_TIMEOUT_MS = 10000; // 10 seconds

class GoogleCalendarService {
  /**
   * Sync an Aurentia event to Google Calendar
   * This is called from the main integration service
   */
  async sendNotification(
    credentials: GoogleCalendarCredentials,
    event: IntegrationEvent,
    settings?: GoogleCalendarSettings
  ): Promise<SendNotificationResult> {
    const startTime = Date.now();

    try {
      // Default settings if not provided
      const calendarSettings: GoogleCalendarSettings = settings || {
        events: [],
        calendar_id: 'primary',
        sync_enabled: true,
        sync_direction: 'aurentia_to_google',
      };

      // Format event for Google Calendar
      const calendarEvent = googleCalendarFormatter.formatEvent(event, calendarSettings);

      if (!calendarEvent) {
        // Event type not supported for calendar sync
        return {
          success: true,
          statusCode: 200,
          duration: Date.now() - startTime,
        };
      }

      // Ensure we have a valid access token
      const validCredentials = await this.ensureValidToken(credentials);

      // Create event in Google Calendar
      const result = await this.createCalendarEvent(
        validCredentials.accessToken,
        calendarSettings.calendar_id,
        calendarEvent
      );

      return {
        success: result.success,
        statusCode: result.success ? 200 : 500,
        duration: Date.now() - startTime,
        error: result.error,
      };
    } catch (error: any) {
      console.error('[GoogleCalendarService] Failed to sync event:', error);

      return {
        success: false,
        error: error.message || 'Unknown error',
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Create an event in Google Calendar
   */
  async createCalendarEvent(
    accessToken: string,
    calendarId: string,
    event: GoogleCalendarEvent
  ): Promise<SyncEventResult> {
    try {
      const response = await fetch(
        `${GOOGLE_CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events?conferenceDataVersion=1`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Google Calendar API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`
        );
      }

      const createdEvent: GoogleCalendarEvent = await response.json();

      return {
        success: true,
        googleEventId: createdEvent.id,
        googleEventLink: createdEvent.htmlLink,
      };
    } catch (error: any) {
      console.error('[GoogleCalendarService] Failed to create event:', error);

      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Test Google Calendar connection
   */
  async testConnection(credentials: GoogleCalendarCredentials): Promise<TestConnectionResult> {
    try {
      // Ensure we have a valid access token
      const validCredentials = await this.ensureValidToken(credentials);

      // Try to list calendars (simple API call to test connection)
      const response = await fetch(`${GOOGLE_CALENDAR_API_BASE}/users/me/calendarList`, {
        headers: {
          Authorization: `Bearer ${validCredentials.accessToken}`,
        },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      if (!response.ok) {
        const errorData = await response.json();

        if (response.status === 401) {
          return {
            success: false,
            message: 'Token invalide',
            details: 'Veuillez reconnecter votre compte Google Calendar.',
          };
        }

        return {
          success: false,
          message: `Erreur Google Calendar: ${response.status}`,
          details: errorData.error?.message || 'Erreur inconnue',
        };
      }

      const data: GoogleCalendarListResponse = await response.json();
      const calendarCount = data.items?.length || 0;

      return {
        success: true,
        message: `Connexion réussie! ${calendarCount} calendrier(s) disponible(s).`,
      };
    } catch (error: any) {
      console.error('[GoogleCalendarService] Connection test failed:', error);

      if (error.name === 'AbortError' || error.name === 'TimeoutError') {
        return {
          success: false,
          message: "Délai d'attente dépassé",
          details: 'La connexion à Google Calendar a pris trop de temps.',
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
   * Ensure access token is valid, refresh if needed
   */
  private async ensureValidToken(
    credentials: GoogleCalendarCredentials
  ): Promise<GoogleCalendarCredentials> {
    const now = new Date();
    const expiresAt = new Date(credentials.expiresAt);

    // If token expires in less than 5 minutes, refresh it
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

    if (expiresAt > fiveMinutesFromNow) {
      // Token is still valid
      return credentials;
    }

    // Token expired or expiring soon - refresh it
    console.log('[GoogleCalendarService] Refreshing access token...');

    try {
      const response = await fetch(GOOGLE_TOKEN_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
          refresh_token: credentials.refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();

      // Update credentials with new access token
      return {
        ...credentials,
        accessToken: data.access_token,
        expiresAt: new Date(Date.now() + data.expires_in * 1000).toISOString(),
      };
    } catch (error) {
      console.error('[GoogleCalendarService] Token refresh failed:', error);
      // Return original credentials and let the API call fail
      // The error will be caught and the integration status will be updated
      return credentials;
    }
  }

  /**
   * List available calendars for the user
   * Used in the UI to let user select which calendar to sync to
   */
  async listCalendars(accessToken: string): Promise<GoogleCalendarListResponse> {
    const response = await fetch(`${GOOGLE_CALENDAR_API_BASE}/users/me/calendarList`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      throw new Error(`Failed to list calendars: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Update an existing Google Calendar event
   * For future bidirectional sync
   */
  async updateCalendarEvent(
    accessToken: string,
    calendarId: string,
    eventId: string,
    event: GoogleCalendarEvent
  ): Promise<SyncEventResult> {
    try {
      const response = await fetch(
        `${GOOGLE_CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Google Calendar API error: ${response.status}`);
      }

      const updatedEvent: GoogleCalendarEvent = await response.json();

      return {
        success: true,
        googleEventId: updatedEvent.id,
        googleEventLink: updatedEvent.htmlLink,
      };
    } catch (error: any) {
      console.error('[GoogleCalendarService] Failed to update event:', error);

      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Delete a Google Calendar event
   * For future bidirectional sync
   */
  async deleteCalendarEvent(
    accessToken: string,
    calendarId: string,
    eventId: string
  ): Promise<boolean> {
    try {
      const response = await fetch(
        `${GOOGLE_CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        }
      );

      return response.ok;
    } catch (error) {
      console.error('[GoogleCalendarService] Failed to delete event:', error);
      return false;
    }
  }
}

export const googleCalendarService = new GoogleCalendarService();
