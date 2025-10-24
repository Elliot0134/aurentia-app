// Knowledge Base Types

export type KnowledgeBaseContentType = 'document' | 'text' | 'url';

export type KnowledgeBaseVisibility = 'organization' | 'staff';

export type EntityType = 'project' | 'organization';

// Base knowledge base item interface
export interface KnowledgeBaseItem {
  id: string;
  title: string;
  content_type: KnowledgeBaseContentType;
  content_data: Record<string, any>;
  file_size: number;
  file_url?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

// Project knowledge base item
export interface ProjectKnowledgeBaseItem extends KnowledgeBaseItem {
  project_id: string;
  user_id: string;
}

// Organization knowledge base item
export interface OrganizationKnowledgeBaseItem extends KnowledgeBaseItem {
  organization_id: string;
  created_by: string;
  visibility: KnowledgeBaseVisibility;
}

// Content data structures for each type
export interface DocumentContentData {
  file_name: string;
  file_type: string;
  file_size: number;
  file_url: string;
  description?: string;
}

export interface TextContentData {
  text: string;
  description?: string;
}

export interface UrlContentData {
  url: string;
  description?: string;
  preview_title?: string;
  preview_image?: string;
}

// Storage usage tracking
export interface StorageUsage {
  id: string;
  entity_type: EntityType;
  entity_id: string;
  total_size_bytes: number;
  updated_at: string;
}

// Storage limits based on plan/subscription
export interface StorageLimit {
  limit_bytes: number;
  used_bytes: number;
  percentage: number;
  is_exceeded: boolean;
  remaining_bytes: number;
}

// Upload progress
export interface UploadProgress {
  file_name: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

// Form data for creating knowledge base items
export interface CreateKnowledgeBaseItemInput {
  title: string;
  content_type: KnowledgeBaseContentType;
  content_data: DocumentContentData | TextContentData | UrlContentData;
  file_size?: number;
  file_url?: string;
  tags?: string[];
}

export interface CreateProjectKnowledgeBaseInput extends CreateKnowledgeBaseItemInput {
  project_id: string;
  user_id: string;
}

export interface CreateOrganizationKnowledgeBaseInput extends CreateKnowledgeBaseItemInput {
  organization_id: string;
  created_by: string;
  visibility?: KnowledgeBaseVisibility;
}

// Update knowledge base item
export interface UpdateKnowledgeBaseItemInput {
  title?: string;
  content_data?: Record<string, any>;
  tags?: string[];
  visibility?: KnowledgeBaseVisibility;
}

// Filter and search options
export interface KnowledgeBaseFilters {
  content_type?: KnowledgeBaseContentType;
  tags?: string[];
  search_query?: string;
}

// Storage plan limits (in bytes)
export const STORAGE_LIMITS = {
  project: {
    active: 5 * 1024 * 1024 * 1024, // 5 GB
    inactive: 0, // Blocked
  },
  organization: {
    starter: 50 * 1024 * 1024 * 1024, // 50 GB
    pro: 150 * 1024 * 1024 * 1024, // 150 GB
    max: 500 * 1024 * 1024 * 1024, // 500 GB
    free: 0, // Blocked
    custom: 0, // Blocked
  },
} as const;

// Storage warning thresholds
export const STORAGE_WARNING_THRESHOLDS = {
  warning: 80, // Show warning at 80%
  critical: 90, // Show critical warning at 90%
  full: 100, // Block uploads at 100%
} as const;

// Utility type for organization plans
export type OrganizationPlan = 'free' | 'starter' | 'pro' | 'max' | 'custom';

// Utility type for subscription status
export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'past_due';
