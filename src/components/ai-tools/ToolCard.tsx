import React from 'react';
import { Star, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { AITool } from '@/types/aiTools';

interface ToolCardProps {
  tool: AITool;
  isFavorite: boolean;
  onToggleFavorite: (toolId: string) => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({
  tool,
  isFavorite,
  onToggleFavorite,
}) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/individual/outils-ia/${tool.slug}`);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(tool.id);
  };

  const getDifficultyColor = (difficulty: string | null) => {
    switch (difficulty) {
      case 'Facile':
        return 'bg-green-100 text-green-800';
      case 'Moyenne':
        return 'bg-yellow-100 text-yellow-800';
      case 'Difficile':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card 
      className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-gray-200 hover:border-orange-200"
      onClick={handleCardClick}
    >
      <CardHeader className="relative p-0">
        {/* Image */}
        <div className="relative h-48 bg-gradient-to-br from-orange-50 to-orange-100 rounded-t-lg overflow-hidden">
          {tool.image_url ? (
            <img
              src={tool.image_url}
              alt={tool.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {tool.icon_url ? (
                <img
                  src={tool.icon_url}
                  alt={tool.title}
                  className="w-16 h-16 object-contain"
                />
              ) : (
                <div className="w-16 h-16 bg-orange-200 rounded-lg flex items-center justify-center">
                  <Zap className="w-8 h-8 text-orange-600" />
                </div>
              )}
            </div>
          )}
          
          {/* Bouton favoris */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-white shadow-sm"
            onClick={handleFavoriteClick}
          >
            <Star
              className={`w-4 h-4 ${
                isFavorite 
                  ? 'fill-yellow-400 text-yellow-400' 
                  : 'text-gray-400 hover:text-yellow-400'
              }`}
            />
          </Button>

          {/* Badge difficulté */}
          {tool.difficulty && (
            <Badge
              className={`absolute top-2 left-2 ${getDifficultyColor(tool.difficulty)}`}
            >
              {tool.difficulty}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        {/* Titre et description */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1">
            {tool.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {tool.short_description || tool.description}
          </p>
        </div>

        {/* Temps estimé */}
        {tool.estimated_time && (
          <div className="text-xs text-gray-500">
            ⏱️ {tool.estimated_time}
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {tool.tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs px-2 py-0.5">
              {tag}
            </Badge>
          ))}
          {tool.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs px-2 py-0.5">
              +{tool.tags.length - 3}
            </Badge>
          )}
        </div>

        {/* Prix en crédits */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1 text-sm font-medium text-orange-600">
            <Zap className="w-4 h-4" />
            {tool.credits_cost === 0 ? 'Gratuit' : `${tool.credits_cost} crédits`}
          </div>
          <Badge variant="outline" className="text-xs">
            {tool.category}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};