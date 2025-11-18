import { useState, useEffect } from "react";
import { Plus, Search, Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConversationItem } from "./ConversationItem";
import { useConversations } from "@/hooks/messages/useConversations";
import { SidebarCollapseToggle } from "@/components/ui/SidebarCollapseToggle";
import { cn } from "@/lib/utils";
import type { ConversationWithDetails } from "@/types/messageTypes";

interface ConversationListProps {
  selectedConversationId: string | null;
  onSelectConversation: (conversation: ConversationWithDetails) => void;
  onNewConversation: () => void;
  organizationId?: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onRefetchReady?: (refetch: () => void) => void;
}

export const ConversationList = ({
  selectedConversationId,
  onSelectConversation,
  onNewConversation,
  organizationId,
  isCollapsed,
  onToggleCollapse,
  onRefetchReady,
}: ConversationListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: conversations, isLoading, refetch } = useConversations(organizationId);

  // Pass refetch function to parent on mount
  useEffect(() => {
    if (onRefetchReady && refetch) {
      onRefetchReady(refetch);
    }
  }, [onRefetchReady, refetch]);

  const filteredConversations = conversations?.filter((conv) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    const title = conv.is_group
      ? conv.group_name
      : conv.other_participant
      ? `${conv.other_participant.first_name} ${conv.other_participant.last_name} ${conv.other_participant.email}`
      : "";

    return title?.toLowerCase().includes(query);
  });

  // Helper function to get initials for a conversation
  const getConversationInitial = (conversation: ConversationWithDetails): string => {
    if (conversation.is_group) {
      return conversation.group_name?.charAt(0).toUpperCase() || "G";
    }
    if (conversation.other_participant) {
      const { first_name, last_name } = conversation.other_participant;
      if (first_name) return first_name.charAt(0).toUpperCase();
      if (last_name) return last_name.charAt(0).toUpperCase();
    }
    return "?";
  };

  return (
    <div className={cn(
      "flex flex-col h-full border-r bg-white transition-all duration-300 relative",
      isCollapsed ? "w-16" : "w-80"
    )}>
      {/* Collapse Toggle Button */}
      <SidebarCollapseToggle
        isCollapsed={isCollapsed}
        onToggle={onToggleCollapse}
      />

      {isCollapsed ? (
        /* Collapsed view - show + button and conversation icons */
        <>
          {/* New conversation button */}
          <div className="p-2 border-b flex justify-center">
            <Button
              size="icon"
              variant="ghost"
              onClick={onNewConversation}
              className="hover:bg-gray-100"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>

          {/* Conversation icons list */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {isLoading && (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}

            {!isLoading && (!filteredConversations || filteredConversations.length === 0) && (
              <div className="flex justify-center py-4">
                <MessageSquare className="h-6 w-6 text-gray-400" />
              </div>
            )}

            {filteredConversations?.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => onSelectConversation(conversation)}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium transition-all mx-auto",
                  conversation.id === selectedConversationId
                    ? "bg-gradient-to-r from-aurentia-pink to-aurentia-orange ring-2 ring-aurentia-pink ring-offset-2"
                    : "bg-gray-400 hover:bg-gray-500"
                )}
                title={conversation.is_group
                  ? conversation.group_name
                  : conversation.other_participant
                    ? `${conversation.other_participant.first_name} ${conversation.other_participant.last_name}`
                    : "Conversation"
                }
              >
                {getConversationInitial(conversation)}
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Header */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Messages</h2>
              <Button size="icon" variant="ghost" onClick={onNewConversation}>
                <Plus className="h-5 w-5" />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher des conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoading && (!filteredConversations || filteredConversations.length === 0) && (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <MessageSquare className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-muted-foreground mb-4 text-sm">
              {searchQuery ? "Aucune conversation trouvée" : "Aucune conversation pour le moment"}
            </p>
            {!searchQuery && (
              <Button onClick={onNewConversation} className={organizationId ? "btn-white-label hover:opacity-90" : "bg-gradient-to-r from-aurentia-pink to-aurentia-orange text-white hover:opacity-90"}>
                <Plus className="h-4 w-4 mr-2" />
                Démarrer une conversation
              </Button>
            )}
          </div>
        )}

        {filteredConversations?.map((conversation) => (
          <ConversationItem
            key={conversation.id}
            conversation={conversation}
            isActive={conversation.id === selectedConversationId}
            onClick={() => onSelectConversation(conversation)}
          />
        ))}
          </div>
        </>
      )}
    </div>
  );
};
