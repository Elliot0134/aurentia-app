import { useState, useRef, useEffect } from 'react';
import { chatbotService, type Message, type Conversation } from '@/services/chatbotService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { useProject } from '@/contexts/ProjectContext';

export const useChatConversation = (projectId: string | undefined) => {
  const { updateUserCredits } = useProject();
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isConversationLoading, setIsConversationLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Conversation[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [streamingText, setStreamingText] = useState('');
  
  const lastSentMessage = useRef<string>('');
  const lastSentTime = useRef<number>(0);
  const lastErrorTime = useRef<number>(0);
  const errorCooldown = 2000;
  const initializedProjectId = useRef<string | undefined>(undefined);

  // Load conversation history and initialize
  useEffect(() => {
    const loadConversationHistory = async () => {
      if (!projectId) return;
      
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
        
        console.log(`ℹ️ ${conversations.length} conversation(s) trouvée(s) pour ce projet`);
        
        initializedProjectId.current = projectId;
      } catch (error) {
        console.error('❌ Erreur chargement historique:', error);
        toast.error('Erreur lors du chargement de l\'historique');
      } finally {
        setIsHistoryLoading(false);
      }
    };

    // Charger l'historique dès que le projectId est disponible et a changé
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

  const streamText = async (text: string, messageId: string) => {
    setStreamingMessageId(messageId);
    setStreamingText('');
    
    const words = text.split(' ');
    let currentText = '';
    
    for (let i = 0; i < words.length; i++) {
      currentText += (i === 0 ? '' : ' ') + words[i];
      setStreamingText(currentText);
      
      const delay = words[i].length > 8 ? 40 : 25;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    setTimeout(() => {
      setStreamingMessageId(null);
      setStreamingText('');
    }, 100);
  };

  const sendMessage = async (
    userText: string,
    communicationStyle: string,
    selectedSearchModes: string[],
    selectedDeliverables: string[]
  ) => {
    const currentTime = Date.now();
    
    // Check error cooldown
    if (lastErrorTime.current && (currentTime - lastErrorTime.current) < errorCooldown) {
      console.log('⏱️ Error cooldown active, waiting...');
      toast.error('Veuillez patienter avant de renvoyer un message');
      return false;
    }
    
    // Prevent duplicate messages
    if (lastSentTime.current && (currentTime - lastSentTime.current) < 1000) {
      console.log('🛑 Duplicate submission prevented - too fast:', userText);
      return false;
    }
    
    if (lastSentMessage.current === userText && (currentTime - lastSentTime.current) < 5000) {
      console.log('🛑 Duplicate message prevented - same content:', userText);
      return false;
    }
    
    setIsLoading(true);
    setIsSubmitting(true);
    lastSentMessage.current = userText;
    lastSentTime.current = currentTime;

    try {
      // Vérifier et décrémenter les crédits utilisateur
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast.error('Vous devez être connecté pour envoyer un message');
        return false;
      }

      // Récupérer le profil utilisateur pour vérifier les crédits
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('credits_restants')
        .eq('id', session.user.id)
        .single();

      if (profileError || !profile) {
        console.error('❌ Erreur récupération profil:', profileError);
        toast.error('Erreur lors de la vérification de vos crédits');
        return false;
      }

      const currentCredits = parseInt(profile.credits_restants || '0', 10);
      
      if (currentCredits <= 0) {
        toast.error('Vous n\'avez plus de crédits disponibles. Veuillez acheter un plan pour continuer.');
        return false;
      }

      // Décrémenter les crédits
      const newCredits = currentCredits - 1;
      await updateUserCredits(newCredits);

      console.log(`💳 Crédit utilisé. Crédits restants: ${newCredits}`);

      // Créer une nouvelle conversation si nécessaire
      let conversationToUse = currentConversation;
      if (!conversationToUse) {
        if (!session?.user || !projectId) {
          toast.error('Impossible de créer une nouvelle conversation');
          return false;
        }

        const newConversation = await chatbotService.createNewConversation(session.user.id, projectId);
        if (!newConversation) {
          toast.error('Échec de création de la conversation');
          return false;
        }

        conversationToUse = newConversation;
        setCurrentConversation(newConversation);
        setConversationId(newConversation.id);
        
        await refreshHistory();
      }

      // Add user message avec DB persistence
      const userMessage = await chatbotService.addMessageWithDB(conversationToUse.id, 'user', userText);
      if (userMessage) {
        // Forcer la mise à jour immédiate de l'état pour afficher le message utilisateur
        const updatedConversation = chatbotService.getConversation(conversationToUse.id);
        if (updatedConversation) {
          setCurrentConversation({...updatedConversation}); // Force re-render avec spread operator
        }
      } else {
        console.error('❌ Échec ajout message utilisateur');
        toast.error('Impossible de sauvegarder votre message');
        return false;
      }

      // Vérifier si c'est le premier message
      const currentConvState = chatbotService.getConversation(conversationToUse.id);
      const isFirstMessage = currentConvState ? currentConvState.messages.filter(m => m.sender === 'user').length === 1 : true;
      
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
        let updatedConversation = chatbotService.getConversation(conversationToUse.id);
        if (updatedConversation) {
          setCurrentConversation({...updatedConversation}); // Force re-render
        }
        
        await streamText(botResponse, botMessage.id);
        
        const updatedMessage = await chatbotService.updateMessageWithDB(conversationToUse.id, botMessage.id, botResponse);
        if (updatedMessage) {
          updatedConversation = chatbotService.getConversation(conversationToUse.id);
          if (updatedConversation) {
            setCurrentConversation({...updatedConversation}); // Force re-render
          }
        }
      }
      
      return true;
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
      
      toast.error(errorMsg);
      return false;
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

  const regenerateResponse = async (
    messageId: string,
    communicationStyle: string,
    selectedSearchModes: string[],
    selectedDeliverables: string[]
  ) => {
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
      // Vérifier et décrémenter les crédits utilisateur pour la régénération
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast.error('Vous devez être connecté pour régénérer une réponse');
        return;
      }

      // Récupérer le profil utilisateur pour vérifier les crédits
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('credits_restants')
        .eq('id', session.user.id)
        .single();

      if (profileError || !profile) {
        console.error('❌ Erreur récupération profil:', profileError);
        toast.error('Erreur lors de la vérification de vos crédits');
        return;
      }

      const currentCredits = parseInt(profile.credits_restants || '0', 10);
      
      if (currentCredits <= 0) {
        toast.error('Vous n\'avez plus de crédits disponibles pour régénérer une réponse.');
        return;
      }

      // Décrémenter les crédits
      const newCredits = currentCredits - 1;
      await updateUserCredits(newCredits);

      console.log(`💳 Crédit utilisé pour régénération. Crédits restants: ${newCredits}`);

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
        let updatedConversation = chatbotService.getConversation(currentConversation.id);
        if (updatedConversation) {
          setCurrentConversation({...updatedConversation}); // Force re-render
        }
      }
      
      await streamText(newResponse, messageToUpdate.id);
      
      const finalUpdatedMessage = await chatbotService.updateMessageWithDB(currentConversation.id, messageToUpdate.id, newResponse);
      if (finalUpdatedMessage) {
        const finalConversation = chatbotService.getConversation(currentConversation.id);
        if (finalConversation) {
          setCurrentConversation({...finalConversation}); // Force re-render
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

  const updateConversationTitle = async (title: string) => {
    if (currentConversation && title.trim()) {
      const success = await chatbotService.updateConversationTitleInDB(currentConversation.id, title.trim());
      if (success) {
        setCurrentConversation(prev => prev ? {...prev, title: title.trim()} : null);
        await refreshHistory();
        toast.success("Conversation renommée");
        return true;
      } else {
        toast.error("Erreur lors du renommage");
        return false;
      }
    }
    return false;
  };

  const deleteConversation = async () => {
    if (currentConversation) {
      const success = await chatbotService.deleteConversationFromDB(currentConversation.id);
      if (success) {
        setCurrentConversation(null);
        setConversationId(null);
        
        await refreshHistory();
        
        // Charger la première conversation si elle existe
        const updatedHistory = await (async () => {
          if (!projectId) return [];
          try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) return [];
            return await chatbotService.getUserConversationsFromDB(session.user.id, projectId);
          } catch {
            return [];
          }
        })();
        
        if (updatedHistory.length > 0) {
          await loadConversation(updatedHistory[0].id);
        }
        
        toast.success("Conversation supprimée");
        return true;
      } else {
        toast.error("Erreur lors de la suppression");
        return false;
      }
    }
    return false;
  };

  const newChat = () => {
    setCurrentConversation(null);
    setConversationId(null);
    setStreamingMessageId(null);
    setStreamingText('');
    
    toast.success("Prêt pour une nouvelle conversation");
  };

  return {
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
  };
}; 