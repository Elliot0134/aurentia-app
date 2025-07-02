import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MultiSelectOption {
  value: string;
  label: string;
  description?: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  trigger?: React.ReactNode; // New prop for custom trigger
}

export const MultiSelect = React.forwardRef<HTMLDivElement, MultiSelectProps>(
  ({ options, value, onChange, placeholder = "Sélectionner...", disabled = false, className, trigger }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    const handleSelect = (optionValue: string) => {
      const newValue = value.includes(optionValue)
        ? value.filter(v => v !== optionValue)
        : [...value, optionValue];
      onChange(newValue);
    };

    const handleRemove = (optionValue: string, event: React.MouseEvent) => {
      event.stopPropagation();
      onChange(value.filter(v => v !== optionValue));
    };

    const selectedOptions = options.filter(option => value.includes(option.value));

    return (
      <div
        ref={containerRef}
        className={cn("relative w-full", className)}
      >
        {trigger ? (
          <div onClick={() => !disabled && setIsOpen(!isOpen)}>
            {trigger}
          </div>
        ) : (
          <div
            onClick={() => !disabled && setIsOpen(!isOpen)}
            className={cn(
              "flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
              "cursor-pointer transition-colors",
              disabled ? "cursor-not-allowed opacity-50" : "hover:bg-accent hover:text-accent-foreground",
              isOpen && "ring-2 ring-ring ring-offset-2",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
          >
            <div className="flex flex-1 items-center overflow-hidden">
              {selectedOptions.length === 0 ? (
                <span className="text-muted-foreground truncate">{placeholder}</span>
              ) : selectedOptions.length === 1 ? (
                <span className="truncate">{selectedOptions[0].label}</span>
              ) : (
                <span className="truncate">{selectedOptions.length} livrables sélectionnés</span>
              )}
            </div>
            <ChevronDown className={cn("ml-2 h-4 w-4 shrink-0 opacity-50 transition-transform", isOpen && "rotate-180")} />
          </div>
        )}

        {isOpen && (
          <div className="absolute bottom-full z-50 mb-1 left-0 w-max rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95">
            <div>
              {/* Available options */}
              {options.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Aucune option disponible
                </div>
              ) : (
                options.map((option) => {
                  const isSelected = value.includes(option.value);
                  return (
                    <div
                      key={option.value}
                      onClick={() => handleSelect(option.value)}
                      className={cn(
                        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                        "cursor-pointer hover:bg-accent hover:text-accent-foreground",
                        isSelected && "bg-accent text-accent-foreground"
                      )}
                    >
                      <div className="flex h-4 w-4 items-center justify-center mr-2">
                        {isSelected && <Check className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 text-left whitespace-nowrap">
                        <div>{option.label}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

MultiSelect.displayName = "MultiSelect";
