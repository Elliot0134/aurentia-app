import { useEffect } from "react";
import { cleanupOldMessages } from "@/services/messageService";

export const useMessageAutoCleanup = (conversationId: string, autoDeleteDays: number | null) => {
  useEffect(() => {
    if (!conversationId || !autoDeleteDays) return;

    // Trigger cleanup in background when conversation is opened
    const runCleanup = async () => {
      try {
        const deletedCount = await cleanupOldMessages(conversationId);

        if (deletedCount > 0) {
          // Real-time subscriptions will handle updating the UI
          console.log(`Auto-cleanup: deleted ${deletedCount} old messages`);
        }
      } catch (error) {
        console.error("Auto-cleanup error:", error);
      }
    };

    // Run cleanup after a short delay to not block initial render
    const timer = setTimeout(runCleanup, 1000);

    return () => clearTimeout(timer);
  }, [conversationId, autoDeleteDays]);
};
