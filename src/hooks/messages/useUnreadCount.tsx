import { useState, useEffect, useCallback, useRef } from "react";
import { getTotalUnreadCount } from "@/services/messageService";
import { useUser } from "@/contexts/UserContext";
import { supabase } from "@/integrations/supabase/client";
import type { UnreadCount } from "@/types/messageTypes";

export const useUnreadCount = () => {
  const { userProfile } = useUser();
  const [data, setData] = useState<UnreadCount>({ total: 0, by_conversation: {} });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const fetchInProgressRef = useRef(false);

  const fetchUnreadCount = useCallback(async () => {
    if (!userProfile?.id) {
      setIsLoading(false);
      setData({ total: 0, by_conversation: {} });
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
      const unreadCount = await getTotalUnreadCount(userProfile.id);
      setData(unreadCount);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch unread count"));
      console.error("Error fetching unread count:", err);
    } finally {
      setIsLoading(false);
      fetchInProgressRef.current = false;
    }
  }, [userProfile?.id]);

  // Initial fetch
  useEffect(() => {
    fetchUnreadCount();
  }, [userProfile?.id]);

  // Real-time subscription for message changes and participant updates
  useEffect(() => {
    if (!userProfile?.id) return;

    // Subscribe to new messages (affects unread count)
    const messageChannel = supabase
      .channel("unread_messages_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "conversation_messages",
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    // Subscribe to participant last_read_at updates
    const participantChannel = supabase
      .channel("unread_participant_changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "conversation_participants",
          filter: `user_id=eq.${userProfile.id}`,
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      messageChannel.unsubscribe();
      participantChannel.unsubscribe();
    };
  }, [userProfile?.id, fetchUnreadCount]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchUnreadCount,
  };
};
