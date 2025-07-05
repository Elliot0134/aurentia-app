import React from 'react';
import ToolCard from './ToolCard';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Grid3X3, 
  List, 
  Search,
  Package,
  TrendingUp,
  Clock
} from 'lucide-react';
import { cn } from '../../lib/utils';

const ToolGrid = ({ 
  tools, 
  onToolSelect, 
  onToggleFavorite,
  favorites = [],
  usageHistory = [],
  credits = 0,
  viewMode = 'grid',
  onViewModeChange,
  loading = false,
  searchQuery = '',
  selectedCategory = 'all'
}) => {
  // Calculer les statistiques d'utilisation
  const getToolUsageCount = (toolId) => {
    return usageHistory.filter(h => h.tool_id === toolId).length;
  };

  const canUseTool = (tool) => {
    return credits >= tool.price;
  };

  const isFavorite = (toolId) => {
    return favorites.includes(toolId);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Skeleton pour les contrôles */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="flex space-x-2">
            <div className="h-10 w-10 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-10 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>

        {/* Skeleton pour la grille */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-80 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (tools.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          {searchQuery ? (
            <Search className="h-8 w-8 text-gray-400" />
          ) : (
            <Package className="h-8 w-8 text-gray-400" />
          )}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {searchQuery ? 'Aucun outil trouvé' : 'Aucun outil disponible'}
        </h3>
        <p className="text-gray-600 max-w-md mx-auto">
          {searchQuery 
            ? `Aucun outil ne correspond à votre recherche "${searchQuery}". Essayez avec d'autres mots-clés.`
            : selectedCategory !== 'all' 
              ? 'Cette catégorie ne contient pas encore d\'outils.'
              : 'Aucun outil n\'est disponible pour le moment.'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques et contrôles de vue */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-gray-600" />
            <span className="font-medium text-gray-900">
              {tools.length} outil{tools.length > 1 ? 's' : ''}
            </span>
          </div>
          
          {searchQuery && (
            <Badge variant="outline" className="text-sm">
              Recherche: "{searchQuery}"
            </Badge>
          )}
          
          {selectedCategory !== 'all' && (
            <Badge variant="outline" className="text-sm capitalize">
              {selectedCategory}
            </Badge>
          )}
        </div>

        {/* Contrôles de vue */}
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onViewModeChange('grid')}
            className="p-2"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onViewModeChange('list')}
            className="p-2"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <div>
              <div className="text-sm font-medium text-blue-900">
                {tools.filter(t => t.popular).length}
              </div>
              <div className="text-xs text-blue-600">Populaires</div>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-green-600" />
            <div>
              <div className="text-sm font-medium text-green-900">
                {tools.filter(t => t.complexity === 'Simple').length}
              </div>
              <div className="text-xs text-green-600">Simples</div>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-purple-600" />
            <div>
              <div className="text-sm font-medium text-purple-900">
                {tools.filter(t => canUseTool(t)).length}
              </div>
              <div className="text-xs text-purple-600">Accessibles</div>
            </div>
          </div>
        </div>
        
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-orange-600 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">★</span>
            </div>
            <div>
              <div className="text-sm font-medium text-orange-900">
                {Math.round((tools.reduce((sum, t) => sum + t.rating, 0) / tools.length) * 10) / 10}
              </div>
              <div className="text-xs text-orange-600">Note moyenne</div>
            </div>
          </div>
        </div>
      </div>

      {/* Grille d'outils */}
      <div className={cn(
        viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          : "space-y-4"
      )}>
        {tools.map((tool) => (
          <ToolCard
            key={tool.id}
            tool={tool}
            onSelect={onToolSelect}
            onToggleFavorite={onToggleFavorite}
            isFavorite={isFavorite(tool.id)}
            canUse={canUseTool(tool)}
            usageCount={getToolUsageCount(tool.id)}
            className={cn(
              viewMode === 'list' && "max-w-none"
            )}
          />
        ))}
      </div>

      {/* Message d'encouragement si peu d'outils */}
      {tools.length > 0 && tools.length < 5 && !searchQuery && (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-2">
            Vous cherchez quelque chose de spécifique ?
          </p>
          <p className="text-sm text-gray-500">
            Utilisez la recherche ou explorez d'autres catégories pour découvrir plus d'outils.
          </p>
        </div>
      )}
    </div>
  );
};

export default ToolGrid;