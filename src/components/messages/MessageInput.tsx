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
    <div className="border-t bg-background p-4 relative z-10">
      <div className="relative">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isSending}
          className="min-h-[80px] max-h-[200px] resize-none pr-14 pb-12"
          maxLength={maxLength}
        />

        {/* Character count - positioned above send button */}
        {isNearLimit && (
          <div className={cn(
            "absolute top-2 right-2 text-xs px-2 py-1 rounded bg-background/80 backdrop-blur-sm z-10",
            characterCount >= maxLength ? "text-destructive" : "text-muted-foreground"
          )}>
            {characterCount}/{maxLength}
          </div>
        )}

        {/* Send button - positioned inside textarea at bottom-right */}
        <Button
          onClick={handleSend}
          disabled={!content.trim() || disabled || isSending}
          size="icon"
          className={cn(
            "absolute bottom-2 right-2 h-10 w-10 rounded-full shadow-lg transition-all z-20",
            organizationId
              ? "btn-white-label hover:opacity-90"
              : "bg-gradient-to-r from-aurentia-pink to-aurentia-orange text-white hover:opacity-90 hover:scale-105 active:scale-95",
            (!content.trim() || disabled || isSending) && "opacity-50 cursor-not-allowed"
          )}
          aria-label="Envoyer le message"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      <div className="text-xs text-muted-foreground mt-2 hidden sm:block">
        Appuyez sur Entrée pour envoyer, Maj+Entrée pour une nouvelle ligne
      </div>
    </div>
  );
};
