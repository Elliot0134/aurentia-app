/**
 * Gmail Integration Service
 * Handles sending emails via Gmail API
 */

import type {
  IntegrationEvent,
  GmailCredentials,
  SendNotificationResult,
  TestConnectionResult,
} from '@/types/integrationTypes';
import type { GmailSettings, SendEmailResult, GmailMessage } from './gmailTypes';
import { gmailFormatter } from './gmailFormatter';

const GMAIL_API_BASE = 'https://gmail.googleapis.com/gmail/v1';
const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const REQUEST_TIMEOUT_MS = 10000; // 10 seconds

class GmailService {
  /**
   * Send email notification for integration event
   */
  async sendNotification(
    credentials: GmailCredentials,
    event: IntegrationEvent,
    settings?: GmailSettings
  ): Promise<SendNotificationResult> {
    const startTime = Date.now();

    try {
      const gmailSettings: GmailSettings = settings || {
        events: [],
        notification_enabled: true,
      };

      // Format event as email message
      const emailMessage = gmailFormatter.formatEvent(event, gmailSettings);

      if (!emailMessage) {
        return {
          success: true,
          statusCode: 200,
          duration: Date.now() - startTime,
        };
      }

      // Ensure we have a valid access token
      const validCredentials = await this.ensureValidToken(credentials);

      // Send email
      const result = await this.sendEmail(validCredentials.accessToken, emailMessage);

      return {
        success: result.success,
        statusCode: result.success ? 200 : 500,
        duration: Date.now() - startTime,
        error: result.error,
      };
    } catch (error: any) {
      console.error('[GmailService] Failed to send email:', error);

      return {
        success: false,
        error: error.message || 'Unknown error',
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Send an email via Gmail API
   */
  async sendEmail(accessToken: string, message: GmailMessage): Promise<SendEmailResult> {
    try {
      // Create RFC 2822 formatted email
      const email = this.createRfc2822Email(message);

      // Base64 encode the email
      const encodedEmail = btoa(unescape(encodeURIComponent(email)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const response = await fetch(`${GMAIL_API_BASE}/users/me/messages/send`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          raw: encodedEmail,
        }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('[GmailService] Send email failed:', error);
        return {
          success: false,
          error: `Failed to send email: ${response.statusText}`,
        };
      }

      const result = await response.json();

      return {
        success: true,
        messageId: result.id,
      };
    } catch (error: any) {
      console.error('[GmailService] Send email error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send email',
      };
    }
  }

  /**
   * Create RFC 2822 formatted email
   */
  private createRfc2822Email(message: GmailMessage): string {
    const lines: string[] = [];

    // To
    lines.push(`To: ${message.to.join(', ')}`);

    // CC
    if (message.cc && message.cc.length > 0) {
      lines.push(`Cc: ${message.cc.join(', ')}`);
    }

    // BCC
    if (message.bcc && message.bcc.length > 0) {
      lines.push(`Bcc: ${message.bcc.join(', ')}`);
    }

    // Subject
    lines.push(`Subject: ${message.subject}`);

    // MIME type
    if (message.isHtml) {
      lines.push('MIME-Version: 1.0');
      lines.push('Content-Type: text/html; charset=UTF-8');
    } else {
      lines.push('Content-Type: text/plain; charset=UTF-8');
    }

    // Empty line between headers and body
    lines.push('');

    // Body
    lines.push(message.body);

    return lines.join('\r\n');
  }

  /**
   * Test connection by getting user's Gmail profile
   */
  async testConnection(credentials: GmailCredentials): Promise<TestConnectionResult> {
    try {
      const validCredentials = await this.ensureValidToken(credentials);

      const response = await fetch(`${GMAIL_API_BASE}/users/me/profile`, {
        headers: {
          Authorization: `Bearer ${validCredentials.accessToken}`,
        },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      if (!response.ok) {
        return {
          success: false,
          message: 'Failed to connect to Gmail',
          details: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const profile = await response.json();

      return {
        success: true,
        message: `Gmail connected successfully (${profile.emailAddress})`,
      };
    } catch (error: any) {
      console.error('[GmailService] Test connection failed:', error);
      return {
        success: false,
        message: 'Connection test failed',
        details: error.message,
      };
    }
  }

  /**
   * Ensure access token is valid, refresh if needed
   */
  private async ensureValidToken(credentials: GmailCredentials): Promise<GmailCredentials> {
    const expiresAt = new Date(credentials.expiresAt);
    const now = new Date();

    // If token expires in less than 5 minutes, refresh it
    if (expiresAt.getTime() - now.getTime() < 5 * 60 * 1000) {
      return await this.refreshToken(credentials);
    }

    return credentials;
  }

  /**
   * Refresh the OAuth access token
   */
  private async refreshToken(credentials: GmailCredentials): Promise<GmailCredentials> {
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
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();

      return {
        ...credentials,
        accessToken: data.access_token,
        expiresAt: new Date(Date.now() + data.expires_in * 1000).toISOString(),
      };
    } catch (error: any) {
      console.error('[GmailService] Token refresh failed:', error);
      throw new Error('Failed to refresh access token');
    }
  }
}

export const gmailService = new GmailService();
