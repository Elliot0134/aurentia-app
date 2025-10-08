import React from 'react';
import { Filter, Star, X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import type { ToolFilters } from '@/types/aiTools';

interface ToolFiltersProps {
  filters: ToolFilters;
  categories: string[];
  onFiltersChange: (filters: Partial<ToolFilters>) => void;
  className?: string;
}

export const ToolFiltersCard: React.FC<ToolFiltersProps> = ({
  filters,
  categories,
  onFiltersChange,
  className = '',
}) => {
  const difficulties = ['Facile', 'Moyenne', 'Difficile'];

  const activeFiltersCount = [
    filters.category !== 'all',
    filters.difficulty !== 'all',
    filters.showFavorites,
  ].filter(Boolean).length;

  const handleClearFilters = () => {
    onFiltersChange({
      category: 'all',
      difficulty: 'all',
      showFavorites: false,
    });
  };

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtres
          </CardTitle>
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {activeFiltersCount}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-xs h-6 px-2"
              >
                <X className="w-3 h-3 mr-1" />
                Effacer
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Favoris */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-gray-900">Affichage</h4>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="favorites"
              checked={filters.showFavorites}
              onCheckedChange={(checked) =>
                onFiltersChange({ showFavorites: !!checked })
              }
            />
            <label
              htmlFor="favorites"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
            >
              <Star className="w-4 h-4 text-yellow-500" />
              Mes favoris uniquement
            </label>
          </div>
        </div>

        {/* Catégories */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-gray-900">Catégorie</h4>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="category"
                value="all"
                checked={filters.category === 'all'}
                onChange={(e) => onFiltersChange({ category: e.target.value })}
                className="mr-2 text-orange-600 focus:ring-orange-500"
              />
              <span className="text-sm">Toutes les catégories</span>
            </label>
            {categories.map((category) => (
              <label key={category} className="flex items-center">
                <input
                  type="radio"
                  name="category"
                  value={category}
                  checked={filters.category === category}
                  onChange={(e) => onFiltersChange({ category: e.target.value })}
                  className="mr-2 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm capitalize">{category}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Difficulté */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-gray-900">Difficulté</h4>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="difficulty"
                value="all"
                checked={filters.difficulty === 'all'}
                onChange={(e) => onFiltersChange({ difficulty: e.target.value })}
                className="mr-2 text-orange-600 focus:ring-orange-500"
              />
              <span className="text-sm">Toutes les difficultés</span>
            </label>
            {difficulties.map((difficulty) => (
              <label key={difficulty} className="flex items-center">
                <input
                  type="radio"
                  name="difficulty"
                  value={difficulty}
                  checked={filters.difficulty === difficulty}
                  onChange={(e) => onFiltersChange({ difficulty: e.target.value })}
                  className="mr-2 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm">{difficulty}</span>
                <div className={`ml-2 w-2 h-2 rounded-full ${
                  difficulty === 'Facile' ? 'bg-green-500' :
                  difficulty === 'Moyenne' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`} />
              </label>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};