import React, { useRef, useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowUp, FileText, Plus, Sparkles, Loader2, X, PencilLine } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import { Switch } from '@/components/ui/switch';
import { Check, ChevronLeft } from 'lucide-react';
import { MultiSelect } from "@/components/ui/multi-select";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChatInputMenu, SearchModeMenu } from "./ChatInputMenu";
import ComingSoonDialog from '@/components/ui/ComingSoonDialog';

interface DeliverableOption {
  value: string;
  label: string;
  description: string;
}

interface SearchModeOption {
  value: string;
  label: string | JSX.Element;
  description: string;
  disabled?: boolean;
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
  onReformQuestion: (message: string) => Promise<void>;
  projectId: string;
  projectStatus: string;
  isMobileChatOptionsOpen?: boolean;
  setIsMobileChatOptionsOpen?: (open: boolean) => void;
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
  isMobileChatOptionsOpen = false,
  setIsMobileChatOptionsOpen,
}) => {
  const [isComingSoonOpen, setIsComingSoonOpen] = useState(false);
  const [currentMobileView, setCurrentMobileView] = useState<'main' | 'styles'>('main');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useIsMobile();

  const styles = [
    { id: 'réflexion approfondie' as const, label: 'Réflexion approfondie', icon: '🤔' },
    { id: 'concis' as const, label: 'Concis', icon: '💬' },
    { id: 'normal' as const, label: 'Normal', icon: '👤' },
    { id: 'explicatif' as const, label: 'Explicatif', icon: '📚' },
    { id: 'détaillé' as const, label: 'Détaillé', icon: '📋' },
  ];

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      // For mobile, allow expansion to almost the navbar (estimative calculation: navbar height + margin)
      // For desktop, allow expansion to about 15 lines (approximately 360px)
      const maxHeight = isMobile ? Math.max(window.innerHeight - 180, 300) : 360; // 15 lines approx
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, maxHeight) + 'px';
    }
  }, [inputMessage, isMobile]);

  const isInputEmpty = inputMessage.trim() === '';

  return (
    <div className="w-full pb-safe px-2">
      <div className="w-full mx-auto bg-[var(--bg-card-static)] border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
           style={{
             transitionDuration: 'var(--transition-base)',
             transitionTimingFunction: 'var(--ease-default)'
           }}>
        <div className="relative p-2">
          {isMobile ? (
            <div className="flex items-end gap-2">
              <div className="flex-shrink-0 self-end mb-1">
                <button
                  type="button"
                  onClick={() => setIsMobileChatOptionsOpen?.(!isMobileChatOptionsOpen)}
                  className="w-8 h-8 rounded-xl border border-[var(--border-default)] bg-[var(--bg-card-static)] hover:bg-[var(--btn-secondary-bg-hover)]
                             flex items-center justify-center transition-all"
                  style={{ transitionDuration: 'var(--transition-fast)' }}
                  aria-label="Options de chat"
                >
                  <Plus
                    className={`w-[18px] h-[18px] text-[var(--text-muted)] transition-transform`}
                    style={{
                      transitionDuration: 'var(--transition-base)',
                      transform: isMobileChatOptionsOpen ? 'rotate(45deg)' : 'rotate(0deg)'
                    }}
                  />
                </button>
              </div>
              <div className="flex-1 flex items-center">
                <textarea
                  ref={textareaRef}
                  placeholder={placeholder}
                  value={inputMessage}
                  onChange={onInputChange}
                  onKeyDown={onKeyPress}
                  className="w-full resize-none border-none bg-transparent focus:outline-none p-0 text-base text-[var(--text-primary)] placeholder-[var(--input-placeholder)]"
                  style={{
                    minHeight: '32px',
                    lineHeight: 'var(--text-base-line-height)',
                    transition: 'height var(--transition-base) var(--ease-out)'
                  }}
                  rows={1}
                  aria-label="Message à envoyer"
                />
              </div>
              <div className="flex items-end gap-2 flex-shrink-0 self-end mb-1">
                <Button
                  onClick={() => onReformQuestion(inputMessage)}
                  disabled={isInputEmpty || isLoading || isSubmitting}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-xl bg-[var(--bg-card-static)] hover:bg-[var(--btn-secondary-bg-hover)] transition-all"
                  style={{
                    transitionDuration: 'var(--transition-fast)',
                    opacity: isInputEmpty || isLoading || isSubmitting ? 'var(--btn-disabled-opacity)' : '1'
                  }}
                  aria-label="Reformuler la question avec IA"
                >
                  {isLoading || isSubmitting ? (
                    <Loader2 className="h-5 w-5 text-[var(--btn-primary-bg)]" style={{ animation: 'spin 600ms linear infinite' }} />
                  ) : (
                    <Sparkles className="h-5 w-5 text-[var(--btn-primary-bg)]" />
                  )}
                  <span className="sr-only">Reformuler la question</span>
                </Button>
                <Button
                  onClick={onSendMessage}
                  disabled={isInputEmpty || isLoading || isSubmitting}
                  className="rounded-xl w-8 h-8 p-0 bg-gradient-primary hover:from-blue-600 hover:to-purple-700 transition-all"
                  style={{
                    transitionDuration: 'var(--transition-fast)',
                    opacity: isInputEmpty || isLoading || isSubmitting ? 'var(--btn-disabled-opacity)' : '1',
                    cursor: isInputEmpty || isLoading || isSubmitting ? 'not-allowed' : 'pointer'
                  }}
                  aria-label="Envoyer le message"
                >
                  <ArrowUp size={16} className="text-white" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <textarea
                  ref={textareaRef}
                  placeholder={placeholder}
                  value={inputMessage}
                  onChange={onInputChange}
                  onKeyDown={onKeyPress}
                  className="w-full resize-none border-none bg-transparent focus:outline-none p-0 pl-2 min-h-[40px] max-h-[360px] text-base text-[var(--text-primary)] placeholder-[var(--input-placeholder)] overflow-y-auto"
                  style={{
                    lineHeight: 'var(--text-base-line-height)',
                    transition: 'height var(--transition-base) var(--ease-out)'
                  }}
                  rows={1}
                  aria-label="Message à envoyer"
                />
              </div>
            </div>
          )}
        </div>
        {!isMobile && (
          <div className="px-3 pb-1 pt-1 sm:px-4 sm:pb-2 sm:pt-1">
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <ChatInputMenu
                    selectedStyle={communicationStyle as 'réflexion approfondie' | 'concis' | 'normal' | 'explicatif' | 'détaillé'}
                    onStyleChange={onCommunicationStyleChange}
                  />
                  <SearchModeMenu
                    selectedModes={selectedSearchModes}
                    onSearchModeChange={onSelectedSearchModesChange}
                  />
                  {communicationStyle !== 'normal' && (
                    <button
                      onClick={() => onCommunicationStyleChange('normal')}
                      className="h-8 px-2 rounded-xl border-gray-300 bg-gray-50
                                 flex items-center transition-all duration-200
                                 text-xs font-medium text-gray-700 cursor-pointer
                                 hover:bg-gray-100 group relative"
                    >
                      <PencilLine className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span className="group-hover:mr-1 transition-all duration-200">
                        {styles.find(s => s.id === communicationStyle)?.label || communicationStyle}
                      </span>
                      <X className="absolute right-1 w-3 h-3 opacity-0 group-hover:opacity-100
                                   transition-all duration-200 group-hover:relative group-hover:right-0 flex-shrink-0" />
                    </button>
                  )}
                  {selectedSearchModes.map((mode) => {
                    if (mode === 'deep_thinking') {
                      return (
                        <button
                          key={mode}
                          onClick={() => onSelectedSearchModesChange(selectedSearchModes.filter(m => m !== 'deep_thinking'))}
                          className="h-8 px-2 rounded-xl border-[#FFBDA4] bg-[#FEF2ED]
                                     flex items-center transition-all duration-200
                                     text-xs font-medium text-[#FF5932] cursor-pointer
                                     hover:px-3 group relative overflow-hidden"
                        >
                          🧠
                          <span className="transition-all duration-200 group-hover:mr-1 ml-1">Mode réflexion</span>
                          <X className="absolute right-1 w-3 h-3 opacity-0 group-hover:opacity-100
                                       transition-all duration-200 group-hover:relative group-hover:right-0 flex-shrink-0" />
                        </button>
                      );
                    } else if (mode === 'web_search') {
                      return (
                        <button
                          key={mode}
                          onClick={() => onSelectedSearchModesChange(selectedSearchModes.filter(m => m !== 'web_search'))}
                          className="h-8 px-2 rounded-xl border-[#FFBDA4] bg-[#FEF2ED]
                                     flex items-center transition-all duration-200
                                     text-xs font-medium text-[#FF5932] cursor-pointer
                                     hover:px-3 group relative overflow-hidden"
                        >
                          🌐
                          <span className="transition-all duration-200 group-hover:mr-1 ml-1">Recherche web</span>
                          <X className="absolute right-1 w-3 h-3 opacity-0 group-hover:opacity-100
                                       transition-all duration-200 group-hover:relative group-hover:right-0 flex-shrink-0" />
                        </button>
                      );
                    }
                    return null;
                  })}
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <Button
                    onClick={() => onReformQuestion(inputMessage)}
                    disabled={isInputEmpty || isLoading || isSubmitting}
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 rounded-xl border border-[var(--border-default)] bg-[var(--bg-card-static)] hover:bg-[var(--btn-secondary-bg-hover)]
                               flex items-center justify-center transition-all"
                    style={{
                      transitionDuration: 'var(--transition-fast)',
                      opacity: isInputEmpty || isLoading || isSubmitting ? 'var(--btn-disabled-opacity)' : '1'
                    }}
                    aria-label="Reformuler la question avec IA"
                  >
                    {isLoading || isSubmitting ? (
                      <Loader2 className="w-[18px] h-[18px] text-[var(--btn-primary-bg)]" style={{ animation: 'spin 600ms linear infinite' }} />
                    ) : (
                      <Sparkles className="w-[18px] h-[18px] text-[var(--btn-primary-bg)]" />
                    )}
                    <span className="sr-only">Reformuler la question</span>
                  </Button>
                  <Button
                    onClick={onSendMessage}
                    disabled={isInputEmpty || isLoading || isSubmitting}
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 rounded-xl border border-transparent bg-gradient-primary hover:from-blue-600 hover:to-purple-700 flex items-center justify-center transition-all flex-shrink-0"
                    style={{
                      transitionDuration: 'var(--transition-fast)',
                      opacity: isInputEmpty || isLoading || isSubmitting ? 'var(--btn-disabled-opacity)' : '1',
                      cursor: isInputEmpty || isLoading || isSubmitting ? 'not-allowed' : 'pointer'
                    }}
                    aria-label="Envoyer le message"
                  >
                    <ArrowUp className="w-[18px] h-[18px] text-white" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Coming Soon Dialog */}
        <ComingSoonDialog
          isOpen={isComingSoonOpen}
          onClose={() => setIsComingSoonOpen(false)}
          description="Fonctionnalité bientôt disponible !"
        />

        {/* Mobile Chat Options Menu - Exact Desktop Design Copy */}
        {isMobile && (
          <div className="relative">
            {isMobileChatOptionsOpen && (
              <>
                {/* Backdrop - closes popup when clicking anywhere */}
                <div
                  className="fixed inset-0 z-39"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsMobileChatOptionsOpen?.(false)
                    setCurrentMobileView('main')
                  }}
                />

                {/* Menu */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 8 }}
                  transition={{
                    duration: 0.15,
                    ease: [0.4, 0, 0.2, 1]
                  }}
                className="fixed bottom-[60px] left-[20px] md:left-[calc(50vw-30vw)] z-50 w-[280px] bg-white
                         rounded-xl border border-gray-200 overflow-hidden"
                >
                  {/* Container avec hauteur fixe pour les transitions */}
                  <div className="relative overflow-hidden">
                    <AnimatePresence initial={false} custom={currentMobileView === 'styles' ? 1 : -1} mode="wait">
                      {currentMobileView === 'main' ? (
                        <motion.div
                          key="main"
                          custom={-1}
                          variants={{
                            enter: (direction: number) => ({
                              x: direction > 0 ? '100%' : '-100%',
                              opacity: 0,
                            }),
                            center: {
                              x: 0,
                              opacity: 1,
                            },
                            exit: (direction: number) => ({
                              x: direction > 0 ? '-100%' : '100%',
                              opacity: 0,
                            }),
                          }}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                          className="w-full py-1"
                        >
                          {/* Style de communication */}
                          <button
                            type="button"
                            onClick={() => setCurrentMobileView('styles')}
                            className="w-full flex items-center justify-center gap-3 px-2 py-2 hover:bg-gray-50
                                       transition-colors duration-100"
                          >
                            <span className="w-6 h-6 flex items-center justify-center text-[20px] leading-none
                                           text-center flex-shrink-0">💬</span>
                            <span className="flex-1 text-[13px] text-gray-700 font-medium text-left">
                              Style de communication
                            </span>
                            <span className="text-[11px] text-gray-500 flex-shrink-0">
                              {styles.find(s => s.id === communicationStyle)?.label}
                            </span>
                          </button>

                          {/* Mode réflexion toggle */}
                          <div className="flex items-center justify-center gap-3 px-2 py-2 hover:bg-gray-50
                                         transition-colors duration-100">
                            <span className="w-6 h-6 flex items-center justify-center text-[20px] leading-none
                                           text-center flex-shrink-0">🧠</span>
                            <span className="flex-1 text-[13px] text-gray-700 font-medium">
                              Mode réflexion
                            </span>
                            <Switch
                              checked={selectedSearchModes.includes('deep_thinking')}
                              onCheckedChange={(checked) => {
                                const newModes = checked
                                  ? [...selectedSearchModes, 'deep_thinking']
                                  : selectedSearchModes.filter(m => m !== 'deep_thinking');
                                onSelectedSearchModesChange(newModes);
                              }}
                              className="scale-75 flex-shrink-0"
                            />
                          </div>

                          {/* Recherche web toggle */}
                          <div className="flex items-center justify-center gap-3 px-2 py-2 hover:bg-gray-50
                                         transition-colors duration-100">
                            <span className="w-6 h-6 flex items-center justify-center text-[20px] leading-none
                                           text-center flex-shrink-0">🌐</span>
                            <span className="flex-1 text-[13px] text-gray-700 font-medium">
                              Recherche web
                            </span>
                            <Switch
                              checked={selectedSearchModes.includes('web_search')}
                              onCheckedChange={(checked) => {
                                const newModes = checked
                                  ? [...selectedSearchModes, 'web_search']
                                  : selectedSearchModes.filter(m => m !== 'web_search');
                                onSelectedSearchModesChange(newModes);
                              }}
                              className="scale-75 flex-shrink-0"
                            />
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="styles"
                          custom={1}
                          variants={{
                            enter: (direction: number) => ({
                              x: direction > 0 ? '100%' : '-100%',
                              opacity: 0,
                            }),
                            center: {
                              x: 0,
                              opacity: 1,
                            },
                            exit: (direction: number) => ({
                              x: direction > 0 ? '-100%' : '100%',
                              opacity: 0,
                            }),
                          }}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                          className="w-full"
                        >
                          {/* Liste des styles */}
                          <div className="py-1">
                            {styles.map((style) => (
                              <button
                                key={style.id}
                                type="button"
                                onClick={() => {
                                  onCommunicationStyleChange(style.id);
                                  setCurrentMobileView('main');
                                }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50
                                           transition-colors duration-100 text-left"
                              >
                                <span className="text-[16px] leading-none">{style.icon}</span>
                                <span className="flex-1 text-[13px] text-gray-700">
                                  {style.label}
                                </span>
                                {communicationStyle === style.id && (
                                  <Check className="w-[14px] h-[14px] text-blue-600" strokeWidth={2.5} />
                                )}
                              </button>
                            ))}
                          </div>

                          {/* Bouton retour en bas */}
                          <button
                            type="button"
                            onClick={() => setCurrentMobileView('main')}
                            className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50
                                       transition-colors duration-100 text-left border-t border-gray-100"
                          >
                            <ChevronLeft className="w-4 h-4 text-gray-500" />
                            <span className="text-[13px] text-gray-700">
                              Retour
                            </span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
