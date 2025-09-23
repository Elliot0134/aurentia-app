import React, { useState, useRef, useCallback, useEffect } from 'react';
import { FormBlock, QuestionType } from '@/types/form';
import { SlashCommandMenu } from './SlashCommandMenu';

interface UltraSimpleTallyEditorProps {
  blocks: FormBlock[];
  onBlocksChange: (blocks: FormBlock[]) => void;
  className?: string;
  title?: string;
  description?: string;
  onTitleChange?: (title: string) => void;
  onDescriptionChange?: (description: string) => void;
}

export function UltraSimpleTallyEditor({ 
  blocks, 
  onBlocksChange, 
  className = '',
  title = '',
  description = '',
  onTitleChange,
  onDescriptionChange
}: UltraSimpleTallyEditorProps) {
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashMenuPosition, setSlashMenuPosition] = useState({ top: 0, left: 0 });
  const [slashPosition, setSlashPosition] = useState<{ node: Node; offset: number } | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === '/') {
      setTimeout(() => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          
          // Sauvegarder la position du curseur avant le "/"
          setSlashPosition({
            node: range.startContainer,
            offset: Math.max(0, range.startOffset - 1) // Position du "/"
          });
          
          setSlashMenuPosition({
            top: rect.bottom + window.scrollY + 8,
            left: rect.left + window.scrollX
          });
          setShowSlashMenu(true);
        }
      }, 10);
    } else if (e.key === 'Escape') {
      setShowSlashMenu(false);
      setSlashPosition(null);
    }
  }, []);

  const insertQuestion = useCallback((type: QuestionType) => {
    console.log('Inserting question:', type);
    
    if (!slashPosition || !editorRef.current) {
      console.log('No slash position found');
      return;
    }

    try {
      // Créer une nouvelle range à la position sauvegardée
      const range = document.createRange();
      range.setStart(slashPosition.node, slashPosition.offset);
      range.setEnd(slashPosition.node, slashPosition.offset + 1); // Sélectionner le "/"
      
      // Supprimer le "/"
      range.deleteContents();

      const questionId = `q_${Date.now()}`;
      
      // Créer le HTML de la question
      const getQuestionHTML = (questionType: QuestionType) => {
        const questionTitle = questionType === 'email' 
          ? 'Quelle est votre adresse email ?' 
          : questionType === 'text'
          ? 'Tapez votre question ici'
          : questionType === 'textarea'
          ? 'Question à réponse longue'
          : questionType === 'phone'
          ? 'Quel est votre numéro de téléphone ?'
          : questionType === 'number'
          ? 'Entrez un nombre'
          : questionType === 'date'
          ? 'Sélectionnez une date'
          : questionType === 'radio'
          ? 'Choisissez une option'
          : questionType === 'checkbox'
          ? 'Sélectionnez une ou plusieurs options'
          : questionType === 'select'
          ? 'Sélectionnez dans la liste'
          : questionType === 'rating'
          ? 'Donnez votre évaluation'
          : questionType === 'file'
          ? 'Téléchargez vos fichiers'
          : 'Nouvelle question';

        let inputHTML = '';
        switch (questionType) {
          case 'email':
            inputHTML = `<input type="email" placeholder="nom@exemple.com" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; margin-top: 8px;" disabled />`;
            break;
          case 'text':
            inputHTML = `<input type="text" placeholder="Votre réponse" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; margin-top: 8px;" disabled />`;
            break;
          case 'textarea':
            inputHTML = `<textarea placeholder="Votre réponse longue" rows="3" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; margin-top: 8px; resize: vertical;" disabled></textarea>`;
            break;
          case 'phone':
            inputHTML = `<input type="tel" placeholder="+33 1 23 45 67 89" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; margin-top: 8px;" disabled />`;
            break;
          case 'number':
            inputHTML = `<input type="number" placeholder="0" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; margin-top: 8px;" disabled />`;
            break;
          case 'date':
            inputHTML = `<input type="date" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; margin-top: 8px;" disabled />`;
            break;
          case 'radio':
            inputHTML = `
              <div style="margin-top: 12px;">
                <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; cursor: pointer;"><input type="radio" name="radio-${questionId}" disabled /> Option 1</label>
                <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; cursor: pointer;"><input type="radio" name="radio-${questionId}" disabled /> Option 2</label>
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;"><input type="radio" name="radio-${questionId}" disabled /> Option 3</label>
              </div>
            `;
            break;
          case 'checkbox':
            inputHTML = `
              <div style="margin-top: 12px;">
                <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; cursor: pointer;"><input type="checkbox" disabled /> Option 1</label>
                <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; cursor: pointer;"><input type="checkbox" disabled /> Option 2</label>
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;"><input type="checkbox" disabled /> Option 3</label>
              </div>
            `;
            break;
          case 'select':
            inputHTML = `
              <select style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; margin-top: 8px;" disabled>
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
                ${[1,2,3,4,5].map(i => `<span style="font-size: 24px; color: #ddd; cursor: pointer;">★</span>`).join('')}
              </div>
            `;
            break;
          case 'file':
            inputHTML = `
              <div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 80px; border: 2px dashed #ddd; border-radius: 6px; color: #666; margin-top: 12px; background-color: #f9f9f9;">
                📎 Glissez-déposez ou cliquez pour télécharger
              </div>
            `;
            break;
          default:
            inputHTML = `<input type="text" placeholder="Votre réponse" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; margin-top: 8px;" disabled />`;
        }

        return `
          <div style="margin: 20px 0; padding: 20px; border: 2px solid #e5e7eb; border-radius: 8px; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1);" contenteditable="false" data-question-id="${questionId}">
            <div contenteditable="true" style="font-weight: bold; font-size: 18px; margin-bottom: 10px; outline: none; border: 2px solid transparent; padding: 4px; border-radius: 4px; transition: all 0.2s;" onblur="window.updateQuestionTitle && window.updateQuestionTitle('${questionId}', this.textContent)">
              ${questionTitle}
            </div>
            ${inputHTML}
            <button onclick="window.deleteQuestion && window.deleteQuestion('${questionId}')" style="margin-top: 12px; padding: 6px 12px; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; transition: all 0.2s;" onmouseover="this.style.backgroundColor='#dc2626'" onmouseout="this.style.backgroundColor='#ef4444'">
              Supprimer
            </button>
          </div>
          <div><br/></div>
        `;
      };

      const questionHTML = getQuestionHTML(type);
      
      // Créer un élément temporaire
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = questionHTML;
      
      // Insérer les éléments
      while (tempDiv.firstChild) {
        range.insertNode(tempDiv.firstChild);
      }

      // Créer le bloc de données
      const newBlock: FormBlock = {
        id: questionId,
        type: 'question',
        content: type === 'email' ? 'Quelle est votre adresse email ?' : 'Nouvelle question',
        questionType: type,
        required: false,
        options: ['radio', 'checkbox', 'select'].includes(type) ? ['Option 1', 'Option 2', 'Option 3'] : undefined,
        order: blocks.length
      };

      console.log('Adding block:', newBlock);
      onBlocksChange([...blocks, newBlock]);
      
    } catch (error) {
      console.error('Error inserting question:', error);
    }
    
    setShowSlashMenu(false);
    setSlashPosition(null);
  }, [blocks, onBlocksChange, slashPosition]);

  const insertSpecial = useCallback((type: 'separator' | 'title') => {
    if (!slashPosition || !editorRef.current) {
      console.log('No slash position found for special block');
      return;
    }

    try {
      const range = document.createRange();
      range.setStart(slashPosition.node, slashPosition.offset);
      range.setEnd(slashPosition.node, slashPosition.offset + 1);
      range.deleteContents();

      let html = '';
      if (type === 'separator') {
        html = '<hr style="margin: 30px 0; border: 1px solid #eee;" /><div><br/></div>';
      } else {
        html = '<h2 contenteditable="true" style="font-size: 24px; font-weight: bold; margin: 20px 0; outline: none; border: 2px solid transparent; padding: 4px; border-radius: 4px; transition: all 0.2s;">Nouveau titre</h2><div><br/></div>';
      }

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      
      while (tempDiv.firstChild) {
        range.insertNode(tempDiv.firstChild);
      }

      const newBlock: FormBlock = {
        id: `block_${Date.now()}`,
        type: type,
        content: type === 'title' ? 'Nouveau titre' : '',
        order: blocks.length
      };

      onBlocksChange([...blocks, newBlock]);
      
    } catch (error) {
      console.error('Error inserting special block:', error);
    }

    setShowSlashMenu(false);
    setSlashPosition(null);
  }, [blocks, onBlocksChange, slashPosition]);

  // Fonctions globales pour gérer les questions
  useEffect(() => {
    // Fonction pour supprimer une question
    (window as any).deleteQuestion = (questionId: string) => {
      console.log('Deleting question:', questionId);
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

    // Fonction pour mettre à jour le titre d'une question
    (window as any).updateQuestionTitle = (questionId: string, newTitle: string) => {
      console.log('Updating question title:', questionId, newTitle);
      const updatedBlocks = blocks.map(block => 
        block.id === questionId ? { ...block, content: newTitle } : block
      );
      onBlocksChange(updatedBlocks);
    };

    return () => {
      delete (window as any).deleteQuestion;
      delete (window as any).updateQuestionTitle;
    };
  }, [blocks, onBlocksChange]);

  return (
    <div className={className} style={{ position: 'relative' }}>
      <div 
        ref={editorRef}
        contentEditable="true"
        onKeyDown={handleKeyDown}
        style={{
          minHeight: '600px',
          padding: '40px',
          outline: 'none',
          fontFamily: 'system-ui, sans-serif',
          fontSize: '16px',
          lineHeight: '1.5',
          background: 'white',
          border: '1px solid #eee',
          borderRadius: '8px'
        }}
        suppressContentEditableWarning={true}
      >
        <h1 
          contentEditable="true"
          onBlur={(e) => onTitleChange?.(e.currentTarget.textContent || '')}
          style={{
            fontSize: '32px',
            fontWeight: 'bold',
            marginBottom: '16px',
            outline: 'none',
            padding: '8px',
            margin: '-8px -8px 16px -8px',
            borderRadius: '4px',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f5f5f5')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          {title || 'Titre du formulaire'}
        </h1>
        
        <p 
          contentEditable="true"
          onBlur={(e) => onDescriptionChange?.(e.currentTarget.textContent || '')}
          style={{
            color: '#666',
            marginBottom: '32px',
            outline: 'none',
            padding: '8px',
            margin: '-8px -8px 32px -8px',
            borderRadius: '4px',
            minHeight: '24px',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f5f5f5')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          {description || 'Description du formulaire (optionnel)'}
        </p>
        
        <div style={{ minHeight: '200px' }}>
          Commencez à écrire ou tapez "/" pour insérer une question...
        </div>
      </div>

      {showSlashMenu && (
        <SlashCommandMenu
          position={slashMenuPosition}
          onSelectQuestion={insertQuestion}
          onSelectSpecial={insertSpecial}
          onClose={() => setShowSlashMenu(false)}
        />
      )}
    </div>
  );
}
