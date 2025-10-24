import { FileText, Lock, Edit } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useUser } from "@/contexts/UserContext";
import type { MessageWithSender } from "@/types/messageTypes";
import { cn } from "@/lib/utils";

interface MessageResourceCardProps {
  message: MessageWithSender;
  isGroupConversation: boolean;
  showSenderInfo?: boolean;
}

export const MessageResourceCard = ({
  message,
  isGroupConversation,
  showSenderInfo = true,
}: MessageResourceCardProps) => {
  const { userProfile } = useUser();
  const navigate = useNavigate();

  const isOwnMessage = message.sender_type === "user" && message.sender_id === userProfile?.id;

  const getSenderName = () => {
    if (message.sender) {
      const { first_name, last_name, email } = message.sender;
      return first_name && last_name ? `${first_name} ${last_name}` : email;
    }
    return "Unknown";
  };

  const getSenderInitials = () => {
    const name = getSenderName();
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const resourceData = message.metadata;
  const permissionType = resourceData?.permission_type || "read_only";

  const handleOpenResource = () => {
    if (resourceData?.resource_id) {
      // Navigate to resource detail page
      navigate(`/organisation/${userProfile?.organization_id}/ressources/${resourceData.resource_id}`);
    }
  };

  return (
    <div
      className={cn(
        "flex gap-3 mb-4",
        isOwnMessage && "flex-row-reverse"
      )}
    >
      {/* Avatar */}
      {(isGroupConversation || !isOwnMessage) && showSenderInfo && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={message.sender?.avatar_url || undefined} />
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

        {/* Resource card */}
        <Card className="w-full max-w-md">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-semibold text-sm line-clamp-1">
                    {resourceData?.resource_title || "Shared Resource"}
                  </h4>
                  <Badge
                    variant={permissionType === "read_write" ? "default" : "secondary"}
                    className="flex-shrink-0"
                  >
                    {permissionType === "read_write" ? (
                      <>
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </>
                    ) : (
                      <>
                        <Lock className="h-3 w-3 mr-1" />
                        View
                      </>
                    )}
                  </Badge>
                </div>

                {resourceData?.resource_description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                    {resourceData.resource_description}
                  </p>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={handleOpenResource}
                >
                  Open Resource
                </Button>

                <p className="text-xs text-muted-foreground mt-2">
                  Shared by {getSenderName()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timestamp for own messages */}
        {isOwnMessage && showSenderInfo && (
          <div className="text-xs text-muted-foreground mt-1">
            {format(new Date(message.created_at), "HH:mm")}
          </div>
        )}
      </div>
    </div>
  );
};
