import React, { useMemo } from 'react';
import { Zap, Bot, Sparkles } from 'lucide-react';
import { useAITools } from '@/hooks/useAITools';
import { ToolGrid } from '@/components/ai-tools/ToolGrid';
import { ToolFiltersCard } from '@/components/ai-tools/ToolFilters';

const Outils = () => {
  const {
    tools,
    loading,
    categories,
    favorites,
    filters,
    updateFilters,
    toggleFavorite,
  } = useAITools();

  const handleSearchChange = (search: string) => {
    updateFilters({ search });
  };

  const stats = useMemo(() => ({
    total: tools.length,
    favorites: favorites.length,
    categories: categories.length,
  }), [tools.length, favorites.length, categories.length]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900">
                Outils IA Aurentia
              </h1>
            </div>
            
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Découvrez notre collection d'outils d'intelligence artificielle conçus pour 
              accélérer votre projet et transformer vos idées en réalité.
            </p>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 pt-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-2xl font-bold text-orange-600">
                  <Sparkles className="w-6 h-6" />
                  {stats.total}
                </div>
                <p className="text-sm text-gray-600">Outils disponibles</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-2xl font-bold text-orange-600">
                  <Zap className="w-6 h-6" />
                  {stats.categories}
                </div>
                <p className="text-sm text-gray-600">Catégories</p>
              </div>
              
              {stats.favorites > 0 && (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-2xl font-bold text-orange-600">
                    ⭐ {stats.favorites}
                  </div>
                  <p className="text-sm text-gray-600">Favoris</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Filtres */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="sticky top-8">
              <ToolFiltersCard
                filters={filters}
                categories={categories}
                onFiltersChange={updateFilters}
              />
            </div>
          </div>

          {/* Main Content - Grille d'outils */}
          <div className="flex-1">
            <ToolGrid
              tools={tools}
              loading={loading}
              favorites={favorites}
              filters={filters}
              onSearchChange={handleSearchChange}
              onToggleFavorite={toggleFavorite}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Outils;
