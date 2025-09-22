import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FormBlock, QuestionType } from '@/types/form';
import { SlashCommandMenu } from './SlashCommandMenu';
import './tally-document-editor.css';

interface SimpleTallyEditorProps {
  blocks: FormBlock[];
  onBlocksChange: (blocks: FormBlock[]) => void;
  className?: string;
  title?: string;
  description?: string;
  onTitleChange?: (title: string) => void;
  onDescriptionChange?: (description: string) => void;
}

export function SimpleTallyEditor({ 
  blocks, 
  onBlocksChange, 
  className = '',
  title = '',
  description = '',
  onTitleChange,
  onDescriptionChange
}: SimpleTallyEditorProps) {
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashMenuPosition, setSlashMenuPosition] = useState({ top: 0, left: 0 });
  const [slashRange, setSlashRange] = useState<Range | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  // Fonction pour obtenir les coordonnées du curseur
  const getCaretCoordinates = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;
    
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    return {
      top: rect.bottom + window.scrollY + 8,
      left: rect.left + window.scrollX
    };
  }, []);

  // Insertion de question directement dans le DOM
  const insertQuestionAtCursor = useCallback((type: QuestionType) => {
    if (!slashRange) return;

    const getDefaultContent = (questionType: QuestionType): string => {
      const contentMap: Record<QuestionType, string> = {
        'text': 'Question sans titre',
        'textarea': 'Question à réponse longue', 
        'email': 'Quelle est votre adresse email ?',
        'phone': 'Quel est votre numéro de téléphone ?',
        'number': 'Entrez un nombre',
        'date': 'Sélectionnez une date',
        'checkbox': 'Sélectionnez une ou plusieurs options',
        'radio': 'Choisissez une option',
        'select': 'Sélectionnez dans la liste',
        'rating': 'Donnez votre évaluation',
        'file': 'Téléchargez vos fichiers'
      };
      return contentMap[questionType] || 'Nouvelle question';
    };

    const getQuestionHTML = (questionType: QuestionType, content: string, questionId: string) => {
      const baseHTML = `
        <div class="question-block" data-question-id="${questionId}" contenteditable="false" style="margin: 24px 0; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; background: #ffffff;">
          <div class="question-title" contenteditable="true" style="font-size: 18px; font-weight: 600; margin-bottom: 12px; outline: none;">${content}</div>
      `;

      let inputHTML = '';
      switch (questionType) {
        case 'text':
          inputHTML = `<input type="text" placeholder="Réponse courte" style="width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 6px;" disabled />`;
          break;
        case 'textarea':
          inputHTML = `<textarea placeholder="Réponse longue" rows="3" style="width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 6px; resize: none;" disabled></textarea>`;
          break;
        case 'email':
          inputHTML = `<input type="email" placeholder="nom@exemple.com" style="width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 6px;" disabled />`;
          break;
        case 'phone':
          inputHTML = `<input type="tel" placeholder="+33 1 23 45 67 89" style="width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 6px;" disabled />`;
          break;
        case 'number':
          inputHTML = `<input type="number" placeholder="0" style="width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 6px;" disabled />`;
          break;
        case 'date':
          inputHTML = `<input type="date" style="width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 6px;" disabled />`;
          break;
        case 'radio':
          inputHTML = `
            <div style="margin-top: 12px;">
              <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;"><input type="radio" name="radio-${questionId}" disabled /> Option 1</label>
              <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;"><input type="radio" name="radio-${questionId}" disabled /> Option 2</label>
              <label style="display: flex; align-items: center; gap: 8px;"><input type="radio" name="radio-${questionId}" disabled /> Option 3</label>
            </div>
          `;
          break;
        case 'checkbox':
          inputHTML = `
            <div style="margin-top: 12px;">
              <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;"><input type="checkbox" disabled /> Option 1</label>
              <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;"><input type="checkbox" disabled /> Option 2</label>
              <label style="display: flex; align-items: center; gap: 8px;"><input type="checkbox" disabled /> Option 3</label>
            </div>
          `;
          break;
        case 'select':
          inputHTML = `
            <select style="width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 6px;" disabled>
              <option>Choisir une option</option>
              <option>Option 1</option>
              <option>Option 2</option>
              <option>Option 3</option>
            </select>
          `;
          break;
        case 'rating':
          inputHTML = `
            <div style="display: flex; gap: 4px; margin-top: 12px;">
              ${[1,2,3,4,5].map(i => `<button style="background: none; border: none; color: #d1d5db; font-size: 24px; cursor: pointer;" disabled>★</button>`).join('')}
            </div>
          `;
          break;
        case 'file':
          inputHTML = `
            <div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 80px; border: 2px dashed #d1d5db; border-radius: 6px; color: #6b7280; margin-top: 12px;">
              📎 Glissez-déposez ou cliquez pour télécharger
            </div>
          `;
          break;
        default:
          inputHTML = `<input type="text" placeholder="Réponse" style="width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 6px;" disabled />`;
      }

      return `${baseHTML}${inputHTML}
        <button class="delete-question" onclick="window.deleteQuestion('${questionId}')" style="margin-top: 12px; padding: 4px 8px; background: none; border: 1px solid #e5e7eb; border-radius: 4px; color: #6b7280; font-size: 12px; cursor: pointer;">
          Supprimer
        </button>
      </div><div><br/></div>`;
    };

    // Supprimer le "/"
    slashRange.deleteContents();

    // Créer le nouveau bloc
    const newBlock: FormBlock = {
      id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'question',
      content: getDefaultContent(type),
      questionType: type,
      required: false,
      options: ['checkbox', 'radio', 'select'].includes(type) ? ['Option 1', 'Option 2', 'Option 3'] : undefined,
      order: blocks.length
    };

    // Insérer le HTML de la question
    const questionHTML = getQuestionHTML(type, newBlock.content, newBlock.id);
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = questionHTML;
    
    while (tempDiv.firstChild) {
      slashRange.insertNode(tempDiv.firstChild);
    }

    // Ajouter le bloc à la liste
    onBlocksChange([...blocks, newBlock]);
    
    setShowSlashMenu(false);
    setSlashRange(null);
  }, [blocks, onBlocksChange, slashRange]);

  // Fonction globale pour supprimer des questions
  useEffect(() => {
    (window as any).deleteQuestion = (questionId: string) => {
      const element = editorRef.current?.querySelector(`[data-question-id="${questionId}"]`);
      if (element) {
        element.remove();
      }
      
      const updatedBlocks = blocks.filter(block => block.id !== questionId);
      onBlocksChange(updatedBlocks);
    };

    return () => {
      delete (window as any).deleteQuestion;
    };
  }, [blocks, onBlocksChange]);

  // Insertion d'éléments spéciaux
  const insertSpecialBlock = useCallback((type: 'separator' | 'title') => {
    if (!slashRange) return;

    slashRange.deleteContents();

    let html = '';
    if (type === 'separator') {
      html = `<hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e7eb;" /><div><br/></div>`;
    } else {
      html = `<h2 contenteditable="true" style="font-size: 24px; font-weight: bold; margin: 24px 0 16px 0; outline: none;">Nouveau titre de section</h2><div><br/></div>`;
    }

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    while (tempDiv.firstChild) {
      slashRange.insertNode(tempDiv.firstChild);
    }

    const newBlock: FormBlock = {
      id: `block_${Date.now()}`,
      type: type,
      content: type === 'title' ? 'Nouveau titre de section' : '',
      order: blocks.length
    };

    onBlocksChange([...blocks, newBlock]);
    setShowSlashMenu(false);
    setSlashRange(null);
  }, [blocks, onBlocksChange, slashRange]);

  // Gestionnaire des événements clavier
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === '/') {
      setTimeout(() => {
        const coords = getCaretCoordinates();
        if (coords) {
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0).cloneRange();
            range.setStart(range.startContainer, Math.max(0, range.startOffset - 1));
            setSlashRange(range);
            setSlashMenuPosition(coords);
            setShowSlashMenu(true);
          }
        }
      }, 10);
    } else if (e.key === 'Escape') {
      setShowSlashMenu(false);
      setSlashRange(null);
    }
  }, [getCaretCoordinates]);

  // Gestionnaire de clic
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (showSlashMenu && !e.currentTarget.closest('.slash-menu')) {
      setShowSlashMenu(false);
      setSlashRange(null);
    }
  }, [showSlashMenu]);

  return (
    <div className={`tally-document-editor relative ${className}`}>
      <div 
        ref={editorRef}
        contentEditable="true"
        className="document-flow"
        style={{
          minHeight: '600px',
          padding: '32px',
          outline: 'none',
          lineHeight: '1.6',
          fontSize: '16px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}
        onKeyDown={handleKeyDown}
        onClick={handleClick}
        suppressContentEditableWarning={true}
      >
        {/* Titre du formulaire */}
        <h1 
          contentEditable="true"
          style={{
            fontSize: '32px',
            fontWeight: 'bold',
            marginBottom: '16px',
            outline: 'none',
            border: '2px solid transparent',
            padding: '8px 12px',
            margin: '-8px -12px 16px -12px',
            borderRadius: '6px',
            transition: 'all 0.2s ease'
          }}
          onBlur={(e) => onTitleChange && onTitleChange(e.currentTarget.textContent || '')}
          suppressContentEditableWarning={true}
        >
          {title || 'Titre du formulaire'}
        </h1>
        
        {/* Description */}
        <p 
          contentEditable="true"
          style={{
            color: '#6b7280',
            marginBottom: '32px',
            outline: 'none',
            border: '2px solid transparent',
            padding: '8px 12px',
            margin: '-8px -12px 32px -12px',
            borderRadius: '6px',
            transition: 'all 0.2s ease',
            minHeight: '24px'
          }}
          onBlur={(e) => onDescriptionChange && onDescriptionChange(e.currentTarget.textContent || '')}
          suppressContentEditableWarning={true}
        >
          {description || 'Description du formulaire (optionnel)'}
        </p>
        
        {/* Zone de contenu - ici l'utilisateur peut taper */}
        <div style={{ minHeight: '200px' }}>
          Commencez à écrire ou tapez "/" pour insérer une question...
        </div>
      </div>

      {/* Menu slash */}
      {showSlashMenu && (
        <SlashCommandMenu
          position={slashMenuPosition}
          onSelectQuestion={insertQuestionAtCursor}
          onSelectSpecial={insertSpecialBlock}
          onClose={() => {
            setShowSlashMenu(false);
            setSlashRange(null);
          }}
        />
      )}
    </div>
  );
}
