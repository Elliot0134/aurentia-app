import React, { useState, useRef, useEffect, useCallback } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SlashCommandMenu } from './SlashCommandMenu';
import { QuestionBlock } from './QuestionBlock';
import { FormSettings } from './FormSettings';
import { generateId } from '@/lib/utils';
import { QuestionType } from '@/types/form'; // Import QuestionType

export interface Question {
  id: string;
  type: QuestionType; // Use QuestionType from form.ts
  title: string;
  description?: string;
  required: boolean;
  placeholder?: string;
  defaultValue?: string;
  helpText?: string;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

interface FormData {
  title: string;
  description: string;
  questions: Question[];
}

interface FormBuilderProps {
  initialData?: Partial<FormData>;
  onSave: (data: FormData) => void;
  onPublish: (data: FormData) => void;
}

export function FormBuilder({ initialData, onSave, onPublish }: FormBuilderProps) {
  const [formData, setFormData] = useState<FormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    questions: initialData?.questions || [],
  });

  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashMenuPosition, setSlashMenuPosition] = useState({ top: 0, left: 0 });
  const [slashMenuContext, setSlashMenuContext] = useState<{
    questionId?: string;
    insertIndex?: number;
  }>({});
  const [draggedQuestion, setDraggedQuestion] = useState<Question | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsQuestionId, setSettingsQuestionId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);

  // Auto-save functionality
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      onSave(formData);
    }, 500);

    return () => clearTimeout(saveTimer);
  }, [formData, onSave]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !showSlashMenu) {
        const target = e.target as HTMLElement;
        // Check if we're in an editable element or clicked on empty space
        if (target.isContentEditable || target === document.body || target.closest('.cursor-text')) {
          e.preventDefault();
          handleSlashCommand(e);
        }
      } else if (e.key === 'Escape') {
        setShowSlashMenu(false);
        setActiveQuestionId(null);
        setShowSettings(false);
      } else if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        if (activeQuestionId) {
          duplicateQuestion(activeQuestionId);
        }
      } else if (e.key === 'Delete' && activeQuestionId && !showSlashMenu) {
        e.preventDefault();
        deleteQuestion(activeQuestionId);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeQuestionId, showSlashMenu, formData.questions.length]);

  const handleSlashCommand = (e: KeyboardEvent) => {
    // Get cursor position or use mouse position as fallback
    let position = { top: 0, left: 0 };
    
    const selection = window.getSelection();
    if (selection?.rangeCount) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      position = {
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
      };
    } else {
      // Fallback to center of screen
      position = {
        top: window.scrollY + window.innerHeight / 2,
        left: window.scrollX + window.innerWidth / 2 - 125,
      };
    }
    
    setSlashMenuPosition(position);

    // Determine context based on target element
    const target = e.target as HTMLElement;
    const questionElement = target.closest('[data-question-id]');
    
    if (questionElement) {
      const questionId = questionElement.getAttribute('data-question-id');
      setSlashMenuContext({ questionId: questionId || undefined });
    } else {
      // Adding new question at the end
      setSlashMenuContext({ insertIndex: formData.questions.length });
    }

    setShowSlashMenu(true);
  };

  const handleQuestionTypeSelect = (type: QuestionType) => { // Changed type to QuestionType
    console.log('Question type selected in FormBuilder:', type);
    
    const newQuestion: Question = {
      id: generateId(),
      type,
      title: 'Question sans titre',
      required: false,
    };

    console.log('New question created:', newQuestion);

    if (slashMenuContext.questionId) {
      // Replace existing question type
      console.log('Updating existing question:', slashMenuContext.questionId);
      setFormData(prev => {
        const updated = {
          ...prev,
          questions: prev.questions.map(q => 
            q.id === slashMenuContext.questionId 
              ? { ...q, type }
              : q
          ),
        };
        console.log('Updated form data:', updated);
        return updated;
      });
      setActiveQuestionId(slashMenuContext.questionId);
    } else {
      // Insert new question
      const insertIndex = slashMenuContext.insertIndex ?? formData.questions.length;
      console.log('Inserting new question at index:', insertIndex);
      
      setFormData(prev => {
        const updated = {
          ...prev,
          questions: [
            ...prev.questions.slice(0, insertIndex),
            newQuestion,
            ...prev.questions.slice(insertIndex),
          ],
        };
        console.log('Updated form data with new question:', updated);
        return updated;
      });
      setActiveQuestionId(newQuestion.id);
    }

    setShowSlashMenu(false);
    setSlashMenuContext({});
  };

  const updateQuestion = useCallback((questionId: string, updates: Partial<Question>) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
        q.id === questionId ? { ...q, ...updates } : q
      ),
    }));
  }, []);

  const duplicateQuestion = (questionId: string) => {
    const question = formData.questions.find(q => q.id === questionId);
    if (!question) return;

    const duplicated: Question = {
      ...question,
      id: generateId(),
      title: `${question.title} (copie)`,
    };

    const index = formData.questions.findIndex(q => q.id === questionId);
    setFormData(prev => ({
      ...prev,
      questions: [
        ...prev.questions.slice(0, index + 1),
        duplicated,
        ...prev.questions.slice(index + 1),
      ],
    }));
  };

  const deleteQuestion = (questionId: string) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId),
    }));
    setActiveQuestionId(null);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const question = formData.questions.find(q => q.id === event.active.id);
    setDraggedQuestion(question || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      setDraggedQuestion(null);
      return;
    }

    const oldIndex = formData.questions.findIndex(q => q.id === active.id);
    const newIndex = formData.questions.findIndex(q => q.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newQuestions = [...formData.questions];
      const [removed] = newQuestions.splice(oldIndex, 1);
      newQuestions.splice(newIndex, 0, removed);

      setFormData(prev => ({
        ...prev,
        questions: newQuestions,
      }));
    }

    setDraggedQuestion(null);
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    
    // Check if clicking on empty space or specific clickable areas
    if (
      target === containerRef.current || 
      target.classList.contains('cursor-text') ||
      target.classList.contains('empty-state')
    ) {
      e.preventDefault();
      e.stopPropagation();
      
      console.log('Container clicked, showing slash menu');
      
      setSlashMenuPosition({
        top: e.clientY + window.scrollY + 8,
        left: e.clientX + window.scrollX,
      });
      
      setSlashMenuContext({ insertIndex: formData.questions.length });
      setShowSlashMenu(true);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div 
          ref={containerRef}
          className="max-w-2xl mx-auto p-8 cursor-text min-h-screen"
          onClick={handleContainerClick}
        >
          {/* Form Title */}
          <div
            ref={titleRef}
            contentEditable
            suppressContentEditableWarning
            className="text-4xl font-bold mb-4 outline-none border-2 border-transparent hover:border-gray-200 focus:border-blue-500 focus:bg-blue-50 rounded p-2 transition-all duration-150"
            // placeholder="Titre du formulaire" // Removed placeholder
            onBlur={(e) => setFormData(prev => ({ ...prev, title: e.currentTarget.textContent || '' }))}
            onFocus={() => setActiveQuestionId(null)}
          >
            {formData.title}
          </div>

          {/* Form Description */}
          <div
            ref={descriptionRef}
            contentEditable
            suppressContentEditableWarning
            className="text-lg text-gray-600 mb-8 outline-none border-2 border-transparent hover:border-gray-200 focus:border-blue-500 focus:bg-blue-50 rounded p-2 transition-all duration-150"
            // placeholder="Description du formulaire (optionnel)" // Removed placeholder
            onBlur={(e) => setFormData(prev => ({ ...prev, description: e.currentTarget.textContent || '' }))}
            onFocus={() => setActiveQuestionId(null)}
          >
            {formData.description}
          </div>

          {/* Questions */}
          <SortableContext items={formData.questions.map(q => q.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-6">
              {formData.questions.map((question, index) => (
                <QuestionBlock
                  key={question.id}
                  question={question}
                  isActive={activeQuestionId === question.id}
                  onActivate={() => setActiveQuestionId(question.id)}
                  onUpdate={(updates) => updateQuestion(question.id, updates)}
                  onDuplicate={() => duplicateQuestion(question.id)}
                  onDelete={() => deleteQuestion(question.id)}
                  onOpenSettings={() => {
                    setSettingsQuestionId(question.id);
                    setShowSettings(true);
                  }}
                />
              ))}
            </div>
          </SortableContext>

          {/* Empty state */}
          {formData.questions.length === 0 && (
            <div 
              className="text-center py-16 text-gray-400 cursor-pointer empty-state"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Empty state clicked');
                setSlashMenuPosition({
                  top: e.clientY + window.scrollY + 8,
                  left: e.clientX + window.scrollX,
                });
                setSlashMenuContext({ insertIndex: 0 });
                setShowSlashMenu(true);
              }}
            >
              <p className="text-lg mb-2">Cliquez n'importe où pour ajouter votre première question</p>
              <p className="text-sm">ou tapez "/" pour voir toutes les options</p>
            </div>
          )}
        </div>

        <DragOverlay>
          {draggedQuestion && (
            <div className="opacity-50 transform rotate-2">
              <QuestionBlock
                question={draggedQuestion}
                isActive={false}
                onActivate={() => {}}
                onUpdate={() => {}}
                onDuplicate={() => {}}
                onDelete={() => {}}
                onOpenSettings={() => {}}
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Slash Command Menu */}
      {showSlashMenu && (
        <SlashCommandMenu
          position={slashMenuPosition}
          onSelectQuestion={handleQuestionTypeSelect} // Changed prop name
          onSelectSpecial={() => {}} // Added for compatibility, no special blocks in FormBuilder
          onClose={() => setShowSlashMenu(false)}
        />
      )}

      {/* Settings Panel */}
      {showSettings && settingsQuestionId && (
        <FormSettings
          question={formData.questions.find(q => q.id === settingsQuestionId)!}
          onUpdate={(updates) => updateQuestion(settingsQuestionId, updates)}
          onClose={() => {
            setShowSettings(false);
            setSettingsQuestionId(null);
          }}
        />
      )}

      {/* Action Bar */}
      <div className="fixed bottom-6 right-6 flex gap-3">
        <button
          onClick={() => onSave(formData)}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
        >
          Enregistrer
        </button>
        <button
          onClick={() => onPublish(formData)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Publier
        </button>
      </div>
    </div>
  );
}
