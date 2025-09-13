import React, { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from "sonner";
import { useProject } from '@/contexts/ProjectContext';
import { useChatConversation } from '@/hooks/useChatConversation';
import { SimpleChatInput } from '@/components/actionplan/SimpleChatInput';
import { Message } from '@/services/chatbotService'; // Importez l'interface Message

interface ActionPlanChatProps {
  entityId: string;
  entityType: 'phase' | 'jalon' | 'tache';
}

export const ActionPlanChat: React.FC<ActionPlanChatProps> = ({ entityId, entityType }) => {
  const { projectId } = useParams();
  const [inputMessage, setInputMessage] = useState('');
  const [communicationStyle, setCommunicationStyle] = useState('normal');
  const [selectedDeliverables, setSelectedDeliverables] = useState<string[]>([]);
  const [selectedSearchModes, setSelectedSearchModes] = useState<string[]>([]);

  const {
    currentConversation,
    isLoading,
    isSubmitting,
    streamingMessageId,
    streamingText,
    sendMessage,
  } = useChatConversation(projectId, entityId, entityType);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value);
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() !== '' && !isLoading && !isSubmitting) {
      const userText = inputMessage.trim();
      setInputMessage('');
      await sendMessage(userText, communicationStyle, selectedSearchModes, selectedDeliverables);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isSubmitting && !isLoading) {
      e.preventDefault();
      e.stopPropagation();
      handleSendMessage();
    }
  };

  const messages = currentConversation?.messages || [];

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((message: Message, index: number) => (
          <div
            key={message.id || index}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              {message.text}
              {streamingMessageId === message.id && streamingText && (
                <span className="ml-1 animate-pulse">...</span>
              )}
            </div>
          </div>
        ))}
        {isLoading && !streamingMessageId && (
          <div className="flex justify-start">
            <div className="max-w-[70%] p-3 rounded-lg bg-gray-200 text-gray-800">
              Typing...
            </div>
          </div>
        )}
      </div>

      <div className="pt-4">
        <SimpleChatInput
          inputMessage={inputMessage}
          onInputChange={handleInputChange}
          onSendMessage={handleSendMessage}
          onKeyPress={handleKeyPress}
          isLoading={isLoading}
          isSubmitting={isSubmitting}
          placeholder={`Discuter de cette ${entityType}...`}
        />
      </div>
    </div>
  );
};
