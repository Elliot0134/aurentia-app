export type ThemePreference = 'light' | 'dark';

export type UserType = 'entrepreneur' | 'dreamer' | 'structure';

export type DiscoverySource =
  | 'podcast'
  | 'news'
  | 'newsletter_blog'
  | 'friends_school'
  | 'work'
  | 'tiktok'
  | 'facebook'
  | 'linkedin'
  | 'youtube'
  | 'x'
  | 'google'
  | 'instagram'
  | 'dont_remember'
  | 'other';

export type EntrepreneurGoal =
  | 'validate_idea'
  | 'plan_before_launch'
  | 'roadmap'
  | 'ai_assistant'
  | 'ai_tools'
  | 'automations'
  | 'find_providers'
  | 'templates'
  | 'resources'
  | 'find_structures';

export type StructureGoal =
  | 'receive_applications'
  | 'manage_members'
  | 'relieve_team'
  | 'find_mentors';

export type PlanType = 'free' | 'accessible';

export interface OnboardingData {
  // Step 1
  theme?: ThemePreference;

  // Step 2
  firstName?: string;
  birthDate?: {
    day: string;
    month: string;
    year: string;
  };
  country?: string;
  preferredLanguage?: string;
  marketingOptIn?: boolean;

  // Step 3
  discoverySource?: DiscoverySource;

  // Step 4
  userType?: UserType;

  // Step 5
  goals?: (EntrepreneurGoal | StructureGoal)[];

  // Step 6
  selectedPlan?: PlanType;

  // Metadata
  completedAt?: string;
  currentStep?: number;
}
