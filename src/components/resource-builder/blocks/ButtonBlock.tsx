import React from 'react';
import { ExternalLink, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import type { ButtonBlock as ButtonBlockType } from '@/types/resourceTypes';

interface ButtonBlockProps {
  block: ButtonBlockType;
  onUpdate: (data: Partial<ButtonBlockType['data']>) => void;
  readOnly?: boolean;
  isActive?: boolean;
}

export function ButtonBlock({ block, onUpdate, readOnly = false, isActive = false }: ButtonBlockProps) {
  const variant = block.data.variant || 'primary';
  const size = block.data.size || 'medium';

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'hover:opacity-90 text-white';
      case 'secondary':
        return 'bg-gray-600 hover:bg-gray-700 text-white';
      case 'outline':
        return 'border-2 hover:opacity-90';
      default:
        return 'hover:opacity-90 text-white';
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return { backgroundColor: 'var(--color-primary, #ff5932)' };
      case 'secondary':
        return {};
      case 'outline':
        return {
          borderColor: 'var(--color-primary, #ff5932)',
          color: 'var(--color-primary, #ff5932)'
        };
      default:
        return { backgroundColor: 'var(--color-primary, #ff5932)' };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'px-4 py-2 text-sm';
      case 'medium':
        return 'px-6 py-3 text-base';
      case 'large':
        return 'px-8 py-4 text-lg';
      default:
        return 'px-6 py-3 text-base';
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    const actionType = block.data.actionType || 'url';

    switch (actionType) {
      case 'url':
        // Default behavior - let anchor tag handle it
        break;

      case 'download':
        e.preventDefault();
        if (block.data.url) {
          const link = document.createElement('a');
          link.href = block.data.url;
          link.download = block.data.downloadFilename || 'download';
          link.click();
        }
        break;

      case 'scroll':
        e.preventDefault();
        if (block.data.actionValue) {
          const target = document.querySelector(block.data.actionValue);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
        break;

      case 'email':
        e.preventDefault();
        if (block.data.actionValue) {
          window.location.href = `mailto:${block.data.actionValue}`;
        }
        break;
    }
  };

  if (readOnly) {
    const actionType = block.data.actionType || 'url';
    const hasValidAction = block.data.url || block.data.actionValue;

    return (
      <div className="flex justify-center py-4">
        {hasValidAction ? (
          actionType === 'url' ? (
            <a
              href={block.data.url}
              target={block.data.openInNewTab ? '_blank' : '_self'}
              rel={block.data.openInNewTab ? 'noopener noreferrer' : undefined}
              className={cn(
                'inline-flex items-center gap-2 rounded-lg font-medium transition-colors',
                getVariantClasses(),
                getSizeClasses()
              )}
              style={getVariantStyles()}
            >
              {block.data.text || 'Button'}
              {block.data.openInNewTab && <ExternalLink className="w-4 h-4" />}
            </a>
          ) : (
            <button
              onClick={handleClick}
              className={cn(
                'inline-flex items-center gap-2 rounded-lg font-medium transition-colors',
                getVariantClasses(),
                getSizeClasses()
              )}
              style={getVariantStyles()}
            >
              {block.data.text || 'Button'}
            </button>
          )
        ) : (
          <button
            className={cn(
              'inline-flex items-center gap-2 rounded-lg font-medium cursor-not-allowed opacity-50',
              getVariantClasses(),
              getSizeClasses()
            )}
          >
            {block.data.text || 'Button'}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      {isActive && (
        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border-2" style={{
          borderColor: 'var(--color-primary, #ff5932)'
        }}>
          <div className="col-span-2">
            <Label className="text-sm font-semibold">Texte du bouton</Label>
            <Input
              value={block.data.text}
              onChange={(e) => onUpdate({ text: e.target.value })}
              placeholder="Cliquez ici"
              className="mt-1.5"
            />
          </div>

          <div className="col-span-2">
            <Label className="text-sm font-semibold flex items-center justify-between">
              <span>Type d'action</span>
              <span className="text-xs font-normal text-gray-500">Configurer le comportement du bouton</span>
            </Label>
            <Select
              value={block.data.actionType || 'url'}
              onValueChange={(value: any) => onUpdate({ actionType: value })}
            >
              <SelectTrigger className="mt-1.5" style={{
                borderColor: 'color-mix(in srgb, var(--color-primary, #ff5932) 30%, #e5e7eb)'
              }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="url">🔗 Naviguer vers URL</SelectItem>
                <SelectItem value="download">📥 Télécharger fichier</SelectItem>
                <SelectItem value="scroll">⬇️ Défiler vers section</SelectItem>
                <SelectItem value="email">✉️ Envoyer email</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(block.data.actionType === 'url' || !block.data.actionType) && (
            <div className="col-span-2">
              <Label className="text-sm font-semibold">URL du lien</Label>
              <Input
                value={block.data.url || ''}
                onChange={(e) => onUpdate({ url: e.target.value })}
                placeholder="https://example.com"
                className="mt-1.5"
              />
            </div>
          )}

          <div>
            <Label>Style</Label>
            <Select
              value={variant}
              onValueChange={(value: any) => onUpdate({ variant: value })}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="primary">Principal</SelectItem>
                <SelectItem value="secondary">Secondaire</SelectItem>
                <SelectItem value="outline">Contour</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Taille</Label>
            <Select
              value={size}
              onValueChange={(value: any) => onUpdate({ size: value })}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Petit</SelectItem>
                <SelectItem value="medium">Moyen</SelectItem>
                <SelectItem value="large">Grand</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(block.data.actionType === 'scroll' || block.data.actionType === 'email') && (
            <div>
              <Label>
                {block.data.actionType === 'scroll' ? 'ID de la section cible' : 'Adresse email'}
              </Label>
              <Input
                value={block.data.actionValue || ''}
                onChange={(e) => onUpdate({ actionValue: e.target.value })}
                placeholder={block.data.actionType === 'scroll' ? '#section-id' : 'example@email.com'}
                className="mt-1.5"
              />
            </div>
          )}

          {block.data.actionType === 'download' && (
            <div>
              <Label>Nom du fichier téléchargé</Label>
              <Input
                value={block.data.downloadFilename || ''}
                onChange={(e) => onUpdate({ downloadFilename: e.target.value })}
                placeholder="document.pdf"
                className="mt-1.5"
              />
            </div>
          )}

          {block.data.actionType === 'url' && (
            <div className="flex items-center justify-between col-span-2">
              <Label htmlFor="new-tab">Ouvrir dans un nouvel onglet</Label>
              <Switch
                id="new-tab"
                checked={block.data.openInNewTab ?? false}
                onCheckedChange={(checked) => onUpdate({ openInNewTab: checked })}
              />
            </div>
          )}
        </div>
      )}

      {/* Preview */}
      <div className="space-y-2">
        <div className="flex justify-center py-6 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
          <button
            className={cn(
              'inline-flex items-center gap-2 rounded-lg font-medium',
              getVariantClasses(),
              getSizeClasses()
            )}
            style={getVariantStyles()}
            onClick={(e) => e.preventDefault()}
          >
            {block.data.text || 'Button'}
            {block.data.openInNewTab && <ExternalLink className="w-4 h-4" />}
          </button>
        </div>
        {isActive && (
          <div className="text-xs text-center text-gray-500 flex items-center justify-center gap-2">
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-medium">
              Action: {
                block.data.actionType === 'download' ? '📥 Téléchargement' :
                block.data.actionType === 'scroll' ? '⬇️ Défilement' :
                block.data.actionType === 'email' ? '✉️ Email' :
                '🔗 Lien'
              }
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default ButtonBlock;
