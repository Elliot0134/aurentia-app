import { useState, useCallback } from "react";
import { deleteMessage } from "@/services/messageService";
import { toast } from "@/components/ui/use-toast";

export const useDeleteMessage = (conversationId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutateAsync = useCallback(
    async (messageId: string): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        await deleteMessage(messageId);
        // Real-time subscriptions will handle updating the UI
        toast({
          title: "Message deleted",
          description: "Your message has been deleted.",
        });
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to delete message");
        setError(error);
        toast({
          title: "Failed to delete message",
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
    (messageId: string) => {
      mutateAsync(messageId).catch(() => {
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
