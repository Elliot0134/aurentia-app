import { useState, useEffect, useCallback } from 'react';
import { aiToolsService } from '@/services/aiToolsService';
import { toast } from 'sonner';
import { createClient } from '@supabase/supabase-js';
import { useProject } from '@/contexts/ProjectContext';
import type { AITool, AIToolUsageHistory, AIToolUserSettings } from '@/types/aiTools';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Hook pour la liste des outils
export const useAIToolsList = () => {
  const [tools, setTools] = useState<AITool[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);

  const loadTools = useCallback(async () => {
    try {
      setLoading(true);
      const [toolsData, favoritesData] = await Promise.all([
        aiToolsService.getAllTools(),
        aiToolsService.getUserFavorites('mock-user-id').catch(() => [])
      ]);
      
      setTools(toolsData);
      setFavorites(favoritesData.map(f => f.tool_id));
    } catch (error) {
      console.error('Error loading tools:', error);
      toast.error('Impossible de charger les outils IA');
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleFavorite = useCallback(async (toolId: string) => {
    try {
      if (favorites.includes(toolId)) {
        await aiToolsService.removeFavorite('mock-user-id', toolId);
        setFavorites(prev => prev.filter(id => id !== toolId));
        toast.success('Retiré des favoris');
      } else {
        await aiToolsService.addFavorite('mock-user-id', toolId);
        setFavorites(prev => [...prev, toolId]);
        toast.success('Ajouté aux favoris');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Erreur lors de la gestion des favoris');
    }
  }, [favorites]);

  useEffect(() => {
    loadTools();
  }, [loadTools]);

  return {
    tools,
    loading,
    favorites,
    toggleFavorite,
    refetch: loadTools
  };
};

// Hook pour les détails d'un outil
export const useAIToolDetails = (toolId: string) => {
  const [tool, setTool] = useState<AITool | null>(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<AIToolUsageHistory[]>([]);
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [executing, setExecuting] = useState(false);

  // Récupérer le projet actuel
  const { currentProjectId } = useProject();

  // Charger l'outil et les données utilisateur
  useEffect(() => {
    if (toolId) {
      loadToolData();
    }
  }, [toolId]);

  const loadToolData = async () => {
    try {
      setLoading(true);
      const toolData = await aiToolsService.getToolById(toolId);
      setTool(toolData);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await loadUserSettings(user.id);
        await loadHistory(user.id);
      }
    } catch (error) {
      console.error('Error loading tool data:', error);
      toast.error("Erreur lors du chargement de l'outil");
    } finally {
      setLoading(false);
    }
  };

  const loadUserSettings = async (userId: string) => {
    try {
      const savedSettings = await aiToolsService.getUserSettings(userId, toolId);
      if (savedSettings) {
        setSettings(savedSettings.settings_data);
      }
    } catch (error) {
      console.error('Error loading user settings:', error);
    }
  };

  const loadHistory = async (userId: string) => {
    try {
      const userHistory = await aiToolsService.getUserHistory(userId, 20);
      const toolHistory = userHistory.filter(h => h.tool_id === toolId);
      setHistory(toolHistory);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const saveSettings = async (newSettings: Record<string, any>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Vous devez être connecté");
      return false;
    }

    try {
      setExecuting(true);
      await aiToolsService.saveUserSettings(user.id, toolId, newSettings);
      setSettings(newSettings);
      return true;
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error("Erreur lors de la sauvegarde des paramètres");
      return false;
    } finally {
      setExecuting(false);
    }
  };

  const executeTool = async (inputData: Record<string, any>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Vous devez être connecté");
      return { success: false, error: "User not authenticated" };
    }

    if (!tool) {
      toast.error("Outil non trouvé");
      return { success: false, error: "Tool not found" };
    }

    try {
      setExecuting(true);

      const response = await aiToolsService.executeTool({
        toolId: tool.id,
        inputData,
        userSettings: settings,
        projectId: currentProjectId || null
      });

      if (response.success) {
        await loadHistory(user.id);
      } else {
        toast.error(response.error || "Erreur lors de l'exécution");
      }

      return response;
    } catch (error) {
      console.error('Error executing tool:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setExecuting(false);
    }
  };

  return {
    tool,
    loading,
    history,
    settings,
    executing,
    saveSettings,
    executeTool
  };
};