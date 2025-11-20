import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowLeft, Building, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConversationList } from "./ConversationList";
import { MessageThread } from "./MessageThread";
import { NewConversationDialog } from "./NewConversationDialog";
import { useStaffPermissions } from "@/hooks/useStaffPermissions";
import { useUserRole } from "@/hooks/useUserRole";
import { cn } from "@/lib/utils";
import { getConversationById } from "@/services/messageService";
import type { ConversationWithDetails } from "@/types/messageTypes";

type MessageContext = "personal" | "organization";

interface MessageLayoutProps {
  organizationId?: string;
}

export const MessageLayout = ({ organizationId }: MessageLayoutProps) => {
  const { canManageOrgMessages, isOwner, isLoading: permissionsLoading } = useStaffPermissions();
  const { organizationId: userOrgId } = useUserRole();

  // Check if user can access organization messages
  const canAccessOrgMessages = (canManageOrgMessages || isOwner) && userOrgId;

  // Get context from URL params (source of truth)
  const [searchParams, setSearchParams] = useSearchParams();
  const validContexts: MessageContext[] = ["personal", "organization"];
  const contextFromUrl = searchParams.get('context') as MessageContext | null;
  const messageContext: MessageContext =
    canAccessOrgMessages && contextFromUrl && validContexts.includes(contextFromUrl)
      ? contextFromUrl
      : "personal";

  // Conversation list collapse state (always expanded by default, no persistence)
  const [isConversationListCollapsed, setIsConversationListCollapsed] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithDetails | null>(null);
  const [showNewConversationDialog, setShowNewConversationDialog] = useState(false);
  const [showMobileThread, setShowMobileThread] = useState(false);
  const [conversationListRefetch, setConversationListRefetch] = useState<(() => void) | null>(null);
  const [addOptimisticConversation, setAddOptimisticConversation] = useState<((conversation: ConversationWithDetails) => void) | null>(null);

  // Wrapper functions to properly store callbacks in state
  // When you pass a function to setState, React treats it as a functional update
  // We must wrap it to store the actual function reference
  const handleRefetchReady = useCallback((refetch: () => void) => {
    setConversationListRefetch(() => refetch);
  }, []);

  const handleOptimisticAddReady = useCallback((addOptimistic: (conversation: ConversationWithDetails) => void) => {
    setAddOptimisticConversation(() => addOptimistic);
  }, []);

  // Update URL when permissions change and user is in org context without permission
  useEffect(() => {
    if (!canAccessOrgMessages && messageContext === "organization") {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('context');
      setSearchParams(newParams);
    }
  }, [canAccessOrgMessages, messageContext, searchParams, setSearchParams]);

  // Handle context switch
  const handleContextSwitch = (newContext: MessageContext) => {
    const newParams = new URLSearchParams(searchParams);
    if (newContext === "organization") {
      newParams.set('context', 'organization');
    } else {
      newParams.delete('context');
    }
    setSearchParams(newParams);
    // Clear selected conversation when switching contexts
    setSelectedConversation(null);
  };

  // Determine which organization ID to use
  const activeOrgId = messageContext === "organization" ? userOrgId : undefined;

  const handleSelectConversation = (conversation: ConversationWithDetails) => {
    setSelectedConversation(conversation);
    setShowMobileThread(true);
  };

  const handleBackToList = () => {
    setShowMobileThread(false);
  };

  const handleNewConversation = () => {
    setShowNewConversationDialog(true);
  };

  const handleConversationCreated = async (conversationId: string) => {
    setShowNewConversationDialog(false);

    try {
      // Fetch the newly created conversation details immediately
      const newConversation = await getConversationById(conversationId);

      if (newConversation) {
        // Optimistically add to conversation list (appears at top immediately)
        if (addOptimisticConversation) {
          addOptimisticConversation(newConversation);
        }

        // Select and open the new conversation
        setSelectedConversation(newConversation);
        setShowMobileThread(true);
      }

      // The conversation list will also refresh via real-time subscriptions as a fallback
    } catch (error) {
      console.error("Error loading new conversation:", error);
      // The conversation list will still refresh via real-time subscriptions
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Context Selector - shown only for users with org message access */}
      {canAccessOrgMessages && !permissionsLoading && (
        <div className="flex-shrink-0 border-b bg-white px-4 py-3">
          <div className="max-w-7xl mx-auto">
            <Tabs value={messageContext} onValueChange={handleContextSwitch} className="w-full">
              <TabsList className="bg-gray-50 h-11">
                <TabsTrigger value="personal" className="flex items-center gap-2 data-[state=active]:bg-white">
                  <User className="h-4 w-4" />
                  <span>Entrepreneur</span>
                </TabsTrigger>
                <TabsTrigger value="organization" className="flex items-center gap-2 data-[state=active]:bg-white">
                  <Building className="h-4 w-4" />
                  <span>Organisation</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Conversation List - hidden on mobile when thread is shown */}
        <div
          className={cn(
            "w-full flex-shrink-0 h-full transition-all duration-300",
            isConversationListCollapsed ? "lg:w-16" : "lg:w-80",
            showMobileThread && "hidden lg:block"
          )}
        >
          <ConversationList
            selectedConversationId={selectedConversation?.id || null}
            onSelectConversation={handleSelectConversation}
            onNewConversation={handleNewConversation}
            organizationId={activeOrgId}
            isCollapsed={isConversationListCollapsed}
            onToggleCollapse={() => setIsConversationListCollapsed(!isConversationListCollapsed)}
            onRefetchReady={handleRefetchReady}
            onOptimisticAddReady={handleOptimisticAddReady}
          />
        </div>

      {/* Message Thread - hidden on mobile when no conversation selected */}
      <div
        className={cn(
          "flex-1",
          !showMobileThread && "hidden lg:flex"
        )}
      >
        {selectedConversation ? (
          <div className="h-full flex flex-col">
            {/* Mobile back button */}
            <div className="lg:hidden border-b p-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToList}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
            </div>
            <div className="flex-1">
              <MessageThread
                conversation={selectedConversation}
                organizationId={activeOrgId}
              />
            </div>
          </div>
        ) : (
          <div className="hidden lg:flex flex-col items-center justify-center h-full bg-muted/20 px-4">
            <div className="flex flex-col items-center">
              <p className="text-muted-foreground mb-4 text-center">
                Sélectionnez une conversation pour commencer
              </p>
              <Button onClick={handleNewConversation} className={activeOrgId ? "btn-white-label hover:opacity-90" : "bg-gradient-to-r from-aurentia-pink to-aurentia-orange text-white hover:opacity-90"}>
                Nouvelle conversation
              </Button>
            </div>
          </div>
        )}
      </div>

        {/* New Conversation Dialog */}
        <NewConversationDialog
          open={showNewConversationDialog}
          onOpenChange={setShowNewConversationDialog}
          onConversationCreated={handleConversationCreated}
          organizationId={activeOrgId}
        />
      </div>
    </div>
  );
};
