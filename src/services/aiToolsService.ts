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

  // Déduire les crédits utilisateur
  async deductCredits(userId: string, amount: number): Promise<boolean> {
    try {
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('monthly_credits_remaining, purchased_credits_remaining')
        .eq('id', userId)
        .single();

      if (fetchError || !profile) {
        throw new Error('Failed to fetch user profile');
      }

      const totalCredits = profile.monthly_credits_remaining + profile.purchased_credits_remaining;
      if (totalCredits < amount) {
        console.error(`Insufficient credits: ${totalCredits} available, ${amount} required`);
        return false;
      }

      let newPurchasedCredits = profile.purchased_credits_remaining;
      let newMonthlyCredits = profile.monthly_credits_remaining;

      if (newPurchasedCredits >= amount) {
        newPurchasedCredits -= amount;
      } else {
        const remainingToDeduct = amount - newPurchasedCredits;
        newPurchasedCredits = 0;
        newMonthlyCredits -= remainingToDeduct;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          monthly_credits_remaining: newMonthlyCredits,
          purchased_credits_remaining: newPurchasedCredits
        })
        .eq('id', userId);

      if (updateError) {
        throw new Error('Failed to update credits');
      }

      return true;
    } catch (error) {
      console.error('Error deducting credits:', error);
      return false;
    }
  },

  // Exécution d'outils
  async executeTool(request: ToolExecutionRequest): Promise<ToolExecutionResponse> {
    const startTime = Date.now();
    let usageId: string | null = null;

    try {
      // 1. Récupérer l'outil
      const tool = await this.getToolById(request.toolId);
      if (!tool) {
        throw new Error('Tool not found');
      }

      // 2. Récupérer l'utilisateur actuel
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // 3. Vérifier et déduire les crédits
      const creditsDeducted = await this.deductCredits(user.id, tool.credits_cost);
      if (!creditsDeducted) {
        throw new Error('Insufficient credits');
      }

      // 4. Créer un enregistrement d'usage
      usageId = await this.createUsageRecord(
        user.id,
        request.toolId,
        request.inputData,
        request.projectId
      );

      // 5. Mettre à jour le statut à "processing"
      await this.updateUsageRecord(usageId, {
        status: 'processing'
      });

      // 6. Appeler le webhook n8n
      const webhookPayload = {
        theme: request.inputData.theme,
        additional_info: request.inputData.additionalInfo || '',
        reference_article: request.inputData.referenceArticle || '',
        client_type: request.inputData.clientType,
        target_audience: request.userSettings?.targetAudience || '',
        internal_links: request.userSettings?.internalLinks || [],
        project_id: request.projectId || null,
        usage_id: usageId,
        user_id: user.id,
        tool_id: request.toolId
      };

      console.log('🚀 Calling webhook with payload:', webhookPayload);

      const response = await fetch(tool.webhook_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookPayload),
      });

      if (!response.ok) {
        throw new Error(`Webhook call failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      const executionTime = Date.now() - startTime;

      console.log('✅ Webhook response:', result);

      // 7. Mettre à jour l'enregistrement d'usage avec le résultat
      await this.updateUsageRecord(usageId, {
        status: 'completed',
        output_data: result,
        completed_at: new Date().toISOString(),
        credits_used: tool.credits_cost,
        execution_time_ms: executionTime
      });

      return {
        success: true,
        data: result,
        executionId: usageId
      };

    } catch (error) {
      console.error('❌ Error executing tool:', error);

      if (usageId) {
        await this.updateUsageRecord(usageId, {
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error',
          execution_time_ms: Date.now() - startTime
        });
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
};