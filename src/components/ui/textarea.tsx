import * as React from "react"
import { useState, useEffect } from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, onChange, value, ...props }, ref) => {
    const [textareaValue, setTextareaValue] = useState(value || "");
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
      setTextareaValue(value || "");
    }, [value]);

    useEffect(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
      }
    }, [textareaValue]);

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setTextareaValue(event.target.value);
      if (onChange) {
        onChange(event);
      }
    };

    return (
      <textarea
        className={cn(
          "flex w-full rounded-md border border-input bg-background pt-2 pb-2 px-3 text-sm text-[#73726c] ring-offset-background placeholder:text-[#73726c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 leading-tight overflow-hidden resize-none",
          className
        )}
        ref={(e) => {
          if (e) {
            // @ts-ignore
            ref.current = e;
            textareaRef.current = e;
          }
        }}
        rows={1}
        value={textareaValue}
        onChange={handleChange}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
