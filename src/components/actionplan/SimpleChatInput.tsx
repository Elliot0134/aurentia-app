import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { SendHorizonal } from 'lucide-react';

interface SimpleChatInputProps {
  inputMessage: string;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  isLoading: boolean;
  isSubmitting: boolean;
  placeholder?: string;
}

export const SimpleChatInput: React.FC<SimpleChatInputProps> = ({
  inputMessage,
  onInputChange,
  onSendMessage,
  onKeyPress,
  isLoading,
  isSubmitting,
  placeholder = "Écrivez votre message..."
}) => {
  return (
    <div className="relative flex items-center w-full">
      <Textarea
        value={inputMessage}
        onChange={onInputChange}
        onKeyDown={onKeyPress}
        placeholder={placeholder}
        className="min-h-[40px] pr-12 resize-none"
        disabled={isLoading || isSubmitting}
      />
      <Button
        type="submit"
        size="icon"
        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-orange-500 hover:bg-orange-600 text-white"
        onClick={onSendMessage}
        disabled={isLoading || isSubmitting || inputMessage.trim() === ''}
      >
        <SendHorizonal className="h-4 w-4" />
        <span className="sr-only">Envoyer le message</span>
      </Button>
    </div>
  );
};
