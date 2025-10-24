import React, { useState, useEffect, useRef } from 'react';
import {
  Type, Image as ImageIcon, Video, File as FileIcon,
  Table, Minus, Code, Quote, Link, AlertCircle,
  CheckSquare, Globe, LayoutGrid, Columns,
  Grid3x3, ChevronDown, MessageSquare, ToggleLeft, Lightbulb
} from 'lucide-react';
import type { BlockType } from '@/types/resourceTypes';

interface MenuItem {
  type: BlockType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'basic' | 'advanced' | 'layout';
}

const menuItems: MenuItem[] = [
  // BASIC BLOCKS
  {
    type: 'text',
    label: 'Texte / Markdown',
    description: 'Texte riche avec support Markdown complet (titres, listes, liens, code...)',
    icon: Type,
    category: 'basic'
  },
  {
    type: 'image',
    label: 'Image',
    description: 'Upload d\'images (JPG, PNG, GIF, WebP) jusqu\'à 10 MB',
    icon: ImageIcon,
    category: 'basic'
  },
  {
    type: 'video',
    label: 'Vidéo',
    description: 'Intégrez des vidéos YouTube, Vimeo ou Dailymotion',
    icon: Video,
    category: 'basic'
  },
  {
    type: 'file',
    label: 'Fichier joint',
    description: 'Document téléchargeable (PDF, DOCX, XLSX, etc.) jusqu\'à 50 MB',
    icon: FileIcon,
    category: 'basic'
  },
  {
    type: 'table',
    label: 'Tableau',
    description: 'Créez des tableaux structurés avec syntaxe Markdown',
    icon: Table,
    category: 'basic'
  },
  {
    type: 'divider',
    label: 'Séparateur',
    description: 'Ligne horizontale pour séparer visuellement le contenu',
    icon: Minus,
    category: 'basic'
  },

  // ADVANCED BLOCKS
  {
    type: 'code',
    label: 'Bloc de code',
    description: 'Code avec coloration syntaxique (18 langages), numéros de ligne',
    icon: Code,
    category: 'advanced'
  },
  {
    type: 'quote',
    label: 'Citation',
    description: 'Citation stylisée avec auteur et source',
    icon: Quote,
    category: 'advanced'
  },
  {
    type: 'button',
    label: 'Bouton',
    description: 'Bouton d\'action avec lien personnalisable',
    icon: Link,
    category: 'advanced'
  },
  {
    type: 'alert',
    label: 'Alerte',
    description: 'Message d\'info, avertissement, erreur ou succès',
    icon: AlertCircle,
    category: 'advanced'
  },
  {
    type: 'checklist',
    label: 'Liste de tâches',
    description: 'Checklist interactive avec progression',
    icon: CheckSquare,
    category: 'advanced'
  },
  {
    type: 'embed',
    label: 'Intégration',
    description: 'Intégrez des iframes (Google Forms, Maps, Figma, etc.)',
    icon: Globe,
    category: 'advanced'
  },

  // LAYOUT BLOCKS
  {
    type: 'tabs',
    label: 'Onglets',
    description: 'Organisez le contenu en onglets horizontaux',
    icon: LayoutGrid,
    category: 'layout'
  },
  {
    type: 'columns',
    label: 'Colonnes',
    description: 'Divisez en colonnes avec ratios personnalisables (50/50, 30/70, etc.)',
    icon: Columns,
    category: 'layout'
  },
  {
    type: 'grid',
    label: 'Grille',
    description: 'Disposez le contenu en grille 2x2, 3x3, 2x3...',
    icon: Grid3x3,
    category: 'layout'
  },
  {
    type: 'accordion',
    label: 'Accordéon',
    description: 'Sections repliables pour économiser l\'espace',
    icon: ChevronDown,
    category: 'layout'
  },
  {
    type: 'callout',
    label: 'Encadré',
    description: 'Contenu mis en évidence (info, avertissement, astuce...)',
    icon: Lightbulb,
    category: 'layout'
  },
  {
    type: 'toggle',
    label: 'Toggle',
    description: 'Section afficher/masquer avec titre personnalisable',
    icon: ToggleLeft,
    category: 'layout'
  },
];

interface SlashCommandMenuProps {
  position: { top: number; left: number };
  onSelectBlock: (type: BlockType) => void;
  onClose: () => void;
}

export function SlashCommandMenu({ position, onSelectBlock, onClose }: SlashCommandMenuProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredItems = menuItems.filter(item =>
    item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group filtered items by category
  const groupedItems = {
    basic: filteredItems.filter(item => item.category === 'basic'),
    advanced: filteredItems.filter(item => item.category === 'advanced'),
    layout: filteredItems.filter(item => item.category === 'layout')
  };

  const allFilteredItems = [
    ...groupedItems.basic,
    ...groupedItems.advanced,
    ...groupedItems.layout
  ];

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

    // Focus search input after a short delay
    const timer = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('mousedown', handleClickOutside);
      clearTimeout(timer);
    };
  }, [allFilteredItems, selectedIndex, onSelectBlock, onClose]);

  const handleSelect = (item: MenuItem) => {
    console.log('Block type selected:', item.type);
    onSelectBlock(item.type);
    onClose();
  };

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchTerm]);

  return (
    <div
      ref={menuRef}
      className="fixed z-[9999] bg-white rounded-lg shadow-xl border border-gray-200"
      style={{
        top: position.top,
        left: position.left,
        minWidth: '280px',
      }}
    >
      {/* Search Input */}
      <div className="p-3 border-b border-gray-100">
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Rechercher un type de bloc..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-2 py-1 text-sm outline-none placeholder-gray-400"
        />
      </div>

      {/* Menu Items List */}
      <div className="max-h-[400px] overflow-y-auto py-2">
        {allFilteredItems.length === 0 ? (
          <div className="px-3 py-4 text-sm text-gray-500 text-center">
            Aucun élément trouvé
          </div>
        ) : (
          <>
            {/* Basic Blocks */}
            {groupedItems.basic.length > 0 && (
              <div className="mb-2">
                {!searchTerm && (
                  <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Blocs de base
                  </div>
                )}
                {groupedItems.basic.map((item) => {
                  const globalIndex = allFilteredItems.indexOf(item);
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.type}
                      type="button"
                      className={`w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors cursor-pointer ${
                        selectedIndex === globalIndex ? 'bg-blue-50 border-r-2' : ''
                      }`}
                      style={selectedIndex === globalIndex ? {
                        borderRightColor: 'var(--color-primary, #ff5932)'
                      } : undefined}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(globalIndex)}
                    >
                      <Icon className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-900">{item.label}</div>
                        <div className="text-xs text-gray-500 truncate">{item.description}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Advanced Blocks */}
            {groupedItems.advanced.length > 0 && (
              <div className="mb-2">
                {!searchTerm && (
                  <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Blocs avancés
                  </div>
                )}
                {groupedItems.advanced.map((item) => {
                  const globalIndex = allFilteredItems.indexOf(item);
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.type}
                      type="button"
                      className={`w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors cursor-pointer ${
                        selectedIndex === globalIndex ? 'bg-blue-50 border-r-2' : ''
                      }`}
                      style={selectedIndex === globalIndex ? {
                        borderRightColor: 'var(--color-primary, #ff5932)'
                      } : undefined}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(globalIndex)}
                    >
                      <Icon className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-900">{item.label}</div>
                        <div className="text-xs text-gray-500 truncate">{item.description}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Layout Blocks */}
            {groupedItems.layout.length > 0 && (
              <div className="mb-2">
                {!searchTerm && (
                  <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Blocs de mise en page
                  </div>
                )}
                {groupedItems.layout.map((item) => {
                  const globalIndex = allFilteredItems.indexOf(item);
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.type}
                      type="button"
                      className={`w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors cursor-pointer ${
                        selectedIndex === globalIndex ? 'bg-blue-50 border-r-2' : ''
                      }`}
                      style={selectedIndex === globalIndex ? {
                        borderRightColor: 'var(--color-primary, #ff5932)'
                      } : undefined}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(globalIndex)}
                    >
                      <Icon className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-900">{item.label}</div>
                        <div className="text-xs text-gray-500 truncate">{item.description}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Shortcut Hint */}
      <div className="px-3 py-2 border-t border-gray-100 text-xs text-gray-400">
        ↑↓ pour naviguer • ↵ pour sélectionner • Échap pour fermer
      </div>
    </div>
  );
}

export default SlashCommandMenu;
