import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ToolCard } from './ToolCard';
import type { AITool, ToolFilters } from '@/types/aiTools';

interface ToolGridProps {
  tools: AITool[];
  loading: boolean;
  favorites: string[];
  filters: ToolFilters;
  onSearchChange: (search: string) => void;
  onToggleFavorite: (toolId: string) => void;
}

export const ToolGrid: React.FC<ToolGridProps> = ({
  tools,
  loading,
  favorites,
  filters,
  onSearchChange,
  onToggleFavorite,
}) => {
  if (loading) {
    return (
      <div className="space-y-6">
        {/* Barre de recherche skeleton */}
        <div className="relative">
          <div className="h-10 bg-gray-200 rounded-md animate-pulse"></div>
        </div>
        
        {/* Grille skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-gray-200 rounded-lg h-80 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Barre de recherche */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Rechercher un outil IA..."
          value={filters.search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Résultats */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {tools.length === 0 ? (
              'Aucun outil trouvé'
            ) : (
              `${tools.length} outil${tools.length > 1 ? 's' : ''} trouvé${tools.length > 1 ? 's' : ''}`
            )}
          </p>
        </div>

        {/* Grille d'outils */}
        {tools.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun outil trouvé
            </h3>
            <p className="text-gray-600 max-w-sm mx-auto">
              Essayez de modifier vos filtres ou votre recherche pour trouver des outils qui correspondent à vos besoins.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                isFavorite={favorites.includes(tool.id)}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};