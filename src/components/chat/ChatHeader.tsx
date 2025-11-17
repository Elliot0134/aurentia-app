import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Plus, Pencil, Trash2, History, Share2, Users } from "lucide-react";
import { type Conversation } from '@/services/chatbotService';
import { cn } from '@/lib/utils';

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
  onShareConversation?: () => void; // New prop for sharing conversation
  organizationLogoUrl?: string; // Organization logo URL for white label mode
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
  onShareConversation,
  organizationLogoUrl,
}) => {
  return (
    <div className="bg-[var(--bg-card-static)] border border-gray-200 rounded-2xl shadow-sm hover:shadow-md sticky top-0 z-10 mx-4 transition-shadow"
         style={{
           transitionDuration: 'var(--transition-base)',
           transitionTimingFunction: 'var(--ease-default)'
         }}> {/* Contour gris clair ajouté */}
      <div className="mx-auto px-3 sm:px-4 py-3 sm:py-4">
        {/* Layout en une seule ligne avec tout aligné */}
        <div className="flex items-center gap-3 w-full">
          {/* Logo */}
          <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0 overflow-hidden">
            {organizationLogoUrl ? (
              <img
                src={organizationLogoUrl}
                alt="Organisation logo"
                className="w-full h-full object-cover"
              />
            ) : (
              <Sparkles className="w-4 h-4 text-white" />
            )}
          </div>
          
          {/* Titre/Select de conversation - Hidden on mobile */}
          <div className="flex-1 min-w-0 hidden sm:block">
            {isHistoryLoading ? (
              // Chargement en cours
              <div className="flex items-center gap-2">
                <div className="spinner" style={{ width: '1rem', height: '1rem' }}></div>
                <span className="text-sm text-[var(--text-muted)]">Chargement des conversations...</span>
              </div>
            ) : conversationHistory.length === 0 ? (
              // Aucun historique -> Titre simple
              <h2 className="text-base sm:text-lg font-semibold text-[var(--text-primary)] truncate font-sans">Nouvelle conversation</h2>
            ) : (
              // Il y a de l'historique -> Select pour navigation
              <Select
                value={currentConversation?.id || ""}
                onValueChange={onLoadConversation}
              >
                <SelectTrigger className="w-full max-w-xs sm:max-w-sm h-9 border-0 focus:ring-0 focus:ring-offset-0 focus:outline-none bg-gray-50 hover:bg-gray-100 transition-colors">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <span className="truncate text-[var(--text-primary)]">
                        {currentConversation ? currentConversation.title : 'Sélectionner une conversation'}
                      </span>
                      {currentConversation?.is_shared && (
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600 border-blue-200 px-1.5 py-0">
                          <Users size={10} className="mr-1" />
                          Partagée
                        </Badge>
                      )}
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="min-w-[400px] bg-white">
                  {conversationHistory.map((conv) => (
                    <SelectItem key={conv.id} value={conv.id} className="hover:bg-gray-100 transition-colors"
                                style={{ transitionDuration: 'var(--transition-fast)' }}>
                      <div className="flex items-center w-full">
                        <span className="truncate flex-1 min-w-0 text-[var(--text-primary)]">{conv.title}</span>
                        <span className="text-xs text-[var(--text-muted)] flex-shrink-0 ml-auto pl-4">
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
                className="text-gray-500 hover:text-white p-2 sm:hidden"
              >
                <History size={16} />
              </Button>
            )}

            {/* Bouton Nouveau - toujours visible */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onNewChat}
              className="text-[var(--text-muted)] hover:text-white hover:bg-[var(--btn-primary-bg)] px-2 sm:px-3 transition-all"
              style={{ transitionDuration: 'var(--transition-fast)' }}
            >
              <Plus size={16} className="mr-0 sm:mr-1" />
              <span className="hidden sm:inline text-sm">Nouveau</span>
            </Button>

            {/* Boutons d'édition - uniquement si conversation active */}
            {currentConversation && (
              <>
                {onShareConversation && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onShareConversation}
                    className={cn(
                      "p-2 transition-all",
                      currentConversation.is_shared
                        ? "text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        : "text-[var(--text-muted)] hover:text-white hover:bg-[var(--btn-primary-bg)]"
                    )}
                    style={{ transitionDuration: 'var(--transition-fast)' }}
                    aria-label="Partager la conversation"
                  >
                    <Share2 size={14} />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRenameConversation}
                  className="text-[var(--text-muted)] hover:text-white hover:bg-[var(--btn-primary-bg)] p-2 transition-all"
                  style={{ transitionDuration: 'var(--transition-fast)' }}
                  aria-label="Renommer la conversation"
                >
                  <Pencil size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDeleteConversation}
                  className="text-[var(--text-muted)] hover:text-white hover:bg-[var(--btn-danger-bg)] p-2 transition-all"
                  style={{ transitionDuration: 'var(--transition-fast)' }}
                  aria-label="Supprimer la conversation"
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
