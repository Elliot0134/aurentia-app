import React, { useState, useEffect, useRef } from 'react';
import {
  Type, Image as ImageIcon, Video, File as FileIcon,
  Table, Minus, Code, Quote, Link, AlertCircle,
  CheckSquare, Globe, LayoutGrid, Columns,
  Grid3x3, ChevronDown, ToggleLeft, Lightbulb, HelpCircle, Star
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { BlockType } from '@/types/resourceTypes';

interface BlockMenuItem {
  type: BlockType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'basic' | 'advanced' | 'layout';
}

const menuItems: BlockMenuItem[] = [
  // BASIC BLOCKS
  { type: 'text', label: 'Texte', description: 'Texte riche avec Markdown', icon: Type, category: 'basic' },
  { type: 'image', label: 'Image', description: 'Upload d\'images', icon: ImageIcon, category: 'basic' },
  { type: 'video', label: 'Vidéo', description: 'YouTube, Vimeo, Dailymotion', icon: Video, category: 'basic' },
  { type: 'file', label: 'Fichier', description: 'Document téléchargeable', icon: FileIcon, category: 'basic' },
  { type: 'table', label: 'Tableau', description: 'Tableau interactif', icon: Table, category: 'basic' },
  { type: 'divider', label: 'Séparateur', description: 'Ligne horizontale', icon: Minus, category: 'basic' },

  // ADVANCED BLOCKS
  { type: 'code', label: 'Code', description: 'Bloc de code avec coloration', icon: Code, category: 'advanced' },
  { type: 'quote', label: 'Citation', description: 'Citation stylisée', icon: Quote, category: 'advanced' },
  { type: 'button', label: 'Bouton', description: 'Bouton cliquable (CTA)', icon: Link, category: 'advanced' },
  { type: 'alert', label: 'Alerte', description: 'Message d\'info ou avertissement', icon: AlertCircle, category: 'advanced' },
  { type: 'checklist', label: 'Liste de tâches', description: 'Checklist interactive', icon: CheckSquare, category: 'advanced' },
  { type: 'quiz', label: 'Quiz', description: 'Quiz interactif avec scoring', icon: HelpCircle, category: 'advanced' },
  { type: 'embed', label: 'Intégration', description: 'Iframe externe (Forms, Maps...)', icon: Globe, category: 'advanced' },

  // LAYOUT BLOCKS
  { type: 'tabs', label: 'Onglets', description: 'Organisez en onglets', icon: LayoutGrid, category: 'layout' },
  { type: 'columns', label: 'Colonnes', description: 'Diviser en colonnes', icon: Columns, category: 'layout' },
  { type: 'grid', label: 'Grille', description: 'Disposition en grille', icon: Grid3x3, category: 'layout' },
  { type: 'accordion', label: 'Accordéon', description: 'Sections repliables', icon: ChevronDown, category: 'layout' },
  { type: 'callout', label: 'Encadré', description: 'Contenu mis en évidence', icon: Lightbulb, category: 'layout' },
  { type: 'toggle', label: 'Toggle', description: 'Section afficher/masquer', icon: ToggleLeft, category: 'layout' },
];

interface BlockPickerMenuProps {
  position: { top: number; left: number };
  onSelectBlock: (type: BlockType) => void;
  onClose: () => void;
  recommendedBlocks?: BlockType[]; // For Phase 5
}

export function BlockPickerMenu({ position, onSelectBlock, onClose, recommendedBlocks = [] }: BlockPickerMenuProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState<'all' | 'recommended' | 'basic' | 'advanced' | 'layout'>('all');
  const menuRef = useRef<HTMLDivElement>(null);
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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      e.stopPropagation();
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

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('mousedown', handleClickOutside);

    const timer = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('mousedown', handleClickOutside);
      clearTimeout(timer);
    };
  }, [allFilteredItems, selectedIndex, onSelectBlock, onClose]);

  const handleSelect = (item: BlockMenuItem) => {
    onSelectBlock(item.type);
    onClose();
  };

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchTerm, activeCategory]);

  const hasRecommended = recommendedBlocks.length > 0;

  return (
    <div
      ref={menuRef}
      className="fixed z-[9999] bg-white rounded-xl shadow-2xl border-2 border-gray-200 overflow-hidden"
      style={{
        top: position.top,
        left: position.left,
        width: '480px',
        maxHeight: '600px',
      }}
    >
      {/* Search */}
      <div className="p-4 border-b bg-gray-50">
        <Input
          ref={searchInputRef}
          type="text"
          placeholder="Rechercher un type de bloc..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-10 text-sm"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex border-b bg-white px-2 py-1 gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveCategory('all')}
          className={cn(
            "px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap",
            activeCategory === 'all'
              ? "bg-blue-100 text-blue-700"
              : "text-gray-600 hover:bg-gray-100"
          )}
        >
          Tous
        </button>
        {hasRecommended && (
          <button
            onClick={() => setActiveCategory('recommended')}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap flex items-center gap-1",
              activeCategory === 'recommended'
                ? "bg-amber-100 text-amber-700"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <Star className="w-3 h-3" />
            Recommandés
          </button>
        )}
        <button
          onClick={() => setActiveCategory('basic')}
          className={cn(
            "px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap",
            activeCategory === 'basic'
              ? "bg-blue-100 text-blue-700"
              : "text-gray-600 hover:bg-gray-100"
          )}
        >
          Basiques
        </button>
        <button
          onClick={() => setActiveCategory('advanced')}
          className={cn(
            "px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap",
            activeCategory === 'advanced'
              ? "bg-blue-100 text-blue-700"
              : "text-gray-600 hover:bg-gray-100"
          )}
        >
          Avancés
        </button>
        <button
          onClick={() => setActiveCategory('layout')}
          className={cn(
            "px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap",
            activeCategory === 'layout'
              ? "bg-blue-100 text-blue-700"
              : "text-gray-600 hover:bg-gray-100"
          )}
        >
          Mise en page
        </button>
      </div>

      {/* Grid of blocks */}
      <div className="p-4 overflow-y-auto" style={{ maxHeight: '420px' }}>
        {allFilteredItems.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>Aucun bloc trouvé</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
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
                    "relative p-3 rounded-lg border-2 transition-all text-left group",
                    isSelected
                      ? "shadow-md"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  )}
                  style={isSelected ? {
                    borderColor: 'var(--color-primary, #ff5932)',
                    backgroundColor: 'color-mix(in srgb, var(--color-primary, #ff5932) 5%, white)'
                  } : undefined}
                >
                  {/* Recommended Badge */}
                  {isRecommended && (
                    <div className="absolute -top-2 -right-2 bg-amber-500 text-white rounded-full p-1">
                      <Star className="w-3 h-3 fill-white" />
                    </div>
                  )}

                  {/* Icon */}
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center mb-2 transition-colors",
                      !isSelected && "bg-gray-100 group-hover:bg-gray-200"
                    )}
                    style={isSelected ? {
                      backgroundColor: 'color-mix(in srgb, var(--color-primary, #ff5932) 20%, transparent)'
                    } : undefined}
                  >
                    <Icon
                      className="w-5 h-5"
                      style={isSelected ? {
                        color: 'var(--color-primary, #ff5932)'
                      } : undefined}
                    />
                  </div>

                  {/* Label */}
                  <div className="font-semibold text-sm text-gray-900 mb-0.5">
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

      {/* Footer */}
      <div className="px-4 py-3 border-t bg-gray-50 text-xs text-gray-500 flex items-center justify-between">
        <span>↑↓ Naviguer • ↵ Sélectionner • Échap Fermer</span>
        {hasRecommended && activeCategory === 'all' && (
          <span className="text-amber-600 font-medium flex items-center gap-1">
            <Star className="w-3 h-3" />
            = Recommandé
          </span>
        )}
      </div>
    </div>
  );
}

export default BlockPickerMenu;
