import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowUp, Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const ChatbotPage = () => {
  const { projectId } = useParams();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [conversationName, setConversationName] = useState('Nouvelle conversation');
  const [isEditingConversationName, setIsEditingConversationName] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false); // New state for dialog
  const [tempConversationName, setTempConversationName] = useState(''); // New state for dialog input
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false); // New state for delete dialog
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset height to recalculate
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  const handleSendMessage = () => {
    if (inputMessage.trim() !== '') {
      setMessages([...messages, { sender: 'user', text: inputMessage }]);
      setInputMessage('');
      if (textareaRef.current) {
        textareaRef.current.value = ''; // Explicitly clear the textarea's value
        textareaRef.current.style.height = 'auto'; // Reset height to recalculate
      }
      // Here you would typically send the message to a backend API
      // and then add the chatbot's response to the messages array.
      // For now, let's simulate a simple bot response.
      setTimeout(() => {
        setMessages(prevMessages => [...prevMessages, { sender: 'bot', text: `Je suis un chatbot pour le projet ${projectId}. Vous avez dit: "${inputMessage}"` }]);
      }, 1000);
    }
  };

  const handleSaveRename = () => {
    setConversationName(tempConversationName);
    setIsRenameDialogOpen(false);
    setIsEditingConversationName(false); // Reset this state as well
  };

  const handleCancelRename = () => {
    setIsRenameDialogOpen(false);
    setIsEditingConversationName(false); // Reset this state as well
  };

  const handleConfirmDelete = () => {
    // Logic to delete the conversation
    console.log('Conversation deleted!');
    setIsDeleteDialogOpen(false);
    // Optionally, redirect or clear messages after deletion
  };

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
  };

  const isInputEmpty = inputMessage.trim() === '';

  return (
    <div className="flex flex-col justify-center items-center min-h-screen p-4 md:w-4/5 md:mx-auto bg-transparent">
      {messages.length === 0 ? (
        // State 1: Initial - only input container centered
        <div className="flex flex-col justify-center items-center w-full h-full">
          <h2 className="text-xl font-semibold text-gray-800 mb-8">Quelle est votre question aujourd'hui ?</h2>
          <div className="flex flex-col w-full rounded-md bg-white border-[0.5px] border-[#c4c4c4] shadow-sm hover:shadow-md transition-shadow duration-200 hover:border-[#a3a3a3] focus-within:border-[#a3a3a3] transition-colors">
            <div className="px-4 mt-2">
              <Textarea
                ref={textareaRef}
                placeholder="Répondre à Aurentia..."
                value={inputMessage}
                onChange={handleInputChange}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    handleSendMessage();
                    e.preventDefault();
                  }
                }}
                className="resize-none border-none focus-visible:ring-0 focus-visible:ring-offset-0 overflow-hidden"
              />
            </div>
            <div className="flex justify-end px-4 pb-4">
              <Button
                onClick={handleSendMessage}
                className={`rounded-full w-10 h-10 p-0 flex items-center justify-center ${isInputEmpty ? 'bg-gradient-primary opacity-50' : 'bg-gradient-primary'}`}
                aria-label="Envoyer"
                disabled={isInputEmpty}
              >
                <ArrowUp size={20} className={isInputEmpty ? 'text-white opacity-50' : 'text-white'} />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        // State 2: Chatting - full chatbot UI
        <div className="flex flex-col h-[90vh] w-full relative">
          {/* Header section */}
          <div className="mb-4 w-full flex items-center justify-between">
            {isEditingConversationName ? (
              <div className="flex flex-col w-full">
                <Input
                  type="text"
                  value={conversationName}
                  onChange={(e) => setConversationName(e.target.value)}
                  className="text-base font-semibold text-gray-800 border-none focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
                />
                <Button
                  onClick={() => setIsEditingConversationName(false)}
                  className="mt-2 self-end"
                >
                  Modifier le nom
                </Button>
              </div>
            ) : (
              <>
                <span className="text-base font-semibold text-gray-800">
                  {conversationName}
                </span>
                <div className="flex items-center gap-2">
                  <div
                    className="bg-[#F0EFE6] rounded-md p-2 flex items-center justify-center cursor-pointer transition-shadow duration-200 hover:[box-shadow:0_0_5px_rgba(0,0,0,0.1)]"
                    onClick={() => {
                      setIsRenameDialogOpen(true);
                      setTempConversationName(conversationName);
                    }}
                  >
                    <Pencil size={16} className="text-gray-500" />
                  </div>
                  <div
                    className="bg-[#F0EFE6] rounded-md p-2 flex items-center justify-center cursor-pointer transition-shadow duration-200 hover:[box-shadow:0_0_5px_rgba(0,0,0,0.1)]"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <Trash2 size={16} className="text-gray-500" />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Main chat history area */}
          <div className={`flex-1 overflow-y-auto rounded-md p-4 pb-[140px] bg-transparent w-full border-t-[0.5px] border-[#c4c4c4]`}>
            {messages.map((msg, index) => (
              <div key={index} className={`mb-2 ${msg.sender === 'user' ? 'text-left' : 'text-left'}`}>
                <span className={`inline-block p-2 rounded-lg whitespace-pre-wrap text-sm ${msg.sender === 'user' ? 'max-w-full bg-[#f0efe6] text-gray-800 text-left' : 'max-w-full bg-transparent text-gray-800 text-left'}`}>
                  {msg.text}
                </span>
              </div>
            ))}
          </div>

          {/* Input container (positioned at bottom) */}
          <div className="flex flex-col w-full absolute bottom-0 rounded-md bg-white border-[0.5px] border-[#c4c4c4] shadow-sm hover:shadow-md transition-shadow duration-200 hover:border-[#a3a3a3] focus-within:border-[#a3a3a3] transition-colors">
            <div className="px-4 mt-2">
              <Textarea
                ref={textareaRef}
                placeholder="Répondre à Aurentia..."
                value={inputMessage}
                onChange={handleInputChange}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    handleSendMessage();
                    e.preventDefault();
                  }
                }}
                className="resize-none border-none focus-visible:ring-0 focus-visible:ring-offset-0 overflow-hidden"
              />
            </div>
            <div className="flex justify-end px-4 pb-4">
              <Button
                onClick={handleSendMessage}
                className={`rounded-full w-10 h-10 p-0 flex items-center justify-center ${isInputEmpty ? 'bg-gradient-primary opacity-50' : 'bg-gradient-primary'}`}
                aria-label="Envoyer"
                disabled={isInputEmpty}
              >
                <ArrowUp size={20} className={isInputEmpty ? 'text-white opacity-50' : 'text-white'} />
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Rename Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent className="w-[90vw] rounded-lg max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Renommer la conversation</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              id="conversationName"
              value={tempConversationName}
              onChange={(e) => setTempConversationName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <DialogFooter className="flex-row justify-end space-x-2">
            <Button variant="outline" onClick={handleCancelRename}>Annuler</Button>
            <Button onClick={handleSaveRename}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="w-[90vw] rounded-lg max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Supprimer la conversation</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p>Êtes-vous sûr de vouloir supprimer cette conversation ?</p>
          </div>
          <DialogFooter className="flex-row justify-end space-x-2">
            <Button variant="outline" onClick={handleCancelDelete}>Annuler</Button>
            <Button onClick={handleConfirmDelete}>Supprimer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatbotPage;
