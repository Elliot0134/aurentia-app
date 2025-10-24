import { useState, useCallback } from "react";
import { removeParticipant } from "@/services/messageService";
import { toast } from "@/components/ui/use-toast";

export const useRemoveGroupMember = (conversationId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutateAsync = useCallback(
    async ({ userId }: { userId: string }): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        await removeParticipant(conversationId, userId);
        // Real-time subscriptions will handle updating the UI
        toast({
          title: "Member removed",
          description: "The user has been removed from the group.",
        });
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to remove member");
        setError(error);
        toast({
          title: "Failed to remove member",
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
    (params: { userId: string }) => {
      mutateAsync(params).catch(() => {
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
