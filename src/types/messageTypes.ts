// Messaging system types

export type ConversationType = 'personal' | 'organization' | 'system';
export type SenderType = 'user' | 'organization' | 'system';
export type MessageType = 'text' | 'resource_share' | 'link';
export type ParticipantRole = 'member' | 'admin';
export type PermissionType = 'read_only' | 'read_write';

export interface Conversation {
  id: string;
  type: ConversationType;
  is_group: boolean;
  group_name: string | null;
  group_description: string | null;
  organization_id: string | null;
  created_by_user_id: string | null;
  title: string | null;
  auto_delete_days: number | null;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConversationParticipant {
  id: string;
  conversation_id: string;
  user_id: string;
  role: ParticipantRole;
  last_read_at: string | null;
  joined_at: string;
  left_at: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string | null;
  sender_type: SenderType;
  organization_sender_id: string | null;
  content: string;
  message_type: MessageType;
  metadata: MessageMetadata;
  created_at: string;
  updated_at: string | null;
  edited_at: string | null;
  deleted_at: string | null;
}

export interface MessageMetadata {
  resource_id?: string;
  resource_title?: string;
  resource_description?: string;
  permission_type?: PermissionType;
  link_url?: string;
  link_preview?: {
    title?: string;
    description?: string;
    image?: string;
  };
}

export interface ResourceShare {
  id: string;
  message_id: string;
  resource_id: string;
  shared_by_user_id: string;
  shared_with_user_id: string | null;
  conversation_id: string | null;
  permission_type: PermissionType;
  created_at: string;
  expires_at: string | null;
}

// Extended types with joined data for UI
export interface ConversationWithDetails extends Conversation {
  participants?: ConversationParticipantWithProfile[];
  participant_count?: number;
  unread_count?: number;
  last_message?: MessageWithSender;
  other_participant?: UserProfile; // For 1-on-1 conversations
}

export interface ConversationParticipantWithProfile extends ConversationParticipant {
  profile?: UserProfile;
}

export interface MessageWithSender extends Message {
  sender?: UserProfile;
  organization_sender?: {
    id: string;
    name: string;
    logo_url: string | null;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  role: string;
  organization_id?: string | null;
}

// Request/Response types
export interface CreateConversationRequest {
  type: ConversationType;
  is_group: boolean;
  group_name?: string;
  group_description?: string;
  organization_id?: string;
  participant_user_ids: string[];
  auto_delete_days?: number;
}

export interface SendMessageRequest {
  conversation_id: string;
  content: string;
  message_type?: MessageType;
  metadata?: MessageMetadata;
}

export interface UpdateMessageRequest {
  message_id: string;
  content: string;
}

export interface CreateGroupRequest {
  group_name: string;
  group_description?: string;
  participant_user_ids: string[];
  auto_delete_days?: number;
  organization_id?: string;
}

export interface UpdateGroupRequest {
  conversation_id: string;
  group_name?: string;
  group_description?: string;
  auto_delete_days?: number;
}

export interface AddGroupMemberRequest {
  conversation_id: string;
  user_id: string;
  role?: ParticipantRole;
}

export interface ShareResourceRequest {
  conversation_id: string;
  resource_id: string;
  resource_title: string;
  resource_description: string;
  permission_type: PermissionType;
  message_content?: string;
}

// UI state types
export interface MessengerContext {
  type: 'personal' | 'organization';
  organization_id?: string;
}

export interface ConversationFilter {
  type?: ConversationType;
  is_group?: boolean;
  search_query?: string;
  show_archived?: boolean;
}

export interface MessageFilter {
  conversation_id: string;
  limit?: number;
  before_date?: string;
  after_date?: string;
}

export interface UnreadCount {
  total: number;
  by_conversation: Record<string, number>;
  personal_total?: number;
  organization_total?: number;
}

// System message types
export interface SystemMessageData {
  type: 'user_joined' | 'user_left' | 'user_removed' | 'group_created' | 'group_renamed' | 'admin_promoted';
  user_id?: string;
  user_name?: string;
  admin_id?: string;
  admin_name?: string;
  old_name?: string;
  new_name?: string;
}
