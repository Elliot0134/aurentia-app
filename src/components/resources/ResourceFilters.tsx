import React from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Filter, X } from 'lucide-react';
import { ResourceFilters, RESOURCE_CATEGORIES, RESOURCE_TYPES, DIFFICULTY_LEVELS } from '@/types/resources';

interface ResourceFiltersProps {
  filters: ResourceFilters;
  onFiltersChange: (filters: ResourceFilters) => void;
  onResetFilters: () => void;
}

const ResourceFiltersComponent: React.FC<ResourceFiltersProps> = ({
  filters,
  onFiltersChange,
  onResetFilters
}) => {
  const updateFilter = (key: keyof ResourceFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const hasActiveFilters = !!(
    filters.search ||
    (filters.category && filters.category !== 'all') ||
    (filters.type && filters.type !== 'all') ||
    (filters.difficulty && filters.difficulty !== 'all') ||
    (filters.sortBy && filters.sortBy !== 'recent')
  );

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-col gap-4">
          {/* Première ligne - Recherche */}
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher des ressources..."
              value={filters.search || ''}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="pl-8"
            />
          </div>

          {/* Deuxième ligne - Filtres */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Catégorie */}
            <Select
              value={filters.category || 'all'}
              onValueChange={(value) => updateFilter('category', value)}
            >
              <SelectTrigger className="hover:border-[#F86E19] transition-colors">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {RESOURCE_CATEGORIES.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Type */}
            <Select
              value={filters.type || 'all'}
              onValueChange={(value) => updateFilter('type', value)}
            >
              <SelectTrigger className="hover:border-[#F86E19] transition-colors">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                {RESOURCE_TYPES.map(type => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Difficulté */}
            <Select
              value={filters.difficulty || 'all'}
              onValueChange={(value) => updateFilter('difficulty', value)}
            >
              <SelectTrigger className="hover:border-[#F86E19] transition-colors">
                <SelectValue placeholder="Difficulté" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les niveaux</SelectItem>
                {DIFFICULTY_LEVELS.map(level => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Tri */}
            <Select
              value={filters.sortBy || 'recent'}
              onValueChange={(value) => updateFilter('sortBy', value)}
            >
              <SelectTrigger className="hover:border-[#F86E19] transition-colors">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Plus récents</SelectItem>
                <SelectItem value="popular">Plus populaires</SelectItem>
                <SelectItem value="rating">Mieux notés</SelectItem>
                <SelectItem value="name">Nom (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Troisième ligne - Actions */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Filter className="h-4 w-4" />
                <span>Filtres actifs</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onResetFilters}
                className="h-7 px-3 text-xs hover:bg-[#F3F4F6] hover:text-black"
              >
                <X className="h-3 w-3 mr-1" />
                Réinitialiser
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ResourceFiltersComponent;