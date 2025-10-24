import React from 'react';
import { Globe, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { EmbedBlock as EmbedBlockType } from '@/types/resourceTypes';

interface EmbedBlockProps {
  block: EmbedBlockType;
  onUpdate: (data: Partial<EmbedBlockType['data']>) => void;
  readOnly?: boolean;
  isActive?: boolean;
}

const PRESET_HEIGHTS = [
  { value: '300', label: 'Petit (300px)' },
  { value: '450', label: 'Moyen (450px)' },
  { value: '600', label: 'Grand (600px)' },
  { value: '800', label: 'Très grand (800px)' }
];

export function EmbedBlock({ block, onUpdate, readOnly = false, isActive = false }: EmbedBlockProps) {
  const height = block.data.height || 450;
  const isValidUrl = block.data.url && (block.data.url.startsWith('http://') || block.data.url.startsWith('https://'));

  if (readOnly) {
    if (!isValidUrl) {
      return (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">URL d'intégration invalide ou manquante</p>
        </div>
      );
    }

    return (
      <div className="rounded-lg overflow-hidden border">
        {block.data.caption && (
          <div className="px-4 py-2 bg-gray-50 border-b">
            <p className="text-sm text-gray-700">{block.data.caption}</p>
          </div>
        )}
        <iframe
          src={block.data.url}
          width="100%"
          height={height}
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          title={block.data.caption || 'Contenu intégré'}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      {isActive && (
        <div className="p-4 bg-gray-50 rounded-lg border space-y-4">
          <div>
            <Label>Hauteur</Label>
            <Select
              value={String(height)}
              onValueChange={(value) => onUpdate({ height: Number(value) })}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRESET_HEIGHTS.map(preset => (
                  <SelectItem key={preset.value} value={preset.value}>
                    {preset.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Légende (optionnel)</Label>
            <Input
              value={block.data.caption || ''}
              onChange={(e) => onUpdate({ caption: e.target.value })}
              placeholder="Description du contenu intégré"
              className="mt-1.5"
            />
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex gap-2 text-blue-700 mb-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p className="text-xs font-medium">Exemples d'URLs compatibles</p>
            </div>
            <ul className="text-xs text-blue-600 space-y-1 ml-6 list-disc">
              <li>Google Forms, Google Maps</li>
              <li>YouTube, Vimeo (utiliser l'URL d'intégration)</li>
              <li>Figma, Miro, Canva</li>
              <li>CodePen, JSFiddle</li>
            </ul>
          </div>
        </div>
      )}

      {/* URL input */}
      <div>
        <Label>URL d'intégration</Label>
        <Textarea
          value={block.data.url}
          onChange={(e) => onUpdate({ url: e.target.value })}
          placeholder="https://example.com/embed/..."
          className="mt-1.5 font-mono text-sm min-h-[80px]"
        />
        {block.data.url && !isValidUrl && (
          <p className="text-xs text-red-600 mt-1">
            L'URL doit commencer par http:// ou https://
          </p>
        )}
      </div>

      {/* Preview */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
        {isValidUrl ? (
          <>
            {block.data.caption && (
              <div className="px-4 py-2 bg-gray-50 border-b">
                <p className="text-sm text-gray-700">{block.data.caption}</p>
              </div>
            )}
            <iframe
              src={block.data.url}
              width="100%"
              height={height}
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              title={block.data.caption || 'Aperçu du contenu intégré'}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            />
          </>
        ) : (
          <div className="p-12 text-center">
            <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 mb-2">Aperçu de l'intégration</p>
            <p className="text-xs text-gray-500">
              Entrez une URL valide pour voir l'aperçu
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default EmbedBlock;
