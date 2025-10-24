import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Textarea } from '@/components/ui/button';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Type, FileText, Code2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TextBlock as TextBlockType } from '@/types/resourceTypes';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { convertContent, markdownToHtml, htmlToMarkdown } from '@/utils/markdownHtmlConverter';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TextBlockProps {
  block: TextBlockType;
  isActive: boolean;
  onUpdate: (data: Partial<TextBlockType['data']>) => void;
  onActivate: () => void;
  readOnly?: boolean;
  organizationId?: string;
  resourceId?: string;
}

export const TextBlock: React.FC<TextBlockProps> = ({
  block,
  isActive,
  onUpdate,
  onActivate,
  readOnly = false,
  organizationId,
  resourceId,
}) => {
  // Default to markdown mode for backwards compatibility
  const currentMode = block.data.mode || 'markdown';
  const [showPreview, setShowPreview] = useState(false);

  // Get the current content based on mode
  const getCurrentContent = (): string => {
    if (currentMode === 'richtext') {
      return block.data.html || '';
    }
    return block.data.markdown || '';
  };

  const toggleMode = () => {
    const newMode = currentMode === 'markdown' ? 'richtext' : 'markdown';
    const currentContent = getCurrentContent();

    // Convert content to the new mode
    const convertedContent = convertContent(currentContent, currentMode, newMode);

    // Update both formats for compatibility
    if (newMode === 'richtext') {
      onUpdate({
        mode: 'richtext',
        html: convertedContent,
        markdown: currentContent, // Keep original markdown
      });
    } else {
      onUpdate({
        mode: 'markdown',
        markdown: convertedContent,
        html: currentContent, // Keep original html
      });
    }
  };

  const handleMarkdownChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({
      markdown: e.target.value,
      mode: 'markdown'
    });
  };

  const handleRichTextChange = (html: string) => {
    onUpdate({
      html,
      mode: 'richtext'
    });
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  // Read-only view
  if (readOnly) {
    const content = currentMode === 'richtext' ? block.data.html : block.data.markdown;

    if (currentMode === 'richtext' && block.data.html) {
      return (
        <div
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: block.data.html }}
        />
      );
    }

    return (
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content || '_Aucun contenu_'}
        </ReactMarkdown>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative border-2 rounded-lg p-4 transition-all",
        isActive ? "" : "border-transparent hover:border-gray-200"
      )}
      style={isActive ? {
        borderColor: 'var(--color-primary, #ff5932)',
        backgroundColor: 'rgba(59, 130, 246, 0.05)'
      } : undefined}
      onClick={onActivate}
      data-tour="text-block"
    >
      {/* Block Type Indicator & Controls */}
      <div className="flex items-center gap-2 mb-2">
        <Type className="w-4 h-4 text-gray-400" />
        <span className="text-xs text-gray-500 font-medium">
          {currentMode === 'richtext' ? 'Rich Text Editor' : 'Texte / Markdown'}
        </span>

        {isActive && (
          <div className="ml-auto flex items-center gap-2">
            {/* Mode Toggle */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMode();
                    }}
                    className="h-7 px-2 text-xs"
                  >
                    {currentMode === 'markdown' ? (
                      <>
                        <FileText className="w-3 h-3 mr-1" />
                        Rich Text
                      </>
                    ) : (
                      <>
                        <Code2 className="w-3 h-3 mr-1" />
                        Markdown
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Switch to {currentMode === 'markdown' ? 'Rich Text Editor' : 'Markdown'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Preview Toggle (only for Markdown mode) */}
            {currentMode === 'markdown' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  togglePreview();
                }}
                className="h-7 px-2 text-xs"
              >
                {showPreview ? (
                  <>
                    <EyeOff className="w-3 h-3 mr-1" />
                    Éditer
                  </>
                ) : (
                  <>
                    <Eye className="w-3 h-3 mr-1" />
                    Aperçu
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Editor or Preview */}
      {currentMode === 'richtext' ? (
        // Rich Text Editor Mode
        <div onClick={(e) => e.stopPropagation()}>
          <RichTextEditor
            content={block.data.html || ''}
            onChange={handleRichTextChange}
            placeholder="Écrivez votre contenu ici..."
            organizationId={organizationId}
            entityId={resourceId}
            storageBucket="org-resources"
            minHeight="150px"
            editable={isActive}
          />
        </div>
      ) : (
        // Markdown Mode
        <>
          {showPreview ? (
            <div className="prose prose-sm max-w-none bg-white rounded p-4 border border-gray-200 min-h-[100px]">
              {block.data.markdown ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {block.data.markdown}
                </ReactMarkdown>
              ) : (
                <p className="text-gray-400 italic">Aucun contenu à prévisualiser</p>
              )}
            </div>
          ) : (
            <textarea
              value={block.data.markdown || ''}
              onChange={handleMarkdownChange}
              placeholder="Écrivez votre contenu ici... Supports Markdown (titres, listes, liens, **gras**, *italique*, etc.)"
              className={cn(
                "w-full min-h-[150px] p-3 rounded border border-gray-300 focus:ring-1 outline-none resize-y font-mono text-sm transition-colors",
                !isActive && "bg-gray-50"
              )}
              style={{
                ['--tw-ring-color' as string]: 'var(--color-primary, #ff5932)'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-primary, #ff5932)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '';
              }}
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </>
      )}

      {/* Markdown Help (only show in markdown mode when active and not previewing) */}
      {isActive && currentMode === 'markdown' && !showPreview && (
        <div className="mt-2 text-xs text-gray-500 space-y-1">
          <p className="font-medium">Aide Markdown:</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <span><code className="bg-gray-100 px-1 rounded"># Titre</code> - Titre 1</span>
            <span><code className="bg-gray-100 px-1 rounded">## Titre</code> - Titre 2</span>
            <span><code className="bg-gray-100 px-1 rounded">**gras**</code> - <strong>gras</strong></span>
            <span><code className="bg-gray-100 px-1 rounded">*italique*</code> - <em>italique</em></span>
            <span><code className="bg-gray-100 px-1 rounded">[lien](url)</code> - Lien</span>
            <span><code className="bg-gray-100 px-1 rounded">- item</code> - Liste</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TextBlock;
