import { useState, useCallback } from "react";
import { sendMessage, sendOrganizationMessage } from "@/services/messageService";
import { toast } from "@/components/ui/use-toast";
import type { SendMessageRequest, Message } from "@/types/messageTypes";

export const useSendMessage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutateAsync = useCallback(async (request: SendMessageRequest): Promise<Message> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await sendMessage(request);
      // Real-time subscriptions will handle updating the UI
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to send message");
      setError(error);
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const mutate = useCallback(
    (request: SendMessageRequest) => {
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

export const useSendOrganizationMessage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutateAsync = useCallback(
    async ({
      conversationId,
      organizationId,
      content,
    }: {
      conversationId: string;
      organizationId: string;
      content: string;
    }): Promise<Message> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await sendOrganizationMessage(conversationId, organizationId, content);
        // Real-time subscriptions will handle updating the UI
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to send message");
        setError(error);
        toast({
          title: "Failed to send message",
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
    (params: { conversationId: string; organizationId: string; content: string }) => {
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
