import { useState, useEffect, useCallback, useRef } from "react";
import { getMessages } from "@/services/messageService";
import { supabase } from "@/integrations/supabase/client";
import type { MessageFilter, MessageWithSender } from "@/types/messageTypes";

export const useMessages = (filter: MessageFilter) => {
  const [data, setData] = useState<MessageWithSender[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const fetchInProgressRef = useRef(false);

  const fetchMessages = useCallback(async () => {
    if (!filter.conversation_id) {
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
      const messages = await getMessages(filter);
      setData(messages);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch messages"));
      console.error("Error fetching messages:", err);
    } finally {
      setIsLoading(false);
      fetchInProgressRef.current = false;
    }
  }, [filter.conversation_id, filter.limit, filter.before_date, filter.after_date]);

  const invalidateMessages = useCallback(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Load more messages (pagination)
  const loadMore = useCallback(async () => {
    if (!data || data.length === 0 || !filter.conversation_id) return;

    const oldestMessage = data[data.length - 1];

    try {
      const olderMessages = await getMessages({
        ...filter,
        before_date: oldestMessage.created_at,
      });

      // Append older messages to the end
      setData(prev => [...prev, ...olderMessages]);
    } catch (err) {
      console.error("Error loading more messages:", err);
    }
  }, [data, filter]);

  // Initial fetch
  useEffect(() => {
    fetchMessages();
  }, [filter.conversation_id, filter.limit, filter.before_date, filter.after_date]);

  // Real-time subscription for new messages
  useEffect(() => {
    if (!filter.conversation_id) return;

    const channel = supabase
      .channel(`messages_${filter.conversation_id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversation_messages",
          filter: `conversation_id=eq.${filter.conversation_id}`,
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [filter.conversation_id, fetchMessages]);

  return {
    data,
    isLoading,
    error,
    invalidateMessages,
    loadMore,
    refetch: fetchMessages,
  };
};
