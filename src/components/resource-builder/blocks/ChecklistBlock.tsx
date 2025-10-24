import React, { useState } from 'react';
import { Plus, X, GripVertical, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import type { ChecklistBlock as ChecklistBlockType } from '@/types/resourceTypes';

interface ChecklistBlockProps {
  block: ChecklistBlockType;
  onUpdate: (data: Partial<ChecklistBlockType['data']>) => void;
  readOnly?: boolean;
  isActive?: boolean;
}

export function ChecklistBlock({ block, onUpdate, readOnly = false, isActive = false }: ChecklistBlockProps) {
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  const items = block.data.items || [];
  const completedCount = items.filter(item => item.checked).length;
  const progress = items.length > 0 ? (completedCount / items.length) * 100 : 0;

  const handleAddItem = () => {
    const newItem = {
      id: `item_${Date.now()}`,
      text: 'Nouvelle tâche',
      checked: false
    };
    onUpdate({ items: [...items, newItem] });
  };

  const handleDeleteItem = (itemId: string) => {
    onUpdate({ items: items.filter(item => item.id !== itemId) });
  };

  const handleToggleItem = (itemId: string) => {
    onUpdate({
      items: items.map(item =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      )
    });
  };

  const handleUpdateItemText = (itemId: string, text: string) => {
    onUpdate({
      items: items.map(item =>
        item.id === itemId ? { ...item, text } : item
      )
    });
    setEditingItemId(null);
  };

  const startEditingItem = (itemId: string, currentText: string) => {
    setEditingItemId(itemId);
    setEditingText(currentText);
  };

  if (readOnly) {
    return (
      <div className="border rounded-lg overflow-hidden bg-white">
        {/* Progress bar */}
        {items.length > 0 && (
          <div className="p-4 border-b bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Progression
              </span>
              <span className="text-sm font-medium text-gray-900">
                {completedCount}/{items.length} ({Math.round(progress)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${progress}%`,
                  backgroundColor: 'var(--color-primary, #ff5932)'
                }}
              />
            </div>
          </div>
        )}

        {/* Checklist items */}
        <div className="p-4 space-y-2">
          {items.length === 0 ? (
            <p className="text-gray-400 text-center py-4">Aucune tâche</p>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 p-2 rounded hover:bg-gray-50 transition-colors"
              >
                <Checkbox
                  checked={item.checked}
                  onCheckedChange={() => handleToggleItem(item.id)}
                  className="mt-0.5"
                />
                <span
                  className={cn(
                    'flex-1 text-sm',
                    item.checked ? 'line-through text-gray-400' : 'text-gray-900'
                  )}
                >
                  {item.text}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      {/* Progress bar */}
      {items.length > 0 && (
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Progression
            </span>
            <span className="text-sm font-medium text-gray-900">
              {completedCount}/{items.length} ({Math.round(progress)}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: `${progress}%`,
                backgroundColor: 'var(--color-primary, #ff5932)'
              }}
            />
          </div>
        </div>
      )}

      {/* Checklist items */}
      <div className="p-4 space-y-2">
        {items.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
            <CheckCircle2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 mb-4">Aucune tâche</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddItem}
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter une tâche
            </Button>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="group flex items-start gap-3 p-2 rounded hover:bg-gray-50 transition-colors"
            >
              <GripVertical className="w-4 h-4 text-gray-400 mt-0.5 cursor-grab" />
              <Checkbox
                checked={item.checked}
                onCheckedChange={() => handleToggleItem(item.id)}
                className="mt-0.5"
              />
              {editingItemId === item.id ? (
                <Input
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  onBlur={() => handleUpdateItemText(item.id, editingText)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleUpdateItemText(item.id, editingText);
                    if (e.key === 'Escape') setEditingItemId(null);
                  }}
                  className="h-7 text-sm flex-1"
                  autoFocus
                />
              ) : (
                <span
                  className={cn(
                    'flex-1 text-sm cursor-text',
                    item.checked ? 'line-through text-gray-400' : 'text-gray-900'
                  )}
                  onDoubleClick={() => startEditingItem(item.id, item.text)}
                >
                  {item.text}
                </span>
              )}
              <button
                onClick={() => handleDeleteItem(item.id)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-opacity"
              >
                <X className="w-3 h-3 text-red-600" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add button */}
      {items.length > 0 && (
        <div className="px-4 pb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAddItem}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter une tâche
          </Button>
        </div>
      )}

      {/* Info footer */}
      <div className="px-4 py-2 bg-gray-50 border-t text-xs text-gray-500">
        Double-cliquez sur une tâche pour la modifier • Glissez pour réorganiser
      </div>
    </div>
  );
}

export default ChecklistBlock;
