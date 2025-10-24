/**
 * Consolidated analytics metrics hooks for organization analytics
 * Includes: Events, Resources, Engagement, and Staff metrics
 */

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { DateRange } from '@/components/organisation/analytics/TimeRangeFilter';

// ==================== EVENT METRICS ====================

export interface EventMetrics {
  totalEvents: number;
  upcomingEvents: number;
  pastEvents: number;
  recurringEvents: number;

  // By Type
  eventsByType: Array<{ type: string; count: number }>;

  // Attendance
  totalParticipants: number;
  averageParticipantsPerEvent: number;

  // Timeline
  eventsByMonth: Array<{ month: string; count: number }>;
}

export const useOrganisationEventMetrics = (dateRange?: DateRange) => {
  const { id: organisationId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<EventMetrics | null>(null);

  useEffect(() => {
    const fetchEventMetrics = async () => {
      if (!organisationId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { data: events, error: eventsError } = await supabase
          .from('organisation_events')
          .select('*')
          .eq('organization_id', organisationId);

        if (eventsError) throw eventsError;

        const allEvents = events || [];
        const now = new Date();

        const totalEvents = allEvents.length;
        const upcomingEvents = allEvents.filter(e => new Date(e.start_date) > now).length;
        const pastEvents = allEvents.filter(e => new Date(e.end_date) < now).length;
        const recurringEvents = allEvents.filter(e => e.is_recurring).length;

        // Events by type
        const typeCount: Record<string, number> = {};
        allEvents.forEach(e => {
          typeCount[e.type] = (typeCount[e.type] || 0) + 1;
        });
        const eventsByType = Object.entries(typeCount).map(([type, count]) => ({ type, count }));

        // Attendance
        const totalParticipants = allEvents.reduce((sum, e) =>
          sum + (e.participants?.length || 0), 0
        );
        const averageParticipantsPerEvent = totalEvents > 0
          ? totalParticipants / totalEvents
          : 0;

        // Events by month
        const monthlyData: Record<string, number> = {};
        allEvents.forEach(e => {
          const date = new Date(e.start_date);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
        });
        const eventsByMonth = Object.entries(monthlyData)
          .map(([month, count]) => ({ month, count }))
          .sort((a, b) => a.month.localeCompare(b.month))
          .slice(-12);

        setMetrics({
          totalEvents,
          upcomingEvents,
          pastEvents,
          recurringEvents,
          eventsByType,
          totalParticipants,
          averageParticipantsPerEvent,
          eventsByMonth
        });

      } catch (err) {
        console.error('Error fetching event metrics:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch event metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchEventMetrics();
  }, [organisationId, dateRange]);

  return { metrics, loading, error };
};

// ==================== RESOURCE METRICS ====================

export interface ResourceMetrics {
  totalResources: number;
  publishedResources: number;
  draftResources: number;

  // By Type
  resourcesByType: Array<{ type: string; count: number }>;

  // Engagement
  totalViews: number;
  totalShares: number;
  averageEngagementRate: number;

  // Top Content
  topResources: Array<{
    title: string;
    views: number;
    shares: number;
  }>;

  // Growth
  resourcesByMonth: Array<{ month: string; count: number }>;
}

export const useOrganisationResourceMetrics = (dateRange?: DateRange) => {
  const { id: organisationId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<ResourceMetrics | null>(null);

  useEffect(() => {
    const fetchResourceMetrics = async () => {
      if (!organisationId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { data: resources, error: resourcesError } = await supabase
          .from('organization_resources')
          .select('*')
          .eq('organization_id', organisationId);

        if (resourcesError) throw resourcesError;

        const allResources = resources || [];

        const totalResources = allResources.length;
        const publishedResources = allResources.filter(r => r.status === 'published').length;
        const draftResources = allResources.filter(r => r.status === 'draft').length;

        // By type
        const typeCount: Record<string, number> = {};
        allResources.forEach(r => {
          const type = r.resource_type || 'guide';
          typeCount[type] = (typeCount[type] || 0) + 1;
        });
        const resourcesByType = Object.entries(typeCount).map(([type, count]) => ({ type, count }));

        // Engagement (placeholder - would need actual tracking)
        const totalViews = 0;
        const totalShares = 0;
        const averageEngagementRate = 0;

        // Top resources (placeholder)
        const topResources: Array<{ title: string; views: number; shares: number }> = [];

        // Resources by month
        const monthlyData: Record<string, number> = {};
        allResources.forEach(r => {
          const date = new Date(r.created_at);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
        });
        const resourcesByMonth = Object.entries(monthlyData)
          .map(([month, count]) => ({ month, count }))
          .sort((a, b) => a.month.localeCompare(b.month))
          .slice(-12);

        setMetrics({
          totalResources,
          publishedResources,
          draftResources,
          resourcesByType,
          totalViews,
          totalShares,
          averageEngagementRate,
          topResources,
          resourcesByMonth
        });

      } catch (err) {
        console.error('Error fetching resource metrics:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch resource metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchResourceMetrics();
  }, [organisationId, dateRange]);

  return { metrics, loading, error };
};

// ==================== ENGAGEMENT METRICS ====================

export interface EngagementMetrics {
  // Messages
  totalConversations: number;
  activeConversations: number;
  totalMessages: number;
  averageResponseTime: number; // in minutes

  // Chatbot
  totalChatSessions: number;
  averageMessagesPerSession: number;

  // Platform Activity
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;

  // Knowledge Base
  knowledgeBaseItems: number;
  knowledgeBaseStorageUsed: number; // in MB
}

export const useOrganisationEngagementMetrics = (dateRange?: DateRange) => {
  const { id: organisationId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<EngagementMetrics | null>(null);

  useEffect(() => {
    const fetchEngagementMetrics = async () => {
      if (!organisationId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch conversations
        const { data: conversations, error: conversationsError } = await supabase
          .from('conversations')
          .select('*')
          .eq('organization_id', organisationId);

        if (conversationsError) throw conversationsError;

        // Fetch knowledge base items
        const { data: kbItems, error: kbError } = await supabase
          .from('organization_knowledge_base')
          .select('*')
          .eq('organization_id', organisationId);

        if (kbError) throw kbError;

        // Fetch chatbot conversations
        const { data: chatConversations, error: chatError } = await supabase
          .from('conversations')
          .select('id, messages:conversation_messages(count)')
          .eq('type', 'personal');

        if (chatError) throw chatError;

        const allConversations = conversations || [];
        const allKbItems = kbItems || [];

        // Message metrics
        const totalConversations = allConversations.length;
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const activeConversations = allConversations.filter(c =>
          c.last_message_at && new Date(c.last_message_at) > oneDayAgo
        ).length;

        // Placeholder values - would need actual message queries
        const totalMessages = 0;
        const averageResponseTime = 0;

        // Chatbot metrics
        const totalChatSessions = (chatConversations || []).length;
        const averageMessagesPerSession = 0; // Would calculate from messages

        // Platform activity (placeholder - would need login tracking)
        const dailyActiveUsers = 0;
        const weeklyActiveUsers = 0;
        const monthlyActiveUsers = 0;

        // Knowledge base metrics
        const knowledgeBaseItems = allKbItems.length;
        const knowledgeBaseStorageUsed = allKbItems.reduce((sum, item) =>
          sum + (item.file_size || 0), 0
        ) / (1024 * 1024); // Convert to MB

        setMetrics({
          totalConversations,
          activeConversations,
          totalMessages,
          averageResponseTime,
          totalChatSessions,
          averageMessagesPerSession,
          dailyActiveUsers,
          weeklyActiveUsers,
          monthlyActiveUsers,
          knowledgeBaseItems,
          knowledgeBaseStorageUsed
        });

      } catch (err) {
        console.error('Error fetching engagement metrics:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch engagement metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchEngagementMetrics();
  }, [organisationId, dateRange]);

  return { metrics, loading, error };
};

// ==================== STAFF METRICS ====================

export interface StaffMetrics {
  totalStaff: number;
  activeStaff: number;

  // By Role
  staffByRole: Array<{ role: string; count: number }>;

  // Dual Roles
  staffAlsoMentors: number;
  staffToEntrepreneurRatio: string;

  // Distribution
  staffByDepartment: Array<{ department: string; count: number }>;
}

export const useOrganisationStaffMetrics = (dateRange?: DateRange) => {
  const { id: organisationId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<StaffMetrics | null>(null);

  useEffect(() => {
    const fetchStaffMetrics = async () => {
      if (!organisationId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch staff
        const { data: staff, error: staffError } = await supabase
          .from('staff')
          .select('*')
          .eq('organization_id', organisationId);

        if (staffError) throw staffError;

        // Fetch adherents for ratio calculation
        const { data: adherents, error: adherentsError } = await supabase
          .from('adherents')
          .select('id')
          .eq('organization_id', organisationId)
          .eq('status', 'active');

        if (adherentsError) throw adherentsError;

        const allStaff = staff || [];
        const totalEntrepreneurs = (adherents || []).length;

        const totalStaff = allStaff.length;
        const activeStaff = allStaff.filter(s => s.status === 'active').length;

        // Staff by role
        const roleCount: Record<string, number> = {};
        allStaff.forEach(s => {
          roleCount[s.job_role] = (roleCount[s.job_role] || 0) + 1;
        });
        const staffByRole = Object.entries(roleCount).map(([role, count]) => ({ role, count }));

        // Dual roles
        const staffAlsoMentors = allStaff.filter(s => s.is_also_mentor).length;

        // Staff to entrepreneur ratio
        const staffToEntrepreneurRatio = activeStaff > 0
          ? `1:${Math.round(totalEntrepreneurs / activeStaff)}`
          : '0:0';

        // Department distribution (using job_role as department proxy)
        const staffByDepartment = staffByRole; // Same as by role for now

        setMetrics({
          totalStaff,
          activeStaff,
          staffByRole,
          staffAlsoMentors,
          staffToEntrepreneurRatio,
          staffByDepartment
        });

      } catch (err) {
        console.error('Error fetching staff metrics:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch staff metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchStaffMetrics();
  }, [organisationId, dateRange]);

  return { metrics, loading, error };
};
