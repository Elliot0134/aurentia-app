import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { Checkbox } from '../ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible';
import { 
  Filter,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  FileText,
  Monitor,
  Calculator,
  Zap,
  Palette,
  Database,
  Megaphone,
  DollarSign,
  Settings,
  Scale,
  BarChart3,
  Grid3X3
} from 'lucide-react';
import { cn } from '../../lib/utils';

// Mapping des icônes
const typeIcons = {
  notion: FileText,
  canva: Palette,
  airtable: Database,
  excel: Calculator,
  'google-sheets': Calculator,
  pdf: FileText,
  powerpoint: Monitor,
  prompts: Zap
};

const categoryIcons = {
  'business-plan': FileText,
  marketing: Megaphone,
  finance: DollarSign,
  operations: Settings,
  legal: Scale,
  analytics: BarChart3
};

const FilterPanel = ({
  // Valeurs actuelles
  searchQuery,
  selectedCategory,
  selectedType,
  selectedDifficulty,
  priceRange,
  showFeatured,
  
  // Données pour les options
  categories,
  types,
  difficultyLevels,
  
  // Callbacks
  onSearchChange,
  onCategoryChange,
  onTypeChange,
  onDifficultyChange,
  onPriceRangeChange,
  onShowFeaturedChange,
  onResetFilters,
  
  // Stats
  totalResources,
  filteredCount,
  
  // UI State
  isCollapsed = false,
  onToggleCollapse
}) => {
  const [openSections, setOpenSections] = React.useState({
    category: true,
    type: true,
    difficulty: true,
    price: true,
    features: true
  });

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const hasActiveFilters = 
    searchQuery ||
    selectedCategory !== 'all' ||
    selectedType !== 'all' ||
    selectedDifficulty !== 'all' ||
    priceRange[0] > 0 ||
    priceRange[1] < 100 ||
    showFeatured;

  const activeFiltersCount = [
    searchQuery,
    selectedCategory !== 'all',
    selectedType !== 'all',
    selectedDifficulty !== 'all',
    priceRange[0] > 0 || priceRange[1] < 100,
    showFeatured
  ].filter(Boolean).length;

  return (
    <Card className="h-fit">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Filtres
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetFilters}
              className="text-gray-500 hover:text-gray-700"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
          )}
        </div>
        
        {/* Résultats */}
        <div className="text-sm text-gray-600">
          {filteredCount} sur {totalResources} ressources
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Recherche */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Recherche</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => onSearchChange('')}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Catégories */}
        <Collapsible open={openSections.category} onOpenChange={() => toggleSection('category')}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <Label className="text-sm font-medium cursor-pointer">Catégorie</Label>
              {openSections.category ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 mt-2">
            {categories.map((category) => {
              const IconComponent = categoryIcons[category.id] || Grid3X3;
              const isSelected = selectedCategory === category.id;
              
              return (
                <Button
                  key={category.id}
                  variant={isSelected ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start text-sm font-normal",
                    isSelected && "bg-blue-50 text-blue-700 border-blue-200"
                  )}
                  onClick={() => onCategoryChange(category.id)}
                >
                  <IconComponent className="h-4 w-4 mr-2" />
                  <span className="flex-1 text-left">{category.name}</span>
                  <Badge variant="outline" className="ml-auto">
                    {category.count}
                  </Badge>
                </Button>
              );
            })}
          </CollapsibleContent>
        </Collapsible>

        {/* Applications */}
        <Collapsible open={openSections.type} onOpenChange={() => toggleSection('type')}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <Label className="text-sm font-medium cursor-pointer">Application</Label>
              {openSections.type ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 mt-2">
            {types.map((type) => {
              const IconComponent = typeIcons[type.id] || Grid3X3;
              const isSelected = selectedType === type.id;
              
              return (
                <Button
                  key={type.id}
                  variant={isSelected ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start text-sm font-normal",
                    isSelected && "bg-blue-50 text-blue-700 border-blue-200"
                  )}
                  onClick={() => onTypeChange(type.id)}
                >
                  <IconComponent className="h-4 w-4 mr-2" />
                  <span className="flex-1 text-left">{type.name}</span>
                </Button>
              );
            })}
          </CollapsibleContent>
        </Collapsible>

        {/* Difficulté */}
        <Collapsible open={openSections.difficulty} onOpenChange={() => toggleSection('difficulty')}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <Label className="text-sm font-medium cursor-pointer">Niveau de difficulté</Label>
              {openSections.difficulty ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 mt-2">
            <Select value={selectedDifficulty} onValueChange={onDifficultyChange}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un niveau" />
              </SelectTrigger>
              <SelectContent>
                {difficultyLevels.map((level) => (
                  <SelectItem key={level.id} value={level.id}>
                    {level.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CollapsibleContent>
        </Collapsible>

        {/* Prix */}
        <Collapsible open={openSections.price} onOpenChange={() => toggleSection('price')}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <Label className="text-sm font-medium cursor-pointer">Fourchette de prix</Label>
              {openSections.price ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-2">
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>{priceRange[0]} crédits</span>
                <span>{priceRange[1]} crédits</span>
              </div>
              <Slider
                value={priceRange}
                onValueChange={onPriceRangeChange}
                max={100}
                min={0}
                step={5}
                className="w-full"
              />
            </div>
            
            {/* Raccourcis de prix */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => onPriceRangeChange([0, 0])}
              >
                Gratuit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => onPriceRangeChange([0, 20])}
              >
                0 - 20 crédits
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => onPriceRangeChange([20, 40])}
              >
                20 - 40 crédits
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => onPriceRangeChange([40, 100])}
              >
                40+ crédits
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Fonctionnalités */}
        <Collapsible open={openSections.features} onOpenChange={() => toggleSection('features')}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <Label className="text-sm font-medium cursor-pointer">Fonctionnalités</Label>
              {openSections.features ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 mt-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="featured"
                checked={showFeatured}
                onCheckedChange={onShowFeaturedChange}
              />
              <Label htmlFor="featured" className="text-sm cursor-pointer">
                Ressources mises en avant uniquement
              </Label>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

export default FilterPanel;