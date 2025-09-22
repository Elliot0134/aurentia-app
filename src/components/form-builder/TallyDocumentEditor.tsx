import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FormBlock, QuestionType } from '@/types/form';
import { SlashCommandMenu } from './SlashCommandMenu';
import { InlineQuestionBlock } from './InlineQuestionBlock';
import './tally-document-editor.css';

interface TallyDocumentEditorProps {
  blocks: FormBlock[];
  onBlocksChange: (blocks: FormBlock[]) => void;
  className?: string;
  title?: string;
  description?: string;
  onTitleChange?: (title: string) => void;
  onDescriptionChange?: (description: string) => void;
}

export function TallyDocumentEditor({ 
  blocks, 
  onBlocksChange, 
  className = '',
  title = '',
  description = '',
  onTitleChange,
  onDescriptionChange
}: TallyDocumentEditorProps) {
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashMenuPosition, setSlashMenuPosition] = useState({ top: 0, left: 0 });
  const [slashRange, setSlashRange] = useState<Range | null>(null);
  const [currentContent, setCurrentContent] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);
  const contentAreaRef = useRef<HTMLDivElement>(null);

  // Fonction pour obtenir les coordonnées précises du curseur
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

  // Fonction pour créer un identifiant unique
  const createUniqueId = useCallback(() => {
    return `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Gestionnaire pour l'insertion de nouvelles questions
  const insertQuestionAtCursor = useCallback((type: QuestionType) => {
    if (!slashRange || !contentAreaRef.current) return;

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

    // Créer le nouveau bloc question
    const newBlock: FormBlock = {
      id: createUniqueId(),
      type: 'question',
      content: getDefaultContent(type),
      questionType: type,
      required: false,
      options: ['checkbox', 'radio', 'select'].includes(type) ? ['Option 1', 'Option 2', 'Option 3'] : undefined,
      order: blocks.length
    };

    // Supprimer le "/" qui a déclenché le menu
    slashRange.deleteContents();

    // Créer un marqueur pour la question
    const questionMarker = document.createElement('div');
    questionMarker.className = 'question-insertion-marker';
    questionMarker.setAttribute('data-question-id', newBlock.id);
    questionMarker.innerHTML = '<br/>';
    questionMarker.contentEditable = 'false';
    
    // Insérer le marqueur à la position du curseur
    slashRange.insertNode(questionMarker);
    
    // Créer un nouveau paragraphe après la question
    const newParagraph = document.createElement('div');
    newParagraph.innerHTML = '<br/>';
    newParagraph.contentEditable = 'true';
    questionMarker.parentNode?.insertBefore(newParagraph, questionMarker.nextSibling);
    
    // Positionner le curseur dans le nouveau paragraphe
    const newRange = document.createRange();
    newRange.setStart(newParagraph, 0);
    newRange.collapse(true);
    
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(newRange);
    }

    // Ajouter le bloc à la liste
    onBlocksChange([...blocks, newBlock]);
    
    // Fermer le menu
    setShowSlashMenu(false);
    setSlashRange(null);
  }, [blocks, onBlocksChange, slashRange, createUniqueId]);

  // Gestionnaire pour l'insertion d'éléments spéciaux
  const insertSpecialBlock = useCallback((type: 'separator' | 'title') => {
    if (!slashRange) return;

    // Supprimer le "/"
    slashRange.deleteContents();

    const newBlock: FormBlock = {
      id: createUniqueId(),
      type: type,
      content: type === 'title' ? 'Nouveau titre de section' : '',
      order: blocks.length
    };

    // Créer l'élément approprié
    let specialElement: HTMLElement;
    if (type === 'separator') {
      specialElement = document.createElement('hr');
      specialElement.className = 'my-6 border-t border-border';
      specialElement.contentEditable = 'false';
    } else {
      specialElement = document.createElement('h2');
      specialElement.className = 'text-2xl font-bold text-foreground my-6';
      specialElement.contentEditable = 'true';
      specialElement.innerText = newBlock.content;
    }
    
    specialElement.setAttribute('data-block-id', newBlock.id);
    
    // Insérer l'élément
    slashRange.insertNode(specialElement);
    
    // Créer un nouveau paragraphe après
    const newParagraph = document.createElement('div');
    newParagraph.innerHTML = '<br/>';
    newParagraph.contentEditable = 'true';
    specialElement.parentNode?.insertBefore(newParagraph, specialElement.nextSibling);
    
    // Positionner le curseur
    const newRange = document.createRange();
    newRange.setStart(newParagraph, 0);
    newRange.collapse(true);
    
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(newRange);
    }

    onBlocksChange([...blocks, newBlock]);
    setShowSlashMenu(false);
    setSlashRange(null);
  }, [blocks, onBlocksChange, slashRange, createUniqueId]);

  // Gestionnaire pour la mise à jour des blocs depuis le contenu de l'éditeur
  const updateBlockFromEditor = useCallback((blockId: string, updates: Partial<FormBlock>) => {
    const updatedBlocks = blocks.map(block => 
      block.id === blockId ? { ...block, ...updates } : block
    );
    onBlocksChange(updatedBlocks);
  }, [blocks, onBlocksChange]);

  // Gestionnaire pour la suppression de blocs
  const deleteBlock = useCallback((blockId: string) => {
    // Supprimer l'élément du DOM
    const element = editorRef.current?.querySelector(`[data-question-id="${blockId}"], [data-block-id="${blockId}"]`);
    if (element) {
      element.remove();
    }
    
    // Supprimer le bloc de la liste
    const updatedBlocks = blocks.filter(block => block.id !== blockId);
    onBlocksChange(updatedBlocks);
  }, [blocks, onBlocksChange]);

  // Gestionnaire d'input pour le contenu
  const handleContentInput = useCallback((e: React.FormEvent<HTMLDivElement>) => {
    const content = e.currentTarget.textContent || '';
    setCurrentContent(content);
  }, []);

  // Gestionnaire des touches
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === '/') {
      // Petit délai pour que le "/" soit inséré puis on capture la position
      setTimeout(() => {
        const coords = getCaretCoordinates();
        if (coords) {
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0).cloneRange();
            // Capturer le "/" qui vient d'être tapé
            range.setStart(range.startContainer, Math.max(0, range.startOffset - 1));
            setSlashRange(range);
            setSlashMenuPosition(coords);
            setShowSlashMenu(true);
          }
        }
      }, 10);
    } else if (e.key === 'Escape') {
      if (showSlashMenu) {
        setShowSlashMenu(false);
        setSlashRange(null);
      }
    }
  }, [getCaretCoordinates, showSlashMenu]);

  // Gestionnaire de clic pour fermer le menu
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (showSlashMenu && !e.target?.closest('.slash-menu')) {
      setShowSlashMenu(false);
      setSlashRange(null);
    }
  }, [showSlashMenu]);

  // Rendu des questions intégrées
  useEffect(() => {
    if (!editorRef.current) return;

    const questionMarkers = editorRef.current.querySelectorAll('.question-insertion-marker');
    
    questionMarkers.forEach((marker) => {
      const questionId = marker.getAttribute('data-question-id');
      if (!questionId) return;
      
      const block = blocks.find(b => b.id === questionId);
      if (!block || block.type !== 'question') return;

      // Vérifier si le composant React n'est pas déjà rendu
      if (!marker.querySelector('.inline-question-portal')) {
        // Le composant InlineQuestionBlock va se charger de créer le portal
      }
    });
  }, [blocks]);

  return (
    <div className={`tally-document-editor relative ${className}`}>
      <div 
        ref={editorRef}
        className="document-flow min-h-[600px] outline-none focus:outline-none p-6 bg-white"
        onClick={handleClick}
      >
        {/* Titre du formulaire éditable inline */}
        <h1 
          contentEditable="true" 
          className="text-3xl font-bold text-foreground mb-4 outline-none focus:outline-none"
          onBlur={(e) => onTitleChange && onTitleChange(e.currentTarget.textContent || '')}
          suppressContentEditableWarning={true}
          data-placeholder="Titre du formulaire"
        >
          {title || ''}
        </h1>
        
        {/* Description optionnelle */}
        <p 
          contentEditable="true"
          className="text-muted-foreground mb-8 outline-none focus:outline-none"
          onBlur={(e) => onDescriptionChange && onDescriptionChange(e.currentTarget.textContent || '')}
          suppressContentEditableWarning={true}
          data-placeholder="Description du formulaire (optionnel)"
        >
          {description || ''}
        </p>
        
        {/* Zone de contenu principal */}
        <div 
          ref={contentAreaRef}
          contentEditable="true"
          className="content-area outline-none min-h-[200px]"
          onInput={handleContentInput}
          onKeyDown={handleKeyDown}
          suppressContentEditableWarning={true}
          data-placeholder="Commencez à écrire ou tapez '/' pour insérer une question..."
        >
          {/* Le contenu s'ajoute ici naturellement */}
        </div>
      </div>

      {/* Questions React rendues aux bonnes positions */}
      {blocks
        .filter(block => block.type === 'question')
        .map(block => {
          const marker = editorRef.current?.querySelector(`[data-question-id="${block.id}"]`);
          if (!marker) return null;

          return (
            <InlineQuestionBlock
              key={block.id}
              block={block}
              container={marker as HTMLElement}
              onUpdate={(updates) => updateBlockFromEditor(block.id, updates)}
              onDelete={() => deleteBlock(block.id)}
            />
          );
        })}

      {/* Menu slash positionné de manière contextuelle */}
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
