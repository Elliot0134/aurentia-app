export type AIToolCategory = 'text' | 'image' | 'video' | 'audio' | 'code' | 'data' | 'business' | 'education';

export interface AITool {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  short_description: string | null;
  category: string;
  tags: string[];
  credits_cost: number;
  icon_url: string | null;
  image_url: string | null;
  video_url: string | null;
  difficulty: 'Facile' | 'Moyenne' | 'Difficile' | null;
  estimated_time: string | null;
  webhook_url: string;
  features: string[];
  what_you_get: string[];
  how_to_use_steps: HowToUseStep[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HowToUseStep {
  step: number;
  title: string;
  description: string;
}

export interface AIToolFavorite {
  id: string;
  user_id: string;
  tool_id: string;
  created_at: string;
}

export interface AIToolUsageHistory {
  id: string;
  user_id: string;
  tool_id: string;
  project_id: string | null;
  input_data: Record<string, any>;
  output_data: Record<string, any> | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  credits_used: number | null;
  execution_time_ms: number | null;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface AIToolUserSettings {
  id: string;
  user_id: string;
  tool_id: string;
  settings_data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ToolFilters {
  search: string;
  category: string;
  difficulty: string;
  showFavorites: boolean;
}

export interface ToolExecutionRequest {
  toolId: string;
  inputData: Record<string, any>;
  userSettings: Record<string, any>;
  projectId?: string | null;
}

export interface ToolExecutionResponse {
  success: boolean;
  data?: Record<string, any>;
  error?: string;
  executionId?: string;
}