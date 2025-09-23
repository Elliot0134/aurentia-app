// Types pour les fonctionnalités d'organisation

export interface Organisation {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  primary_color?: string;
  secondary_color?: string;
  settings?: {
    branding?: {
      primaryColor?: string;
      secondaryColor?: string;
      whiteLabel?: boolean;
    };
    notifications?: {
      emailNotifications?: boolean;
      projectUpdates?: boolean;
      mentorAssignments?: boolean;
      weeklyReports?: boolean;
      systemAlerts?: boolean;
    };
  };
  created_at: string;
  updated_at: string;
}

export interface Adherent {
  id: string;
  user_id: string;
  organisation_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  status: 'active' | 'inactive' | 'pending';
  joined_at: string;
  mentor_id?: string;
  project_count: number;
  completed_deliverables: number;
  total_deliverables: number;
  last_activity?: string;
}

export interface Mentor {
  id: string;
  user_id: string;
  organisation_id: string;
  first_name: string;
  last_name: string;
  email: string;
  expertise: string[];
  bio?: string;
  status: 'active' | 'inactive';
  total_entrepreneurs: number;
  success_rate: number;
  rating: number;
  invitation_code?: string;
  joined_at: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  entrepreneur_id: string;
  organisation_id: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  progress: number;
  created_at: string;
  updated_at: string;
  deadline?: string;
  budget?: number;
  category: string;
  tags: string[];
}

export interface Deliverable {
  id: string;
  title: string;
  description: string;
  project_id: string;
  type: 'business-model' | 'market-analysis' | 'pitch' | 'legal' | 'financial' | 'other';
  status: 'pending' | 'in-progress' | 'completed' | 'reviewed';
  quality_score?: number;
  due_date?: string;
  completed_at?: string;
  entrepreneur_id: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  type: 'workshop' | 'meeting' | 'webinar' | 'networking' | 'other';
  location?: string;
  participants?: string[];
  organizer_id: string;
  organisation_id: string;
  is_recurring: boolean;
  max_participants?: number;
}

export interface Partner {
  id: string;
  name: string;
  description?: string;
  type: 'investor' | 'accelerator' | 'incubator' | 'corporate' | 'government' | 'university' | 'other';
  logo?: string;
  website?: string;
  contact_email?: string;
  contact_phone?: string;
  collaboration_type: string[];
  rating: number;
  status: 'active' | 'inactive' | 'prospect';
  organisation_id: string;
  created_at: string;
}

export interface InvitationCode {
  id: string;
  code: string;
  organisation_id: string;
  role: 'entrepreneur' | 'mentor';
  created_by: string;
  created_at: string;
  expires_at?: string;
  max_uses?: number;
  current_uses: number;
  is_active: boolean;
}

export interface FormTemplate {
  id: string;
  title: string;
  description?: string;
  category: 'onboarding' | 'feedback' | 'evaluation' | 'survey' | 'custom';
  fields: FormField[];
  organisation_id: string;
  created_by: string;
  created_at: string;
  is_active: boolean;
}

export interface FormField {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'number' | 'date' | 'email';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // Pour select, radio, checkbox
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface FormSubmission {
  id: string;
  form_id: string;
  submitted_by: string;
  data: Record<string, string | number | boolean | string[]>;
  submitted_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
}

export interface OrganisationStats {
  totalAdherents: number;
  activeProjects: number;
  completedProjects: number;
  totalMentors: number;
  activeMentors: number;
  thisMonthSignups: number;
  averageProjectDuration: number;
  successRate: number;
  totalDeliverables: number;
  completedDeliverables: number;
}

export interface AnalyticsData {
  overview: {
    totalUsers: number;
    activeProjects: number;
    completedProjects: number;
    revenue: number;
    growthRate: number;
  };
  projects: {
    byStatus: Array<{ name: string; value: number; color: string }>;
    byCategory: Array<{ name: string; value: number }>;
    monthlyCreation: Array<{ month: string; projects: number }>;
  };
  users: {
    signups: Array<{ month: string; signups: number }>;
    retention: Array<{ week: string; retention: number }>;
    byRole: Array<{ role: string; count: number }>;
  };
  financial: {
    revenue: Array<{ month: string; revenue: number }>;
    expenses: Array<{ month: string; expenses: number }>;
    profit: Array<{ month: string; profit: number }>;
  };
}

export interface OrganisationSettings {
  general: {
    name: string;
    description: string;
    logo: string;
    website: string;
    email: string;
    phone: string;
    address: string;
    timezone: string;
    language: string;
  };
  branding: {
    primaryColor: string;
    secondaryColor: string;
    logo: string;
    favicon: string;
    customCSS: string;
  };
  notifications: {
    emailNotifications: boolean;
    slackIntegration: boolean;
    webhookUrl: string;
    notificationPreferences: {
      newSignup: boolean;
      projectCompletion: boolean;
      mentorAssignment: boolean;
      systemUpdates: boolean;
    };
  };
  security: {
    twoFactorAuth: boolean;
    passwordPolicy: {
      minLength: number;
      requireSpecialChars: boolean;
      requireNumbers: boolean;
    };
    sessionTimeout: number;
    allowedDomains: string[];
  };
  integrations: {
    slack: {
      enabled: boolean;
      webhook: string;
      channel: string;
    };
    teams: {
      enabled: boolean;
      webhook: string;
    };
    zapier: {
      enabled: boolean;
      apiKey: string;
    };
  };
}

// Utilitaires de formatage
export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(date));
};

export const formatDateTime = (date: string | Date): string => {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
};

export const getProgressColor = (progress: number): string => {
  if (progress >= 80) return 'text-green-600';
  if (progress >= 50) return 'text-yellow-600';
  return 'text-red-600';
};

export const getStatusBadgeColor = (status: string): string => {
  switch (status) {
    case 'active':
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'pending':
    case 'in-progress':
      return 'bg-yellow-100 text-yellow-800';
    case 'inactive':
    case 'archived':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-blue-100 text-blue-800';
  }
};