import React, { useState } from 'react';
import { 
  FileText, Mail, TrendingUp, Users, Receipt, Target, Eye, MessageCircle,
  Star, Clock, Zap, CheckCircle, XCircle, Loader2, AlertTriangle, 
  Play, Pause, Settings, BarChart3, Calendar, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';

// Mapping des icônes
const iconMap = {
  FileText, Mail, TrendingUp, Users, Receipt, Target, Eye, MessageCircle
};

const AutomationModal = ({ 
  automation, 
  isOpen, 
  onClose, 
  onActivate, 
  onDeactivate,
  hasEnoughCredits,
  credits,
  loading 
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const IconComponent = iconMap[automation.icon] || FileText;

  if (!automation) return null;

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

  const getComplexityProgress = (complexity) => {
    const values = {
      'Simple': 33,
      'Moyenne': 66,
      'Avancée': 100
    };
    return values[complexity] || 0;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <div className="flex items-start gap-4">
            {/* Icône */}
            <div className={`
              w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0
              ${automation.isActive 
                ? 'bg-green-100 text-green-600' 
                : 'bg-gray-100 text-gray-600'
              }
            `}>
              <IconComponent className="w-8 h-8" />
            </div>

            {/* Titre et badges */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  {automation.name}
                </DialogTitle>
                <div className="flex gap-2">
                  {automation.popular && (
                    <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      Populaire
                    </Badge>
                  )}
                  {automation.isActive && (
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  )}
                  <Badge className={getCategoryColor(automation.category)}>
                    {automation.category}
                  </Badge>
                </div>
              </div>
              
              <DialogDescription className="text-base text-gray-600 mb-4">
                {automation.description}
              </DialogDescription>

              {/* Statistiques rapides */}
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{automation.rating}</span>
                  <span>({automation.reviews} avis)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{automation.estimatedTime}</span>
                </div>
                <div className={`flex items-center gap-1 ${getComplexityColor(automation.complexity)}`}>
                  <Zap className="w-4 h-4" />
                  <span>{automation.complexity}</span>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="features">Fonctionnalités</TabsTrigger>
            <TabsTrigger value="pricing">Tarification</TabsTrigger>
            <TabsTrigger value="settings" disabled={!automation.isActive}>
              Paramètres
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Description détaillée */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Description détaillée</h3>
              <p className="text-gray-600 leading-relaxed">
                {automation.longDescription}
              </p>
            </div>

            {/* Complexité */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Niveau de complexité</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Complexité</span>
                  <span className={`text-sm font-medium ${getComplexityColor(automation.complexity)}`}>
                    {automation.complexity}
                  </span>
                </div>
                <Progress 
                  value={getComplexityProgress(automation.complexity)} 
                  className="h-2"
                />
                <p className="text-xs text-gray-500">
                  {automation.complexity === 'Simple' && 'Configuration rapide, idéal pour débuter'}
                  {automation.complexity === 'Moyenne' && 'Quelques paramètres à configurer'}
                  {automation.complexity === 'Avancée' && 'Configuration avancée, plus de possibilités'}
                </p>
              </div>
            </div>

            {/* Temps estimé */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Temps de mise en place</h3>
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="text-blue-800 font-medium">{automation.estimatedTime}</span>
              </div>
            </div>

            {/* Avis et notes */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Avis utilisateurs</h3>
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{automation.rating}</div>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${
                          i < Math.floor(automation.rating) 
                            ? 'fill-yellow-400 text-yellow-400' 
                            : 'text-gray-300'
                        }`} 
                      />
                    ))}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">
                    Basé sur <span className="font-medium">{automation.reviews} avis</span> d'utilisateurs
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    95% des utilisateurs recommandent cette automatisation
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="features" className="space-y-4">
            <h3 className="font-semibold text-lg mb-4">Fonctionnalités incluses</h3>
            <div className="grid gap-3">
              {automation.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            {/* Intégrations */}
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-3">Intégrations disponibles</h4>
              <div className="flex flex-wrap gap-2">
                {['Stripe', 'Google Workspace', 'Slack', 'Notion', 'Zapier'].map((integration) => (
                  <Badge key={integration} variant="outline" className="text-xs">
                    {integration}
                  </Badge>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
            {/* Prix principal */}
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {automation.price} crédits
              </div>
              <p className="text-gray-600">Prix d'activation unique</p>
            </div>

            {/* Comparaison avec votre solde */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Votre situation</h3>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Vos crédits actuels</span>
                <span className="font-bold text-xl">{credits}</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Coût de cette automatisation</span>
                <span className="font-bold text-xl text-blue-600">-{automation.price}</span>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <span className="text-gray-900 font-medium">Solde après activation</span>
                <span className={`font-bold text-xl ${
                  hasEnoughCredits ? 'text-green-600' : 'text-red-600'
                }`}>
                  {credits - automation.price}
                </span>
              </div>

              {!hasEnoughCredits && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Crédits insuffisants</AlertTitle>
                  <AlertDescription>
                    Il vous manque {automation.price - credits} crédits pour activer cette automatisation.
                    Rechargez votre compte pour continuer.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Économies potentielles */}
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">💰 Économies estimées</h4>
              <p className="text-sm text-green-700">
                Cette automatisation peut vous faire économiser jusqu'à <strong>5-10 heures par semaine</strong>,
                soit environ <strong>200-400€ de temps de travail par mois</strong>.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            {automation.isActive ? (
              <div className="space-y-6">
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <h3 className="font-medium text-green-800">Automatisation active</h3>
                    <p className="text-sm text-green-600">
                      Cette automatisation fonctionne en arrière-plan
                    </p>
                  </div>
                </div>

                {/* Statistiques d'utilisation */}
                <div>
                  <h3 className="font-semibold text-lg mb-4">Statistiques d'utilisation</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">24</div>
                      <div className="text-sm text-gray-600">Exécutions ce mois</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">98%</div>
                      <div className="text-sm text-gray-600">Taux de succès</div>
                    </div>
                  </div>
                </div>

                {/* Actions rapides */}
                <div>
                  <h3 className="font-semibold text-lg mb-4">Actions</h3>
                  <div className="flex gap-3">
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4 mr-2" />
                      Configurer
                    </Button>
                    <Button variant="outline" size="sm">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Voir les logs
                    </Button>
                    <Button variant="outline" size="sm">
                      <Pause className="w-4 h-4 mr-2" />
                      Mettre en pause
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-medium text-gray-900 mb-2">
                  Automatisation non active
                </h3>
                <p className="text-gray-600">
                  Activez cette automatisation pour accéder aux paramètres
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Actions du modal */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
          
          <div className="flex gap-3">
            {automation.isActive ? (
              <Button
                variant="destructive"
                onClick={() => onDeactivate(automation)}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <XCircle className="w-4 h-4 mr-2" />
                )}
                Désactiver
              </Button>
            ) : (
              <Button
                onClick={() => onActivate(automation)}
                disabled={!hasEnoughCredits || loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                {hasEnoughCredits ? `Activer (${automation.price} crédits)` : 'Crédits insuffisants'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AutomationModal;