import React, { useState } from 'react';
import { DndContext, DragEndEvent, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { Plus, ChevronDown, ChevronRight, Trash2, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import type { AccordionLayoutBlock, ContentBlock } from '@/types/resourceTypes';

interface AccordionLayoutBlockProps {
  block: AccordionLayoutBlock;
  onUpdate: (data: Partial<AccordionLayoutBlock['data']>) => void;
  onBlockUpdate?: (sectionId: string, blockId: string, data: any) => void;
  onAddBlock?: (sectionId: string) => void;
  onDeleteBlock?: (sectionId: string, blockId: string) => void;
  organizationId?: string;
  readOnly?: boolean;
  renderBlock?: (block: ContentBlock, sectionId: string) => React.ReactNode;
}

export function AccordionLayoutBlock({
  block,
  onUpdate,
  onBlockUpdate,
  onAddBlock,
  onDeleteBlock,
  organizationId,
  readOnly = false,
  renderBlock
}: AccordionLayoutBlockProps) {
  const [openSections, setOpenSections] = useState<string[]>(
    block.data.sections
      .filter((_, index) => index === 0) // First section open by default
      .map(section => section.id)
  );
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const allowMultiple = block.data.allowMultiple ?? true;

  const toggleSection = (sectionId: string) => {
    if (allowMultiple) {
      setOpenSections(prev =>
        prev.includes(sectionId)
          ? prev.filter(id => id !== sectionId)
          : [...prev, sectionId]
      );
    } else {
      setOpenSections(prev =>
        prev.includes(sectionId) ? [] : [sectionId]
      );
    }
  };

  const handleAddSection = () => {
    const newSectionId = `section_${Date.now()}`;
    const newSections = [
      ...block.data.sections,
      {
        id: newSectionId,
        title: `Section ${block.data.sections.length + 1}`,
        blocks: []
      }
    ];
    onUpdate({ sections: newSections });
  };

  const handleDeleteSection = (sectionId: string) => {
    if (block.data.sections.length <= 1) return;

    const newSections = block.data.sections.filter(section => section.id !== sectionId);
    onUpdate({ sections: newSections });
    setOpenSections(prev => prev.filter(id => id !== sectionId));
  };

  const handleRenameSection = (sectionId: string, newTitle: string) => {
    const newSections = block.data.sections.map(section =>
      section.id === sectionId ? { ...section, title: newTitle } : section
    );
    onUpdate({ sections: newSections });
    setEditingSectionId(null);
  };

  const startEditingSection = (sectionId: string, currentTitle: string) => {
    setEditingSectionId(sectionId);
    setEditingTitle(currentTitle);
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      {/* Header with controls */}
      {!readOnly && (
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="text-sm font-medium text-gray-700">
            Accordéon ({block.data.sections.length} section(s))
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Label htmlFor="allow-multiple" className="text-xs">
                Plusieurs sections ouvertes
              </Label>
              <Switch
                id="allow-multiple"
                checked={allowMultiple}
                onCheckedChange={(checked) => onUpdate({ allowMultiple: checked })}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddSection}
            >
              <Plus className="w-4 h-4 mr-1" />
              Section
            </Button>
          </div>
        </div>
      )}

      {/* Accordion sections */}
      <div>
        {block.data.sections.map((section, index) => {
          const isOpen = openSections.includes(section.id);

          return (
            <div
              key={section.id}
              className={cn(
                'border-b last:border-b-0',
                isOpen && 'bg-gray-50'
              )}
            >
              {/* Section header */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors group"
                onClick={() => toggleSection(section.id)}
              >
                <div className="flex items-center gap-3 flex-1">
                  {isOpen ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  )}
                  {editingSectionId === section.id ? (
                    <Input
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onBlur={() => handleRenameSection(section.id, editingTitle)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRenameSection(section.id, editingTitle);
                        if (e.key === 'Escape') setEditingSectionId(null);
                      }}
                      className="h-7 text-sm"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <h3
                      className="font-medium text-gray-900"
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        if (!readOnly) startEditingSection(section.id, section.title);
                      }}
                    >
                      {section.title}
                    </h3>
                  )}
                </div>
                {!readOnly && block.data.sections.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSection(section.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-opacity"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                )}
              </div>

              {/* Section content */}
              {isOpen && (() => {
                // Sensors for this section's blocks
                const blockSensors = useSensors(
                  useSensor(PointerSensor, {
                    activationConstraint: {
                      distance: 8,
                    },
                  })
                );

                // Handle nested block reordering within this section
                const handleBlockDragEnd = (event: DragEndEvent) => {
                  const { active, over } = event;
                  if (!over || active.id === over.id) return;

                  const oldIndex = section.blocks.findIndex(b => b.id === active.id);
                  const newIndex = section.blocks.findIndex(b => b.id === over.id);

                  if (oldIndex !== -1 && newIndex !== -1) {
                    const newBlocks = arrayMove(section.blocks, oldIndex, newIndex);
                    const newSections = block.data.sections.map(s =>
                      s.id === section.id ? { ...s, blocks: newBlocks } : s
                    );
                    onUpdate({ sections: newSections });
                  }
                };

                return (
                  <div className="px-4 pb-4 pl-12">
                    {section.blocks.length === 0 && !readOnly ? (
                      <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                        <p className="text-gray-400 text-sm mb-3">Section vide</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onAddBlock?.(section.id)}
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
                          items={section.blocks.map(b => b.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="space-y-4">
                            {section.blocks.map((childBlock) => (
                              <div key={childBlock.id}>
                                {renderBlock ? renderBlock(childBlock, section.id) : (
                                  <div className="p-4 border rounded bg-white">
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
                );
              })()}
            </div>
          );
        })}
      </div>

      {/* Info footer */}
      {!readOnly && (
        <div className="px-4 py-2 bg-gray-50 border-t text-xs text-gray-500">
          Double-cliquez sur un titre pour le modifier
        </div>
      )}
    </div>
  );
}

export default AccordionLayoutBlock;
