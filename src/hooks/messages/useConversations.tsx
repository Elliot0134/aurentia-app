import { useState, useEffect, useCallback, useRef } from "react";
import { getConversations } from "@/services/messageService";
import { useUser } from "@/contexts/UserContext";
import { supabase } from "@/integrations/supabase/client";
import type { ConversationWithDetails } from "@/types/messageTypes";

export const useConversations = (organizationId?: string) => {
  const { userProfile } = useUser();
  const [data, setData] = useState<ConversationWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const fetchInProgressRef = useRef(false);

  const fetchConversations = useCallback(async () => {
    if (!userProfile?.id) {
      setIsLoading(false);
      return;
    }

    // Prevent concurrent fetches
    if (fetchInProgressRef.current) {
      return;
    }

    fetchInProgressRef.current = true;

    try {
      setIsLoading(true);
      setError(null);
      const conversations = await getConversations(userProfile.id, organizationId);
      setData(conversations);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch conversations"));
      console.error("Error fetching conversations:", err);
    } finally {
      setIsLoading(false);
      fetchInProgressRef.current = false;
    }
  }, [userProfile?.id, organizationId]);

  const invalidateConversations = useCallback(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Initial fetch
  useEffect(() => {
    fetchConversations();
  }, [userProfile?.id, organizationId]);

  // Real-time subscription
  useEffect(() => {
    if (!userProfile?.id) return;

    // Subscribe to conversation changes
    const conversationChannel = supabase
      .channel("conversations_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    // Subscribe to conversation participant changes (affects which conversations user sees)
    const participantChannel = supabase
      .channel("conversation_participants_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversation_participants",
          filter: `user_id=eq.${userProfile.id}`,
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    // Subscribe to message changes (affects last_message and last_message_at)
    const messageChannel = supabase
      .channel("conversation_messages_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversation_messages",
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      conversationChannel.unsubscribe();
      participantChannel.unsubscribe();
      messageChannel.unsubscribe();
    };
  }, [userProfile?.id, fetchConversations]);

  return {
    data,
    isLoading,
    error,
    invalidateConversations,
    refetch: fetchConversations,
  };
};
