import { useState, useCallback } from "react";
import { editMessage } from "@/services/messageService";
import { toast } from "@/components/ui/use-toast";
import type { UpdateMessageRequest, Message } from "@/types/messageTypes";

export const useEditMessage = (conversationId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutateAsync = useCallback(
    async (request: UpdateMessageRequest): Promise<Message> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await editMessage(request);
        // Real-time subscriptions will handle updating the UI
        toast({
          title: "Message updated",
          description: "Your message has been edited successfully.",
        });
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to edit message");
        setError(error);
        toast({
          title: "Failed to edit message",
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
    (request: UpdateMessageRequest) => {
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
