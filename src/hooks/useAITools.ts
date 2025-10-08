import { useState, useEffect, useCallback } from 'react';
import { aiToolsService } from '@/services/aiToolsService';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { AITool, ToolFilters, AIToolUsageHistory, AIToolUserSettings } from '@/types/aiTools';

export const useAITools = () => {
  const [tools, setTools] = useState<AITool[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);
  const [filters, setFilters] = useState<ToolFilters>({
    search: '',
    category: 'all',
    difficulty: 'all',
    showFavorites: false,
  });

  const { toast } = useToast();

  // Charger l'utilisateur
  const loadUser = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  }, []);

  // Charger les outils
  const loadTools = useCallback(async () => {
    try {
      setLoading(true);
      const searchFilters = {
        search: filters.search,
        category: filters.category,
        difficulty: filters.difficulty,
        favoriteToolIds: filters.showFavorites ? favorites : undefined,
      };

      const [toolsData, categoriesData] = await Promise.all([
        aiToolsService.searchTools(searchFilters),
        aiToolsService.getCategories(),
      ]);

      setTools(toolsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading tools:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les outils IA',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [filters, favorites, toast]);

  // Charger les favoris
  const loadFavorites = useCallback(async () => {
    if (!user?.id) return;

    try {
      const favoritesData = await aiToolsService.getUserFavorites(user.id);
      setFavorites(favoritesData);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  }, [user?.id]);

  // Basculer les favoris
  const toggleFavorite = useCallback(async (toolId: string) => {
    if (!user?.id) {
      toast({
        title: 'Connexion requise',
        description: 'Vous devez être connecté pour ajouter des favoris',
        variant: 'destructive',
      });
      return;
    }

    try {
      const isFavorite = favorites.includes(toolId);
      
      if (isFavorite) {
        await aiToolsService.removeFromFavorites(user.id, toolId);
        setFavorites(prev => prev.filter(id => id !== toolId));
        toast({
          title: 'Supprimé des favoris',
          description: 'L\'outil a été retiré de vos favoris',
        });
      } else {
        await aiToolsService.addToFavorites(user.id, toolId);
        setFavorites(prev => [...prev, toolId]);
        toast({
          title: 'Ajouté aux favoris',
          description: 'L\'outil a été ajouté à vos favoris',
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier les favoris',
        variant: 'destructive',
      });
    }
  }, [user?.id, favorites, toast]);

  // Mettre à jour les filtres
  const updateFilters = useCallback((newFilters: Partial<ToolFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Effets
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  useEffect(() => {
    loadTools();
  }, [loadTools]);

  return {
    tools,
    loading,
    categories,
    favorites,
    filters,
    updateFilters,
    toggleFavorite,
    refetch: loadTools,
  };
};

export const useAIToolDetails = (slug: string) => {
  const [tool, setTool] = useState<AITool | null>(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<AIToolUsageHistory[]>([]);
  const [settings, setSettings] = useState<AIToolUserSettings | null>(null);
  const [executing, setExecuting] = useState(false);
  const [user, setUser] = useState<any>(null);

  const { toast } = useToast();

  // Charger l'utilisateur
  const loadUser = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  }, []);

  // Charger les détails de l'outil
  const loadToolDetails = useCallback(async () => {
    try {
      setLoading(true);
      const toolData = await aiToolsService.getToolBySlug(slug);
      setTool(toolData);

      if (toolData && user?.id) {
        const [historyData, settingsData] = await Promise.all([
          aiToolsService.getToolHistory(user.id, toolData.id),
          aiToolsService.getUserSettings(user.id, toolData.id),
        ]);
        setHistory(historyData);
        setSettings(settingsData);
      }
    } catch (error) {
      console.error('Error loading tool details:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les détails de l\'outil',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [slug, user?.id, toast]);

  // Sauvegarder les paramètres
  const saveSettings = useCallback(async (settingsData: Record<string, any>) => {
    if (!user?.id || !tool?.id) return;

    try {
      await aiToolsService.saveUserSettings(user.id, tool.id, settingsData);
      setSettings(prev => prev ? { ...prev, settings_data: settingsData } : null);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder les paramètres',
        variant: 'destructive',
      });
    }
  }, [user?.id, tool?.id, toast]);

  // Exécuter l'outil
  const executeTool = useCallback(async (inputData: Record<string, any>) => {
    if (!user?.id || !tool) {
      toast({
        title: 'Erreur',
        description: 'Utilisateur ou outil non disponible',
        variant: 'destructive',
      });
      return null;
    }

    try {
      setExecuting(true);

      // Créer l'entrée d'historique
      const historyEntry = await aiToolsService.createHistoryEntry({
        user_id: user.id,
        tool_id: tool.id,
        input_data: inputData,
        status: 'pending',
      });

      // Exécuter le webhook
      const result = await aiToolsService.executeToolWebhook(
        tool.webhook_url,
        inputData,
        settings?.settings_data || {},
        user.id
      );

      // Mettre à jour l'historique
      await aiToolsService.updateHistoryEntry(historyEntry.id, {
        output_data: result,
        status: 'completed',
        completed_at: new Date().toISOString(),
      });

      // Recharger l'historique
      const updatedHistory = await aiToolsService.getToolHistory(user.id, tool.id);
      setHistory(updatedHistory);

      toast({
        title: 'Outil exécuté avec succès',
        description: 'Le résultat est disponible ci-dessous',
      });

      return result;
    } catch (error) {
      console.error('Error executing tool:', error);
      toast({
        title: 'Erreur d\'exécution',
        description: 'Une erreur est survenue lors de l\'exécution de l\'outil',
        variant: 'destructive',
      });
      return null;
    } finally {
      setExecuting(false);
    }
  }, [user?.id, tool, settings, toast]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    loadToolDetails();
  }, [loadToolDetails]);

  return {
    tool,
    loading,
    history,
    settings,
    executing,
    saveSettings,
    executeTool,
    refetch: loadToolDetails,
  };
};