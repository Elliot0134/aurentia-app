import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
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
  MessageCircle,
  CheckCircle,
  AlertCircle,
  Users,
  TrendingUp
} from 'lucide-react';
import { cn } from '../../lib/utils';

// Mapping des icônes (même que ToolCard)
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

const ToolModal = ({ 
  tool, 
  isOpen, 
  onClose, 
  onUse, 
  onToggleFavorite,
  isFavorite = false,
  canUse = true,
  usageCount = 0,
  isUsing = false
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!tool) return null;

  const IconComponent = iconMap[tool.icon] || FileText;

  const handleUse = async () => {
    const result = await onUse(tool.id);
    if (result.success) {
      onClose();
    }
  };

  const handleFavoriteToggle = () => {
    onToggleFavorite(tool.id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <div className="flex flex-col h-[90vh]">
          {/* Header */}
          <DialogHeader className="p-6 pb-4 border-b flex-shrink-0">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className={cn(
                  "p-3 rounded-xl",
                  categoryColors[tool.category] || "bg-gray-100 text-gray-800"
                )}>
                  <IconComponent className="h-6 w-6" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold mb-2">
                    {tool.name}
                  </DialogTitle>
                  <div className="flex items-center space-x-3">
                    <Badge
                      variant="outline"
                      className={cn("text-sm", complexityColors[tool.complexity])}
                    >
                      {tool.complexity}
                    </Badge>
                    {tool.popular && (
                      <Badge className="text-sm bg-blue-100 text-blue-800 border-blue-200">
                        Populaire
                      </Badge>
                    )}
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{tool.rating}</span>
                      <span>({tool.reviews} avis)</span>
                    </div>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "p-2",
                  isFavorite && "text-red-500 hover:text-red-600"
                )}
                onClick={handleFavoriteToggle}
              >
                <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
              </Button>
            </div>
          </DialogHeader>

          {/* Tabs */}
          <div className="border-b flex-shrink-0">
            <div className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Aperçu' },
                { id: 'features', label: 'Fonctionnalités' },
                { id: 'details', label: 'Détails' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  className={cn(
                    "py-3 px-1 border-b-2 font-medium text-sm transition-colors",
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  )}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content avec scroll amélioré */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Description</h3>
                      <DialogDescription className="text-gray-600 leading-relaxed">
                        {tool.longDescription}
                      </DialogDescription>
                    </div>

                    <Separator />

                    {/* Containers 2 par ligne */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                        <Clock className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                        <div className="text-sm font-medium text-gray-900">{tool.estimatedTime}</div>
                        <div className="text-xs text-gray-600">Temps estimé</div>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                        <CreditCard className="h-6 w-6 mx-auto mb-2 text-green-600" />
                        <div className="text-sm font-medium text-gray-900">{tool.price} crédits</div>
                        <div className="text-xs text-gray-600">Crédits</div>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                        <Download className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                        <div className="text-sm font-medium text-gray-900">{tool.outputType}</div>
                        <div className="text-xs text-gray-600">Format de sortie</div>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                        <Users className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                        <div className="text-sm font-medium text-gray-900">{usageCount}</div>
                        <div className="text-xs text-gray-600">Utilisations</div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-lg mb-3">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {tool.tags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-sm px-3 py-1"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'features' && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg mb-4">Fonctionnalités incluses</h3>
                    <div className="space-y-3">
                      {tool.features.map((feature, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'details' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Informations techniques</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm font-medium text-gray-500">Catégorie</div>
                          <div className="capitalize font-medium">{tool.category}</div>
                        </div>
                        <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm font-medium text-gray-500">Sous-catégorie</div>
                          <div className="capitalize font-medium">{tool.subcategory}</div>
                        </div>
                        <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm font-medium text-gray-500">Complexité</div>
                          <div className="font-medium">{tool.complexity}</div>
                        </div>
                        <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm font-medium text-gray-500">Format de sortie</div>
                          <div className="font-medium">{tool.outputType}</div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="font-semibold text-lg mb-3">Statistiques</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center space-x-3 p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
                          <Star className="h-5 w-5 text-yellow-500" />
                          <div>
                            <div className="font-medium">{tool.rating}/5</div>
                            <div className="text-sm text-gray-500">Note moyenne</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                          <Users className="h-5 w-5 text-blue-500" />
                          <div>
                            <div className="font-medium">{tool.reviews}</div>
                            <div className="text-sm text-gray-500">Avis clients</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                          <TrendingUp className="h-5 w-5 text-green-500" />
                          <div>
                            <div className="font-medium">{usageCount}</div>
                            <div className="text-sm text-gray-500">Vos utilisations</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Footer */}
          <DialogFooter className="p-6 border-t bg-gray-50/50 flex-shrink-0">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 text-gray-500" />
                  <span className="font-semibold">{tool.price} crédits</span>
                </div>
                {!canUse && (
                  <div className="flex items-center space-x-2 text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">Crédits insuffisants</span>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-3">
                <Button variant="outline" onClick={onClose}>
                  Fermer
                </Button>
                <Button
                  onClick={handleUse}
                  disabled={!canUse || isUsing}
                  className={cn(
                    "min-w-[120px]",
                    canUse && "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  )}
                >
                  {isUsing ? 'Utilisation...' : 'Utiliser l\'outil'}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ToolModal;