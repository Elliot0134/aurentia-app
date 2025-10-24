import { useState } from "react";
import { format } from "date-fns";
import { MoreVertical, Edit2, Trash2, Check, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { useEditMessage } from "@/hooks/messages/useEditMessage";
import { useDeleteMessage } from "@/hooks/messages/useDeleteMessage";
import { useUser } from "@/contexts/UserContext";
import type { MessageWithSender } from "@/types/messageTypes";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  message: MessageWithSender;
  isGroupConversation: boolean;
  showSenderInfo?: boolean;
}

export const MessageBubble = ({
  message,
  isGroupConversation,
  showSenderInfo = true,
}: MessageBubbleProps) => {
  const { userProfile } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const editMutation = useEditMessage(message.conversation_id);
  const deleteMutation = useDeleteMessage(message.conversation_id);

  const isOwnMessage = message.sender_type === "user" && message.sender_id === userProfile?.id;
  const isSystemMessage = message.sender_type === "system";
  const isOrgMessage = message.sender_type === "organization";

  // Check if message can still be edited (within 15 minutes)
  const messageAge = new Date().getTime() - new Date(message.created_at).getTime();
  const canEdit = isOwnMessage && messageAge < 15 * 60 * 1000 && !message.edited_at;

  const handleEdit = async () => {
    if (editContent.trim() === message.content) {
      setIsEditing(false);
      return;
    }

    await editMutation.mutateAsync({
      message_id: message.id,
      content: editContent.trim(),
    });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this message?")) {
      await deleteMutation.mutateAsync(message.id);
    }
  };

  const handleCancelEdit = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  const getSenderName = () => {
    if (message.sender_type === "system") return "System";
    if (message.sender_type === "organization" && message.organization_sender) {
      return message.organization_sender.name;
    }
    if (message.sender) {
      const { first_name, last_name, email } = message.sender;
      return first_name && last_name ? `${first_name} ${last_name}` : email;
    }
    return "Unknown";
  };

  const getSenderInitials = () => {
    const name = getSenderName();
    if (message.sender_type === "system") return "SYS";
    if (message.sender_type === "organization") return "ORG";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const renderMessageContent = () => {
    if (isEditing) {
      return (
        <div className="space-y-2">
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="min-h-[80px]"
            maxLength={5000}
          />
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleEdit} disabled={editMutation.isPending}>
              <Check className="h-4 w-4 mr-1" />
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancelEdit}>
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          </div>
        </div>
      );
    }

    // Auto-linkify URLs
    const linkifiedContent = message.content.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">$1</a>'
    );

    return (
      <div
        className="whitespace-pre-wrap break-words"
        dangerouslySetInnerHTML={{ __html: linkifiedContent }}
      />
    );
  };

  // System messages have different styling
  if (isSystemMessage) {
    return (
      <div className="flex justify-center my-4">
        <div className="bg-muted px-4 py-2 rounded-full text-sm text-muted-foreground">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex gap-3 mb-4 group",
        isOwnMessage && "flex-row-reverse"
      )}
    >
      {/* Avatar - only show in group conversations or for non-own messages */}
      {(isGroupConversation || !isOwnMessage) && showSenderInfo && (
        <Avatar className="h-8 w-8">
          <AvatarImage
            src={
              message.sender_type === "organization"
                ? message.organization_sender?.logo_url || undefined
                : message.sender?.avatar_url || undefined
            }
          />
          <AvatarFallback>{getSenderInitials()}</AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          "flex flex-col max-w-[70%]",
          isOwnMessage && "items-end"
        )}
      >
        {/* Sender name and time */}
        {(isGroupConversation || !isOwnMessage) && showSenderInfo && (
          <div className={cn(
            "flex items-center gap-2 mb-1 text-xs text-muted-foreground",
            isOwnMessage && "flex-row-reverse"
          )}>
            <span className="font-medium">{getSenderName()}</span>
            <span>{format(new Date(message.created_at), "HH:mm")}</span>
          </div>
        )}

        {/* Message bubble */}
        <div
          className={cn(
            "rounded-lg px-4 py-2 relative",
            isOwnMessage
              ? "bg-primary text-primary-foreground"
              : isOrgMessage
              ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100"
              : "bg-muted"
          )}
        >
          {renderMessageContent()}

          {/* Edited indicator */}
          {message.edited_at && (
            <div className="text-xs opacity-70 mt-1">
              (edited)
            </div>
          )}

          {/* Actions menu - only for own messages */}
          {isOwnMessage && !isEditing && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute -right-8 top-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canEdit && (
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Timestamp for own messages (shown below bubble) */}
        {isOwnMessage && showSenderInfo && (
          <div className="text-xs text-muted-foreground mt-1">
            {format(new Date(message.created_at), "HH:mm")}
          </div>
        )}
      </div>
    </div>
  );
};
