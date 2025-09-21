import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from "sonner";
import { useProject } from '@/contexts/ProjectContext';
import { useChatConversation } from '@/hooks/useChatConversation';
import { useProjects } from '@/hooks/useOrganisationData';
import { 
  ChatHeader, 
  MessageList, 
  ChatInput, 
  SuggestedPrompts, 
  ChatDialogs 
} from '@/components/chat';
import { Sparkles, Building2, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const OrganisationChatbot = () => {
  const { id: organisationId } = useParams();
  const [inputMessage, setInputMessage] = useState('');
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [tempConversationName, setTempConversationName] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isReformulating, setIsReformulating] = useState(false);
  const [isHistoryOpenMobile, setIsHistoryOpenMobile] = useState(false);
  const [isDropdownExiting, setIsDropdownExiting] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>('all');

  // State for communication style and search mode
  const [communicationStyle, setCommunicationStyle] = useState('normal');
  const [selectedDeliverables, setSelectedDeliverables] = useState<string[]>([]);
  const [selectedSearchModes, setSelectedSearchModes] = useState<string[]>([]);

  // Hook pour gérer le projet et les livrables (adapté pour l'organisation)
  const { deliverableNames, deliverablesLoading, userProjects, currentProjectId } = useProject();
  
  // Hook pour récupérer les projets de l'organisation
  const { projects, loading: projectsLoading } = useProjects();
  
  // Hook pour gérer la conversation (adapté au contexte organisationnel)
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
  } = useChatConversation(selectedProject === 'all' ? undefined : selectedProject);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Adapter les projets Supabase pour le sélecteur
  const organisationProjects = [
    { id: 'all', name: 'Tous les projets' },
    ...projects.map(project => ({
      id: project.project_id,
      name: project.nom_projet
    }))
  ];

  // Suggestions spécifiques au contexte organisationnel
  const organisationSuggestedPrompts = [
    "Quels sont les projets les plus prometteurs de l'organisation ?",
    "Analyse comparative des projets en cours",
    "Recommandations pour améliorer l'engagement des entrepreneurs",
    "Tendances des marchés ciblés par nos projets"
  ];

  const projectSpecificPrompts = [
    "Comment améliorer la proposition de valeur de ce projet ?",
    "Analyse des risques spécifiques à ce projet",
    "Stratégies de développement recommandées",
    "Opportunités de partenariats pour ce projet"
  ];

  const currentPrompts = selectedProject === 'all' ? organisationSuggestedPrompts : projectSpecificPrompts;

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

      // Ajouter le contexte organisationnel au message
      const contextualMessage = selectedProject === 'all' 
        ? `[Contexte: Organisation ${organisationId}, tous projets] ${userText}`
        : `[Contexte: Organisation ${organisationId}, projet ${selectedProject}] ${userText}`;

      const success = await sendMessage(
        contextualMessage,
        communicationStyle,
        selectedSearchModes,
        selectedDeliverables
      );

      if (!success) {
        setInputMessage(userText);
      }
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

  const messages = currentConversation?.messages || [];

  return (
    <div className="flex flex-col h-screen bg-[#F8F6F1] overflow-hidden overflow-x-hidden">
      {/* Interface de chat adaptée au contexte organisationnel */}
      <div className="flex flex-col flex-1 w-full md:w-[70vw] mx-auto h-full overflow-hidden relative pt-4">
        
        {/* Header avec informations contextuelles */}
        <div className="px-4 pb-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-6 h-6 text-aurentia-pink" />
              <div>
                <h1 className="text-lg font-semibold">Chat Organisation</h1>
                <p className="text-sm text-gray-600">Assistance IA pour votre organisation</p>
              </div>
            </div>
            
            {/* Sélecteur de projet */}
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sélectionner un projet" />
                </SelectTrigger>
                <SelectContent>
                  {organisationProjects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Header de conversation standard */}
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
              }, 300);
            } else {
              setIsHistoryOpenMobile(true);
              setIsDropdownExiting(false);
            }
          }}
        />

        {/* Mobile History Dropdown */}
        {(isHistoryOpenMobile || isDropdownExiting) && conversationHistory.length > 0 && (
          <div className={`sm:hidden bg-white border-b border-gray-200 py-2 px-4 mx-4 rounded-xl backdrop-blur-md mt-0.5 absolute top-[120px] left-0 right-0 z-20 ${isDropdownExiting ? 'animate-fade-out' : 'animate-fade-in'}`}>
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
                    setIsDropdownExiting(true);
                    setTimeout(() => {
                      setIsHistoryOpenMobile(false);
                      setIsDropdownExiting(false);
                    }, 300);
                  }} className="py-2 px-3 rounded-md hover:bg-gray-100 cursor-pointer">
                    <div className="flex items-center justify-between w-full">
                      <span className="">{conv.title}</span>
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
            
            <div className="fixed md:absolute bottom-[100px] md:bottom-[40px] inset-x-0 px-2 md:px-0 bg-[#F8F6F1]/80 backdrop-blur-md z-10">
              <div className="w-full mx-auto">
                <ChatInput
                  inputMessage={inputMessage}
                  placeholder="Posez une question sur votre organisation..."
                  isLoading={isLoading || isReformulating}
                  isSubmitting={isSubmitting}
                  communicationStyle={communicationStyle}
                  selectedDeliverables={selectedDeliverables}
                  selectedSearchModes={selectedSearchModes}
                  deliverableOptions={[]}
                  searchModeOptions={[]}
                  deliverableNames={[]}
                  onInputChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  onSendMessage={handleSendMessage}
                  onCommunicationStyleChange={setCommunicationStyle}
                  onSelectedDeliverablesChange={setSelectedDeliverables}
                  onSelectedSearchModesChange={setSelectedSearchModes}
                  onReformQuestion={async () => {}}
                  projectId={selectedProject}
                  projectStatus="organisation"
                />
              </div>
            </div>
          </div>
        ) : (
          // Interface de démarrage - adaptée au contexte organisationnel
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col items-center justify-center px-3 sm:px-4 py-1 sm:py-8 pb-[160px] md:pb-[200px]">
              {/* AI Icon and Welcome Message */}
              <div className="flex flex-col items-center mb-8">
                <div className="w-24 h-24 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0 mb-4">
                  <Sparkles className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-800 text-center">
                  Assistant IA pour votre organisation
                </h2>
                <p className="text-gray-600 text-center mt-2">
                  {selectedProject === 'all' 
                    ? 'Analysez tous vos projets et obtenez des insights globaux'
                    : `Focus sur le projet: ${organisationProjects.find(p => p.id === selectedProject)?.name}`
                  }
                </p>
              </div>

              {/* Contexte visuel */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 w-full max-w-2xl">
                <Card className="border-aurentia-pink/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-aurentia-pink" />
                      Portée d'analyse
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      {selectedProject === 'all' 
                        ? 'Vue d\'ensemble de tous les projets'
                        : 'Analyse ciblée du projet sélectionné'
                      }
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-aurentia-orange/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Users className="w-4 h-4 text-aurentia-orange" />
                      Données disponibles
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      Projets, entrepreneurs, métriques et performances
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="w-full text-center space-y-6 sm:space-y-8 px-4">
                <SuggestedPrompts
                  prompts={currentPrompts}
                  onPromptSelect={handleSuggestedPrompt}
                />
              </div>
            </div>
            
            <div className="fixed md:absolute bottom-[100px] md:bottom-[10px] inset-x-0 px-2 md:px-0 bg-[#F8F6F1]/80 backdrop-blur-md z-10">
              <div className="w-full mx-auto">
                <ChatInput
                  inputMessage={inputMessage}
                  placeholder="Posez une question sur votre organisation..."
                  isLoading={isLoading || isReformulating}
                  isSubmitting={isSubmitting}
                  communicationStyle={communicationStyle}
                  selectedDeliverables={selectedDeliverables}
                  selectedSearchModes={selectedSearchModes}
                  deliverableOptions={[]}
                  searchModeOptions={[]}
                  deliverableNames={[]}
                  onInputChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  onSendMessage={handleSendMessage}
                  onCommunicationStyleChange={setCommunicationStyle}
                  onSelectedDeliverablesChange={setSelectedDeliverables}
                  onSelectedSearchModesChange={setSelectedSearchModes}
                  onReformQuestion={async () => {}}
                  projectId={selectedProject}
                  projectStatus="organisation"
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
        onCancelRename={() => setIsRenameDialogOpen(false)}
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        onConfirmDelete={async () => {
          const success = await deleteConversation();
          if (success) {
            setIsDeleteDialogOpen(false);
          }
        }}
        onCancelDelete={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  );
};

export default OrganisationChatbot;