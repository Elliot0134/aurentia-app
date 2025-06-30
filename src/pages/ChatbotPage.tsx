import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/atom-one-dark.css';
import { useParams } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowUp, Pencil, Trash2, Copy, RefreshCw, Sparkles, Plus } from "lucide-react";
import { MultiSelect } from "@/components/ui/multi-select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { chatbotService, type Message, type Conversation } from '@/services/chatbotService';
import { useProject } from '@/contexts/ProjectContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";

const ChatbotPage = () => {
  const { projectId } = useParams();
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [tempConversationName, setTempConversationName] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [streamingText, setStreamingText] = useState('');
  const lastSentMessage = useRef<string>('');
  const lastSentTime = useRef<number>(0);
  const lastErrorTime = useRef<number>(0);
  const errorCooldown = 2000;

  // State for communication style and search mode
  const [communicationStyle, setCommunicationStyle] = useState('normal');
  const [selectedDeliverables, setSelectedDeliverables] = useState<string[]>([]);
  const [selectedSearchModes, setSelectedSearchModes] = useState<string[]>([]);

  // Hook pour gérer le projet et les livrables
  const { deliverableNames, deliverablesLoading } = useProject();
  
  // État pour la conversation DB
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isConversationLoading, setIsConversationLoading] = useState(false);
  
  // État pour l'historique des conversations
  const [conversationHistory, setConversationHistory] = useState<Conversation[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initializedProjectId = useRef<string | undefined>(undefined);

  // Load conversation history and initialize
  useEffect(() => {
    const loadConversationHistory = async () => {
      if (initializedProjectId.current !== projectId || !projectId) return;
      
      setIsHistoryLoading(true);
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          console.error('❌ Utilisateur non connecté');
          toast.error('Vous devez être connecté pour utiliser le chatbot');
          return;
        }

        const userId = session.user.id;
        
        // Charger l'historique des conversations pour ce projet
        const conversations = await chatbotService.getUserConversationsFromDB(userId, projectId);
        setConversationHistory(conversations);
        
        // L'utilisateur peut maintenant naviguer dans ses conversations via le select
        console.log(`ℹ️ ${conversations.length} conversation(s) trouvée(s) pour ce projet`);
        
        initializedProjectId.current = projectId;
      } catch (error) {
        console.error('❌ Erreur chargement historique:', error);
        toast.error('Erreur lors du chargement de l\'historique');
      } finally {
        setIsHistoryLoading(false);
      }
    };

    if (projectId && initializedProjectId.current !== projectId) {
      loadConversationHistory();
    }
  }, [projectId]);

  // Écouter les changements de titre de conversation
  useEffect(() => {
    const handleTitleChange = async (event: CustomEvent) => {
      const { conversationId, newTitle } = event.detail;
      console.log('🎯 Titre de conversation changé:', { conversationId, newTitle });
      
      // Rafraîchir l'historique pour mettre à jour le select
      if (!projectId) return;
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;
        
        const conversations = await chatbotService.getUserConversationsFromDB(session.user.id, projectId);
        setConversationHistory(conversations);
      } catch (error) {
        console.error('❌ Erreur rafraîchissement historique après changement titre:', error);
      }
      
      // Mettre à jour la conversation courante si c'est celle qui a changé
      if (currentConversation && currentConversation.id === conversationId) {
        setCurrentConversation(prev => prev ? {...prev, title: newTitle} : null);
      }
    };

    window.addEventListener('conversationTitleChanged', handleTitleChange as EventListener);
    
    return () => {
      window.removeEventListener('conversationTitleChanged', handleTitleChange as EventListener);
    };
  }, [currentConversation, projectId]);

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentConversation?.messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 80) + 'px';
    }
  }, [inputMessage]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value);
  };

  // Charger une conversation spécifique
  const loadConversation = async (conversationId: string) => {
    try {
      setIsConversationLoading(true);
      const conversation = await chatbotService.loadConversationFromDB(conversationId);
      if (conversation) {
        setCurrentConversation(conversation);
        setConversationId(conversation.id);
        console.log('✅ Conversation chargée:', conversation.id);
      } else {
        toast.error('Impossible de charger cette conversation');
      }
    } catch (error) {
      console.error('❌ Erreur chargement conversation:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setIsConversationLoading(false);
    }
  };

  // Mettre à jour l'historique après une action
  const refreshHistory = async () => {
    if (!projectId) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      
      const conversations = await chatbotService.getUserConversationsFromDB(session.user.id, projectId);
      setConversationHistory(conversations);
    } catch (error) {
      console.error('❌ Erreur rafraîchissement historique:', error);
    }
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() !== '' && !isLoading && !isSubmitting) {
      const userText = inputMessage.trim();
      const currentTime = Date.now();
      
      // Check error cooldown
      if (lastErrorTime.current && (currentTime - lastErrorTime.current) < errorCooldown) {
        console.log('⏱️ Error cooldown active, waiting...');
        toast.error('Veuillez patienter avant de renvoyer un message');
        return;
      }
      
      // Prevent duplicate messages
      if (lastSentTime.current && (currentTime - lastSentTime.current) < 1000) {
        console.log('🛑 Duplicate submission prevented - too fast:', userText);
        return;
      }
      
      if (lastSentMessage.current === userText && (currentTime - lastSentTime.current) < 5000) {
        console.log('🛑 Duplicate message prevented - same content:', userText);
        return;
      }
      
      setIsLoading(true);
      setIsSubmitting(true);
      lastSentMessage.current = userText;
      lastSentTime.current = currentTime;

      // Créer une nouvelle conversation si nécessaire
      let conversationToUse = currentConversation;
      if (!conversationToUse) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.user || !projectId) {
            toast.error('Impossible de créer une nouvelle conversation');
            setIsLoading(false);
            setIsSubmitting(false);
            return;
          }

          const newConversation = await chatbotService.createNewConversation(session.user.id, projectId);
          if (!newConversation) {
            toast.error('Échec de création de la conversation');
            setIsLoading(false);
            setIsSubmitting(false);
            return;
          }

          conversationToUse = newConversation;
          setCurrentConversation(newConversation);
          setConversationId(newConversation.id);
          
          await refreshHistory();
        } catch (error) {
          console.error('❌ Erreur création conversation:', error);
          toast.error('Erreur lors de la création de la conversation');
          setIsLoading(false);
          setIsSubmitting(false);
          return;
        }
      }
      
      setInputMessage('');
      
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }

      // Add user message avec DB persistence
      const userMessage = await chatbotService.addMessageWithDB(conversationToUse.id, 'user', userText);
      if (userMessage) {
        // Récupérer la conversation mise à jour depuis le service au lieu d'ajouter manuellement
        const updatedConversation = chatbotService.getConversation(conversationToUse.id);
        if (updatedConversation) {
          setCurrentConversation(updatedConversation);
        }
      } else {
        console.error('❌ Échec ajout message utilisateur');
        toast.error('Impossible de sauvegarder votre message');
        return;
      }

      try {
        // Vérifier si c'est le premier message en récupérant la conversation à jour depuis le service
        const currentConvState = chatbotService.getConversation(conversationToUse.id);
        const isFirstMessage = currentConvState ? currentConvState.messages.filter(m => m.sender === 'user').length === 1 : true; // Premier message de la conversation
        
        const webhookUrl = "https://n8n.eec-technologies.fr/webhook/chatbot-global";
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            message: userText, 
            projectId: projectId,
            communicationStyle: communicationStyle,
            deepThinking: selectedSearchModes.includes('deep_thinking'),
            projectSearchMode: selectedSearchModes.includes('project_rag'),
            selectedDeliverables: selectedDeliverables,
            isFirstMessage: isFirstMessage,
            convId: conversationToUse.id
          }),
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        const botResponse = data[0].output.response;

        // Add bot message with streaming
        const botMessage = await chatbotService.addMessageWithDB(conversationToUse.id, 'bot', '');
        if (botMessage) {
          // Récupérer la conversation mise à jour depuis le service
          let updatedConversation = chatbotService.getConversation(conversationToUse.id);
          if (updatedConversation) {
            setCurrentConversation(updatedConversation);
          }
          
          await streamText(botResponse, botMessage.id);
          
          const updatedMessage = await chatbotService.updateMessageWithDB(conversationToUse.id, botMessage.id, botResponse);
          if (updatedMessage) {
            // Récupérer la conversation finale mise à jour
            updatedConversation = chatbotService.getConversation(conversationToUse.id);
            if (updatedConversation) {
              setCurrentConversation(updatedConversation);
            }
          }
        }
      } catch (error: any) {
        console.error('❌ Error generating response:', error);
        lastErrorTime.current = Date.now();
        
        let errorMsg = "Désolé, j'ai rencontré une erreur. Pouvez-vous reformuler votre question ?";
        
        if (error?.status === 401) {
          errorMsg = "Erreur d'authentification. Veuillez vous reconnecter.";
        } else if (error?.status === 406) {
          errorMsg = "Erreur de format de requête. Veuillez réessayer.";
        } else if (error?.status >= 500) {
          errorMsg = "Erreur serveur. Veuillez réessayer dans quelques instants.";
        }
        
        const errorMessage = chatbotService.addMessage(conversationToUse.id, 'bot', errorMsg);
        if (errorMessage) {
          // Récupérer la conversation mise à jour depuis le service
          const updatedConversation = chatbotService.getConversation(conversationToUse.id);
          if (updatedConversation) {
            setCurrentConversation(updatedConversation);
          }
        }
        
        toast.error(errorMsg);
      } finally {
        setIsLoading(false);
        setIsSubmitting(false);
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

  const regenerateResponse = async (messageId: string) => {
    if (!currentConversation || isLoading) return;
    
    const currentTime = Date.now();
    if (lastErrorTime.current && (currentTime - lastErrorTime.current) < errorCooldown) {
      toast.error('Veuillez patienter avant de régénérer');
      return;
    }

    const messageIndex = currentConversation.messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;

    const previousUserMessage = currentConversation.messages
      .slice(0, messageIndex)
      .reverse()
      .find(m => m.sender === 'user');
    if (!previousUserMessage) return;
    
    setIsLoading(true);
    try {
      const webhookUrl = "https://n8n.eec-technologies.fr/webhook/chatbot-global";
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: previousUserMessage.text, 
          projectId: projectId,
          communicationStyle: communicationStyle,
          deepThinking: selectedSearchModes.includes('deep_thinking'),
          projectSearchMode: selectedSearchModes.includes('project_rag'),
          selectedDeliverables: selectedDeliverables,
          isFirstMessage: false,
          convId: currentConversation.id
        }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      const newResponse = data[0].output.response;

      // Vider temporairement le message pour l'effet de streaming
      const messageToUpdate = currentConversation.messages[messageIndex];
      const success = await chatbotService.updateMessageWithDB(currentConversation.id, messageToUpdate.id, '');
      if (success) {
        // Récupérer la conversation mise à jour
        let updatedConversation = chatbotService.getConversation(currentConversation.id);
        if (updatedConversation) {
          setCurrentConversation(updatedConversation);
        }
      }
      
      await streamText(newResponse, messageToUpdate.id);
      
      const finalUpdatedMessage = await chatbotService.updateMessageWithDB(currentConversation.id, messageToUpdate.id, newResponse);
      if (finalUpdatedMessage) {
        // Récupérer la conversation finale mise à jour
        const finalConversation = chatbotService.getConversation(currentConversation.id);
        if (finalConversation) {
          setCurrentConversation(finalConversation);
        }
      }
    } catch (error: any) {
      console.error('❌ Error regenerating response:', error);
      lastErrorTime.current = Date.now();
      toast.error("Erreur lors de la régénération");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRename = async () => {
    if (currentConversation && tempConversationName.trim()) {
      const success = await chatbotService.updateConversationTitleInDB(currentConversation.id, tempConversationName.trim());
      if (success) {
        setCurrentConversation(prev => prev ? {...prev, title: tempConversationName.trim()} : null);
        await refreshHistory();
        toast.success("Conversation renommée");
      } else {
        toast.error("Erreur lors du renommage");
      }
    }
    setIsRenameDialogOpen(false);
  };

  const handleCancelRename = () => {
    setIsRenameDialogOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (currentConversation) {
      const success = await chatbotService.deleteConversationFromDB(currentConversation.id);
      if (success) {
        setCurrentConversation(null);
        setConversationId(null);
        
        await refreshHistory();
        
        const updatedHistory = await (() => {
          return new Promise<Conversation[]>(resolve => {
            setTimeout(async () => {
              if (!projectId) return resolve([]);
              try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session?.user) return resolve([]);
                const conversations = await chatbotService.getUserConversationsFromDB(session.user.id, projectId);
                resolve(conversations);
              } catch {
                resolve([]);
              }
            }, 100);
          });
        })();
        
        if (updatedHistory.length > 0) {
          await loadConversation(updatedHistory[0].id);
        }
        
        toast.success("Conversation supprimée");
      } else {
        toast.error("Erreur lors de la suppression");
      }
    }
    setIsDeleteDialogOpen(false);
  };

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInputMessage(prompt);
    textareaRef.current?.focus();
  };

  const handleNewChat = () => {
    // Réinitialiser l'état pour une nouvelle conversation
    // La conversation sera créée automatiquement lors de l'envoi du premier message
    setCurrentConversation(null);
    setConversationId(null);
    setInputMessage('');
    setStreamingMessageId(null);
    setStreamingText('');
    
    toast.success("Prêt pour une nouvelle conversation");
  };

  const streamText = async (text: string, messageId: string) => {
    setStreamingMessageId(messageId);
    setStreamingText('');
    
    const words = text.split(' ');
    let currentText = '';
    
    for (let i = 0; i < words.length; i++) {
      currentText += (i === 0 ? '' : ' ') + words[i];
      setStreamingText(currentText);
      
      setTimeout(() => scrollToBottom(), 50);
      
      const delay = words[i].length > 8 ? 80 : 50;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    setTimeout(() => {
      setStreamingMessageId(null);
      setStreamingText('');
    }, 100);
  };

  const suggestedPrompts = [
    "Aide-moi à analyser ma concurrence",
    "Quelles sont les tendances de mon marché ?",
    "Comment améliorer ma proposition de valeur ?",
    "Analyse les risques de mon projet"
  ];

  const isInputEmpty = inputMessage.trim() === '';
  const messages = currentConversation?.messages || [];

  if (isHistoryLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Sparkles className="w-8 h-8 text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Chargement de l'historique...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#F8F6F1]">
      {/* Interface de chat directe - comme ChatGPT */}
      <div className="flex flex-col h-full">
        {/* Header avec select de conversation */}
        <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1">
              <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              
              {/* Affichage conditionnel du titre */}
              {conversationHistory.length === 0 ? (
                // Aucun historique -> Titre simple
                <h2 className="text-lg font-semibold text-gray-900">Nouvelle conversation</h2>
              ) : (
                // Il y a de l'historique -> Toujours afficher le select pour permettre la navigation
                <Select 
                  value={currentConversation?.id || ""} 
                  onValueChange={loadConversation}
                >
                  <SelectTrigger className="w-64">
                    <SelectValue>
                      <span className="truncate">
                        {isConversationLoading ? 'Chargement...' : 
                         currentConversation ? currentConversation.title : 'Nouvelle conversation'}
                      </span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {conversationHistory.map((conv) => (
                      <SelectItem key={conv.id} value={conv.id}>
                        <div className="flex items-center justify-between w-full">
                          <span className="truncate">{conv.title}</span>
                          <span className="text-xs text-gray-500 ml-2">
                            {new Date(conv.updatedAt).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNewChat}
                className="text-gray-500 hover:text-gray-700"
              >
                <Plus size={16} className="mr-1" />
                Nouveau
              </Button>
              {currentConversation && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsRenameDialogOpen(true);
                      setTempConversationName(currentConversation.title);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <Pencil size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="text-gray-500 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Messages et interface de chat */}
        {currentConversation && messages.length > 0 ? (
          // Messages existants
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex max-w-full ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start space-x-3`}>
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        message.sender === 'user'
                          ? 'bg-gray-700 ml-3'
                          : 'bg-gradient-primary mr-3'
                      }`}>
                        {message.sender === 'user' ? (
                          <span className="text-white text-sm font-medium">U</span>
                        ) : (
                          <Sparkles className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div className={`group relative ${
                        message.sender === 'user'
                          ? 'bg-[#f0efe6] text-gray-900'
                          : ''
                      } rounded-2xl px-4 py-3 markdown-content`}>
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeHighlight]}
                        >
                          {streamingMessageId === message.id ? streamingText : message.text}
                        </ReactMarkdown>
                        {streamingMessageId === message.id && (
                          <span className="inline-block w-2 h-5 bg-blue-500 ml-1 animate-pulse"></span>
                        )}

                        {message.sender === 'bot' && (
                          <div className="absolute -bottom-8 left-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyMessage(message.text)}
                                className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700 hover:bg-[#F0EFE6]"
                              >
                                <Copy size={12} className="mr-1" />
                                Copier
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => regenerateResponse(message.id)}
                                className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700 hover:bg-[#F0EFE6]"
                                disabled={isLoading}
                              >
                                <RefreshCw size={12} className="mr-1" />
                                Régénérer
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
                    <div className="flex items-start space-x-3 max-w-[80%]">
                      <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
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
            
            {/* Input area pour conversation existante */}
            <div>
              <div className="max-w-6xl mx-auto px-4 py-4">
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-200 border border-gray-200">
                  <div className="relative p-4 border-b border-gray-100">
                    <textarea
                      ref={textareaRef}
                      placeholder="Continuez la conversation avec Aurentia..."
                      value={inputMessage}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyPress}
                      className="w-full resize-none border-none bg-transparent focus:outline-none p-0 min-h-[40px] max-h-[80px] text-gray-900 placeholder-gray-500 overflow-y-auto"
                      rows={1}
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="style-select-chat" className="text-sm text-gray-600 whitespace-nowrap">Style:</Label>
                        <Select value={communicationStyle} onValueChange={setCommunicationStyle}>
                          <SelectTrigger id="style-select-chat" className="w-32 h-9 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="concis">Concis</SelectItem>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="explicatif">Explicatif</SelectItem>
                            <SelectItem value="détaillé">Détaillé</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-1">
                        <Label htmlFor="deliverables-select-chat" className="text-sm text-gray-600 whitespace-nowrap">
                          Livrables ({deliverableNames.length}):
                        </Label>
                        <MultiSelect
                          options={deliverableOptions}
                          value={selectedDeliverables}
                          onChange={setSelectedDeliverables}
                          placeholder={deliverableNames.length === 0 ? "Aucun livrable disponible" : "Sélectionner..."}
                          disabled={deliverableNames.length === 0}
                          className="flex-1"
                        />
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Label htmlFor="search-modes-select-chat" className="text-sm text-gray-600 whitespace-nowrap">
                          Modes:
                        </Label>
                        <MultiSelect
                          options={searchModeOptions}
                          value={selectedSearchModes}
                          onChange={setSelectedSearchModes}
                          placeholder="Sélectionner les modes..."
                          className="w-48"
                        />
                      </div>
                      
                      <Button
                        onClick={handleSendMessage}
                        disabled={isInputEmpty || isLoading || isSubmitting}
                        className="rounded-xl w-10 h-10 p-0 bg-gradient-primary hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ml-6"
                      >
                        <ArrowUp size={18} className="text-white" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          // Interface de démarrage de conversation
          <div className="flex flex-col items-center justify-center flex-1 px-4 py-8">
            <div className="max-w-5xl w-full text-center space-y-8">
              {/* Suggested prompts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto mb-8">
                {suggestedPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedPrompt(prompt)}
                    className="p-4 text-left bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-md transition-all duration-200 group"
                  >
                    <span className="text-gray-700 group-hover:text-gray-900">
                      {prompt}
                    </span>
                  </button>
                ))}
              </div>
              
              {/* Input design */}
              <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-200 border border-gray-200">
                  <div className="relative p-4 border-b border-gray-100">
                    <textarea
                      ref={textareaRef}
                      placeholder="Posez votre question à Aurentia..."
                      value={inputMessage}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyPress}
                      className="w-full resize-none border-none bg-transparent focus:outline-none p-0 min-h-[40px] max-h-[80px] text-gray-900 placeholder-gray-500 overflow-y-auto"
                      rows={1}
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-3">
                      {/* Communication Style */}
                      <div className="flex items-center gap-2">
                        <Label htmlFor="style-select" className="text-sm text-gray-600 whitespace-nowrap">Style:</Label>
                        <Select value={communicationStyle} onValueChange={setCommunicationStyle}>
                          <SelectTrigger id="style-select" className="w-32 h-9 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="concis">Concis</SelectItem>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="explicatif">Explicatif</SelectItem>
                            <SelectItem value="détaillé">Détaillé</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Deliverables */}
                      <div className="flex items-center gap-2 flex-1">
                        <Label htmlFor="deliverables-select" className="text-sm text-gray-600 whitespace-nowrap">
                          Livrables ({deliverableNames.length}):
                        </Label>
                        <MultiSelect
                          options={deliverableOptions}
                          value={selectedDeliverables}
                          onChange={setSelectedDeliverables}
                          placeholder={deliverableNames.length === 0 ? "Aucun livrable disponible" : "Sélectionner..."}
                          disabled={deliverableNames.length === 0}
                          className="flex-1"
                        />
                      </div>
                      
                      {/* Search Modes */}
                      <div className="flex items-center gap-2">
                        <Label htmlFor="search-modes-select" className="text-sm text-gray-600 whitespace-nowrap">
                          Modes:
                        </Label>
                        <MultiSelect
                          options={searchModeOptions}
                          value={selectedSearchModes}
                          onChange={setSelectedSearchModes}
                          placeholder="Sélectionner les modes..."
                          className="w-48"
                        />
                      </div>
                      
                      {/* Send Button */}
                      <Button
                        onClick={handleSendMessage}
                        disabled={isInputEmpty || isLoading || isSubmitting}
                        className="rounded-xl w-10 h-10 p-0 bg-gradient-primary hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ml-6"
                      >
                        <ArrowUp size={18} className="text-white" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Rename Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent className="w-[90vw] rounded-xl max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Renommer la conversation</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              id="conversationName"
              value={tempConversationName}
              onChange={(e) => setTempConversationName(e.target.value)}
              className="rounded-lg"
              placeholder="Nom de la conversation"
            />
          </div>
          <DialogFooter className="flex-row justify-end space-x-2">
            <Button variant="outline" onClick={handleCancelRename} className="rounded-lg">
              Annuler
            </Button>
            <Button onClick={handleSaveRename} className="rounded-lg bg-gradient-primary">
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="w-[90vw] rounded-xl max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Supprimer la conversation</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p className="text-gray-600">
              Êtes-vous sûr de vouloir supprimer cette conversation ? Cette action est irréversible.
            </p>
          </div>
          <DialogFooter className="flex-row justify-end space-x-2">
            <Button variant="outline" onClick={handleCancelDelete} className="rounded-lg">
              Annuler
            </Button>
            <Button onClick={handleConfirmDelete} variant="destructive" className="rounded-lg">
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatbotPage;