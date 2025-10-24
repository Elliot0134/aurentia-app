import React, { useState } from 'react';
import { DndContext, DragEndEvent, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { Plus, Settings2, Trash2, Grid3x3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { GridLayoutBlock, ContentBlock } from '@/types/resourceTypes';

interface GridLayoutBlockProps {
  block: GridLayoutBlock;
  onUpdate: (data: Partial<GridLayoutBlock['data']>) => void;
  onBlockUpdate?: (cellId: string, blockId: string, data: any) => void;
  onAddBlock?: (cellId: string) => void;
  onDeleteBlock?: (cellId: string, blockId: string) => void;
  organizationId?: string;
  readOnly?: boolean;
  renderBlock?: (block: ContentBlock, cellId: string) => React.ReactNode;
}

export function GridLayoutBlock({
  block,
  onUpdate,
  onBlockUpdate,
  onAddBlock,
  onDeleteBlock,
  organizationId,
  readOnly = false,
  renderBlock
}: GridLayoutBlockProps) {
  const [showSettings, setShowSettings] = useState(false);
  const layout = block.data.layout || '2x2';
  const gap = block.data.gap || 'medium';

  // Initialize sensors once at component level (not inside loop)
  const blockSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const gapSizes = {
    small: 'gap-2',
    medium: 'gap-4',
    large: 'gap-8'
  };

  const getGridClasses = () => {
    switch (layout) {
      case '2x2':
        return 'grid-cols-2 grid-rows-2';
      case '3x3':
        return 'grid-cols-3 grid-rows-3';
      case '2x3':
        return 'grid-cols-2 grid-rows-3';
      case '3x2':
        return 'grid-cols-3 grid-rows-2';
      case '2x4':
        return 'grid-cols-2 grid-rows-4';
      case '4x2':
        return 'grid-cols-4 grid-rows-2';
      default:
        return 'grid-cols-2 grid-rows-2';
    }
  };

  const handleLayoutChange = (newLayout: string) => {
    // Calculate how many cells we need
    const [cols, rows] = newLayout.split('x').map(Number);
    const totalCells = cols * rows;

    // Keep existing cells or create new ones
    const newCells = Array.from({ length: totalCells }, (_, i) => {
      const existingCell = block.data.cells[i];
      const row = Math.floor(i / cols);
      const col = i % cols;
      return existingCell || {
        id: `cell-${row}-${col}-${Date.now()}`,
        blocks: [],
        row,
        col
      };
    });

    onUpdate({ layout: newLayout as any, rows, cols, cells: newCells });
    setShowSettings(false);
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-white p-4">
      {/* Header with controls */}
      {!readOnly && (
        <div className="flex items-center justify-between mb-4 pb-3 border-b">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Grid3x3 className="w-4 h-4" />
            Grille {layout} ({block.data.cells.length} cellules)
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(true)}
            >
              <Settings2 className="w-4 h-4 mr-1" />
              Configurer
            </Button>
          </div>
        </div>
      )}

      {/* Grid cells */}
      <div className={cn('grid', getGridClasses(), gapSizes[gap])}>
        {block.data.cells.map((cell, index) => {
          // Handle nested block reordering within this cell
          const handleBlockDragEnd = (event: DragEndEvent) => {
            const { active, over } = event;
            if (!over || active.id === over.id) return;

            const oldIndex = cell.blocks.findIndex(b => b.id === active.id);
            const newIndex = cell.blocks.findIndex(b => b.id === over.id);

            if (oldIndex !== -1 && newIndex !== -1) {
              const newBlocks = arrayMove(cell.blocks, oldIndex, newIndex);
              const newCells = block.data.cells.map(c =>
                c.id === cell.id ? { ...c, blocks: newBlocks } : c
              );
              onUpdate({ cells: newCells });
            }
          };

          return (
            <div
              key={cell.id}
              className="border-2 border-dashed border-gray-200 rounded-lg p-4 min-h-[150px] relative group"
            >
              {/* Cell number indicator */}
              {!readOnly && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border">
                    Cellule {index + 1}
                  </span>
                </div>
              )}

              {/* Cell content */}
              <div className="space-y-4">
                {cell.blocks.length === 0 && !readOnly ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400 text-sm mb-3">Cellule vide</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onAddBlock?.(cell.id)}
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
                      items={cell.blocks.map(b => b.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {cell.blocks.map((childBlock) => (
                        <div key={childBlock.id}>
                          {renderBlock ? renderBlock(childBlock, cell.id) : (
                            <div className="p-4 border rounded bg-gray-50">
                              Block type: {childBlock.type}
                            </div>
                          )}
                        </div>
                      ))}
                    </SortableContext>
                  </DndContext>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Info footer */}
      {!readOnly && (
        <div className="mt-4 pt-3 border-t text-xs text-gray-500">
          Grille {layout} avec {block.data.cells.length} cellule(s)
        </div>
      )}

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Configuration de la grille</DialogTitle>
            <DialogDescription>
              Choisissez une disposition prédéfinie pour votre grille
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* 4-way layouts (2x2) */}
            <div>
              <Label className="text-base font-semibold mb-3 block">4 cellules (2x2)</Label>
              <div className="grid grid-cols-4 gap-3">
                <button
                  onClick={() => handleLayoutChange('2x2')}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all",
                    layout === '2x2'
                      ? "bg-pink-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  )}
                  style={layout === '2x2' ? {
                    borderColor: 'var(--color-primary, #ff5932)'
                  } : undefined}
                >
                  <div className="grid grid-cols-2 grid-rows-2 gap-1 w-16 h-16">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className={cn(
                        "rounded border-2",
                        layout === '2x2' ? "bg-gray-100" : "bg-gray-100 border-gray-300"
                      )}
                      style={layout === '2x2' ? {
                        backgroundColor: 'color-mix(in srgb, var(--color-primary, #ff5932) 20%, white)',
                        borderColor: 'var(--color-primary, #ff5932)'
                      } : undefined}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">2x2</span>
                </button>
              </div>
            </div>

            {/* 6-way layouts (2x3 and 3x2) */}
            <div>
              <Label className="text-base font-semibold mb-3 block">6 cellules</Label>
              <div className="grid grid-cols-4 gap-3">
                <button
                  onClick={() => handleLayoutChange('2x3')}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all",
                    layout === '2x3'
                      ? "bg-pink-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  )}
                  style={layout === '2x3' ? { borderColor: 'var(--color-primary, #ff5932)' } : undefined}
                >
                  <div className="grid grid-cols-2 grid-rows-3 gap-1 w-16 h-20">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className={cn(
                        "rounded border-2",
                        layout === '2x3' ? "bg-gray-100" : "bg-gray-100 border-gray-300"
                      )}
                      style={layout === '2x3' ? {
                        backgroundColor: 'color-mix(in srgb, var(--color-primary, #ff5932) 20%, white)',
                        borderColor: 'var(--color-primary, #ff5932)'
                      } : undefined}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">2x3</span>
                </button>

                <button
                  onClick={() => handleLayoutChange('3x2')}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all",
                    layout === '3x2'
                      ? "bg-pink-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  )}
                  style={layout === '3x2' ? { borderColor: 'var(--color-primary, #ff5932)' } : undefined}
                >
                  <div className="grid grid-cols-3 grid-rows-2 gap-1 w-20 h-14">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className={cn(
                        "rounded border-2",
                        layout === '3x2' ? "bg-gray-100" : "bg-gray-100 border-gray-300"
                      )}
                      style={layout === '3x2' ? {
                        backgroundColor: 'color-mix(in srgb, var(--color-primary, #ff5932) 20%, white)',
                        borderColor: 'var(--color-primary, #ff5932)'
                      } : undefined}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">3x2</span>
                </button>
              </div>
            </div>

            {/* 8-way layouts (2x4 and 4x2) */}
            <div>
              <Label className="text-base font-semibold mb-3 block">8 cellules</Label>
              <div className="grid grid-cols-4 gap-3">
                <button
                  onClick={() => handleLayoutChange('2x4')}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all",
                    layout === '2x4'
                      ? "bg-pink-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  )}
                  style={layout === '2x4' ? { borderColor: 'var(--color-primary, #ff5932)' } : undefined}
                >
                  <div className="grid grid-cols-2 grid-rows-4 gap-1 w-12 h-20">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className={cn(
                        "rounded border-2",
                        layout === '2x4' ? "bg-gray-100" : "bg-gray-100 border-gray-300"
                      )}
                      style={layout === '2x4' ? {
                        backgroundColor: 'color-mix(in srgb, var(--color-primary, #ff5932) 20%, white)',
                        borderColor: 'var(--color-primary, #ff5932)'
                      } : undefined}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">2x4</span>
                </button>

                <button
                  onClick={() => handleLayoutChange('4x2')}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all",
                    layout === '4x2'
                      ? "bg-pink-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  )}
                  style={layout === '4x2' ? { borderColor: 'var(--color-primary, #ff5932)' } : undefined}
                >
                  <div className="grid grid-cols-4 grid-rows-2 gap-1 w-20 h-12">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className={cn(
                        "rounded border-2",
                        layout === '4x2' ? "bg-gray-100" : "bg-gray-100 border-gray-300"
                      )}
                      style={layout === '4x2' ? {
                        backgroundColor: 'color-mix(in srgb, var(--color-primary, #ff5932) 20%, white)',
                        borderColor: 'var(--color-primary, #ff5932)'
                      } : undefined}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">4x2</span>
                </button>
              </div>
            </div>

            {/* 9-way layout (3x3) */}
            <div>
              <Label className="text-base font-semibold mb-3 block">9 cellules (3x3)</Label>
              <div className="grid grid-cols-4 gap-3">
                <button
                  onClick={() => handleLayoutChange('3x3')}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all",
                    layout === '3x3'
                      ? "bg-pink-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  )}
                  style={layout === '3x3' ? { borderColor: 'var(--color-primary, #ff5932)' } : undefined}
                >
                  <div className="grid grid-cols-3 grid-rows-3 gap-1 w-20 h-20">
                    {[...Array(9)].map((_, i) => (
                      <div key={i} className={cn(
                        "rounded border-2",
                        layout === '3x3' ? "bg-gray-100" : "bg-gray-100 border-gray-300"
                      )}
                      style={layout === '3x3' ? {
                        backgroundColor: 'color-mix(in srgb, var(--color-primary, #ff5932) 20%, white)',
                        borderColor: 'var(--color-primary, #ff5932)'
                      } : undefined}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">3x3</span>
                </button>
              </div>
            </div>

            {/* Gap selector */}
            <div>
              <Label>Espacement entre cellules</Label>
              <Select
                value={gap}
                onValueChange={(value: any) => onUpdate({ gap: value })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Petit</SelectItem>
                  <SelectItem value="medium">Moyen</SelectItem>
                  <SelectItem value="large">Grand</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default GridLayoutBlock;
