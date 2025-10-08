import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Grid3X3, List, Star, TrendingUp, Loader2 } from 'lucide-react';
import { useResources, useFavorites } from '@/hooks/useResourcesClean';
import { ResourceFilters, ResourceWithStats } from '@/types/resources';
import ResourceCard from '@/components/resources/ResourceCard';
import ResourceModal from '@/components/resources/ResourceModalNew';
import ResourceFiltersComponent from '@/components/resources/ResourceFilters';
import { toast } from 'sonner';

const ResourcesPage: React.FC = () => {
  // États pour les filtres
  const [filters, setFilters] = useState<ResourceFilters>({
    search: '',
    category: 'all',
    type: 'all',
    difficulty: 'all',
    sortBy: 'recent',
    sortOrder: 'desc'
  });

  // États pour la vue et la modal
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedResource, setSelectedResource] = useState<ResourceWithStats | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Hooks
  const { data: resources = [], isLoading, error } = useResources(filters);
  const { toggleFavorite, isFavorite } = useFavorites();

  // Filtres appliqués
  const appliedFilters = useMemo(() => ({
    ...filters,
    category: filters.category === 'all' ? undefined : filters.category,
    type: filters.type === 'all' ? undefined : filters.type,
    difficulty: filters.difficulty === 'all' ? undefined : filters.difficulty,
  }), [filters]);

  // Handlers
  const handleResourceClick = (resource: ResourceWithStats) => {
    setSelectedResource(resource);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedResource(null);
  };

  const handleToggleFavorite = (resourceId: string) => {
    toggleFavorite(resourceId);
    const resource = resources.find(r => r.id === resourceId);
    if (resource) {
      const action = isFavorite(resourceId) ? 'retiré des' : 'ajouté aux';
      toast.success(`${resource.name} ${action} favoris`);
    }
  };

  const handleDownload = (resource: ResourceWithStats) => {
    // Cette fonction sera gérée par le hook dans le composant ResourceCard
    console.log('Download:', resource.name);
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      category: 'all',
      type: 'all',
      difficulty: 'all',
      sortBy: 'recent',
      sortOrder: 'desc'
    });
  };

  // Statistiques pour l'en-tête
  const stats = useMemo(() => {
    const totalResources = resources.length;
    const totalDownloads = resources.reduce((sum, r) => sum + r.download_count, 0);
    const averageRating = resources.length > 0 
      ? resources.reduce((sum, r) => sum + (r.average_rating || 0), 0) / resources.length
      : 0;
    
    return {
      totalResources,
      totalDownloads,
      averageRating: Math.round(averageRating * 10) / 10
    };
  }, [resources]);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <p className="text-red-600">Erreur lors du chargement des ressources</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Réessayer
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Ressources Aurentia</h1>
        <p className="text-muted-foreground text-lg mb-6">
          Découvrez notre bibliothèque de ressources pour développer votre projet entrepreneurial
        </p>

        {/* Statistiques */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-[#F86E19]">{stats.totalResources}</div>
              <div className="text-sm text-muted-foreground">Ressources disponibles</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.totalDownloads}</div>
              <div className="text-sm text-muted-foreground">Téléchargements totaux</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-2">
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                <span className="text-2xl font-bold">{stats.averageRating}</span>
              </div>
              <div className="text-sm text-muted-foreground">Note moyenne</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filtres */}
      <ResourceFiltersComponent
        filters={filters}
        onFiltersChange={setFilters}
        onResetFilters={resetFilters}
      />

      {/* Barre d'outils */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {isLoading ? 'Chargement...' : `${resources.length} ressource(s) trouvée(s)`}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="h-8 w-8 p-0"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="h-8 w-8 p-0"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Contenu principal */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#F86E19]" />
          <span className="ml-2 text-muted-foreground">Chargement des ressources...</span>
        </div>
      ) : resources.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-lg font-semibold mb-2">Aucune ressource trouvée</h3>
          <p className="text-muted-foreground mb-4">
            Essayez de modifier vos critères de recherche ou réinitialisez les filtres.
          </p>
          <Button onClick={resetFilters} variant="outline">
            Réinitialiser les filtres
          </Button>
        </Card>
      ) : (
        <>
          {/* Grille de ressources */}
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {resources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                onClick={() => handleResourceClick(resource)}
                onToggleFavorite={() => handleToggleFavorite(resource.id)}
                onDownload={() => handleDownload(resource)}
                isFavorite={isFavorite(resource.id)}
              />
            ))}
          </div>

          {/* Section "Ressources populaires" si on a peu de résultats */}
          {resources.length < 6 && !filters.search && (
            <div className="mt-12">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="h-5 w-5 text-[#F86E19]" />
                <h2 className="text-xl font-semibold">Ressources populaires</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {resources
                  .sort((a, b) => b.download_count - a.download_count)
                  .slice(0, 3)
                  .map((resource) => (
                    <ResourceCard
                      key={`popular-${resource.id}`}
                      resource={resource}
                      onClick={() => handleResourceClick(resource)}
                      onToggleFavorite={() => handleToggleFavorite(resource.id)}
                      onDownload={() => handleDownload(resource)}
                      isFavorite={isFavorite(resource.id)}
                    />
                  ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal de détail */}
      <ResourceModal
        resource={selectedResource}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onToggleFavorite={() => selectedResource && handleToggleFavorite(selectedResource.id)}
        isFavorite={selectedResource ? isFavorite(selectedResource.id) : false}
      />
    </div>
  );
};

export default ResourcesPage;