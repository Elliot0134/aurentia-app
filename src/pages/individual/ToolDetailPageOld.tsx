import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, Star, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Credit3DDisplay } from '@/components/ui/Credit3DDisplay';
import { useAIToolDetails, useAIToolsList } from '@/hooks/useAIToolsNew';
import { ToolDetailTabs } from '@/components/ai-tools/ToolDetailTabs';

const ToolDetailPage = () => {
  const { slug, id } = useParams<{ slug: string; id: string }>();
  const navigate = useNavigate();
  const { toggleFavorite, favorites } = useAIToolsList();
  
  const {
    tool,
    loading,
    history,
    settings,
    executing,
    saveSettings,
    executeTool,
  } = useAIToolDetails(id || '');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Header Skeleton */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 mb-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-40 h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="w-80 h-8 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="w-full h-20 bg-gray-200 rounded animate-pulse"></div>
            </div>
            
            {/* Content Skeleton */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
              <div className="w-full h-96 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Outil non trouvé</h1>
          <p className="text-gray-600 mb-6">L'outil que vous recherchez n'existe pas ou n'est plus disponible.</p>
          <Button 
            onClick={() => navigate('/individual/outils')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            Retour aux outils
          </Button>
        </div>
      </div>
    );
  }

  const isFavorite = favorites.includes(tool.id);

  const getDifficultyColor = (difficulty: string | null) => {
    switch (difficulty) {
      case 'Facile':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Moyenne':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Difficile':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 mb-8">
            {/* Navigation */}
            <div className="flex items-center gap-4 mb-8">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/individual/outils')}
                className="flex items-center gap-2 text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-4 py-2 rounded-lg transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour aux outils
              </Button>
            </div>

            {/* Tool Info */}
            <div className="flex flex-col lg:flex-row lg:items-start gap-8">
              {/* Icon/Image avec effet 3D */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
                    {tool.icon_url ? (
                      <img
                        src={tool.icon_url}
                        alt={tool.title}
                        className="w-14 h-14 object-contain drop-shadow-sm"
                      />
                    ) : (
                      <Zap className="w-12 h-12 text-white drop-shadow-sm" />
                    )}
                  </div>
                  {/* Effet de brillance 3D */}
                  <div className="absolute inset-0 w-24 h-24 bg-gradient-to-tr from-white/20 to-transparent rounded-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300"></div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
                      {tool.title}
                    </h1>
                    <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
                      {tool.description || tool.short_description}
                    </p>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFavorite(tool.id)}
                    className={`flex items-center gap-2 ml-4 px-4 py-2 rounded-lg transition-all duration-200 ${
                      isFavorite 
                        ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' 
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {isFavorite ? (
                      <Heart className="w-5 h-5 fill-current text-red-500" />
                    ) : (
                      <Heart className="w-5 h-5" />
                    )}
                    {isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                  </Button>
                </div>

                {/* Badges et métadonnées avec design amélioré */}
                <div className="flex flex-wrap items-center gap-4">
                  <Badge className={`${getDifficultyColor(tool.difficulty)} px-3 py-1 text-sm font-medium border`}>
                    {tool.difficulty || 'Non spécifié'}
                  </Badge>
                  
                  <Badge variant="outline" className="px-3 py-1 text-sm font-medium bg-blue-50 text-blue-700 border-blue-200">
                    {tool.category}
                  </Badge>
                  
                  {/* Affichage 3D des crédits avec le nouveau composant */}
                  <Credit3DDisplay credits={tool.credits_cost} size="md" />
                  
                  {tool.estimated_time && (
                    <div className="text-sm text-gray-600 flex items-center gap-1">
                      ⏱️ <span>{tool.estimated_time}</span>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {tool.tags && tool.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tool.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs px-2 py-1">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Onglets améliorés */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
            <ToolDetailTabs
              tool={tool}
              history={history}
              settings={settings}
              executing={executing}
              onSaveSettings={saveSettings}
              onExecuteTool={executeTool}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolDetailPage;