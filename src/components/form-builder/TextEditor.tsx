import React, { useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';

interface TextEditorProps {
  content: string;
  onChange: (content: string) => void;
  onSlashCommand: (position: { top: number; left: number }) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function TextEditor({ content, onChange, onSlashCommand, placeholder, autoFocus }: TextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    onChange(value);

    // Detect slash command
    if (value.endsWith('/')) {
      const textarea = textareaRef.current;
      if (textarea) {
        const rect = textarea.getBoundingClientRect();
        const position = {
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX
        };
        onSlashCommand(position);
      }
    }
  };

  return (
    <Textarea
      ref={textareaRef}
      value={content}
      onChange={handleChange}
      placeholder={placeholder}
      autoFocus={autoFocus}
      className="min-h-[100px] resize-none"
    />
  );
}
