import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../ui/sheet';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { Slider } from '../ui/slider';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { 
  Filter, 
  X, 
  RotateCcw,
  Star,
  CreditCard,
  Clock,
  Download
} from 'lucide-react';
import { cn } from '../../lib/utils';

const complexityOptions = [
  { value: 'simple', label: 'Simple', color: 'bg-green-100 text-green-800' },
  { value: 'moyenne', label: 'Moyenne', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'avancée', label: 'Avancée', color: 'bg-red-100 text-red-800' }
];

const outputTypeOptions = [
  { value: 'PDF', label: 'PDF', icon: '📄' },
  { value: 'Excel', label: 'Excel', icon: '📊' },
  { value: 'PowerPoint', label: 'PowerPoint', icon: '📈' },
  { value: 'HTML', label: 'HTML', icon: '🌐' },
  { value: 'Text', label: 'Texte', icon: '📝' },
  { value: 'SVG', label: 'SVG', icon: '🎨' },
  { value: 'JSON', label: 'JSON', icon: '⚙️' }
];

const ToolFilters = ({ 
  filters, 
  onFiltersChange, 
  onReset,
  totalTools,
  filteredCount,
  isOpen,
  onOpenChange
}) => {
  const handleComplexityChange = (complexity, checked) => {
    const newComplexity = checked
      ? [...filters.complexity, complexity]
      : filters.complexity.filter(c => c !== complexity);
    
    onFiltersChange({ complexity: newComplexity });
  };

  const handleOutputTypeChange = (outputType, checked) => {
    const newOutputType = checked
      ? [...filters.outputType, outputType]
      : filters.outputType.filter(t => t !== outputType);
    
    onFiltersChange({ outputType: newOutputType });
  };

  const handlePriceRangeChange = (value) => {
    onFiltersChange({ priceRange: value });
  };

  const handleMinRatingChange = (value) => {
    onFiltersChange({ minRating: value[0] });
  };

  const handlePopularOnlyChange = (checked) => {
    onFiltersChange({ popularOnly: checked });
  };

  const activeFiltersCount = 
    filters.complexity.length +
    filters.outputType.length +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.popularOnly ? 1 : 0) +
    (filters.priceRange[0] > 0 || filters.priceRange[1] < 20 ? 1 : 0);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <Filter className="h-4 w-4 mr-2" />
          Filtres
          {activeFiltersCount > 0 && (
            <Badge 
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
              variant="destructive"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            Filtres avancés
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="text-gray-500 hover:text-gray-700"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Réinitialiser
            </Button>
          </SheetTitle>
          <SheetDescription>
            {filteredCount} sur {totalTools} outils correspondent à vos critères
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] mt-6">
          <div className="space-y-6">
            {/* Filtres actifs */}
            {activeFiltersCount > 0 && (
              <div>
                <h3 className="font-medium text-sm mb-3">Filtres actifs</h3>
                <div className="flex flex-wrap gap-2">
                  {filters.complexity.map((complexity) => (
                    <Badge 
                      key={complexity} 
                      variant="secondary" 
                      className="cursor-pointer hover:bg-red-100"
                      onClick={() => handleComplexityChange(complexity, false)}
                    >
                      {complexity}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                  {filters.outputType.map((type) => (
                    <Badge 
                      key={type} 
                      variant="secondary" 
                      className="cursor-pointer hover:bg-red-100"
                      onClick={() => handleOutputTypeChange(type, false)}
                    >
                      {type}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                  {filters.popularOnly && (
                    <Badge 
                      variant="secondary" 
                      className="cursor-pointer hover:bg-red-100"
                      onClick={() => handlePopularOnlyChange(false)}
                    >
                      Populaires uniquement
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  )}
                </div>
                <Separator className="mt-4" />
              </div>
            )}

            {/* Prix */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <CreditCard className="h-4 w-4 text-gray-600" />
                <h3 className="font-medium">Prix (crédits)</h3>
              </div>
              <div className="space-y-3">
                <Slider
                  value={filters.priceRange}
                  onValueChange={handlePriceRangeChange}
                  max={20}
                  min={0}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{filters.priceRange[0]} crédits</span>
                  <span>{filters.priceRange[1]} crédits</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Note minimale */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Star className="h-4 w-4 text-gray-600" />
                <h3 className="font-medium">Note minimale</h3>
              </div>
              <div className="space-y-3">
                <Slider
                  value={[filters.minRating]}
                  onValueChange={handleMinRatingChange}
                  max={5}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>0 étoile</span>
                  <span className="font-medium">
                    {filters.minRating > 0 ? `${filters.minRating}+ étoiles` : 'Toutes les notes'}
                  </span>
                  <span>5 étoiles</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Complexité */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Clock className="h-4 w-4 text-gray-600" />
                <h3 className="font-medium">Complexité</h3>
              </div>
              <div className="space-y-3">
                {complexityOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-3">
                    <Checkbox
                      id={`complexity-${option.value}`}
                      checked={filters.complexity.includes(option.value)}
                      onCheckedChange={(checked) => 
                        handleComplexityChange(option.value, checked)
                      }
                    />
                    <label
                      htmlFor={`complexity-${option.value}`}
                      className="flex items-center space-x-2 cursor-pointer flex-1"
                    >
                      <Badge 
                        variant="outline" 
                        className={cn("text-xs", option.color)}
                      >
                        {option.label}
                      </Badge>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Format de sortie */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Download className="h-4 w-4 text-gray-600" />
                <h3 className="font-medium">Format de sortie</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {outputTypeOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-3">
                    <Checkbox
                      id={`output-${option.value}`}
                      checked={filters.outputType.includes(option.value)}
                      onCheckedChange={(checked) => 
                        handleOutputTypeChange(option.value, checked)
                      }
                    />
                    <label
                      htmlFor={`output-${option.value}`}
                      className="flex items-center space-x-2 cursor-pointer flex-1"
                    >
                      <span className="text-sm">{option.icon}</span>
                      <span className="text-sm">{option.label}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Options spéciales */}
            <div>
              <h3 className="font-medium mb-4">Options spéciales</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="popular-only"
                    checked={filters.popularOnly}
                    onCheckedChange={handlePopularOnlyChange}
                  />
                  <label
                    htmlFor="popular-only"
                    className="flex items-center space-x-2 cursor-pointer flex-1"
                  >
                    <Star className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Outils populaires uniquement</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default ToolFilters;