import { useState, useCallback } from "react";
import { leaveConversation } from "@/services/messageService";
import { toast } from "@/components/ui/use-toast";

export const useLeaveGroup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutateAsync = useCallback(async (conversationId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await leaveConversation(conversationId);
      // Real-time subscriptions will handle updating the UI
      toast({
        title: "Left group",
        description: "You have left the group successfully.",
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to leave group");
      setError(error);
      toast({
        title: "Failed to leave group",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const mutate = useCallback(
    (conversationId: string) => {
      mutateAsync(conversationId).catch(() => {
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
