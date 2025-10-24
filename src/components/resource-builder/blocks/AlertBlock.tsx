import React from 'react';
import { Info, AlertTriangle, CheckCircle, XCircle, X } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import type { AlertBlock as AlertBlockType } from '@/types/resourceTypes';

interface AlertBlockProps {
  block: AlertBlockType;
  onUpdate: (data: Partial<AlertBlockType['data']>) => void;
  readOnly?: boolean;
  isActive?: boolean;
}

export function AlertBlock({ block, onUpdate, readOnly = false, isActive = false }: AlertBlockProps) {
  const [dismissed, setDismissed] = React.useState(false);
  const type = block.data.type || 'info';

  const getTypeConfig = () => {
    switch (type) {
      case 'info':
        return {
          icon: Info,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-900',
          iconColor: 'text-blue-600'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-900',
          iconColor: 'text-yellow-600'
        };
      case 'error':
        return {
          icon: XCircle,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-900',
          iconColor: 'text-red-600'
        };
      case 'success':
        return {
          icon: CheckCircle,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-900',
          iconColor: 'text-green-600'
        };
      default:
        return {
          icon: Info,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-900',
          iconColor: 'text-blue-600'
        };
    }
  };

  const config = getTypeConfig();
  const Icon = config.icon;

  if (readOnly) {
    if (dismissed && block.data.dismissible) {
      return null;
    }

    return (
      <div
        className={cn(
          'rounded-lg border-2 p-4',
          config.bgColor,
          config.borderColor
        )}
      >
        <div className="flex items-start gap-3">
          <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', config.iconColor)} />
          <div className="flex-1">
            <p className={cn('text-sm leading-relaxed', config.textColor)}>
              {block.data.message}
            </p>
          </div>
          {block.data.dismissible && (
            <button
              onClick={() => setDismissed(true)}
              className={cn('p-1 rounded hover:bg-black/5 transition-colors', config.textColor)}
            >
              <X className="w-4 h-4" />
            </button>
          )}
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
            <Label>Type d'alerte</Label>
            <Select
              value={type}
              onValueChange={(value: any) => onUpdate({ type: value })}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="info">Information</SelectItem>
                <SelectItem value="warning">Avertissement</SelectItem>
                <SelectItem value="error">Erreur</SelectItem>
                <SelectItem value="success">Succès</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="dismissible">Peut être fermée</Label>
            <Switch
              id="dismissible"
              checked={block.data.dismissible ?? false}
              onCheckedChange={(checked) => onUpdate({ dismissible: checked })}
            />
          </div>
        </div>
      )}

      {/* Message editor */}
      <Textarea
        value={block.data.message}
        onChange={(e) => onUpdate({ message: e.target.value })}
        placeholder="Entrez le message de l'alerte..."
        className="min-h-[80px]"
      />

      {/* Preview */}
      <div
        className={cn(
          'rounded-lg border-2 p-4',
          config.bgColor,
          config.borderColor
        )}
      >
        <div className="flex items-start gap-3">
          <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', config.iconColor)} />
          <div className="flex-1">
            <p className={cn('text-sm leading-relaxed', config.textColor)}>
              {block.data.message || 'Aperçu du message...'}
            </p>
          </div>
          {block.data.dismissible && (
            <button className={cn('p-1 rounded hover:bg-black/5 transition-colors', config.textColor)}>
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default AlertBlock;
