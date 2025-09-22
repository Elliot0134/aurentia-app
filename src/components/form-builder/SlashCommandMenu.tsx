import React, { useState, useEffect, useRef } from 'react';
import { QuestionType } from '@/types/form';
import {
  FileText, Type, Mail, Phone, Hash, Calendar,
  Circle, CheckSquare, ChevronDown, Star, SeparatorHorizontal, Heading1, Upload
} from 'lucide-react';

interface MenuItem {
  type: QuestionType | 'separator' | 'title';
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'question' | 'special';
}

const menuItems: MenuItem[] = [
  // Question Types
  { type: 'text', label: 'Texte court', description: 'Réponse courte sur une ligne', icon: Type, category: 'question' },
  { type: 'textarea', label: 'Texte long', description: 'Réponse longue sur plusieurs lignes', icon: FileText, category: 'question' },
  { type: 'email', label: 'Email', description: 'Adresse email avec validation', icon: Mail, category: 'question' },
  { type: 'phone', label: 'Téléphone', description: 'Numéro de téléphone', icon: Phone, category: 'question' },
  { type: 'number', label: 'Nombre', description: 'Saisie numérique', icon: Hash, category: 'question' },
  { type: 'date', label: 'Date', description: 'Sélecteur de date', icon: Calendar, category: 'question' },
  { type: 'radio', label: 'Choix multiple', description: 'Sélection unique parmi des options', icon: Circle, category: 'question' },
  { type: 'checkbox', label: 'Cases à cocher', description: 'Sélection multiple parmi des options', icon: CheckSquare, category: 'question' },
  { type: 'select', label: 'Liste déroulante', description: 'Sélection unique dans une liste', icon: ChevronDown, category: 'question' },
  { type: 'rating', label: 'Évaluation', description: 'Système de notation (étoiles, etc.)', icon: Star, category: 'question' },
  { type: 'file', label: 'Fichier', description: 'Téléchargement de fichier', icon: Upload, category: 'question' },
  // Special Blocks
  { type: 'separator', label: 'Page Break', description: 'Ajouter un saut de page', icon: SeparatorHorizontal, category: 'special' },
  { type: 'title', label: 'Titre de section', description: 'Ajouter un titre de section', icon: Heading1, category: 'special' },
];

interface SlashCommandMenuProps {
  position: { top: number; left: number };
  onSelectQuestion: (type: QuestionType) => void;
  onSelectSpecial: (type: 'separator' | 'title') => void;
  onClose: () => void;
}

export function SlashCommandMenu({ position, onSelectQuestion, onSelectSpecial, onClose }: SlashCommandMenuProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredItems = menuItems.filter(item =>
    item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      e.stopPropagation();
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredItems.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          handleSelect(filteredItems[selectedIndex]);
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
  }, [filteredItems, selectedIndex, onSelectQuestion, onSelectSpecial, onClose]);

  const handleSelect = (item: MenuItem) => {
    console.log('Item selected in menu:', item.type);
    if (item.category === 'question') {
      onSelectQuestion(item.type as QuestionType);
    } else {
      onSelectSpecial(item.type as 'separator' | 'title');
    }
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
        minWidth: '250px',
      }}
    >
      {/* Search Input */}
      <div className="p-3 border-b border-gray-100">
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Rechercher un type de question ou un bloc..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-2 py-1 text-sm outline-none placeholder-gray-400"
        />
      </div>

      {/* Menu Items List */}
      <div className="max-h-[300px] overflow-y-auto py-2">
        {filteredItems.length === 0 ? (
          <div className="px-3 py-4 text-sm text-gray-500 text-center">
            Aucun élément trouvé
          </div>
        ) : (
          filteredItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={item.type}
                type="button"
                className={`w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors cursor-pointer ${
                  selectedIndex === index ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                }`}
                onClick={() => {
                  console.log('Menu item clicked:', item.type);
                  handleSelect(item);
                }}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <Icon className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-900">{item.label}</div>
                  <div className="text-xs text-gray-500 truncate">{item.description}</div>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Shortcut Hint */}
      <div className="px-3 py-2 border-t border-gray-100 text-xs text-gray-400">
        ↑↓ pour naviguer • ↵ pour sélectionner • Échap pour fermer
      </div>
    </div>
  );
}
