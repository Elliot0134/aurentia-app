// Newsletter system types

export type NewsletterStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
export type NewsletterRecipientStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
export type RecipientFilter = 'adherents' | 'mentors' | 'all';

// Core newsletter interface
export interface Newsletter {
  id: string;
  organization_id: string;
  subject: string;
  content: string; // Rich HTML content
  status: NewsletterStatus;
  recipient_filter: RecipientFilter[];
  scheduled_at: string | null;
  sent_at: string | null;
  created_by: string;
  total_recipients: number;
  delivered_count: number;
  read_count: number;
  created_at: string;
  updated_at: string;
  // Resource linking fields
  source_resource_id: string | null;
  resource_version: number;
  sync_enabled: boolean;
}

// Newsletter recipient tracking
export interface NewsletterRecipient {
  id: string;
  newsletter_id: string;
  user_id: string;
  conversation_id: string | null;
  message_id: string | null;
  status: NewsletterRecipientStatus;
  sent_at: string | null;
  delivered_at: string | null;
  read_at: string | null;
  error_message: string | null;
  created_at: string;
}

// Newsletter resource attachment
export interface NewsletterResource {
  id: string;
  newsletter_id: string;
  resource_id: string;
  display_order: number;
  created_at: string;
}

// Extended newsletter with joined data for UI
export interface NewsletterWithDetails extends Newsletter {
  creator?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
  };
  resources?: Array<{
    id: string;
    resource_id: string;
    display_order: number;
    resource?: {
      id: string;
      title: string;
      description: string | null;
      type: string;
      thumbnail_url: string | null;
    };
  }>;
  delivery_rate?: number; // Calculated: delivered_count / total_recipients * 100
  read_rate?: number; // Calculated: read_count / total_recipients * 100
}

// Newsletter recipient with user details
export interface NewsletterRecipientWithUser extends NewsletterRecipient {
  user?: {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
}

// Request/Response types for API

export interface CreateNewsletterRequest {
  organization_id: string;
  subject: string;
  content: string;
  recipient_filter: RecipientFilter[];
  scheduled_at?: string;
}

export interface UpdateNewsletterRequest {
  subject?: string;
  content?: string;
  recipient_filter?: RecipientFilter[];
  scheduled_at?: string;
}

export interface SendNewsletterRequest {
  newsletter_id: string;
  send_immediately?: boolean; // If false, respect scheduled_at
}

export interface AttachResourceRequest {
  newsletter_id: string;
  resource_id: string;
  display_order?: number;
}

// Statistics and analytics types
export interface NewsletterStats {
  newsletter_id: string;
  total_recipients: number;
  sent_count: number;
  delivered_count: number;
  read_count: number;
  failed_count: number;
  delivery_rate: number; // Percentage
  read_rate: number; // Percentage
  avg_time_to_read?: number; // Average time in minutes from sent to read
}

export interface NewsletterAnalytics {
  stats: NewsletterStats;
  recipients: NewsletterRecipientWithUser[];
  delivery_timeline: Array<{
    hour: string; // ISO timestamp rounded to hour
    sent: number;
    delivered: number;
    read: number;
  }>;
  status_distribution: {
    pending: number;
    sent: number;
    delivered: number;
    read: number;
    failed: number;
  };
}

// UI state types
export interface NewsletterFilters {
  status?: NewsletterStatus;
  search?: string;
  date_from?: string;
  date_to?: string;
}

export interface RecipientSelection {
  adherents: boolean;
  mentors: boolean;
}

// Form data for creating/editing newsletters
export interface NewsletterFormData {
  subject: string;
  content: string;
  recipient_filter: RecipientFilter[];
  scheduled_at?: string;
  resource_ids: string[];
}
