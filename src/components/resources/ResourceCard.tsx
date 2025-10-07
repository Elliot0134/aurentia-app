import React from 'react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Download, Star, Eye } from 'lucide-react';
import { ResourceWithStats } from '@/types/resources';
import { cn } from '@/lib/utils';

interface ResourceCardProps {
  resource: ResourceWithStats;
  onClick: () => void;
  onToggleFavorite: () => void;
  onDownload: () => void;
  isFavorite: boolean;
  isDownloading?: boolean;
}

const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  onClick,
  onToggleFavorite,
  onDownload,
  isFavorite,
  isDownloading = false
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Débutant':
        return 'bg-green-100 text-green-800';
      case 'Intermédiaire':
        return 'bg-orange-100 text-orange-800';
      case 'Avancé':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'notion':
        return '📝';
      case 'canva':
        return '🎨';
      case 'pdf':
        return '📄';
      case 'template':
        return '📋';
      case 'guide':
        return '📖';
      case 'video':
        return '🎥';
      case 'audio':
        return '🎧';
      case 'tool':
        return '🛠️';
      default:
        return '📄';
    }
  };

  return (
    <Card 
      className="group cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border border-gray-200 hover:border-[#F86E19] bg-white overflow-hidden"
      onClick={onClick}
    >
      <CardContent className="p-0">
        {/* Image */}
        <div className="aspect-square w-full overflow-hidden bg-gray-100">
          {resource.image_url ? (
            <img 
              src={resource.image_url} 
              alt={resource.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-gray-100 to-gray-200">
              {getTypeIcon(resource.type)}
            </div>
          )}
          
          {/* Bouton favori en overlay */}
          <div className="absolute top-3 right-3">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 w-8 p-0 rounded-full bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200",
                isFavorite && "opacity-100 bg-[#F86E19]/10"
              )}
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
            >
              <Heart 
                className={cn(
                  "h-4 w-4 transition-colors",
                  isFavorite ? "text-[#F86E19] fill-[#F86E19]" : "text-gray-600"
                )} 
              />
            </Button>
          </div>
        </div>

        {/* Contenu */}
        <div className="p-4">
          {/* Titre */}
          <CardTitle className="text-lg font-semibold mb-2 line-clamp-2 min-h-[3rem]">
            {resource.name}
          </CardTitle>

          {/* Description */}
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2 min-h-[2.5rem]">
            {resource.description}
          </p>

          {/* Tags et badges */}
          <div className="flex flex-wrap gap-1 mb-3 min-h-[1.5rem]">
            <span className={cn(
              "inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium",
              getDifficultyColor(resource.difficulty)
            )}>
              {resource.difficulty}
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
              {resource.category}
            </span>
            {resource.estimated_time && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                {resource.estimated_time}
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between mb-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-3">
              {/* Rating */}
              {resource.average_rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                  <span className="text-xs font-medium">{resource.average_rating.toFixed(1)}</span>
                  {resource.rating_count && (
                    <span className="text-xs">({resource.rating_count})</span>
                  )}
                </div>
              )}
              
              {/* Vues */}
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span className="text-xs">{resource.view_count}</span>
              </div>

              {/* Téléchargements */}
              <div className="flex items-center gap-1">
                <Download className="h-3 w-3" />
                <span className="text-xs">{resource.download_count}</span>
              </div>
            </div>
          </div>

          {/* Footer avec prix et bouton téléchargement */}
          <div className="flex items-center justify-between">
            {/* Prix */}
            <div className="flex items-center gap-1">
              <img src="/credit-3D.png" alt="Crédit" className="w-4 h-4" />
              <span className="font-semibold text-gray-700">{resource.price}</span>
            </div>

            {/* Bouton téléchargement */}
            <Button
              size="sm"
              className="h-7 px-3 text-xs bg-[#F86E19] hover:bg-[#E55A00] text-white"
              disabled={isDownloading}
              onClick={(e) => {
                e.stopPropagation();
                onDownload();
              }}
            >
              {isDownloading ? (
                <>
                  <div className="animate-spin w-3 h-3 border border-white border-t-transparent rounded-full mr-1" />
                  Téléchargement...
                </>
              ) : (
                <>
                  <Download className="h-3 w-3 mr-1" />
                  Télécharger
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default React.memo(ResourceCard);