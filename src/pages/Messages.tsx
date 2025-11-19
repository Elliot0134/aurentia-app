import { MessageLayout } from "@/components/messages/MessageLayout";

/**
 * Unified Messages page that supports both personal and organization messaging
 * Context switching is handled within MessageLayout based on user permissions
 */
const Messages = () => {
  return (
    <div className="h-full flex flex-col">
      <MessageLayout />
    </div>
  );
};

export default Messages;
