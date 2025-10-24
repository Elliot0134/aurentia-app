import React from 'react';
import { Quote } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { QuoteBlock as QuoteBlockType } from '@/types/resourceTypes';

interface QuoteBlockProps {
  block: QuoteBlockType;
  onUpdate: (data: Partial<QuoteBlockType['data']>) => void;
  readOnly?: boolean;
  isActive?: boolean;
}

export function QuoteBlock({ block, onUpdate, readOnly = false, isActive = false }: QuoteBlockProps) {
  const style = block.data.style || 'border';

  const getStyleClasses = () => {
    switch (style) {
      case 'border':
        return 'border-l-4 bg-gray-50 pl-6 pr-4 py-4';
      case 'background':
        return 'border border-gray-200 p-6';
      case 'centered':
        return 'text-center bg-white border-t border-b border-gray-200 py-8 px-4';
      default:
        return 'border-l-4 bg-gray-50 pl-6 pr-4 py-4';
    }
  };

  const getStyleInlineStyles = () => {
    switch (style) {
      case 'border':
        return { borderLeftColor: 'var(--color-primary, #ff5932)' };
      case 'background':
        return {
          background: 'linear-gradient(to right, color-mix(in srgb, var(--color-primary, #ff5932) 8%, white), white)'
        };
      case 'centered':
        return {};
      default:
        return { borderLeftColor: 'var(--color-primary, #ff5932)' };
    }
  };

  if (readOnly) {
    return (
      <div className={cn('rounded-lg', getStyleClasses())} style={getStyleInlineStyles()}>
        <div className="flex items-start gap-3">
          {style !== 'centered' && (
            <Quote className="w-8 h-8 flex-shrink-0 mt-1" style={{ color: 'var(--color-primary, #ff5932)' }} />
          )}
          <div className="flex-1">
            {style === 'centered' && (
              <Quote className="w-10 h-10 mx-auto mb-4" style={{ color: 'var(--color-primary, #ff5932)' }} />
            )}
            <p className={cn(
              "text-lg italic leading-relaxed",
              style === 'centered' ? 'text-center' : ''
            )}>
              "{block.data.quote}"
            </p>
            {(block.data.author || block.data.source) && (
              <div className={cn(
                "mt-4 text-sm text-gray-600",
                style === 'centered' ? 'text-center' : ''
              )}>
                {block.data.author && (
                  <p className="font-medium">— {block.data.author}</p>
                )}
                {block.data.source && (
                  <p className="text-gray-500">{block.data.source}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      {isActive && (
        <div className="p-4 bg-gray-50 rounded-lg border space-y-4">
          <div>
            <Label>Style</Label>
            <Select
              value={style}
              onValueChange={(value: any) => onUpdate({ style: value })}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="border">Bordure gauche</SelectItem>
                <SelectItem value="background">Fond coloré</SelectItem>
                <SelectItem value="centered">Centré</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Quote content */}
      <Textarea
        value={block.data.quote}
        onChange={(e) => onUpdate({ quote: e.target.value })}
        placeholder="Entrez la citation..."
        className="min-h-[100px] text-lg italic"
      />

      {/* Author and source */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Auteur (optionnel)</Label>
          <Input
            value={block.data.author || ''}
            onChange={(e) => onUpdate({ author: e.target.value })}
            placeholder="Nom de l'auteur"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label>Source (optionnel)</Label>
          <Input
            value={block.data.source || ''}
            onChange={(e) => onUpdate({ source: e.target.value })}
            placeholder="Source ou référence"
            className="mt-1.5"
          />
        </div>
      </div>
    </div>
  );
}

export default QuoteBlock;
