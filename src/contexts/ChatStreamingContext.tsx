import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { chatbotService } from '@/services/chatbotService';

interface StreamingMessage {
  conversationId: string;
  messageId: string;
  currentText: string;
  fullText: string;
  isComplete: boolean;
  startedAt: number;
}

interface ChatStreamingContextType {
  activeStreams: Map<string, StreamingMessage>;
  registerStream: (convId: string, msgId: string, fullText: string) => void;
  getStreamText: (msgId: string) => string | null;
  isStreamActive: (msgId: string) => boolean;
  completeStream: (msgId: string) => void;
  getActiveStreamId: () => string | null;
}

const ChatStreamingContext = createContext<ChatStreamingContextType | undefined>(undefined);

export const ChatStreamingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeStreams, setActiveStreams] = useState<Map<string, StreamingMessage>>(new Map());
  const streamTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const streamAbortControllers = useRef<Map<string, boolean>>(new Map());

  // Nettoyer les timers au démontage
  useEffect(() => {
    return () => {
      streamTimers.current.forEach(timer => clearTimeout(timer));
      streamTimers.current.clear();
      streamAbortControllers.current.clear();
    };
  }, []);

  const registerStream = useCallback((convId: string, msgId: string, fullText: string) => {
    // Annuler tout stream précédent pour ce message
    streamAbortControllers.current.set(msgId, false);

    setActiveStreams(prev => {
      const newMap = new Map(prev);
      newMap.set(msgId, {
        conversationId: convId,
        messageId: msgId,
        currentText: '',
        fullText,
        isComplete: false,
        startedAt: Date.now(),
      });
      return newMap;
    });

    // Démarrer le streaming en arrière-plan
    startBackgroundStreaming(msgId, fullText, convId);
  }, []);

  const startBackgroundStreaming = async (msgId: string, fullText: string, convId: string) => {
    const words = fullText.split(' ');
    let currentText = '';

    for (let i = 0; i < words.length; i++) {
      // Vérifier si le streaming a été annulé
      if (streamAbortControllers.current.get(msgId) === true) {
        console.log('Streaming annulé pour message:', msgId);
        return;
      }

      currentText += (i === 0 ? '' : ' ') + words[i];

      setActiveStreams(prev => {
        const newMap = new Map(prev);
        const stream = newMap.get(msgId);
        if (stream) {
          stream.currentText = currentText;
          newMap.set(msgId, stream);
        }
        return newMap;
      });

      const delay = words[i].length > 8 ? 40 : 25;
      await new Promise<void>(resolve => {
        const timer = setTimeout(() => resolve(), delay);
        streamTimers.current.set(`${msgId}_${i}`, timer);
      });
    }

    // Compléter le streaming
    setTimeout(() => {
      completeStream(msgId);
      // Sauvegarder en DB
      chatbotService.updateMessageWithDB(convId, msgId, fullText).catch(error => {
        console.error('Erreur sauvegarde message après streaming:', error);
      });
    }, 100);
  };

  const getStreamText = useCallback((msgId: string) => {
    return activeStreams.get(msgId)?.currentText || null;
  }, [activeStreams]);

  const isStreamActive = useCallback((msgId: string) => {
    const stream = activeStreams.get(msgId);
    return stream ? !stream.isComplete : false;
  }, [activeStreams]);

  const getActiveStreamId = useCallback(() => {
    for (const [msgId, stream] of activeStreams.entries()) {
      if (!stream.isComplete) {
        return msgId;
      }
    }
    return null;
  }, [activeStreams]);

  const completeStream = useCallback((msgId: string) => {
    setActiveStreams(prev => {
      const newMap = new Map(prev);
      const stream = newMap.get(msgId);
      if (stream) {
        stream.isComplete = true;
        stream.currentText = stream.fullText;
        newMap.set(msgId, stream);
      }
      return newMap;
    });

    // Nettoyer les timers pour ce message
    streamTimers.current.forEach((timer, key) => {
      if (key.startsWith(msgId)) {
        clearTimeout(timer);
        streamTimers.current.delete(key);
      }
    });

    // Nettoyer après 30s
    setTimeout(() => {
      setActiveStreams(prev => {
        const newMap = new Map(prev);
        newMap.delete(msgId);
        return newMap;
      });
      streamAbortControllers.current.delete(msgId);
    }, 30000);
  }, []);

  return (
    <ChatStreamingContext.Provider value={{
      activeStreams,
      registerStream,
      getStreamText,
      isStreamActive,
      completeStream,
      getActiveStreamId,
    }}>
      {children}
    </ChatStreamingContext.Provider>
  );
};

export const useChatStreaming = () => {
  const context = useContext(ChatStreamingContext);
  if (!context) {
    throw new Error('useChatStreaming must be used within ChatStreamingProvider');
  }
  return context;
};
