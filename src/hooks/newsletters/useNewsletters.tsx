import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getNewsletters,
  getNewsletterById,
  createNewsletter,
  updateNewsletter,
  deleteNewsletter,
  duplicateNewsletter,
} from "@/services/newsletterService";
import { toast } from "@/components/ui/use-toast";
import type {
  CreateNewsletterRequest,
  UpdateNewsletterRequest,
} from "@/types/newsletterTypes";

export const useNewsletters = (organizationId: string, status?: string) => {
  return useQuery({
    queryKey: ["newsletters", organizationId, status],
    queryFn: () => getNewsletters(organizationId, status),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useNewsletter = (newsletterId: string | undefined) => {
  return useQuery({
    queryKey: ["newsletter", newsletterId],
    queryFn: () => (newsletterId ? getNewsletterById(newsletterId) : null),
    enabled: !!newsletterId,
  });
};

export const useCreateNewsletter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateNewsletterRequest) => createNewsletter(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["newsletters", variables.organization_id] });
      toast({
        title: "Newsletter created",
        description: "Your newsletter has been saved as a draft.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create newsletter",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateNewsletter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateNewsletterRequest }) =>
      updateNewsletter(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["newsletter", data.id] });
      queryClient.invalidateQueries({ queryKey: ["newsletters", data.organization_id] });
      toast({
        title: "Newsletter updated",
        description: "Your changes have been saved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update newsletter",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteNewsletter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteNewsletter(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["newsletters"] });
      toast({
        title: "Newsletter deleted",
        description: "The newsletter has been permanently deleted.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete newsletter",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDuplicateNewsletter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => duplicateNewsletter(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["newsletters", data.organization_id] });
      toast({
        title: "Newsletter duplicated",
        description: "A copy of the newsletter has been created.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to duplicate newsletter",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
