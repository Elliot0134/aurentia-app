import { useState, useCallback } from "react";
import { createGroup } from "@/services/messageService";
import { toast } from "@/components/ui/use-toast";
import type { CreateGroupRequest, Conversation } from "@/types/messageTypes";

export const useCreateGroup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutateAsync = useCallback(
    async (request: CreateGroupRequest): Promise<Conversation> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await createGroup(request);
        // Real-time subscriptions will handle updating the UI
        toast({
          title: "Group created",
          description: "Your group has been created successfully.",
        });
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to create group");
        setError(error);
        toast({
          title: "Failed to create group",
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
    (request: CreateGroupRequest) => {
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
