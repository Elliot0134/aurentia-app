import React, { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Download, Star, Eye, Clock, Calendar, Tag, ExternalLink } from 'lucide-react';
import { ResourceWithStats } from '@/types/resources';
import { cn } from '@/lib/utils';
import { useResourceDownload } from '@/hooks/useResourcesNew';
import { useUserRatingForResource } from '@/hooks/useResourceRatings';
import ResourceRatingForm from './ResourceRatingForm';
import ResourceRatingsList from './ResourceRatingsList';
import { toast } from 'sonner';

interface ResourceModalProps {
  resource: ResourceWithStats | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleFavorite: () => void;
  isFavorite: boolean;
}

const ResourceModal: React.FC<ResourceModalProps> = ({
  resource,
  isOpen,
  onClose,
  onToggleFavorite,
  isFavorite
}) => {
  const downloadMutation = useResourceDownload();
  const { data: userRating } = useUserRatingForResource(resource?.id || '');

  // Incrémenter les vues à l'ouverture
  useEffect(() => {
    if (resource && isOpen) {
      // Ici on pourrait appeler une fonction pour incrémenter les vues
      console.log(`Vue ajoutée pour la ressource ${resource.id}`);
    }
  }, [resource, isOpen]);

  if (!resource) return null;

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

  const handleDownload = () => {
    if (resource.file_url) {
      downloadMutation.mutate(
        { id: resource.id, fileUrl: resource.file_url },
        {
          onSuccess: () => {
            toast.success('Téléchargement démarré !');
          },
          onError: () => {
            toast.error('Erreur lors du téléchargement');
          }
        }
      );
    } else {
      toast.error('Lien de téléchargement non disponible');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-5xl w-[95vw] h-[90vh] p-0 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 h-full">
          {/* Colonne gauche - Image (carrée en desktop) */}
          <div className="relative bg-gray-100">
            {resource.image_url ? (
              <img 
                src={resource.image_url} 
                alt={resource.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl bg-gradient-to-br from-gray-100 to-gray-200">
                {getTypeIcon(resource.type)}
              </div>
            )}
            
            {/* Bouton favori en overlay */}
            <div className="absolute top-4 right-4">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-10 w-10 p-0 rounded-full bg-white/90 backdrop-blur-sm",
                  isFavorite && "bg-[#F86E19]/10"
                )}
                onClick={onToggleFavorite}
              >
                <Heart 
                  className={cn(
                    "h-5 w-5 transition-colors",
                    isFavorite ? "text-[#F86E19] fill-[#F86E19]" : "text-gray-600"
                  )} 
                />
              </Button>
            </div>
          </div>

          {/* Colonne droite - Contenu */}
          <div className="flex flex-col h-full">
            {/* Header */}
            <DialogHeader className="p-6 pb-4 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <DialogTitle className="text-xl md:text-2xl font-semibold text-left mb-2">
                    {resource.name}
                  </DialogTitle>
                  
                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge className={cn("text-xs", getDifficultyColor(resource.difficulty))}>
                      {resource.difficulty}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {resource.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {resource.type}
                    </Badge>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {resource.average_rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <span className="font-medium">{resource.average_rating.toFixed(1)}</span>
                        {resource.rating_count && (
                          <span>({resource.rating_count} avis)</span>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{resource.view_count} vues</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="h-4 w-4" />
                      <span>{resource.download_count} téléchargements</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Prix et bouton principal */}
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-2">
                  <img src="/credit-3D.png" alt="Crédit" className="w-6 h-6" />
                  <span className="text-2xl font-bold text-gray-900">{resource.price}</span>
                  <span className="text-muted-foreground">crédits</span>
                </div>
                
                <Button
                  className="bg-[#F86E19] hover:bg-[#E55A00] text-white px-6"
                  disabled={downloadMutation.isPending}
                  onClick={handleDownload}
                >
                  {downloadMutation.isPending ? (
                    <>
                      <div className="animate-spin w-4 h-4 border border-white border-t-transparent rounded-full mr-2" />
                      Téléchargement...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger
                    </>
                  )}
                </Button>
              </div>
            </DialogHeader>

            {/* Contenu avec onglets */}
            <div className="flex-1 overflow-hidden">
              <Tabs defaultValue="details" className="h-full flex flex-col">
                <TabsList className="mx-6 grid w-auto grid-cols-3">
                  <TabsTrigger value="details">Détails</TabsTrigger>
                  <TabsTrigger value="reviews">Avis</TabsTrigger>
                  <TabsTrigger value="stats">Statistiques</TabsTrigger>
                </TabsList>

                <div className="flex-1 overflow-y-auto px-6 pb-6">
                  <TabsContent value="details" className="mt-4 space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Description</h4>
                      <DialogDescription className="text-sm leading-relaxed">
                        {resource.description}
                      </DialogDescription>
                    </div>

                    {resource.estimated_time && (
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Temps estimé
                        </h4>
                        <p className="text-sm text-muted-foreground">{resource.estimated_time}</p>
                      </div>
                    )}

                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        Tags
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {resource.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Informations
                      </h4>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Type: {resource.type}</p>
                        <p>Catégorie: {resource.category}</p>
                        <p>Niveau: {resource.difficulty}</p>
                        <p>Créé le: {new Date(resource.created_at).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>

                    {resource.file_url && (
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <ExternalLink className="h-4 w-4" />
                          Lien direct
                        </h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(resource.file_url, '_blank')}
                          className="text-xs"
                        >
                          Ouvrir dans un nouvel onglet
                        </Button>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="reviews" className="mt-4">
                    <div className="space-y-6">
                      {/* Formulaire de notation */}
                      <div>
                        <h4 className="font-semibold mb-4">
                          {userRating ? 'Modifier mon avis' : 'Donner mon avis'}
                        </h4>
                        <ResourceRatingForm
                          resourceId={resource.id}
                          existingRating={userRating?.rating}
                          existingComment={userRating?.comment}
                          onSuccess={() => {
                            // Le modal peut rester ouvert après soumission
                          }}
                        />
                      </div>

                      {/* Séparateur */}
                      <div className="border-t pt-6">
                        <h4 className="font-semibold mb-4">Avis des utilisateurs</h4>
                        <ResourceRatingsList resourceId={resource.id} />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="stats" className="mt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-[#F86E19]">{resource.view_count}</div>
                        <div className="text-sm text-muted-foreground">Vues</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{resource.download_count}</div>
                        <div className="text-sm text-muted-foreground">Téléchargements</div>
                      </div>
                    </div>
                    
                    {resource.average_rating && (
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                          <span className="text-2xl font-bold">{resource.average_rating.toFixed(1)}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Basé sur {resource.rating_count} avis
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResourceModal;