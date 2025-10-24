import React, { useState } from 'react';
import { DndContext, DragEndEvent, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { ToggleLayoutBlock, ContentBlock } from '@/types/resourceTypes';

interface ToggleLayoutBlockProps {
  block: ToggleLayoutBlock;
  onUpdate: (data: Partial<ToggleLayoutBlock['data']>) => void;
  onBlockUpdate?: (blockId: string, data: any) => void;
  onAddBlock?: (containerId: string) => void;
  onDeleteBlock?: (blockId: string) => void;
  organizationId?: string;
  readOnly?: boolean;
  renderBlock?: (block: ContentBlock) => React.ReactNode;
}

export function ToggleLayoutBlock({
  block,
  onUpdate,
  onBlockUpdate,
  onAddBlock,
  onDeleteBlock,
  organizationId,
  readOnly = false,
  renderBlock
}: ToggleLayoutBlockProps) {
  const [isOpen, setIsOpen] = useState(block.data.defaultOpen ?? false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editingTitle, setEditingTitle] = useState(block.data.title);

  // Sensors for block-level drag and drop
  const blockSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Handle nested block reordering within toggle
  const handleBlockDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = block.data.blocks.findIndex(b => b.id === active.id);
    const newIndex = block.data.blocks.findIndex(b => b.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newBlocks = arrayMove(block.data.blocks, oldIndex, newIndex);
      onUpdate({ blocks: newBlocks });
    }
  };

  const handleSaveTitle = () => {
    onUpdate({ title: editingTitle });
    setIsEditingTitle(false);
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      {/* Toggle header */}
      <div
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors group"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-500 flex-shrink-0" />
        )}
        {isEditingTitle && !readOnly ? (
          <Input
            value={editingTitle}
            onChange={(e) => setEditingTitle(e.target.value)}
            onBlur={handleSaveTitle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveTitle();
              if (e.key === 'Escape') {
                setEditingTitle(block.data.title);
                setIsEditingTitle(false);
              }
            }}
            className="h-7 text-sm flex-1"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <h3
            className="font-medium text-gray-900 flex-1"
            onDoubleClick={(e) => {
              e.stopPropagation();
              if (!readOnly) {
                setIsEditingTitle(true);
              }
            }}
          >
            {block.data.title}
          </h3>
        )}
        {!readOnly && !isEditingTitle && (
          <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
            Double-cliquez pour éditer
          </span>
        )}
      </div>

      {/* Toggle content */}
      {isOpen && (
        <div className="px-4 pb-4 pl-12 border-t">
          {block.data.blocks.length === 0 && !readOnly ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg mt-4">
              <p className="text-gray-400 text-sm mb-3">Section vide</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAddBlock?.(block.id)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un bloc
              </Button>
            </div>
          ) : (
            <DndContext
              sensors={blockSensors}
              collisionDetection={closestCenter}
              onDragEnd={handleBlockDragEnd}
            >
              <SortableContext
                items={block.data.blocks.map(b => b.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4 mt-4">
                  {block.data.blocks.map((childBlock) => (
                    <div key={childBlock.id}>
                      {renderBlock ? renderBlock(childBlock) : (
                        <div className="p-4 border rounded bg-gray-50">
                          Block type: {childBlock.type}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      )}

      {/* Settings footer (only in edit mode when closed) */}
      {!readOnly && !isOpen && (
        <div className="px-4 py-2 bg-gray-50 border-t text-xs text-gray-500">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={block.data.defaultOpen ?? false}
              onChange={(e) => onUpdate({ defaultOpen: e.target.checked })}
              className="rounded"
            />
            Ouvert par défaut
          </label>
        </div>
      )}
    </div>
  );
}

export default ToggleLayoutBlock;
