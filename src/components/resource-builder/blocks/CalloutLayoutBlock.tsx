import React from 'react';
import { DndContext, DragEndEvent, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { Info, AlertTriangle, CheckCircle, XCircle, Lightbulb, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { CalloutLayoutBlock, ContentBlock } from '@/types/resourceTypes';

interface CalloutLayoutBlockProps {
  block: CalloutLayoutBlock;
  onUpdate: (data: Partial<CalloutLayoutBlock['data']>) => void;
  onBlockUpdate?: (blockId: string, data: any) => void;
  onAddBlock?: (containerId: string) => void;
  onDeleteBlock?: (blockId: string) => void;
  organizationId?: string;
  readOnly?: boolean;
  renderBlock?: (block: ContentBlock) => React.ReactNode;
}

export function CalloutLayoutBlock({
  block,
  onUpdate,
  onBlockUpdate,
  onAddBlock,
  onDeleteBlock,
  organizationId,
  readOnly = false,
  renderBlock
}: CalloutLayoutBlockProps) {
  const type = block.data.type || 'info';

  // Sensors for block-level drag and drop
  const blockSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Handle nested block reordering within callout
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

  const getTypeConfig = () => {
    switch (type) {
      case 'info':
        return {
          icon: Info,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-900',
          iconColor: 'text-blue-600',
          label: 'Information'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-900',
          iconColor: 'text-yellow-600',
          label: 'Avertissement'
        };
      case 'error':
        return {
          icon: XCircle,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-900',
          iconColor: 'text-red-600',
          label: 'Erreur'
        };
      case 'success':
        return {
          icon: CheckCircle,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-900',
          iconColor: 'text-green-600',
          label: 'Succès'
        };
      case 'tip':
        return {
          icon: Lightbulb,
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          textColor: 'text-purple-900',
          iconColor: 'text-purple-600',
          label: 'Astuce'
        };
      default:
        return {
          icon: Info,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-900',
          iconColor: 'text-blue-600',
          label: 'Information'
        };
    }
  };

  const config = getTypeConfig();
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'rounded-lg border-2 overflow-hidden',
        config.bgColor,
        config.borderColor
      )}
    >
      {/* Header with controls */}
      {!readOnly && (
        <div className="flex items-center justify-between p-3 border-b bg-white/50">
          <div className="flex items-center gap-2">
            <Icon className={cn('w-4 h-4', config.iconColor)} />
            <span className="text-sm font-medium">{config.label}</span>
          </div>
          <Select
            value={type}
            onValueChange={(value: any) => onUpdate({ type: value })}
          >
            <SelectTrigger className="h-7 w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="info">
                <div className="flex items-center gap-2">
                  <Info className="w-3 h-3 text-blue-600" />
                  Information
                </div>
              </SelectItem>
              <SelectItem value="warning">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-3 h-3 text-yellow-600" />
                  Avertissement
                </div>
              </SelectItem>
              <SelectItem value="error">
                <div className="flex items-center gap-2">
                  <XCircle className="w-3 h-3 text-red-600" />
                  Erreur
                </div>
              </SelectItem>
              <SelectItem value="success">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-600" />
                  Succès
                </div>
              </SelectItem>
              <SelectItem value="tip">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-3 h-3 text-purple-600" />
                  Astuce
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Content area */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {readOnly && <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', config.iconColor)} />}
          <div className={cn('flex-1', config.textColor)}>
            {block.data.blocks.length === 0 && !readOnly ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-white/50">
                <p className="text-gray-500 text-sm mb-3">Callout vide</p>
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
                  <div className="space-y-4">
                    {block.data.blocks.map((childBlock) => (
                      <div key={childBlock.id}>
                        {renderBlock ? renderBlock(childBlock) : (
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
        </div>
      </div>
    </div>
  );
}

export default CalloutLayoutBlock;
