import React from 'react';
import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface HelpTooltipProps {
  /**
   * Contenu principal du tooltip (texte d'aide)
   */
  content: React.ReactNode;

  /**
   * Titre optionnel du tooltip
   */
  title?: string;

  /**
   * Taille de l'icône
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Position du tooltip
   */
  side?: 'top' | 'right' | 'bottom' | 'left';

  /**
   * Classes CSS personnalisées
   */
  className?: string;

  /**
   * Afficher l'icône en mode subtil (gris clair)
   */
  subtle?: boolean;
}

const sizeMap = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

/**
 * Composant tooltip réutilisable pour afficher de l'aide contextuelle
 * Utilise Radix UI Tooltip avec une icône d'aide
 */
export function HelpTooltip({
  content,
  title,
  size = 'md',
  side = 'top',
  className,
  subtle = false,
}: HelpTooltipProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={cn(
              'inline-flex items-center justify-center rounded-full transition-colors',
              'hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-1',
              subtle ? 'text-gray-400 hover:text-gray-600' : 'text-gray-500 hover:text-gray-700',
              className
            )}
            style={{
              ['--tw-ring-color' as string]: 'var(--color-primary, #ff5932)'
            }}
            aria-label="Aide"
          >
            <HelpCircle className={sizeMap[size]} />
          </button>
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs z-50">
          {title && (
            <div className="font-semibold mb-1 text-sm">{title}</div>
          )}
          <div className="text-sm leading-relaxed">{content}</div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default HelpTooltip;
