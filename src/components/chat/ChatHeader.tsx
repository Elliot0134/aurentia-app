import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Sparkles, Plus, Pencil, Trash2, History } from "lucide-react";
import { type Conversation } from '@/services/chatbotService';

interface ChatHeaderProps {
  currentConversation: Conversation | null;
  conversationHistory: Conversation[];
  isConversationLoading: boolean;
  isHistoryLoading: boolean;
  onLoadConversation: (conversationId: string) => void;
  onNewChat: () => void;
  onRenameConversation: () => void;
  onDeleteConversation: () => void;
  onToggleHistoryMobile: () => void; // New prop for toggling history on mobile
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  currentConversation,
  conversationHistory,
  isConversationLoading,
  isHistoryLoading,
  onLoadConversation,
  onNewChat,
  onRenameConversation,
  onDeleteConversation,
  onToggleHistoryMobile, // Destructure new prop
}) => {
  return (
    <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="mx-auto px-3 sm:px-4 py-3 sm:py-4">
        {/* Layout en une seule ligne avec tout aligné */}
        <div className="flex items-center gap-3 w-full">
          {/* Logo */}
          <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          
          {/* Titre/Select de conversation - Hidden on mobile */}
          <div className="flex-1 min-w-0 hidden sm:block">
            {isHistoryLoading ? (
              // Chargement en cours
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                <span className="text-sm text-gray-500">Chargement des conversations...</span>
              </div>
            ) : conversationHistory.length === 0 ? (
              // Aucun historique -> Titre simple
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">Nouvelle conversation</h2>
            ) : (
              // Il y a de l'historique -> Select pour navigation
              <Select 
                value={currentConversation?.id || ""} 
                onValueChange={onLoadConversation}
              >
                <SelectTrigger className="w-full max-w-xs sm:max-w-sm h-9">
                  <SelectValue>
                    <span className="truncate">
                      {currentConversation ? currentConversation.title : 'Sélectionner une conversation'}
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {conversationHistory.map((conv) => (
                    <SelectItem key={conv.id} value={conv.id}>
                      <div className="flex items-center justify-between w-full">
                        <span className="truncate max-w-[200px]">{conv.title}</span>
                        <span className="text-xs text-gray-500 ml-2 hidden sm:inline flex-shrink-0">
                          {new Date(conv.updatedAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          
          {/* Boutons d'action */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 ml-auto"> {/* Added ml-auto to push buttons to the right */}
            {/* History button - visible only on mobile */}
            {conversationHistory.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleHistoryMobile}
                className="text-gray-500 hover:text-gray-700 p-2 sm:hidden"
              >
                <History size={16} />
              </Button>
            )}

            {/* Bouton Nouveau - toujours visible */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onNewChat}
              className="text-gray-500 hover:text-gray-700 px-2 sm:px-3"
            >
              <Plus size={16} className="mr-0 sm:mr-1" />
              <span className="hidden sm:inline text-sm">Nouveau</span>
            </Button>
            
            {/* Boutons d'édition - uniquement si conversation active */}
            {currentConversation && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRenameConversation}
                  className="text-gray-500 hover:text-gray-700 p-2"
                >
                  <Pencil size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDeleteConversation}
                  className="text-gray-500 hover:text-red-600 p-2"
                >
                  <Trash2 size={14} />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
