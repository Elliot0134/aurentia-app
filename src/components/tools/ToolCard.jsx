import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  Star, 
  Clock, 
  CreditCard, 
  Heart, 
  Download,
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
  MessageCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';

// Mapping des icônes
const iconMap = {
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
  MessageCircle,
  Target: Monitor,
  Info: FileText,
  Lock: Shield,
  Building: Settings,
  TrendingUp: BarChart3,
  Presentation: Monitor,
  LineChart: BarChart3,
  Tag: Search,
  Newspaper: FileText,
  PieChart: BarChart3,
  Grid3X3: Settings
};

// Mapping des couleurs de complexité
const complexityColors = {
  'Simple': 'bg-green-100 text-green-800 border-green-200',
  'Moyenne': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Avancée': 'bg-red-100 text-red-800 border-red-200'
};

// Mapping des couleurs de catégorie
const categoryColors = {
  juridique: 'bg-purple-100 text-purple-800',
  finance: 'bg-green-100 text-green-800',
  seo: 'bg-orange-100 text-orange-800',
  presentation: 'bg-red-100 text-red-800',
  redaction: 'bg-indigo-100 text-indigo-800',
  analyse: 'bg-teal-100 text-teal-800',
  design: 'bg-pink-100 text-pink-800',
  digital: 'bg-cyan-100 text-cyan-800'
};

const ToolCard = ({ 
  tool, 
  onSelect, 
  onToggleFavorite, 
  isFavorite = false,
  canUse = true,
  usageCount = 0,
  className 
}) => {
  const IconComponent = iconMap[tool.icon] || FileText;

  const handleCardClick = () => {
    onSelect(tool);
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    onToggleFavorite(tool.id);
  };

  return (
    <Card
      className={cn(
        "group cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-[1.02] border border-gray-200 hover:border-blue-300 bg-white",
        tool.popular && "ring-1 ring-blue-200 border-blue-300",
        !canUse && "opacity-60",
        className
      )}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={cn(
              "p-2.5 rounded-xl shadow-sm",
              categoryColors[tool.category] || "bg-gray-100 text-gray-800"
            )}>
              <IconComponent className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base font-semibold line-clamp-2 group-hover:text-blue-600 transition-colors mb-1">
                {tool.name}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Badge
                  variant="outline"
                  className={cn("text-xs font-medium", complexityColors[tool.complexity])}
                >
                  {tool.complexity}
                </Badge>
                {tool.popular && (
                  <Badge className="text-xs bg-blue-100 text-blue-800 border-blue-200 font-medium">
                    Populaire
                  </Badge>
                )}
              </div>
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
          {tool.description}
        </CardDescription>

        {/* Informations essentielles */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <div className="flex items-center space-x-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{tool.rating}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>{tool.estimatedTime}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Download className="h-3 w-3" />
            <span>{tool.outputType}</span>
          </div>
        </div>

        {/* Tags principaux */}
        <div className="flex flex-wrap gap-1 mb-3">
          {tool.tags.slice(0, 2).map((tag, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 font-normal"
            >
              {tag}
            </Badge>
          ))}
          {tool.tags.length > 2 && (
            <Badge
              variant="secondary"
              className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 font-normal"
            >
              +{tool.tags.length - 2}
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-4 border-t bg-gradient-to-r from-gray-50 to-gray-50/50">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <CreditCard className="h-4 w-4 text-gray-500" />
              <span className="font-semibold text-sm text-gray-700">{tool.price} crédits</span>
            </div>
            {usageCount > 0 && (
              <Badge variant="outline" className="text-xs">
                {usageCount}x
              </Badge>
            )}
          </div>
          
          <Button
            size="sm"
            className={cn(
              "text-xs px-4 py-2 h-auto font-medium transition-all duration-200",
              canUse
                ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-sm hover:shadow-md"
                : "opacity-50 cursor-not-allowed bg-gray-300 text-gray-500"
            )}
            disabled={!canUse}
          >
            {canUse ? 'Utiliser' : 'Crédits insuffisants'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ToolCard;
