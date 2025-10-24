import { useQuery } from "@tanstack/react-query";
import {
  getNewsletterStats,
  getNewsletterAnalytics,
  getNewsletterRecipients,
} from "@/services/newsletterService";

export const useNewsletterStats = (newsletterId: string | undefined) => {
  return useQuery({
    queryKey: ["newsletter-stats", newsletterId],
    queryFn: () => (newsletterId ? getNewsletterStats(newsletterId) : null),
    enabled: !!newsletterId,
    refetchInterval: 30000, // Refetch every 30 seconds for live updates
  });
};

export const useNewsletterAnalytics = (newsletterId: string | undefined) => {
  return useQuery({
    queryKey: ["newsletter-analytics", newsletterId],
    queryFn: () => (newsletterId ? getNewsletterAnalytics(newsletterId) : null),
    enabled: !!newsletterId,
    refetchInterval: 30000, // Refetch every 30 seconds for live updates
  });
};

export const useNewsletterRecipients = (newsletterId: string | undefined) => {
  return useQuery({
    queryKey: ["newsletter-recipients", newsletterId],
    queryFn: () => (newsletterId ? getNewsletterRecipients(newsletterId) : []),
    enabled: !!newsletterId,
  });
};
