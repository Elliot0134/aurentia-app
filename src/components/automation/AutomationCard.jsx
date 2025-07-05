import React from 'react';
import { 
  FileText, Mail, TrendingUp, Users, Receipt, Target, Eye, MessageCircle,
  Star, Clock, Zap, CheckCircle, XCircle, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

// Mapping des icônes
const iconMap = {
  FileText,
  Mail,
  TrendingUp,
  Users,
  Receipt,
  Target,
  Eye,
  MessageCircle
};

const AutomationCard = ({ 
  automation, 
  viewMode = 'grid', 
  onSelect, 
  onToggle, 
  hasEnoughCredits,
  loading 
}) => {
  const IconComponent = iconMap[automation.icon] || FileText;

  const getCategoryColor = (category) => {
    const colors = {
      'Marketing': 'bg-blue-100 text-blue-700 border-blue-200',
      'Juridique': 'bg-purple-100 text-purple-700 border-purple-200',
      'Finance': 'bg-green-100 text-green-700 border-green-200',
      'RH': 'bg-orange-100 text-orange-700 border-orange-200'
    };
    return colors[category] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getComplexityColor = (complexity) => {
    const colors = {
      'Simple': 'text-green-600',
      'Moyenne': 'text-yellow-600',
      'Avancée': 'text-red-600'
    };
    return colors[complexity] || 'text-gray-600';
  };

  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-md transition-all duration-200 cursor-pointer group">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* Icône */}
            <div className={`
              w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0
              ${automation.isActive 
                ? 'bg-green-100 text-green-600' 
                : 'bg-gray-100 text-gray-600'
              }
            `}>
              <IconComponent className="w-6 h-6" />
            </div>

            {/* Contenu principal */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                      {automation.name}
                    </h3>
                    {automation.popular && (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 border-yellow-200">
                        <Star className="w-3 h-3 mr-1" />
                        Populaire
                      </Badge>
                    )}
                    {automation.isActive && (
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{automation.description}</p>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span>{automation.rating}</span>
                      <span>({automation.reviews})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{automation.estimatedTime}</span>
                    </div>
                    <div className={`flex items-center gap-1 ${getComplexityColor(automation.complexity)}`}>
                      <Zap className="w-3 h-3" />
                      <span>{automation.complexity}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <Badge className={getCategoryColor(automation.category)}>
                    {automation.category}
                  </Badge>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {automation.price}
                    </div>
                    <div className="text-xs text-gray-500">crédits</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect();
                }}
              >
                Détails
              </Button>
              
              {automation.isActive ? (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggle(automation);
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 mr-1" />
                      Désactiver
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggle(automation);
                  }}
                  disabled={!hasEnoughCredits || loading}
                  className={!hasEnoughCredits ? 'opacity-50 cursor-not-allowed' : ''}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Activer
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Mode grille
  return (
    <Card 
      className="hover:shadow-lg transition-all duration-300 cursor-pointer group relative overflow-hidden"
      onClick={onSelect}
    >
      {/* Badge populaire */}
      {automation.popular && (
        <div className="absolute top-3 right-3 z-10">
          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
            <Star className="w-3 h-3 mr-1 fill-current" />
            Populaire
          </Badge>
        </div>
      )}

      {/* Badge actif */}
      {automation.isActive && (
        <div className="absolute top-3 left-3 z-10">
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </Badge>
        </div>
      )}

      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className={`
            w-12 h-12 rounded-lg flex items-center justify-center
            ${automation.isActive 
              ? 'bg-green-100 text-green-600' 
              : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600'
            }
            transition-colors duration-200
          `}>
            <IconComponent className="w-6 h-6" />
          </div>
          <Badge className={getCategoryColor(automation.category)}>
            {automation.category}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        <h3 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
          {automation.name}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {automation.description}
        </p>

        {/* Statistiques */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span>{automation.rating}</span>
            <span>({automation.reviews})</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{automation.estimatedTime}</span>
          </div>
        </div>

        {/* Complexité */}
        <div className="flex items-center justify-between mb-4">
          <div className={`flex items-center gap-1 text-xs ${getComplexityColor(automation.complexity)}`}>
            <Zap className="w-3 h-3" />
            <span>Complexité: {automation.complexity}</span>
          </div>
        </div>

        {/* Prix */}
        <div className="flex items-center justify-between">
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {automation.price}
            </div>
            <div className="text-xs text-gray-500">crédits</div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <div className="flex gap-2 w-full">
          {automation.isActive ? (
            <Button
              variant="destructive"
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                onToggle(automation);
              }}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : (
                <XCircle className="w-4 h-4 mr-1" />
              )}
              Désactiver
            </Button>
          ) : (
            <Button
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                onToggle(automation);
              }}
              disabled={!hasEnoughCredits || loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-1" />
              )}
              {hasEnoughCredits ? 'Activer' : 'Crédits insuffisants'}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default AutomationCard;