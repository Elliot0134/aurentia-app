import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  sendNewsletter,
  scheduleNewsletter,
  cancelScheduledNewsletter,
} from "@/services/newsletterService";
import { toast } from "@/components/ui/use-toast";

export const useSendNewsletter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newsletterId: string) => sendNewsletter(newsletterId),
    onSuccess: (_, newsletterId) => {
      queryClient.invalidateQueries({ queryKey: ["newsletter", newsletterId] });
      queryClient.invalidateQueries({ queryKey: ["newsletters"] });
      toast({
        title: "Newsletter sent!",
        description: "Your newsletter is being delivered to all recipients.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send newsletter",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useScheduleNewsletter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ newsletterId, scheduledAt }: { newsletterId: string; scheduledAt: string }) =>
      scheduleNewsletter(newsletterId, scheduledAt),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["newsletter", data.id] });
      queryClient.invalidateQueries({ queryKey: ["newsletters"] });
      toast({
        title: "Newsletter scheduled",
        description: `Your newsletter will be sent on ${new Date(data.scheduled_at!).toLocaleString()}.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to schedule newsletter",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useCancelScheduledNewsletter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newsletterId: string) => cancelScheduledNewsletter(newsletterId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["newsletter", data.id] });
      queryClient.invalidateQueries({ queryKey: ["newsletters"] });
      toast({
        title: "Schedule cancelled",
        description: "The newsletter has been moved back to drafts.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to cancel schedule",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
