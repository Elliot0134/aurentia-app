export type UserRole = 'individual' | 'member' | 'staff' | 'organisation' | 'super_admin' | 'admin';
export type InvitationRole = 'member' | 'staff' | 'organisation';

// Organization roles breakdown:
// - 'individual': Standalone users (current individual)
// - 'member': Entrepreneurs/clients within an organization (current member)
// - 'staff': Organization employees with admin privileges (current admin)
// - 'organisation': Organization owners/main admins (renamed from admin)
// - 'super_admin': Platform administrators (deprecated, use 'admin' instead)
// - 'admin': Platform administrators with full access to all data and features

export interface Organization {
  id: string;
  name: string;
  type: 'incubator' | 'accelerator' | 'school' | 'other';
  domain?: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  welcome_message?: string;
  newsletter_enabled: boolean;
  created_at: string;
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
}

export interface UserProfile {
  id: string;
  email: string;
  user_role: UserRole;
  first_name?: string; // User first name
  last_name?: string; // User last name
  avatar_url?: string; // URL to user avatar/profile picture
  phone?: string; // User phone number
  bio?: string; // User biography/description
  location?: string; // User location
  company?: string; // User company name
  job_title?: string; // Current job title or role
  linkedin_url?: string; // LinkedIn profile URL
  website?: string; // Personal or professional website URL
  organization?: Organization; // Loaded via join, not a direct column
  organization_setup_pending?: boolean; // Flag indicating user needs to complete organization setup
  organization_setup_dismissed?: boolean; // Flag indicating user permanently dismissed the setup guide
  invitation_code_used?: string;
  created_at?: string;
  nb_projects?: string;
  drive_folder_url?: string;
  drive_folder_id?: string;
  drive_folder_rag?: string;
  conv_limit?: string;
  credit_limit?: string;
  abonnement?: string;
  stripe_customer_id?: string;
  subscription_status?: string;
  address?: string;
  has_beta_access?: boolean; // Access restriction flag - false for grandfathered users (full access), true for new users (restricted to core features)
  user_type?: string; // Legacy field for backwards compatibility
  is_member?: boolean; // Legacy field for backwards compatibility
  incubateur_id?: string; // Legacy field for backwards compatibility
  monthly_credits_remaining?: number;
  purchased_credits_remaining?: number;
  monthly_credits_limit?: number;
  last_credit_reset?: string;
  cohort_year?: number;
  program_type?: string;
  availability_schedule?: any;
  training_budget?: number;
  onboarding_completed?: boolean;
  onboarding_data?: any;
  theme_preference?: string;
  preferred_language?: string;
}

export interface InvitationCode {
  id: string;
  code: string;
  role: InvitationRole; // Direct role instead of type mapping
  organization_id?: string;
  organization?: Organization;
  created_by?: string;
  created_by_email?: string;
  expires_at?: string;
  max_uses: number;
  current_uses: number;
  remaining_uses: number;
  is_active: boolean;
  status: 'active' | 'inactive' | 'expired' | 'exhausted';
  created_at: string;
}

// Types pour la validation des codes d'invitation
export interface InvitationValidationResult {
  valid: boolean;
  reason?: string;
  role?: UserRole;
  organization?: Organization;
  codeData?: InvitationCode;
}

export interface InvitationUsageResult {
  userRole: UserRole;
  organization?: Organization;
}

// Types pour les routes dynamiques
export interface RouteConfig {
  path: string;
  name: string;
  icon: React.ReactNode;
  roles: UserRole[];
}

export interface SidebarConfig {
  menuItems: Array<{
    name: string;
    path: string;
    icon: React.ReactNode;
  }>;
  branding: {
    name: string;
    logo?: string;
    primaryColor?: string;
  };
}

// Helper functions types
export type RoleChecker = (userRole: UserRole) => boolean;
export type OrganizationMember = UserProfile & {
  organization: Organization;
};