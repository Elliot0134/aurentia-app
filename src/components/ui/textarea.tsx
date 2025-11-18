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
          "flex w-full rounded-md border border-input dark:border-[#787b80] bg-white dark:bg-[#40444d] pt-2 pb-2 px-3 text-sm text-gray-900 dark:text-[#f9f6f1] placeholder:text-[#333333] dark:placeholder:text-[#94a3b8] placeholder:opacity-50 focus-visible:outline-none focus-visible:ring-0 hover:border-[#d1d5db] dark:hover:border-[#8a8d92] focus:border-[#9ca3af] dark:focus:border-[#ff592b] transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 leading-tight resize-none overflow-hidden",
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
