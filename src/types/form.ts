export type QuestionType = 
  | 'text' 
  | 'textarea' 
  | 'email' 
  | 'phone' 
  | 'date' 
  | 'checkbox' 
  | 'radio' 
  | 'select'
  | 'number'
  | 'rating'
  | 'file';

export interface FormBlock {
  id: string;
  type: 'text' | 'question' | 'separator' | 'title';
  content: string;
  order: number;
  questionType?: QuestionType;
  options?: string[];
  required?: boolean;
  description?: string;
  placeholder?: string;
}

export interface FormConfig {
  id: string;
  title: string;
  description?: string;
  blocks: FormBlock[];
  published: boolean;
  organisation_id: string;
  created_at: Date;
  updated_at: Date;
  created_by: string;
  settings?: {
    allowMultipleSubmissions?: boolean;
    requireLogin?: boolean;
    showProgressBar?: boolean;
  };
}

export interface FormResponse {
  id: string;
  form_id: string;
  answers: Record<string, any>;
  submitted_at: Date;
  submitted_by?: string;
  completion_time?: number;
}

export interface FormStats {
  totalResponses: number;
  completionRate: number;
  averageTime: number;
  lastResponse?: Date;
}
