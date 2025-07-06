import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  Star, 
  Heart, 
  Download,
  ShoppingCart,
  Eye,
  FileText,
  Monitor,
  Calculator,
  Zap,
  Shield,
  Search,
  PenTool,
  BarChart3,
  Palette,
  Settings,
  Scale,
  DollarSign,
  Database,
  Megaphone,
  Grid3X3,
  CheckCircle,
  User
} from 'lucide-react';
import { cn } from '../../lib/utils';

// Mapping des icônes par type
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

// Mapping des icônes par catégorie
const categoryIcons = {
  'business-plan': FileText,
  marketing: Megaphone,
  finance: DollarSign,
  operations: Settings,
  legal: Scale,
  analytics: BarChart3
};

// Couleurs par difficulté
const difficultyColors = {
  'Débutant': 'bg-green-100 text-green-800 border-green-200',
  'Intermédiaire': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Avancé': 'bg-red-100 text-red-800 border-red-200'
};

// Couleurs par catégorie
const categoryColors = {
  'business-plan': 'bg-blue-100 text-blue-800',
  marketing: 'bg-pink-100 text-pink-800',
  finance: 'bg-green-100 text-green-800',
  operations: 'bg-purple-100 text-purple-800',
  legal: 'bg-indigo-100 text-indigo-800',
  analytics: 'bg-teal-100 text-teal-800'
};

const ResourceCard = ({ 
  resource, 
  onSelect, 
  onToggleFavorite, 
  onAddToCart,
  isFavorite = false,
  isInCart = false,
  isPurchased = false,
  canAddToCart = true,
  className 
}) => {
  const TypeIcon = typeIcons[resource.type] || FileText;
  const CategoryIcon = categoryIcons[resource.category] || Grid3X3;

  const handleCardClick = () => {
    onSelect(resource);
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    onToggleFavorite(resource.id);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (canAddToCart && onAddToCart) {
      onAddToCart(resource.id);
    }
  };

  const formatPrice = (price) => {
    return price === 0 ? 'Gratuit' : `${price} crédits`;
  };

  return (
    <Card
      className={cn(
        "group cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-[1.02] border border-gray-200 hover:border-blue-300 bg-white relative overflow-hidden",
        resource.popular && "ring-1 ring-blue-200 border-blue-300",
        resource.featured && "ring-1 ring-purple-200 border-purple-300",
        className
      )}
      onClick={handleCardClick}
    >
      {/* Badges en haut à droite */}
      <div className="absolute top-3 right-3 flex flex-col gap-1 z-10">
        {resource.popular && (
          <Badge className="text-xs bg-blue-100 text-blue-800 border-blue-200 font-medium">
            Populaire
          </Badge>
        )}
        {resource.featured && (
          <Badge className="text-xs bg-purple-100 text-purple-800 border-purple-200 font-medium">
            Mis en avant
          </Badge>
        )}
      </div>

      {/* Image de prévisualisation */}
      <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        <img
          src={resource.image}
          alt={resource.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
        
        {/* Bouton preview au hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Button
            size="sm"
            variant="secondary"
            className="bg-white/90 hover:bg-white text-gray-900 shadow-lg"
          >
            <Eye className="h-4 w-4 mr-2" />
            Aperçu
          </Button>
        </div>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <div className={cn(
                "p-1.5 rounded-lg",
                categoryColors[resource.category] || "bg-gray-100 text-gray-800"
              )}>
                <CategoryIcon className="h-4 w-4" />
              </div>
              <Badge
                variant="outline"
                className={cn("text-xs font-medium", difficultyColors[resource.difficulty])}
              >
                {resource.difficulty}
              </Badge>
            </div>
            
            <CardTitle className="text-lg font-semibold line-clamp-2 group-hover:text-blue-600 transition-colors mb-1">
              {resource.name}
            </CardTitle>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <TypeIcon className="h-4 w-4" />
              <span className="capitalize">{resource.type.replace('-', ' ')}</span>
              <span>•</span>
              <span>{resource.estimatedTime}</span>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "p-1.5 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity rounded-full",
              isFavorite && "opacity-100 text-red-500 hover:text-red-600 hover:bg-red-50"
            )}
            onClick={handleFavoriteClick}
          >
            <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="py-2">
        <CardDescription className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">
          {resource.description}
        </CardDescription>

        {/* Auteur */}
        <div className="flex items-center gap-2 mb-3">
          <img
            src={resource.author.avatar}
            alt={resource.author.name}
            className="w-6 h-6 rounded-full object-cover"
          />
          <span className="text-sm text-gray-600">{resource.author.name}</span>
          {resource.author.verified && (
            <CheckCircle className="h-4 w-4 text-blue-500" />
          )}
        </div>

        {/* Statistiques */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{resource.rating}</span>
            <span>({resource.reviewCount})</span>
          </div>
          <div className="flex items-center gap-1">
            <Download className="h-3 w-3" />
            <span>{resource.downloadCount.toLocaleString()}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {resource.tags.slice(0, 3).map((tag, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 font-normal"
            >
              {tag}
            </Badge>
          ))}
          {resource.tags.length > 3 && (
            <Badge
              variant="secondary"
              className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 font-normal"
            >
              +{resource.tags.length - 3}
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-4 border-t bg-gradient-to-r from-gray-50 to-gray-50/50">
        <div className="flex items-center justify-between w-full">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              {resource.originalPrice && resource.originalPrice > resource.price && (
                <span className="text-sm text-gray-400 line-through">
                  {formatPrice(resource.originalPrice)}
                </span>
              )}
              <span className="font-bold text-lg text-gray-900">
                {formatPrice(resource.price)}
              </span>
            </div>
            {resource.originalPrice && resource.originalPrice > resource.price && (
              <span className="text-xs text-green-600 font-medium">
                -{Math.round((1 - resource.price / resource.originalPrice) * 100)}%
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {isPurchased ? (
              <Badge className="bg-green-100 text-green-800 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Acheté
              </Badge>
            ) : isInCart ? (
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                Dans le panier
              </Badge>
            ) : (
              <Button
                size="sm"
                className={cn(
                  "text-xs px-4 py-2 h-auto font-medium transition-all duration-200",
                  canAddToCart
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-sm hover:shadow-md"
                    : "opacity-50 cursor-not-allowed bg-gray-300 text-gray-500"
                )}
                disabled={!canAddToCart}
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-3 w-3 mr-1" />
                Ajouter
              </Button>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ResourceCard;