import React from 'react';
import { Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DividerBlock as DividerBlockType } from '@/types/resourceTypes';

interface DividerBlockProps {
  block: DividerBlockType;
  isActive: boolean;
  onActivate: () => void;
  readOnly?: boolean;
}

export const DividerBlock: React.FC<DividerBlockProps> = ({
  block,
  isActive,
  onActivate,
  readOnly = false
}) => {
  if (readOnly) {
    return (
      <div className="my-6">
        <hr className="border-t-2 border-gray-300" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative border-2 rounded-lg p-4 transition-all cursor-pointer",
        isActive ? "" : "border-transparent hover:border-gray-200"
      )}
      style={isActive ? {
        borderColor: 'var(--color-primary, #ff5932)',
        backgroundColor: 'rgba(59, 130, 246, 0.05)'
      } : undefined}
      onClick={onActivate}
    >
      {/* Block Type Indicator */}
      <div className="flex items-center gap-2 mb-2">
        <Minus className="w-4 h-4 text-gray-400" />
        <span className="text-xs text-gray-500 font-medium">Séparateur</span>
      </div>

      {/* Visual Divider */}
      <div className="my-2">
        <hr className="border-t-2 border-gray-300" />
      </div>

      {isActive && (
        <p className="text-xs text-gray-500 mt-2">
          Ce bloc insère un séparateur horizontal visuel
        </p>
      )}
    </div>
  );
};

export default DividerBlock;
