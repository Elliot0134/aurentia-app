import { useState, useEffect, useMemo } from 'react';
import { resourcesData, resourceCategories, resourceTypes, difficultyLevels, priceRanges } from '../data/resourcesData';

export const useResources = () => {
  // États principaux
  const [resources, setResources] = useState(resourcesData);
  const [favorites, setFavorites] = useState([]);
  const [cart, setCart] = useState([]);
  const [purchasedResources, setPurchasedResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // États de filtrage et recherche
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [sortBy, setSortBy] = useState('popular');
  const [showFeatured, setShowFeatured] = useState(false);

  // Modal et sélection
  const [selectedResource, setSelectedResource] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Charger les données depuis localStorage au démarrage
  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem('aurentia_resource_favorites');
      const savedCart = localStorage.getItem('aurentia_resource_cart');
      const savedPurchased = localStorage.getItem('aurentia_purchased_resources');

      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
      if (savedPurchased) {
        setPurchasedResources(JSON.parse(savedPurchased));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  }, []);

  // Sauvegarder les favoris
  useEffect(() => {
    localStorage.setItem('aurentia_resource_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Sauvegarder le panier
  useEffect(() => {
    localStorage.setItem('aurentia_resource_cart', JSON.stringify(cart));
  }, [cart]);

  // Sauvegarder les achats
  useEffect(() => {
    localStorage.setItem('aurentia_purchased_resources', JSON.stringify(purchasedResources));
  }, [purchasedResources]);

  // Filtrage et tri des ressources
  const filteredAndSortedResources = useMemo(() => {
    let filtered = resources.filter(resource => {
      // Recherche textuelle
      const matchesSearch = !searchQuery || 
        resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        resource.author.name.toLowerCase().includes(searchQuery.toLowerCase());

      // Filtre par catégorie
      const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;

      // Filtre par type
      const matchesType = selectedType === 'all' || resource.type === selectedType;

      // Filtre par difficulté
      const matchesDifficulty = selectedDifficulty === 'all' || resource.difficulty === selectedDifficulty;

      // Filtre par prix
      const matchesPrice = resource.price >= priceRange[0] && resource.price <= priceRange[1];

      // Filtre featured
      const matchesFeatured = !showFeatured || resource.featured;

      return matchesSearch && matchesCategory && matchesType && matchesDifficulty && matchesPrice && matchesFeatured;
    });

    // Tri
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return (b.popular ? 1 : 0) - (a.popular ? 1 : 0) || b.downloadCount - a.downloadCount;
        case 'rating':
          return b.rating - a.rating;
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'newest':
          return new Date(b.lastUpdated) - new Date(a.lastUpdated);
        case 'downloads':
          return b.downloadCount - a.downloadCount;
        default:
          return 0;
      }
    });

    return filtered;
  }, [resources, searchQuery, selectedCategory, selectedType, selectedDifficulty, priceRange, sortBy, showFeatured]);

  // Ressources populaires
  const popularResources = useMemo(() => {
    return resources.filter(r => r.popular).slice(0, 6);
  }, [resources]);

  // Ressources recommandées
  const recommendedResources = useMemo(() => {
    return resources.filter(r => r.featured).slice(0, 6);
  }, [resources]);

  // Ressources récentes
  const recentResources = useMemo(() => {
    return [...resources]
      .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated))
      .slice(0, 6);
  }, [resources]);

  // Statistiques
  const stats = useMemo(() => {
    return {
      totalResources: resources.length,
      averageRating: (resources.reduce((sum, r) => sum + r.rating, 0) / resources.length).toFixed(1),
      favoritesCount: favorites.length,
      cartCount: cart.length,
      purchasedCount: purchasedResources.length,
      totalDownloads: resources.reduce((sum, r) => sum + r.downloadCount, 0)
    };
  }, [resources, favorites, cart, purchasedResources]);

  // Actions sur les ressources
  const selectResource = (resource) => {
    setSelectedResource(resource);
    setIsModalOpen(true);
  };

  const closeResource = () => {
    setSelectedResource(null);
    setIsModalOpen(false);
  };

  const toggleFavorite = (resourceId) => {
    setFavorites(prev => {
      const isFavorite = prev.includes(resourceId);
      if (isFavorite) {
        return prev.filter(id => id !== resourceId);
      } else {
        return [...prev, resourceId];
      }
    });
  };

  const addToCart = (resourceId) => {
    const resource = resources.find(r => r.id === resourceId);
    if (!resource || cart.some(item => item.id === resourceId) || purchasedResources.includes(resourceId)) {
      return false;
    }

    setCart(prev => [...prev, {
      id: resourceId,
      name: resource.name,
      price: resource.price,
      image: resource.image,
      author: resource.author,
      addedAt: new Date().toISOString()
    }]);
    return true;
  };

  const removeFromCart = (resourceId) => {
    setCart(prev => prev.filter(item => item.id !== resourceId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const purchaseResource = async (resourceId) => {
    setLoading(true);
    try {
      // Simulation d'achat
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPurchasedResources(prev => [...prev, resourceId]);
      removeFromCart(resourceId);
      
      return { success: true };
    } catch (error) {
      setError('Erreur lors de l\'achat');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const purchaseCart = async () => {
    setLoading(true);
    try {
      // Simulation d'achat du panier
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const cartIds = cart.map(item => item.id);
      setPurchasedResources(prev => [...prev, ...cartIds]);
      clearCart();
      
      return { success: true };
    } catch (error) {
      setError('Erreur lors de l\'achat du panier');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const downloadResource = async (resourceId) => {
    if (!purchasedResources.includes(resourceId)) {
      throw new Error('Ressource non achetée');
    }

    // Simulation de téléchargement
    const resource = resources.find(r => r.id === resourceId);
    if (resource) {
      // Ici on déclencherait le téléchargement réel
      console.log(`Téléchargement de ${resource.name}`);
      return { success: true, downloadUrl: '#' };
    }
    
    throw new Error('Ressource introuvable');
  };

  // Fonctions utilitaires
  const isFavorite = (resourceId) => favorites.includes(resourceId);
  const isInCart = (resourceId) => cart.some(item => item.id === resourceId);
  const isPurchased = (resourceId) => purchasedResources.includes(resourceId);
  const canAddToCart = (resourceId) => !isInCart(resourceId) && !isPurchased(resourceId);

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price, 0);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedType('all');
    setSelectedDifficulty('all');
    setPriceRange([0, 100]);
    setShowFeatured(false);
  };

  return {
    // Données
    resources: filteredAndSortedResources,
    allResources: resources,
    popularResources,
    recommendedResources,
    recentResources,
    favorites,
    cart,
    purchasedResources,
    stats,
    
    // États
    loading,
    error,
    selectedResource,
    isModalOpen,
    
    // Filtres et recherche
    searchQuery,
    selectedCategory,
    selectedType,
    selectedDifficulty,
    priceRange,
    sortBy,
    showFeatured,
    
    // Actions
    selectResource,
    closeResource,
    toggleFavorite,
    addToCart,
    removeFromCart,
    clearCart,
    purchaseResource,
    purchaseCart,
    downloadResource,
    
    // Setters pour filtres
    setSearchQuery,
    setSelectedCategory,
    setSelectedType,
    setSelectedDifficulty,
    setPriceRange,
    setSortBy,
    setShowFeatured,
    resetFilters,
    
    // Utilitaires
    isFavorite,
    isInCart,
    isPurchased,
    canAddToCart,
    getCartTotal,
    
    // Constantes
    categories: resourceCategories,
    types: resourceTypes,
    difficultyLevels,
    priceRanges
  };
};