import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Check, FileText, Link, Globe, Brain, X } from 'lucide-react';
import ComingSoonDialog from '@/components/ui/ComingSoonDialog';
import { Switch } from '@/components/ui/switch';

export type CommunicationStyle = 'réflexion approfondie' | 'concis' | 'normal' | 'explicatif' | 'détaillé';
export type SearchMode = 'deep_thinking' | 'web_search';

type MenuView = 'main' | 'styles' | 'search-modes';

interface MobileChatOptionsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStyle: CommunicationStyle;
  selectedSearchModes: string[];
  onStyleChange: (style: CommunicationStyle) => void;
  onSearchModeChange: (modes: string[]) => void;
}

export const MobileChatOptionsMenu = ({
  isOpen,
  onClose,
  selectedStyle,
  selectedSearchModes,
  onStyleChange,
  onSearchModeChange,
}: MobileChatOptionsMenuProps) => {
  const [currentView, setCurrentView] = useState<MenuView>('main');
  const [isComingSoonOpen, setIsComingSoonOpen] = useState(false);

  const styles = [
    { id: 'réflexion approfondie' as const, label: 'Réflexion approfondie', icon: '🤔' },
    { id: 'concis' as const, label: 'Concis', icon: '💬' },
    { id: 'normal' as const, label: 'Normal', icon: '👤' },
    { id: 'explicatif' as const, label: 'Explicatif', icon: '📚' },
    { id: 'détaillé' as const, label: 'Détaillé', icon: '📋' },
  ];

  const searchModes = [
    {
      id: 'web_search' as const,
      label: 'Recherche web',
      icon: Globe,
      description: 'Rechercher sur le web pour des informations à jour'
    },
    {
      id: 'deep_thinking' as const,
      label: 'Mode réflexion',
      icon: Brain,
      description: 'Analyse approfondie avec raisonnement détaillé'
    }
  ];

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => setCurrentView('main'), 300);
    }
  }, [isOpen]);

  const handleStyleSelect = (styleId: CommunicationStyle) => {
    onStyleChange(styleId);
    setCurrentView('main');
    setTimeout(() => onClose(), 150);
  };

  const handleSearchModeToggle = (modeId: SearchMode) => {
    const newModes = selectedSearchModes.includes(modeId)
      ? selectedSearchModes.filter(m => m !== modeId)
      : [...selectedSearchModes, modeId];
    onSearchModeChange(newModes);
  };

  const slideVariants = {
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
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={onClose}
            />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{
                type: 'spring',
                damping: 30,
                stiffness: 300,
              }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[80vh] overflow-hidden"
            >
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
              </div>

              <div className="flex items-center justify-between px-4 pb-3 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">
                  {currentView === 'main' && 'Options de chat'}
                  {currentView === 'styles' && 'Style de communication'}
                  {currentView === 'search-modes' && 'Modes de recherche'}
                </h3>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="relative overflow-hidden">
                <AnimatePresence initial={false} custom={currentView === 'styles' || currentView === 'search-modes' ? 1 : -1} mode="wait">
                  {currentView === 'main' ? (
                    <motion.div
                      key="main"
                      custom={-1}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                      className="w-full py-2 px-2 max-h-[calc(80vh-120px)] overflow-y-auto"
                    >
                      <button
                        onClick={() => setCurrentView('styles')}
                        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50
                                   rounded-xl transition-colors duration-100 text-left"
                      >
                        <span className="text-2xl leading-none">💬</span>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            Style de communication
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {styles.find(s => s.id === selectedStyle)?.label}
                          </div>
                        </div>
                        <ChevronLeft className="w-5 h-5 text-gray-400 rotate-180" />
                      </button>

                      <button
                        onClick={() => setCurrentView('search-modes')}
                        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50
                                   rounded-xl transition-colors duration-100 text-left mt-1"
                      >
                        <div className="w-6 h-6 flex items-center justify-center">
                          {selectedSearchModes.length > 0 ? (
                            <div className="relative">
                              <Brain className="w-5 h-5 text-orange-500" />
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border-2 border-white" />
                            </div>
                          ) : (
                            <Brain className="w-5 h-5 text-gray-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            Modes de recherche
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {selectedSearchModes.length > 0
                              ? `${selectedSearchModes.length} mode(s) actif(s)`
                              : 'Aucun mode actif'}
                          </div>
                        </div>
                        <ChevronLeft className="w-5 h-5 text-gray-400 rotate-180" />
                      </button>

                      <div className="my-2 border-t border-gray-100" />

                      <button
                        onClick={() => {
                          setIsComingSoonOpen(true);
                          onClose();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50
                                   rounded-xl transition-colors duration-100 text-left"
                      >
                        <FileText className="w-5 h-5 text-gray-600" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            Ajouter un fichier
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            Joindre des documents
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setIsComingSoonOpen(true);
                          onClose();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50
                                   rounded-xl transition-colors duration-100 text-left mt-1"
                      >
                        <Link className="w-5 h-5 text-gray-600" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            Connecter une application
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            Intégrations disponibles
                          </div>
                        </div>
                      </button>
                    </motion.div>
                  ) : currentView === 'styles' ? (
                    <motion.div
                      key="styles"
                      custom={1}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                      className="w-full max-h-[calc(80vh-120px)] overflow-y-auto"
                    >
                      <div className="py-2 px-2">
                        {styles.map((style) => (
                          <button
                            key={style.id}
                            onClick={() => handleStyleSelect(style.id)}
                            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50
                                       rounded-xl transition-colors duration-100 text-left"
                          >
                            <span className="text-xl leading-none">{style.icon}</span>
                            <span className="flex-1 text-sm font-medium text-gray-900">
                              {style.label}
                            </span>
                            {selectedStyle === style.id && (
                              <Check className="w-5 h-5 text-blue-600" strokeWidth={2.5} />
                            )}
                          </button>
                        ))}
                      </div>

                      <div className="border-t border-gray-100 mt-2">
                        <button
                          onClick={() => setCurrentView('main')}
                          className="w-full flex items-center gap-2.5 px-4 py-3.5 hover:bg-gray-50
                                     transition-colors duration-100 text-left"
                        >
                          <ChevronLeft className="w-5 h-5 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">
                            Retour
                          </span>
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="search-modes"
                      custom={1}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                      className="w-full max-h-[calc(80vh-120px)] overflow-y-auto"
                    >
                      <div className="py-2 px-2">
                        {searchModes.map((mode) => {
                          const IconComponent = mode.icon;
                          const isActive = selectedSearchModes.includes(mode.id);
                          
                          return (
                            <button
                              key={mode.id}
                              onClick={() => handleSearchModeToggle(mode.id)}
                              className="w-full flex items-start gap-3 px-4 py-3.5 hover:bg-gray-50
                                         rounded-xl transition-colors duration-100 text-left"
                            >
                              <IconComponent className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                                isActive ? 'text-orange-500' : 'text-gray-500'
                              }`} />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900">
                                  {mode.label}
                                </div>
                                <div className="text-xs text-gray-500 mt-0.5">
                                  {mode.description}
                                </div>
                              </div>
                              <Switch
                                checked={isActive}
                                onCheckedChange={() => handleSearchModeToggle(mode.id)}
                                className="mt-0.5 flex-shrink-0"
                              />
                            </button>
                          );
                        })}
                      </div>

                      <div className="border-t border-gray-100 mt-2">
                        <button
                          onClick={() => setCurrentView('main')}
                          className="w-full flex items-center gap-2.5 px-4 py-3.5 hover:bg-gray-50
                                     transition-colors duration-100 text-left"
                        >
                          <ChevronLeft className="w-5 h-5 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">
                            Retour
                          </span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ComingSoonDialog
        isOpen={isComingSoonOpen}
        onClose={() => setIsComingSoonOpen(false)}
        description="Fonctionnalité bientôt disponible !"
      />
    </>
  );
};