import React, { useState } from 'react';
import { DndContext, DragEndEvent, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, GripVertical, Edit2, Trash2, Check, X, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ResourceSection, createEmptySection, ContentBlock, BlockType, createEmptyBlock } from '@/types/resourceTypes';
import { BlockWrapper } from './BlockWrapper';
import { BlockPickerSidePanel } from './BlockPickerSidePanel';
import { getRecommendedBlocks } from '@/utils/blockRecommendations';

interface ResourceSectionBuilderProps {
  sections: ResourceSection[];
  onSectionsChange: (sections: ResourceSection[]) => void;
  organizationId?: string;
  readOnly?: boolean;
  resourceType?: string; // For block recommendations
}

interface SortableBlockItemProps {
  block: ContentBlock;
  isActive: boolean;
  onActivate: () => void;
  onUpdate: (data: any) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onAddBlock: (containerId: string) => void;
  organizationId?: string;
  allBlocks: ContentBlock[];
}

function SortableBlockItem({
  block,
  isActive,
  onActivate,
  onUpdate,
  onDuplicate,
  onDelete,
  onAddBlock,
  organizationId,
  allBlocks
}: SortableBlockItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <BlockWrapper
        block={block}
        isActive={isActive}
        onActivate={onActivate}
        onUpdate={onUpdate}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
        organizationId={organizationId}
        onAddBlock={onAddBlock}
        allBlocks={allBlocks}
        isDraggable={true}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

interface SortableSectionProps {
  section: ResourceSection;
  isEditing: boolean;
  editTitle: string;
  editDescription: string;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  onToggleCollapse: () => void;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onBlockUpdate: (blockId: string, data: any) => void;
  onBlockDuplicate: (blockId: string) => void;
  onBlockDelete: (blockId: string) => void;
  onAddBlock: (e?: React.MouseEvent) => void;
  onAddBlockToContainer: (containerId: string) => void;
  onBlocksReorder: (oldIndex: number, newIndex: number) => void;
  organizationId?: string;
}

function SortableSection({
  section,
  isEditing,
  editTitle,
  editDescription,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onToggleCollapse,
  onTitleChange,
  onDescriptionChange,
  onBlockUpdate,
  onBlockDuplicate,
  onBlockDelete,
  onAddBlock,
  onAddBlockToContainer,
  onBlocksReorder,
  organizationId,
}: SortableSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);

  // Sensors for block-level drag and drop
  const blockSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleBlockDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = section.blocks.findIndex(b => b.id === active.id);
    const newIndex = section.blocks.findIndex(b => b.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      onBlocksReorder(oldIndex, newIndex);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border-2 rounded-lg bg-white ${isDragging ? 'shadow-lg' : ''}`}
      data-tour="section-header"
    >
      {/* Section Header */}
      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-t-lg border-b">
        {/* Drag handle */}
        <div {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>

        {/* Collapse toggle */}
        {section.collapsible && !isEditing && (
          <button onClick={onToggleCollapse} className="p-1 hover:bg-gray-200 rounded">
            {section.collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        )}

        {/* Section content */}
        {isEditing ? (
          <div className="flex-1 flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
            <Input
              value={editTitle}
              onChange={(e) => onTitleChange(e.target.value)}
              className="h-8 text-sm font-medium"
              placeholder="Titre de la section"
              autoFocus
            />
            <Textarea
              value={editDescription}
              onChange={(e) => onDescriptionChange(e.target.value)}
              className="text-sm resize-none"
              placeholder="Description (optionnel)"
              rows={2}
            />
            <div className="flex gap-2">
              <Button size="sm" variant="default" onClick={onSaveEdit}>
                <Check className="w-4 h-4 mr-1" />
                Sauvegarder
              </Button>
              <Button size="sm" variant="outline" onClick={onCancelEdit}>
                <X className="w-4 h-4 mr-1" />
                Annuler
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">{section.title}</h3>
              {section.description && (
                <p className="text-xs text-gray-600 mt-1">{section.description}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onStartEdit();
                }}
              >
                <Edit2 className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Section Content (blocks) */}
      {!section.collapsed && !isEditing && (
        <div className="p-4 space-y-2 max-w-full" data-tour="section-content">
          {section.blocks.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-sm">Aucun block dans cette section</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={(e) => onAddBlock(e)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Ajouter un block
              </Button>
            </div>
          ) : (
            <>
              <DndContext
                sensors={blockSensors}
                collisionDetection={closestCenter}
                onDragEnd={handleBlockDragEnd}
              >
                <SortableContext
                  items={section.blocks.map(b => b.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {section.blocks.map((block) => (
                    <SortableBlockItem
                      key={block.id}
                      block={block}
                      isActive={activeBlockId === block.id}
                      onActivate={() => setActiveBlockId(block.id)}
                      onUpdate={(data) => onBlockUpdate(block.id, data)}
                      onDuplicate={() => onBlockDuplicate(block.id)}
                      onDelete={() => onBlockDelete(block.id)}
                      organizationId={organizationId}
                      onAddBlock={onAddBlockToContainer}
                      allBlocks={section.blocks}
                    />
                  ))}
                </SortableContext>
              </DndContext>
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2"
                onClick={(e) => onAddBlock(e)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Ajouter un block
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function ResourceSectionBuilder({
  sections,
  onSectionsChange,
  organizationId,
  readOnly = false,
  resourceType = 'standard',
}: ResourceSectionBuilderProps) {
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [deleteConfirmSectionId, setDeleteConfirmSectionId] = useState<string | null>(null);

  // State for block adding side panel
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const [currentSectionId, setCurrentSectionId] = useState<string | null>(null);
  const [currentContainerId, setCurrentContainerId] = useState<string | null>(null);

  // Get recommended blocks based on resource type
  const recommendedBlocks = getRecommendedBlocks(resourceType);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleAddSection = () => {
    const newSection = createEmptySection(`Section ${sections.length + 1}`, sections.length);
    onSectionsChange([...sections, newSection]);
  };

  const handleStartEdit = (section: ResourceSection) => {
    setEditingSectionId(section.id);
    setEditTitle(section.title);
    setEditDescription(section.description || '');
  };

  const handleSaveEdit = () => {
    if (editingSectionId) {
      const updatedSections = sections.map(section =>
        section.id === editingSectionId
          ? { ...section, title: editTitle, description: editDescription }
          : section
      );
      onSectionsChange(updatedSections);
      setEditingSectionId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingSectionId(null);
    setEditTitle('');
    setEditDescription('');
  };

  const handleDeleteSection = (sectionId: string) => {
    const updatedSections = sections.filter(section => section.id !== sectionId);
    onSectionsChange(updatedSections);
    setDeleteConfirmSectionId(null);
  };

  const handleToggleCollapse = (sectionId: string) => {
    const updatedSections = sections.map(section =>
      section.id === sectionId
        ? { ...section, collapsed: !section.collapsed }
        : section
    );
    onSectionsChange(updatedSections);
  };

  const handleBlockUpdate = (sectionId: string, blockId: string, data: any) => {
    const updatedSections = sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          blocks: section.blocks.map(block =>
            block.id === blockId ? { ...block, data: { ...block.data, ...data } } : block
          ),
        };
      }
      return section;
    });
    onSectionsChange(updatedSections);
  };

  const handleBlockDuplicate = (sectionId: string, blockId: string) => {
    const updatedSections = sections.map(section => {
      if (section.id === sectionId) {
        const block = section.blocks.find(b => b.id === blockId);
        if (block) {
          const duplicated = {
            ...block,
            id: `block_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          };
          const index = section.blocks.findIndex(b => b.id === blockId);
          return {
            ...section,
            blocks: [
              ...section.blocks.slice(0, index + 1),
              duplicated,
              ...section.blocks.slice(index + 1),
            ],
          };
        }
      }
      return section;
    });
    onSectionsChange(updatedSections);
  };

  const handleBlockDelete = (sectionId: string, blockId: string) => {
    const updatedSections = sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          blocks: section.blocks.filter(b => b.id !== blockId),
        };
      }
      return section;
    });
    onSectionsChange(updatedSections);
  };

  const handleBlocksReorder = (sectionId: string, oldIndex: number, newIndex: number) => {
    const updatedSections = sections.map(section => {
      if (section.id === sectionId) {
        const newBlocks = arrayMove(section.blocks, oldIndex, newIndex);
        return {
          ...section,
          blocks: newBlocks,
        };
      }
      return section;
    });
    onSectionsChange(updatedSections);
  };

  const handleAddBlock = (sectionId: string, event?: React.MouseEvent) => {
    setCurrentSectionId(sectionId);
    setCurrentContainerId(null);
    setShowBlockMenu(true);
  };

  // Handler for adding blocks to nested containers
  const handleAddBlockToContainer = (sectionId: string, containerId: string) => {
    setCurrentSectionId(sectionId);
    setCurrentContainerId(containerId);
    setShowBlockMenu(true);
  };

  const handleBlockTypeSelect = (blockType: BlockType) => {
    if (!currentSectionId) return;

    const newBlock = createEmptyBlock(blockType);

    // If adding to a nested container
    if (currentContainerId) {
      const updatedSections = sections.map(section => {
        if (section.id === currentSectionId) {
          return {
            ...section,
            blocks: addBlockToContainer(section.blocks, currentContainerId, newBlock)
          };
        }
        return section;
      });
      onSectionsChange(updatedSections);
    } else {
      // Adding to section root
      const updatedSections = sections.map(section => {
        if (section.id === currentSectionId) {
          return {
            ...section,
            blocks: [...section.blocks, newBlock]
          };
        }
        return section;
      });
      onSectionsChange(updatedSections);
    }

    setShowBlockMenu(false);
    setCurrentSectionId(null);
    setCurrentContainerId(null);
  };

  // Helper to add block to nested container
  const addBlockToContainer = (blocks: ContentBlock[], containerId: string, newBlock: ContentBlock): ContentBlock[] => {
    return blocks.map(block => {
      // Check if this is the target container
      if (block.id === containerId) {
        if (block.type === 'tabs' && 'data' in block && block.data.tabs) {
          // Add to the active tab
          const tabs = block.data.tabs.map((tab: any, index: number) =>
            index === 0 ? { ...tab, blocks: [...(tab.blocks || []), newBlock] } : tab
          );
          return { ...block, data: { ...block.data, tabs } };
        } else if (block.type === 'columns' && 'data' in block && block.data.columns) {
          // Add to the first column
          const columns = block.data.columns.map((col: any, index: number) =>
            index === 0 ? { ...col, blocks: [...(col.blocks || []), newBlock] } : col
          );
          return { ...block, data: { ...block.data, columns } };
        } else if (block.type === 'accordion' && 'data' in block && block.data.items) {
          // Add to the first accordion item
          const items = block.data.items.map((item: any, index: number) =>
            index === 0 ? { ...item, blocks: [...(item.blocks || []), newBlock] } : item
          );
          return { ...block, data: { ...block.data, items } };
        } else if (block.type === 'callout' && 'data' in block && block.data.blocks) {
          return { ...block, data: { ...block.data, blocks: [...block.data.blocks, newBlock] } };
        } else if (block.type === 'toggle' && 'data' in block && block.data.blocks) {
          return { ...block, data: { ...block.data, blocks: [...block.data.blocks, newBlock] } };
        } else if (block.type === 'grid' && 'data' in block && block.data.cells) {
          // Add to the first cell
          const cells = block.data.cells.map((cell: any, index: number) =>
            index === 0 ? { ...cell, blocks: [...(cell.blocks || []), newBlock] } : cell
          );
          return { ...block, data: { ...block.data, cells } };
        }
      }

      // Recursively search in nested blocks
      if (block.type === 'tabs' && 'data' in block && block.data.tabs) {
        const tabs = block.data.tabs.map((tab: any) => ({
          ...tab,
          blocks: addBlockToContainer(tab.blocks || [], containerId, newBlock)
        }));
        return { ...block, data: { ...block.data, tabs } };
      } else if (block.type === 'columns' && 'data' in block && block.data.columns) {
        const columns = block.data.columns.map((col: any) => ({
          ...col,
          blocks: addBlockToContainer(col.blocks || [], containerId, newBlock)
        }));
        return { ...block, data: { ...block.data, columns } };
      } else if (block.type === 'accordion' && 'data' in block && block.data.items) {
        const items = block.data.items.map((item: any) => ({
          ...item,
          blocks: addBlockToContainer(item.blocks || [], containerId, newBlock)
        }));
        return { ...block, data: { ...block.data, items } };
      } else if (block.type === 'grid' && 'data' in block && block.data.cells) {
        const cells = block.data.cells.map((cell: any) => ({
          ...cell,
          blocks: addBlockToContainer(cell.blocks || [], containerId, newBlock)
        }));
        return { ...block, data: { ...block.data, cells } };
      } else if ((block.type === 'callout' || block.type === 'toggle') && 'data' in block && block.data.blocks) {
        return {
          ...block,
          data: {
            ...block.data,
            blocks: addBlockToContainer(block.data.blocks, containerId, newBlock)
          }
        };
      }

      return block;
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = sections.findIndex(section => section.id === active.id);
    const newIndex = sections.findIndex(section => section.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newSections = [...sections];
      const [removed] = newSections.splice(oldIndex, 1);
      newSections.splice(newIndex, 0, removed);

      // Mettre à jour les ordres
      const reorderedSections = newSections.map((section, index) => ({
        ...section,
        order: index,
      }));

      onSectionsChange(reorderedSections);
    }
  };

  if (readOnly) {
    return (
      <div className="space-y-4">
        {sections.map((section) => (
          <div key={section.id} className="border rounded-lg bg-white">
            <div className="p-3 bg-gray-50 rounded-t-lg border-b">
              <h3 className="font-semibold text-sm">{section.title}</h3>
              {section.description && (
                <p className="text-xs text-gray-600 mt-1">{section.description}</p>
              )}
            </div>
            <div className="p-4 space-y-2">
              {section.blocks.map((block) => (
                <BlockWrapper
                  key={block.id}
                  block={block}
                  isActive={false}
                  onActivate={() => {}}
                  onUpdate={() => {}}
                  onDuplicate={() => {}}
                  onDelete={() => {}}
                  organizationId={organizationId}
                  readOnly={true}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
          {sections.map((section) => (
            <SortableSection
              key={section.id}
              section={section}
              isEditing={editingSectionId === section.id}
              editTitle={editTitle}
              editDescription={editDescription}
              onStartEdit={() => handleStartEdit(section)}
              onSaveEdit={handleSaveEdit}
              onCancelEdit={handleCancelEdit}
              onDelete={() => setDeleteConfirmSectionId(section.id)}
              onToggleCollapse={() => handleToggleCollapse(section.id)}
              onTitleChange={setEditTitle}
              onDescriptionChange={setEditDescription}
              onBlockUpdate={(blockId, data) => handleBlockUpdate(section.id, blockId, data)}
              onBlockDuplicate={(blockId) => handleBlockDuplicate(section.id, blockId)}
              onBlockDelete={(blockId) => handleBlockDelete(section.id, blockId)}
              onAddBlock={(e?: React.MouseEvent) => handleAddBlock(section.id, e)}
              onAddBlockToContainer={(containerId) => handleAddBlockToContainer(section.id, containerId)}
              onBlocksReorder={(oldIndex, newIndex) => handleBlocksReorder(section.id, oldIndex, newIndex)}
              organizationId={organizationId}
            />
          ))}
        </SortableContext>
      </DndContext>

      {/* Add section button */}
      <Button
        variant="outline"
        className="w-full border-2 border-dashed hover:bg-gray-50"
        style={{
          ['--hover-border' as string]: 'var(--color-primary, #ff5932)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-primary, #ff5932)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '';
        }}
        onClick={handleAddSection}
        data-tour="add-section-button"
      >
        <Plus className="w-4 h-4 mr-2" />
        Ajouter une section
      </Button>

      {/* Block type selection side panel */}
      <BlockPickerSidePanel
        isOpen={showBlockMenu}
        onSelectBlock={handleBlockTypeSelect}
        onClose={() => {
          setShowBlockMenu(false);
          setCurrentSectionId(null);
        }}
        recommendedBlocks={recommendedBlocks}
      />

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteConfirmSectionId !== null} onOpenChange={() => setDeleteConfirmSectionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette section ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action supprimera la section et tous ses blocks. Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmSectionId && handleDeleteSection(deleteConfirmSectionId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default ResourceSectionBuilder;
