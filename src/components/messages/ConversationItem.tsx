import { format } from "date-fns";
import { Users, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ConversationWithDetails } from "@/types/messageTypes";

interface ConversationItemProps {
  conversation: ConversationWithDetails;
  isActive: boolean;
  onClick: () => void;
}

export const ConversationItem = ({
  conversation,
  isActive,
  onClick,
}: ConversationItemProps) => {
  const getConversationTitle = () => {
    if (conversation.is_group) {
      return conversation.group_name || "Discussion de groupe";
    }
    if (conversation.type === "organization") {
      return "Support organisation";
    }
    if (conversation.type === "system") {
      return "Messages système";
    }
    // 1-on-1
    if (conversation.other_participant) {
      const { first_name, last_name, email } = conversation.other_participant;
      return first_name && last_name ? `${first_name} ${last_name}` : email;
    }
    return "Conversation";
  };

  const getAvatarUrl = () => {
    if (conversation.type === "system") return undefined;
    if (conversation.type === "organization") return undefined; // Could use org logo
    if (!conversation.is_group && conversation.other_participant) {
      return conversation.other_participant.avatar_url || undefined;
    }
    return undefined;
  };

  const getInitials = () => {
    const title = getConversationTitle();
    if (conversation.type === "system") return "SYS";
    if (conversation.type === "organization") return "ORG";
    return title.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getLastMessagePreview = () => {
    if (!conversation.last_message) return "Aucun message pour le moment";

    const { content, sender, sender_type } = conversation.last_message;

    let prefix = "";
    if (conversation.is_group && sender_type === "user" && sender) {
      const senderName = sender.first_name || sender.email.split("@")[0];
      prefix = `${senderName}: `;
    }

    const preview = content.length > 50 ? `${content.slice(0, 50)}...` : content;
    return `${prefix}${preview}`;
  };

  const formatTimestamp = () => {
    if (!conversation.last_message_at) return "";

    const date = new Date(conversation.last_message_at);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return format(date, "HH:mm");
    } else if (diffInHours < 24 * 7) {
      return format(date, "EEE");
    } else {
      return format(date, "dd/MM");
    }
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-start gap-3 p-3 cursor-pointer rounded-lg transition-colors",
        isActive ? "bg-accent" : "hover:bg-accent/50"
      )}
    >
      {/* Avatar */}
      <div className="relative">
        <Avatar className="h-12 w-12">
          <AvatarImage src={getAvatarUrl()} />
          <AvatarFallback>
            {conversation.is_group ? (
              <Users className="h-5 w-5" />
            ) : (
              getInitials()
            )}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex items-center gap-2 min-w-0">
            <h3 className={cn(
              "font-semibold truncate text-sm",
              (conversation.unread_count || 0) > 0 && "font-bold"
            )}>
              {getConversationTitle()}
            </h3>
            {conversation.is_group && (
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {conversation.participant_count}
              </span>
            )}
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatTimestamp()}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className={cn(
            "text-sm text-muted-foreground truncate",
            (conversation.unread_count || 0) > 0 && "font-medium text-foreground"
          )}>
            {getLastMessagePreview()}
          </p>
          {(conversation.unread_count || 0) > 0 && (
            <Badge className="ml-auto shrink-0 h-5 min-w-[20px] rounded-full flex items-center justify-center px-1.5">
              {conversation.unread_count}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};
