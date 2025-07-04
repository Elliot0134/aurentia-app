import React, { useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowUp, PenTool, FileText, Plus, Sparkles, Loader2 } from "lucide-react"; // Added PenTool, FileText, Plus, Sparkles, Loader2
import { MultiSelect } from "@/components/ui/multi-select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"; // Added Popover components

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
  onReformQuestion: (message: string) => Promise<void>; // New prop for reformulating question
  projectId: string; // New prop for project ID
  projectStatus: string; // New prop for project status
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
  onReformQuestion,
  projectId,
  projectStatus,
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
    <div className="w-full pb-safe px-2"> {/* Added px-4 for mobile padding, removed mx-4 */}
      <div className="w-full mx-auto bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-200 border border-gray-200"> {/* Removed md:w-[60vw], mx-auto, added w-full, added mx-auto */}
        
        {/* Zone de saisie avec bouton send */}
        <div className="relative px-4 pt-4 pb-2">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <textarea
                ref={textareaRef}
                placeholder={placeholder}
                value={inputMessage}
                onChange={onInputChange}
                onKeyDown={onKeyPress}
                className="w-full resize-none border-none bg-transparent focus:outline-none p-0 min-h-[40px] max-h-[80px] text-base sm:text-sm text-gray-900 placeholder-gray-500 overflow-y-auto"
                rows={1}
              />
            </div>
          </div>
        </div>

        {/* Zone de contrôles réorganisée */}
        <div className="px-3 pb-3 pt-2 sm:px-4 sm:pb-4 sm:pt-2">
          {/* Tous les selects alignés sur la même ligne en desktop */}
          <div className="grid grid-cols-1 gap-3">
            {/* Controls: Style, Deliverables, Search Modes, Send Button */}
            <div className="flex items-center gap-2"> {/* Re-added gap-2 for spacing between icon groups */}
              {/* Style de communication, Livrables, Modes de recherche */}
              <div className="flex items-center gap-2"> {/* This div now holds the three left-aligned icons */}
                {/* Style de communication */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9 bg-gray-100 border border-transparent hover:border-gray-700">
                      <PenTool className="h-5 w-5 text-gray-600" />
                      <span className="sr-only">Select communication style</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent side="top" align="start" className="w-auto p-0">
                    <Select value={communicationStyle} onValueChange={onCommunicationStyleChange}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="concis">Concis</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="explicatif">Explicatif</SelectItem>
                        <SelectItem value="détaillé">Détaillé</SelectItem>
                      </SelectContent>
                    </Select>
                  </PopoverContent>
                </Popover>
                
                {/* Livrables */}
                <MultiSelect
                  options={deliverableOptions}
                  value={selectedDeliverables}
                  onChange={onSelectedDeliverablesChange}
                  placeholder={deliverableNames.length === 0 ? "Aucun livrable disponible" : "Sélectionner..."}
                  disabled={deliverableNames.length === 0}
                  className="w-auto"
                  trigger={
                    <Button variant="ghost" size="icon" className="h-9 w-9 bg-gray-100 border border-transparent hover:border-gray-700">
                      <FileText className="h-5 w-5 text-gray-600" />
                      <span className="sr-only">Select deliverables</span>
                    </Button>
                  }
                />

                {/* Modes de recherche */}
                <MultiSelect
                  options={searchModeOptions.map(option => {
                    if (option.value === 'project_rag' && projectStatus === 'free') {
                      return {
                        ...option,
                        label: (
                          <>
                            {option.label}
                            <span className="text-xs text-red-500 block">Disponible au plan supérieur</span>
                          </>
                        ),
                        disabled: true // Disable the option if project is free
                      };
                    }
                    return option;
                  })}
                  value={selectedSearchModes}
                  onChange={onSelectedSearchModesChange}
                  placeholder="Sélectionner les modes..."
                  className="w-auto"
                  trigger={
                    <Button variant="ghost" size="icon" className="h-9 w-9 bg-gray-100 border border-transparent hover:border-gray-700">
                      <Plus className="h-5 w-5 text-gray-600" />
                      <span className="sr-only">Select search modes</span>
                    </Button>
                  }
                />
              </div>

              {/* Right-aligned buttons: Reformulate and Send */}
              <div className="flex items-center gap-2 ml-auto"> {/* ml-auto pushes this group to the right */}
                {/* Bouton de reformulation de question */}
                <Button
                  onClick={() => onReformQuestion(inputMessage)}
                  disabled={isInputEmpty || isLoading || isSubmitting}
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 bg-gray-100 border border-transparent hover:border-gray-700"
                >
                  {isLoading || isSubmitting ? (
                    <Loader2 className="h-5 w-5 text-gray-600 animate-spin" />
                  ) : (
                    <Sparkles className="h-5 w-5 text-gray-600" />
                  )}
                  <span className="sr-only">Reformuler la question</span>
                </Button>

                {/* Send Button */}
                <Button
                  onClick={onSendMessage}
                  disabled={isInputEmpty || isLoading || isSubmitting}
                  className="rounded-xl w-10 h-10 p-0 bg-gradient-primary hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex-shrink-0" // Removed ml-auto from here
                >
                  <ArrowUp size={18} className="text-white" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
