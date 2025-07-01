import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { toast } from "sonner";
import { useProject } from '@/contexts/ProjectContext';
import { useChatConversation } from '@/hooks/useChatConversation';
import { 
  ChatHeader, 
  MessageList, 
  ChatInput, 
  SuggestedPrompts, 
  ChatDialogs 
} from '@/components/chat';

const ChatbotPage = () => {
  const { projectId } = useParams();
  const [inputMessage, setInputMessage] = useState('');
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [tempConversationName, setTempConversationName] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // State for communication style and search mode
  const [communicationStyle, setCommunicationStyle] = useState('normal');
  const [selectedDeliverables, setSelectedDeliverables] = useState<string[]>([]);
  const [selectedSearchModes, setSelectedSearchModes] = useState<string[]>([]);

  // Hook pour gérer le projet et les livrables
  const { deliverableNames, deliverablesLoading } = useProject();
  
  // Hook pour gérer la conversation
  const {
    currentConversation,
    conversationHistory,
    isHistoryLoading,
    isConversationLoading,
    isLoading,
    isSubmitting,
    streamingMessageId,
    streamingText,
    loadConversation,
    sendMessage,
    regenerateResponse,
    updateConversationTitle,
    deleteConversation,
    newChat,
  } = useChatConversation(projectId);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Créer les options pour le multiselect des livrables
  const deliverableOptions = deliverableNames.map(name => ({
    value: name,
    label: name,
    description: `Livrable disponible pour ce projet`
  }));

  // Options pour le multiselect des modes de recherche
  const searchModeOptions = [
    {
      value: 'deep_thinking',
      label: 'Réflexion approfondie',
      description: 'Mode de réflexion approfondie pour des analyses détaillées'
    },
    {
      value: 'project_rag',
      label: 'Rechercher dans le projet (RAG)',
      description: 'Recherche dans les données du projet existant'
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value);
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() !== '' && !isLoading && !isSubmitting) {
      const userText = inputMessage.trim();
      setInputMessage('');

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }

      const success = await sendMessage(
        userText,
        communicationStyle,
        selectedSearchModes,
        selectedDeliverables
      );

      if (!success) {
        // Restaurer le message en cas d'erreur
        setInputMessage(userText);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isSubmitting && !isLoading) {
      e.preventDefault();
      e.stopPropagation();
      handleSendMessage();
    }
  };

  const copyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Message copié dans le presse-papiers");
  };

  const handleRegenerateResponse = async (messageId: string) => {
    await regenerateResponse(
      messageId,
      communicationStyle,
      selectedSearchModes,
      selectedDeliverables
    );
  };

  const handleSaveRename = async () => {
    const success = await updateConversationTitle(tempConversationName);
    if (success) {
      setIsRenameDialogOpen(false);
    }
  };

  const handleCancelRename = () => {
    setIsRenameDialogOpen(false);
  };

  const handleConfirmDelete = async () => {
    const success = await deleteConversation();
    if (success) {
      setIsDeleteDialogOpen(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInputMessage(prompt);
    textareaRef.current?.focus();
  };

  const handleRenameConversation = () => {
    if (currentConversation) {
      setIsRenameDialogOpen(true);
      setTempConversationName(currentConversation.title);
    }
  };

  const handleDeleteConversation = () => {
    setIsDeleteDialogOpen(true);
  };

  const suggestedPrompts = [
    "Aide-moi à analyser ma concurrence",
    "Quelles sont les tendances de mon marché ?",
    "Comment améliorer ma proposition de valeur ?",
    "Analyse les risques de mon projet"
  ];

  const messages = currentConversation?.messages || [];

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F6F1] overflow-x-hidden">
      {/* Interface de chat directe - comme ChatGPT */}
      <div className="flex flex-col flex-1 w-full">
        {/* Header avec select de conversation */}
        <ChatHeader
          currentConversation={currentConversation}
          conversationHistory={conversationHistory}
          isConversationLoading={isConversationLoading}
          isHistoryLoading={isHistoryLoading}
          onLoadConversation={loadConversation}
          onNewChat={newChat}
          onRenameConversation={handleRenameConversation}
          onDeleteConversation={handleDeleteConversation}
        />

        {/* Messages et interface de chat */}
        {currentConversation && messages.length > 0 ? (
          // Messages existants
          <>
            {/* Messages */}
            <MessageList
              messages={messages}
              isLoading={isLoading}
              streamingMessageId={streamingMessageId}
              streamingText={streamingText}
              onCopyMessage={copyMessage}
              onRegenerateResponse={handleRegenerateResponse}
            />
            
            {/* Input area pour conversation existante */}
            <ChatInput
              inputMessage={inputMessage}
              placeholder="Continuez la conversation avec Aurentia..."
              isLoading={isLoading}
              isSubmitting={isSubmitting}
              communicationStyle={communicationStyle}
              selectedDeliverables={selectedDeliverables}
              selectedSearchModes={selectedSearchModes}
              deliverableOptions={deliverableOptions}
              searchModeOptions={searchModeOptions}
              deliverableNames={deliverableNames}
              onInputChange={handleInputChange}
              onKeyPress={handleKeyPress}
              onSendMessage={handleSendMessage}
              onCommunicationStyleChange={setCommunicationStyle}
              onSelectedDeliverablesChange={setSelectedDeliverables}
              onSelectedSearchModesChange={setSelectedSearchModes}
            />
          </>
        ) : (
          // Interface de démarrage de conversation
          <div className="flex flex-col items-center justify-center flex-1 px-3 sm:px-4 py-6 sm:py-8 min-h-0">
            <div className="max-w-5xl w-full text-center space-y-6 sm:space-y-8">
              {/* Suggested prompts */}
              <SuggestedPrompts
                prompts={suggestedPrompts}
                onPromptSelect={handleSuggestedPrompt}
              />
              
              {/* Input design */}
              <ChatInput
                inputMessage={inputMessage}
                placeholder="Posez votre question à Aurentia..."
                isLoading={isLoading}
                isSubmitting={isSubmitting}
                communicationStyle={communicationStyle}
                selectedDeliverables={selectedDeliverables}
                selectedSearchModes={selectedSearchModes}
                deliverableOptions={deliverableOptions}
                searchModeOptions={searchModeOptions}
                deliverableNames={deliverableNames}
                onInputChange={handleInputChange}
                onKeyPress={handleKeyPress}
                onSendMessage={handleSendMessage}
                onCommunicationStyleChange={setCommunicationStyle}
                onSelectedDeliverablesChange={setSelectedDeliverables}
                onSelectedSearchModesChange={setSelectedSearchModes}
              />
            </div>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <ChatDialogs
        isRenameDialogOpen={isRenameDialogOpen}
        setIsRenameDialogOpen={setIsRenameDialogOpen}
        tempConversationName={tempConversationName}
        setTempConversationName={setTempConversationName}
        onSaveRename={handleSaveRename}
        onCancelRename={handleCancelRename}
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        onConfirmDelete={handleConfirmDelete}
        onCancelDelete={handleCancelDelete}
      />
    </div>
  );
};

export default ChatbotPage;