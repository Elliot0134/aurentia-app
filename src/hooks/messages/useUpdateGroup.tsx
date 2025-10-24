import { useState, useCallback } from "react";
import { updateGroup } from "@/services/messageService";
import { toast } from "@/components/ui/use-toast";
import type { UpdateGroupRequest, Conversation } from "@/types/messageTypes";

export const useUpdateGroup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutateAsync = useCallback(
    async (request: UpdateGroupRequest): Promise<Conversation> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await updateGroup(request);
        // Real-time subscriptions will handle updating the UI
        toast({
          title: "Group updated",
          description: "Group settings have been updated successfully.",
        });
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to update group");
        setError(error);
        toast({
          title: "Failed to update group",
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
    (request: UpdateGroupRequest) => {
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
