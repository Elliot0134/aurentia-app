import { supabase } from "@/integrations/supabase/client";
import type {
  Conversation,
  ConversationWithDetails,
  Message,
  MessageWithSender,
  ConversationParticipant,
  ConversationParticipantWithProfile,
  CreateConversationRequest,
  SendMessageRequest,
  UpdateMessageRequest,
  CreateGroupRequest,
  UpdateGroupRequest,
  AddGroupMemberRequest,
  MessageFilter,
  UnreadCount,
} from "@/types/messageTypes";

// =============================================
// CONVERSATION QUERIES
// =============================================

export const getConversations = async (
  userId: string,
  organizationId?: string
): Promise<ConversationWithDetails[]> => {
  // Get conversations where user is a participant
  const { data: participations, error: partError } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("user_id", userId)
    .is("left_at", null);

  if (partError) throw partError;
  if (!participations || participations.length === 0) return [];

  const conversationIds = participations.map((p) => p.conversation_id);

  // Build query
  let query = supabase
    .from("conversations")
    .select("*")
    .in("id", conversationIds)
    .order("last_message_at", { ascending: false, nullsFirst: false });

  // Filter by organization if provided
  if (organizationId) {
    query = query.eq("organization_id", organizationId);
  }

  const { data, error } = await query;
  if (error) throw error;

  // Enrich with participant details and last message
  const enriched = await Promise.all(
    (data || []).map(async (conv) => {
      const details: ConversationWithDetails = { ...conv };

      // Get participants
      const participants = await getConversationParticipants(conv.id);
      details.participants = participants;
      details.participant_count = participants.filter(
        (p) => !p.left_at
      ).length;

      // For 1-on-1, get the other participant
      if (!conv.is_group && participants.length === 2) {
        const otherParticipant = participants.find((p) => p.user_id !== userId);
        if (otherParticipant) {
          details.other_participant = otherParticipant.profile;
        }
      }

      // Get last message
      const lastMessage = await getLastMessage(conv.id);
      if (lastMessage) {
        details.last_message = lastMessage;
      }

      // Get unread count
      const unreadCount = await getUnreadCount(conv.id, userId);
      details.unread_count = unreadCount;

      return details;
    })
  );

  return enriched;
};

export const getConversationById = async (
  conversationId: string
): Promise<ConversationWithDetails | null> => {
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", conversationId)
    .single();

  if (error) throw error;
  if (!data) return null;

  // Enrich with participants
  const participants = await getConversationParticipants(conversationId);
  const details: ConversationWithDetails = {
    ...data,
    participants,
    participant_count: participants.filter((p) => !p.left_at).length,
  };

  return details;
};

export const createConversation = async (
  request: CreateConversationRequest
): Promise<Conversation> => {
  const currentUser = (await supabase.auth.getUser()).data.user;
  if (!currentUser) throw new Error("Not authenticated");

  // Create conversation
  const { data: conversation, error: convError } = await supabase
    .from("conversations")
    .insert({
      type: request.type,
      is_group: request.is_group,
      group_name: request.group_name,
      group_description: request.group_description,
      organization_id: request.organization_id,
      created_by_user_id: currentUser.id,
      auto_delete_days: request.auto_delete_days,
    })
    .select()
    .single();

  if (convError) throw convError;

  // Add participants (including creator)
  const allParticipantIds = [
    currentUser.id,
    ...request.participant_user_ids.filter((id) => id !== currentUser.id),
  ];

  const participants = allParticipantIds.map((userId, index) => ({
    conversation_id: conversation.id,
    user_id: userId,
    role: index === 0 ? "admin" : "member", // Creator is admin
  }));

  const { error: partError } = await supabase
    .from("conversation_participants")
    .insert(participants);

  if (partError) throw partError;

  return conversation;
};

export const findOrCreateDirectConversation = async (
  otherUserId: string
): Promise<Conversation> => {
  const currentUser = (await supabase.auth.getUser()).data.user;
  if (!currentUser) throw new Error("Not authenticated");

  // Check if conversation already exists
  const { data: existingParticipations } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("user_id", currentUser.id)
    .is("left_at", null);

  if (existingParticipations) {
    for (const part of existingParticipations) {
      const { data: otherPart } = await supabase
        .from("conversation_participants")
        .select("conversation_id, user_id")
        .eq("conversation_id", part.conversation_id)
        .is("left_at", null);

      if (
        otherPart &&
        otherPart.length === 2 &&
        otherPart.some((p) => p.user_id === otherUserId)
      ) {
        // Found existing 1-on-1 conversation
        const { data: conversation } = await supabase
          .from("conversations")
          .select("*")
          .eq("id", part.conversation_id)
          .eq("is_group", false)
          .single();

        if (conversation) return conversation;
      }
    }
  }

  // Create new conversation
  return createConversation({
    type: "personal",
    is_group: false,
    participant_user_ids: [otherUserId],
  });
};

export const updateConversation = async (
  conversationId: string,
  updates: Partial<Conversation>
): Promise<Conversation> => {
  const { data, error } = await supabase
    .from("conversations")
    .update(updates)
    .eq("id", conversationId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteConversation = async (
  conversationId: string
): Promise<void> => {
  const { error } = await supabase
    .from("conversations")
    .delete()
    .eq("id", conversationId);

  if (error) throw error;
};

// =============================================
// PARTICIPANT QUERIES
// =============================================

export const getConversationParticipants = async (
  conversationId: string
): Promise<ConversationParticipantWithProfile[]> => {
  const { data, error } = await supabase
    .from("conversation_participants")
    .select(
      `
      *,
      profile:profiles!conversation_participants_user_id_fkey (
        id,
        email,
        first_name,
        last_name,
        avatar_url,
        role,
        organization_id
      )
    `
    )
    .eq("conversation_id", conversationId);

  if (error) throw error;
  return data as ConversationParticipantWithProfile[];
};

export const addParticipant = async (
  request: AddGroupMemberRequest
): Promise<ConversationParticipant> => {
  const { data, error } = await supabase
    .from("conversation_participants")
    .insert({
      conversation_id: request.conversation_id,
      user_id: request.user_id,
      role: request.role || "member",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const removeParticipant = async (
  conversationId: string,
  userId: string
): Promise<void> => {
  // Soft delete by setting left_at
  const { error } = await supabase
    .from("conversation_participants")
    .update({ left_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .eq("user_id", userId);

  if (error) throw error;
};

export const leaveConversation = async (
  conversationId: string
): Promise<void> => {
  const currentUser = (await supabase.auth.getUser()).data.user;
  if (!currentUser) throw new Error("Not authenticated");

  await removeParticipant(conversationId, currentUser.id);
};

export const updateParticipantRole = async (
  conversationId: string,
  userId: string,
  role: "member" | "admin"
): Promise<void> => {
  const { error } = await supabase
    .from("conversation_participants")
    .update({ role })
    .eq("conversation_id", conversationId)
    .eq("user_id", userId);

  if (error) throw error;
};

export const updateLastReadAt = async (
  conversationId: string
): Promise<void> => {
  const currentUser = (await supabase.auth.getUser()).data.user;
  if (!currentUser) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("conversation_participants")
    .update({ last_read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .eq("user_id", currentUser.id);

  if (error) throw error;
};

// =============================================
// MESSAGE QUERIES
// =============================================

export const getMessages = async (
  filter: MessageFilter
): Promise<MessageWithSender[]> => {
  let query = supabase
    .from("conversation_messages")
    .select(
      `
      *,
      sender:profiles!conversation_messages_sender_id_fkey (
        id,
        email,
        first_name,
        last_name,
        avatar_url,
        role,
        organization_id
      ),
      organization_sender:organizations!conversation_messages_organization_sender_id_fkey (
        id,
        name,
        logo_url
      )
    `
    )
    .eq("conversation_id", filter.conversation_id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(filter.limit || 50);

  if (filter.before_date) {
    query = query.lt("created_at", filter.before_date);
  }

  if (filter.after_date) {
    query = query.gt("created_at", filter.after_date);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data || []) as MessageWithSender[];
};

export const getLastMessage = async (
  conversationId: string
): Promise<MessageWithSender | null> => {
  const messages = await getMessages({ conversation_id: conversationId, limit: 1 });
  return messages[0] || null;
};

export const sendMessage = async (
  request: SendMessageRequest
): Promise<Message> => {
  const currentUser = (await supabase.auth.getUser()).data.user;
  if (!currentUser) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("conversation_messages")
    .insert({
      conversation_id: request.conversation_id,
      sender_id: currentUser.id,
      sender_type: "user",
      content: request.content,
      message_type: request.message_type || "text",
      metadata: request.metadata || {},
    })
    .select()
    .single();

  if (error) throw error;

  // Update last_read_at for sender
  await updateLastReadAt(request.conversation_id);

  return data;
};

export const sendOrganizationMessage = async (
  conversationId: string,
  organizationId: string,
  content: string
): Promise<Message> => {
  const { data, error } = await supabase
    .from("conversation_messages")
    .insert({
      conversation_id: conversationId,
      sender_type: "organization",
      organization_sender_id: organizationId,
      content,
      message_type: "text",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const editMessage = async (
  request: UpdateMessageRequest
): Promise<Message> => {
  const { data, error } = await supabase
    .from("conversation_messages")
    .update({
      content: request.content,
      edited_at: new Date().toISOString(),
    })
    .eq("id", request.message_id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteMessage = async (messageId: string): Promise<void> => {
  // Soft delete
  const { error } = await supabase
    .from("conversation_messages")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", messageId);

  if (error) throw error;
};

export const cleanupOldMessages = async (
  conversationId: string
): Promise<number> => {
  const { data, error } = await supabase.rpc("cleanup_old_messages", {
    p_conversation_id: conversationId,
  });

  if (error) throw error;
  return data || 0;
};

// =============================================
// UNREAD COUNT QUERIES
// =============================================

export const getUnreadCount = async (
  conversationId: string,
  userId: string
): Promise<number> => {
  // Get last_read_at for user
  const { data: participant } = await supabase
    .from("conversation_participants")
    .select("last_read_at")
    .eq("conversation_id", conversationId)
    .eq("user_id", userId)
    .single();

  if (!participant) return 0;

  // Count messages after last_read_at
  let query = supabase
    .from("conversation_messages")
    .select("id", { count: "exact", head: true })
    .eq("conversation_id", conversationId)
    .is("deleted_at", null)
    .neq("sender_id", userId);

  if (participant.last_read_at) {
    query = query.gt("created_at", participant.last_read_at);
  }

  const { count, error } = await query;
  if (error) throw error;

  return count || 0;
};

export const getTotalUnreadCount = async (
  userId: string
): Promise<UnreadCount> => {
  // Get all user's conversations
  const { data: participations } = await supabase
    .from("conversation_participants")
    .select("conversation_id, last_read_at")
    .eq("user_id", userId)
    .is("left_at", null);

  if (!participations) {
    return { total: 0, by_conversation: {} };
  }

  let total = 0;
  const by_conversation: Record<string, number> = {};

  for (const part of participations) {
    const count = await getUnreadCount(part.conversation_id, userId);
    by_conversation[part.conversation_id] = count;
    total += count;
  }

  return { total, by_conversation };
};

// =============================================
// GROUP QUERIES
// =============================================

export const createGroup = async (
  request: CreateGroupRequest
): Promise<Conversation> => {
  return createConversation({
    type: request.organization_id ? "organization" : "personal",
    is_group: true,
    group_name: request.group_name,
    group_description: request.group_description,
    participant_user_ids: request.participant_user_ids,
    auto_delete_days: request.auto_delete_days,
    organization_id: request.organization_id,
  });
};

export const updateGroup = async (
  request: UpdateGroupRequest
): Promise<Conversation> => {
  const updates: Partial<Conversation> = {};

  if (request.group_name !== undefined) updates.group_name = request.group_name;
  if (request.group_description !== undefined)
    updates.group_description = request.group_description;
  if (request.auto_delete_days !== undefined)
    updates.auto_delete_days = request.auto_delete_days;

  return updateConversation(request.conversation_id, updates);
};

// =============================================
// SEARCH QUERIES
// =============================================

export const searchUsers = async (
  query: string,
  excludeUserIds: string[] = []
): Promise<Array<{
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
}>> => {
  let searchQuery = supabase
    .from("profiles")
    .select("id, email, first_name, last_name, avatar_url")
    .limit(20);

  if (excludeUserIds.length > 0) {
    searchQuery = searchQuery.not("id", "in", `(${excludeUserIds.join(",")})`);
  }

  // Search by email or name
  if (query) {
    searchQuery = searchQuery.or(
      `email.ilike.%${query}%,first_name.ilike.%${query}%,last_name.ilike.%${query}%`
    );
  }

  const { data, error } = await searchQuery;
  if (error) throw error;

  return data || [];
};
