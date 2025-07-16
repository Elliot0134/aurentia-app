import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Search,
  Filter,
  Grid3X3,
  List,
  Star,
  TrendingUp,
  Heart,
  Clock,
  Sparkles,
  ShoppingCart,
  User,
  Plus,
  DollarSign,
  Loader2,
  ArrowUp
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useResources } from '../../hooks/useResources';
import ResourceCard from './ResourceCard';
import FilterPanel from './FilterPanel';
import ResourceModal from './ResourceModal';
import ComingSoonDialog from '../ui/ComingSoonDialog';

const MarketplaceLayout = () => {
  const {
    // Données
    resources,
    popularResources,
    recommendedResources,
    recentResources,
    stats,
    cart,
    
    // États
    loading,
    error,
    selectedResource,
    isModalOpen,
    
    // Filtres
    searchQuery,
    selectedCategory,
    selectedType,
    selectedDifficulty,
    priceRange,
    showFeatured,
    
    // Actions
    selectResource,
    closeResource,
    toggleFavorite,
    addToCart,
    purchaseResource,
    
    // Setters
    setSearchQuery,
    setSelectedCategory,
    setSelectedType,
    setSelectedDifficulty,
    setPriceRange,
    setShowFeatured,
    resetFilters,
    
    // Utilitaires
    isFavorite,
    isInCart,
    isPurchased,
    canAddToCart,
    getCartTotal,
    
    // Constantes
    categories,
    types,
    difficultyLevels
  } = useResources();

  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('popular');
  const [showContributorModal, setShowContributorModal] = useState(false);
  const [contributorForm, setContributorForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    expertise: ''
  });
  const [isContributorSubmitting, setIsContributorSubmitting] = useState(false);
  const [isComingSoonOpen, setIsComingSoonOpen] = useState(false);

  React.useEffect(() => {
    setIsComingSoonOpen(true);
  }, []);

  const handleAddToCart = async (resourceId) => {
    const success = addToCart(resourceId);
    if (success) {
      // Optionnel: afficher une notification de succès
      console.log('Ressource ajoutée au panier');
    }
  };

  const handlePurchase = async (resourceId) => {
    const result = await purchaseResource(resourceId);
    if (result.success) {
      // Optionnel: afficher une notification de succès
      console.log('Achat réussi');
    }
  };

  const handleContributorSubmit = async () => {
    if (!contributorForm.firstName.trim() || !contributorForm.lastName.trim() ||
        !contributorForm.email.trim() || !contributorForm.expertise.trim()) {
      console.error("Tous les champs sont requis.");
      return;
    }

    setIsContributorSubmitting(true);
    try {
      const response = await fetch('https://n8n.srv906204.hstgr.cloud/webhook/partenaires-ressources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: contributorForm.firstName,
          lastName: contributorForm.lastName,
          email: contributorForm.email,
          expertise: contributorForm.expertise,
        }),
      });

      if (response.ok) {
        console.log("Candidature contributeur envoyée avec succès!");
        setShowContributorModal(false);
        setContributorForm({
          firstName: '',
          lastName: '',
          email: '',
          expertise: ''
        });
      } else {
        console.error("Échec de l'envoi de la candidature:", response.statusText);
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi de la candidature:", error);
    } finally {
      setIsContributorSubmitting(false);
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <h3 className="text-lg font-semibold">Erreur de chargement</h3>
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-[95vw] overflow-hidden">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Marketplace de Ressources
          </h1>
          <p className="text-gray-600">
            Découvrez des templates et outils pour accélérer votre projet entrepreneurial
          </p>
        </div>
        
        <div className="flex items-center gap-4 mt-4 lg:mt-0">
          {/* Panier */}
          {cart.length > 0 && (
            <Button variant="outline" className="relative">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Panier ({cart.length})
              <Badge className="absolute -top-2 -right-2 bg-blue-600">
                {getCartTotal()} crédits
              </Badge>
            </Button>
          )}
          
          {/* Bouton devenir contributeur */}
          <Button
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            onClick={() => setShowContributorModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Devenir contributeur
          </Button>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.totalResources}</div>
            <div className="text-sm text-gray-600">Ressources disponibles</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.averageRating}</div>
            <div className="text-sm text-gray-600">Note moyenne</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{stats.favoritesCount}</div>
            <div className="text-sm text-gray-600">Favoris</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.totalDownloads.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Téléchargements</div>
          </CardContent>
        </Card>
      </div>

      {/* Barre de recherche principale */}
      <Card className="mb-8">
        <CardContent className="p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Recherche */}
            <div className="flex-1 relative min-w-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher des templates, outils, guides..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 w-full"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              {/* Tri */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-48 h-12">
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Popularité</SelectItem>
                  <SelectItem value="rating">Note</SelectItem>
                  <SelectItem value="price-asc">Prix croissant</SelectItem>
                  <SelectItem value="price-desc">Prix décroissant</SelectItem>
                  <SelectItem value="name">Nom</SelectItem>
                  <SelectItem value="newest">Plus récents</SelectItem>
                  <SelectItem value="downloads">Téléchargements</SelectItem>
                </SelectContent>
              </Select>

              {/* Mode d'affichage */}
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-12 px-4"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-12 px-4"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Sidebar avec filtres */}
        <div className="hidden lg:block w-80 flex-shrink-0">
          <FilterPanel
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            selectedType={selectedType}
            selectedDifficulty={selectedDifficulty}
            priceRange={priceRange}
            showFeatured={showFeatured}
            categories={categories}
            types={types}
            difficultyLevels={difficultyLevels}
            onSearchChange={setSearchQuery}
            onCategoryChange={setSelectedCategory}
            onTypeChange={setSelectedType}
            onDifficultyChange={setSelectedDifficulty}
            onPriceRangeChange={setPriceRange}
            onShowFeaturedChange={setShowFeatured}
            onResetFilters={resetFilters}
            totalResources={stats.totalResources}
            filteredCount={resources.length}
          />
        </div>

        {/* Contenu principal */}
        <div className="flex-1 min-w-0">
          {/* Résultats */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-600">
              {resources.length} ressource{resources.length > 1 ? 's' : ''} trouvée{resources.length > 1 ? 's' : ''}
            </p>
            
            {/* Filtres actifs */}
            {(searchQuery || selectedCategory !== 'all' || selectedType !== 'all' || selectedDifficulty !== 'all' || showFeatured) && (
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                Effacer les filtres
              </Button>
            )}
          </div>

          {/* Grille des ressources */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-96 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : resources.length > 0 ? (
            <div className={cn(
              viewMode === 'grid'
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6"
                : "space-y-4"
            )}>
              {resources.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  onSelect={selectResource}
                  onToggleFavorite={toggleFavorite}
                  onAddToCart={handleAddToCart}
                  isFavorite={isFavorite(resource.id)}
                  isInCart={isInCart(resource.id)}
                  isPurchased={isPurchased(resource.id)}
                  canAddToCart={canAddToCart(resource.id)}
                  className={viewMode === 'list' ? 'flex flex-row' : ''}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-lg font-semibold">Aucune ressource trouvée</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Essayez de modifier vos critères de recherche ou vos filtres.
              </p>
              <Button variant="outline" onClick={resetFilters}>
                Effacer tous les filtres
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de ressource */}
      <ResourceModal
        resource={selectedResource}
        isOpen={isModalOpen}
        onClose={closeResource}
        onToggleFavorite={toggleFavorite}
        onAddToCart={handleAddToCart}
        onPurchase={handlePurchase}
        isFavorite={selectedResource ? isFavorite(selectedResource.id) : false}
        isInCart={selectedResource ? isInCart(selectedResource.id) : false}
        isPurchased={selectedResource ? isPurchased(selectedResource.id) : false}
        canAddToCart={selectedResource ? canAddToCart(selectedResource.id) : false}
      />

      {/* Modal Devenir contributeur */}
      <Dialog open={showContributorModal} onOpenChange={setShowContributorModal}>
        <DialogContent className="w-[90vw] max-w-[90vw] md:max-w-2xl rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center mb-2">
              Devenir contributeur
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600">
              Partagez vos templates et ressources avec la communauté Aurentia
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="text-left">
              <h4 className="font-semibold mb-3">Comment ça marche ?</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p>1. Soumettez vos templates et ressources</p>
                <p>2. Notre équipe les valide</p>
                <p>3. Vos ressources sont publiées sur la marketplace</p>
                <p>4. Gagnez des crédits à chaque vente</p>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg mt-4">
              <div className="text-black text-center mb-4">
                <p className="font-semibold">Vous avez des templates que vous souhaitez partager ?</p>
                <p>Remplissez le formulaire ci-dessous pour nous rejoindre</p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Prénom"
                    value={contributorForm.firstName}
                    onChange={(e) => setContributorForm(prev => ({ ...prev, firstName: e.target.value }))}
                    className="flex-1"
                  />
                  <Input
                    type="text"
                    placeholder="Nom"
                    value={contributorForm.lastName}
                    onChange={(e) => setContributorForm(prev => ({ ...prev, lastName: e.target.value }))}
                    className="flex-1"
                  />
                </div>
                <Input
                  type="email"
                  placeholder="Email"
                  value={contributorForm.email}
                  onChange={(e) => setContributorForm(prev => ({ ...prev, email: e.target.value }))}
                  className="flex-1"
                />
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    placeholder="Votre domaine d'expertise"
                    value={contributorForm.expertise}
                    onChange={(e) => setContributorForm(prev => ({ ...prev, expertise: e.target.value }))}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleContributorSubmit}
                    disabled={isContributorSubmitting || !contributorForm.firstName.trim() || !contributorForm.lastName.trim() || !contributorForm.email.trim() || !contributorForm.expertise.trim()}
                    className="rounded-xl w-10 h-10 p-0 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex-shrink-0"
                  >
                    {isContributorSubmitting ? (
                      <Loader2 className="h-5 w-5 text-white animate-spin" />
                    ) : (
                      <ArrowUp size={18} className="text-white" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowContributorModal(false)}
              >
                Plus tard
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Coming Soon Dialog for Ressources */}
      <ComingSoonDialog
        isOpen={isComingSoonOpen}
        onClose={() => setIsComingSoonOpen(false)}
        description={
          <>
            La marketplace de ressources est en cours de développement.
            <br /><br />
            Bientôt, vous pourrez découvrir et télécharger une multitude de templates, guides et outils pour vous accompagner dans votre projet entrepreneurial.
            <br /><br />
            Restez connecté pour les mises à jour !
          </>
        }
      />
    </div>
  );
};

export default MarketplaceLayout;
