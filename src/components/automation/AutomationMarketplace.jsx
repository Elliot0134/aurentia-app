import React, { useState } from 'react';
import { Search, Grid, List, Filter, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import AutomationCard from './AutomationCard';
import AutomationModal from './AutomationModal';
import FilterBar from './FilterBar';
import CreditBalance from './CreditBalance';
import useAutomations from '@/hooks/useAutomations';
import useCredits from '@/hooks/useCredits';

const AutomationMarketplace = () => {
  const [selectedAutomation, setSelectedAutomation] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  
  const {
    automations,
    categories,
    selectedCategory,
    searchQuery,
    sortBy,
    viewMode,
    loading,
    setSelectedCategory,
    setSearchQuery,
    setSortBy,
    setViewMode,
    toggleAutomation,
    getActiveAutomations,
    totalAutomations,
    activeAutomations
  } = useAutomations();

  const {
    credits,
    deductCredits,
    hasEnoughCredits,
    loading: creditsLoading
  } = useCredits();

  const handleActivateAutomation = async (automation) => {
    try {
      if (!hasEnoughCredits(automation.price)) {
        // Afficher modal d'achat de crédits
        return;
      }

      await deductCredits(
        automation.price, 
        `Activation - ${automation.name}`,
        automation.id
      );
      
      await toggleAutomation(automation.id);
      setSelectedAutomation(null);
    } catch (error) {
      console.error('Erreur lors de l\'activation:', error);
    }
  };

  const handleDeactivateAutomation = async (automation) => {
    try {
      await toggleAutomation(automation.id);
    } catch (error) {
      console.error('Erreur lors de la désactivation:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header avec balance de crédits */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary text-transparent bg-clip-text mb-2">
            Marketplace d'Automatisations
          </h1>
          <p className="text-gray-600">
            Automatisez vos tâches business et gagnez du temps précieux
          </p>
        </div>
        <div className="mt-4 lg:mt-0">
          <CreditBalance credits={credits} />
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <div className="text-2xl font-bold text-blue-600">{totalAutomations}</div>
          <div className="text-sm text-gray-600">Automatisations disponibles</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <div className="text-2xl font-bold text-green-600">{activeAutomations}</div>
          <div className="text-sm text-gray-600">Actives</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <div className="text-2xl font-bold text-purple-600">
            {automations.filter(a => a.popular).length}
          </div>
          <div className="text-sm text-gray-600">Populaires</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <div className="text-2xl font-bold text-orange-600">
            {Math.round(automations.reduce((sum, a) => sum + a.rating, 0) / automations.length * 10) / 10}
          </div>
          <div className="text-sm text-gray-600">Note moyenne</div>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Recherche */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Rechercher une automatisation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Catégories */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name} ({category.count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Tri */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Populaires</SelectItem>
              <SelectItem value="rating">Mieux notées</SelectItem>
              <SelectItem value="price-asc">Prix croissant</SelectItem>
              <SelectItem value="price-desc">Prix décroissant</SelectItem>
              <SelectItem value="name">Nom A-Z</SelectItem>
            </SelectContent>
          </Select>

          {/* Mode d'affichage */}
          <div className="flex border border-gray-200 rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Filtres actifs */}
        {(selectedCategory !== 'all' || searchQuery) && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
            {selectedCategory !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {categories.find(c => c.id === selectedCategory)?.name}
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                >
                  ×
                </button>
              </Badge>
            )}
            {searchQuery && (
              <Badge variant="secondary" className="flex items-center gap-1">
                "{searchQuery}"
                <button
                  onClick={() => setSearchQuery('')}
                  className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                >
                  ×
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Résultats */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-gray-600">
          {automations.length} automatisation{automations.length > 1 ? 's' : ''} trouvée{automations.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Grille/Liste des automatisations */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-6 animate-pulse">
              <div className="w-12 h-12 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : automations.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucune automatisation trouvée
          </h3>
          <p className="text-gray-600 mb-4">
            Essayez de modifier vos critères de recherche
          </p>
          <Button 
            variant="outline" 
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
          >
            Réinitialiser les filtres
          </Button>
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
        }>
          {automations.map((automation) => (
            <AutomationCard
              key={automation.id}
              automation={automation}
              viewMode={viewMode}
              onSelect={() => setSelectedAutomation(automation)}
              onToggle={automation.isActive ? handleDeactivateAutomation : handleActivateAutomation}
              hasEnoughCredits={hasEnoughCredits(automation.price)}
              loading={loading || creditsLoading}
            />
          ))}
        </div>
      )}

      {/* Modal de détails */}
      {selectedAutomation && (
        <AutomationModal
          automation={selectedAutomation}
          isOpen={!!selectedAutomation}
          onClose={() => setSelectedAutomation(null)}
          onActivate={handleActivateAutomation}
          onDeactivate={handleDeactivateAutomation}
          hasEnoughCredits={hasEnoughCredits(selectedAutomation.price)}
          credits={credits}
          loading={loading || creditsLoading}
        />
      )}
    </div>
  );
};

export default AutomationMarketplace;