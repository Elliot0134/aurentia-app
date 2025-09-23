import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { FormBlock } from '@/types/form';
import { QuestionBlock } from './QuestionBlock';

interface InlineQuestionBlockProps {
  block: FormBlock;
  container: HTMLElement;
  onUpdate: (updates: Partial<FormBlock>) => void;
  onDelete: () => void;
}

export function InlineQuestionBlock({ block, container, onUpdate, onDelete }: InlineQuestionBlockProps) {
  const portalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Créer un portal pour rendre le composant React dans le DOM contenteditable
    if (!portalRef.current) {
      portalRef.current = document.createElement('div');
      portalRef.current.className = 'inline-question-portal';
    }
    
    // Remplacer le contenu du container par notre portal
    container.innerHTML = '';
    container.appendChild(portalRef.current);

    return () => {
      if (portalRef.current && container.contains(portalRef.current)) {
        container.removeChild(portalRef.current);
      }
    };
  }, [container]);

  if (!portalRef.current) return null;

  return ReactDOM.createPortal(
    <div className="question-inline-wrapper my-6">
      <QuestionBlock
        block={block}
        isEditing={true}
        onEdit={() => {}}
        onStopEdit={() => {}}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onDuplicate={() => {}}
        onMoveUp={() => {}}
        onMoveDown={() => {}}
        canMoveUp={false}
        canMoveDown={false}
        inlineMode={true}
      />
    </div>,
    portalRef.current
  );
}
