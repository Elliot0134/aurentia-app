import { supabase } from "@/integrations/supabase/client";
import { sendMessage } from "./messageService";
import type {
  ResourceShare,
  ShareResourceRequest,
  PermissionType,
} from "@/types/messageTypes";

// =============================================
// RESOURCE SHARE QUERIES
// =============================================

export const shareResource = async (
  request: ShareResourceRequest
): Promise<{ message_id: string; share_id: string }> => {
  const currentUser = (await supabase.auth.getUser()).data.user;
  if (!currentUser) throw new Error("Not authenticated");

  // Get conversation details to check if it's a group
  const { data: conversation } = await supabase
    .from("conversations")
    .select("is_group")
    .eq("id", request.conversation_id)
    .single();

  if (!conversation) throw new Error("Conversation not found");

  // Send message with resource share
  const message = await sendMessage({
    conversation_id: request.conversation_id,
    content: request.message_content || `Shared resource: ${request.resource_title}`,
    message_type: "resource_share",
    metadata: {
      resource_id: request.resource_id,
      resource_title: request.resource_title,
      resource_description: request.resource_description,
      permission_type: request.permission_type,
    },
  });

  // Create resource share record
  let shareData: Partial<ResourceShare> = {
    message_id: message.id,
    resource_id: request.resource_id,
    shared_by_user_id: currentUser.id,
    permission_type: request.permission_type,
  };

  if (conversation.is_group) {
    // Group share - use conversation_id
    shareData.conversation_id = request.conversation_id;
  } else {
    // Individual share - need to get the other participant
    const { data: participants } = await supabase
      .from("conversation_participants")
      .select("user_id")
      .eq("conversation_id", request.conversation_id)
      .is("left_at", null);

    const otherParticipant = participants?.find((p) => p.user_id !== currentUser.id);
    if (!otherParticipant) throw new Error("No recipient found");

    shareData.shared_with_user_id = otherParticipant.user_id;
  }

  const { data: share, error } = await supabase
    .from("resource_shares")
    .insert(shareData)
    .select()
    .single();

  if (error) throw error;

  return { message_id: message.id, share_id: share.id };
};

export const getResourceShares = async (
  resourceId: string
): Promise<ResourceShare[]> => {
  const { data, error } = await supabase
    .from("resource_shares")
    .select("*")
    .eq("resource_id", resourceId);

  if (error) throw error;
  return data || [];
};

export const getUserResourceShares = async (
  userId: string
): Promise<ResourceShare[]> => {
  const { data: directShares } = await supabase
    .from("resource_shares")
    .select("*")
    .eq("shared_with_user_id", userId);

  // Also get group shares
  const { data: participations } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("user_id", userId)
    .is("left_at", null);

  if (!participations) return directShares || [];

  const conversationIds = participations.map((p) => p.conversation_id);

  const { data: groupShares } = await supabase
    .from("resource_shares")
    .select("*")
    .in("conversation_id", conversationIds);

  return [...(directShares || []), ...(groupShares || [])];
};

export const updateResourceSharePermission = async (
  shareId: string,
  permissionType: PermissionType
): Promise<ResourceShare> => {
  const { data, error } = await supabase
    .from("resource_shares")
    .update({ permission_type: permissionType })
    .eq("id", shareId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const revokeResourceShare = async (shareId: string): Promise<void> => {
  const { error } = await supabase
    .from("resource_shares")
    .delete()
    .eq("id", shareId);

  if (error) throw error;
};

export const checkResourceAccess = async (
  resourceId: string,
  userId: string
): Promise<{ hasAccess: boolean; permission?: PermissionType }> => {
  // Check direct share
  const { data: directShare } = await supabase
    .from("resource_shares")
    .select("permission_type")
    .eq("resource_id", resourceId)
    .eq("shared_with_user_id", userId)
    .single();

  if (directShare) {
    return { hasAccess: true, permission: directShare.permission_type };
  }

  // Check group shares
  const { data: participations } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("user_id", userId)
    .is("left_at", null);

  if (!participations) return { hasAccess: false };

  const conversationIds = participations.map((p) => p.conversation_id);

  const { data: groupShare } = await supabase
    .from("resource_shares")
    .select("permission_type")
    .eq("resource_id", resourceId)
    .in("conversation_id", conversationIds)
    .single();

  if (groupShare) {
    return { hasAccess: true, permission: groupShare.permission_type };
  }

  return { hasAccess: false };
};
