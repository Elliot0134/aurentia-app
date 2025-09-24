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
  organization_id: string;
  created_by: string;
  is_active?: boolean;
  expires_at?: string;
  max_uses?: number;
  current_uses?: number;
  role?: string;
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
  const { data, error } = await (supabase as any)
    .rpc('get_organization_stats', { org_id: organizationId });

  if (error) {
    console.error('Error fetching organization stats:', error);
    return getDefaultStats();
  }
  
  return data || getDefaultStats();
};

// Service pour obtenir les membres d'une organisation
export const getOrganisationMembers = async (organizationId: string): Promise<OrganisationMember[]> => {
  console.log('🔍 Fetching members for organization:', organizationId);
  
  try {
    // Essayer d'abord avec user_organizations (nouveau système)
    // Faire deux requêtes séparées car pas de relation directe entre user_organizations et profiles
    const { data: userOrgData, error: userOrgError } = await (supabase as any)
      .from('user_organizations')
      .select(`
        id,
        user_id,
        organization_id,
        user_role,
        joined_at,
        status
      `)
      .eq('organization_id', organizationId)
      .eq('status', 'active')
      .in('user_role', ['member', 'staff', 'organisation']);

    console.log('👥 User Organizations query result:', userOrgData?.length || 0, userOrgError || 'no error');
    console.log('🔍 Raw userOrgData:', JSON.stringify(userOrgData, null, 2));
    console.log('❌ userOrgError details:', userOrgError);

    // Si on a des données depuis user_organizations, récupérer les profils séparément
    if (userOrgData && userOrgData.length > 0) {
      const userIds = userOrgData.map(item => item.user_id);
      
      // Récupérer les profils correspondants
      const { data: profilesData, error: profilesError } = await (supabase as any)
        .from('profiles')
        .select(`
          id,
          email,
          first_name,
          last_name,
          phone,
          created_at,
          invitation_code_used
        `)
        .in('id', userIds);

      console.log('👤 Profiles query result:', profilesData?.length || 0, profilesError || 'no error');
      
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      // Combiner user_organizations avec profiles
      const membersWithProfiles = userOrgData.map((userOrg: any) => ({
        ...userOrg,
        profiles: profilesData?.find((profile: any) => profile.id === userOrg.user_id) || null
      }));

      const members = membersWithProfiles.filter(item => item.profiles); // Garder seulement ceux avec profil
      console.log('✅ Using user_organizations data:', members.length, 'members found');
      console.log('🔍 Members with profiles:', members.map(m => ({ user_id: m.user_id, email: m.profiles?.email, has_profile: !!m.profiles })));
      
      // Récupérer le nombre de projets pour chaque membre
      const memberIds = members.map((member: any) => member.user_id);
      let projectsCount: { [key: string]: number } = {};

      if (memberIds.length > 0) {
        const { data: projectsData } = await supabase
          .from('project_summary')
          .select('user_id')
          .in('user_id', memberIds);

        projectsCount = (projectsData || []).reduce((acc: { [key: string]: number }, project: any) => {
          acc[project.user_id] = (acc[project.user_id] || 0) + 1;
          return acc;
        }, {});
      }

      console.log('📊 Projects count calculated:', projectsCount);

      return members.map((member: any) => ({
        id: member.profiles.id,
        email: member.profiles.email,
        first_name: member.profiles.first_name || member.profiles.email?.split('@')[0] || 'Prénom',
        last_name: member.profiles.last_name || '',
        phone: member.profiles.phone || '',
        user_role: member.user_role,
        organization_id: organizationId,
        projects_count: projectsCount[member.user_id] || 0,
        created_at: member.profiles.created_at || member.joined_at,
        invitation_code_used: member.profiles.invitation_code_used
      }));
    }

    // Fallback : utiliser l'ancien système profiles.organization_id
    console.log('⚠️ No data from user_organizations, trying profiles.organization_id fallback');
    
    const { data: profilesData, error: profilesError } = await (supabase as any)
      .from('profiles')
      .select(`
        id,
        email,
        first_name,
        last_name,
        phone,
        user_role,
        organization_id,
        created_at,
        invitation_code_used
      `)
      .eq('organization_id', organizationId)
      .in('user_role', ['member', 'staff', 'organisation']);

    console.log('👥 Profiles fallback query result:', profilesData?.length || 0, profilesError || 'no error');

    if (profilesError) {
      console.error('Error fetching organization members from profiles:', profilesError);
      return [];
    }

    // Récupérer le nombre de projets pour chaque membre (fallback)
    const memberIds = (profilesData || []).map((member: any) => member.id);
    let projectsCount: { [key: string]: number } = {};

    if (memberIds.length > 0) {
      const { data: projectsData } = await supabase
        .from('project_summary')
        .select('user_id')
        .in('user_id', memberIds);

      projectsCount = (projectsData || []).reduce((acc: { [key: string]: number }, project: any) => {
        acc[project.user_id] = (acc[project.user_id] || 0) + 1;
        return acc;
      }, {});
    }

    console.log('📊 Projects count calculated (fallback):', projectsCount);

    return (profilesData || []).map((member: any) => ({
      id: member.id,
      email: member.email,
      first_name: member.first_name || member.email?.split('@')[0] || 'Prénom',
      last_name: member.last_name || '',
      phone: member.phone || '',
      user_role: member.user_role,
      organization_id: organizationId,
      projects_count: projectsCount[member.id] || 0,
      created_at: member.created_at,
      invitation_code_used: member.invitation_code_used
    }));

  } catch (error) {
    console.error('Error in getOrganisationMembers:', error);
    return [];
  }
};

// Service pour obtenir les projets d'une organisation
export const getOrganisationProjects = async (organizationId: string): Promise<Project[]> => {
  try {
    console.log('🔍 Fetching projects for organization:', organizationId);
    
    // 1. Récupérer les projets directement liés à l'organisation
    const { data: linkedProjects, error: linkedError } = await (supabase as any)
      .from('form_business_idea')
      .select('user_id, project_id, nom_projet, project_sentence, created_at')
      .eq('organization_id', organizationId);

    console.log('📊 Linked projects found:', linkedProjects?.length || 0, linkedProjects);

    if (linkedError) {
      console.error('Error fetching linked projects:', linkedError);
    }

    // 2. Récupérer les projets des membres de l'organisation
    const { data: members } = await (supabase as any)
      .from('profiles')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('user_role', 'member');

    console.log('👥 Members found:', members?.length || 0, members?.map(m => m.id));

    let memberProjects: any[] = [];
    if (members && members.length > 0) {
      const memberIds = members.map((m: any) => m.id);
      const { data: memberProjectsData, error: memberError } = await (supabase as any)
        .from('project_summary')
        .select('id, user_id, nom_projet, description_synthetique, statut_project, avancement_global, created_at, updated_at')
        .in('user_id', memberIds);

      console.log('📈 Member projects found:', memberProjectsData?.length || 0);

      if (memberError) {
        console.error('Error fetching member projects:', memberError);
      } else {
        memberProjects = memberProjectsData || [];
      }
    }

    // Combiner et déduplicater les projets
    const allProjects = new Map();

    // Ajouter les projets directement liés
    if (linkedProjects) {
      linkedProjects.forEach((project: any) => {
        allProjects.set(project.project_id, {
          project_id: project.project_id,
          user_id: project.user_id,
          nom_projet: project.nom_projet,
          description_synthetique: project.project_sentence,
          statut: 'active',
          avancement_global: '0',
          progress: 0,
          created_at: project.created_at,
          updated_at: project.created_at,
          linked_to_organization: true
        });
      });
    }

    // Ajouter les projets des membres (en évitant les doublons)
    memberProjects.forEach((project: any) => {
      if (!allProjects.has(project.id)) {
        allProjects.set(project.id, {
          project_id: project.id,
          user_id: project.user_id,
          nom_projet: project.nom_projet,
          description_synthetique: project.description_synthetique,
          statut: project.statut_project || 'active',
          avancement_global: project.avancement_global,
          progress: project.avancement_global ? parseInt(project.avancement_global) : 0,
          created_at: project.created_at,
          updated_at: project.updated_at,
          linked_to_organization: false
        });
      }
    });

    const finalProjects = Array.from(allProjects.values());
    console.log('🎯 Total projects returned:', finalProjects.length, finalProjects.map(p => ({ 
      id: p.project_id, 
      name: p.nom_projet, 
      linked: p.linked_to_organization 
    })));
    
    return finalProjects;
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

// Service pour vérifier le statut d'onboarding d'une organisation
export const getOnboardingStatus = async (organizationId: string) => {
  const { data, error } = await (supabase as any)
    .from('organizations')
    .select('onboarding_completed, onboarding_step')
    .eq('id', organizationId)
    .single();

  if (error) {
    console.error('Error fetching onboarding status:', error);
    return { onboarding_completed: false, onboarding_step: 0 };
  }
  
  return {
    onboarding_completed: data?.onboarding_completed || false,
    onboarding_step: data?.onboarding_step || 0
  };
};

// Service pour marquer l'onboarding comme terminé
export const completeOnboarding = async (organizationId: string) => {
  const { data, error } = await (supabase as any)
    .from('organizations')
    .update({
      onboarding_completed: true,
      onboarding_step: 6, // Supposons 6 étapes d'onboarding
      updated_at: new Date().toISOString()
    })
    .eq('id', organizationId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Service pour sauvegarder une étape d'onboarding
export const saveOnboardingStep = async (organizationId: string, step: number, stepData: any) => {
  const { data, error } = await (supabase as any)
    .from('organizations')
    .update({
      ...stepData,
      onboarding_step: step,
      updated_at: new Date().toISOString()
    })
    .eq('id', organizationId)
    .select()
    .single();

  if (error) throw error;
  return data;
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
    // D'abord, récupérer les mentors depuis la table mentors
    const { data: mentorsData, error: mentorsError } = await (supabase as any)
      .from('mentors')
      .select(`
        id,
        user_id,
        organization_id,
        expertise,
        bio,
        linkedin_url,
        status,
        total_entrepreneurs,
        success_rate,
        rating,
        created_at,
        user:profiles!mentors_user_id_fkey(
          id,
          email,
          first_name,
          last_name,
          phone,
          user_role,
          created_at
        )
      `)
      .eq('organization_id', organizationId);

    let mentors = [];
    if (!mentorsError && mentorsData) {
      mentors = mentorsData.map((mentor: any) => ({
        id: mentor.id,
        user_id: mentor.user_id,
        email: mentor.user?.email || '',
        first_name: mentor.user?.first_name || mentor.user?.email?.split('@')[0] || '',
        last_name: mentor.user?.last_name || '',
        phone: mentor.user?.phone || '',
        user_role: mentor.user?.user_role || 'staff',
        organization_id: mentor.organization_id,
        expertise: mentor.expertise || [],
        bio: mentor.bio || '',
        linkedin_url: mentor.linkedin_url || '',
        status: mentor.status || 'active',
        total_entrepreneurs: mentor.total_entrepreneurs || 0,
        success_rate: mentor.success_rate || 0,
        rating: mentor.rating || 0,
        created_at: mentor.created_at,
        joined_at: mentor.created_at
      }));
    }

    // Ensuite, récupérer les propriétaires/admins d'organisation qui ne sont pas déjà dans la table mentors
    const { data: ownersData, error: ownersError } = await (supabase as any)
      .from('profiles')
      .select('id, email, first_name, last_name, phone, user_role, organization_id, created_at')
      .eq('organization_id', organizationId)
      .in('user_role', ['organisation', 'staff']);

    if (!ownersError && ownersData) {
      const existingMentorUserIds = mentors.map((m: any) => m.user_id);

      const owners = ownersData
        .filter((owner: any) => !existingMentorUserIds.includes(owner.id))
        .map((owner: any) => ({
          id: owner.id, // Utiliser l'ID du profil comme ID du mentor
          user_id: owner.id,
          email: owner.email,
          first_name: owner.first_name || owner.email.split('@')[0],
          last_name: owner.last_name || '',
          phone: owner.phone || '',
          user_role: owner.user_role,
          organization_id: owner.organization_id,
          expertise: [], // Vide par défaut
          bio: '', // Vide par défaut
          linkedin_url: '',
          status: 'active',
          total_entrepreneurs: 0, // TODO: compter depuis mentor_assignments
          success_rate: 0,
          rating: 0,
          created_at: owner.created_at,
          joined_at: owner.created_at
        }));

      mentors = [...mentors, ...owners];
    }

    return mentors;
  } catch (error) {
    console.error('Error fetching organization mentors:', error);
    return [];
  }
};