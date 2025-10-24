import { useState, useEffect, useMemo } from "react";
import { MessageSquare, Users, X, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useFindOrCreateDirectConversation, useCreateConversation } from "@/hooks/messages/useCreateConversation";
import { useCreateGroup } from "@/hooks/messages/useCreateGroup";
import { searchUsers } from "@/services/messageService";
import { useUser } from "@/contexts/UserContext";

// Helper function to convert hex to RGB
const hexToRgb = (hex: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '255, 89, 44';
};

interface NewConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConversationCreated?: (conversationId: string) => void;
  organizationId?: string;
}

type ConversationType = "direct" | "group";

export const NewConversationDialog = ({
  open,
  onOpenChange,
  onConversationCreated,
  organizationId,
}: NewConversationDialogProps) => {
  const { userProfile } = useUser();
  const [conversationType, setConversationType] = useState<ConversationType>("direct");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  }>>([]);

  const directMutation = useFindOrCreateDirectConversation();
  const createConversationMutation = useCreateConversation();
  const groupMutation = useCreateGroup();

  // White-label support - apply organization colors to dialog
  const whiteLabelEnabled = userProfile?.organization?.settings?.branding?.whiteLabel ?? false;
  const orgPrimaryColor = userProfile?.organization?.settings?.branding?.primaryColor
    || userProfile?.organization?.primary_color
    || '#ff5932';
  const orgSecondaryColor = userProfile?.organization?.settings?.branding?.secondaryColor
    || userProfile?.organization?.secondary_color
    || '#1a1a1a';

  const dialogStyles = useMemo(() => {
    if (whiteLabelEnabled && userProfile?.organization) {
      return {
        '--org-primary-color': orgPrimaryColor,
        '--org-secondary-color': orgSecondaryColor,
        '--org-primary-rgb': hexToRgb(orgPrimaryColor),
        '--org-secondary-rgb': hexToRgb(orgSecondaryColor),
        '--color-primary': orgPrimaryColor,
      } as React.CSSProperties;
    }
    return {};
  }, [whiteLabelEnabled, userProfile?.organization, orgPrimaryColor, orgSecondaryColor]);

  // Search for users
  useEffect(() => {
    if (searchQuery.length === 0) {
      setSearchResults([]);
      return;
    }

    const fetchUsers = async () => {
      try {
        const results = await searchUsers(searchQuery, [userProfile?.id || "", ...selectedUserIds]);
        setSearchResults(results);
      } catch (error) {
        console.error("Error searching users:", error);
        setSearchResults([]);
      }
    };

    // Debounce search
    const timer = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, userProfile?.id, selectedUserIds]);

  const handleSelectUser = (userId: string) => {
    if (conversationType === "direct") {
      setSelectedUserIds([userId]);
    } else {
      if (selectedUserIds.includes(userId)) {
        setSelectedUserIds(selectedUserIds.filter((id) => id !== userId));
      } else {
        setSelectedUserIds([...selectedUserIds, userId]);
      }
    }
    setSearchQuery("");
  };

  const handleCreate = async () => {
    if (conversationType === "direct" && selectedUserIds.length === 1) {
      let conversation;
      if (organizationId) {
        // Create organization-scoped direct conversation
        conversation = await createConversationMutation.mutateAsync({
          type: "organization",
          is_group: false,
          organization_id: organizationId,
          participant_user_ids: selectedUserIds,
        });
      } else {
        // Create personal direct conversation (reuse existing if found)
        conversation = await directMutation.mutateAsync(selectedUserIds[0]);
      }
      onConversationCreated?.(conversation.id);
      handleClose();
    } else if (conversationType === "group" && selectedUserIds.length >= 1 && groupName.trim()) {
      const conversation = await groupMutation.mutateAsync({
        group_name: groupName.trim(),
        group_description: groupDescription.trim() || undefined,
        participant_user_ids: selectedUserIds,
        organization_id: organizationId,
      });
      onConversationCreated?.(conversation.id);
      handleClose();
    }
  };

  const handleClose = () => {
    setConversationType("direct");
    setSearchQuery("");
    setSelectedUserIds([]);
    setGroupName("");
    setGroupDescription("");
    onOpenChange(false);
  };

  const canCreate =
    conversationType === "direct"
      ? selectedUserIds.length === 1
      : selectedUserIds.length >= 1 && groupName.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" style={dialogStyles}>
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
          <DialogDescription>
            Start a direct message or create a group
          </DialogDescription>
        </DialogHeader>

        {/* Conversation type selector */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={conversationType === "direct" ? undefined : "outline"}
            className={conversationType === "direct" ? "flex-1 btn-white-label !bg-[var(--color-primary)] hover:!bg-[var(--color-primary)] hover:!opacity-90" : "flex-1"}
            onClick={() => {
              setConversationType("direct");
              setSelectedUserIds([]);
            }}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Direct Message
          </Button>
          <Button
            variant={conversationType === "group" ? undefined : "outline"}
            className={conversationType === "group" ? "flex-1 btn-white-label !bg-[var(--color-primary)] hover:!bg-[var(--color-primary)] hover:!opacity-90" : "flex-1"}
            onClick={() => setConversationType("group")}
          >
            <Users className="h-4 w-4 mr-2" />
            Create Group
          </Button>
        </div>

        {/* Group details (only for group) */}
        {conversationType === "group" && (
          <div className="space-y-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="groupName">Group Name *</Label>
              <Input
                id="groupName"
                placeholder="Enter group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="groupDescription">Description (optional)</Label>
              <Textarea
                id="groupDescription"
                placeholder="What's this group about?"
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                maxLength={500}
                rows={2}
              />
            </div>
          </div>
        )}

        {/* Selected users */}
        {selectedUserIds.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedUserIds.map((userId) => {
              const user = searchResults?.find((u) => u.id === userId);
              if (!user) return null;
              return (
                <Badge key={userId} variant="secondary" className="pl-2 pr-1">
                  {user.first_name && user.last_name
                    ? `${user.first_name} ${user.last_name}`
                    : user.email}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 ml-1"
                    onClick={() => handleSelectUser(userId)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              );
            })}
          </div>
        )}

        {/* User search */}
        <div className="space-y-2">
          <Label>
            {conversationType === "direct" ? "Select a user" : "Add members"} *
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Search results */}
          {searchResults && searchResults.length > 0 && (
            <div className="border rounded-md max-h-48 overflow-y-auto">
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleSelectUser(user.id)}
                  className="flex items-center gap-3 p-2 hover:bg-accent cursor-pointer"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar_url || undefined} />
                    <AvatarFallback>
                      {user.first_name?.[0]}{user.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {user.first_name && user.last_name
                        ? `${user.first_name} ${user.last_name}`
                        : user.email}
                    </p>
                    {user.first_name && user.last_name && (
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={
              !canCreate ||
              directMutation.isLoading ||
              createConversationMutation.isLoading ||
              groupMutation.isLoading
            }
            className="btn-white-label hover:opacity-90"
          >
            {conversationType === "direct" ? "Start Chat" : "Create Group"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
