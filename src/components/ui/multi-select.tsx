import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MultiSelectOption {
  value: string;
  label: string | React.ReactNode;
  description?: string;
  disabled?: boolean; // Add disabled property
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  trigger?: React.ReactNode; // New prop for custom trigger
  onAddOption?: (newOption: MultiSelectOption) => void; // New prop for adding options
}

export const MultiSelect = React.forwardRef<HTMLDivElement, MultiSelectProps>(
  ({ options, value, onChange, placeholder = "Sélectionner...", disabled = false, className, trigger, onAddOption }, ref) => {
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
            <div className="flex flex-1 flex-wrap items-center gap-1 overflow-hidden">
              {selectedOptions.length === 0 ? (
                <span className="text-muted-foreground truncate">{placeholder}</span>
              ) : (
                selectedOptions.map((option) => (
                  <span
                    key={option.value}
                    className="flex items-center gap-1 rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700"
                  >
                    {option.label}
                    <X
                      className="h-3 w-3 cursor-pointer text-gray-500 hover:text-gray-800"
                      onClick={(e) => handleRemove(option.value, e)}
                    />
                  </span>
                ))
              )}
            </div>
            <ChevronDown className={cn("ml-2 h-4 w-4 shrink-0 opacity-50 transition-transform", isOpen && "rotate-180")} />
          </div>
        )}

        {isOpen && (
          <div className="absolute top-full z-[1001] mt-1 left-0 w-max min-w-[calc(100%+2px)] rounded-md border bg-popover p-1 text-popover-foreground shadow-lg animate-in fade-in-0 zoom-in-95">
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
                      onClick={() => !option.disabled && handleSelect(option.value)} // Disable click if option is disabled
                      className={cn(
                        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                        "cursor-pointer hover:bg-accent hover:text-accent-foreground",
                        isSelected && "bg-accent text-accent-foreground",
                        option.disabled && "opacity-50 cursor-not-allowed" // Add disabled styling
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
              <div className="p-1">
                <input
                  type="text"
                  placeholder="Ajouter un rôle..."
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim() !== '') {
                      const newRoleLabel = e.currentTarget.value.trim();
                      const newRoleValue = newRoleLabel.toLowerCase().replace(/\s/g, '_');
                      const newOption = { value: newRoleValue, label: newRoleLabel };
                      
                      if (!options.some(opt => opt.value === newOption.value)) {
                        onAddOption?.(newOption); // Call the new prop to add the option
                      }
                      handleSelect(newOption.value); // Select the new/existing option
                      e.currentTarget.value = ''; // Clear input
                    }
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

MultiSelect.displayName = "MultiSelect";
