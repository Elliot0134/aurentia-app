import React, { useState } from 'react';
import { GripVertical, Copy, Trash2, Settings, MessageSquare, Edit2, Check, X, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ContentBlock } from '@/types/resourceTypes';
import { isContainerBlock } from '@/types/resourceTypes';
import { BlockComments } from './BlockComments';
import {
  TextBlock,
  ImageBlock,
  VideoBlock,
  FileBlock,
  TableBlock,
  DividerBlock,
  CodeBlock,
  QuoteBlock,
  ButtonBlock,
  AlertBlock,
  ChecklistBlock,
  EmbedBlock,
  QuizBlock,
  TabsLayoutBlock,
  ColumnsLayoutBlock,
  GridLayoutBlock,
  AccordionLayoutBlock,
  CalloutLayoutBlock,
  ToggleLayoutBlock
} from './blocks';

interface BlockWrapperProps {
  block: ContentBlock;
  isActive: boolean;
  onActivate: () => void;
  onUpdate: (data: any) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  organizationId?: string;
  resourceId?: string;
  readOnly?: boolean;
  // For nested blocks in container blocks
  onBlockUpdate?: (containerId: string, blockId: string, data: any) => void;
  onAddBlock?: (containerId: string) => void;
  onDeleteBlock?: (containerId: string, blockId: string) => void;
  allBlocks?: ContentBlock[];
  // For drag and drop
  isDraggable?: boolean;
  dragHandleProps?: any;
}

export const BlockWrapper: React.FC<BlockWrapperProps> = ({
  block,
  isActive,
  onActivate,
  onUpdate,
  onDuplicate,
  onDelete,
  organizationId,
  resourceId,
  readOnly = false,
  onBlockUpdate,
  onAddBlock,
  onDeleteBlock,
  allBlocks = [],
  isDraggable = false,
  dragHandleProps
}) => {
  const [showComments, setShowComments] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(block.title || '');

  const handleSaveTitle = () => {
    onUpdate({ ...block, title: titleInput || undefined });
    setEditingTitle(false);
  };

  const handleCancelTitle = () => {
    setTitleInput(block.title || '');
    setEditingTitle(false);
  };

  const handleStartEditTitle = () => {
    setTitleInput(block.title || '');
    setEditingTitle(true);
  };

  // Recursive renderer for nested blocks
  const renderNestedBlock = (childBlock: ContentBlock, containerId: string) => {
    return (
      <BlockWrapper
        key={childBlock.id}
        block={childBlock}
        isActive={false}
        onActivate={() => {}}
        onUpdate={(data) => onBlockUpdate?.(containerId, childBlock.id, data)}
        onDuplicate={() => {}}
        onDelete={() => onDeleteBlock?.(containerId, childBlock.id)}
        organizationId={organizationId}
        readOnly={readOnly}
        onBlockUpdate={onBlockUpdate}
        onAddBlock={onAddBlock}
        onDeleteBlock={onDeleteBlock}
        allBlocks={allBlocks}
      />
    );
  };

  const renderBlock = () => {
    const commonProps = {
      block: block as any,
      isActive,
      onActivate,
      onUpdate,
      readOnly,
    };

    // Layout blocks with nested content
    if (isContainerBlock(block)) {
      const containerProps = {
        ...commonProps,
        organizationId,
        onBlockUpdate,
        onAddBlock,
        onDeleteBlock,
        renderBlock: renderNestedBlock
      };

      switch (block.type) {
        case 'tabs':
          return <TabsLayoutBlock {...containerProps} />;
        case 'columns':
          return <ColumnsLayoutBlock {...containerProps} />;
        case 'grid':
          return <GridLayoutBlock {...containerProps} />;
        case 'accordion':
          return <AccordionLayoutBlock {...containerProps} />;
        case 'callout':
          return <CalloutLayoutBlock {...containerProps} />;
        case 'toggle':
          return <ToggleLayoutBlock {...containerProps} />;
      }
    }

    // Regular content blocks
    switch (block.type) {
      case 'text':
        return <TextBlock {...commonProps} organizationId={organizationId} resourceId={resourceId} />;
      case 'image':
        return <ImageBlock {...commonProps} organizationId={organizationId} />;
      case 'video':
        return <VideoBlock {...commonProps} />;
      case 'file':
        return <FileBlock {...commonProps} organizationId={organizationId} />;
      case 'table':
        return <TableBlock {...commonProps} />;
      case 'divider':
        return <DividerBlock {...commonProps} />;
      case 'code':
        return <CodeBlock {...commonProps} />;
      case 'quote':
        return <QuoteBlock {...commonProps} />;
      case 'button':
        return <ButtonBlock {...commonProps} />;
      case 'alert':
        return <AlertBlock {...commonProps} />;
      case 'checklist':
        return <ChecklistBlock {...commonProps} />;
      case 'embed':
        return <EmbedBlock {...commonProps} />;
      case 'quiz':
        return <QuizBlock {...commonProps} />;
      default:
        return <div>Type de bloc inconnu: {block.type}</div>;
    }
  };

  if (readOnly) {
    return (
      <div className="mb-4">
        {block.title && (
          <h4 className="text-sm font-medium text-gray-700 mb-2">{block.title}</h4>
        )}
        {renderBlock()}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative group mb-4 border-2 rounded-lg bg-white max-w-full",
        isActive ? "border-blue-300" : "border-transparent hover:border-gray-200"
      )}
      data-block-id={block.id}
      onClick={onActivate}
    >
      {/* Block Header - Title & Controls */}
      {isActive && (
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b rounded-t-lg" data-tour="block-header">
          {/* Drag Handle */}
          {isDraggable && dragHandleProps && (
            <div
              {...dragHandleProps}
              className="cursor-grab active:cursor-grabbing"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="w-4 h-4 text-gray-400" />
            </div>
          )}

          {/* Title Section */}
          <div className="flex-1">
            {editingTitle ? (
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <Input
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  placeholder="Titre du bloc (optionnel)"
                  className="h-7 text-sm"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveTitle();
                    if (e.key === 'Escape') handleCancelTitle();
                  }}
                />
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={handleSaveTitle}>
                  <Check className="w-3 h-3 text-green-600" />
                </Button>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={handleCancelTitle}>
                  <X className="w-3 h-3 text-gray-600" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {block.title ? (
                  <span className="text-sm font-medium text-gray-700">{block.title}</span>
                ) : (
                  <span className="text-xs text-gray-400 italic">Sans titre</span>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartEditTitle();
                  }}
                  title={block.title ? "Modifier le titre" : "Ajouter un titre"}
                >
                  {block.title ? <Edit2 className="w-3 h-3" /> : <Type className="w-3 h-3" />}
                </Button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {!editingTitle && (
            <div className="flex items-center gap-1">
              {/* More Options Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    title="Plus d'options"
                  >
                    <Settings className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {resourceId && organizationId && (
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      setShowComments(!showComments);
                    }}>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Commentaires
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    onDuplicate();
                  }}>
                    <Copy className="w-4 h-4 mr-2" />
                    Dupliquer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Inline Delete Button */}
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                title="Supprimer le bloc"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Block Content */}
      <div className={cn(isActive && "p-3", "w-full max-w-full")}>
        {renderBlock()}
      </div>

      {/* Block Comments */}
      {resourceId && organizationId && (
        <BlockComments
          resourceId={resourceId}
          blockId={block.id}
          organizationId={organizationId}
          isOpen={showComments}
          onClose={() => setShowComments(false)}
        />
      )}
    </div>
  );
};

export default BlockWrapper;
