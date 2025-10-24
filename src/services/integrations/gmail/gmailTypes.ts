/**
 * Gmail Integration Types
 */

export interface GmailSettings {
  events?: string[];
  send_from?: string; // Email address to send from
  reply_to?: string;
  notification_enabled?: boolean;
}

export interface GmailMessage {
  to: string[];
  subject: string;
  body: string;
  cc?: string[];
  bcc?: string[];
  isHtml?: boolean;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface GmailDraft {
  message: GmailMessage;
}

export interface CreateDraftResult {
  success: boolean;
  draftId?: string;
  error?: string;
}
