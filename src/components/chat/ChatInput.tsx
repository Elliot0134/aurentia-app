import React, { useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowUp } from "lucide-react";
import { MultiSelect } from "@/components/ui/multi-select";

interface DeliverableOption {
  value: string;
  label: string;
  description: string;
}

interface SearchModeOption {
  value: string;
  label: string;
  description: string;
}

interface ChatInputProps {
  inputMessage: string;
  placeholder: string;
  isLoading: boolean;
  isSubmitting: boolean;
  communicationStyle: string;
  selectedDeliverables: string[];
  selectedSearchModes: string[];
  deliverableOptions: DeliverableOption[];
  searchModeOptions: SearchModeOption[];
  deliverableNames: string[];
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  onSendMessage: () => void;
  onCommunicationStyleChange: (value: string) => void;
  onSelectedDeliverablesChange: (value: string[]) => void;
  onSelectedSearchModesChange: (value: string[]) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  inputMessage,
  placeholder,
  isLoading,
  isSubmitting,
  communicationStyle,
  selectedDeliverables,
  selectedSearchModes,
  deliverableOptions,
  searchModeOptions,
  deliverableNames,
  onInputChange,
  onKeyPress,
  onSendMessage,
  onCommunicationStyleChange,
  onSelectedDeliverablesChange,
  onSelectedSearchModesChange,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 80) + 'px';
    }
  }, [inputMessage]);

  const isInputEmpty = inputMessage.trim() === '';

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4 w-full">
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-200 border border-gray-200 w-full">
        
        {/* Zone de saisie avec bouton send */}
        <div className="relative p-4 border-b border-gray-100">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <textarea
                ref={textareaRef}
                placeholder={placeholder}
                value={inputMessage}
                onChange={onInputChange}
                onKeyDown={onKeyPress}
                className="w-full resize-none border-none bg-transparent focus:outline-none p-0 min-h-[40px] max-h-[80px] text-gray-900 placeholder-gray-500 overflow-y-auto"
                rows={1}
              />
            </div>
            <Button
              onClick={onSendMessage}
              disabled={isInputEmpty || isLoading || isSubmitting}
              className="rounded-xl w-10 h-10 p-0 bg-gradient-primary hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex-shrink-0 self-end"
            >
              <ArrowUp size={18} className="text-white" />
            </Button>
          </div>
        </div>

        {/* Zone de contrôles réorganisée */}
        <div className="p-3 sm:p-4">
          {/* Tous les selects alignés sur la même ligne en desktop */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            
            {/* Style de communication */}
            <div className="flex items-center gap-2">
              <Label className="text-sm text-gray-600 whitespace-nowrap min-w-fit">Style:</Label>
              <Select value={communicationStyle} onValueChange={onCommunicationStyleChange}>
                <SelectTrigger className="flex-1 h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="concis">Concis</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="explicatif">Explicatif</SelectItem>
                  <SelectItem value="détaillé">Détaillé</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Livrables */}
            <div className="flex items-center gap-2">
              <Label className="text-sm text-gray-600 whitespace-nowrap min-w-fit">
                Livrables ({deliverableNames.length}):
              </Label>
              <MultiSelect
                options={deliverableOptions}
                value={selectedDeliverables}
                onChange={onSelectedDeliverablesChange}
                placeholder={deliverableNames.length === 0 ? "Aucun livrable disponible" : "Sélectionner..."}
                disabled={deliverableNames.length === 0}
                className="flex-1"
              />
            </div>
            
            {/* Modes de recherche */}
            <div className="flex items-center gap-2">
              <Label className="text-sm text-gray-600 whitespace-nowrap min-w-fit">
                Modes:
              </Label>
              <MultiSelect
                options={searchModeOptions}
                value={selectedSearchModes}
                onChange={onSelectedSearchModesChange}
                placeholder="Sélectionner les modes..."
                className="flex-1"
              />
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}; 