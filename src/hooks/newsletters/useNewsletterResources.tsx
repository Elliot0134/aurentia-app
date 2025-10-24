import { useMutation, useQueryClient } from "@tanstack/react-query";
import { attachResource, detachResource } from "@/services/newsletterService";
import { toast } from "@/components/ui/use-toast";

export const useAttachResource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      newsletterId,
      resourceId,
      displayOrder,
    }: {
      newsletterId: string;
      resourceId: string;
      displayOrder?: number;
    }) => attachResource(newsletterId, resourceId, displayOrder),
    onSuccess: (_, { newsletterId }) => {
      queryClient.invalidateQueries({ queryKey: ["newsletter", newsletterId] });
      toast({
        title: "Resource attached",
        description: "The resource has been added to your newsletter.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to attach resource",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDetachResource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ newsletterId, resourceId }: { newsletterId: string; resourceId: string }) =>
      detachResource(newsletterId, resourceId),
    onSuccess: (_, { newsletterId }) => {
      queryClient.invalidateQueries({ queryKey: ["newsletter", newsletterId] });
      toast({
        title: "Resource removed",
        description: "The resource has been removed from your newsletter.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to remove resource",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
