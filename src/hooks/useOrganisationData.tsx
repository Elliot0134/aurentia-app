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
  InvitationCode
} from '@/types/organisationTypes';
import {
  getOrganisation,
  getOrganisationStats,
  getOrganisationMembers,
  getOrganisationProjects,
  getOrganisationInvitationCodes,
  createInvitationCode,
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
        
        // Les données du service correspondent maintenant aux types de l'interface
        const adaptedStats: OrganisationStats = {
          totalAdherents: serviceStats.totalEntrepreneurs,
          activeProjects: serviceStats.activeProjects,
          completedProjects: serviceStats.completedProjects,
          totalMentors: serviceStats.totalMentors,
          activeMentors: serviceStats.totalMentors, // Using totalMentors as activeMentors
          thisMonthSignups: serviceStats.newThisMonth, // Using newThisMonth as thisMonthSignups
          averageProjectDuration: 6.5, // TODO: Calculer la durée moyenne depuis les projets
          successRate: serviceStats.conversionRate, // Using conversionRate as successRate
          totalDeliverables: serviceStats.totalDeliverables,
          completedDeliverables: serviceStats.completedDeliverables
        };

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
        const members = await getOrganisationMembers(organisationId);
        
        // Adapter les données du service aux types de l'interface
        const adaptedAdherents: Adherent[] = members
          .filter(member => member.user_role === 'member') // Filtrer seulement les adhérents
          .map((member) => ({
            id: member.id,
            user_id: member.id,
            organisation_id: member.organization_id,
            first_name: member.first_name || member.email.split('@')[0],
            last_name: member.last_name || '',
            email: member.email,
            phone: member.phone || '',
            status: 'active',
            joined_at: member.created_at,
            mentor_id: null, // TODO: Implémenter le système de mentors depuis mentor_assignments
            project_count: member.projects_count || 0,
            completed_deliverables: 0, // TODO: Calculer depuis la table deliverables
            total_deliverables: 0, // TODO: Calculer depuis la table deliverables
            last_activity: member.created_at
          }));

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
        const orgProjects = await getOrganisationProjects(organisationId);
        
        // Use the Project type from service directly
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
        
        // Utiliser la nouvelle table mentors avec le service
        const { getOrganisationMentors } = await import('@/services/organisationService');
        const mentorData = await getOrganisationMentors(organisationId);

        // Adapter les données aux types Mentor
        const adaptedMentors: Mentor[] = mentorData.map((mentor: any) => ({
          id: mentor.id,
          user_id: mentor.user_id,
          organisation_id: mentor.organization_id,
          first_name: mentor.user?.first_name || mentor.user?.email?.split('@')[0] || '',
          last_name: mentor.user?.last_name || '',
          email: mentor.user?.email || '',
          expertise: mentor.expertise || ['Business Development'],
          bio: mentor.bio || 'Mentor de l\'organisation',
          status: mentor.status as 'active' | 'inactive' | 'pending',
          total_entrepreneurs: mentor.assignments?.[0]?.count || 0,
          success_rate: mentor.success_rate || 0,
          rating: mentor.rating || 0,
          invitation_code: null,
          joined_at: mentor.created_at
        }));

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
      const { getOrganisationEvents } = await import('@/services/organisationService');
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
      const { createEvent } = await import('@/services/organisationService');
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
      const { updateEvent: updateEventService } = await import('@/services/organisationService');
      await updateEventService(eventId, updates);
      await fetchEvents(); // Refresh la liste
    } catch (err) {
      console.error('Erreur lors de la mise à jour de l\'événement:', err);
    }
  }, [fetchEvents]);

  const deleteEvent = useCallback(async (eventId: string) => {
    try {
      const { deleteEvent: deleteEventService } = await import('@/services/organisationService');
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
        const { getOrganisationPartners } = await import('@/services/organisationService');
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
        role: code.type === 'organisation_member' ? 'entrepreneur' : 'mentor',
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

      const newCodeData = {
        code: codeData.code,
        type: serviceType as 'super_admin' | 'organisation_staff' | 'organisation_member',
        organization_id: organisationId,
        created_by: user.id,
        expires_at: codeData.expires_at || undefined,
        max_uses: codeData.max_uses
      };

      const serviceResult = await createInvitationCode(newCodeData);
      
      if (serviceResult) {
        // Adapter le résultat aux types de l'interface
        const newCode: InvitationCode = {
          id: serviceResult.id,
          code: serviceResult.code,
          organisation_id: serviceResult.organization_id,
          role: serviceResult.type === 'organisation_member' ? 'entrepreneur' : 'mentor',
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