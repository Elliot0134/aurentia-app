import { useState, useEffect, useCallback, useRef } from "react";
import { getConversationParticipants } from "@/services/messageService";
import { supabase } from "@/integrations/supabase/client";
import type { ConversationParticipantWithProfile } from "@/types/messageTypes";

export const useGroupMembers = (conversationId: string) => {
  const [data, setData] = useState<ConversationParticipantWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const fetchInProgressRef = useRef(false);

  const fetchGroupMembers = useCallback(async () => {
    if (!conversationId) {
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
      const members = await getConversationParticipants(conversationId);
      setData(members);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch group members"));
      console.error("Error fetching group members:", err);
    } finally {
      setIsLoading(false);
      fetchInProgressRef.current = false;
    }
  }, [conversationId]);

  // Initial fetch
  useEffect(() => {
    fetchGroupMembers();
  }, [conversationId]);

  // Real-time subscription for participant changes
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`group_members_${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversation_participants",
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          fetchGroupMembers();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [conversationId, fetchGroupMembers]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchGroupMembers,
  };
};
