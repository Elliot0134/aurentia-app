import { useState, useCallback } from "react";
import { createConversation, findOrCreateDirectConversation } from "@/services/messageService";
import { toast } from "@/components/ui/use-toast";
import type { CreateConversationRequest, Conversation } from "@/types/messageTypes";

export const useCreateConversation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutateAsync = useCallback(
    async (request: CreateConversationRequest): Promise<Conversation> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await createConversation(request);
        // Real-time subscriptions will handle updating the UI
        toast({
          title: "Conversation created",
          description: "You can now start messaging.",
        });
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to create conversation");
        setError(error);
        toast({
          title: "Failed to create conversation",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const mutate = useCallback(
    (request: CreateConversationRequest) => {
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

export const useFindOrCreateDirectConversation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutateAsync = useCallback(async (otherUserId: string): Promise<Conversation> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await findOrCreateDirectConversation(otherUserId);
      // Real-time subscriptions will handle updating the UI
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to create conversation");
      setError(error);
      toast({
        title: "Failed to create conversation",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const mutate = useCallback(
    (otherUserId: string) => {
      mutateAsync(otherUserId).catch(() => {
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
