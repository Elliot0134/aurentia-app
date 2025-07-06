import React, { useState } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import ToolGrid from './ToolGrid';
import ToolModal from './ToolModal';
import ToolFilters from './ToolFilters';
import {
  Search,
  Star,
  Heart,
  History,
  Sparkles,
  Grid3X3,
  Scale,
  DollarSign,
  Monitor,
  PenTool,
  BarChart3,
  Palette,
  Zap,
  Shield,
  Search as SearchIcon,
  AlertCircle,
  ChevronDown
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTools } from '../../hooks/useTools';
import { useCredits } from '../../hooks/useCredits';
import { categories } from '../../data/toolsDatabase';

// Mapping des icônes de catégories
const categoryIcons = {
  all: Grid3X3,
  juridique: Scale,
  finance: DollarSign,
  seo: SearchIcon,
  presentation: Monitor,
  redaction: PenTool,
  analyse: BarChart3,
  design: Palette,
  digital: Zap
};

const ToolsMarketplace = () => {
  const {
    tools,
    popularTools,
    recommendedTools,
    favorites,
    usageHistory,
    stats,
    loading,
    error,
    selectedTool,
    isModalOpen,
    selectedCategory,
    searchQuery,
    sortBy,
    filters,
    selectTool,
    closeTool,
    toggleFavorite,
    useTool,
    setSelectedCategory,
    setSearchQuery,
    setSortBy,
    updateFilters,
    resetFilters,
    isFavorite,
    canUseTool,
    getToolUsageCount
  } = useTools();

  const { credits } = useCredits();

  const [viewMode, setViewMode] = useState('grid');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isUsing, setIsUsing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Gestion de l'utilisation d'un outil
  const handleUseTool = async (toolId) => {
    setIsUsing(true);
    try {
      const result = await useTool(toolId);
      return result;
    } finally {
      setIsUsing(false);
    }
  };

  // Obtenir les outils pour chaque onglet
  const getToolsForTab = (tab) => {
    switch (tab) {
      case 'popular':
        return popularTools;
      case 'recommended':
        return recommendedTools;
      case 'favorites':
        return tools.filter(tool => isFavorite(tool.id));
      case 'history':
        const recentToolIds = [...new Set(usageHistory.slice(0, 20).map(h => h.tool_id))];
        return recentToolIds.map(id => tools.find(t => t.id === id)).filter(Boolean);
      default:
        return tools;
    }
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <AlertCircle className="h-12 w-12 mx-auto mb-2" />
          <h3 className="text-lg font-semibold">Erreur de chargement</h3>
        </div>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" style={{ maxWidth: '90vw' }}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Centre d'outils IA
          </h1>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <div className="text-2xl font-bold text-blue-600">{stats.totalTools}</div>
          <div className="text-sm text-gray-600">Outils disponibles</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <div className="text-2xl font-bold text-yellow-600">{stats.averageRating}</div>
          <div className="text-sm text-gray-600">Note moyenne</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <div className="text-2xl font-bold text-red-600">{stats.favoritesCount}</div>
          <div className="text-sm text-gray-600">Favoris</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <div className="text-2xl font-bold text-green-600">{stats.usageCount}</div>
          <div className="text-sm text-gray-600">Utilisations</div>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Recherche */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Rechercher un outil..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Catégories */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full lg:w-48 flex items-center justify-between">
                {(() => {
                  const category = categories.find(cat => cat.id === selectedCategory);
                  const IconComponent = categoryIcons[selectedCategory] || Grid3X3;
                  return (
                    <>
                      <div className="flex items-center space-x-2">
                        <IconComponent className="h-4 w-4" />
                        <span>{category?.name || 'Catégorie'}</span>
                      </div>
                      <ChevronDown className="h-4 w-4" />
                    </>
                  );
                })()}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {categories.map((category) => {
                const IconComponent = categoryIcons[category.id] || Grid3X3;
                return (
                  <DropdownMenuItem
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className="flex items-center space-x-2"
                  >
                    <IconComponent className="h-4 w-4" />
                    <span>{category.name}</span>
                    <Badge variant="secondary" className="ml-auto">
                      {category.count}
                    </Badge>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Tri */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Popularité</SelectItem>
              <SelectItem value="rating">Note</SelectItem>
              <SelectItem value="price-asc">Prix croissant</SelectItem>
              <SelectItem value="price-desc">Prix décroissant</SelectItem>
              <SelectItem value="name">Nom</SelectItem>
              <SelectItem value="newest">Plus récents</SelectItem>
            </SelectContent>
          </Select>
          
          <ToolFilters
            filters={filters}
            onFiltersChange={updateFilters}
            onReset={resetFilters}
            totalTools={stats.totalTools}
            filteredCount={tools.length}
            isOpen={isFiltersOpen}
            onOpenChange={setIsFiltersOpen}
          />
        </div>

        {/* Filtres actifs */}
        {(selectedCategory !== 'all' || searchQuery) && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
            {selectedCategory !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {categories.find(c => c.id === selectedCategory)?.name}
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                >
                  ×
                </button>
              </Badge>
            )}
            {searchQuery && (
              <Badge variant="secondary" className="flex items-center gap-1">
                "{searchQuery}"
                <button
                  onClick={() => setSearchQuery('')}
                  className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                >
                  ×
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Résultats */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-gray-600">
          {tools.length} outil{tools.length > 1 ? 's' : ''} trouvé{tools.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Grille des outils */}
      <ToolGrid
        tools={getToolsForTab(activeTab)}
        onToolSelect={selectTool}
        onToggleFavorite={toggleFavorite}
        favorites={favorites}
        usageHistory={usageHistory}
        credits={credits}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        loading={loading}
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
      />

      {/* Modal d'outil */}
      <ToolModal
        tool={selectedTool}
        isOpen={isModalOpen}
        onClose={closeTool}
        onUse={handleUseTool}
        onToggleFavorite={toggleFavorite}
        isFavorite={selectedTool ? isFavorite(selectedTool.id) : false}
        canUse={selectedTool ? canUseTool(selectedTool) : false}
        usageCount={selectedTool ? getToolUsageCount(selectedTool.id) : 0}
        isUsing={isUsing}
      />
    </div>
  );
};

export default ToolsMarketplace;
