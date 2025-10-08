import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import {
  Organisation,
  Adherent,
  Mentor,
  OrganisationStats,
  Event,
  Partner,
  InvitationCode,
  UserOrganization
} from '@/types/organisationTypes';
import {
  getOrganisation,
  getOrganisationStats,
  getOrganisationMembers,
  getOrganisationProjects,
  getOrganisationInvitationCodes,
  createInvitationCode,
  getOrganisationMentors,
  getOrganisationEvents,
  createEvent,
  updateEvent as updateEventService,
  deleteEvent as deleteEventService,
  getOrganisationPartners,
  getOrganisationAdherents,
  getOrganisationMembersWithRole,
  getOrganisationProjectsWithStats,
  getOrganisationMentorsWithStats,
  type OrganisationData,
  type OrganisationMember,
  type Project,
  type InvitationCodeData
} from '@/services/organisationService';

// Hook principal pour la gestion des données d'organisation
export const useOrganisationData = () => {
  const { id: organisationId } = useParams();
  const [organisation, setOrganisation] = useState<Organisation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrganisation = useCallback(async () => {
    if (!organisationId) return;

    try {
      setLoading(true);
      const data = await getOrganisation(organisationId);
      
      if (data) {
        // Adapter les données du service aux types de l'interface
        const adaptedOrganisation: Organisation = {
          id: data.id,
          name: data.name,
          description: data.description || 'Aucune description disponible',
          logo: data.logo || '',
          website: data.website || '',
          email: data.email || '',
          phone: data.phone || '',  
          address: data.address || '',
          primary_color: data.primary_color,
          secondary_color: data.secondary_color,
          settings: data.settings || {
            branding: {
              primaryColor: data.primary_color || '#ff5932',
              secondaryColor: data.secondary_color || '#1a1a1a',
              whiteLabel: false
            },
            notifications: {
              emailNotifications: true,
              projectUpdates: true,
              mentorAssignments: true,
              weeklyReports: false,
              systemAlerts: true
            }
          },
          created_at: data.created_at,
          updated_at: data.updated_at || data.created_at
        };
        
        setOrganisation(adaptedOrganisation);
        setError(null);
      } else {
        setError('Organisation non trouvée');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, [organisationId]);

  useEffect(() => {
    fetchOrganisation();
  }, [fetchOrganisation]);

  return {
    organisation,
    loading,
    error,
    refetch: fetchOrganisation
  };
};

// Hook pour les statistiques d'organisation
export const useOrganisationStats = () => {
  const { id: organisationId } = useParams();
  const [stats, setStats] = useState<OrganisationStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!organisationId) return;

      try {
        setLoading(true);
        const serviceStats = await getOrganisationStats(organisationId);
        
        console.log('🔄 Raw stats from optimized service:', serviceStats);
        
        // The service now returns data in the correct format
        const adaptedStats: OrganisationStats = {
          totalAdherents: serviceStats.totalAdherents,
          activeProjects: serviceStats.activeProjects,
          completedProjects: serviceStats.completedProjects,
          totalMentors: serviceStats.totalMentors,
          activeMentors: serviceStats.totalMentors, // All mentors are considered active
          thisMonthSignups: serviceStats.newThisMonth,
          averageProjectDuration: 6.5, // TODO: Calculate from actual project data
          successRate: serviceStats.conversionRate,
          totalDeliverables: serviceStats.totalDeliverables,
          completedDeliverables: serviceStats.completedDeliverables
        };

        console.log('🎯 Final adapted stats:', adaptedStats);
        setStats(adaptedStats);
      } catch (err) {
        console.error('Erreur lors du chargement des statistiques:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [organisationId]);

  return { stats, loading };
};

// Hook pour les adhérents
export const useAdherents = () => {
  const { id: organisationId } = useParams();
  const [adherents, setAdherents] = useState<Adherent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdherents = async () => {
      if (!organisationId) return;

      try {
        setLoading(true);
        // Use the new simplified service function
        const adherentsData = await getOrganisationAdherents(organisationId);
        
        console.log('🔄 Raw adherents from optimized service:', adherentsData.length, adherentsData);
        
        // Adapter les données du service aux types de l'interface
        const adaptedAdherents: Adherent[] = adherentsData.map((adherent: any) => ({
          id: adherent.user_id,
          user_id: adherent.user_id,
          organisation_id: organisationId,
          first_name: adherent.first_name || adherent.email?.split('@')[0] || 'Prénom',
          last_name: adherent.last_name || '',
          email: adherent.email,
          phone: adherent.phone || '',
          avatar_url: adherent.avatar_url,
          linkedin_url: adherent.linkedin_url,
          website: adherent.website,
          bio: adherent.bio,
          location: adherent.location,
          company: adherent.company,
          job_title: adherent.job_title,
          program_type: adherent.program_type,
          cohort_year: adherent.cohort_year,
          training_budget: adherent.training_budget,
          availability_schedule: adherent.availability_schedule,
          monthly_credits_remaining: adherent.monthly_credits_remaining,
          purchased_credits_remaining: adherent.purchased_credits_remaining,
          status: adherent.activity_status === 'active' ? 'active' : 'inactive',
          joined_at: adherent.joined_at,
          mentor_id: null, // Will be populated from mentor assignments if available
          mentor_names: adherent.mentor_names || [],
          project_count: adherent.total_projects || 0,
          completed_deliverables: adherent.completed_deliverables || 0,
          total_deliverables: adherent.total_deliverables || 0,
          project_names: adherent.project_names || [],
          active_projects: adherent.active_projects || 0,
          completion_rate: adherent.completion_rate || 0,
          activity_status: adherent.activity_status,
          payment_status: adherent.payment_status || 'no_subscription',
          subscription_days_overdue: adherent.subscription_days_overdue || 0,
          last_payment_date: adherent.last_payment_date,
          next_payment_date: adherent.next_payment_date,
          subscription_amount: adherent.subscription_amount,
          last_activity: adherent.joined_at
        }));

        console.log('🎯 Final adapted adherents:', adaptedAdherents.length, adaptedAdherents);
        setAdherents(adaptedAdherents);
      } catch (err) {
        console.error('Erreur lors du chargement des adhérents:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdherents();
  }, [organisationId]);

  return { adherents, loading };
};

// Hook pour les projets
export const useProjects = () => {
  const { id: organisationId } = useParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!organisationId) return;

      try {
        setLoading(true);
        // Use the new optimized service function
        const orgProjects = await getOrganisationProjects(organisationId);
        
        console.log('🔄 Raw projects from optimized service:', orgProjects.length, orgProjects);
        
        // Projects are already properly formatted by the service
        setProjects(orgProjects);
      } catch (err) {
        console.error('Erreur lors du chargement des projets:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [organisationId]);

  return { projects, loading };
};

// Hook pour les mentors
export const useMentors = () => {
  const { id: organisationId } = useParams();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMentors = async () => {
      if (!organisationId) return;

      try {
        setLoading(true);
        
        // Fetch current user to check if they're the owner
        const { data: { user } } = await supabase.auth.getUser();
        
        // Fetch organization to get the owner
        const { data: orgData } = await (supabase as any)
          .from('organizations')
          .select('created_by')
          .eq('id', organisationId)
          .single();

        // Use the new optimized service function
        const mentorData = await getOrganisationMentors(organisationId);

        console.log('🔄 Raw mentors from optimized service:', mentorData.length, mentorData);

        // Adapter les données aux types Mentor
        let adaptedMentors: Mentor[] = mentorData.map((mentor: any) => ({
          id: mentor.id,
          user_id: mentor.user_id,
          organisation_id: organisationId,
          first_name: mentor.first_name || mentor.email?.split('@')[0] || '',
          last_name: mentor.last_name || '',
          email: mentor.email || '',
          phone: mentor.phone,
          avatar_url: mentor.avatar_url,
          linkedin_url: mentor.mentor_linkedin_url || mentor.profile_linkedin_url,
          website: mentor.website,
          bio: mentor.mentor_bio || mentor.profile_bio,
          location: mentor.location,
          company: mentor.company,
          job_title: mentor.job_title,
          expertise: mentor.expertise || ['Business Development'],
          mentor_bio: mentor.mentor_bio,
          availability: mentor.availability,
          max_projects: mentor.max_projects,
          max_entrepreneurs: mentor.max_entrepreneurs,
          status: mentor.status as 'active' | 'inactive' | 'pending',
          total_entrepreneurs: mentor.total_entrepreneurs || 0,
          success_rate: mentor.success_rate || 0,
          rating: mentor.rating || 0,
          invitation_code: null,
          joined_at: mentor.joined_at,
          user_role: mentor.user_role || 'staff',
          current_entrepreneurs: mentor.current_entrepreneurs || 0,
          total_assignments: mentor.total_assignments || 0,
          completed_assignments: mentor.completed_assignments || 0,
          recent_assignments: mentor.recent_assignments || 0
        }));

        // Check if the owner is already in the mentor list
        const ownerInList = adaptedMentors.find(m => m.user_id === orgData?.created_by);
        
        // If the owner is not in the list, fetch and add them
        if (orgData?.created_by && !ownerInList) {
          const { data: ownerProfile } = await (supabase as any)
            .from('profiles')
            .select('*')
            .eq('id', orgData.created_by)
            .single();

          if (ownerProfile) {
            // Check if owner has a mentor entry
            const { data: ownerMentor } = await (supabase as any)
              .from('mentors')
              .select('*')
              .eq('user_id', orgData.created_by)
              .eq('organization_id', organisationId)
              .single();

            const ownerMentorData: Mentor = {
              id: ownerMentor?.id || `owner-${orgData.created_by}`,
              user_id: orgData.created_by,
              organisation_id: organisationId,
              first_name: ownerProfile.first_name || ownerProfile.email?.split('@')[0] || '',
              last_name: ownerProfile.last_name || '',
              email: ownerProfile.email || '',
              expertise: ownerMentor?.expertise || ['Direction', 'Stratégie'],
              bio: ownerMentor?.bio || 'Fondateur de l\'organisation',
              status: 'active',
              total_entrepreneurs: ownerMentor?.total_entrepreneurs || 0,
              success_rate: ownerMentor?.success_rate || 0,
              rating: ownerMentor?.rating || 0,
              invitation_code: null,
              joined_at: ownerProfile.created_at,
              user_role: 'organisation',
              current_entrepreneurs: ownerMentor?.current_entrepreneurs || 0
            };

            // Add owner at the beginning of the list
            adaptedMentors = [ownerMentorData, ...adaptedMentors];
          }
        }

        console.log('🎯 Final adapted mentors:', adaptedMentors.length, adaptedMentors);
        setMentors(adaptedMentors);
      } catch (err) {
        console.error('Erreur lors du chargement des mentors:', err);
        setMentors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, [organisationId]);

  return { mentors, loading };
};

// Hook pour les événements
export const useEvents = () => {
  const { id: organisationId } = useParams();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    if (!organisationId) return;

    try {
      setLoading(true);
      
      // Utiliser la nouvelle table events avec le service
      const eventData = await getOrganisationEvents(organisationId);
      
      // Adapter les données aux types Event
            const adaptedEvents: Event[] = eventData.map((event: any) => ({
        id: event.id,
        organisation_id: event.organization_id,
        title: event.title,
        description: event.description || '',
        start: new Date(event.start_date),
        end: new Date(event.end_date),
        type: event.type as Event['type'],
        location: event.location || '',
        organizer_id: event.organizer_id || '',
        is_recurring: event.is_recurring || false,
        max_participants: event.max_participants,
        participants: event.participants || [],
        status: event.status || 'planned',
        created_at: event.created_at
      }));

      setEvents(adaptedEvents);
    } catch (err) {
      console.error('Erreur lors du chargement des événements:', err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [organisationId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const addEvent = useCallback(async (eventData: Omit<Event, 'id' | 'organisation_id'>) => {
    if (!organisationId) return null;

    try {
      const newEvent = await createEvent(organisationId, {
        title: eventData.title,
        description: eventData.description,
        start_date: eventData.start.toISOString(),
        end_date: eventData.end.toISOString(),
        type: eventData.type,
        location: eventData.location,
        max_participants: eventData.max_participants
      });

      if (newEvent) {
        await fetchEvents(); // Refresh la liste
      }

      return newEvent;
    } catch (err) {
      console.error('Erreur lors de la création de l\'événement:', err);
      return null;
    }
  }, [organisationId, fetchEvents]);

  const updateEvent = useCallback(async (eventId: string, updates: Partial<Event>) => {
    try {
      await updateEventService(eventId, updates);
      await fetchEvents(); // Refresh la liste
    } catch (err) {
      console.error('Erreur lors de la mise à jour de l\'événement:', err);
    }
  }, [fetchEvents]);

  const deleteEvent = useCallback(async (eventId: string) => {
    try {
      await deleteEventService(eventId);
      await fetchEvents(); // Refresh la liste
    } catch (err) {
      console.error('Erreur lors de la suppression de l\'événement:', err);
    }
  }, [fetchEvents]);

  return {
    events,
    loading,
    addEvent,
    updateEvent,
    deleteEvent,
    refetch: fetchEvents
  };
};

// Hook pour les partenaires
export const usePartners = () => {
  const { id: organisationId } = useParams();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPartners = async () => {
      if (!organisationId) return;

      try {
        setLoading(true);
        
        // Utiliser la nouvelle table partners avec le service
        const partnerData = await getOrganisationPartners(organisationId);
        
        // Adapter les données aux types Partner
        const adaptedPartners: Partner[] = partnerData.map((partner: any) => ({
          id: partner.id,
          organisation_id: partner.organization_id,
          name: partner.name,
          type: partner.type as 'investor' | 'accelerator' | 'incubator' | 'corporate' | 'government' | 'university',
          description: partner.description || '',
          logo: partner.logo || '',
          website: partner.website || '',
          email: partner.email || '',
          phone: partner.phone || '',
          collaboration_type: partner.collaboration_type || [],
          rating: partner.rating || 0,
          status: partner.status as 'active' | 'inactive' | 'prospect',
          created_at: partner.created_at
        }));

        setPartners(adaptedPartners);
      } catch (err) {
        console.error('Erreur lors du chargement des partenaires:', err);
        setPartners([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, [organisationId]);

  return { partners, loading };
};

// Hook pour les codes d'invitation
export const useInvitationCodes = () => {
  const { id: organisationId } = useParams();
  const [codes, setCodes] = useState<InvitationCode[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCodes = useCallback(async () => {
    if (!organisationId) return;

    try {
      setLoading(true);
      const invitationCodes = await getOrganisationInvitationCodes(organisationId);
      
      // Adapter les données du service aux types de l'interface
      const adaptedCodes: InvitationCode[] = invitationCodes.map((code: any) => ({
        id: code.id,
        code: code.code,
        organisation_id: code.organization_id,
        // Use assigned_role if available, otherwise fallback to type mapping
        role: code.assigned_role === 'entrepreneur' ? 'entrepreneur' : 
              code.assigned_role === 'mentor' ? 'mentor' :
              code.type === 'organisation_member' ? 'entrepreneur' : 'mentor',
        created_by: code.created_by,
        created_at: code.created_at,
        expires_at: code.expires_at || null,
        max_uses: code.max_uses,
        current_uses: code.current_uses,
        is_active: code.is_active
      }));

      setCodes(adaptedCodes);
    } catch (err) {
      console.error('Erreur lors du chargement des codes:', err);
    } finally {
      setLoading(false);
    }
  }, [organisationId]);

  useEffect(() => {
    fetchCodes();
  }, [fetchCodes]);

  const generateCode = useCallback(async (codeData: Omit<InvitationCode, 'id' | 'organisation_id' | 'created_at' | 'current_uses'>) => {
    if (!organisationId) return null;

    try {
      // Récupérer l'utilisateur actuel
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('Utilisateur non connecté');
        return null;
      }

      // Adapter le type de rôle pour le service - utiliser le nouveau mapping
      const serviceType = codeData.role === 'entrepreneur' ? 'organisation_member' : 'organisation_staff';
      
      // Map role to assigned_role for database
      const assignedRole = codeData.role === 'entrepreneur' ? 'entrepreneur' : 'mentor';

      const newCodeData = {
        code: codeData.code,
        type: serviceType as 'super_admin' | 'organisation_staff' | 'organisation_member',
        organization_id: organisationId,
        created_by: user.id,
        expires_at: codeData.expires_at || undefined,
        max_uses: codeData.max_uses,
        assigned_role: assignedRole as 'individual' | 'member' | 'staff' | 'organisation' | 'super_admin' | 'entrepreneur' | 'mentor'
      };

      const serviceResult = await createInvitationCode(newCodeData);
      
      if (serviceResult) {
        // Adapter le résultat aux types de l'interface
        const newCode: InvitationCode = {
          id: serviceResult.id,
          code: serviceResult.code,
          organisation_id: serviceResult.organization_id,
          role: serviceResult.assigned_role === 'entrepreneur' ? 'entrepreneur' : 'mentor',
          created_by: serviceResult.created_by,
          created_at: serviceResult.created_at,
          expires_at: serviceResult.expires_at || null,
          max_uses: serviceResult.max_uses,
          current_uses: serviceResult.current_uses,
          is_active: serviceResult.is_active
        };
        
        // Mettre à jour l'état local
        setCodes(prev => [...prev, newCode]);
        
        return newCode;
      }
      
      return null;
    } catch (error) {
      console.error('Erreur lors de la génération du code:', error);
      return null;
    }
  }, [organisationId]);

  return {
    codes,
    loading,
    generateCode,
    refetch: fetchCodes
  };
};

// Hook pour les organisations d'un utilisateur (support multi-org pour staff)
export const useUserOrganizations = () => {
  const [userOrganizations, setUserOrganizations] = useState<UserOrganization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserOrganizations = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError('Utilisateur non connecté');
        return;
      }

      const { data, error: fetchError } = await (supabase as any)
        .from('user_organizations')
        .select(`
          id,
          user_id,
          organization_id,
          user_role,
          joined_at,
          is_primary,
          status,
          created_at,
          updated_at,
          organizations (
            id,
            name,
            description,
            logo_url,
            primary_color,
            secondary_color
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('is_primary', { ascending: false })
        .order('joined_at', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      const adaptedOrganizations: UserOrganization[] = data.map((item: any) => ({
        id: item.id,
        user_id: item.user_id,
        organization_id: item.organization_id,
        user_role: item.user_role,
        joined_at: item.joined_at,
        is_primary: item.is_primary,
        status: item.status,
        created_at: item.created_at,
        updated_at: item.updated_at,
        organization: item.organizations ? {
          id: item.organizations.id,
          name: item.organizations.name,
          description: item.organizations.description,
          logo: item.organizations.logo_url,
          primary_color: item.organizations.primary_color,
          secondary_color: item.organizations.secondary_color,
          created_at: '',
          updated_at: ''
        } : undefined
      }));

      setUserOrganizations(adaptedOrganizations);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des organisations');
      console.error('Erreur lors du chargement des organisations utilisateur:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserOrganizations();
  }, [fetchUserOrganizations]);

  const switchToOrganization = useCallback(async (organizationId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Mettre à jour l'organisation primaire
      await (supabase as any)
        .from('user_organizations')
        .update({ is_primary: false })
        .eq('user_id', user.id);

      await (supabase as any)
        .from('user_organizations')
        .update({ is_primary: true })
        .eq('user_id', user.id)
        .eq('organization_id', organizationId);

      // Recharger les organisations
      await fetchUserOrganizations();
      return true;
    } catch (err) {
      console.error('Erreur lors du changement d\'organisation:', err);
      return false;
    }
  }, [fetchUserOrganizations]);

  return {
    userOrganizations,
    loading,
    error,
    refetch: fetchUserOrganizations,
    switchToOrganization
  };
};