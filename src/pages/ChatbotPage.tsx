import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Import useNavigate

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
import { Sparkles } from 'lucide-react';
import ProjectRequiredGuard from '@/components/ProjectRequiredGuard';
import { Button } from "@/components/ui/button"; // Import Button
import { useUserRole } from '@/hooks/useUserRole'; // Import useUserRole

const ChatbotPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate(); // Initialize useNavigate
  const { userRole } = useUserRole(); // Get user role
  const [inputMessage, setInputMessage] = useState('');
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [tempConversationName, setTempConversationName] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isReformulating, setIsReformulating] = useState(false); // New state for reformulation loading
  const [isHistoryOpenMobile, setIsHistoryOpenMobile] = useState(false); // New state for mobile history visibility
  const [isDropdownExiting, setIsDropdownExiting] = useState(false); // New state for exit animation

  // State for communication style and search mode
  const [communicationStyle, setCommunicationStyle] = useState('normal');
  const [selectedDeliverables, setSelectedDeliverables] = useState<string[]>([]);
  const [selectedSearchModes, setSelectedSearchModes] = useState<string[]>([]);

  // Hook pour gérer le projet et les livrables
  const { deliverableNames, deliverablesLoading, userProjects, currentProjectId, userProjectsLoading } = useProject(); // Use userProjectsLoading
  
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

  // Get project name
  const currentProject = userProjects.find(p => p.project_id === currentProjectId);
  const projectName = currentProject ? currentProject.nom_projet : "votre projet";
  const projectStatus = currentProject ? currentProject.statut_project : "unknown";

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

  const handleReformQuestion = async (message: string) => {
    if (message.trim() === '' || isReformulating) return;

    setIsReformulating(true);
    try {
      const response = await fetch('https://n8n.srv906204.hstgr.cloud/webhook/reform-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: currentProjectId,
          message: message,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const rawResponseData = await response.json(); // Parse the outer JSON
      console.log("Webhook raw response data:", rawResponseData); // Log the full raw response for debugging

      let reformulatedText = '';
      let errorMessage = "Réponse invalide ou vide.";

      try {
        // Check if rawResponseData is an array and has at least one element
        if (Array.isArray(rawResponseData) && rawResponseData.length > 0) {
          const firstObject = rawResponseData[0];
          // The actual content is in firstObject.output, which is a string containing JSON
          if (firstObject.output && typeof firstObject.output === 'string') {
            // Remove markdown code block syntax
            const jsonString = firstObject.output.replace(/^```json\n/, '').replace(/\n```$/, '').trim();
            console.log("Cleaned JSON string:", jsonString);

            const innerData = JSON.parse(jsonString); // Parse the inner JSON string

            if (innerData && innerData.output && typeof innerData.output.response === 'string') {
              reformulatedText = innerData.output.response;
              // Replace \n with actual newlines for display
              reformulatedText = reformulatedText.replace(/\\n/g, '\n').trim();
              if (reformulatedText === '') {
                errorMessage = "Le champ 'response' du webhook est vide après formatage.";
              }
            } else {
              errorMessage = "Le champ 'output.response' est manquant ou n'est pas une chaîne de caractères dans la réponse interne.";
            }
          } else {
            errorMessage = "Le champ 'output' du premier élément est manquant ou n'est pas une chaîne.";
          }
        } else {
          errorMessage = "La structure de la réponse du webhook est incorrecte (pas un tableau ou tableau vide).";
        }
      } catch (parseError) {
        console.error("Erreur lors du parsing de la chaîne JSON interne:", parseError);
        errorMessage = `Erreur de parsing JSON interne: ${parseError.message}`;
      }

      console.log("Reformulated text after processing:", reformulatedText); // Log processed text

      if (reformulatedText !== '') {
        setInputMessage(reformulatedText);
        toast.success("Question reformulée avec succès !");
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      } else {
        console.error("La reformulation de la question a échoué. Détails:", errorMessage, "Full response:", rawResponseData); // Corrected typo here
        toast.error(`La reformulation de la question a échoué. ${errorMessage}`);
      }
    } catch (error) {
      console.error("Erreur lors de la reformulation de la question:", error);
      toast.error("Erreur lors de la reformulation de la question. Veuillez vérifier la console pour plus de détails.");
    } finally {
      setIsReformulating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isSubmitting && !isLoading && !isReformulating) {
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
    "Comment améliorer ma proposition de valeur ?",
    "Analyse les risques de mon projet"
  ];

  const messages = currentConversation?.messages || [];

  // Afficher le popup "Que l'aventure commence !" si aucun projet n'est sélectionné
  if (userProjectsLoading) {
    return <div>Chargement...</div>; // Ou un composant de chargement
  }

  if (!currentProjectId) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] animate-popup-appear">
        <div className="container mx-auto px-4 py-8 text-center bg-white p-8 rounded-lg shadow-lg max-w-lg w-[90vw]">
          <h2 className="text-3xl font-bold mb-4 text-gray-800">Que l'aventure commence !</h2>
          <p className="text-gray-600 mb-6 text-lg">Créez un nouveau projet pour découvrir tout le potentiel de votre idée.</p>
          <Button 
            onClick={() => navigate("/individual/warning")} 
            className="mt-4 px-4 py-2 rounded-lg bg-gradient-primary hover:from-blue-600 hover:to-purple-700 text-white text-lg font-semibold shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            Créer un nouveau projet
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ProjectRequiredGuard>
      <div className="flex flex-col h-screen bg-[#F8F6F1] overflow-hidden overflow-x-hidden">
        {/* Interface de chat directe - comme ChatGPT */}
        <div className="flex flex-col flex-1 w-full md:w-[60vw] mx-auto h-full overflow-hidden relative pt-4"> {/* Changed to 60vw for screen width, added pt-4 */}
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
            onToggleHistoryMobile={() => {
              if (isHistoryOpenMobile) {
                setIsDropdownExiting(true);
                setTimeout(() => {
                  setIsHistoryOpenMobile(false);
                  setIsDropdownExiting(false);
                }, 300); // Match animation duration
              } else {
                setIsHistoryOpenMobile(true);
                setIsDropdownExiting(false);
              }
            }}
          />

          {/* Mobile History Dropdown */}
          {(isHistoryOpenMobile || isDropdownExiting) && conversationHistory.length > 0 && (
            <div className={`sm:hidden bg-white border-b border-gray-200 py-2 px-4 mx-4 rounded-xl backdrop-blur-md mt-0.5 absolute top-[60px] left-0 right-0 z-20 ${isDropdownExiting ? 'animate-fade-out' : 'animate-fade-in'}`}> {/* Added absolute, top-[60px], left-0, right-0, z-20 */}
              {isHistoryLoading ? (
                <div className="flex items-center gap-2 py-2">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                  <span className="text-sm text-gray-500">Chargement des conversations...</span>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {conversationHistory.map((conv) => (
                    <div key={conv.id} onClick={() => {
                      loadConversation(conv.id);
                      setIsDropdownExiting(true); // Start exit animation
                      setTimeout(() => {
                        setIsHistoryOpenMobile(false); // Close history after animation
                        setIsDropdownExiting(false);
                      }, 300); // Match animation duration
                    }} className="py-2 px-3 rounded-md hover:bg-gray-100 cursor-pointer">
                      <div className="flex items-center justify-between w-full">
                        <span className="">{conv.title}</span> {/* Removed truncate */}
                        <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                          {new Date(conv.updatedAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Messages et interface de chat */}
          {currentConversation && messages.length > 0 ? (
            // Messages existants
            <div className="w-full flex flex-col flex-1 overflow-hidden px-4">
              {/* Messages avec scroll */}
              <div className="flex-1 overflow-y-auto scrollbar-hide pb-[160px] md:pb-[200px]">
                <MessageList
                  messages={messages}
                  isLoading={isLoading}
                  streamingMessageId={streamingMessageId}
                  streamingText={streamingText}
                  onCopyMessage={copyMessage}
                  onRegenerateResponse={handleRegenerateResponse}
                  isStreaming={Boolean(streamingMessageId)}
                />
              </div>
              
              {/* Input area fixe pour conversation existante */}
              <div className="fixed md:absolute bottom-[100px] md:bottom-[40px] inset-x-0 px-2 md:px-0 bg-[#F8F6F1]/80 backdrop-blur-md z-10"> {/* Added md:px-0 */}
                <div className="w-full mx-auto">
                  <ChatInput
                    inputMessage={inputMessage}
                    placeholder="Répondre à Aurentia..."
                    isLoading={isLoading || isReformulating} // Disable input during reformulation
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
                    onReformQuestion={handleReformQuestion}
                    projectId={currentProjectId || ''} // Pass currentProjectId
                    projectStatus={projectStatus} // Pass projectStatus
                  />
                </div>
              </div>
            </div>
          ) : (
            // Interface de démarrage de conversation
            <div className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col items-center justify-center px-3 sm:px-4 py-1 sm:py-8 pb-[160px] md:pb-[200px]">
              {/* AI Icon and Welcome Message */}
              <div className="flex flex-col items-center mb-8">
                  <div className="w-24 h-24 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0 mb-4">
                    <Sparkles className="w-12 h-12 text-white" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-800 text-center">
                    Bonjour, une question pour {projectName} ?
                  </h2>
                </div>
                <div className="w-full text-center space-y-6 sm:space-y-8 px-4">
                  {/* Suggested prompts */}
                  <SuggestedPrompts
                    prompts={suggestedPrompts}
                    onPromptSelect={handleSuggestedPrompt}
                  />
                </div>
              </div>
              
              {/* Input area fixe */}
              <div className="fixed md:absolute bottom-[100px] md:bottom-[10px] inset-x-0 px-2 md:px-0 bg-[#F8F6F1]/80 backdrop-blur-md z-10"> {/* Added md:px-0 */}
                <div className="w-full mx-auto">
                  <ChatInput
                    inputMessage={inputMessage}
                    placeholder="Répondre à Aurentia..."
                    isLoading={isLoading || isReformulating} // Disable input during reformulation
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
                    onReformQuestion={handleReformQuestion}
                    projectId={currentProjectId || ''} // Pass currentProjectId
                    projectStatus={projectStatus} // Pass projectStatus
                  />
                </div>
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
    </ProjectRequiredGuard>
  );
};

export default ChatbotPage;
