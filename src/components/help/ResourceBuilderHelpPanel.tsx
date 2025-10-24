import React, { useState, useMemo, useEffect } from 'react';
import { X, Search, BookOpen, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HELP_SECTIONS } from './HelpContent';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ResourceBuilderHelpPanelProps {
  /**
   * Contrôle l'affichage du panneau
   */
  isOpen: boolean;

  /**
   * Callback pour fermer le panneau
   */
  onClose: () => void;

  /**
   * Callback pour démarrer le tour interactif
   */
  onStartTour?: () => void;
}

/**
 * Panneau d'aide coulissant avec documentation complète et recherche
 */
export function ResourceBuilderHelpPanel({
  isOpen,
  onClose,
  onStartTour,
}: ResourceBuilderHelpPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<string[]>(['getting-started']);

  // Filtrer les sections selon la recherche
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) {
      return HELP_SECTIONS;
    }

    const query = searchQuery.toLowerCase();

    return HELP_SECTIONS.filter(section => {
      // Recherche dans le titre
      if (section.title.toLowerCase().includes(query)) {
        return true;
      }

      // Recherche dans les mots-clés
      if (section.keywords.some(keyword => keyword.toLowerCase().includes(query))) {
        return true;
      }

      return false;
    });
  }, [searchQuery]);

  // Auto-expand toutes les sections si recherche active
  useEffect(() => {
    if (searchQuery.trim()) {
      setExpandedSections(filteredSections.map(s => s.id));
    } else {
      setExpandedSections(['getting-started']);
    }
  }, [searchQuery, filteredSections]);

  // Gérer le raccourci clavier Ctrl/Cmd + Shift + H
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'H') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[100]"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[600px] bg-white shadow-2xl z-[101] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b text-white" style={{
              background: 'linear-gradient(to right, var(--color-primary, #ff5932), var(--color-primary, #ff5932))',
              backgroundImage: 'linear-gradient(to right, var(--color-primary, #ff5932), color-mix(in srgb, var(--color-primary, #ff5932) 80%, black))'
            }}>
              <div className="flex items-center gap-3">
                <BookOpen className="w-6 h-6" />
                <div>
                  <h2 className="text-xl font-bold">Centre d'Aide</h2>
                  <p className="text-xs text-white/90">Documentation complète du créateur de ressources</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b bg-gray-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Rechercher dans l'aide..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Start Tour Button */}
              {onStartTour && (
                <Button
                  onClick={() => {
                    onStartTour();
                    onClose();
                  }}
                  className="w-full mt-3 text-white hover:opacity-90"
                  size="sm"
                  style={{ backgroundColor: 'var(--color-primary, #ff5932)' }}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Lancer le tour interactif
                </Button>
              )}
            </div>

            {/* Content */}
            <ScrollArea className="flex-1">
              <div className="p-4">
                {filteredSections.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Aucun résultat trouvé</p>
                    <p className="text-sm mt-2">
                      Essayez d'autres mots-clés ou parcourez les sections ci-dessous
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSearchQuery('')}
                      className="mt-4"
                    >
                      Effacer la recherche
                    </Button>
                  </div>
                ) : (
                  <Accordion
                    type="multiple"
                    value={expandedSections}
                    onValueChange={setExpandedSections}
                  >
                    {filteredSections.map((section) => {
                      const Icon = section.icon;
                      return (
                        <AccordionItem key={section.id} value={section.id} className="border rounded-lg mb-3">
                          <AccordionTrigger className="px-4 hover:no-underline hover:bg-gray-50 rounded-t-lg">
                            <div className="flex items-center gap-3 text-left">
                              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                                   style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary, #ff5932) 10%, white)' }}>
                                <Icon className="w-5 h-5" style={{ color: 'var(--color-primary, #ff5932)' }} />
                              </div>
                              <div className="flex-1">
                                <div className="font-semibold text-base">{section.title}</div>
                                {searchQuery && (
                                  <div className="text-xs text-gray-500 mt-0.5">
                                    {section.keywords.slice(0, 3).join(' • ')}
                                  </div>
                                )}
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-4 pt-2">
                            {section.content}
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 bg-gray-50 border-t">
                <div className="text-xs text-gray-500 space-y-2">
                  <div>
                    <strong>Raccourci clavier :</strong>{' '}
                    <kbd className="px-2 py-1 bg-white rounded border text-xs">Ctrl/Cmd + Shift + H</kbd>
                  </div>
                  <div>
                    Version de la documentation : 1.0
                  </div>
                  <div className="pt-2 border-t">
                    Besoin d'aide supplémentaire ? Contactez le support de votre organisation.
                  </div>
                </div>
              </div>
            </ScrollArea>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default ResourceBuilderHelpPanel;
