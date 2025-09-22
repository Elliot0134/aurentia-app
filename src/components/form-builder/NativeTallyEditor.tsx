import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FormBlock, QuestionType } from '@/types/form';
import { SlashCommandMenu } from './SlashCommandMenu';

interface NativeTallyEditorProps {
  blocks: FormBlock[];
  onBlocksChange: (blocks: FormBlock[]) => void;
  className?: string;
  title?: string;
  description?: string;
  onTitleChange?: (title: string) => void;
  onDescriptionChange?: (description: string) => void;
}

export function NativeTallyEditor({ 
  blocks, 
  onBlocksChange, 
  className = '',
  title = '',
  description = '',
  onTitleChange,
  onDescriptionChange
}: NativeTallyEditorProps) {
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

  // Fonction pour insérer une question à la position du curseur
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
      let inputHTML = '';
      
      switch (questionType) {
        case 'text':
          inputHTML = `<input type="text" placeholder="Réponse courte" class="question-input" disabled />`;
          break;
        case 'textarea':
          inputHTML = `<textarea placeholder="Réponse longue" rows="3" class="question-input" disabled></textarea>`;
          break;
        case 'email':
          inputHTML = `<input type="email" placeholder="nom@exemple.com" class="question-input" disabled />`;
          break;
        case 'phone':
          inputHTML = `<input type="tel" placeholder="+33 1 23 45 67 89" class="question-input" disabled />`;
          break;
        case 'number':
          inputHTML = `<input type="number" placeholder="0" class="question-input" disabled />`;
          break;
        case 'date':
          inputHTML = `<input type="date" class="question-input" disabled />`;
          break;
        case 'radio':
          inputHTML = `
            <div class="question-options">
              <label class="option-label"><input type="radio" name="radio-${questionId}" disabled /> Option 1</label>
              <label class="option-label"><input type="radio" name="radio-${questionId}" disabled /> Option 2</label>
              <label class="option-label"><input type="radio" name="radio-${questionId}" disabled /> Option 3</label>
            </div>
          `;
          break;
        case 'checkbox':
          inputHTML = `
            <div class="question-options">
              <label class="option-label"><input type="checkbox" disabled /> Option 1</label>
              <label class="option-label"><input type="checkbox" disabled /> Option 2</label>
              <label class="option-label"><input type="checkbox" disabled /> Option 3</label>
            </div>
          `;
          break;
        case 'select':
          inputHTML = `
            <select class="question-input" disabled>
              <option>Choisir une option</option>
              <option>Option 1</option>
              <option>Option 2</option>
              <option>Option 3</option>
            </select>
          `;
          break;
        case 'rating':
          inputHTML = `<div class="rating-input">${[1,2,3,4,5].map(i => `<span class="star">★</span>`).join('')}</div>`;
          break;
        case 'file':
          inputHTML = `<div class="file-input">📎 Glissez-déposez ou cliquez pour télécharger</div>`;
          break;
        default:
          inputHTML = `<input type="text" placeholder="Réponse" class="question-input" disabled />`;
      }

      return `
        <div class="question-block" data-question-id="${questionId}" contenteditable="false">
          <div class="question-title" contenteditable="true">${content}<span class="required-indicator">*</span></div>
          ${inputHTML}
          <button class="delete-question" onclick="window.deleteQuestion && window.deleteQuestion('${questionId}')">Supprimer</button>
        </div>
        <div><br/></div>
      `;
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
    
    // Insérer les éléments un par un
    const range = slashRange;
    while (tempDiv.firstChild) {
      range.insertNode(tempDiv.firstChild);
    }

    // Positionner le curseur après la question
    const selection = window.getSelection();
    if (selection) {
      const newRange = document.createRange();
      newRange.setStartAfter(range.endContainer);
      newRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(newRange);
    }

    // Ajouter le bloc à la liste
    onBlocksChange([...blocks, newBlock]);
    
    setShowSlashMenu(false);
    setSlashRange(null);
  }, [blocks, onBlocksChange, slashRange]);

  // Fonction pour supprimer une question
  useEffect(() => {
    (window as any).deleteQuestion = (questionId: string) => {
      const element = editorRef.current?.querySelector(`[data-question-id="${questionId}"]`);
      if (element) {
        // Supprimer également le br suivant si c'est le cas
        const nextElement = element.nextElementSibling;
        if (nextElement && nextElement.innerHTML === '<br>') {
          nextElement.remove();
        }
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
      html = `<hr class="separator" /><div><br/></div>`;
    } else {
      html = `<h2 class="section-title" contenteditable="true">Nouveau titre de section</h2><div><br/></div>`;
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

  // Gestionnaire de clic pour fermer le menu
  const handleClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (showSlashMenu && !target.closest('.slash-command-menu')) {
      setShowSlashMenu(false);
      setSlashRange(null);
    }
  }, [showSlashMenu]);

  // Mise à jour du titre et description
  const handleContentChange = useCallback(() => {
    if (!editorRef.current) return;
    
    const titleElement = editorRef.current.querySelector('.form-title') as HTMLElement;
    const descElement = editorRef.current.querySelector('.form-description') as HTMLElement;
    
    if (titleElement && onTitleChange) {
      onTitleChange(titleElement.textContent || '');
    }
    
    if (descElement && onDescriptionChange) {
      onDescriptionChange(descElement.textContent || '');
    }
  }, [onTitleChange, onDescriptionChange]);

  return (
    <div className={`native-tally-editor relative ${className}`}>
      <style>{`
        .native-tally-editor {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
        }
        
        .form-editor {
          min-height: 600px;
          padding: 32px;
          outline: none;
          line-height: 1.6;
          font-size: 16px;
          background: white;
        }
        
        .form-title {
          font-size: 32px;
          font-weight: bold;
          margin-bottom: 16px;
          outline: none;
          border: 2px solid transparent;
          padding: 8px 12px;
          margin: -8px -12px 16px -12px;
          border-radius: 6px;
          transition: all 0.2s ease;
        }
        
        .form-title:hover {
          background-color: #f8fafc;
          border-color: #e2e8f0;
        }
        
        .form-title:focus {
          background-color: white;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .form-description {
          color: #6b7280;
          margin-bottom: 32px;
          outline: none;
          border: 2px solid transparent;
          padding: 8px 12px;
          margin: -8px -12px 32px -12px;
          border-radius: 6px;
          transition: all 0.2s ease;
          min-height: 24px;
        }
        
        .form-description:hover {
          background-color: #f8fafc;
          border-color: #e2e8f0;
        }
        
        .form-description:focus {
          background-color: white;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .question-block {
          margin: 24px 0;
          padding: 20px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: white;
          transition: all 0.2s ease;
        }
        
        .question-block:hover {
          border-color: #d1d5db;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .question-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 12px;
          outline: none;
          border: 2px solid transparent;
          padding: 4px 8px;
          margin: -4px -8px 12px -8px;
          border-radius: 4px;
          transition: all 0.2s ease;
        }
        
        .question-title:focus {
          border-color: #3b82f6;
          background-color: #f8fafc;
        }
        
        .required-indicator {
          color: #ef4444;
          margin-left: 4px;
        }
        
        .question-input {
          width: 100%;
          padding: 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 16px;
          background-color: #f9fafb;
          color: #6b7280;
        }
        
        .question-options {
          margin-top: 12px;
        }
        
        .option-label {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          cursor: pointer;
        }
        
        .rating-input {
          display: flex;
          gap: 4px;
          margin-top: 12px;
        }
        
        .star {
          font-size: 24px;
          color: #d1d5db;
        }
        
        .file-input {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 80px;
          border: 2px dashed #d1d5db;
          border-radius: 6px;
          color: #6b7280;
          margin-top: 12px;
          background-color: #f9fafb;
        }
        
        .delete-question {
          margin-top: 12px;
          padding: 4px 8px;
          background: none;
          border: 1px solid #e5e7eb;
          border-radius: 4px;
          color: #6b7280;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .delete-question:hover {
          border-color: #ef4444;
          color: #ef4444;
        }
        
        .separator {
          margin: 32px 0;
          border: none;
          border-top: 1px solid #e5e7eb;
        }
        
        .section-title {
          font-size: 24px;
          font-weight: bold;
          margin: 24px 0 16px 0;
          outline: none;
          border: 2px solid transparent;
          padding: 4px 8px;
          margin: 20px -8px 16px -8px;
          border-radius: 4px;
          transition: all 0.2s ease;
        }
        
        .section-title:focus {
          border-color: #3b82f6;
          background-color: #f8fafc;
        }
      `}</style>
      
      <div 
        ref={editorRef}
        contentEditable="true"
        className="form-editor"
        onKeyDown={handleKeyDown}
        onClick={handleClick}
        onBlur={handleContentChange}
        suppressContentEditableWarning={true}
      >
        <h1 className="form-title" contentEditable="true">
          {title || 'Titre du formulaire'}
        </h1>
        
        <p className="form-description" contentEditable="true">
          {description || 'Description du formulaire (optionnel)'}
        </p>
        
        <div style={{ minHeight: '200px' }}>
          Commencez à écrire ou tapez "/" pour insérer une question...
        </div>
      </div>

      {/* Menu slash */}
      {showSlashMenu && (
        <div className="slash-command-menu">
          <SlashCommandMenu
            position={slashMenuPosition}
            onSelectQuestion={insertQuestionAtCursor}
            onSelectSpecial={insertSpecialBlock}
            onClose={() => {
              setShowSlashMenu(false);
              setSlashRange(null);
            }}
          />
        </div>
      )}
    </div>
  );
}
