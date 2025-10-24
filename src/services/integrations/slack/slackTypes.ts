/**
 * Slack Integration Types
 * Based on Slack Block Kit and Incoming Webhook API
 * Documentation: https://api.slack.com/messaging/webhooks
 */

// =====================================================
// Slack Block Types
// =====================================================

export type SlackBlockType =
  | 'header'
  | 'section'
  | 'divider'
  | 'actions'
  | 'context'
  | 'image';

export type SlackTextType = 'plain_text' | 'mrkdwn';

export interface SlackText {
  type: SlackTextType;
  text: string;
  emoji?: boolean; // Only for plain_text
}

export interface SlackHeaderBlock {
  type: 'header';
  text: SlackText;
}

export interface SlackSectionBlock {
  type: 'section';
  text?: SlackText;
  fields?: SlackText[];
  accessory?: any; // Button, image, etc.
}

export interface SlackDividerBlock {
  type: 'divider';
}

export interface SlackContextBlock {
  type: 'context';
  elements: Array<SlackText | { type: 'image'; image_url: string; alt_text: string }>;
}

export interface SlackImageBlock {
  type: 'image';
  image_url: string;
  alt_text: string;
  title?: SlackText;
}

export interface SlackButton {
  type: 'button';
  text: SlackText;
  url?: string;
  value?: string;
  action_id?: string;
  style?: 'primary' | 'danger';
}

export interface SlackActionsBlock {
  type: 'actions';
  elements: SlackButton[];
}

export type SlackBlock =
  | SlackHeaderBlock
  | SlackSectionBlock
  | SlackDividerBlock
  | SlackContextBlock
  | SlackImageBlock
  | SlackActionsBlock;

// =====================================================
// Slack Message
// =====================================================

export interface SlackMessage {
  text: string; // Fallback text (required)
  blocks?: SlackBlock[];
  attachments?: SlackAttachment[];
  thread_ts?: string; // For threading
  mrkdwn?: boolean;
}

export interface SlackAttachment {
  color?: string;
  fields?: Array<{
    title: string;
    value: string;
    short?: boolean;
  }>;
  footer?: string;
  footer_icon?: string;
  ts?: number;
}

// =====================================================
// Slack API Response
// =====================================================

export interface SlackWebhookResponse {
  ok?: boolean;
  error?: string;
}

// =====================================================
// Helper Types
// =====================================================

export interface SlackMessageOptions {
  includeTimestamp?: boolean;
  includeFooter?: boolean;
  color?: string;
  imageUrl?: string;
}
