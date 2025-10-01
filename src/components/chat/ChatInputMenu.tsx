import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ChevronLeft, Check, FileText, Link, Settings2, Globe, Brain } from 'lucide-react';
import ComingSoonDialog from '@/components/ui/ComingSoonDialog';
import { Switch } from '@/components/ui/switch';

export type CommunicationStyle = 'réflexion approfondie' | 'concis' | 'normal' | 'explicatif' | 'détaillé';

interface ChatInputMenuProps {
  onStyleChange?: (style: CommunicationStyle) => void;
  onAddFile?: () => void;
  onConnectApp?: () => void;
  selectedStyle: CommunicationStyle;
}

export type SearchMode = 'deep_thinking' | 'web_search';

interface SearchModeMenuProps {
  onSearchModeChange?: (modes: string[]) => void;
  selectedModes: string[];
}

type MenuView = 'main' | 'styles';

export const ChatInputMenu = ({
  onStyleChange,
  onAddFile,
  onConnectApp,
  selectedStyle
}: ChatInputMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState<MenuView>('main');
  const [isComingSoonOpen, setIsComingSoonOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const styles = [
    { id: 'réflexion approfondie' as const, label: 'Réflexion approfondie', icon: '🤔' },
    { id: 'concis' as const, label: 'Concis', icon: '💬' },
    { id: 'normal' as const, label: 'Normal', icon: '👤' },
    { id: 'explicatif' as const, label: 'Explicatif', icon: '📚' },
    { id: 'détaillé' as const, label: 'Détaillé', icon: '📋' },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setTimeout(() => setCurrentView('main'), 200);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleStyleSelect = (styleId: CommunicationStyle) => {
    onStyleChange?.(styleId);
    setIsOpen(false);
    setTimeout(() => setCurrentView('main'), 200);
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
    <div className="relative" ref={menuRef}>
      {/* Bouton Plus */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 rounded-xl border border-gray-200 bg-white hover:bg-gray-50
                   flex items-center justify-center transition-all duration-150"
        aria-label="Options"
      >
        <Plus
          className={`w-[18px] h-[18px] text-gray-600 transition-transform duration-200
                     ${isOpen ? 'rotate-45' : 'rotate-0'}`}
        />
      </button>

      {/* Menu Popover */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop invisible */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => {
                setIsOpen(false);
                setTimeout(() => setCurrentView('main'), 200);
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
              className="absolute bottom-9 left-0 z-50 w-[280px] bg-white
                         rounded-xl border border-gray-200 overflow-hidden"
            >
              {/* Container avec hauteur fixe pour les transitions */}
              <div className="relative overflow-hidden">
                <AnimatePresence initial={false} custom={currentView === 'styles' ? 1 : -1} mode="wait">
                  {currentView === 'main' ? (
                    <motion.div
                      key="main"
                      custom={-1}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                      className="w-full py-1"
                    >
                      {/* Ajouter un fichier */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsComingSoonOpen(true);
                          setIsOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50
                                   transition-colors duration-100 text-left"
                      >
                        <FileText className="w-[18px] h-[18px] text-gray-600" />
                        <span className="flex-1 text-[13px] text-gray-700">
                          Ajouter un fichier
                        </span>
                      </button>

                      {/* Style de communication */}
                      <button
                        type="button"
                        onClick={() => setCurrentView('styles')}
                        className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50
                                   transition-colors duration-100 text-left"
                      >
                        <span className="text-[18px] leading-none">💬</span>
                        <span className="flex-1 text-[13px] text-gray-700">
                          Style de communication
                        </span>
                        <span className="text-[11px] text-gray-500">
                          {styles.find(s => s.id === selectedStyle)?.label}
                        </span>
                      </button>

                      {/* Connecter une application */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsComingSoonOpen(true);
                          setIsOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50
                                   transition-colors duration-100 text-left"
                      >
                        <Link className="w-[18px] h-[18px] text-gray-600" />
                        <span className="flex-1 text-[13px] text-gray-700">
                          Connecter une application
                        </span>
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="styles"
                      custom={1}
                      variants={slideVariants}
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
                            onClick={() => handleStyleSelect(style.id)}
                            className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50
                                       transition-colors duration-100 text-left"
                          >
                            <span className="text-[16px] leading-none">{style.icon}</span>
                            <span className="flex-1 text-[13px] text-gray-700">
                              {style.label}
                            </span>
                            {selectedStyle === style.id && (
                              <Check className="w-[14px] h-[14px] text-blue-600" strokeWidth={2.5} />
                            )}
                          </button>
                        ))}
                      </div>

                      {/* Bouton retour en bas */}
                      <button
                        type="button"
                        onClick={() => setCurrentView('main')}
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
      </AnimatePresence>

      {/* Coming Soon Dialog */}
      <ComingSoonDialog
        isOpen={isComingSoonOpen}
        onClose={() => setIsComingSoonOpen(false)}
        description="Fonctionnalité bientôt disponible !"
      />
    </div>
  );
};

export const SearchModeMenu = ({
  onSearchModeChange,
  selectedModes
}: SearchModeMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const searchModes = [
    {
      id: 'web_search' as const,
      label: 'Recherche web',
      icon: Globe
    },
    {
      id: 'deep_thinking' as const,
      label: 'Mode réflexion',
      icon: Brain
    }
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSearchModeToggle = (modeId: SearchMode) => {
    const newModes = selectedModes.includes(modeId)
      ? selectedModes.filter(m => m !== modeId)
      : [...selectedModes, modeId];
    onSearchModeChange?.(newModes);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 rounded-xl border border-gray-200 bg-white hover:bg-gray-50
                   flex items-center justify-center transition-all duration-150"
        aria-label="Modes de recherche"
      >
        <Settings2 className="w-[18px] h-[18px] text-gray-600" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{
                duration: 0.15,
                ease: [0.4, 0, 0.2, 1]
              }}
              className="absolute bottom-9 left-0 z-50 w-[280px] bg-white
                         rounded-xl border border-gray-200 overflow-hidden"
            >
              <div className="py-1">
                {searchModes.map((mode) => {
                  const IconComponent = mode.icon;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => handleSearchModeToggle(mode.id)}
                      className="w-full flex items-center gap-1.5 px-2 py-2 hover:bg-gray-50
                                 transition-colors duration-100 text-left"
                    >
                      <IconComponent className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span className="flex-1 text-[13px] text-gray-700 font-medium">
                        {mode.label}
                      </span>
                      <Switch
                        checked={selectedModes.includes(mode.id)}
                        onCheckedChange={() => handleSearchModeToggle(mode.id)}
                        className="scale-75"
                      />
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
