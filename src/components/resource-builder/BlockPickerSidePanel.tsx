import React, { useState, useEffect, useRef } from 'react';
import {
  Type, Image as ImageIcon, Video, File as FileIcon,
  Table, Minus, Code, Quote, Link, AlertCircle,
  CheckSquare, Globe, LayoutGrid, Columns,
  Grid3x3, ChevronDown, ToggleLeft, Lightbulb, HelpCircle, Star, X, Sparkles
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import type { BlockType } from '@/types/resourceTypes';

interface BlockMenuItem {
  type: BlockType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'contenu' | 'mise-en-page' | 'interactif';
}

const menuItems: BlockMenuItem[] = [
  // CONTENU (Content blocks)
  { type: 'text', label: 'Texte', description: 'Texte riche avec Markdown', icon: Type, category: 'contenu' },
  { type: 'image', label: 'Image', description: 'Upload d\'images', icon: ImageIcon, category: 'contenu' },
  { type: 'video', label: 'Vidéo', description: 'YouTube, Vimeo, Dailymotion', icon: Video, category: 'contenu' },
  { type: 'file', label: 'Fichier', description: 'Document téléchargeable', icon: FileIcon, category: 'contenu' },
  { type: 'code', label: 'Code', description: 'Bloc de code avec coloration', icon: Code, category: 'contenu' },
  { type: 'quote', label: 'Citation', description: 'Citation stylisée', icon: Quote, category: 'contenu' },
  { type: 'divider', label: 'Séparateur', description: 'Ligne horizontale', icon: Minus, category: 'contenu' },

  // MISE EN PAGE (Layout blocks)
  { type: 'tabs', label: 'Onglets', description: 'Organisez en onglets', icon: LayoutGrid, category: 'mise-en-page' },
  { type: 'columns', label: 'Colonnes', description: 'Diviser en colonnes', icon: Columns, category: 'mise-en-page' },
  { type: 'grid', label: 'Grille', description: 'Disposition en grille', icon: Grid3x3, category: 'mise-en-page' },
  { type: 'accordion', label: 'Accordéon', description: 'Sections repliables', icon: ChevronDown, category: 'mise-en-page' },
  { type: 'callout', label: 'Encadré', description: 'Contenu mis en évidence', icon: Lightbulb, category: 'mise-en-page' },
  { type: 'toggle', label: 'Toggle', description: 'Section afficher/masquer', icon: ToggleLeft, category: 'mise-en-page' },

  // INTERACTIF (Interactive blocks)
  { type: 'button', label: 'Bouton', description: 'Bouton cliquable (CTA)', icon: Link, category: 'interactif' },
  { type: 'table', label: 'Tableau', description: 'Tableau interactif', icon: Table, category: 'interactif' },
  { type: 'alert', label: 'Alerte', description: 'Message d\'info ou avertissement', icon: AlertCircle, category: 'interactif' },
  { type: 'checklist', label: 'Liste de tâches', description: 'Checklist interactive', icon: CheckSquare, category: 'interactif' },
  { type: 'quiz', label: 'Quiz', description: 'Quiz interactif avec scoring', icon: HelpCircle, category: 'interactif' },
  { type: 'embed', label: 'Intégration', description: 'Iframe externe (Forms, Maps...)', icon: Globe, category: 'interactif' },
];

interface BlockPickerSidePanelProps {
  isOpen: boolean;
  onSelectBlock: (type: BlockType) => void;
  onClose: () => void;
  recommendedBlocks?: BlockType[];
}

export function BlockPickerSidePanel({
  isOpen,
  onSelectBlock,
  onClose,
  recommendedBlocks = []
}: BlockPickerSidePanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState<'all' | 'recommended' | 'contenu' | 'mise-en-page' | 'interactif'>('all');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter items by search and category
  const filteredBySearch = menuItems.filter(item =>
    item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredByCategory = activeCategory === 'all'
    ? filteredBySearch
    : activeCategory === 'recommended'
    ? filteredBySearch.filter(item => recommendedBlocks.includes(item.type))
    : filteredBySearch.filter(item => item.category === activeCategory);

  const allFilteredItems = filteredByCategory;
  const hasRecommended = recommendedBlocks.length > 0;

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, allFilteredItems.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (allFilteredItems[selectedIndex]) {
          handleSelect(allFilteredItems[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, allFilteredItems, selectedIndex, onClose]);

  // Auto-focus search input when opened
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Reset selected index when filters change
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchTerm, activeCategory]);

  const handleSelect = (item: BlockMenuItem) => {
    onSelectBlock(item.type);
    onClose();
    // Reset state for next opening
    setSearchTerm('');
    setActiveCategory('all');
    setSelectedIndex(0);
  };

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
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[540px] bg-white shadow-2xl z-[101] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b text-white" style={{
              background: 'linear-gradient(to right, var(--color-primary, #ff5932), var(--color-primary, #ff5932))',
              backgroundImage: 'linear-gradient(to right, var(--color-primary, #ff5932), color-mix(in srgb, var(--color-primary, #ff5932) 80%, black))'
            }}>
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6" />
                <div>
                  <h2 className="text-xl font-bold">Ajouter un bloc</h2>
                  <p className="text-xs text-white/90">Choisissez un type de contenu à ajouter</p>
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
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Rechercher un type de bloc..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10"
              />
            </div>

            {/* Category Tabs */}
            <div className="flex border-b bg-white px-4 py-3 gap-2 overflow-x-auto">
              <button
                onClick={() => setActiveCategory('all')}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap",
                  activeCategory === 'all'
                    ? "text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                )}
                style={activeCategory === 'all' ? { backgroundColor: 'var(--color-primary, #ff5932)' } : {}}
              >
                Tous
              </button>
              {hasRecommended && (
                <button
                  onClick={() => setActiveCategory('recommended')}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap flex items-center gap-2",
                    activeCategory === 'recommended'
                      ? "bg-amber-500 text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <Star className="w-4 h-4" />
                  Recommandés
                </button>
              )}
              <button
                onClick={() => setActiveCategory('contenu')}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap",
                  activeCategory === 'contenu'
                    ? "text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                )}
                style={activeCategory === 'contenu' ? { backgroundColor: 'var(--color-primary, #ff5932)' } : {}}
              >
                Contenu
              </button>
              <button
                onClick={() => setActiveCategory('mise-en-page')}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap",
                  activeCategory === 'mise-en-page'
                    ? "text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                )}
                style={activeCategory === 'mise-en-page' ? { backgroundColor: 'var(--color-primary, #ff5932)' } : {}}
              >
                Mise en page
              </button>
              <button
                onClick={() => setActiveCategory('interactif')}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap",
                  activeCategory === 'interactif'
                    ? "text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                )}
                style={activeCategory === 'interactif' ? { backgroundColor: 'var(--color-primary, #ff5932)' } : {}}
              >
                Interactif
              </button>
            </div>

            {/* Content - Grid of blocks */}
            <ScrollArea className="flex-1">
              <div className="p-4">
                {allFilteredItems.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Aucun bloc trouvé</p>
                    <p className="text-sm mt-2">Essayez d'autres mots-clés</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSearchTerm('')}
                      className="mt-4"
                    >
                      Effacer la recherche
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {allFilteredItems.map((item, index) => {
                      const Icon = item.icon;
                      const isRecommended = recommendedBlocks.includes(item.type);
                      const isSelected = selectedIndex === index;

                      return (
                        <button
                          key={item.type}
                          onClick={() => handleSelect(item)}
                          onMouseEnter={() => setSelectedIndex(index)}
                          className={cn(
                            "relative p-4 rounded-lg border-2 transition-all text-left group",
                            isSelected
                              ? "shadow-lg scale-105"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          )}
                          style={isSelected ? {
                            borderColor: 'var(--color-primary, #ff5932)',
                            backgroundColor: 'color-mix(in srgb, var(--color-primary, #ff5932) 10%, white)'
                          } : {}}
                        >
                          {/* Recommended Badge */}
                          {isRecommended && (
                            <div className="absolute -top-2 -right-2 bg-amber-500 text-white rounded-full p-1.5 shadow-md">
                              <Star className="w-3 h-3 fill-white" />
                            </div>
                          )}

                          {/* Icon */}
                          <div className={cn(
                            "w-12 h-12 rounded-lg flex items-center justify-center mb-3 transition-colors",
                            !isSelected && "bg-gray-100 group-hover:bg-gray-200"
                          )}
                          style={isSelected ? {
                            backgroundColor: 'color-mix(in srgb, var(--color-primary, #ff5932) 20%, white)'
                          } : {}}
                          >
                            <Icon className="w-6 h-6" style={isSelected ? {
                              color: 'var(--color-primary, #ff5932)'
                            } : { color: '#4b5563' }} />
                          </div>

                          {/* Label */}
                          <div className="font-semibold text-sm text-gray-900 mb-1">
                            {item.label}
                          </div>

                          {/* Description */}
                          <div className="text-xs text-gray-500 line-clamp-2">
                            {item.description}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="p-4 border-t bg-gray-50">
              <div className="text-xs text-gray-500 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span>↑↓ Naviguer</span>
                  <span>↵ Sélectionner</span>
                  <span>Échap Fermer</span>
                </div>
                {hasRecommended && activeCategory === 'all' && (
                  <span className="text-amber-600 font-medium flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-600" />
                    Recommandé
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default BlockPickerSidePanel;
