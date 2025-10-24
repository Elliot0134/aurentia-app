/**
 * Integration System Types
 * Phase 1: Slack & Discord webhook integrations
 */

// =====================================================
// Core Integration Types
// =====================================================

export type IntegrationType = 'slack' | 'discord' | 'teams' | 'google_calendar' | 'trello' | 'google_drive' | 'gmail';

export type IntegrationStatus = 'connected' | 'disconnected' | 'error' | 'pending';

export type IntegrationScope = 'personal' | 'organization';

// =====================================================
// Database Models
// =====================================================

export interface Integration {
  id: string;
  user_id: string | null;
  organisation_id: string | null;
  integration_type: IntegrationType;
  status: IntegrationStatus;
  credentials: string; // Encrypted JSON string
  settings: IntegrationSettings;
  created_at: string;
  updated_at: string;
  connected_at: string | null;
  last_used_at: string | null;
  last_sync_at: string | null;
  error_message: string | null;
}

export interface IntegrationWebhook {
  id: string;
  user_id: string | null;
  organisation_id: string | null;
  name: string;
  url: string;
  events: string[];
  secret: string | null;
  active: boolean;
  retry_on_failure: boolean;
  max_retries: number;
  timeout_seconds: number;
  created_at: string;
  updated_at: string;
  last_triggered_at: string | null;
  total_calls: number;
  failed_calls: number;
}

export interface IntegrationApiKey {
  id: string;
  user_id: string | null;
  organisation_id: string | null;
  name: string;
  key_hash: string;
  key_prefix: string;
  scope: IntegrationScope;
  permissions: {
    read: boolean;
    write: boolean;
  };
  rate_limit: number;
  created_at: string;
  last_used_at: string | null;
  expires_at: string | null;
  revoked: boolean;
}

export interface IntegrationLog {
  id: string;
  integration_id: string;
  event_type: string;
  payload: Record<string, any> | null;
  response: Record<string, any> | null;
  status_code: number | null;
  success: boolean;
  error_message: string | null;
  created_at: string;
  duration_ms: number | null;
}

// =====================================================
// Decrypted Credentials Types
// =====================================================

export interface SlackCredentials {
  webhookUrl: string;
}

export interface DiscordCredentials {
  webhookUrl: string;
}

export interface TeamsCredentials {
  webhookUrl: string;
}

export interface GoogleCalendarCredentials {
  accessToken: string;
  refreshToken: string;
  expiresAt: string; // ISO 8601 timestamp
  scope: string;
  email?: string;
}

export interface TrelloCredentials {
  apiKey: string;
  token: string;
  userId?: string;
  username?: string;
  fullName?: string;
}

export interface GoogleDriveCredentials {
  accessToken: string;
  refreshToken: string;
  expiresAt: string; // ISO 8601 timestamp
  scope: string;
  email?: string;
}

export interface GmailCredentials {
  accessToken: string;
  refreshToken: string;
  expiresAt: string; // ISO 8601 timestamp
  scope: string;
  email?: string;
}

export type IntegrationCredentials =
  | SlackCredentials
  | DiscordCredentials
  | TeamsCredentials
  | GoogleCalendarCredentials
  | TrelloCredentials
  | GoogleDriveCredentials
  | GmailCredentials;

// =====================================================
// Integration Settings
// =====================================================

export interface IntegrationSettings {
  events?: string[]; // Events to notify about
  channel_name?: string; // For Slack/Discord/Teams
  board_id?: string; // For Trello
  calendar_id?: string; // For Google Calendar
  folder_id?: string; // For Google Drive
  sync_frequency?: 'realtime' | 'hourly' | 'daily'; // For sync integrations
  notification_format?: 'rich' | 'simple'; // For messaging integrations
  [key: string]: any; // Allow additional custom settings
}

// =====================================================
// Integration Events
// =====================================================

export type IntegrationEventType =
  | 'project.created'
  | 'project.updated'
  | 'project.deleted'
  | 'deliverable.submitted'
  | 'deliverable.reviewed'
  | 'deliverable.updated'
  | 'comment.added'
  | 'member.joined'
  | 'member.updated'
  | 'member.removed'
  | 'event.created'
  | 'event.updated'
  | 'event.reminder'
  | 'organization.settings.updated';

export interface IntegrationEvent {
  type: IntegrationEventType;
  data: Record<string, any>;
  userId: string;
  organisationId?: string;
  timestamp?: string;
}

// =====================================================
// UI/Frontend Types
// =====================================================

export interface IntegrationConfig {
  type: IntegrationType;
  name: string;
  icon: string;
  description: string;
  setupInstructions: string;
  credentialLabel?: string;
  credentialPlaceholder?: string;
  credentialHint?: string;
  requiresOAuth: boolean;
  phase: 1 | 2 | 3; // Implementation phase
  category?: 'messaging' | 'calendar' | 'project_management' | 'storage';
}

export interface AvailableEvent {
  type: IntegrationEventType;
  label: string;
  description: string;
  category?: 'project' | 'deliverable' | 'member' | 'event' | 'organization';
}

// =====================================================
// Service Layer Types
// =====================================================

export interface TestConnectionResult {
  success: boolean;
  message: string;
  details?: string;
}

export interface SendNotificationResult {
  success: boolean;
  statusCode?: number;
  error?: string;
  duration?: number;
}

// =====================================================
// Form/Input Types
// =====================================================

export interface CreateIntegrationInput {
  integration_type: IntegrationType;
  credentials: IntegrationCredentials;
  settings?: IntegrationSettings;
}

export interface UpdateIntegrationInput {
  credentials?: IntegrationCredentials;
  settings?: IntegrationSettings;
  status?: IntegrationStatus;
}

export interface CreateWebhookInput {
  name: string;
  url: string;
  events?: string[];
  secret?: string;
  active?: boolean;
}

export interface UpdateWebhookInput {
  name?: string;
  url?: string;
  events?: string[];
  secret?: string;
  active?: boolean;
}

export interface CreateApiKeyInput {
  name: string;
  scope: IntegrationScope;
  permissions?: {
    read: boolean;
    write: boolean;
  };
  rate_limit?: number;
  expires_at?: string;
}

// =====================================================
// Slack Message Types
// =====================================================

export interface SlackBlock {
  type: string;
  text?: {
    type: string;
    text: string;
  };
  fields?: Array<{
    type: string;
    text: string;
  }>;
  elements?: any[];
  [key: string]: any;
}

export interface SlackMessage {
  text: string;
  blocks?: SlackBlock[];
  attachments?: any[];
}

// =====================================================
// Discord Message Types
// =====================================================

export interface DiscordEmbed {
  title?: string;
  description?: string;
  color?: number;
  fields?: Array<{
    name: string;
    value: string;
    inline?: boolean;
  }>;
  footer?: {
    text: string;
    icon_url?: string;
  };
  timestamp?: string;
  author?: {
    name: string;
    icon_url?: string;
  };
}

export interface DiscordMessage {
  content?: string;
  embeds?: DiscordEmbed[];
  username?: string;
  avatar_url?: string;
}

// =====================================================
// Teams Message Types (Adaptive Cards)
// =====================================================

export interface TeamsAdaptiveCard {
  type: string;
  attachments: Array<{
    contentType: string;
    content: {
      $schema: string;
      type: string;
      version: string;
      body: any[];
      actions?: any[];
    };
  }>;
}

// =====================================================
// Helper Types
// =====================================================

export interface IntegrationWithDecryptedCredentials extends Omit<Integration, 'credentials'> {
  credentials: IntegrationCredentials;
}

export type IntegrationOwner =
  | { type: 'user'; id: string }
  | { type: 'organization'; id: string };
