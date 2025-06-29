import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowUp, Pencil, Trash2, Copy, RefreshCw, MoreHorizontal, Sparkles, Settings, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { chatbotService, type Message, type Conversation } from '@/services/chatbotService';
import { toast } from "sonner";

const ChatbotPage = () => {
  const { projectId } = useParams();
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [tempConversationName, setTempConversationName] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // State for communication style and search mode (defaults)
  const [communicationStyle, setCommunicationStyle] = useState('normal');
  const [deepSearchMode, setDeepSearchMode] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize conversation on mount
  useEffect(() => {
    const userId = 'demo-user'; // This would come from auth context in a real app
    const conversation = chatbotService.createConversation(userId, projectId);
    setCurrentConversation(conversation);
  }, [projectId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentConversation?.messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [inputMessage]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value);
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() !== '' && !isLoading && currentConversation) {
      const userText = inputMessage.trim();
      
      // Console.log the current settings when sending a message
      console.log('Sending message with settings:', {
        communicationStyle,
        deepSearchMode,
        message: userText
      });
      
      setInputMessage('');
      setIsLoading(true);

      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }

      // Add user message
      const userMessage = chatbotService.addMessage(currentConversation.id, 'user', userText);
      if (userMessage) {
        setCurrentConversation(prev => prev ? {...prev, messages: [...prev.messages, userMessage]} : null);
      }

      try {
        // Send message to webhook with communication style and search mode
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
            deepSearchMode: deepSearchMode
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const botResponse = data[0].output.response;

        // Add bot message
        const botMessage = chatbotService.addMessage(currentConversation.id, 'bot', botResponse);
        if (botMessage) {
          setCurrentConversation(prev => prev ? {...prev, messages: [...prev.messages, botMessage]} : null);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error generating response:', error);
        const errorMessage = chatbotService.addMessage(
          currentConversation.id, 
          'bot', 
          "Désolé, j'ai rencontré une erreur. Pouvez-vous reformuler votre question ?"
        );
        if (errorMessage) {
          setCurrentConversation(prev => prev ? {...prev, messages: [...prev.messages, errorMessage]} : null);
        }
        setIsLoading(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Message copié dans le presse-papiers");
  };

  const regenerateResponse = async (messageId: string) => {
    if (!currentConversation) return;
    
    const messageIndex = currentConversation.messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;

    const previousUserMessage = currentConversation.messages
      .slice(0, messageIndex)
      .reverse()
      .find(m => m.sender === 'user');

    if (!previousUserMessage) return;

    setIsLoading(true);
    
    try {
      const webhookUrl = "https://n8n.eec-technologies.fr/webhook-test/chatbot-global";
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: previousUserMessage.text, 
          projectId: projectId,
          communicationStyle: communicationStyle,
          deepSearchMode: deepSearchMode
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const newResponse = data[0].output.response;

      // Update the message in place
      const updatedMessages = [...currentConversation.messages];
      updatedMessages[messageIndex] = {
        ...updatedMessages[messageIndex],
        text: newResponse,
        timestamp: new Date()
      };

      setCurrentConversation(prev => prev ? {...prev, messages: updatedMessages} : null);
      setIsLoading(false);
      toast.success("Réponse régénérée");
    } catch (error) {
      console.error('Error regenerating response:', error);
      setIsLoading(false);
      toast.error("Erreur lors de la régénération");
    }
  };

  const handleSaveRename = () => {
    if (currentConversation && tempConversationName.trim()) {
      const success = chatbotService.updateConversationTitle(currentConversation.id, tempConversationName.trim());
      if (success) {
        setCurrentConversation(prev => prev ? {...prev, title: tempConversationName.trim()} : null);
        toast.success("Conversation renommée");
      }
    }
    setIsRenameDialogOpen(false);
  };

  const handleCancelRename = () => {
    setIsRenameDialogOpen(false);
  };

  const handleConfirmDelete = () => {
    if (currentConversation) {
      const success = chatbotService.deleteConversation(currentConversation.id);
      if (success) {
        setCurrentConversation(null);
        toast.success("Conversation supprimée");
        // In a real app, you might redirect to a conversations list or create a new one
        const userId = 'demo-user';
        const newConversation = chatbotService.createConversation(userId, projectId);
        setCurrentConversation(newConversation);
      }
    }
    setIsDeleteDialogOpen(false);
  };

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
  };

  // Fixed: Remove automatic sending, just populate the input
  const handleSuggestedPrompt = (prompt: string) => {
    setInputMessage(prompt);
    textareaRef.current?.focus();
  };

  const handleNewChat = () => {
    const userId = 'demo-user'; // This would come from auth context in a real app
    const newConversation = chatbotService.createConversation(userId, projectId);
    setCurrentConversation(newConversation);
    setInputMessage('');
    toast.success("Nouvelle conversation créée");
  };

  const isInputEmpty = inputMessage.trim() === '';
  const messages = currentConversation?.messages || [];

  const suggestedPrompts = [
    "Aide-moi à analyser ma concurrence",
    "Quelles sont les tendances de mon marché ?",
    "Comment améliorer ma proposition de valeur ?",
    "Analyse les risques de mon projet"
  ];

  if (!currentConversation) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Sparkles className="w-8 h-8 text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Initialisation de la conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#F8F6F1]">
      {messages.length === 0 ? (
        // Initial state with welcome message and suggestions
        <div className="flex flex-col items-center justify-center flex-1 px-4 py-8">
          <div className="max-w-3xl w-full text-center space-y-8">
            {/* Header */}
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-primary mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                Bonjour ! Je suis Aurentia
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Votre assistant IA spécialisé dans l'analyse de projets entrepreneuriaux. 
                Posez-moi vos questions sur votre projet, votre marché, ou votre stratégie.
              </p>
            </div>

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

            {/* New input design */}
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-200 border border-gray-200">
                {/* Text input area - top 50% */}
                <div className="relative p-4 border-b border-gray-100">
                  <Textarea
                    ref={textareaRef}
                    placeholder="Posez votre question à Aurentia..."
                    value={inputMessage}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyPress}
                    className="resize-none border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 min-h-[60px] max-h-[120px] text-gray-900 placeholder-gray-500"
                    rows={1}
                  />
                </div>
                
                {/* Controls area - bottom 50% */}
                <div className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    {/* Communication Style Selector */}
                    <div className="flex items-center gap-2">
                      <Label htmlFor="style-select" className="text-sm text-gray-600">Style:</Label>
                      <Select value={communicationStyle} onValueChange={setCommunicationStyle}>
                        <SelectTrigger id="style-select" className="w-32 h-8 text-sm">
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

                    {/* Deep Search Toggle */}
                    <div className="flex items-center gap-2">
                      <Switch
                        id="deep-search"
                        checked={deepSearchMode}
                        onCheckedChange={setDeepSearchMode}
                      />
                      <Label htmlFor="deep-search" className="text-sm text-gray-600">
                        Recherche approfondie
                      </Label>
                    </div>
                  </div>

                  {/* Send Button */}
                  <Button
                    onClick={handleSendMessage}
                    disabled={isInputEmpty || isLoading}
                    className="rounded-xl w-10 h-10 p-0 bg-gradient-primary hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    <ArrowUp size={18} className="text-white" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Chat interface
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
            <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {currentConversation.title}
                </h2>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNewChat}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Plus size={16} className="mr-1" />
                  New chat
                </Button>
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
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex max-w-full ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start space-x-3`}>
                    {/* Avatar */}
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

                    {/* Message content */}
                    <div className={`group relative ${
                      message.sender === 'user'
                        ? 'bg-[#f0efe6] text-gray-900'
                        : ''
                    } rounded-2xl px-4 py-3`}>
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.text}
                      </div>
                      
                      {/* Message actions */}
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
              
              {/* Loading indicator */}
              {isLoading && (
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

          {/* New input area design for chat mode */}
          <div>
            <div className="max-w-4xl mx-auto px-4 py-4">
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-200 border border-gray-200">
                {/* Text input area - top 50% */}
                <div className="relative p-4 border-b border-gray-100">
                  <Textarea
                    ref={textareaRef}
                    placeholder="Continuez la conversation avec Aurentia..."
                    value={inputMessage}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyPress}
                    className="resize-none border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 min-h-[60px] max-h-[120px] text-gray-900 placeholder-gray-500"
                    rows={1}
                  />
                </div>
                
                {/* Controls area - bottom 50% */}
                <div className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    {/* Communication Style Selector */}
                    <div className="flex items-center gap-2">
                      <Label htmlFor="style-select-chat" className="text-sm text-gray-600">Style:</Label>
                      <Select value={communicationStyle} onValueChange={setCommunicationStyle}>
                        <SelectTrigger id="style-select-chat" className="w-32 h-8 text-sm">
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

                    {/* Deep Search Toggle */}
                    <div className="flex items-center gap-2">
                      <Switch
                        id="deep-search-chat"
                        checked={deepSearchMode}
                        onCheckedChange={setDeepSearchMode}
                      />
                      <Label htmlFor="deep-search-chat" className="text-sm text-gray-600">
                        Recherche approfondie
                      </Label>
                    </div>
                  </div>

                  {/* Send Button */}
                  <Button
                    onClick={handleSendMessage}
                    disabled={isInputEmpty || isLoading}
                    className="rounded-xl w-10 h-10 p-0 bg-gradient-primary hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    <ArrowUp size={18} className="text-white" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
