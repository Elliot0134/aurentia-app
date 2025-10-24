import { MessageLayout } from "@/components/messages/MessageLayout";

/**
 * Unified Messages page that supports both personal and organization messaging
 * Context switching is handled within MessageLayout based on user permissions
 */
const Messages = () => {
  return (
    <div className="h-[calc(100vh-4rem)]">
      <MessageLayout />
    </div>
  );
};

export default Messages;
