export interface Resource {
  id: string;
  name: string;
  description: string;
  detailed_description?: string; // NOUVEAU
  category: string;
  type: 'notion' | 'canva' | 'pdf' | 'template' | 'guide' | 'video' | 'audio' | 'tool';
  price: number; // en crédits
  
  // Images
  image_url?: string;
  image_2_url?: string; // NOUVEAU
  image_3_url?: string; // NOUVEAU
  image_4_url?: string; // NOUVEAU
  
  // Vidéo
  video_url?: string; // NOUVEAU
  
  file_url?: string;
  tags: string[];
  difficulty: 'Débutant' | 'Intermédiaire' | 'Avancé';
  estimated_time?: string;
  view_count: number;
  download_count: number;
  
  // FAQ
  faq_question_1?: string; // NOUVEAU
  faq_answer_1?: string;
  faq_question_2?: string;
  faq_answer_2?: string;
  faq_question_3?: string;
  faq_answer_3?: string;
  
  // Raisons de choisir
  reason_1_title?: string; // NOUVEAU
  reason_1_text?: string;
  reason_2_title?: string;
  reason_2_text?: string;
  reason_3_title?: string;
  reason_3_text?: string;
  
  // Items inclus
  included_items?: Array<{ emoji: string; text: string }>; // NOUVEAU
  
  created_at: string;
  updated_at: string;
}

export interface ResourceRating {
  id: string;
  resource_id: string;
  user_ip: string;
  rating: number; // 1-5
  comment?: string;
  created_at: string;
}

export interface ResourceWithStats extends Resource {
  average_rating?: number;
  rating_count?: number;
  is_favorite?: boolean;
}

export interface UserFavorite {
  id: string;
  resource_id: string;
  user_ip: string;
  created_at: string;
}

export interface ResourceFilters {
  search?: string;
  category?: string;
  type?: string;
  difficulty?: string;
  tags?: string[];
  sortBy?: 'recent' | 'popular' | 'rating' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface ResourceStats {
  totalResources: number;
  totalDownloads: number;
  averageRating: number;
  popularCategories: Array<{ category: string; count: number }>;
}

// Constantes pour les filtres
export const RESOURCE_CATEGORIES = [
  'Business Plan',
  'Marketing',
  'Finance',
  'Juridique',
  'Design',
  'Technique',
  'Formation',
  'Templates',
  'Outils'
] as const;

export const RESOURCE_TYPES = [
  'notion',
  'canva', 
  'pdf',
  'template',
  'guide',
  'video',
  'audio',
  'tool'
] as const;

export const DIFFICULTY_LEVELS = [
  'Débutant',
  'Intermédiaire', 
  'Avancé'
] as const;

export type ResourceCategory = typeof RESOURCE_CATEGORIES[number];
export type ResourceType = typeof RESOURCE_TYPES[number];
export type DifficultyLevel = typeof DIFFICULTY_LEVELS[number];