import React, { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/atom-one-dark.css';
import { Button } from "@/components/ui/button";
import { Sparkles, Copy, RefreshCw } from "lucide-react";
import { type Message } from '@/services/chatbotService';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  streamingMessageId: string | null;
  streamingText: string;
  onCopyMessage: (text: string) => void;
  onRegenerateResponse: (messageId: string) => void;
  /**
   * Indicates that the assistant is currently streaming a message.
   * When true we add extra bottom padding so the last tokens are not hidden
   * behind the fixed ChatInput bar.
   */
  isStreaming?: boolean;
  /**
   * Organization logo URL for white label mode
   * When provided, replaces the Sparkles icon with the organization logo
   */
  organizationLogoUrl?: string;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading,
  streamingMessageId,
  streamingText,
  onCopyMessage,
  onRegenerateResponse,
  isStreaming = false,
  organizationLogoUrl,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const isUserScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Détecter si l'utilisateur est proche du bas (tolérance de 100px)
  const isNearBottom = () => {
    const container = scrollContainerRef.current?.parentElement;
    if (!container) return true;

    const threshold = 100;
    const position = container.scrollTop + container.clientHeight;
    const height = container.scrollHeight;

    return position >= height - threshold;
  };

  const scrollToBottom = () => {
    // Ne scroller que si l'utilisateur est déjà proche du bas
    if (isNearBottom() && !isUserScrollingRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  };

  // Détecter le scroll manuel de l'utilisateur
  useEffect(() => {
    const container = scrollContainerRef.current?.parentElement;
    if (!container) return;

    const handleScroll = () => {
      // Marquer que l'utilisateur scrolle manuellement
      isUserScrollingRef.current = true;

      // Clear timeout précédent
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Réinitialiser après 150ms d'inactivité
      scrollTimeoutRef.current = setTimeout(() => {
        isUserScrollingRef.current = false;
      }, 150);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText]);

  // Scroll automatique pendant le streaming
  useEffect(() => {
    if (streamingText && streamingMessageId) {
      const timeoutId = setTimeout(() => {
        scrollToBottom();
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [streamingText, streamingMessageId]);

  const bottomPaddingClass = isStreaming ? "pb-44" : "pb-20"; // pb-44 = 11rem (≈176px)

  // Bot avatar component
  const BotAvatar = ({ className = "" }: { className?: string }) => (
    <div className={`flex-shrink-0 rounded-full bg-gradient-primary flex items-center justify-center overflow-hidden ${className}`}>
      {organizationLogoUrl ? (
        <img
          src={organizationLogoUrl}
          alt="Organisation logo"
          className="w-full h-full object-cover"
        />
      ) : (
        <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
      )}
    </div>
  );

  return (
    <div ref={scrollContainerRef} className={`mx-auto px-3 sm:px-4 py-4 sm:py-6 ${bottomPaddingClass} space-y-6 sm:space-y-8 w-full relative z-0`}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`${message.sender === 'user' ? 'flex flex-row-reverse items-start space-x-2 sm:space-x-3' : 'flex-col sm:flex-row items-start space-y-2 sm:space-y-0 sm:space-x-3'}`}>
              {message.sender === 'user' ? (
                <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center bg-[var(--text-primary)] ml-2 sm:ml-3 shadow-sm">
                  <span className="text-[var(--text-secondary)] text-xs sm:text-sm font-medium">U</span>
                </div>
              ) : (
                <BotAvatar className="w-7 h-7 sm:w-8 sm:h-8 mb-0.5 sm:mb-0 sm:mr-3" />
              )}
              <div className={`group relative ${
                message.sender === 'user'
                  ? 'bg-[var(--bg-card-clickable)] text-[var(--text-primary)]'
                  : 'bg-[var(--bg-card-static)]'
              } rounded-2xl px-3 py-2 sm:px-4 sm:py-3 markdown-content w-full overflow-hidden max-w-[90vw] sm:max-w-full`}
              style={{ animation: 'fadeIn var(--transition-base) var(--ease-out)' }}>
                <div className="prose prose-base sm:prose max-w-none break-words overflow-wrap-anywhere [&>*]:text-[15px] [&>*]:sm:text-[15px] [&>*]:font-sans"> {/* Police Inter uniquement */}
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                  >
                    {streamingMessageId === message.id ? streamingText : message.text}
                  </ReactMarkdown>
                </div>
                {streamingMessageId === message.id && (
                  <span className="inline-block w-2 h-4 sm:h-5 bg-[var(--btn-primary-bg)] ml-1 animate-pulse"></span>
                )}

                {message.sender === 'bot' && (
                  <div className="absolute -bottom-7 sm:-bottom-8 left-0 opacity-0 group-hover:opacity-100 sm:group-hover:opacity-100 opacity-100 sm:opacity-0 transition-opacity"
                       style={{ transitionDuration: 'var(--transition-base)' }}>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onCopyMessage(message.text)}
                        className="h-5 sm:h-6 px-1 sm:px-2 text-[13px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-clickable)] transition-all"
                        style={{ transitionDuration: 'var(--transition-fast)' }}
                        aria-label="Copier le message"
                      >
                        <Copy size={10} className="sm:mr-1" />
                        <span className="hidden sm:inline">Copier</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRegenerateResponse(message.id)}
                        className="h-5 sm:h-6 px-1 sm:px-2 text-[13px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-clickable)] transition-all"
                        style={{
                          transitionDuration: 'var(--transition-fast)',
                          opacity: isLoading ? 'var(--btn-disabled-opacity)' : '1'
                        }}
                        disabled={isLoading}
                        aria-label="Régénérer la réponse"
                      >
                        <RefreshCw size={10} className="sm:mr-1" />
                        <span className="hidden sm:inline">Régénérer</span>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && !streamingMessageId && (
          <div className="flex justify-start"
               style={{ animation: 'fadeIn var(--transition-base) var(--ease-out)' }}>
            <div className="flex-col sm:flex-row items-start space-y-2 sm:space-y-0 sm:space-x-3 max-w-[95%] sm:max-w-[80%]">
              <BotAvatar className="w-7 h-7 sm:w-8 sm:h-8 mb-0.5 sm:mb-0 sm:mr-3" />
              <div className="bg-[var(--bg-card-static)] rounded-2xl px-3 py-2 sm:px-4 sm:py-3 w-full overflow-hidden max-w-[90vw] sm:max-w-full">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-[var(--text-muted)] rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-[var(--text-muted)] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-[var(--text-muted)] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-base sm:text-sm text-[var(--text-muted)]">Aurentia réfléchit...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
    </div>
  );
};
