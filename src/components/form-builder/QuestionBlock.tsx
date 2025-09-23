import React, { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FormBlock, QuestionType } from '@/types/form';
import {
  GripVertical, MoreHorizontal, Copy, Trash2, Settings,
  Type, FileText, Mail, Phone, Hash, Calendar,
  Circle, CheckSquare, ChevronDown, Star, Upload
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface QuestionBlockProps {
  block: FormBlock;
  isEditing: boolean;
  onEdit: () => void;
  onStopEdit: () => void;
  onUpdate: (updates: Partial<FormBlock>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  inlineMode?: boolean;
}

export function QuestionBlock({
  block,
  isEditing,
  onEdit,
  onStopEdit,
  onUpdate,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  inlineMode = false,
}: QuestionBlockProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const titleRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  useEffect(() => {
    if (isEditing && !block.content) {
      setTimeout(() => {
        if (titleRef.current) {
          titleRef.current.focus();
          titleRef.current.textContent = '';
        }
      }, 100);
    }
  }, [isEditing, block.content]);

  const handleTitleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isEditing) {
      onEdit();
      setTimeout(() => {
        if (titleRef.current) {
          titleRef.current.focus();
          const range = document.createRange();
          const selection = window.getSelection();
          range.selectNodeContents(titleRef.current);
          range.collapse(false);
          selection?.removeAllRanges();
          selection?.addRange(range);
        }
      }, 0);
    }
  };

  const handleTitleBlur = () => {
    onStopEdit();
    if (titleRef.current) {
      const newContent = titleRef.current.textContent || '';
      if (newContent !== block.content) {
        onUpdate({ content: newContent });
      }
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      titleRef.current?.blur();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      if (titleRef.current) {
        titleRef.current.textContent = block.content;
      }
      titleRef.current?.blur();
    }
  };

  const renderQuestionInput = () => {
    if (!block.questionType) return null;

    switch (block.questionType) {
      case 'text':
        return (
          <input
            type="text"
            placeholder={block.placeholder || "Réponse courte"}
            className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50"
            disabled
          />
        );
      case 'textarea':
        return (
          <textarea
            placeholder={block.placeholder || "Réponse longue"}
            rows={3}
            className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 resize-none"
            disabled
          />
        );
      case 'email':
        return (
          <input
            type="email"
            placeholder={block.placeholder || "nom@exemple.com"}
            className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50"
            disabled
          />
        );
      case 'phone':
        return (
          <input
            type="tel"
            placeholder={block.placeholder || "+33 1 23 45 67 89"}
            className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50"
            disabled
          />
        );
      case 'number':
        return (
          <input
            type="number"
            placeholder={block.placeholder || "0"}
            className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50"
            disabled
          />
        );
      case 'date':
        return (
          <input
            type="date"
            className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50"
            disabled
          />
        );
      case 'radio':
        return (
          <div className="space-y-2">
            {(block.options || ['Option 1', 'Option 2']).map((option, index) => (
              <label key={index} className="flex items-center gap-3">
                <input type="radio" name={`question-${block.id}`} disabled />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );
      case 'checkbox':
        return (
          <div className="space-y-2">
            {(block.options || ['Option 1', 'Option 2']).map((option, index) => (
              <label key={index} className="flex items-center gap-3">
                <input type="checkbox" disabled />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );
      case 'select':
        return (
          <select className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50" disabled>
            <option>Choisir une option</option>
            {(block.options || ['Option 1', 'Option 2']).map((option, index) => (
              <option key={index}>{option}</option>
            ))}
          </select>
        );
      case 'rating':
        return (
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} className="text-gray-300 hover:text-yellow-400 text-2xl" disabled>
                ★
              </button>
            ))}
          </div>
        );
      case 'file':
        return (
          <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 text-gray-500">
            <Upload className="h-6 w-6 mr-2" />
            <span>Glissez-déposez ou cliquez pour télécharger</span>
          </div>
        );
      default:
        return null;
    }
  };

  const getQuestionIcon = (type: QuestionType) => {
    switch (type) {
      case 'text': return <Type className="h-4 w-4" />;
      case 'textarea': return <FileText className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'phone': return <Phone className="h-4 w-4" />;
      case 'number': return <Hash className="h-4 w-4" />;
      case 'date': return <Calendar className="h-4 w-4" />;
      case 'radio': return <Circle className="h-4 w-4" />;
      case 'checkbox': return <CheckSquare className="h-4 w-4" />;
      case 'select': return <ChevronDown className="h-4 w-4" />;
      case 'rating': return <Star className="h-4 w-4" />;
      case 'file': return <Upload className="h-4 w-4" />;
      default: return null;
    }
  };

  // Mode inline simplifié pour l'éditeur Tally
  if (inlineMode) {
    return (
      <div
        className="question-block-inline my-4 p-0"
        data-question-id={block.id}
      >
        <div className="mb-3">
          <div
            ref={titleRef}
            contentEditable={true}
            suppressContentEditableWarning
            className="text-lg font-medium text-foreground outline-none border-l-4 border-transparent focus:border-blue-500 pl-2 -ml-2 transition-colors"
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            data-placeholder="Tapez votre question ici..."
          >
            {block.content || 'Question sans titre'}
          </div>
        </div>
        
        <div className="mb-4">
          {renderQuestionInput()}
        </div>
        
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative transition-all duration-150 ${isDragging ? 'opacity-50 shadow-lg' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Conteneur principal de la question */}
      <div
        data-question-id={block.id}
        className={`ml-2 rounded-lg border transition-all duration-150 ${
          isEditing
            ? 'border-blue-500 shadow-sm bg-blue-50'
            : 'bg-white border-gray-200 hover:border-gray-300'
        }`}
        onClick={onEdit}
      >
        <div className="flex items-start px-6 pt-6">
          {/* Icônes de déplacement et de suppression */}
          <div
            className={`flex items-center gap-1 transition-opacity duration-150 mr-4 ${
              isHovered || isDragging ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab p-1 text-gray-400 hover:text-gray-600"
            >
              <GripVertical className="h-5 w-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1 text-gray-400 hover:text-red-500"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex-1">
            {/* Titre de la question */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div
                  ref={titleRef}
                contentEditable={isEditing}
                suppressContentEditableWarning
                className={`text-lg font-medium outline-none transition-all duration-150 ${
                  isEditing
                    ? 'border-b-2 border-blue-500 pb-1 bg-transparent'
                    : 'hover:bg-gray-100 rounded px-2 py-1 -mx-2 -my-1 cursor-text'
                }`}
                onClick={handleTitleClick}
                onBlur={handleTitleBlur}
                onKeyDown={handleTitleKeyDown}
                data-placeholder="Tapez votre question ici..."
              >
                {block.content || (isEditing ? '' : 'Question sans titre')}
              </div>
              {block.description && (
                <p className="text-sm text-gray-600 mt-1">{block.description}</p>
              )}
              {isEditing && (block.questionType === 'text' || block.questionType === 'textarea' || block.questionType === 'email' || block.questionType === 'phone' || block.questionType === 'number') && (
                <div className="mt-4">
                  <Label htmlFor={`placeholder-${block.id}`} className="text-xs text-gray-500">Texte du placeholder</Label>
                  <Input
                    id={`placeholder-${block.id}`}
                    value={block.placeholder || ''}
                    onChange={(e) => onUpdate({ placeholder: e.target.value })}
                    placeholder="Ex: Entrez votre réponse ici"
                    className="mt-1"
                  />
                </div>
              )}
            </div>

            {/* Input de la question */}
            <div className="pb-6">
              {renderQuestionInput()}
            </div>

            {/* Bouton d'astérisque et menu contextuel */}
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition-all duration-150"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>

              {showMenu && (
                <div
                  ref={menuRef}
                  className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[150px] animate-in fade-in slide-in-from-top-2 duration-200"
                >
                  <button
                    onClick={() => {
                      onDuplicate();
                      setShowMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Dupliquer
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Paramètres
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
