import * as React from "react";
import { useLayoutEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, onChange, value, ...props }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Merge internal ref with the external ref
    React.useImperativeHandle(ref, () => textareaRef.current!);

    const adjustHeight = () => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = "auto"; // Reset height to calculate the actual scrollHeight
        textarea.style.height = `${textarea.scrollHeight}px`; // Set the height to the full content height
      }
    };

    // Adjust height on content change
    useLayoutEffect(() => {
      adjustHeight();
    }, [value]);

    // Adjust height on component resize (e.g., window resize)
    useLayoutEffect(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const resizeObserver = new ResizeObserver(adjustHeight);
      resizeObserver.observe(textarea);

      // Cleanup observer on component unmount
      return () => {
        resizeObserver.disconnect();
      };
    }, []);

    return (
      <textarea
        className={cn(
          "flex w-full rounded-md border border-input bg-white pt-2 pb-2 px-3 text-sm text-[#73726c] ring-offset-background placeholder:text-[#73726c] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 leading-tight resize-none overflow-hidden",
          className
        )}
        ref={textareaRef}
        value={value}
        onChange={onChange}
        rows={1}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };
