import React, { useState, useRef, useCallback, useEffect } from 'react';
import { FormBlock, QuestionType } from '@/types/form';
import { SlashCommandMenu } from './SlashCommandMenu';

interface FlowTallyEditorProps {
  blocks: FormBlock[];
  onBlocksChange: (blocks: FormBlock[]) => void;
  className?: string;
  title?: string;
  description?: string;
  onTitleChange?: (title: string) => void;
  onDescriptionChange?: (description: string) => void;
}

export function FlowTallyEditor({ 
  blocks, 
  onBlocksChange, 
  className = '',
  title = '',
  description = '',
  onTitleChange,
  onDescriptionChange
}: FlowTallyEditorProps) {
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashMenuPosition, setSlashMenuPosition] = useState({ top: 0, left: 0 });
  const [slashPosition, setSlashPosition] = useState<{ node: Node; offset: number } | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  // Fix retours à la ligne
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const target = e.target as HTMLElement;
      if (!target.closest('.tally-question')) {
        e.preventDefault();
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const br = document.createElement('br');
          range.deleteContents();
          range.insertNode(br);
          range.setStartAfter(br);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
        }
        return;
      }
    }
    
    if (e.key === '/') {
      setTimeout(() => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          
          setSlashPosition({
            node: range.startContainer,
            offset: Math.max(0, range.startOffset - 1)
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
    if (!slashPosition || !editorRef.current) return;

    try {
      const range = document.createRange();
      range.setStart(slashPosition.node, slashPosition.offset);
      range.setEnd(slashPosition.node, slashPosition.offset + 1);
      range.deleteContents();

      const questionId = `q_${Date.now()}`;
      
      const getQuestionTitle = (): string => {
        return 'Tapez votre question ici';
      };

      const defaultPlaceholders: Record<QuestionType, string> = {
        'text': 'Tapez votre réponse ici',
        'textarea': 'Tapez votre réponse ici',
        'email': 'nom@exemple.com',
        'phone': '+33 1 23 45 67 89',
        'number': '0',
        'date': '',
        'checkbox': '',
        'radio': '',
        'select': '',
        'rating': '',
        'file': ''
      };

      function getInputHTML(questionType: QuestionType, qId: string, placeholderValue?: string): string {
        const inputStyle = 'width: 100%; padding: 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 16px; background-color: #ffffff; color: #374151; outline: none; transition: all 0.2s ease; margin-top: 8px;';

        const currentPlaceholder = placeholderValue || defaultPlaceholders[questionType] || '';

        switch (questionType) {
          case 'text':
          case 'textarea':
          case 'email':
          case 'phone':
          case 'number':
            const inputElement = questionType === 'textarea' ? 'textarea' : 'input';
            const inputType = questionType === 'textarea' ? '' : `type="${questionType === 'text' ? 'text' : questionType}"`;
            const additionalProps = questionType === 'textarea' ? 'rows="4" style="' + inputStyle + ' resize: vertical;"' : `style="${inputStyle}"`;
            
            return `
              <div class="input-container" style="position: relative; margin-top: 8px;">
                <${inputElement} 
                  ${inputType}
                  ${additionalProps}
                  disabled 
                  data-question-id="${qId}"
                  data-input-type="${questionType}"
                ></${inputElement}>
                <div 
                  class="editable-placeholder" 
                  contenteditable="true"
                  style="
                    position: absolute; 
                    top: 18px; 
                    left: 18px; 
                    color: #9ca3af; 
                    pointer-events: auto;
                    font-size: 16px;
                    background: transparent;
                    border: none;
                    outline: none;
                    cursor: text;
                    transition: color 0.2s ease;
                    user-select: text;
                    -webkit-user-select: text;
                    -moz-user-select: text;
                    -ms-user-select: text;
                  "
                  data-placeholder-for="${qId}"
                  data-default-placeholder="${currentPlaceholder}"
                  onblur="
                    if(this.textContent.trim() === '') {
                      this.textContent = this.getAttribute('data-default-placeholder');
                      this.style.color = '#9ca3af';
                    } else {
                      this.style.color = '#374151';
                    }
                    window.updatePlaceholder && window.updatePlaceholder('${qId}', this.textContent);
                  "
                  onfocus="
                    if(this.textContent === this.getAttribute('data-default-placeholder')) {
                      this.textContent = '';
                      this.style.color = '#374151';
                    }
                  "
                >${currentPlaceholder}</div>
              </div>
            `;
            case 'date':
            return `<input type="date" style="${inputStyle}" disabled />`;
            
          case 'radio':
            return `
              <div style="margin-top: 4px;" id="radio-options-${qId}">
                <label style="display: flex; align-items: center; gap: 12px; padding: 12px 0; cursor: pointer; font-size: 16px;">
                  <input type="radio" name="radio-${qId}" style="width: 18px; height: 18px;" disabled /> 
                  <input type="text" value="Option 1" style="border: none; outline: none; background: transparent; font-size: 16px;" onchange="window.updateOption && window.updateOption('${qId}', 0, this.value)" />
                </label>
                <label style="display: flex; align-items: center; gap: 12px; padding: 12px 0; cursor: pointer; font-size: 16px;">
                  <input type="radio" name="radio-${qId}" style="width: 18px; height: 18px;" disabled /> 
                  <input type="text" value="Option 2" style="border: none; outline: none; background: transparent; font-size: 16px;" onchange="window.updateOption && window.updateOption('${qId}', 1, this.value)" />
                </label>
                <label style="display: flex; align-items: center; gap: 12px; padding: 12px 0; cursor: pointer; font-size: 16px;">
                  <input type="radio" name="radio-${qId}" style="width: 18px; height: 18px;" disabled /> 
                  <input type="text" value="Option 3" style="border: none; outline: none; background: transparent; font-size: 16px;" onchange="window.updateOption && window.updateOption('${qId}', 2, this.value)" />
                </label>
              </div>
            `;
            
          case 'checkbox':
            return `
              <div style="margin-top: 4px;" id="checkbox-options-${qId}">
                <label style="display: flex; align-items: center; gap: 12px; padding: 12px 0; cursor: pointer; font-size: 16px;">
                  <input type="checkbox" style="width: 18px; height: 18px;" disabled /> 
                  <input type="text" value="Option 1" style="border: none; outline: none; background: transparent; font-size: 16px;" onchange="window.updateOption && window.updateOption('${qId}', 0, this.value)" />
                </label>
                <label style="display: flex; align-items: center; gap: 12px; padding: 12px 0; cursor: pointer; font-size: 16px;">
                  <input type="checkbox" style="width: 18px; height: 18px;" disabled /> 
                  <input type="text" value="Option 2" style="border: none; outline: none; background: transparent; font-size: 16px;" onchange="window.updateOption && window.updateOption('${qId}', 1, this.value)" />
                </label>
                <label style="display: flex; align-items: center; gap: 12px; padding: 12px 0; cursor: pointer; font-size: 16px;">
                  <input type="checkbox" style="width: 18px; height: 18px;" disabled /> 
                  <input type="text" value="Option 3" style="border: none; outline: none; background: transparent; font-size: 16px;" onchange="window.updateOption && window.updateOption('${qId}', 2, this.value)" />
                </label>
              </div>
            `;
            
          case 'select':
            return `
              <div style="margin-top: 4px;" id="select-options-${qId}">
                <label style="display: flex; align-items: center; gap: 12px; padding: 12px 0; cursor: pointer; font-size: 16px;">
                  <input type="text" value="Option 1" style="border: none; outline: none; background: transparent; font-size: 16px;" onchange="window.updateOption && window.updateOption('${qId}', 0, this.value)" />
                </label>
                <label style="display: flex; align-items: center; gap: 12px; padding: 12px 0; cursor: pointer; font-size: 16px;">
                  <input type="text" value="Option 2" style="border: none; outline: none; background: transparent; font-size: 16px;" onchange="window.updateOption && window.updateOption('${qId}', 1, this.value)" />
                </label>
                <label style="display: flex; align-items: center; gap: 12px; padding: 12px 0; cursor: pointer; font-size: 16px;">
                  <input type="text" value="Option 3" style="border: none; outline: none; background: transparent; font-size: 16px;" onchange="window.updateOption && window.updateOption('${qId}', 2, this.value)" />
                </label>
              </div>
            `;
            
          case 'rating':
            return `
              <div style="display: flex; gap: 8px; margin-top: 4px;">
                ${[1,2,3,4,5].map(i => `
                  <span style="font-size: 28px; color: #d1d5db; cursor: pointer; transition: color 0.2s ease;" 
                        onmouseover="this.style.color='#fbbf24'" 
                        onmouseout="this.style.color='#d1d5db'">★</span>
                `).join('')}
              </div>
            `;
            
          case 'file':
            return `
              <div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 120px; border: 2px dashed #d1d5db; border-radius: 8px; color: #6b7280; margin-top: 4px; background-color: #f9fafb; font-size: 16px; transition: all 0.2s ease;"
                   onmouseover="this.style.borderColor='#3b82f6'; this.style.backgroundColor='#dbeafe'"
                   onmouseout="this.style.borderColor='#d1d5db'; this.style.backgroundColor='#f9fafb'">
                <div style="text-align: center;">
                  <div style="font-size: 24px; margin-bottom: 8px;">📎</div>
                  <div>Glissez-déposez ou cliquez pour télécharger</div>
                </div>
              </div>
            `;
            
          default:
            return `<input type="text" placeholder="Votre réponse" style="${inputStyle}" disabled />`;
        }
      }

      const newBlock: FormBlock = {
        id: questionId,
        type: 'question',
        content: getQuestionTitle(),
        questionType: type,
        required: false,
        options: ['radio', 'checkbox', 'select'].includes(type) ? ['Option 1', 'Option 2', 'Option 3'] : undefined,
        order: blocks.length,
        placeholder: defaultPlaceholders[type]
      };

      const questionHTML = `
        <div data-question-id="${questionId}" class="tally-question" style="
          margin: 0; 
          padding: 0; 
          border: none; 
          border-radius: 12px; 
          background: transparent; 
          position: relative; 
          transition: all 0.2s ease;
        ">
          <div style="margin-bottom: 8px;">
            <div 
              class="question-title" 
              contenteditable="true" 
              style="
                font-size: 20px; 
                font-weight: 600; 
                color: #9ca3af; 
                outline: none; 
                line-height: 1.4;
                border: 2px solid transparent;
                padding: 8px 12px;
                margin-left: -12px;
                border-radius: 8px;
                transition: all 0.2s ease;
                cursor: text;
                user-select: text;
                -webkit-user-select: text;
                -moz-user-select: text;
                -ms-user-select: text;
              " 
              data-default-text="${getQuestionTitle()}"
              onblur="
                if(this.textContent.trim() === '') {
                  this.textContent = this.getAttribute('data-default-text');
                  this.style.color = '#9ca3af';
                } else {
                  this.style.color = '#1a1a1a';
                }
                window.updateQuestionTitle && window.updateQuestionTitle('${questionId}', this.textContent);
              "
              onfocus="
                if(this.textContent === this.getAttribute('data-default-text')) {
                  this.textContent = '';
                  this.style.color = '#1a1a1a';
                }
              "
            >${getQuestionTitle()}</div>
          </div>

          ${getInputHTML(type, questionId, newBlock.placeholder)}

          <div class="question-options" style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #f1f5f9;">
            ${['radio', 'checkbox', 'select'].includes(type) ? `
              <button onclick="window.addOption && window.addOption('${questionId}', '${type}')" 
                      style="padding: 8px 16px; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; cursor: pointer; margin-right: 12px; transition: all 0.2s ease;"
                      onmouseover="this.style.backgroundColor='#f1f5f9'" 
                      onmouseout="this.style.backgroundColor='#f3f4f6'">
                + Ajouter une option
              </button>
            ` : ''}
          </div>
        </div>
        <div><br></div>
      `;

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = questionHTML;
      
      while (tempDiv.firstChild) {
        range.insertNode(tempDiv.firstChild);
      }

      // Positionner le curseur sur le titre de la question juste créée et le sélectionner
      setTimeout(() => {
        const questionElement = editorRef.current?.querySelector(`[data-question-id="${questionId}"] .question-title`);
        if (questionElement) {
          const selection = window.getSelection();
          const range = document.createRange();
          range.selectNodeContents(questionElement);
          selection?.removeAllRanges();
          selection?.addRange(range);
          (questionElement as HTMLElement).focus();
        }
      }, 50);

      onBlocksChange([...blocks, newBlock]);
      
    } catch (error) {
      console.error('Error inserting question:', error);
    }

    setShowSlashMenu(false);
    setSlashPosition(null);
  }, [blocks, onBlocksChange, slashPosition]);

  const insertPageBreak = useCallback(() => {
    if (!slashPosition) return;

    try {
      const range = document.createRange();
      range.setStart(slashPosition.node, slashPosition.offset);
      range.setEnd(slashPosition.node, slashPosition.offset + 1);
      range.deleteContents();

      const pageBreakHTML = `
        <div class="page-break-block" style="margin: 40px 0; text-align: center;">
          <div style="display: flex; align-items: center; justify-content: center; gap: 16px; color: #6b7280; font-size: 14px;">
            <div style="flex: 1; height: 1px; background: #d1d5db;"></div>
            <span style="padding: 8px 16px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 20px;">
              📄 Saut de page
            </span>
            <div style="flex: 1; height: 1px; background: #d1d5db;"></div>
          </div>
        </div>
        <div><br></div>
      `;

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = pageBreakHTML;
      
      while (tempDiv.firstChild) {
        range.insertNode(tempDiv.firstChild);
      }

      const newBlock: FormBlock = {
        id: `pagebreak_${Date.now()}`,
        type: 'separator',
        content: 'Page Break',
        order: blocks.length
      };

      onBlocksChange([...blocks, newBlock]);
      
    } catch (error) {
      console.error('Error inserting page break:', error);
    }

    setShowSlashMenu(false);
    setSlashPosition(null);
  }, [blocks, onBlocksChange, slashPosition]);

  const insertSpecial = useCallback((type: 'separator' | 'title') => {
    if (type === 'separator') {
      insertPageBreak();
      return;
    }

    if (!slashPosition) return;

    try {
      const range = document.createRange();
      range.setStart(slashPosition.node, slashPosition.offset);
      range.setEnd(slashPosition.node, slashPosition.offset + 1);
      range.deleteContents();

      const html = `
        <h2 contenteditable="true" style="
          font-size: 28px; 
          font-weight: bold; 
          margin: 40px 0 20px 0; 
          outline: none;
          color: #1a1a1a;
          line-height: 1.3;
          border: 2px solid transparent;
          padding: 8px 12px;
          margin-left: -12px;
          border-radius: 8px;
          transition: all 0.2s ease;
        "
        onmouseover="this.style.backgroundColor='#f8fafc'; this.style.borderColor='#e2e8f0'"
        onmouseout="this.style.backgroundColor='transparent'; this.style.borderColor='transparent'"
        onfocus="this.style.backgroundColor='#ffffff'; this.style.borderColor='#3b82f6'">
          Nouveau titre de section
        </h2>
        <div><br></div>
      `;

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      
      while (tempDiv.firstChild) {
        range.insertNode(tempDiv.firstChild);
      }

      const newBlock: FormBlock = {
        id: `title_${Date.now()}`,
        type: 'title',
        content: 'Nouveau titre de section',
        order: blocks.length
      };

      onBlocksChange([...blocks, newBlock]);
      
    } catch (error) {
      console.error('Error inserting title:', error);
    }

    setShowSlashMenu(false);
    setSlashPosition(null);
  }, [blocks, onBlocksChange, slashPosition]);

  // Fonctions globales
  useEffect(() => {
    (window as any).deleteQuestion = (questionId: string) => {
      const element = editorRef.current?.querySelector(`[data-question-id="${questionId}"]`);
      if (element) {
        const htmlElement = element as HTMLElement;
        htmlElement.style.transition = 'all 0.3s ease-out';
        htmlElement.style.transform = 'translateX(-100%)';
        htmlElement.style.opacity = '0';
        
        setTimeout(() => {
          const nextElement = htmlElement.nextElementSibling;
          if (nextElement && nextElement.innerHTML === '<br>') {
            nextElement.remove();
          }
          htmlElement.remove();
        }, 300);
      }
      
      const updatedBlocks = blocks.filter(block => block.id !== questionId);
      onBlocksChange(updatedBlocks);
    };

    (window as any).updateQuestionTitle = (questionId: string, newTitle: string) => {
      const updatedBlocks = blocks.map(block => 
        block.id === questionId ? { ...block, content: newTitle } : block
      );
      onBlocksChange(updatedBlocks);
    };

    (window as any).updatePlaceholder = (questionId: string, newPlaceholder: string) => {
      const updatedBlocks = blocks.map(block => 
        block.id === questionId ? { ...block, placeholder: newPlaceholder } : block
      );
      onBlocksChange(updatedBlocks);
    };

    (window as any).updateOption = (questionId: string, optionIndex: number, newValue: string) => {
      const updatedBlocks = blocks.map(block => {
        if (block.id === questionId && block.options) {
          const newOptions = [...block.options];
          newOptions[optionIndex] = newValue;
          return { ...block, options: newOptions };
        }
        return block;
      });
      onBlocksChange(updatedBlocks);
    };

    (window as any).addOption = (questionId: string, questionType: string) => {
      const updatedBlocks = blocks.map(block => {
        if (block.id === questionId && block.options) {
          const newOptions = [...block.options, `Option ${block.options.length + 1}`];
          return { ...block, options: newOptions };
        }
        return block;
      });
      onBlocksChange(updatedBlocks);

      setTimeout(() => {
        const container = editorRef.current?.querySelector(`#${questionType}-options-${questionId}`);
        if (container) {
          const optionIndex = container.children.length;
          const newOptionHTML = `
            <label style="display: flex; align-items: center; gap: 12px; padding: 12px 0; cursor: pointer; font-size: 16px;">
              <input type="${questionType}" ${questionType === 'radio' ? `name="${questionType}-${questionId}"` : ''} style="width: 18px; height: 18px;" disabled /> 
              <input type="text" value="Option ${optionIndex + 1}" style="border: none; outline: none; background: transparent; font-size: 16px;" onchange="window.updateOption && window.updateOption('${questionId}', ${optionIndex}, this.value)" />
            </label>
          `;
          container.insertAdjacentHTML('beforeend', newOptionHTML);
        }
      }, 100);
    };

    return () => {
      delete (window as any).deleteQuestion;
      delete (window as any).updateQuestionTitle;
      delete (window as any).updatePlaceholder;
      delete (window as any).updateOption;
      delete (window as any).addOption;
    };
  }, [blocks, onBlocksChange]);

  return (
    <div className={className} style={{ position: 'relative' }}>
      <style>{`
        .document-flow {
          line-height: 1.5 !important;
        }
        .document-flow p {
          margin: 0 !important;
          padding: 0 !important;
        }
        .document-flow br {
          line-height: 1.5 !important;
        }
        .document-flow[contenteditable="true"] {
          line-height: 1.5;
          font-family: inherit;
        }
        .editable-placeholder {
          transition: color 0.2s ease;
        }
        .question-title {
          transition: color 0.2s ease;
        }
        .input-container {
          position: relative;
        }
        /* Empêcher la sélection du contenu de l'input disabled */
        .input-container input[disabled],
        .input-container textarea[disabled] {
          user-select: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          cursor: default;
        }
        /* Permettre la sélection du placeholder éditable */
        .editable-placeholder {
          user-select: text !important;
          -webkit-user-select: text !important;
          -moz-user-select: text !important;
          -ms-user-select: text !important;
        }
      `}</style>
      
      <div 
        ref={editorRef}
        contentEditable="true"
        onKeyDown={handleKeyDown}
        className="document-flow"
        style={{
          minHeight: '600px',
          padding: '40px',
          outline: 'none',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontSize: '16px',
          lineHeight: '1.5',
          color: '#1a1a1a',
          background: 'transparent'
        }}
        suppressContentEditableWarning={true}
      >
        <h1 
          contentEditable="true"
          onBlur={(e) => onTitleChange?.(e.currentTarget.textContent || '')}
          style={{
            fontSize: '48px',
            fontWeight: '700',
            marginBottom: '8px',
            outline: 'none',
            color: '#1a1a1a',
            lineHeight: '1.2',
            border: '2px solid transparent',
            padding: '8px 12px',
            margin: '-8px -12px 16px -12px',
            borderRadius: '8px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f8fafc';
            e.currentTarget.style.borderColor = '#e2e8f0';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.borderColor = 'transparent';
          }}
          onFocus={(e) => {
            e.currentTarget.style.backgroundColor = '#ffffff';
            e.currentTarget.style.borderColor = '#3b82f6';
          }}
        >
          {title || 'Untitled'}
        </h1>
        
        <div 
          id="form-placeholder"
          style={{ 
            color: '#a0aec0', 
            cursor: 'text',
            display: blocks.length > 0 ? 'none' : 'flex',
            alignItems: 'center',
            padding: '4px 0'
          }}
          onClick={(e) => {
            const placeholder = e.currentTarget;
            const editor = editorRef.current;
            if (!editor) return;

            // Focus the main editor
            editor.focus();
            
            // Create a slash text node
            const slashNode = document.createTextNode('/');
            
            // Replace placeholder content with the slash
            const actualPlaceholder = Array.from(editor.childNodes).find(node => (node as HTMLElement).id === 'form-placeholder');
            if (actualPlaceholder) {
              editor.removeChild(actualPlaceholder);
            }
            
            editor.appendChild(slashNode);

            // Move cursor after the slash
            const selection = window.getSelection();
            if (selection) {
              const range = document.createRange();
              range.setStart(slashNode, 1);
              range.collapse(true);
              selection.removeAllRanges();
              selection.addRange(range);
            }

            // Trigger slash command menu
            handleKeyDown({ key: '/' } as React.KeyboardEvent);
          }}
        >
          <div style={{
            border: '1px solid #e2e8f0',
            borderRadius: '4px',
            padding: '2px 6px',
            fontSize: '14px',
            marginRight: '8px'
          }}>
            /
          </div>
          Cliquez pour ajouter une question
        </div>
      </div>

      {showSlashMenu && (
        <SlashCommandMenu
          position={slashMenuPosition}
          onSelectQuestion={insertQuestion}
          onSelectSpecial={(type) => {
            if (type === 'separator') {
              insertPageBreak();
            } else {
              insertSpecial(type);
            }
          }}
          onClose={() => {
            setShowSlashMenu(false);
            setSlashPosition(null);
          }}
        />
      )}
    </div>
  );
}