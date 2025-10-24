import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ImageUploader from '@/components/ui/ImageUploader';
import { cn } from '@/lib/utils';
import type { ImageBlock as ImageBlockType } from '@/types/resourceTypes';

interface ImageBlockProps {
  block: ImageBlockType;
  isActive: boolean;
  onUpdate: (data: Partial<ImageBlockType['data']>) => void;
  onActivate: () => void;
  readOnly?: boolean;
  organizationId?: string;
}

export const ImageBlock: React.FC<ImageBlockProps> = ({
  block,
  isActive,
  onUpdate,
  onActivate,
  readOnly = false,
  organizationId
}) => {
  const handleImageUpload = (url: string) => {
    onUpdate({ url });
  };

  const handleAltChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ alt: e.target.value });
  };

  const handleCaptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ caption: e.target.value });
  };

  if (readOnly) {
    return (
      <div className="space-y-2">
        {block.data.url && (
          <div className="rounded-lg overflow-hidden border border-gray-200">
            <img
              src={block.data.url}
              alt={block.data.alt || 'Image'}
              className="w-full h-auto"
            />
          </div>
        )}
        {block.data.caption && (
          <p className="text-sm text-gray-600 italic text-center">
            {block.data.caption}
          </p>
        )}
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
      data-tour="image-block"
    >
      {/* Block Type Indicator */}
      <div className="flex items-center gap-2 mb-4">
        <ImageIcon className="w-4 h-4 text-gray-400" />
        <span className="text-xs text-gray-500 font-medium">Image</span>
      </div>

      {/* Image Uploader */}
      <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
        <ImageUploader
          bucket="organization-resources"
          folder={organizationId ? `${organizationId}/images` : 'images'}
          value={block.data.url}
          onUpload={handleImageUpload}
          mode="banner"
          maxSizeMB={10}
          disabled={readOnly}
        />

        {/* Alt Text */}
        {isActive && block.data.url && (
          <>
            <div className="space-y-2">
              <Label htmlFor={`alt-${block.id}`} className="text-xs">
                Texte alternatif (pour l'accessibilité)
              </Label>
              <Input
                id={`alt-${block.id}`}
                value={block.data.alt || ''}
                onChange={handleAltChange}
                placeholder="Description de l'image..."
                className="text-sm"
              />
            </div>

            {/* Caption */}
            <div className="space-y-2">
              <Label htmlFor={`caption-${block.id}`} className="text-xs">
                Légende (optionnel)
              </Label>
              <Input
                id={`caption-${block.id}`}
                value={block.data.caption || ''}
                onChange={handleCaptionChange}
                placeholder="Légende de l'image..."
                className="text-sm"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ImageBlock;
