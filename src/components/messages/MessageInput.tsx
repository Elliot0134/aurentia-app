import { useState, KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface MessageInputProps {
  onSend: (content: string) => void | Promise<void>;
  disabled?: boolean;
  placeholder?: string;
  organizationId?: string;
}

export const MessageInput = ({
  onSend,
  disabled = false,
  placeholder = "Tapez un message...",
  organizationId,
}: MessageInputProps) => {
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    const trimmedContent = content.trim();
    if (!trimmedContent || isSending || disabled) return;

    setIsSending(true);
    try {
      await onSend(trimmedContent);
      setContent("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter, new line on Shift+Enter
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const characterCount = content.length;
  const maxLength = 5000;
  const isNearLimit = characterCount > maxLength * 0.9;

  return (
    <div className="border-t bg-background p-4">
      <div className="flex gap-2 items-end">
        <div className="flex-1 relative">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isSending}
            className="min-h-[80px] max-h-[200px] resize-none pr-16"
            maxLength={maxLength}
          />
          {isNearLimit && (
            <div className={cn(
              "absolute bottom-2 right-2 text-xs",
              characterCount >= maxLength ? "text-destructive" : "text-muted-foreground"
            )}>
              {characterCount}/{maxLength}
            </div>
          )}
        </div>
        <Button
          onClick={handleSend}
          disabled={!content.trim() || disabled || isSending}
          size="icon"
          className={organizationId ? "h-10 w-10 btn-white-label hover:opacity-90" : "h-10 w-10 bg-gradient-to-r from-aurentia-pink to-aurentia-orange text-white hover:opacity-90"}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      <div className="text-xs text-muted-foreground mt-2">
        Appuyez sur Entrée pour envoyer, Maj+Entrée pour une nouvelle ligne
      </div>
    </div>
  );
};
