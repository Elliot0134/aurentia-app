import React, { useState } from 'react';
import { DndContext, DragEndEvent, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Settings2, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { ColumnsLayoutBlock, ContentBlock } from '@/types/resourceTypes';

interface ColumnsLayoutBlockProps {
  block: ColumnsLayoutBlock;
  onUpdate: (data: Partial<ColumnsLayoutBlock['data']>) => void;
  onBlockUpdate?: (columnId: string, blockId: string, data: any) => void;
  onAddBlock?: (columnId: string) => void;
  onDeleteBlock?: (columnId: string, blockId: string) => void;
  organizationId?: string;
  readOnly?: boolean;
  renderBlock?: (block: ContentBlock, columnId: string) => React.ReactNode;
}

// Sortable Column Component
interface SortableColumnProps {
  column: any;
  index: number;
  columnWidth: number;
  onDelete: () => void;
  onAddBlock: (columnId: string) => void;
  renderBlock: (block: ContentBlock, columnId: string) => React.ReactNode;
  readOnly: boolean;
  columnsCount: number;
  handleBlockDragEnd: (columnId: string) => (event: DragEndEvent) => void;
}

function SortableColumn({
  column,
  index,
  columnWidth,
  onDelete,
  onAddBlock,
  renderBlock,
  readOnly,
  columnsCount,
  handleBlockDragEnd
}: SortableColumnProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id, disabled: readOnly });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const blockSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  return (
    <div ref={setNodeRef} style={style}>
      <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 min-h-[200px] relative group">
        {/* Column header */}
        {!readOnly && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            {/* Drag Handle for column */}
            <button
              {...attributes}
              {...listeners}
              className="p-1 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing"
              title="Glisser pour réordonner la colonne"
            >
              <GripVertical className="w-4 h-4 text-gray-400" />
            </button>
            <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border">
              {Math.round(columnWidth)}%
            </span>
            {columnsCount > 1 && (
              <button
                onClick={onDelete}
                className="p-1 hover:bg-red-100 rounded"
              >
                <Trash2 className="w-3 h-3 text-red-600" />
              </button>
            )}
          </div>
        )}

        {/* Column content with nested block DnD */}
        <div className="space-y-4">
          {column.blocks.length === 0 && !readOnly ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm mb-3">Colonne vide</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAddBlock(column.id)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un bloc
              </Button>
            </div>
          ) : (
            <DndContext
              sensors={blockSensors}
              collisionDetection={closestCenter}
              onDragEnd={handleBlockDragEnd(column.id)}
            >
              <SortableContext
                items={column.blocks.map((b: ContentBlock) => b.id)}
                strategy={verticalListSortingStrategy}
              >
                {column.blocks.map((childBlock: ContentBlock) => (
                  <div key={childBlock.id}>
                    {renderBlock(childBlock, column.id)}
                  </div>
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>
    </div>
  );
}

export function ColumnsLayoutBlock({
  block,
  onUpdate,
  onBlockUpdate,
  onAddBlock,
  onDeleteBlock,
  organizationId,
  readOnly = false,
  renderBlock
}: ColumnsLayoutBlockProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [columnWidths, setColumnWidths] = useState(
    block.data.columns.map(col => col.width || 100 / block.data.columns.length)
  );

  const gap = block.data.gap || 'medium';
  const orientation = block.data.orientation || 'vertical'; // vertical = side by side, horizontal = stacked
  const gapSizes = {
    small: 'gap-2',
    medium: 'gap-4',
    large: 'gap-8'
  };

  // Sensors for column-level drag and drop
  const columnSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Handle column reordering
  const handleColumnDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = block.data.columns.findIndex(col => col.id === active.id);
    const newIndex = block.data.columns.findIndex(col => col.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newColumns = arrayMove(block.data.columns, oldIndex, newIndex);
      const newWidths = arrayMove(columnWidths, oldIndex, newIndex);
      onUpdate({ columns: newColumns });
      setColumnWidths(newWidths);
    }
  };

  // Handle nested block reordering within a column
  const handleBlockDragEnd = (columnId: string) => (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const column = block.data.columns.find(col => col.id === columnId);
    if (!column) return;

    const oldIndex = column.blocks.findIndex(b => b.id === active.id);
    const newIndex = column.blocks.findIndex(b => b.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newBlocks = arrayMove(column.blocks, oldIndex, newIndex);
      const newColumns = block.data.columns.map(col =>
        col.id === columnId ? { ...col, blocks: newBlocks } : col
      );
      onUpdate({ columns: newColumns });
    }
  };

  const handleAddColumn = () => {
    const newColumnId = `col_${Date.now()}`;
    const equalWidth = 100 / (block.data.columns.length + 1);
    const newColumns = [
      ...block.data.columns.map(col => ({ ...col, width: equalWidth })),
      { id: newColumnId, blocks: [], width: equalWidth }
    ];
    onUpdate({ columns: newColumns });
    setColumnWidths(newColumns.map(col => col.width || equalWidth));
  };

  const handleAddColumnAt = (index: number) => {
    const newColumnId = `col_${Date.now()}`;
    const equalWidth = 100 / (block.data.columns.length + 1);
    const newColumns = [
      ...block.data.columns.slice(0, index).map(col => ({ ...col, width: equalWidth })),
      { id: newColumnId, blocks: [], width: equalWidth },
      ...block.data.columns.slice(index).map(col => ({ ...col, width: equalWidth }))
    ];
    onUpdate({ columns: newColumns });
    setColumnWidths(newColumns.map(col => col.width || equalWidth));
  };

  const handleDeleteColumn = (columnId: string) => {
    if (block.data.columns.length <= 1) return; // Au moins une colonne

    const newColumns = block.data.columns.filter(col => col.id !== columnId);
    const equalWidth = 100 / newColumns.length;
    const updatedColumns = newColumns.map(col => ({ ...col, width: equalWidth }));
    onUpdate({ columns: updatedColumns });
    setColumnWidths(updatedColumns.map(col => col.width || equalWidth));
  };

  const handleWidthChange = (index: number, newWidth: number) => {
    const newWidths = [...columnWidths];
    newWidths[index] = newWidth;

    // Ajuster les autres colonnes proportionnellement
    const remaining = 100 - newWidth;
    const otherCount = newWidths.length - 1;
    if (otherCount > 0) {
      const otherWidth = remaining / otherCount;
      newWidths.forEach((_, i) => {
        if (i !== index) newWidths[i] = otherWidth;
      });
    }

    setColumnWidths(newWidths);
  };

  const handleApplyWidths = () => {
    const newColumns = block.data.columns.map((col, i) => ({
      ...col,
      width: columnWidths[i]
    }));
    onUpdate({ columns: newColumns });
    setShowSettings(false);
  };

  const handlePresetLayout = (preset: string) => {
    let newWidths: number[] = [];
    switch (preset) {
      // 2 splits
      case '50-50':
        newWidths = [50, 50];
        break;
      case '25-75':
        newWidths = [25, 75];
        break;
      case '75-25':
        newWidths = [75, 25];
        break;
      case '30-70':
        newWidths = [30, 70];
        break;
      case '70-30':
        newWidths = [70, 30];
        break;
      case '40-60':
        newWidths = [40, 60];
        break;
      case '60-40':
        newWidths = [60, 40];
        break;
      // 3 splits
      case '33-33-33':
        newWidths = [33.33, 33.33, 33.33];
        break;
      case '25-25-50':
        newWidths = [25, 25, 50];
        break;
      case '50-25-25':
        newWidths = [50, 25, 25];
        break;
      case '25-50-25':
        newWidths = [25, 50, 25];
        break;
      case '20-20-60':
        newWidths = [20, 20, 60];
        break;
      case '60-20-20':
        newWidths = [60, 20, 20];
        break;
      case '20-60-20':
        newWidths = [20, 60, 20];
        break;
      default:
        return;
    }

    // Ajuster le nombre de colonnes si nécessaire
    if (newWidths.length !== block.data.columns.length) {
      const newColumns = newWidths.map((width, i) => ({
        id: block.data.columns[i]?.id || `col_${Date.now()}_${i}`,
        blocks: block.data.columns[i]?.blocks || [],
        width
      }));
      onUpdate({ columns: newColumns });
    } else {
      const newColumns = block.data.columns.map((col, i) => ({
        ...col,
        width: newWidths[i]
      }));
      onUpdate({ columns: newColumns });
    }
    setColumnWidths(newWidths);
  };

  return (
    <div className="border rounded-lg bg-white p-4 max-w-full">
      {/* Header with controls */}
      {!readOnly && (
        <div className="flex items-center justify-between mb-4 pb-3 border-b">
          <div className="text-sm font-medium text-gray-700">
            Layout à {block.data.columns.length} {orientation === 'vertical' ? 'colonne(s)' : 'rangée(s)'}
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
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddColumn}
            >
              <Plus className="w-4 h-4 mr-1" />
              {orientation === 'vertical' ? 'Colonne' : 'Rangée'}
            </Button>
          </div>
        </div>
      )}

      {/* Columns/Rows with visual '+' buttons */}
      <div className="relative w-full">
        {orientation === 'vertical' ? (
          // Vertical orientation: side by side columns
          <div
            className="overflow-x-auto overflow-y-visible pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 w-full"
            style={{
              maxWidth: '100%',
              // Add subtle scroll shadows for better UX
              backgroundImage: `
                linear-gradient(to right, white 30%, rgba(255,255,255,0)),
                linear-gradient(to right, rgba(255,255,255,0), white 70%),
                linear-gradient(to right, rgba(0,0,0,.1), rgba(255,255,255,0)),
                linear-gradient(to left, rgba(0,0,0,.1), rgba(255,255,255,0))
              `,
              backgroundPosition: 'left center, right center, left center, right center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '40px 100%, 40px 100%, 10px 100%, 10px 100%',
              backgroundAttachment: 'local, local, scroll, scroll'
            }}
          >
            <DndContext
              sensors={columnSensors}
              collisionDetection={closestCenter}
              onDragEnd={handleColumnDragEnd}
            >
              <SortableContext
                items={block.data.columns.map(col => col.id)}
                strategy={horizontalListSortingStrategy}
              >
                <div
                  className={cn("grid", gapSizes[gap])}
                  style={{
                    gridTemplateColumns: columnWidths.map(w => `minmax(250px, ${w}fr)`).join(' '),
                    width: block.data.columns.length > 3 ? 'max-content' : '100%',
                    minWidth: '100%'
                  }}
                >
                  {block.data.columns.map((column, index) => (
                    <React.Fragment key={column.id}>
                      {/* Visual '+' button between columns */}
                      {!readOnly && index > 0 && (
                        <div className="absolute top-1/2 -translate-y-1/2 -ml-6 z-10 opacity-0 hover:opacity-100 transition-opacity" style={{ left: `${columnWidths.slice(0, index).reduce((a, b) => a + b, 0)}%` }}>
                          <button
                            onClick={() => handleAddColumnAt(index)}
                            className="group flex flex-col items-center gap-1 p-1.5 bg-white rounded-lg border-2 border-dashed border-gray-300 hover:bg-gray-50 shadow-sm transition-all"
                            title="Ajouter une colonne ici"
                          >
                            <div className="w-6 h-6 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center transition-colors">
                              <Plus className="w-3.5 h-3.5 text-gray-400" />
                            </div>
                            <span className="text-[10px] text-gray-400 font-medium">COL</span>
                          </button>
                        </div>
                      )}

                      <SortableColumn
                        column={column}
                        index={index}
                        columnWidth={columnWidths[index]}
                        onDelete={() => handleDeleteColumn(column.id)}
                        onAddBlock={onAddBlock || (() => {})}
                        renderBlock={renderBlock || (() => null)}
                        readOnly={readOnly}
                        columnsCount={block.data.columns.length}
                        handleBlockDragEnd={handleBlockDragEnd}
                      />
                    </React.Fragment>
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {/* Visual '+' button after last column */}
            {!readOnly && (
              <div className="absolute top-1/2 -translate-y-1/2 right-0 translate-x-6 z-10 opacity-0 hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleAddColumnAt(block.data.columns.length)}
                  className="group flex flex-col items-center gap-1 p-1.5 bg-white rounded-lg border-2 border-dashed border-gray-300 hover:bg-gray-50 shadow-sm transition-all"
                  title="Ajouter une colonne à la fin"
                >
                  <div className="w-6 h-6 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center transition-colors">
                    <Plus className="w-3.5 h-3.5 text-gray-400" />
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium">COL</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          // Horizontal orientation: stacked rows
          <div className={cn("flex flex-col", gapSizes[gap])}>
            {block.data.columns.map((column, index) => (
              <React.Fragment key={column.id}>
                {/* Visual '+' button between rows */}
                {!readOnly && index > 0 && (
                  <div className="flex justify-center -my-4 z-10">
                    <button
                      onClick={() => handleAddColumnAt(index)}
                      className="group flex items-center gap-1 p-1.5 bg-white rounded-lg border-2 border-dashed border-gray-300 hover:bg-gray-50 shadow-sm transition-all"
                      title="Ajouter une rangée ici"
                    >
                      <div className="w-6 h-6 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center transition-colors">
                        <Plus className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                      <span className="text-[10px] text-gray-400 font-medium">ROW</span>
                    </button>
                  </div>
                )}

                <div
                  className="border-2 border-dashed border-gray-200 rounded-lg p-4 relative group"
                  style={{ minHeight: `${columnWidths[index] * 3}px` }}
                >
                  {/* Row header */}
                  {!readOnly && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border">
                        {Math.round(columnWidths[index])}%
                      </span>
                      {block.data.columns.length > 1 && (
                        <button
                          onClick={() => handleDeleteColumn(column.id)}
                          className="p-1 hover:bg-red-100 rounded"
                        >
                          <Trash2 className="w-3 h-3 text-red-600" />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Row content */}
                  <div className="space-y-4">
                    {column.blocks.length === 0 && !readOnly ? (
                      <div className="text-center py-8">
                        <p className="text-gray-400 text-sm mb-3">Rangée vide</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onAddBlock?.(column.id)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Ajouter un bloc
                        </Button>
                      </div>
                    ) : (
                      column.blocks.map((childBlock) => (
                        <div key={childBlock.id}>
                          {renderBlock ? renderBlock(childBlock, column.id) : (
                            <div className="p-4 border rounded bg-gray-50">
                              Block type: {childBlock.type}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </React.Fragment>
            ))}

            {/* Visual '+' button after last row */}
            {!readOnly && (
              <div className="flex justify-center mt-2">
                <button
                  onClick={() => handleAddColumnAt(block.data.columns.length)}
                  className="group flex items-center gap-1 p-1.5 bg-white rounded-lg border-2 border-dashed border-gray-300 hover:bg-gray-50 shadow-sm transition-all"
                  title="Ajouter une rangée à la fin"
                >
                  <div className="w-6 h-6 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center transition-colors">
                    <Plus className="w-3.5 h-3.5 text-gray-400" />
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium">ROW</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configuration des colonnes</DialogTitle>
            <DialogDescription>
              Ajustez la largeur de chaque colonne ou choisissez un layout prédéfini
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Orientation */}
            <div>
              <Label>Orientation</Label>
              <Select
                value={orientation}
                onValueChange={(value: any) => onUpdate({ orientation: value })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vertical">Vertical (côte à côte)</SelectItem>
                  <SelectItem value="horizontal">Horizontal (empilées)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Presets */}
            <div>
              <Label>Layouts prédéfinis - 2 divisions</Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                <Button variant="outline" size="sm" onClick={() => handlePresetLayout('50-50')}>50/50</Button>
                <Button variant="outline" size="sm" onClick={() => handlePresetLayout('40-60')}>40/60</Button>
                <Button variant="outline" size="sm" onClick={() => handlePresetLayout('60-40')}>60/40</Button>
                <Button variant="outline" size="sm" onClick={() => handlePresetLayout('30-70')}>30/70</Button>
                <Button variant="outline" size="sm" onClick={() => handlePresetLayout('70-30')}>70/30</Button>
                <Button variant="outline" size="sm" onClick={() => handlePresetLayout('25-75')}>25/75</Button>
                <Button variant="outline" size="sm" onClick={() => handlePresetLayout('75-25')}>75/25</Button>
              </div>
            </div>

            <div>
              <Label>Layouts prédéfinis - 3 divisions</Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                <Button variant="outline" size="sm" onClick={() => handlePresetLayout('33-33-33')}>33/33/33</Button>
                <Button variant="outline" size="sm" onClick={() => handlePresetLayout('25-50-25')}>25/50/25</Button>
                <Button variant="outline" size="sm" onClick={() => handlePresetLayout('25-25-50')}>25/25/50</Button>
                <Button variant="outline" size="sm" onClick={() => handlePresetLayout('50-25-25')}>50/25/25</Button>
                <Button variant="outline" size="sm" onClick={() => handlePresetLayout('20-60-20')}>20/60/20</Button>
                <Button variant="outline" size="sm" onClick={() => handlePresetLayout('20-20-60')}>20/20/60</Button>
                <Button variant="outline" size="sm" onClick={() => handlePresetLayout('60-20-20')}>60/20/20</Button>
              </div>
            </div>

            {/* Custom widths */}
            <div>
              <Label>Largeurs personnalisées</Label>
              <div className="space-y-4 mt-4">
                {columnWidths.map((width, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Colonne {index + 1}</span>
                      <span className="text-sm text-gray-500">{Math.round(width)}%</span>
                    </div>
                    <Slider
                      value={[width]}
                      onValueChange={([newWidth]) => handleWidthChange(index, newWidth)}
                      min={10}
                      max={90}
                      step={5}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Gap */}
            <div>
              <Label>Espacement entre colonnes</Label>
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

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowSettings(false)}>
                Annuler
              </Button>
              <Button onClick={handleApplyWidths}>
                Appliquer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ColumnsLayoutBlock;
