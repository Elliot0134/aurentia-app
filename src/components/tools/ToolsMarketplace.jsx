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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import ToolGrid from './ToolGrid';
import ToolModal from './ToolModal';
import ToolFilters from './ToolFilters';
import CreditBalance from '../automation/CreditBalance';
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
  AlertCircle
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
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Centre d'outils IA
            </h1>
            <p className="text-gray-600">
              Découvrez {stats.totalTools} outils spécialisés pour votre entreprise
            </p>
          </div>
          <CreditBalance credits={credits} />
        </div>
        
        {/* Statistiques rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center space-x-2">
              <Grid3X3 className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-lg font-semibold">{stats.totalTools}</div>
                <div className="text-sm text-gray-600">Outils disponibles</div>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-600" />
              <div>
                <div className="text-lg font-semibold">{stats.averageRating}</div>
                <div className="text-sm text-gray-600">Note moyenne</div>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-red-600" />
              <div>
                <div className="text-lg font-semibold">{stats.favoritesCount}</div>
                <div className="text-sm text-gray-600">Favoris</div>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center space-x-2">
              <History className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-lg font-semibold">{stats.usageCount}</div>
                <div className="text-sm text-gray-600">Utilisations</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher un outil..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex space-x-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
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
      </div>

      {/* Catégories */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const IconComponent = categoryIcons[category.id] || Grid3X3;
          return (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="flex items-center space-x-2"
            >
              <IconComponent className="h-4 w-4" />
              <span>{category.name}</span>
              <Badge variant="secondary" className="ml-1">
                {category.count}
              </Badge>
            </Button>
          );
        })}
      </div>

      {/* Onglets principaux */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap gap-2 mb-6">
          <TabsTrigger value="all" className="flex items-center space-x-2">
            <Grid3X3 className="h-4 w-4" />
            <span>Tous</span>
          </TabsTrigger>
          <TabsTrigger value="popular" className="flex items-center space-x-2">
            <Star className="h-4 w-4" />
            <span>Populaires</span>
          </TabsTrigger>
          <TabsTrigger value="recommended" className="flex items-center space-x-2">
            <Sparkles className="h-4 w-4" />
            <span>Recommandés</span>
          </TabsTrigger>
          <TabsTrigger value="favorites" className="flex items-center space-x-2">
            <Heart className="h-4 w-4" />
            <span>Favoris</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center space-x-2">
            <History className="h-4 w-4" />
            <span>Historique</span>
          </TabsTrigger>
        </TabsList>

        {/* Contenu des onglets */}
        {['all', 'popular', 'recommended', 'favorites', 'history'].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-6">
            <ToolGrid
              tools={getToolsForTab(tab)}
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
          </TabsContent>
        ))}
      </Tabs>

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
