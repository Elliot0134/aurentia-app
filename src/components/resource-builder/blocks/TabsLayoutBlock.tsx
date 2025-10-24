import React, { useState } from 'react';
import { DndContext, DragEndEvent, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { Plus, X, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { TabsLayoutBlock, ContentBlock } from '@/types/resourceTypes';
import { createEmptyBlock } from '@/types/resourceTypes';

interface TabsLayoutBlockProps {
  block: TabsLayoutBlock;
  onUpdate: (data: Partial<TabsLayoutBlock['data']>) => void;
  onBlockUpdate?: (tabId: string, blockId: string, data: any) => void;
  onAddBlock?: (tabId: string) => void;
  onDeleteBlock?: (tabId: string, blockId: string) => void;
  organizationId?: string;
  readOnly?: boolean;
  renderBlock?: (block: ContentBlock, tabId: string) => React.ReactNode;
}

export function TabsLayoutBlock({
  block,
  onUpdate,
  onBlockUpdate,
  onAddBlock,
  onDeleteBlock,
  organizationId,
  readOnly = false,
  renderBlock
}: TabsLayoutBlockProps) {
  const [activeTab, setActiveTab] = useState(block.data.activeTab || block.data.tabs[0]?.id);
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingTabLabel, setEditingTabLabel] = useState('');

  // Sensors for block-level drag and drop
  const blockSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Handle nested block reordering within active tab
  const handleBlockDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeTabData = block.data.tabs.find(tab => tab.id === activeTab);
    if (!activeTabData) return;

    const oldIndex = activeTabData.blocks.findIndex(b => b.id === active.id);
    const newIndex = activeTabData.blocks.findIndex(b => b.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newBlocks = arrayMove(activeTabData.blocks, oldIndex, newIndex);
      const newTabs = block.data.tabs.map(tab =>
        tab.id === activeTab ? { ...tab, blocks: newBlocks } : tab
      );
      onUpdate({ tabs: newTabs });
    }
  };

  const handleAddTab = () => {
    const newTabId = `tab_${Date.now()}`;
    const newTabs = [
      ...block.data.tabs,
      {
        id: newTabId,
        label: `Tab ${block.data.tabs.length + 1}`,
        blocks: []
      }
    ];
    onUpdate({ tabs: newTabs });
    setActiveTab(newTabId);
  };

  const handleDeleteTab = (tabId: string) => {
    if (block.data.tabs.length <= 1) return; // Ne pas supprimer le dernier tab

    const newTabs = block.data.tabs.filter(tab => tab.id !== tabId);
    onUpdate({ tabs: newTabs });

    // Si on supprime le tab actif, activer le premier
    if (activeTab === tabId) {
      setActiveTab(newTabs[0].id);
    }
  };

  const handleRenameTab = (tabId: string, newLabel: string) => {
    const newTabs = block.data.tabs.map(tab =>
      tab.id === tabId ? { ...tab, label: newLabel } : tab
    );
    onUpdate({ tabs: newTabs });
    setEditingTabId(null);
  };

  const startEditingTab = (tabId: string, currentLabel: string) => {
    setEditingTabId(tabId);
    setEditingTabLabel(currentLabel);
  };

  const activeTabData = block.data.tabs.find(tab => tab.id === activeTab);

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      {/* Tabs header */}
      <div className="border-b bg-gray-50 px-2">
        <div className="flex items-center gap-1 overflow-x-auto">
          {block.data.tabs.map((tab) => (
            <div
              key={tab.id}
              className={cn(
                "group relative flex items-center gap-2 px-4 py-2.5 border-b-2 transition-colors cursor-pointer",
                activeTab === tab.id
                  ? "bg-white"
                  : "border-transparent hover:bg-gray-100"
              )}
              style={activeTab === tab.id ? {
                borderBottomColor: 'var(--color-primary, #ff5932)'
              } : undefined}
              onClick={() => setActiveTab(tab.id)}
            >
              {editingTabId === tab.id ? (
                <Input
                  value={editingTabLabel}
                  onChange={(e) => setEditingTabLabel(e.target.value)}
                  onBlur={() => handleRenameTab(tab.id, editingTabLabel)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRenameTab(tab.id, editingTabLabel);
                    if (e.key === 'Escape') setEditingTabId(null);
                  }}
                  className="h-6 w-32 text-sm"
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <>
                  <span
                    className="text-sm font-medium"
                    onDoubleClick={() => !readOnly && startEditingTab(tab.id, tab.label)}
                  >
                    {tab.label}
                  </span>
                  {!readOnly && block.data.tabs.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTab(tab.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-100 rounded transition-opacity"
                    >
                      <X className="w-3 h-3 text-red-600" />
                    </button>
                  )}
                </>
              )}
            </div>
          ))}

          {/* Visual '+' button at edge */}
          {!readOnly && (
            <button
              onClick={handleAddTab}
              className="group flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-100 transition-all rounded-t"
              style={{
                ['--hover-text-color' as string]: 'var(--color-primary, #ff5932)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--color-primary, #ff5932)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '';
              }}
              title="Ajouter un tab"
            >
              <div
                className="w-5 h-5 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center transition-colors"
                style={{
                  ['--hover-border-color' as string]: 'var(--color-primary, #ff5932)'
                }}
              >
                <Plus className="w-3 h-3" />
              </div>
              <span className="text-xs">Nouveau</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab content */}
      <div className="p-6 min-h-[200px]">
        {activeTabData && activeTabData.blocks.length === 0 && !readOnly ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
            <p className="text-gray-500 mb-4">Ce tab est vide</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddBlock?.(activeTab)}
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
              items={activeTabData?.blocks.map(b => b.id) || []}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {activeTabData?.blocks.map((childBlock) => (
                  <div key={childBlock.id}>
                    {renderBlock ? renderBlock(childBlock, activeTab) : (
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

      {/* Info footer */}
      {!readOnly && (
        <div className="px-4 py-2 bg-gray-50 border-t text-xs text-gray-500">
          Double-cliquez sur un nom de tab pour le renommer • {block.data.tabs.length} tab(s)
        </div>
      )}
    </div>
  );
}

export default TabsLayoutBlock;
