import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  getAllTools, 
  getToolsByCategory, 
  getToolById, 
  searchTools, 
  filterTools, 
  sortTools,
  categories 
} from '../data/toolsDatabase';
import { useCredits } from './useCredits';
import { supabase } from '../integrations/supabase/client';

export const useTools = () => {
  // États principaux
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // États de filtrage et recherche
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [filters, setFilters] = useState({
    complexity: [],
    priceRange: [0, 20],
    minRating: 0,
    outputType: [],
    popularOnly: false
  });

  // États d'interaction utilisateur
  const [favorites, setFavorites] = useState([]);
  const [usageHistory, setUsageHistory] = useState([]);
  const [selectedTool, setSelectedTool] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Hook des crédits
  const { credits, deductCredits } = useCredits();

  // Chargement initial des données
  useEffect(() => {
    const loadTools = async () => {
      try {
        setLoading(true);
        
        // Charger tous les outils depuis la base de données locale
        const allTools = getAllTools();
        setTools(allTools);
        
        // Charger les favoris et l'historique depuis Supabase si connecté
        await loadUserData();
        
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement des outils:', err);
        setError('Impossible de charger les outils');
      } finally {
        setLoading(false);
      }
    };

    loadTools();
  }, []);

  // Chargement des données utilisateur depuis Supabase
  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Charger les favoris
      const { data: favoritesData } = await supabase
        .from('user_tool_favorites')
        .select('tool_id')
        .eq('user_id', user.id);
      
      if (favoritesData) {
        setFavorites(favoritesData.map(fav => fav.tool_id));
      }

      // Charger l'historique d'utilisation
      const { data: historyData } = await supabase
        .from('tool_usage_history')
        .select('*')
        .eq('user_id', user.id)
        .order('used_at', { ascending: false })
        .limit(50);
      
      if (historyData) {
        setUsageHistory(historyData);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des données utilisateur:', err);
    }
  };

  // Outils filtrés et triés
  const filteredAndSortedTools = useMemo(() => {
    let result = tools;

    // Filtrage par catégorie
    if (selectedCategory !== 'all') {
      result = getToolsByCategory(selectedCategory);
    }

    // Recherche textuelle
    if (searchQuery.trim()) {
      result = searchTools(searchQuery, selectedCategory);
    }

    // Application des filtres avancés
    result = filterTools(result, filters);

    // Tri
    result = sortTools(result, sortBy);

    return result;
  }, [tools, selectedCategory, searchQuery, filters, sortBy]);

  // Outils populaires
  const popularTools = useMemo(() => {
    return getAllTools()
      .filter(tool => tool.popular)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 6);
  }, []);

  // Outils recommandés basés sur l'historique
  const recommendedTools = useMemo(() => {
    if (usageHistory.length === 0) return popularTools;

    // Analyser les catégories les plus utilisées
    const categoryUsage = usageHistory.reduce((acc, usage) => {
      const tool = getToolById(usage.tool_id);
      if (tool) {
        acc[tool.category] = (acc[tool.category] || 0) + 1;
      }
      return acc;
    }, {});

    const topCategories = Object.entries(categoryUsage)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);

    // Recommander des outils des catégories préférées non encore utilisés
    const usedToolIds = new Set(usageHistory.map(h => h.tool_id));
    const recommended = getAllTools()
      .filter(tool => 
        topCategories.includes(tool.category) && 
        !usedToolIds.has(tool.id)
      )
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 6);

    return recommended.length > 0 ? recommended : popularTools;
  }, [usageHistory, popularTools]);

  // Statistiques
  const stats = useMemo(() => {
    const totalTools = getAllTools().length;
    const totalCategories = categories.filter(cat => cat.id !== 'all').length;
    const averagePrice = getAllTools().reduce((sum, tool) => sum + tool.price, 0) / totalTools;
    const averageRating = getAllTools().reduce((sum, tool) => sum + tool.rating, 0) / totalTools;

    return {
      totalTools,
      totalCategories,
      averagePrice: Math.round(averagePrice * 100) / 100,
      averageRating: Math.round(averageRating * 10) / 10,
      favoritesCount: favorites.length,
      usageCount: usageHistory.length
    };
  }, [favorites.length, usageHistory.length]);

  // Actions
  const selectTool = useCallback((tool) => {
    setSelectedTool(tool);
    setIsModalOpen(true);
  }, []);

  const closeTool = useCallback(() => {
    setSelectedTool(null);
    setIsModalOpen(false);
  }, []);

  const toggleFavorite = useCallback(async (toolId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const isFavorite = favorites.includes(toolId);

      if (isFavorite) {
        // Retirer des favoris
        await supabase
          .from('user_tool_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('tool_id', toolId);
        
        setFavorites(prev => prev.filter(id => id !== toolId));
      } else {
        // Ajouter aux favoris
        await supabase
          .from('user_tool_favorites')
          .insert({
            user_id: user.id,
            tool_id: toolId
          });
        
        setFavorites(prev => [...prev, toolId]);
      }
    } catch (err) {
      console.error('Erreur lors de la gestion des favoris:', err);
    }
  }, [favorites]);

  const useTool = useCallback(async (toolId) => {
    try {
      const tool = getToolById(toolId);
      if (!tool) return { success: false, error: 'Outil non trouvé' };

      // Vérifier les crédits
      if (credits < tool.price) {
        return { 
          success: false, 
          error: 'Crédits insuffisants',
          requiredCredits: tool.price,
          availableCredits: credits
        };
      }

      // Déduire les crédits
      const deductResult = await deductCredits(tool.price, `Utilisation de l'outil: ${tool.name}`);
      if (!deductResult.success) {
        return { success: false, error: deductResult.error };
      }

      // Enregistrer l'utilisation
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('tool_usage_history')
          .insert({
            user_id: user.id,
            tool_id: toolId,
            credits_used: tool.price,
            used_at: new Date().toISOString()
          });

        // Mettre à jour l'historique local
        setUsageHistory(prev => [{
          tool_id: toolId,
          credits_used: tool.price,
          used_at: new Date().toISOString()
        }, ...prev.slice(0, 49)]);
      }

      return { success: true, tool };
    } catch (err) {
      console.error('Erreur lors de l\'utilisation de l\'outil:', err);
      return { success: false, error: 'Erreur lors de l\'utilisation de l\'outil' };
    }
  }, [credits, deductCredits]);

  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      complexity: [],
      priceRange: [0, 20],
      minRating: 0,
      outputType: [],
      popularOnly: false
    });
    setSearchQuery('');
    setSortBy('popular');
  }, []);

  const searchInCategory = useCallback((query, categoryId = 'all') => {
    setSearchQuery(query);
    setSelectedCategory(categoryId);
  }, []);

  return {
    // Données
    tools: filteredAndSortedTools,
    allTools: tools,
    popularTools,
    recommendedTools,
    categories,
    favorites,
    usageHistory,
    stats,
    
    // États
    loading,
    error,
    selectedTool,
    isModalOpen,
    selectedCategory,
    searchQuery,
    sortBy,
    filters,
    
    // Actions
    selectTool,
    closeTool,
    toggleFavorite,
    useTool,
    setSelectedCategory,
    setSearchQuery,
    setSortBy,
    updateFilters,
    resetFilters,
    searchInCategory,
    
    // Utilitaires
    getToolById,
    isFavorite: (toolId) => favorites.includes(toolId),
    canUseTool: (tool) => credits >= tool.price,
    getToolUsageCount: (toolId) => usageHistory.filter(h => h.tool_id === toolId).length
  };
};

export default useTools;