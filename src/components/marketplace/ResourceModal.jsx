import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
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
  Palette,
  Database,
  Megaphone,
  DollarSign,
  Settings,
  Scale,
  BarChart3,
  Grid3X3,
  CheckCircle,
  User,
  Clock,
  Calendar,
  Tag,
  Share2,
  ExternalLink,
  MessageCircle,
  ThumbsUp,
  AlertCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';

// Mapping des icônes
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

// Avis fictifs pour la démo
const mockReviews = [
  {
    id: 1,
    author: "Marie L.",
    rating: 5,
    date: "2024-12-10",
    comment: "Excellent template, très complet et bien structuré. M'a fait gagner énormément de temps !",
    helpful: 12
  },
  {
    id: 2,
    author: "Thomas M.",
    rating: 4,
    date: "2024-12-08",
    comment: "Très bon produit, quelques ajustements nécessaires mais globalement parfait.",
    helpful: 8
  },
  {
    id: 3,
    author: "Sophie D.",
    rating: 5,
    date: "2024-12-05",
    comment: "Template professionnel, documentation claire. Je recommande vivement !",
    helpful: 15
  }
];

const ResourceModal = ({
  resource,
  isOpen,
  onClose,
  onToggleFavorite,
  onAddToCart,
  onPurchase,
  isFavorite = false,
  isInCart = false,
  isPurchased = false,
  canAddToCart = true
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);

  if (!resource) return null;

  const TypeIcon = typeIcons[resource.type] || FileText;
  const CategoryIcon = categoryIcons[resource.category] || Grid3X3;

  const formatPrice = (price) => {
    return price === 0 ? 'Gratuit' : `${price} crédits`;
  };

  const handleAddToCart = async () => {
    if (!canAddToCart || !onAddToCart) return;
    
    setIsLoading(true);
    try {
      await onAddToCart(resource.id);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!onPurchase) return;
    
    setIsLoading(true);
    try {
      await onPurchase(resource.id);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: resource.name,
        text: resource.description,
        url: window.location.href
      });
    } else {
      // Fallback: copier le lien
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] max-w-none max-h-[90vh] overflow-y-auto p-0 rounded-xl">
        {/* Header avec image */}
        <div className="relative h-64 bg-gradient-to-br from-gray-50 to-gray-100">
          <img
            src={resource.preview || resource.image}
            alt={resource.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20" />
          
          {/* Badges */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            {resource.popular && (
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                Populaire
              </Badge>
            )}
            {resource.featured && (
              <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                Mis en avant
              </Badge>
            )}
          </div>

          {/* Actions rapides */}
          <div className="absolute top-4 left-4 flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="bg-white/90 hover:bg-white"
              onClick={() => onToggleFavorite(resource.id)}
            >
              <Heart className={cn("h-4 w-4", isFavorite && "fill-current text-red-500")} />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="bg-white/90 hover:bg-white"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-6">
          {/* En-tête */}
          <DialogHeader className="mb-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <div className={cn(
                    "p-2 rounded-xl",
                    categoryColors[resource.category] || "bg-gray-100 text-gray-800"
                  )}>
                    <CategoryIcon className="h-6 w-6" />
                  </div>
                  <div className="flex items-center gap-2">
                    <TypeIcon className="h-5 w-5 text-gray-600" />
                    <span className="text-sm text-gray-600 capitalize">
                      {resource.type.replace('-', ' ')}
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn("font-medium", difficultyColors[resource.difficulty])}
                  >
                    {resource.difficulty}
                  </Badge>
                </div>

                <DialogTitle className="text-xl lg:text-2xl font-bold mb-2 break-words">
                  {resource.name}
                </DialogTitle>
                
                <DialogDescription className="text-gray-600 text-base leading-relaxed break-words">
                  {resource.description}
                </DialogDescription>

                {/* Auteur et stats */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <img
                      src={resource.author.avatar}
                      alt={resource.author.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-sm">{resource.author.name}</span>
                        {resource.author.verified && (
                          <CheckCircle className="h-4 w-4 text-blue-500" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{resource.rating}</span>
                    <span className="text-gray-500">({resource.reviewCount} avis)</span>
                  </div>

                  <div className="flex items-center gap-1 text-gray-500">
                    <Download className="h-4 w-4" />
                    <span className="text-sm">{resource.downloadCount.toLocaleString()} téléchargements</span>
                  </div>
                </div>
              </div>

              {/* Prix et actions */}
              <div className="lg:ml-6 lg:text-right flex-shrink-0">
                <div className="mb-4">
                  {resource.originalPrice && resource.originalPrice > resource.price && (
                    <div className="text-sm text-gray-400 line-through mb-1">
                      {formatPrice(resource.originalPrice)}
                    </div>
                  )}
                  <div className="text-2xl lg:text-3xl font-bold text-gray-900">
                    {formatPrice(resource.price)}
                  </div>
                  {resource.originalPrice && resource.originalPrice > resource.price && (
                    <div className="text-sm text-green-600 font-medium">
                      -{Math.round((1 - resource.price / resource.originalPrice) * 100)}% de réduction
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  {isPurchased ? (
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger
                    </Button>
                  ) : (
                    <>
                      <Button
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        onClick={handlePurchase}
                        disabled={isLoading}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Acheter maintenant
                      </Button>
                      
                      {!isInCart && canAddToCart && (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={handleAddToCart}
                          disabled={isLoading}
                        >
                          Ajouter au panier
                        </Button>
                      )}
                      
                      {isInCart && (
                        <Badge className="w-full justify-center py-2 bg-blue-100 text-blue-800">
                          Dans le panier
                        </Badge>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </DialogHeader>

          <Separator className="mb-6" />

          {/* Contenu avec onglets */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1">
              <TabsTrigger value="overview" className="text-xs sm:text-sm">Aperçu</TabsTrigger>
              <TabsTrigger value="features" className="text-xs sm:text-sm">Fonctionnalités</TabsTrigger>
              <TabsTrigger value="reviews" className="text-xs sm:text-sm">Avis ({resource.reviewCount})</TabsTrigger>
              <TabsTrigger value="details" className="text-xs sm:text-sm">Détails</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <h3 className="text-lg font-semibold mb-4">Description détaillée</h3>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    {resource.description}
                  </p>

                  <h3 className="text-lg font-semibold mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {resource.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-sm">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Informations</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="text-sm font-medium">Temps estimé</div>
                          <div className="text-sm text-gray-600">{resource.estimatedTime}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="text-sm font-medium">Dernière mise à jour</div>
                          <div className="text-sm text-gray-600">
                            {new Date(resource.lastUpdated).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Download className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="text-sm font-medium">Téléchargements</div>
                          <div className="text-sm text-gray-600">
                            {resource.downloadCount.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="features" className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Fonctionnalités incluses</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resource.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <div className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{resource.rating}</div>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-4 w-4",
                            i < Math.floor(resource.rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          )}
                        />
                      ))}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {resource.reviewCount} avis
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {mockReviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-gray-600" />
                            </div>
                            <div>
                              <div className="font-medium text-sm">{review.author}</div>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={cn(
                                      "h-3 w-3",
                                      i < review.rating
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-gray-300"
                                    )}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(review.date).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-700 mb-3">{review.comment}</p>
                        
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" className="text-xs">
                            <ThumbsUp className="h-3 w-3 mr-1" />
                            Utile ({review.helpful})
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="details" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Spécifications techniques</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Type</span>
                      <span className="text-sm font-medium capitalize">
                        {resource.type.replace('-', ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Catégorie</span>
                      <span className="text-sm font-medium capitalize">
                        {resource.category.replace('-', ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Difficulté</span>
                      <span className="text-sm font-medium">{resource.difficulty}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Temps estimé</span>
                      <span className="text-sm font-medium">{resource.estimatedTime}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>À propos de l'auteur</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={resource.author.avatar}
                        alt={resource.author.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{resource.author.name}</span>
                          {resource.author.verified && (
                            <CheckCircle className="h-4 w-4 text-blue-500" />
                          )}
                        </div>
                        <div className="text-sm text-gray-600">Créateur vérifié</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Voir le profil
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResourceModal;