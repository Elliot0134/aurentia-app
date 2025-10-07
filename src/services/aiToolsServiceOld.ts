import { createClient } from '@supabase/supabase-js';
import { AITool, AIToolFavorite, AIToolUsageHistory, AIToolUserSettings, ToolExecutionRequest, ToolExecutionResponse } from '@/types/aiTools';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase environment variables are missing');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export const aiToolsService = {
  // Outils IA
  async getAllTools(): Promise<AITool[]> {
    const { data, error } = await supabase
      .from('ai_tools')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching AI tools:', error);
      throw new Error('Failed to fetch AI tools');
    }

    return data || [];
  },

  async getToolById(id: string): Promise<AITool | null> {
    const { data, error } = await supabase
      .from('ai_tools')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching AI tool:', error);
      return null;
    }

    return data;
  },

  async getToolBySlug(slug: string): Promise<AITool | null> {
    const { data, error } = await supabase
      .from('ai_tools')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching AI tool by slug:', error);
      return null;
    }

    return data;
  },

  // Favoris
  async getUserFavorites(userId: string): Promise<AIToolFavorite[]> {
    const { data, error } = await supabase
      .from('ai_tool_favorites')
      .select(`
        *,
        ai_tools:tool_id (
          id,
          title,
          slug,
          category
        )
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user favorites:', error);
      throw new Error('Failed to fetch favorites');
    }

    return data || [];
  },

  async addFavorite(userId: string, toolId: string): Promise<void> {
    const { error } = await supabase
      .from('ai_tool_favorites')
      .insert({
        user_id: userId,
        tool_id: toolId
      });

    if (error) {
      console.error('Error adding favorite:', error);
      throw new Error('Failed to add favorite');
    }
  },

  async removeFavorite(userId: string, toolId: string): Promise<void> {
    const { error } = await supabase
      .from('ai_tool_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('tool_id', toolId);

    if (error) {
      console.error('Error removing favorite:', error);
      throw new Error('Failed to remove favorite');
    }
  },

  // Historique d'utilisation
  async getUserHistory(userId: string, limit: number = 20): Promise<AIToolUsageHistory[]> {
    const { data, error } = await supabase
      .from('ai_tool_usage_history')
      .select(`
        *,
        ai_tools:tool_id (
          id,
          title,
          slug,
          category
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching user history:', error);
      throw new Error('Failed to fetch usage history');
    }

    return data || [];
  },

  async createUsageRecord(userId: string, toolId: string, inputData: Record<string, any>, projectId?: string): Promise<string> {
    const { data, error } = await supabase
      .from('ai_tool_usage_history')
      .insert({
        user_id: userId,
        tool_id: toolId,
        project_id: projectId,
        input_data: inputData,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating usage record:', error);
      throw new Error('Failed to create usage record');
    }

    return data.id;
  },

  async updateUsageRecord(id: string, updates: Partial<AIToolUsageHistory>): Promise<void> {
    const { error } = await supabase
      .from('ai_tool_usage_history')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating usage record:', error);
      throw new Error('Failed to update usage record');
    }
  },

  // Paramètres utilisateur
  async getUserSettings(userId: string, toolId: string): Promise<AIToolUserSettings | null> {
    const { data, error } = await supabase
      .from('ai_tool_user_settings')
      .select('*')
      .eq('user_id', userId)
      .eq('tool_id', toolId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching user settings:', error);
      throw new Error('Failed to fetch user settings');
    }

    return data;
  },

  async saveUserSettings(userId: string, toolId: string, settings: Record<string, any>): Promise<void> {
    const { error } = await supabase
      .from('ai_tool_user_settings')
      .upsert({
        user_id: userId,
        tool_id: toolId,
        settings_data: settings
      }, {
        onConflict: 'user_id,tool_id'
      });

    if (error) {
      console.error('Error saving user settings:', error);
      throw new Error('Failed to save user settings');
    }
  },

  // Exécution d'outils
  async executeTool(request: ToolExecutionRequest): Promise<ToolExecutionResponse> {
    try {
      // Récupérer l'outil pour obtenir l'URL du webhook
      const tool = await this.getToolById(request.toolId);
      
      if (!tool) {
        throw new Error('Tool not found');
      }

      // Créer un enregistrement d'usage
      const usageId = await this.createUsageRecord(
        'current-user-id', // TODO: Récupérer l'ID utilisateur actuel
        request.toolId,
        request.inputData,
        request.projectId
      );

      // Appeler le webhook n8n
      const response = await fetch(tool.webhook_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...request.inputData,
          user_settings: request.userSettings,
          usage_id: usageId
        }),
      });

      if (!response.ok) {
        throw new Error(`Webhook call failed: ${response.statusText}`);
      }

      const result = await response.json();

      // Mettre à jour l'enregistrement d'usage
      await this.updateUsageRecord(usageId, {
        status: 'completed',
        output_data: result,
        completed_at: new Date().toISOString(),
        credits_used: tool.credits_cost
      });

      return {
        success: true,
        data: result,
        executionId: usageId
      };

    } catch (error) {
      console.error('Error executing tool:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
};mport type { AITool, AIToolFavorite, AIToolUsageHistory, AIToolUserSettings } from '@/types/aiTools';
import { mockAITools } from '@/data/mockAITools';

// Mode développement - utilise les données mock
const USE_MOCK_DATA = true;

// Stockage temporaire en mémoire pour les favoris, historique et paramètres
let mockFavorites: Record<string, string[]> = {};
let mockHistory: Record<string, AIToolUsageHistory[]> = {};
let mockSettings: Record<string, AIToolUserSettings> = {};

export const aiToolsService = {
  // Récupérer tous les outils actifs
  async getAllTools(): Promise<AITool[]> {
    // Simuler un délai réseau
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockAITools;
  },

  // Récupérer un outil par slug
  async getToolBySlug(slug: string): Promise<AITool | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockAITools.find(tool => tool.slug === slug) || null;
  },

  // Récupérer les favoris d'un utilisateur
  async getUserFavorites(userId: string): Promise<string[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockFavorites[userId] || [];
  },

  // Ajouter aux favoris
  async addToFavorites(userId: string, toolId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
    if (!mockFavorites[userId]) {
      mockFavorites[userId] = [];
    }
    if (!mockFavorites[userId].includes(toolId)) {
      mockFavorites[userId].push(toolId);
    }
  },

  // Retirer des favoris
  async removeFromFavorites(userId: string, toolId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
    if (mockFavorites[userId]) {
      mockFavorites[userId] = mockFavorites[userId].filter(id => id !== toolId);
    }
  },

  // Récupérer l'historique d'un utilisateur pour un outil
  async getToolHistory(userId: string, toolId: string): Promise<AIToolUsageHistory[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const userHistory = mockHistory[userId] || [];
    return userHistory.filter(entry => entry.tool_id === toolId);
  },

  // Récupérer tout l'historique d'un utilisateur
  async getUserHistory(userId: string): Promise<AIToolUsageHistory[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockHistory[userId] || [];
  },

  // Créer une entrée d'historique
  async createHistoryEntry(entry: Partial<AIToolUsageHistory>): Promise<AIToolUsageHistory> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const newEntry: AIToolUsageHistory = {
      id: `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: entry.user_id!,
      tool_id: entry.tool_id!,
      project_id: entry.project_id || null,
      input_data: entry.input_data || {},
      output_data: entry.output_data || null,
      status: entry.status || 'pending',
      credits_used: entry.credits_used || null,
      execution_time_ms: entry.execution_time_ms || null,
      error_message: entry.error_message || null,
      created_at: new Date().toISOString(),
      completed_at: entry.completed_at || null,
    };

    if (!mockHistory[entry.user_id!]) {
      mockHistory[entry.user_id!] = [];
    }
    mockHistory[entry.user_id!].unshift(newEntry);
    
    return newEntry;
  },

  // Mettre à jour une entrée d'historique
  async updateHistoryEntry(
    id: string,
    updates: Partial<AIToolUsageHistory>
  ): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Trouver l'entrée dans tous les historiques utilisateur
    for (const userId in mockHistory) {
      const entryIndex = mockHistory[userId].findIndex(entry => entry.id === id);
      if (entryIndex !== -1) {
        mockHistory[userId][entryIndex] = {
          ...mockHistory[userId][entryIndex],
          ...updates,
        };
        break;
      }
    }
  },

  // Récupérer les paramètres utilisateur pour un outil
  async getUserSettings(userId: string, toolId: string): Promise<AIToolUserSettings | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const key = `${userId}_${toolId}`;
    return mockSettings[key] || null;
  },

  // Sauvegarder les paramètres utilisateur
  async saveUserSettings(
    userId: string,
    toolId: string,
    settingsData: Record<string, any>
  ): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const key = `${userId}_${toolId}`;
    const now = new Date().toISOString();
    
    mockSettings[key] = {
      id: key,
      user_id: userId,
      tool_id: toolId,
      settings_data: settingsData,
      created_at: mockSettings[key]?.created_at || now,
      updated_at: now,
    };
  },

  // Exécuter l'outil via n8n
  async executeToolWebhook(
    webhookUrl: string,
    inputData: Record<string, any>,
    userSettings: Record<string, any>,
    userId: string
  ): Promise<any> {
    // Simuler l'appel webhook avec un délai
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Générer une réponse mock basée sur le type d'outil
    const mockResponse = {
      success: true,
      data: {
        result: `Voici le résultat généré pour "${inputData.sujet || 'votre demande'}". Ce contenu a été créé en utilisant les paramètres que vous avez fournis.`,
        metadata: {
          processing_time: Math.floor(Math.random() * 3000) + 1000,
          words_generated: Math.floor(Math.random() * 500) + 200,
          quality_score: (Math.random() * 0.3 + 0.7).toFixed(2),
        },
        recommendations: [
          'Considérez d\'ajouter plus de détails sur votre audience cible',
          'Vous pourriez optimiser le contenu pour le SEO',
          'Pensez à ajouter des exemples concrets'
        ]
      },
      execution_id: `exec_${Date.now()}`,
    };

    return mockResponse;
  },

  // Obtenir les catégories disponibles
  async getCategories(): Promise<string[]> {
    const categories = [...new Set(mockAITools.map(tool => tool.category))];
    return categories.sort();
  },

  // Rechercher les outils avec filtres
  async searchTools(filters: {
    search?: string;
    category?: string;
    difficulty?: string;
    favoriteToolIds?: string[];
  }): Promise<AITool[]> {
    let filteredTools = [...mockAITools];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredTools = filteredTools.filter(tool =>
        tool.title.toLowerCase().includes(searchLower) ||
        tool.description?.toLowerCase().includes(searchLower) ||
        tool.short_description?.toLowerCase().includes(searchLower) ||
        tool.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    if (filters.category && filters.category !== 'all') {
      filteredTools = filteredTools.filter(tool => tool.category === filters.category);
    }

    if (filters.difficulty && filters.difficulty !== 'all') {
      filteredTools = filteredTools.filter(tool => tool.difficulty === filters.difficulty);
    }

    if (filters.favoriteToolIds && filters.favoriteToolIds.length > 0) {
      filteredTools = filteredTools.filter(tool => filters.favoriteToolIds!.includes(tool.id));
    }

    return filteredTools;
  },
};