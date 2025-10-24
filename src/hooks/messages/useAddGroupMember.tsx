import { useState, useCallback } from "react";
import { addParticipant } from "@/services/messageService";
import { toast } from "@/components/ui/use-toast";
import type { AddGroupMemberRequest, ConversationParticipant } from "@/types/messageTypes";

export const useAddGroupMember = (conversationId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutateAsync = useCallback(
    async (request: AddGroupMemberRequest): Promise<ConversationParticipant> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await addParticipant(request);
        // Real-time subscriptions will handle updating the UI
        toast({
          title: "Member added",
          description: "The user has been added to the group.",
        });
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to add member");
        setError(error);
        toast({
          title: "Failed to add member",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [conversationId]
  );

  const mutate = useCallback(
    (request: AddGroupMemberRequest) => {
      mutateAsync(request).catch(() => {
        // Error already handled in mutateAsync
      });
    },
    [mutateAsync]
  );

  return {
    mutate,
    mutateAsync,
    isLoading,
    error,
  };
};
