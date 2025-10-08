import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export interface AdvancedAnalyticsData {
  // Données des tables principales
  projects: any[];
  adherents: any[];
  mentors: any[];
  mentorAssignments: any[];
  organization: any | null;
  
  // Données dérivées des livrables
  businessModels: any[];
  pitches: any[];
  visionMissions: any[];
  marketAnalyses: any[];
  concurrences: any[];
  ressources: any[];
  juridiques: any[];
  personas: any[];
  scores: any[];
  deliverables: any[];
  
  // Données d'engagement
  conversations: any[];
  messages: any[];
  events: any[];
  partners: any[];
  
  // Données de paiement
  paymentIntents: any[];
  subscriptions: any[];
  
  // Données d'invitation
  invitationCodes: any[];
  formTemplates: any[];
  formSubmissions: any[];
}

export interface AdvancedMetrics {
  // Métriques de base
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  draftProjects: number;
  totalAdherents: number;
  totalMentors: number;
  activeMentorAssignments: number;
  totalMentorAssignments: number;
  
  // Métriques de livrables
  totalBusinessModels: number;
  totalPitches: number;
  totalVisionMissions: number;
  totalMarketAnalyses: number;
  totalConcurrences: number;
  totalRessources: number;
  totalJuridiques: number;
  totalPersonas: number;
  totalScores: number;
  totalDeliverables: number;
  completedDeliverables: number;
  approvedDeliverables: number;
  
  // Métriques d'engagement
  totalConversations: number;
  totalMessages: number;
  avgMessagesPerConversation: number;
  totalEvents: number;
  totalEventParticipations: number;
  avgParticipantsPerEvent: number;
  upcomingEvents: number;
  pastEvents: number;
  totalPartners: number;
  activePartners: number;
  partnerTypes: Record<string, number>;
  
  // Métriques de croissance
  monthlyGrowth: {
    projects: number;
    entrepreneurs: number;
    businessModels: number;
    conversations: number;
    deliverables: number;
    partners: number;
  };
  
  // Taux et pourcentages
  completionRates: {
    businessModel: number;
    pitch: number;
    visionMission: number;
    marketAnalysis: number;
  };
  averageScore: number;
  projectSuccessRate: number;
  avgProjectProgress: number;
  
  // Données pour les graphiques
  monthlyActivity: Array<{
    month: string;
    projects: number;
    entrepreneurs: number;
    conversations: number;
    events: number;
    deliverables: number;
    partners: number;
  }>;
  personaTypes: Record<string, number>;
  
  // Métriques financières
  totalPaymentIntents: number;
  successfulPayments: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  
  // Métriques d'invitation
  totalInvitationCodes: number;
  activeInvitationCodes: number;
  usedInvitationCodes: number;
  formTemplates: number;
  formSubmissions: number;
  reviewedSubmissions: number;
  approvedSubmissions: number;
  rejectedSubmissions: number;
  onboardingCompleted: boolean;
  onboardingStep: number;
}

export type TimeRangeKey =
  | "24h"
  | "48h"
  | "7days"
  | "14days"
  | "1month"
  | "3months"
  | "6months"
  | "12months"
  | "all";

export const useAdvancedAnalytics = (timeRange: TimeRangeKey = "6months") => {
  const { id: organisationId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AdvancedAnalyticsData>({
    projects: [],
    adherents: [],
    mentors: [],
    mentorAssignments: [],
    organization: null,
    businessModels: [],
    pitches: [],
    visionMissions: [],
    marketAnalyses: [],
    concurrences: [],
    ressources: [],
    juridiques: [],
    personas: [],
    scores: [],
    deliverables: [],
    conversations: [],
    messages: [],
    events: [],
    partners: [],
    paymentIntents: [],
    subscriptions: [],
    invitationCodes: [],
    formTemplates: [],
    formSubmissions: []
  });

  const loadAdvancedData = async () => {
    if (!organisationId) return;

    try {
      setLoading(true);
      setError(null);

      // Récupérer les IDs des membres de l'organisation
      const { data: members } = await (supabase as any)
        .from('profiles')
        .select('id')
        .eq('organization_id', organisationId);

      if (!members || members.length === 0) {
        setData({
          projects: [],
          adherents: [],
          mentors: [],
          mentorAssignments: [],
          organization: null,
          businessModels: [],
          pitches: [],
          visionMissions: [],
          marketAnalyses: [],
          concurrences: [],
          ressources: [],
          juridiques: [],
          personas: [],
          scores: [],
          conversations: [],
          messages: [],
          paymentIntents: [],
          subscriptions: [],
          invitationCodes: [],
          events: [],
          deliverables: [],
          partners: [],
          formTemplates: [],
          formSubmissions: []
        });
        setLoading(false);
        return;
      }

      const memberIds = members.map((m: any) => m.id);

      // Charger toutes les données en parallèle
      const [
        businessModelsData,
        pitchesData,
        visionMissionsData,
        marketAnalysesData,
        concurrencesData,
        ressourcesData,
        juridiquesData,
        personasB2BData,
        personasB2CData,
        personasOrganismesData,
        scoresData,
        conversationsData,
        messagesData,
        paymentIntentsData,
        subscriptionsData,
        invitationCodesData,
        projectsData,
        entrepreneursData,
        eventsData,
        deliverablesData,
        partnersData,
        mentorsData,
        mentorAssignmentsData,
        formTemplatesData,
        formSubmissionsData,
        organizationData
      ] = await Promise.all([
        supabase.from('business_model').select('*').in('user_id', memberIds),
        supabase.from('pitch').select('*').in('user_id', memberIds),
        supabase.from('vision_mission_valeurs').select('*').in('user_id', memberIds),
        supabase.from('marche').select('*').in('user_id', memberIds),
        supabase.from('concurrence').select('*').in('user_id', memberIds),
        supabase.from('ressources_requises').select('*').in('user_id', memberIds),
        supabase.from('juridique').select('*').in('user_id', memberIds),
        supabase.from('persona_express_b2b').select('*').in('user_id', memberIds),
        supabase.from('persona_express_b2c').select('*').in('user_id', memberIds),
        supabase.from('persona_express_organismes').select('*').in('user_id', memberIds),
        (supabase as any).from('score_projet').select('*').in('user_id', memberIds),
        supabase.from('conversation').select('*').in('user_id', memberIds),
        supabase.from('messages').select('*').in('user_id', memberIds),
        (supabase as any).from('payment_intents').select('*').in('user_id', memberIds).then((res: any) => res || { data: [] }),
        (supabase as any).from('stripe_subscriptions').select('*').in('user_id', memberIds).then((res: any) => res || { data: [] }),
        (supabase as any).from('invitation_code').select('*').eq('organization_id', organisationId).then((res: any) => res || { data: [] }),
        supabase.from('project_summary').select('*').in('user_id', memberIds),
        (supabase as any).from('profiles').select('*').in('id', memberIds),
        (supabase as any).from('events').select('*').eq('organization_id', organisationId).then((res: any) => res || { data: [] }),
        (supabase as any).from('deliverables').select('*').eq('organization_id', organisationId).then((res: any) => res || { data: [] }),
        (supabase as any).from('partners').select('*').eq('organization_id', organisationId).then((res: any) => res || { data: [] }),
        (supabase as any).from('mentors').select('*').eq('organization_id', organisationId).then((res: any) => res || { data: [] }),
        (supabase as any).from('mentor_assignments').select('*').then((res: any) => res || { data: [] }),
        (supabase as any).from('form_templates').select('*').eq('organization_id', organisationId).then((res: any) => res || { data: [] }),
        (supabase as any).from('form_submissions').select('*').then((res: any) => res || { data: [] }),
        (supabase as any).from('organizations').select('*').eq('id', organisationId).single().then((res: any) => res || { data: null })
      ]);

      const newData: AdvancedAnalyticsData = {
        projects: projectsData.data || [],
        adherents: entrepreneursData.data || [],
        mentors: mentorsData.data || [],
        mentorAssignments: mentorAssignmentsData.data || [],
        organization: organizationData.data || null,
        businessModels: businessModelsData.data || [],
        pitches: pitchesData.data || [],
        visionMissions: visionMissionsData.data || [],
        marketAnalyses: marketAnalysesData.data || [],
        concurrences: concurrencesData.data || [],
        ressources: ressourcesData.data || [],
        juridiques: juridiquesData.data || [],
        personas: [
          ...(personasB2BData.data || []).map((p: any) => ({ ...p, type: 'B2B' })),
          ...(personasB2CData.data || []).map((p: any) => ({ ...p, type: 'B2C' })),
          ...(personasOrganismesData.data || []).map((p: any) => ({ ...p, type: 'Organismes' }))
        ],
        scores: scoresData.data || [],
        conversations: conversationsData.data || [],
        messages: messagesData.data || [],
        events: eventsData.data || [],
        paymentIntents: paymentIntentsData.data || [],
        subscriptions: subscriptionsData.data || [],
        invitationCodes: invitationCodesData.data || [],
        deliverables: deliverablesData.data || [],
        partners: partnersData.data || [],
        formTemplates: formTemplatesData.data || [],
        formSubmissions: formSubmissionsData.data || []
      };

      setData(newData);

    } catch (err) {
      console.error('Erreur lors du chargement des données étendues:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdvancedData();
  }, [organisationId, timeRange]);

  // Calcul des métriques
  const metrics = useMemo((): AdvancedMetrics => {
    const now = new Date();
    // Compute cutoff based on flexible ranges
    const getCutoff = (): Date => {
      switch (timeRange) {
        case "24h": {
          const d = new Date(now);
          d.setDate(d.getDate() - 1);
          return d;
        }
        case "48h": {
          const d = new Date(now);
          d.setDate(d.getDate() - 2);
          return d;
        }
        case "7days": {
          const d = new Date(now);
          d.setDate(d.getDate() - 7);
          return d;
        }
        case "14days": {
          const d = new Date(now);
          d.setDate(d.getDate() - 14);
          return d;
        }
        case "1month":
          return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        case "3months":
          return new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        case "6months":
          return new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        case "12months":
          return new Date(now.getFullYear(), now.getMonth() - 12, now.getDate());
        case "all":
        default:
          return new Date(0); // Très ancienne date pour tout inclure
      }
    };
    const cutoffDate = getCutoff();

    // Filtrer les données selon la période
    const filterByDate = (items: any[], dateField = 'created_at') => 
      items.filter(item => new Date(item[dateField] || item.created_at) >= cutoffDate);

    const recentProjects = filterByDate(data.projects);
    const recentAdherents = filterByDate(data.adherents);
    const recentBusinessModels = filterByDate(data.businessModels);
    const recentConversations = filterByDate(data.conversations);

    // Métriques de base
    const totalProjects = data.projects.length;
    const activeProjects = data.projects.filter(p => p.statut === 'active' || p.statut === 'actif' || p.statut_project === 'active' || p.statut_project === 'actif').length;
    const completedProjects = data.projects.filter(p => p.statut === 'completed' || p.statut === 'terminé' || p.statut_project === 'completed' || p.statut_project === 'terminé').length;
    const draftProjects = data.projects.filter(p => p.statut === 'draft' || p.statut === 'brouillon' || p.statut_project === 'draft' || p.statut_project === 'brouillon').length;

    // Métriques d'engagement
    const totalConversations = data.conversations.length;
    const totalMessages = data.messages.length;
    const avgMessagesPerConversation = totalConversations > 0 ? totalMessages / totalConversations : 0;

    // Métriques d'événements
    const totalEvents = data.events.length;
    const totalEventParticipations = data.events.reduce((acc, event) => {
      return acc + (event.participants ? event.participants.length : 0);
    }, 0);
    const avgParticipantsPerEvent = totalEvents > 0 ? totalEventParticipations / totalEvents : 0;
    const upcomingEvents = data.events.filter(event => new Date(event.start_date) > now).length;
    const pastEvents = data.events.filter(event => new Date(event.end_date) < now).length;

    // Métriques de livrables
    const totalBusinessModels = data.businessModels.length;
    const totalPitches = data.pitches.length;
    const totalVisionMissions = data.visionMissions.length;
    const totalMarketAnalyses = data.marketAnalyses.length;

    // Taux de complétion des livrables
    const completionRates = {
      businessModel: totalProjects > 0 ? (totalBusinessModels / totalProjects) * 100 : 0,
      pitch: totalProjects > 0 ? (totalPitches / totalProjects) * 100 : 0,
      visionMission: totalProjects > 0 ? (totalVisionMissions / totalProjects) * 100 : 0,
      marketAnalysis: totalProjects > 0 ? (totalMarketAnalyses / totalProjects) * 100 : 0
    };

    // Métriques de croissance
    const recentDeliverables = filterByDate(data.deliverables);
    const recentPartners = filterByDate(data.partners);
    const monthlyGrowth = {
      projects: recentProjects.length,
      entrepreneurs: recentAdherents.length,
      businessModels: recentBusinessModels.length,
      conversations: recentConversations.length,
      deliverables: recentDeliverables.length,
      partners: recentPartners.length
    };

    // Scores moyens
    const avgScores = data.scores.reduce((acc, score) => {
      if (score.score_final) {
        acc.total += score.score_final;
        acc.count += 1;
      }
      return acc;
    }, { total: 0, count: 0 });

    const averageScore = avgScores.count > 0 ? avgScores.total / avgScores.count : 0;

    // Répartition des types de personas
    const personaTypes = data.personas.reduce((acc, persona) => {
      acc[persona.type] = (acc[persona.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Activité agrégée selon la granularité adaptée à la période
    type Bucket = { label: string; start: Date; end: Date };
    const buildBuckets = (): Bucket[] => {
      const buckets: Bucket[] = [];
      if (timeRange === "24h") {
        for (let i = 23; i >= 0; i--) {
          const start = new Date(now);
          start.setHours(now.getHours() - i, 0, 0, 0);
          const end = new Date(start);
          end.setHours(start.getHours() + 1);
          buckets.push({
            label: start.toLocaleTimeString('fr-FR', { hour: '2-digit' }),
            start,
            end,
          });
        }
      } else if (timeRange === "7days" || timeRange === "14days") {
        const days = timeRange === "7days" ? 7 : 14;
        for (let i = days - 1; i >= 0; i--) {
          const start = new Date(now);
          start.setHours(0, 0, 0, 0);
          start.setDate(now.getDate() - i);
          const end = new Date(start);
          end.setDate(start.getDate() + 1);
          buckets.push({
            label: start.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit' }),
            start,
            end,
          });
        }
      } else {
        // weekly buckets for 1-3 months, monthly for 6-12 months
        const months = timeRange === "1month" ? 1 : timeRange === "3months" ? 3 : timeRange === "6months" ? 6 : 12;
        if (months <= 3) {
          // last N weeks
          const weeks = months * 4; // approx
          for (let i = weeks - 1; i >= 0; i--) {
            const end = new Date(now);
            end.setHours(0, 0, 0, 0);
            end.setDate(end.getDate() - (i * 7));
            const start = new Date(end);
            start.setDate(end.getDate() - 7);
            buckets.push({
              label: `${start.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}`,
              start,
              end,
            });
          }
        } else {
          // last N months
          for (let i = months - 1; i >= 0; i--) {
            const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
            buckets.push({
              label: start.toLocaleDateString('fr-FR', { month: 'short' }),
              start,
              end,
            });
          }
        }
      }
      return buckets;
    };

    const buckets = buildBuckets();

    const inBucket = (d: Date, b: Bucket) => d >= b.start && d < b.end;
    const monthlyActivity = buckets.map((b) => {
      const projects = data.projects.filter((p) => inBucket(new Date(p.created_at), b)).length;
      const entrepreneurs = data.adherents.filter((e) => inBucket(new Date(e.created_at), b)).length;
      const conversations = data.conversations.filter((c) => inBucket(new Date(c.created_at), b)).length;
      const events = data.events.filter((e) => inBucket(new Date(e.created_at), b)).length;
      const deliverables = data.deliverables.filter((d) => inBucket(new Date(d.created_at), b)).length;
      const partners = data.partners.filter((p) => inBucket(new Date(p.created_at), b)).length;
      return { month: b.label, projects, entrepreneurs, conversations, events, deliverables, partners };
    });

    const totalDeliverables = data.deliverables.length;
    const completedDeliverables = data.deliverables.filter(d => ['completed', 'approved'].includes(d.status)).length;
    const approvedDeliverables = data.deliverables.filter(d => d.status === 'approved').length;

    const mentorAssignmentsActive = data.mentorAssignments.filter(a => a.status === 'active').length;
    const partnerTypes = data.partners.reduce((acc, p) => { acc[p.type] = (acc[p.type] || 0) + 1; return acc; }, {} as Record<string, number>);

    const formTemplatesCount = data.formTemplates.length;
    const formSubmissionsCount = data.formSubmissions.length;
    const reviewedSubmissions = data.formSubmissions.filter(s => ['reviewed', 'approved', 'rejected'].includes(s.status)).length;
    const approvedSubmissions = data.formSubmissions.filter(s => s.status === 'approved').length;
    const rejectedSubmissions = data.formSubmissions.filter(s => s.status === 'rejected').length;

    // Progression moyenne des projets (si colonnes présentes)
    let avgProjectProgress = 0;
    try {
      const progressValues = data.projects
        .map(p => p.avancement_global || p.progress || 0)
        .filter((v: any) => typeof v === 'number');
      if (progressValues.length > 0) {
        avgProjectProgress = progressValues.reduce((a: number, b: number) => a + b, 0) / progressValues.length;
      }
    } catch {}

    return {
      // Métriques de base
      totalProjects,
      activeProjects,
      completedProjects,
      draftProjects,
      totalAdherents: data.adherents.length,
      totalMentors: data.mentors.length,
      activeMentorAssignments: mentorAssignmentsActive,
      totalMentorAssignments: data.mentorAssignments.length,
      
      // Métriques de livrables
      totalBusinessModels,
      totalPitches,
      totalVisionMissions,
      totalMarketAnalyses,
      totalConcurrences: data.concurrences.length,
      totalRessources: data.ressources.length,
      totalJuridiques: data.juridiques.length,
      totalPersonas: data.personas.length,
      totalScores: data.scores.length,
      totalDeliverables,
      completedDeliverables,
      approvedDeliverables,
      
      // Métriques d'engagement
      totalConversations,
      totalMessages,
      avgMessagesPerConversation,
      totalEvents,
      totalEventParticipations,
      avgParticipantsPerEvent,
      upcomingEvents,
      pastEvents,
      totalPartners: data.partners.length,
      activePartners: data.partners.filter(p => p.status === 'active').length,
      partnerTypes,
      
      // Métriques de croissance
      monthlyGrowth,
      
      // Taux et pourcentages
      completionRates,
      averageScore,
      projectSuccessRate: totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0,
      avgProjectProgress,
      
      // Données pour les graphiques
      monthlyActivity,
      personaTypes,
      
      // Métriques financières
      totalPaymentIntents: data.paymentIntents.length,
      successfulPayments: data.paymentIntents.filter(p => p.status === 'completed').length,
      totalSubscriptions: data.subscriptions.length,
      activeSubscriptions: data.subscriptions.filter(s => s.status === 'active').length,
      
      // Métriques d'invitation
      totalInvitationCodes: data.invitationCodes.length,
      activeInvitationCodes: data.invitationCodes.filter(c => c.is_active).length,
      usedInvitationCodes: data.invitationCodes.filter(c => c.current_uses > 0).length,
      formTemplates: formTemplatesCount,
      formSubmissions: formSubmissionsCount,
      reviewedSubmissions,
      approvedSubmissions,
      rejectedSubmissions,
      onboardingCompleted: !!data.organization?.onboarding_completed,
      onboardingStep: data.organization?.onboarding_step ?? 0
    };
  }, [data, timeRange]);

  return {
    data,
    metrics,
    loading,
    error,
    refetch: loadAdvancedData
  };
};