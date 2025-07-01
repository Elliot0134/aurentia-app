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
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading,
  streamingMessageId,
  streamingText,
  onCopyMessage,
  onRegenerateResponse,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-6 sm:space-y-8 w-full">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[95%] sm:max-w-full ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start space-x-2 sm:space-x-3`}>
              <div className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                message.sender === 'user'
                  ? 'bg-gray-700 ml-2 sm:ml-3'
                  : 'bg-gradient-primary mr-2 sm:mr-3'
              }`}>
                {message.sender === 'user' ? (
                  <span className="text-white text-xs sm:text-sm font-medium">U</span>
                ) : (
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                )}
              </div>
              <div className={`group relative ${
                message.sender === 'user'
                  ? 'bg-[#f0efe6] text-gray-900'
                  : ''
              } rounded-2xl px-3 py-2 sm:px-4 sm:py-3 markdown-content w-full overflow-hidden`}>
                <div className="prose prose-sm sm:prose max-w-none break-words overflow-wrap-anywhere">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                  >
                    {streamingMessageId === message.id ? streamingText : message.text}
                  </ReactMarkdown>
                </div>
                {streamingMessageId === message.id && (
                  <span className="inline-block w-2 h-4 sm:h-5 bg-blue-500 ml-1 animate-pulse"></span>
                )}

                {message.sender === 'bot' && (
                  <div className="absolute -bottom-7 sm:-bottom-8 left-0 opacity-0 group-hover:opacity-100 sm:group-hover:opacity-100 opacity-100 sm:opacity-0 transition-opacity duration-200">
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onCopyMessage(message.text)}
                        className="h-5 sm:h-6 px-1 sm:px-2 text-xs text-gray-500 hover:text-gray-700 hover:bg-[#F0EFE6]"
                      >
                        <Copy size={10} className="sm:mr-1" />
                        <span className="hidden sm:inline">Copier</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRegenerateResponse(message.id)}
                        className="h-5 sm:h-6 px-1 sm:px-2 text-xs text-gray-500 hover:text-gray-700 hover:bg-[#F0EFE6]"
                        disabled={isLoading}
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
          <div className="flex justify-start">
            <div className="flex items-start space-x-2 sm:space-x-3 max-w-[95%] sm:max-w-[80%]">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl px-3 py-2 sm:px-4 sm:py-3 shadow-sm">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-gray-500">Aurentia réfléchit...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}; 