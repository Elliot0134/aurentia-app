import { useState, useEffect } from 'react';
import { automationsData, categories, automationPacks } from '../data/automationsData';

export const useAutomations = () => {
  const [automations, setAutomations] = useState(automationsData);
  const [filteredAutomations, setFilteredAutomations] = useState(automationsData);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular'); // popular, price-asc, price-desc, rating
  const [viewMode, setViewMode] = useState('grid'); // grid, list
  const [loading, setLoading] = useState(false);

  // Filtrer et trier les automatisations
  useEffect(() => {
    let filtered = [...automations];

    // Filtrage par catégorie
    if (selectedCategory !== 'all') {
      const categoryName = categories.find(cat => cat.id === selectedCategory)?.name;
      filtered = filtered.filter(automation => automation.category === categoryName);
    }

    // Filtrage par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(automation =>
        automation.name.toLowerCase().includes(query) ||
        automation.description.toLowerCase().includes(query) ||
        automation.category.toLowerCase().includes(query) ||
        automation.features.some(feature => feature.toLowerCase().includes(query))
      );
    }

    // Tri
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => {
          if (a.popular && !b.popular) return -1;
          if (!a.popular && b.popular) return 1;
          return b.rating - a.rating;
        });
        break;
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    setFilteredAutomations(filtered);
  }, [automations, selectedCategory, searchQuery, sortBy]);

  // Activer/désactiver une automatisation
  const toggleAutomation = async (automationId) => {
    setLoading(true);
    try {
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAutomations(prev => prev.map(automation =>
        automation.id === automationId
          ? { ...automation, isActive: !automation.isActive }
          : automation
      ));
      
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de l\'activation/désactivation:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Obtenir une automatisation par ID
  const getAutomationById = (id) => {
    return automations.find(automation => automation.id === id);
  };

  // Obtenir les automatisations actives
  const getActiveAutomations = () => {
    return automations.filter(automation => automation.isActive);
  };

  // Obtenir les automatisations populaires
  const getPopularAutomations = () => {
    return automations.filter(automation => automation.popular);
  };

  // Calculer le coût total des automatisations actives
  const getTotalActiveCost = () => {
    return automations
      .filter(automation => automation.isActive)
      .reduce((total, automation) => total + automation.price, 0);
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setSortBy('popular');
  };

  return {
    // État
    automations: filteredAutomations,
    allAutomations: automations,
    categories,
    automationPacks,
    selectedCategory,
    searchQuery,
    sortBy,
    viewMode,
    loading,

    // Actions
    setSelectedCategory,
    setSearchQuery,
    setSortBy,
    setViewMode,
    toggleAutomation,
    resetFilters,

    // Utilitaires
    getAutomationById,
    getActiveAutomations,
    getPopularAutomations,
    getTotalActiveCost,

    // Statistiques
    totalAutomations: automations.length,
    activeAutomations: automations.filter(a => a.isActive).length,
    totalActiveCost: getTotalActiveCost()
  };
};

export default useAutomations;