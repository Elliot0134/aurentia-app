import React from 'react';
import { Database } from 'lucide-react';
import { formatBytes } from '@/services/knowledgeBaseService';
import { cn } from '@/lib/utils';

interface KnowledgeBaseHeaderProps {
  usedBytes: number;
  limitBytes: number;
  percentage: number;
  warningLevel: 'none' | 'warning' | 'critical' | 'full';
}

const KnowledgeBaseHeader: React.FC<KnowledgeBaseHeaderProps> = ({
  usedBytes,
  limitBytes,
  percentage,
  warningLevel,
}) => {
  // Get indicator color based on warning level
  const getIndicatorColor = () => {
    switch (warningLevel) {
      case 'critical':
      case 'full':
        return 'bg-red-500';
      case 'warning':
        return 'bg-orange-500';
      default:
        return 'bg-green-500';
    }
  };

  const getTextColor = () => {
    switch (warningLevel) {
      case 'critical':
      case 'full':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 animate-fade-in">
      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-aurentia-pink to-aurentia-orange flex items-center justify-center shadow-md">
          <Database className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Base de connaissances</h1>
          <p className="text-sm text-gray-500 mt-0.5">Enrichissez votre projet avec des ressources</p>
        </div>
      </div>

      {/* Storage indicator */}
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2.5 shadow-sm hover:shadow-md transition-shadow">
        {/* Indicator dot with pulse animation */}
        <div className="relative flex items-center justify-center">
          <div className={cn('w-2.5 h-2.5 rounded-full', getIndicatorColor())} />
          {percentage >= 75 && (
            <div className={cn('absolute w-2.5 h-2.5 rounded-full animate-ping opacity-75', getIndicatorColor())} />
          )}
        </div>

        {/* Storage text */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">Stockage:</span>
          <span className={cn('text-sm font-semibold', getTextColor())}>
            {formatBytes(usedBytes)} / {formatBytes(limitBytes)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBaseHeader;
