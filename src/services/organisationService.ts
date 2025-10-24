import { supabase } from '@/integrations/supabase/client';

// Types pour les données du service
export interface OrganisationData {
  id: string;
  name: string;
  type?: string;
  description?: string;
  welcome_message?: string;
  logo_url?: string;
  logo?: string;
  domain?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  primary_color?: string;
  secondary_color?: string;
  settings?: any;
  created_at?: string;
  updated_at?: string;
  
  // Champs d'onboarding ajoutés
  founded_year?: number;
  mission?: string;
  vision?: string;
  values?: any;
  sectors?: any;
  stages?: any;
  geographic_focus?: any;
  team_size?: number;
  specializations?: any;
  methodology?: string;
  program_duration_months?: number;
  success_criteria?: string;
  support_types?: any;
  social_media?: any;
  is_public?: boolean;
  allow_direct_applications?: boolean;
  onboarding_completed?: boolean;
  onboarding_step?: number;
}

export interface OrganisationStats {
  totalAdherents: number;
  activeProjects: number;
  completedProjects: number;
  totalMentors: number;
  newThisMonth: number;
  recentSignups: number;
  averageProgress: number;
  totalDeliverables: number;
  completedDeliverables: number;
  totalEvents: number;
  upcomingEvents: number;
  totalPartners: number;
  activePartners: number;
  monthlyGrowth: number;
  conversionRate: number;
}

export interface OrganisationMember {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  user_role: string;
  organization_id?: string;
  projects_count: number;
  created_at?: string;
}

export interface Project {
  project_id: string;
  user_id: string;
  nom_projet: string;
  description_synthetique?: string;
  statut: string;
  avancement_global?: string;
  progress: number;
  created_at?: string;
  updated_at?: string;
  linked_to_organization?: boolean;
}

export interface InvitationCodeData {
  code: string;
  type: 'super_admin' | 'organisation_staff' | 'organisation_member';
  organization_id: string;
  created_by: string;
  is_active?: boolean;
  expires_at?: string;
  max_uses?: number;
  current_uses?: number;
  assigned_role?: 'individual' | 'member' | 'staff' | 'organisation' | 'super_admin' | 'entrepreneur' | 'mentor';
}

// Types for additional entities
export interface Deliverable {
  id: string;
  organization_id: string;
  project_id?: string;
  entrepreneur_id?: string;
  title: string;
  description?: string;
  type: 'business-model' | 'market-analysis' | 'pitch' | 'legal' | 'financial' | 'prototype' | 'presentation' | 'other';
  status: 'pending' | 'in-progress' | 'completed' | 'reviewed' | 'approved';
  quality_score?: number;
  due_date?: string;
  completed_at?: string;
  file_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Event {
  id: string;
  organization_id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  type: 'workshop' | 'meeting' | 'webinar' | 'networking' | 'presentation' | 'training' | 'other';
  location?: string;
  meet_link?: string;
  organizer_id?: string;
  is_recurring: boolean;
  max_participants?: number;
  participants: string[];
  status: 'planned' | 'ongoing' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface Partner {
  id: string;
  organization_id: string;
  name: string;
  type: 'investor' | 'accelerator' | 'incubator' | 'corporate' | 'government' | 'university' | 'other';
  description?: string;
  logo?: string;
  website?: string;
  email?: string;
  phone?: string;
  collaboration_type?: string[];
  rating?: number;
  status: 'active' | 'inactive' | 'prospect';
  created_at?: string;
  updated_at?: string;
}

export interface FormTemplate {
  id: string;
  organization_id: string;
  title: string;
  description?: string;
  category: 'onboarding' | 'feedback' | 'evaluation' | 'survey' | 'application' | 'custom';
  fields: any[];
  created_by?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Service pour récupérer les informations d'une organisation
export const getOrganisation = async (id: string): Promise<OrganisationData> => {
  const { data, error } = await (supabase as any)
    .from('organizations')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

// Service pour mettre à jour une organisation
export const updateOrganisation = async (id: string, updates: Partial<OrganisationData>) => {
  const { data, error } = await (supabase as any)
    .from('organizations')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Service pour mettre à jour les paramètres d'une organisation
export const updateOrganisationSettings = async (id: string, updateData: any) => {
  const { data, error } = await (supabase as any)
    .from('organizations')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

const getDefaultStats = (): OrganisationStats => ({
  totalAdherents: 0,
  activeProjects: 0,
  completedProjects: 0,
  totalMentors: 0,
  newThisMonth: 0,
  recentSignups: 0,
  averageProgress: 0,
  totalDeliverables: 0,
  completedDeliverables: 0,
  totalEvents: 0,
  upcomingEvents: 0,
  totalPartners: 0,
  activePartners: 0,
  monthlyGrowth: 0,
  conversionRate: 0,
});

// Service pour obtenir les statistiques d'une organisation
export const getOrganisationStats = async (organizationId: string): Promise<OrganisationStats> => {
  try {
    console.log('🔍 Fetching stats for organization:', organizationId);
    
    // Get total members (adherents) count
    const { count: totalMembers, error: membersError } = await (supabase as any)
      .from('user_organizations')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('status', 'active')
      .in('user_role', ['entrepreneur', 'member']);

    if (membersError) console.error('Error counting members:', membersError);

    // Get new members this month
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    const { count: newMembersThisMonth, error: newMembersError } = await (supabase as any)
      .from('user_organizations')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('status', 'active')
      .in('user_role', ['entrepreneur', 'member'])
      .gte('joined_at', firstDayOfMonth.toISOString());

    if (newMembersError) console.error('Error counting new members:', newMembersError);

    // Get total mentors count
    const { count: totalMentors, error: mentorsError } = await (supabase as any)
      .from('mentors')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('status', 'active');

    if (mentorsError) console.error('Error counting mentors:', mentorsError);

    // Get projects count
    const { count: totalProjects, error: projectsError } = await (supabase as any)
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId);

    if (projectsError) console.error('Error counting projects:', projectsError);

    // Get active projects count
    const { count: activeProjects, error: activeProjectsError } = await (supabase as any)
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('status', 'active');

    if (activeProjectsError) console.error('Error counting active projects:', activeProjectsError);

    // Get completed projects count
    const { count: completedProjects, error: completedProjectsError } = await (supabase as any)
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('status', 'completed');

    if (completedProjectsError) console.error('Error counting completed projects:', completedProjectsError);

    // Get deliverables count
    const { count: totalDeliverables, error: deliverablesError } = await (supabase as any)
      .from('deliverables')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId);

    if (deliverablesError) console.error('Error counting deliverables:', deliverablesError);

    // Get completed deliverables count
    const { count: completedDeliverables, error: completedDeliverablesError } = await (supabase as any)
      .from('deliverables')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .in('status', ['completed', 'approved']);

    if (completedDeliverablesError) console.error('Error counting completed deliverables:', completedDeliverablesError);

    // Calculate completion rate
    const completionRate = totalProjects && totalProjects > 0 
      ? Math.round(((completedProjects || 0) / totalProjects) * 100) 
      : 0;

    console.log('✅ Successfully fetched organization stats using direct table queries');

    return {
      totalAdherents: totalMembers || 0,
      activeProjects: activeProjects || 0,
      completedProjects: completedProjects || 0,
      totalMentors: totalMentors || 0,
      newThisMonth: newMembersThisMonth || 0,
      recentSignups: newMembersThisMonth || 0,
      averageProgress: completionRate,
      totalDeliverables: totalDeliverables || 0,
      completedDeliverables: completedDeliverables || 0,
      totalEvents: 0,
      upcomingEvents: 0,
      totalPartners: 0,
      activePartners: 0,
      monthlyGrowth: 0,
      conversionRate: completionRate
    };

  } catch (error) {
    console.error('Error in getOrganisationStats:', error);
    return getDefaultStats();
  }
};

// Service pour obtenir les membres d'une organisation
export const getOrganisationMembers = async (organizationId: string): Promise<OrganisationMember[]> => {
  console.log('🔍 Fetching members for organization:', organizationId);
  
  try {
    // Get user_organizations first
    const { data: userOrgs, error: userOrgsError } = await (supabase as any)
      .from('user_organizations')
      .select('user_id, user_role, joined_at, status')
      .eq('organization_id', organizationId)
      .eq('status', 'active')
      .order('joined_at', { ascending: false });

    if (userOrgsError) {
      console.error('Error fetching user organizations:', userOrgsError);
      return [];
    }

    if (!userOrgs || userOrgs.length === 0) {
      console.log('No active members found for organization');
      return [];
    }

    // Get user IDs
    const userIds = userOrgs.map((org: any) => org.user_id);

    // Fetch profiles for these users
    const { data: profiles, error: profilesError } = await (supabase as any)
      .from('profiles')
      .select('id, email, first_name, last_name, phone, created_at')
      .in('id', userIds);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return [];
    }

    // Get project counts for each user
    const { data: projectCounts, error: projectCountsError } = await (supabase as any)
      .from('projects')
      .select('creator_id')
      .eq('organization_id', organizationId)
      .in('creator_id', userIds);

    if (projectCountsError) {
      console.error('Error fetching project counts:', projectCountsError);
    }

    // Count projects per user
    const projectCountMap: Record<string, number> = {};
    (projectCounts || []).forEach((project: any) => {
      projectCountMap[project.creator_id] = (projectCountMap[project.creator_id] || 0) + 1;
    });

    // Combine all data
    const members = userOrgs.map((userOrg: any) => {
      const profile = profiles?.find((p: any) => p.id === userOrg.user_id);
      
      return {
        id: userOrg.user_id,
        email: profile?.email || 'N/A',
        first_name: profile?.first_name || profile?.email?.split('@')[0] || 'Prénom',
        last_name: profile?.last_name || '',
        phone: profile?.phone || '',
        user_role: userOrg.user_role,
        organization_id: organizationId,
        projects_count: projectCountMap[userOrg.user_id] || 0,
        created_at: profile?.created_at || userOrg.joined_at,
        invitation_code_used: null
      };
    });

    console.log('✅ Successfully fetched', members.length, 'members using direct table queries');
    return members;

  } catch (error) {
    console.error('Error in getOrganisationMembers:', error);
    return [];
  }
};

// Service pour obtenir les projets d'une organisation
export const getOrganisationProjects = async (organizationId: string): Promise<Project[]> => {
  try {
    console.log('🔍 Fetching projects for organization:', organizationId);
    
    // Fetch projects directly from projects table
    const { data: projects, error: projectsError } = await (supabase as any)
      .from('projects')
      .select(`
        id,
        title,
        description,
        creator_id,
        status,
        progress,
        category,
        created_at,
        updated_at
      `)
      .eq('organization_id', organizationId)
      .order('updated_at', { ascending: false });

    if (projectsError) {
      console.error('Error fetching organization projects:', projectsError);
      return [];
    }

    if (!projects || projects.length === 0) {
      console.log('No projects found for organization');
      return [];
    }

    // Get creator information for all projects
    const creatorIds = [...new Set(projects.map((p: any) => p.creator_id))];
    
    const { data: creators, error: creatorsError } = await (supabase as any)
      .from('profiles')
      .select('id, email, first_name, last_name')
      .in('id', creatorIds);

    if (creatorsError) {
      console.error('Error fetching creators:', creatorsError);
    }

    // Get deliverables count for each project
    const projectIds = projects.map((p: any) => p.id);
    
    const { data: deliverables, error: deliverablesError } = await (supabase as any)
      .from('deliverables')
      .select('new_project_id, status')
      .in('new_project_id', projectIds);

    if (deliverablesError) {
      console.error('Error fetching deliverables:', deliverablesError);
    }

    // Count deliverables per project
    const deliverableCountMap: Record<string, { total: number; completed: number }> = {};
    (deliverables || []).forEach((deliverable: any) => {
      if (!deliverableCountMap[deliverable.new_project_id]) {
        deliverableCountMap[deliverable.new_project_id] = { total: 0, completed: 0 };
      }
      deliverableCountMap[deliverable.new_project_id].total += 1;
      if (['completed', 'approved'].includes(deliverable.status)) {
        deliverableCountMap[deliverable.new_project_id].completed += 1;
      }
    });

    // Also check for legacy project_summary entries to get project_id mapping
    const { data: legacyProjects, error: legacyError } = await (supabase as any)
      .from('project_summary')
      .select('project_id, user_id')
      .in('user_id', creatorIds);

    if (legacyError) {
      console.error('Error fetching legacy projects:', legacyError);
    }

    // Create a map of user_id to legacy project_id
    const legacyProjectMap: Record<string, string> = {};
    (legacyProjects || []).forEach((lp: any) => {
      legacyProjectMap[lp.user_id] = lp.project_id;
    });

    // Combine all data
    const mappedProjects = projects.map((project: any) => {
      const creator = creators?.find((c: any) => c.id === project.creator_id);
      const deliverableStats = deliverableCountMap[project.id] || { total: 0, completed: 0 };
      const legacyProjectId = legacyProjectMap[project.creator_id];

      return {
        project_id: legacyProjectId || project.id,
        user_id: project.creator_id,
        nom_projet: project.title,
        description_synthetique: project.description,
        statut: project.status,
        avancement_global: project.progress?.toString() || '0',
        progress: project.progress || 0,
        created_at: project.created_at,
        updated_at: project.updated_at,
        linked_to_organization: true
      };
    });

    console.log('✅ Successfully fetched', mappedProjects.length, 'projects using direct table queries');
    return mappedProjects;

  } catch (error) {
    console.error('Error fetching organization projects:', error);
    return [];
  }
};

// Service pour obtenir les codes d'invitation d'une organisation
export const getOrganisationInvitationCodes = async (organizationId: string) => {
  const { data, error } = await (supabase as any)
    .from('invitation_code')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching invitation codes:', error);
    return [];
  }
  return data || [];
};

// New simplified functions using direct table queries instead of database functions
export const getOrganisationAdherents = async (organizationId: string) => {
  try {
    console.log('🔍 Fetching adherents for organization:', organizationId);

    // Get user_organizations for entrepreneurs/members
    const { data: userOrgs, error: userOrgsError } = await (supabase as any)
      .from('user_organizations')
      .select('user_id, user_role, joined_at, status')
      .eq('organization_id', organizationId)
      .eq('status', 'active')
      .in('user_role', ['entrepreneur', 'member']);

    if (userOrgsError) {
      console.error('Error fetching user organizations:', userOrgsError);
      return [];
    }

    if (!userOrgs || userOrgs.length === 0) {
      return [];
    }

    const userIds = userOrgs.map((org: any) => org.user_id);

    // Fetch profiles
    const { data: profiles, error: profilesError } = await (supabase as any)
      .from('profiles')
      .select(`
        id, email, first_name, last_name, phone, avatar_url, linkedin_url,
        website, bio, location, company, job_title, program_type, cohort_year,
        training_budget, availability_schedule, monthly_credits_remaining,
        purchased_credits_remaining
      `)
      .in('id', userIds);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return [];
    }

    // Get projects for these users
    const { data: projects, error: projectsError } = await (supabase as any)
      .from('projects')
      .select('id, title, creator_id, status')
      .eq('organization_id', organizationId)
      .in('creator_id', userIds);

    if (projectsError) {
      console.error('Error fetching projects:', projectsError);
    }

    // Count projects per user
    const projectsMap: Record<string, { total: number; active: number; names: string[] }> = {};
    (projects || []).forEach((project: any) => {
      if (!projectsMap[project.creator_id]) {
        projectsMap[project.creator_id] = { total: 0, active: 0, names: [] };
      }
      projectsMap[project.creator_id].total += 1;
      if (project.status === 'active') {
        projectsMap[project.creator_id].active += 1;
      }
      projectsMap[project.creator_id].names.push(project.title);
    });

    // Get deliverables for these users
    const { data: deliverables, error: deliverablesError } = await (supabase as any)
      .from('deliverables')
      .select('entrepreneur_id, status')
      .eq('organization_id', organizationId)
      .in('entrepreneur_id', userIds);

    if (deliverablesError) {
      console.error('Error fetching deliverables:', deliverablesError);
    }

    // Count deliverables per user
    const deliverablesMap: Record<string, { total: number; completed: number }> = {};
    (deliverables || []).forEach((deliverable: any) => {
      if (!deliverablesMap[deliverable.entrepreneur_id]) {
        deliverablesMap[deliverable.entrepreneur_id] = { total: 0, completed: 0 };
      }
      deliverablesMap[deliverable.entrepreneur_id].total += 1;
      if (['completed', 'approved'].includes(deliverable.status)) {
        deliverablesMap[deliverable.entrepreneur_id].completed += 1;
      }
    });

    // Get mentor assignments
    const { data: assignments, error: assignmentsError } = await (supabase as any)
      .from('mentor_assignments')
      .select(`
        entrepreneur_id,
        mentor_id,
        mentors!inner(
          user_id,
          profiles!inner(first_name, last_name)
        )
      `)
      .eq('organization_id', organizationId)
      .in('entrepreneur_id', userIds)
      .eq('status', 'active');

    if (assignmentsError) {
      console.error('Error fetching mentor assignments:', assignmentsError);
    }

    // Map mentor names per entrepreneur
    const mentorsMap: Record<string, string[]> = {};
    (assignments || []).forEach((assignment: any) => {
      if (!mentorsMap[assignment.entrepreneur_id]) {
        mentorsMap[assignment.entrepreneur_id] = [];
      }
      const mentorName = `${assignment.mentors?.profiles?.first_name || ''} ${assignment.mentors?.profiles?.last_name || ''}`.trim();
      if (mentorName) {
        mentorsMap[assignment.entrepreneur_id].push(mentorName);
      }
    });

    // Get subscription information
    const { data: subscriptions, error: subscriptionsError } = await (supabase as any)
      .from('member_subscriptions')
      .select('user_id, status, days_overdue, last_payment_date, next_payment_date, amount')
      .eq('organization_id', organizationId)
      .in('user_id', userIds);

    if (subscriptionsError) {
      console.error('Error fetching subscriptions:', subscriptionsError);
    }

    // Map subscriptions per user
    const subscriptionsMap: Record<string, any> = {};
    (subscriptions || []).forEach((sub: any) => {
      subscriptionsMap[sub.user_id] = sub;
    });

    // Combine all data
    const adherents = userOrgs.map((userOrg: any) => {
      const profile = profiles?.find((p: any) => p.id === userOrg.user_id);
      const projectStats = projectsMap[userOrg.user_id] || { total: 0, active: 0, names: [] };
      const deliverableStats = deliverablesMap[userOrg.user_id] || { total: 0, completed: 0 };
      const mentorNames = mentorsMap[userOrg.user_id] || [];
      const subscription = subscriptionsMap[userOrg.user_id];
      
      const completionRate = deliverableStats.total > 0 
        ? Math.round((deliverableStats.completed / deliverableStats.total) * 100) 
        : 0;

      return {
        user_id: userOrg.user_id,
        email: profile?.email || 'N/A',
        first_name: profile?.first_name || profile?.email?.split('@')[0] || '',
        last_name: profile?.last_name || '',
        phone: profile?.phone,
        avatar_url: profile?.avatar_url,
        linkedin_url: profile?.linkedin_url,
        website: profile?.website,
        bio: profile?.bio,
        location: profile?.location,
        company: profile?.company,
        job_title: profile?.job_title,
        program_type: profile?.program_type,
        cohort_year: profile?.cohort_year,
        training_budget: profile?.training_budget,
        availability_schedule: profile?.availability_schedule,
        monthly_credits_remaining: profile?.monthly_credits_remaining,
        purchased_credits_remaining: profile?.purchased_credits_remaining,
        joined_at: userOrg.joined_at,
        mentor_names: mentorNames,
        total_projects: projectStats.total,
        active_projects: projectStats.active,
        project_names: projectStats.names,
        total_deliverables: deliverableStats.total,
        completed_deliverables: deliverableStats.completed,
        completion_rate: completionRate,
        activity_status: projectStats.active > 0 ? 'active' : 'inactive',
        payment_status: subscription?.status || 'no_subscription',
        subscription_days_overdue: subscription?.days_overdue || 0,
        last_payment_date: subscription?.last_payment_date,
        next_payment_date: subscription?.next_payment_date,
        subscription_amount: subscription?.amount
      };
    });

    console.log('✅ Successfully fetched', adherents.length, 'adherents using direct table queries');
    return adherents;

  } catch (error) {
    console.error('Error in getOrganisationAdherents:', error);
    return [];
  }
};

export const getOrganisationMembersWithRole = async (organizationId: string, role?: string) => {
  try {
    console.log('🔍 Fetching members with role for organization:', organizationId, 'role:', role);

    // Build query
    let query = (supabase as any)
      .from('user_organizations')
      .select('user_id, user_role, joined_at, status')
      .eq('organization_id', organizationId)
      .eq('status', 'active');

    // Add role filter if specified
    if (role) {
      query = query.eq('user_role', role);
    }

    const { data: userOrgs, error: userOrgsError } = await query;

    if (userOrgsError) {
      console.error('Error fetching user organizations:', userOrgsError);
      return [];
    }

    if (!userOrgs || userOrgs.length === 0) {
      return [];
    }

    const userIds = userOrgs.map((org: any) => org.user_id);

    // Fetch profiles
    const { data: profiles, error: profilesError } = await (supabase as any)
      .from('profiles')
      .select('id, email, first_name, last_name, phone')
      .in('id', userIds);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return [];
    }

    // Combine data
    const members = userOrgs.map((userOrg: any) => {
      const profile = profiles?.find((p: any) => p.id === userOrg.user_id);
      return {
        user_id: userOrg.user_id,
        email: profile?.email || 'N/A',
        first_name: profile?.first_name || '',
        last_name: profile?.last_name || '',
        phone: profile?.phone || '',
        user_role: userOrg.user_role,
        joined_at: userOrg.joined_at
      };
    });

    console.log('✅ Successfully fetched', members.length, 'members with role using direct table queries');
    return members;

  } catch (error) {
    console.error('Error in getOrganisationMembersWithRole:', error);
    return [];
  }
};

export const getOrganisationProjectsWithStats = async (organizationId: string) => {
  try {
    // Just reuse the main projects function which now has stats
    return await getOrganisationProjects(organizationId);
  } catch (error) {
    console.error('Error in getOrganisationProjectsWithStats:', error);
    return [];
  }
};

export const getOrganisationMentorsWithStats = async (organizationId: string) => {
  try {
    // Just reuse the main mentors function which now has stats
    return await getOrganisationMentors(organizationId);
  } catch (error) {
    console.error('Error in getOrganisationMentorsWithStats:', error);
    return [];
  }
};

// Service pour obtenir le staff d'une organisation
export const getOrganisationStaff = async (organizationId: string) => {
  try {
    console.log('🔍 Fetching staff for organization:', organizationId);

    // Get user_organizations for staff
    const { data: userOrgs, error: userOrgsError } = await (supabase as any)
      .from('user_organizations')
      .select('user_id, user_role, joined_at, status')
      .eq('organization_id', organizationId)
      .eq('status', 'active')
      .eq('user_role', 'staff');

    if (userOrgsError) {
      console.error('Error fetching user organizations:', userOrgsError);
      return [];
    }

    if (!userOrgs || userOrgs.length === 0) {
      return [];
    }

    const userIds = userOrgs.map((org: any) => org.user_id);

    // Fetch profiles
    const { data: profiles, error: profilesError } = await (supabase as any)
      .from('profiles')
      .select(`
        id, email, first_name, last_name, phone, avatar_url, linkedin_url,
        website, bio, location, company, job_title
      `)
      .in('id', userIds);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return [];
    }

    // Fetch staff data
    const { data: staff, error: staffError } = await (supabase as any)
      .from('staff')
      .select(`
        id, user_id, job_role, manager_id, bio, linkedin_url, status,
        joined_at, created_at, updated_at
      `)
      .eq('organization_id', organizationId)
      .in('user_id', userIds)
      .eq('status', 'active');

    if (staffError) {
      console.error('Error fetching staff:', staffError);
    }

    // Fetch manager names for staff with managers
    const managerIds = (staff || [])
      .map((s: any) => s.manager_id)
      .filter((id: any) => id !== null);

    let managersMap: Record<string, string> = {};

    if (managerIds.length > 0) {
      const { data: managers, error: managersError } = await (supabase as any)
        .from('staff')
        .select('id, user_id')
        .in('id', managerIds);

      if (!managersError && managers) {
        const managerUserIds = managers.map((m: any) => m.user_id);

        const { data: managerProfiles, error: managerProfilesError } = await (supabase as any)
          .from('profiles')
          .select('id, first_name, last_name')
          .in('id', managerUserIds);

        if (!managerProfilesError && managerProfiles) {
          managers.forEach((manager: any) => {
            const profile = managerProfiles.find((p: any) => p.id === manager.user_id);
            if (profile) {
              managersMap[manager.id] = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
            }
          });
        }
      }
    }

    // Check if staff members are also mentors
    const { data: mentors, error: mentorsError } = await (supabase as any)
      .from('mentors')
      .select('user_id')
      .eq('organization_id', organizationId)
      .in('user_id', userIds)
      .eq('status', 'active');

    if (mentorsError) {
      console.error('Error checking mentor status:', mentorsError);
    }

    const mentorUserIds = new Set((mentors || []).map((m: any) => m.user_id));

    // Map staff data by user_id
    const staffDataMap: Record<string, any> = {};
    (staff || []).forEach((s: any) => {
      staffDataMap[s.user_id] = s;
    });

    // Combine all data
    const staffList = userOrgs.map((userOrg: any) => {
      const profile = profiles?.find((p: any) => p.id === userOrg.user_id);
      const staffData = staffDataMap[userOrg.user_id];
      const isAlsoMentor = mentorUserIds.has(userOrg.user_id);
      const managerName = staffData?.manager_id ? managersMap[staffData.manager_id] : undefined;

      return {
        id: staffData?.id || userOrg.user_id,
        user_id: userOrg.user_id,
        organisation_id: organizationId,
        email: profile?.email || 'N/A',
        first_name: profile?.first_name || profile?.email?.split('@')[0] || '',
        last_name: profile?.last_name || '',
        phone: profile?.phone || '',
        avatar_url: profile?.avatar_url,
        linkedin_url: staffData?.linkedin_url || profile?.linkedin_url,
        website: profile?.website,
        bio: staffData?.bio || profile?.bio || '',
        location: profile?.location,
        company: profile?.company,
        job_role: staffData?.job_role || 'Non défini',
        manager_id: staffData?.manager_id,
        manager_name: managerName,
        status: staffData?.status || 'active',
        joined_at: staffData?.joined_at || userOrg.joined_at,
        created_at: staffData?.created_at || userOrg.joined_at,
        updated_at: staffData?.updated_at || userOrg.joined_at,
        is_also_mentor: isAlsoMentor
      };
    });

    console.log('✅ Successfully fetched', staffList.length, 'staff members using direct table queries');
    return staffList;
  } catch (error) {
    console.error('Error fetching organization staff:', error);
    return [];
  }
};

// Service pour créer un code d'invitation
export const createInvitationCode = async (codeData: InvitationCodeData) => {
  const { data, error } = await (supabase as any)
    .from('invitation_code')
    .insert(codeData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Service pour désactiver un code d'invitation
export const deactivateInvitationCode = async (codeId: string) => {
  const { error } = await (supabase as any)
    .from('invitation_code')
    .update({ is_active: false })
    .eq('id', codeId);

  if (error) throw error;
};

// Service pour supprimer un membre d'une organisation
export const removeMemberFromOrganisation = async (memberId: string) => {
  const { error } = await (supabase as any)
    .from('profiles')
    .update({ user_role: 'individual' })
    .eq('id', memberId);

  if (error) throw error;
};

// Service pour créer une nouvelle organisation
export const createOrganisation = async (organisationData: Partial<OrganisationData>) => {
  const { data, error } = await (supabase as any)
    .from('organizations')
    .insert(organisationData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Service pour obtenir toutes les organisations (pour super admin)
export const getAllOrganisations = async () => {
  const { data, error } = await (supabase as any)
    .from('organizations')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

// Events services - implémentation complète
export const getOrganisationEvents = async (organizationId: string): Promise<Event[]> => {
  try {
    const { data, error } = await (supabase as any)
      .from('events')
      .select(`
        *,
        organizer:profiles!events_organizer_id_fkey(
          email, first_name, last_name
        )
      `)
      .eq('organization_id', organizationId)
      .order('start_date', { ascending: true });

    if (error) {
      console.error('Error fetching events:', error);
      return [];
    }
    
    // Normaliser les données pour s'assurer que tous les champs requis sont présents
    return (data || []).map((event: any) => ({
      id: event.id,
      organization_id: event.organization_id,
      title: event.title,
      description: event.description,
      start_date: event.start_date,
      end_date: event.end_date,
      type: event.type,
      location: event.location,
      meet_link: event.meet_link,
      organizer_id: event.organizer_id,
      is_recurring: event.is_recurring || false,
      max_participants: event.max_participants,
      participants: event.participants || [],
      status: event.status || 'planned',
      created_at: event.created_at,
      updated_at: event.updated_at
    }));
  } catch (error) {
    console.error('Error fetching organisation events:', error);
    return [];
  }
};

export const getOrganisationPartners = async (organizationId: string) => {
  console.warn('Partners table not yet available');
  return [];
};

// Deliverables services
export const getOrganisationDeliverables = async (organizationId: string): Promise<Deliverable[]> => {
  try {
    const { data, error } = await (supabase as any)
      .from('deliverables')
      .select(`
        *,
        project:project_summary(nom_projet),
        entrepreneur:profiles!deliverables_entrepreneur_id_fkey(email, first_name, last_name)
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Deliverables table not yet available:', error);
      return [];
    }
    return data || [];
  } catch (error) {
    console.warn('Deliverables functionality not yet available');
    return [];
  }
};

export const createDeliverable = async (deliverableData: Partial<Deliverable>): Promise<Deliverable> => {
  try {
    const { data, error } = await (supabase as any)
      .from('deliverables')
      .insert(deliverableData)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.warn('Deliverables creation not yet available');
    throw new Error('Deliverables functionality not yet available');
  }
};

export const updateDeliverable = async (id: string, updates: Partial<Deliverable>): Promise<Deliverable> => {
  try {
    const { data, error } = await (supabase as any)
      .from('deliverables')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.warn('Deliverables update not yet available');
    throw new Error('Deliverables functionality not yet available');
  }
};

export const deleteDeliverable = async (id: string): Promise<void> => {
  try {
    const { error } = await (supabase as any)
      .from('deliverables')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.warn('Deliverables deletion not yet available');
    throw new Error('Deliverables functionality not yet available');
  }
};

// Events services - implémentation complète
export const createEvent = async (eventData: Partial<Event>): Promise<Event> => {
  try {
    // Validation des données
    if (!eventData.title || !eventData.start_date || !eventData.end_date || !eventData.organization_id) {
      throw new Error('Missing required fields: title, start_date, end_date, or organization_id');
    }

    // Validation des participants max (ne peut pas être négatif)
    if (eventData.max_participants !== undefined && eventData.max_participants < 0) {
      throw new Error('max_participants cannot be negative');
    }

    // Préparer les données pour l'insertion
    const insertData = {
      title: eventData.title,
      description: eventData.description || null,
      start_date: eventData.start_date,
      end_date: eventData.end_date,
      type: eventData.type || 'other',
      location: eventData.location || null,
      meet_link: eventData.meet_link || null,
      organizer_id: eventData.organizer_id || null,
      is_recurring: eventData.is_recurring || false,
      max_participants: eventData.max_participants || null,
      organization_id: eventData.organization_id,
      participants: eventData.participants || [],
      status: eventData.status || 'planned'
    };

    const { data, error } = await (supabase as any)
      .from('events')
      .insert(insertData)
      .select(`
        *,
        organizer:profiles!events_organizer_id_fkey(
          email, first_name, last_name
        )
      `)
      .single();

    if (error) {
      console.error('Error creating event:', error);
      throw error;
    }
    
    // Normaliser les données pour s'assurer que tous les champs requis sont présents
    return {
      id: data.id,
      organization_id: data.organization_id,
      title: data.title,
      description: data.description,
      start_date: data.start_date,
      end_date: data.end_date,
      type: data.type,
      location: data.location,
      meet_link: data.meet_link,
      organizer_id: data.organizer_id,
      is_recurring: data.is_recurring || false,
      max_participants: data.max_participants,
      participants: data.participants || [],
      status: data.status || 'planned',
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  } catch (error) {
    console.error('Error in createEvent:', error);
    throw error;
  }
};

export const updateEvent = async (id: string, updates: Partial<Event>): Promise<Event> => {
  try {
    // Validation des participants max (ne peut pas être négatif)
    if (updates.max_participants !== undefined && updates.max_participants < 0) {
      throw new Error('max_participants cannot be negative');
    }

    const { data, error } = await (supabase as any)
      .from('events')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        organizer:profiles!events_organizer_id_fkey(
          email, first_name, last_name
        )
      `)
      .single();

    if (error) {
      console.error('Error updating event:', error);
      throw error;
    }
    
    // Normaliser les données pour s'assurer que tous les champs requis sont présents
    return {
      id: data.id,
      organization_id: data.organization_id,
      title: data.title,
      description: data.description,
      start_date: data.start_date,
      end_date: data.end_date,
      type: data.type,
      location: data.location,
      meet_link: data.meet_link,
      organizer_id: data.organizer_id,
      is_recurring: data.is_recurring || false,
      max_participants: data.max_participants,
      participants: data.participants || [],
      status: data.status || 'planned',
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  } catch (error) {
    console.error('Error in updateEvent:', error);
    throw error;
  }
};

export const deleteEvent = async (id: string): Promise<boolean> => {
  try {
    const { error } = await (supabase as any)
      .from('events')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
    return true;
  } catch (error) {
    console.error('Error in deleteEvent:', error);
    throw error;
  }
};

// Partners services
export const createPartner = async (organizationId: string, partnerData: Partial<Partner>): Promise<Partner> => {
  try {
    const { data, error } = await (supabase as any)
      .from('partners')
      .insert({ ...partnerData, organization_id: organizationId })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.warn('Partners creation not yet available');
    throw new Error('Partners functionality not yet available');
  }
};

export const updatePartner = async (id: string, updates: Partial<Partner>): Promise<Partner> => {
  try {
    const { data, error } = await (supabase as any)
      .from('partners')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.warn('Partners update not yet available');
    throw new Error('Partners functionality not yet available');
  }
};

export const deletePartner = async (id: string): Promise<void> => {
  try {
    const { error } = await (supabase as any)
      .from('partners')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.warn('Partners deletion not yet available');
    throw new Error('Partners functionality not yet available');
  }
};

// Form templates services
export const getFormTemplates = async (organizationId: string): Promise<FormTemplate[]> => {
  try {
    const { data, error } = await (supabase as any)
      .from('form_templates')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Form templates table not yet available:', error);
      return [];
    }
    return data || [];
  } catch (error) {
    console.warn('Form templates functionality not yet available');
    return [];
  }
};

export const createFormTemplate = async (organizationId: string, templateData: Partial<FormTemplate>): Promise<FormTemplate> => {
  try {
    const { data, error } = await (supabase as any)
      .from('form_templates')
      .insert({ ...templateData, organization_id: organizationId })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.warn('Form templates creation not yet available');
    throw new Error('Form templates functionality not yet available');
  }
};

export const updateFormTemplate = async (id: string, updates: Partial<FormTemplate>): Promise<FormTemplate> => {
  try {
    const { data, error } = await (supabase as any)
      .from('form_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.warn('Form templates update not yet available');
    throw new Error('Form templates functionality not yet available');
  }
};

export const deleteFormTemplate = async (id: string): Promise<void> => {
  try {
    const { error } = await (supabase as any)
      .from('form_templates')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.warn('Form templates deletion not yet available');
    throw new Error('Form templates functionality not yet available');
  }
};

// Services pour les mentors - utilise les admins d'organisation et la table mentors
export const getOrganisationMentors = async (organizationId: string) => {
  try {
    console.log('🔍 Fetching mentors for organization:', organizationId);
    
    // Get user_organizations for staff/mentors
    const { data: userOrgs, error: userOrgsError } = await (supabase as any)
      .from('user_organizations')
      .select('user_id, user_role, joined_at, status')
      .eq('organization_id', organizationId)
      .eq('status', 'active')
      .in('user_role', ['staff', 'mentor']);

    if (userOrgsError) {
      console.error('Error fetching user organizations:', userOrgsError);
      return [];
    }

    if (!userOrgs || userOrgs.length === 0) {
      return [];
    }

    const userIds = userOrgs.map((org: any) => org.user_id);

    // Fetch profiles
    const { data: profiles, error: profilesError } = await (supabase as any)
      .from('profiles')
      .select(`
        id, email, first_name, last_name, phone, avatar_url, linkedin_url,
        website, bio, location, company, job_title
      `)
      .in('id', userIds);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return [];
    }

    // Fetch mentor data
    const { data: mentors, error: mentorsError } = await (supabase as any)
      .from('mentors')
      .select(`
        id, user_id, expertise, bio, linkedin_url, status,
        total_entrepreneurs, success_rate, rating, availability,
        max_projects, max_entrepreneurs, created_at
      `)
      .eq('organization_id', organizationId)
      .in('user_id', userIds)
      .eq('status', 'active');

    if (mentorsError) {
      console.error('Error fetching mentors:', mentorsError);
    }

    // Get mentor assignments to count current entrepreneurs
    const mentorIds = (mentors || []).map((m: any) => m.id);
    
    const { data: assignments, error: assignmentsError } = await (supabase as any)
      .from('mentor_assignments')
      .select('mentor_id, status')
      .eq('organization_id', organizationId)
      .in('mentor_id', mentorIds);

    if (assignmentsError) {
      console.error('Error fetching assignments:', assignmentsError);
    }

    // Count assignments per mentor
    const assignmentsMap: Record<string, { total: number; active: number; completed: number; recent: number }> = {};
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    (assignments || []).forEach((assignment: any) => {
      if (!assignmentsMap[assignment.mentor_id]) {
        assignmentsMap[assignment.mentor_id] = { total: 0, active: 0, completed: 0, recent: 0 };
      }
      assignmentsMap[assignment.mentor_id].total += 1;
      if (assignment.status === 'active') {
        assignmentsMap[assignment.mentor_id].active += 1;
      }
      if (assignment.status === 'completed') {
        assignmentsMap[assignment.mentor_id].completed += 1;
      }
    });

    // Check if mentors are also staff members
    const { data: staffMembers, error: staffError } = await (supabase as any)
      .from('staff')
      .select('user_id')
      .eq('organization_id', organizationId)
      .in('user_id', userIds)
      .eq('status', 'active');

    if (staffError) {
      console.error('Error checking staff status:', staffError);
    }

    const staffUserIds = new Set((staffMembers || []).map((s: any) => s.user_id));

    // Map mentor data by user_id
    const mentorDataMap: Record<string, any> = {};
    (mentors || []).forEach((mentor: any) => {
      mentorDataMap[mentor.user_id] = mentor;
    });

    // Combine all data
    const mentorsList = userOrgs.map((userOrg: any) => {
      const profile = profiles?.find((p: any) => p.id === userOrg.user_id);
      const mentorData = mentorDataMap[userOrg.user_id];
      const assignmentStats = mentorData ? assignmentsMap[mentorData.id] || { total: 0, active: 0, completed: 0, recent: 0 } : { total: 0, active: 0, completed: 0, recent: 0 };
      const isAlsoStaff = staffUserIds.has(userOrg.user_id);

      return {
        id: mentorData?.id || userOrg.user_id,
        user_id: userOrg.user_id,
        email: profile?.email || 'N/A',
        first_name: profile?.first_name || profile?.email?.split('@')[0] || '',
        last_name: profile?.last_name || '',
        phone: profile?.phone || '',
        user_role: userOrg.user_role,
        organization_id: organizationId,
        expertise: mentorData?.expertise || [],
        bio: mentorData?.bio || profile?.bio || '',
        linkedin_url: mentorData?.linkedin_url || profile?.linkedin_url || '',
        status: mentorData?.status || 'active',
        total_entrepreneurs: assignmentStats.total,
        success_rate: mentorData?.success_rate || 0,
        rating: mentorData?.rating || 0,
        current_entrepreneurs: assignmentStats.active,
        total_assignments: assignmentStats.total,
        completed_assignments: assignmentStats.completed,
        recent_assignments: assignmentStats.recent,
        availability: mentorData?.availability,
        max_projects: mentorData?.max_projects,
        max_entrepreneurs: mentorData?.max_entrepreneurs,
        created_at: mentorData?.created_at || userOrg.joined_at,
        joined_at: userOrg.joined_at,
        profile_bio: profile?.bio,
        profile_linkedin_url: profile?.linkedin_url,
        mentor_bio: mentorData?.bio,
        mentor_linkedin_url: mentorData?.linkedin_url,
        avatar_url: profile?.avatar_url,
        website: profile?.website,
        location: profile?.location,
        company: profile?.company,
        job_title: profile?.job_title,
        is_also_staff: isAlsoStaff
      };
    });

    console.log('✅ Successfully fetched', mentorsList.length, 'mentors using direct table queries');
    return mentorsList;

  } catch (error) {
    console.error('Error fetching organization mentors:', error);
    return [];
  }
};