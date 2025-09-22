import React, { useState } from 'react';
import { FormBlock, QuestionType } from '@/types/form'; // Import FormBlock and QuestionType
import { X, Plus, Trash2 } from 'lucide-react';

interface FormSettingsProps {
  block: FormBlock; // Changed from question to block
  onUpdate: (updates: Partial<FormBlock>) => void; // Changed from Question to FormBlock
  onClose: () => void;
}

export function FormSettings({ block, onUpdate, onClose }: FormSettingsProps) {
  const [localBlock, setLocalBlock] = useState(block);

  const handleSave = () => {
    onUpdate(localBlock);
    onClose();
  };

  const handleAddOption = () => {
    const newOptions = [...(localBlock.options || []), ''];
    setLocalBlock({ ...localBlock, options: newOptions });
  };

  const handleUpdateOption = (index: number, value: string) => {
    const newOptions = [...(localBlock.options || [])];
    newOptions[index] = value;
    setLocalBlock({ ...localBlock, options: newOptions });
  };

  const handleRemoveOption = (index: number) => {
    const newOptions = [...(localBlock.options || [])];
    newOptions.splice(index, 1);
    setLocalBlock({ ...localBlock, options: newOptions });
  };

  const requiresOptions = ['radio', 'checkbox', 'select'].includes(localBlock.questionType || ''); // Changed types and added null check

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-transparent shadow-xl border-l border-gray-200 z-50 overflow-y-auto animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="sticky top-0 bg-transparent border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Paramètres de la question</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Settings Content */}
      <div className="p-4 space-y-6">
        {/* Required Toggle */}
        <div>
          <label className="flex items-center justify-between">
            <span className="text-sm font-medium">Question obligatoire</span>
            <input
              type="checkbox"
              checked={localBlock.required || false} // Added default false
              onChange={(e) => setLocalBlock({ ...localBlock, required: e.target.checked })}
              className="rounded border-gray-300"
            />
          </label>
          <p className="text-xs text-gray-500 mt-1">
            Les utilisateurs devront répondre à cette question
          </p>
        </div>

        {/* Placeholder Text */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Texte d'aide (placeholder)
          </label>
          <input
            type="text"
            value={localBlock.placeholder || ''}
            onChange={(e) => setLocalBlock({ ...localBlock, placeholder: e.target.value })}
            placeholder="Ex: Entrez votre nom complet"
            className="w-full p-2 border border-gray-200 rounded-lg text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            Texte affiché dans le champ avant que l'utilisateur ne tape
          </p>
        </div>

        {/* Options for choice questions */}
        {requiresOptions && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Options</label>
              <button
                onClick={handleAddOption}
                className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
              >
                <Plus className="h-3 w-3" />
                Ajouter
              </button>
            </div>
            <div className="space-y-2">
              {(localBlock.options || []).map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleUpdateOption(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1 p-2 border border-gray-200 rounded text-sm"
                  />
                  <button
                    onClick={() => handleRemoveOption(index)}
                    className="p-1 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            {(localBlock.options || []).length === 0 && (
              <button
                onClick={handleAddOption}
                className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-gray-400 transition-colors"
              >
                Cliquez pour ajouter une option
              </button>
            )}
          </div>
        )}

        {/* Validation Rules */}
        {/* Removed validation rules as it's not part of FormBlock */}
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 bg-transparent border-t border-gray-200 p-4">
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
}
