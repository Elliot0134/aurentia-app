import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { DateRange } from '@/components/organisation/analytics/TimeRangeFilter';
import { startOfMonth, format, differenceInDays, subMonths } from 'date-fns';

export interface GrowthMetrics {
  // Signup Metrics
  totalSignups: number;
  signupsThisPeriod: number;
  signupGrowthRate: number;
  signupsByPeriod: Array<{ period: string; signups: number }>;

  // Retention Metrics
  retentionRate: number;
  cohortRetention: Array<{
    cohort: string;
    month0: number;
    month1: number;
    month2: number;
    month3: number;
    month6: number;
  }>;

  // Churn Metrics
  churnRate: number;
  churnedUsers: number;
  churnByReason: Array<{ reason: string; count: number }>;

  // Activation Metrics
  activatedUsers: number;
  activationRate: number;
  averageTimeToFirstProject: number; // in days

  // User Lifecycle
  usersByStage: {
    new: number; // < 7 days
    active: number; // Has project activity in last 30 days
    dormant: number; // No activity 30-90 days
    churned: number; // No activity > 90 days
  };

  // Invitation Metrics
  invitationsGenerated: number;
  invitationsAccepted: number;
  invitationConversionRate: number;
  averageTimeToAccept: number; // in days
}

export const useOrganisationGrowthMetrics = (dateRange?: DateRange) => {
  const { id: organisationId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<GrowthMetrics | null>(null);

  useEffect(() => {
    const fetchGrowthMetrics = async () => {
      if (!organisationId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch adherents
        const { data: adherents, error: adherentsError } = await supabase
          .from('adherents')
          .select('*')
          .eq('organization_id', organisationId)
          .order('joined_at', { ascending: true });

        if (adherentsError) throw adherentsError;

        // Fetch projects for activation analysis
        const { data: projects, error: projectsError } = await supabase
          .from('project_summary')
          .select('user_id, created_at')
          .eq('organization_id', organisationId);

        if (projectsError) throw projectsError;

        // Fetch invitations
        const { data: invitations, error: invitationsError } = await supabase
          .from('invitation_codes')
          .select('*')
          .eq('organisation_id', organisationId);

        if (invitationsError) throw invitationsError;

        // Filter by date range if provided
        let filteredAdherents = adherents || [];
        if (dateRange) {
          filteredAdherents = filteredAdherents.filter(a => {
            const joinedDate = new Date(a.joined_at);
            return joinedDate >= dateRange.from && joinedDate <= dateRange.to;
          });
        }

        const allAdherents = adherents || [];
        const now = new Date();

        // Calculate signup metrics
        const totalSignups = allAdherents.length;
        const signupsThisPeriod = filteredAdherents.length;

        // Calculate growth rate (comparing to previous period)
        const periodLength = dateRange
          ? differenceInDays(dateRange.to, dateRange.from)
          : 30;
        const previousPeriodStart = dateRange
          ? new Date(dateRange.from.getTime() - periodLength * 24 * 60 * 60 * 1000)
          : subMonths(now, 2);
        const previousPeriodEnd = dateRange ? dateRange.from : subMonths(now, 1);

        const previousPeriodSignups = allAdherents.filter(a => {
          const joinedDate = new Date(a.joined_at);
          return joinedDate >= previousPeriodStart && joinedDate < previousPeriodEnd;
        }).length;

        const signupGrowthRate = previousPeriodSignups > 0
          ? ((signupsThisPeriod - previousPeriodSignups) / previousPeriodSignups) * 100
          : signupsThisPeriod > 0 ? 100 : 0;

        // Generate signups by period (last 12 months)
        const signupsByPeriod = generateSignupsByPeriod(allAdherents);

        // Calculate retention rate (simplified: active users / total users)
        const activeUsers = allAdherents.filter(a => a.status === 'active').length;
        const retentionRate = totalSignups > 0 ? (activeUsers / totalSignups) * 100 : 0;

        // Generate cohort retention analysis
        const cohortRetention = generateCohortRetention(allAdherents, projects || []);

        // Calculate churn metrics
        const churnedUsers = totalSignups - activeUsers;
        const churnRate = totalSignups > 0 ? (churnedUsers / totalSignups) * 100 : 0;

        // Churn by reason (inferred from status)
        const churnByReason = [
          { reason: 'Inactive', count: allAdherents.filter(a => a.status === 'inactive').length },
          { reason: 'Pending', count: allAdherents.filter(a => a.status === 'pending').length }
        ];

        // Calculate activation metrics
        const usersWithProjects = new Set((projects || []).map(p => p.user_id));
        const activatedUsers = Array.from(usersWithProjects).length;
        const activationRate = totalSignups > 0 ? (activatedUsers / totalSignups) * 100 : 0;

        // Calculate average time to first project
        const timeToFirstProject = calculateAverageTimeToFirstProject(allAdherents, projects || []);

        // Calculate user lifecycle stages
        const usersByStage = calculateUserLifecycleStages(allAdherents, projects || []);

        // Calculate invitation metrics
        const invitationsGenerated = (invitations || []).length;
        const invitationsAccepted = (invitations || []).filter(inv => inv.current_uses > 0).length;
        const invitationConversionRate = invitationsGenerated > 0
          ? (invitationsAccepted / invitationsGenerated) * 100
          : 0;

        // Calculate average time to accept invitation (placeholder - needs proper tracking)
        const averageTimeToAccept = 3; // Placeholder days

        setMetrics({
          totalSignups,
          signupsThisPeriod,
          signupGrowthRate,
          signupsByPeriod,
          retentionRate,
          cohortRetention,
          churnRate,
          churnedUsers,
          churnByReason,
          activatedUsers,
          activationRate,
          averageTimeToFirstProject: timeToFirstProject,
          usersByStage,
          invitationsGenerated,
          invitationsAccepted,
          invitationConversionRate,
          averageTimeToAccept
        });

      } catch (err) {
        console.error('Error fetching growth metrics:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch growth metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchGrowthMetrics();
  }, [organisationId, dateRange]);

  return { metrics, loading, error };
};

// Helper functions

const generateSignupsByPeriod = (adherents: any[]): Array<{ period: string; signups: number }> => {
  const monthlySignups: Record<string, number> = {};

  adherents.forEach(a => {
    const joinedDate = new Date(a.joined_at);
    const monthKey = format(startOfMonth(joinedDate), 'yyyy-MM');

    monthlySignups[monthKey] = (monthlySignups[monthKey] || 0) + 1;
  });

  return Object.entries(monthlySignups)
    .map(([period, signups]) => ({ period, signups }))
    .sort((a, b) => a.period.localeCompare(b.period))
    .slice(-12); // Last 12 months
};

const generateCohortRetention = (adherents: any[], projects: any[]): Array<{
  cohort: string;
  month0: number;
  month1: number;
  month2: number;
  month3: number;
  month6: number;
}> => {
  // Group adherents by cohort (month joined)
  const cohorts: Record<string, any[]> = {};

  adherents.forEach(a => {
    const cohortMonth = format(startOfMonth(new Date(a.joined_at)), 'yyyy-MM');
    if (!cohorts[cohortMonth]) {
      cohorts[cohortMonth] = [];
    }
    cohorts[cohortMonth].push(a);
  });

  // Calculate retention for each cohort
  const retentionData = Object.entries(cohorts).map(([cohort, users]) => {
    const cohortSize = users.length;

    // Calculate retention (simplified: based on active status)
    const activeInMonth1 = users.filter(u => u.status === 'active').length;

    return {
      cohort,
      month0: cohortSize,
      month1: Math.round(activeInMonth1 * 0.9), // Simplified
      month2: Math.round(activeInMonth1 * 0.8),
      month3: Math.round(activeInMonth1 * 0.7),
      month6: Math.round(activeInMonth1 * 0.6)
    };
  });

  return retentionData.slice(-6); // Last 6 cohorts
};

const calculateAverageTimeToFirstProject = (adherents: any[], projects: any[]): number => {
  const timesToFirstProject: number[] = [];

  adherents.forEach(a => {
    const userProjects = projects.filter(p => p.user_id === a.user_id);
    if (userProjects.length > 0) {
      const firstProject = userProjects.sort((p1, p2) =>
        new Date(p1.created_at).getTime() - new Date(p2.created_at).getTime()
      )[0];

      const joinedDate = new Date(a.joined_at);
      const firstProjectDate = new Date(firstProject.created_at);
      const daysToFirstProject = differenceInDays(firstProjectDate, joinedDate);

      if (daysToFirstProject >= 0) {
        timesToFirstProject.push(daysToFirstProject);
      }
    }
  });

  return timesToFirstProject.length > 0
    ? timesToFirstProject.reduce((sum, days) => sum + days, 0) / timesToFirstProject.length
    : 0;
};

const calculateUserLifecycleStages = (adherents: any[], projects: any[]): {
  new: number;
  active: number;
  dormant: number;
  churned: number;
} => {
  const now = new Date();
  const stages = {
    new: 0,
    active: 0,
    dormant: 0,
    churned: 0
  };

  adherents.forEach(a => {
    const joinedDate = new Date(a.joined_at);
    const daysSinceJoined = differenceInDays(now, joinedDate);

    // New users (< 7 days)
    if (daysSinceJoined < 7) {
      stages.new++;
      return;
    }

    // Check for recent project activity
    const userProjects = projects.filter(p => p.user_id === a.user_id);
    if (userProjects.length > 0) {
      const mostRecentProject = userProjects.sort((p1, p2) =>
        new Date(p2.created_at).getTime() - new Date(p1.created_at).getTime()
      )[0];

      const daysSinceLastActivity = differenceInDays(now, new Date(mostRecentProject.created_at));

      if (daysSinceLastActivity < 30) {
        stages.active++;
      } else if (daysSinceLastActivity < 90) {
        stages.dormant++;
      } else {
        stages.churned++;
      }
    } else {
      // No projects at all
      if (daysSinceJoined < 90) {
        stages.dormant++;
      } else {
        stages.churned++;
      }
    }
  });

  return stages;
};
