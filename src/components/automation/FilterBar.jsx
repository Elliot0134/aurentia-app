import React from 'react';
import { Filter, X, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

const FilterBar = ({
  categories,
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceRangeChange,
  complexityFilters,
  onComplexityChange,
  ratingFilter,
  onRatingChange,
  statusFilter,
  onStatusChange,
  onResetFilters,
  activeFiltersCount
}) => {
  const complexityOptions = [
    { id: 'simple', label: 'Simple', color: 'text-green-600' },
    { id: 'moyenne', label: 'Moyenne', color: 'text-yellow-600' },
    { id: 'avancee', label: 'Avancée', color: 'text-red-600' }
  ];

  const statusOptions = [
    { id: 'all', label: 'Toutes' },
    { id: 'active', label: 'Actives uniquement' },
    { id: 'inactive', label: 'Inactives uniquement' }
  ];

  return (
    <div className="flex items-center gap-4">
      {/* Filtres rapides */}
      <div className="hidden lg:flex items-center gap-2">
        <span className="text-sm text-gray-600 font-medium">Catégorie:</span>
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name} ({category.count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator orientation="vertical" className="h-6 hidden lg:block" />

      {/* Filtres avancés */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="relative">
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filtres avancés
            {activeFiltersCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs"
              >
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        
        <SheetContent className="w-80 sm:w-96">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtres avancés
            </SheetTitle>
            <SheetDescription>
              Affinez votre recherche d'automatisations
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            {/* Catégories */}
            <div>
              <Label className="text-base font-medium">Catégorie</Label>
              <div className="mt-3 space-y-2">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={selectedCategory === category.id}
                      onCheckedChange={() => onCategoryChange(category.id)}
                    />
                    <Label 
                      htmlFor={`category-${category.id}`}
                      className="text-sm font-normal cursor-pointer flex-1"
                    >
                      {category.name} ({category.count})
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Prix */}
            <div>
              <Label className="text-base font-medium">
                Prix (crédits): {priceRange[0]} - {priceRange[1]}
              </Label>
              <div className="mt-4 px-2">
                <Slider
                  value={priceRange}
                  onValueChange={onPriceRangeChange}
                  max={20}
                  min={5}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>5 crédits</span>
                  <span>20 crédits</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Complexité */}
            <div>
              <Label className="text-base font-medium">Complexité</Label>
              <div className="mt-3 space-y-2">
                {complexityOptions.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`complexity-${option.id}`}
                      checked={complexityFilters.includes(option.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          onComplexityChange([...complexityFilters, option.id]);
                        } else {
                          onComplexityChange(complexityFilters.filter(c => c !== option.id));
                        }
                      }}
                    />
                    <Label 
                      htmlFor={`complexity-${option.id}`}
                      className={`text-sm font-normal cursor-pointer ${option.color}`}
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Note minimale */}
            <div>
              <Label className="text-base font-medium">
                Note minimale: {ratingFilter} étoiles
              </Label>
              <div className="mt-4 px-2">
                <Slider
                  value={[ratingFilter]}
                  onValueChange={(value) => onRatingChange(value[0])}
                  max={5}
                  min={1}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1 étoile</span>
                  <span>5 étoiles</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Statut */}
            <div>
              <Label className="text-base font-medium">Statut</Label>
              <div className="mt-3 space-y-2">
                {statusOptions.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${option.id}`}
                      checked={statusFilter === option.id}
                      onCheckedChange={() => onStatusChange(option.id)}
                    />
                    <Label 
                      htmlFor={`status-${option.id}`}
                      className="text-sm font-normal cursor-pointer flex-1"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onResetFilters}
                className="flex-1"
              >
                <X className="w-4 h-4 mr-1" />
                Réinitialiser
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Indicateur de filtres actifs */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {activeFiltersCount} filtre{activeFiltersCount > 1 ? 's' : ''} actif{activeFiltersCount > 1 ? 's' : ''}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="h-6 w-6 p-0 hover:bg-gray-100"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default FilterBar;