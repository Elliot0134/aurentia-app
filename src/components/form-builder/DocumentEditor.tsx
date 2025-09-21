import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FormBlock, QuestionType } from '@/types/form';
import { SlashCommandMenu } from './SlashCommandMenu';
import { QuestionBlock } from './QuestionBlock';
import { TextEditor } from './TextEditor';

interface DocumentEditorProps {
  blocks: FormBlock[];
  onBlocksChange: (blocks: FormBlock[]) => void;
  className?: string;
}

export function DocumentEditor({ blocks, onBlocksChange, className = '' }: DocumentEditorProps) {
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashMenuPosition, setSlashMenuPosition] = useState({ top: 0, left: 0 });
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  // Sort blocks by order
  const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);

  // Initialize with empty block if no blocks
  useEffect(() => {
    if (blocks.length === 0) {
      const initialBlock: FormBlock = {
        id: `block_${Date.now()}`,
        type: 'text',
        content: '',
        order: 0
      };
      onBlocksChange([initialBlock]);
    }
  }, [blocks.length, onBlocksChange]);

  // Update block
  const updateBlock = useCallback((blockId: string, updates: Partial<FormBlock>) => {
    const updatedBlocks = blocks.map(block => 
      block.id === blockId ? { ...block, ...updates } : block
    );
    onBlocksChange(updatedBlocks);
  }, [blocks, onBlocksChange]);

  // Delete block
  const deleteBlock = useCallback((blockId: string) => {
    const updatedBlocks = blocks.filter(block => block.id !== blockId);
    const reorderedBlocks = updatedBlocks.map((block, index) => ({
      ...block,
      order: index
    }));
    onBlocksChange(reorderedBlocks);
  }, [blocks, onBlocksChange]);

  // Duplicate block
  const duplicateBlock = useCallback((blockId: string) => {
    const blockToDuplicate = blocks.find(b => b.id === blockId);
    if (!blockToDuplicate) return;
    
    const duplicatedBlock: FormBlock = {
      ...blockToDuplicate,
      id: `block_${Date.now()}`,
      content: blockToDuplicate.content,
      order: blocks.length
    };

    onBlocksChange([...blocks, duplicatedBlock]);
  }, [blocks, onBlocksChange]);

  // Move block
  const moveBlock = useCallback((blockId: string, direction: 'up' | 'down') => {
    const currentIndex = sortedBlocks.findIndex(b => b.id === blockId);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= sortedBlocks.length) return;
    
    const newBlocks = [...sortedBlocks];
    [newBlocks[currentIndex], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[currentIndex]];
    
    const reorderedBlocks = newBlocks.map((block, index) => ({
      ...block,
      order: index
    }));
    
    onBlocksChange(reorderedBlocks);
  }, [sortedBlocks, onBlocksChange]);

  // Add question block
  const addQuestionBlock = useCallback((type: QuestionType) => {
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

    const newBlock: FormBlock = {
      id: `block_${Date.now()}`,
      type: 'question',
      content: getDefaultContent(type),
      questionType: type,
      required: false,
      options: ['checkbox', 'radio', 'select'].includes(type) ? ['Option 1', 'Option 2', 'Option 3'] : undefined,
      order: blocks.length
    };

    onBlocksChange([...blocks, newBlock]);
    setShowSlashMenu(false);
    setTimeout(() => setFocusedBlockId(newBlock.id), 50);
  }, [blocks, onBlocksChange]);

  // Add special block
  const addSpecialBlock = useCallback((type: 'separator' | 'title') => {
    const newBlock: FormBlock = {
      id: `block_${Date.now()}`,
      type: type,
      content: type === 'title' ? 'Nouveau titre de section' : '',
      order: blocks.length
    };

    onBlocksChange([...blocks, newBlock]);
    setShowSlashMenu(false);
  }, [blocks, onBlocksChange]);

  return (
    <div className={`document-editor relative ${className}`}>
      <div className="min-h-[500px] space-y-4">
        {sortedBlocks.map((block, index) => {
          if (block.type === 'text') {
            return (
              <TextEditor
                key={block.id}
                content={block.content}
                onChange={(content) => updateBlock(block.id, { content })}
                onSlashCommand={(position) => {
                  setSlashMenuPosition(position);
                  setShowSlashMenu(true);
                }}
                placeholder="Tapez votre texte ou '/' pour insérer un élément..."
                autoFocus={blocks.length === 1 && !block.content}
              />
            );
          }

          if (block.type === 'question') {
            return (
              <QuestionBlock
                key={block.id}
                block={block}
                isEditing={focusedBlockId === block.id}
                onEdit={() => setFocusedBlockId(block.id)}
                onStopEdit={() => setFocusedBlockId(null)}
                onUpdate={(updates) => updateBlock(block.id, updates)}
                onDelete={() => deleteBlock(block.id)}
                onDuplicate={() => duplicateBlock(block.id)}
                onMoveUp={() => moveBlock(block.id, 'up')}
                onMoveDown={() => moveBlock(block.id, 'down')}
                canMoveUp={index > 0}
                canMoveDown={index < sortedBlocks.length - 1}
              />
            );
          }

          if (block.type === 'separator') {
            return (
              <div key={block.id} className="py-6">
                <div className="h-px bg-border"></div>
              </div>
            );
          }
          
          if (block.type === 'title') {
            return (
              <div key={block.id} className="py-4">
                <h2 className="text-2xl font-bold text-foreground">
                  {block.content}
                </h2>
              </div>
            );
          }

          return null;
        })}

        {blocks.length === 0 && (
          <div className="text-center py-16">
            <div className="text-muted-foreground text-lg mb-4">
              Commencez à écrire ou tapez "/" pour insérer un élément
            </div>
          </div>
        )}
      </div>

      {showSlashMenu && (
        <SlashCommandMenu
          position={slashMenuPosition}
          onSelectQuestion={addQuestionBlock}
          onSelectSpecial={addSpecialBlock}
          onClose={() => setShowSlashMenu(false)}
        />
      )}
    </div>
  );
}
