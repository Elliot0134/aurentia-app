import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { MessageResourceCard } from "./MessageResourceCard";
import { Button } from "@/components/ui/button";
import { useMessages } from "@/hooks/messages/useMessages";
import { useSendMessage, useSendOrganizationMessage } from "@/hooks/messages/useSendMessage";
import { useMessageAutoCleanup } from "@/hooks/messages/useMessageAutoCleanup";
import { updateLastReadAt } from "@/services/messageService";
import { useUser } from "@/contexts/UserContext";
import type { ConversationWithDetails, MessageWithSender } from "@/types/messageTypes";

interface MessageThreadProps {
  conversation: ConversationWithDetails;
  organizationId?: string;
}

export const MessageThread = ({ conversation, organizationId }: MessageThreadProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { userProfile } = useUser();
  const { data: messages, isLoading, loadMore } = useMessages({
    conversation_id: conversation.id,
    limit: 50,
  });

  // Optimistic messages state
  const [optimisticMessages, setOptimisticMessages] = useState<MessageWithSender[]>([]);

  // Use organization message sending if organizationId is provided
  const sendUserMessageMutation = useSendMessage();
  const sendOrgMessageMutation = useSendOrganizationMessage();

  // Auto-cleanup old messages if auto_delete_days is set
  useMessageAutoCleanup(conversation.id, conversation.auto_delete_days);

  // Mark as read when viewing
  useEffect(() => {
    if (conversation.id) {
      updateLastReadAt(conversation.id).catch(console.error);
    }
  }, [conversation.id]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, optimisticMessages]);

  // Clean up optimistic messages when real messages arrive
  useEffect(() => {
    if (messages && messages.length > 0 && optimisticMessages.length > 0) {
      // Remove optimistic messages that now exist in real messages
      setOptimisticMessages(prev =>
        prev.filter(optMsg =>
          !messages.some(realMsg =>
            realMsg.content === optMsg.content &&
            realMsg.created_at > optMsg.created_at
          )
        )
      );
    }
  }, [messages, optimisticMessages.length]);

  const handleSendMessage = async (content: string) => {
    if (!userProfile) return;

    // Create optimistic message
    const optimisticMessage: MessageWithSender = {
      id: `optimistic-${Date.now()}`,
      conversation_id: conversation.id,
      sender_id: userProfile.id,
      sender_type: organizationId ? "organization" : "user",
      organization_sender_id: organizationId || null,
      content,
      message_type: "text",
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: null,
      edited_at: null,
      deleted_at: null,
      sender: {
        id: userProfile.id,
        email: userProfile.email,
        first_name: userProfile.first_name,
        last_name: userProfile.last_name,
        avatar_url: userProfile.avatar_url,
        role: userProfile.user_role,
      }
    };

    // Add optimistic message immediately
    setOptimisticMessages(prev => [...prev, optimisticMessage]);

    try {
      if (organizationId) {
        // Send as organization
        await sendOrgMessageMutation.mutateAsync({
          conversationId: conversation.id,
          organizationId,
          content,
        });
      } else {
        // Send as user
        await sendUserMessageMutation.mutateAsync({
          conversation_id: conversation.id,
          content,
          message_type: "text",
        });
      }

      // Remove optimistic message after successful send
      // The real message will come through real-time subscription
      setTimeout(() => {
        setOptimisticMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
      }, 1000);
    } catch (error) {
      // Remove optimistic message on error
      setOptimisticMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
      throw error;
    }
  };

  const getConversationTitle = () => {
    if (conversation.is_group) {
      return conversation.group_name || "Discussion de groupe";
    }
    if (conversation.type === "organization") {
      return "Support organisation";
    }
    if (conversation.type === "system") {
      return "Messages système";
    }
    // 1-on-1
    if (conversation.other_participant) {
      const { first_name, last_name, email } = conversation.other_participant;
      return first_name && last_name ? `${first_name} ${last_name}` : email;
    }
    return "Conversation";
  };

  const getSubtitle = () => {
    if (conversation.is_group && conversation.participant_count) {
      return `${conversation.participant_count} membres`;
    }
    if (conversation.other_participant?.role) {
      // Map role names to French display names
      const roleMap: Record<string, string> = {
        'individual': 'Entrepreneur',
        'member': 'Entrepreneur',
        'organisation': 'Organisation',
        'organization': 'Organisation',
        'staff': 'Staff',
        'super_admin': 'Super Admin'
      };
      return roleMap[conversation.other_participant.role] || conversation.other_participant.role;
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="border-b bg-white p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold truncate">{getConversationTitle()}</h2>
            {getSubtitle() && (
              <p className="text-sm text-muted-foreground truncate">{getSubtitle()}</p>
            )}
          </div>
          {/* TODO: Add group settings button here for admins */}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-1">
        {/* Load more button */}
        {messages && messages.length >= 50 && (
          <div className="flex justify-center mb-4">
            <Button variant="outline" size="sm" onClick={loadMore}>
              Charger les messages précédents
            </Button>
          </div>
        )}

        {/* Empty state */}
        {(!messages || messages.length === 0) && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-muted-foreground">
              Aucun message pour le moment. Commencez la conversation !
            </p>
          </div>
        )}

        {/* Message list (reversed to show newest at bottom) */}
        {messages &&
          [...messages.slice().reverse(), ...optimisticMessages].map((message, index, array) => {
            // Check if we should show sender info (first message or different sender from previous)
            const prevMessage = array[index - 1];
            const showSenderInfo =
              index === 0 ||
              !prevMessage ||
              prevMessage.sender_id !== message.sender_id ||
              prevMessage.sender_type !== message.sender_type;

            // Render resource share as special card
            if (message.message_type === "resource_share") {
              return (
                <MessageResourceCard
                  key={message.id}
                  message={message}
                  isGroupConversation={conversation.is_group}
                  showSenderInfo={showSenderInfo}
                />
              );
            }

            return (
              <MessageBubble
                key={message.id}
                message={message}
                isGroupConversation={conversation.is_group}
                showSenderInfo={showSenderInfo}
              />
            );
          })}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {conversation.type !== "system" && (
        <div className="flex-shrink-0">
          <MessageInput
            onSend={handleSendMessage}
            disabled={sendUserMessageMutation.isLoading || sendOrgMessageMutation.isLoading}
            organizationId={organizationId}
          />
        </div>
      )}
    </div>
  );
};
