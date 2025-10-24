import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { DateRange } from '@/components/organisation/analytics/TimeRangeFilter';

export interface MentorMetrics {
  totalMentors: number;
  activeMentors: number;
  mentorToEntrepreneurRatio: string;

  // Capacity
  totalCapacity: number;
  currentLoad: number;
  capacityUtilization: number;
  mentorsAtCapacity: number;

  // Assignments
  totalAssignments: number;
  activeAssignments: number;
  completedAssignments: number;

  // Performance
  averageSuccessRate: number;
  averageRating: number;
  averageEntrepreneursPerMentor: number;

  // Dual Roles
  mentorsAlsoStaff: number;

  // Distribution
  assignmentDistribution: Array<{ mentorName: string; current: number; max: number }>;
  expertiseDistribution: Array<{ expertise: string; count: number }>;

  // Timeline
  assignmentsByMonth: Array<{ month: string; assignments: number }>;
}

export const useOrganisationMentorMetrics = (dateRange?: DateRange) => {
  const { id: organisationId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<MentorMetrics | null>(null);

  useEffect(() => {
    const fetchMentorMetrics = async () => {
      if (!organisationId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch mentors
        const { data: mentors, error: mentorsError } = await supabase
          .from('mentors')
          .select('*')
          .eq('organization_id', organisationId);

        if (mentorsError) throw mentorsError;

        // Fetch adherents for entrepreneur count
        const { data: adherents, error: adherentsError } = await supabase
          .from('adherents')
          .select('id')
          .eq('organization_id', organisationId)
          .eq('status', 'active');

        if (adherentsError) throw adherentsError;

        const allMentors = mentors || [];
        const totalEntrepreneurs = (adherents || []).length;

        // Calculate basic metrics
        const totalMentors = allMentors.length;
        const activeMentors = allMentors.filter(m => m.status === 'active').length;
        const mentorToEntrepreneurRatio = activeMentors > 0
          ? `1:${Math.round(totalEntrepreneurs / activeMentors)}`
          : '0:0';

        // Capacity metrics
        const totalCapacity = allMentors.reduce((sum, m) => sum + (m.max_entrepreneurs || 0), 0);
        const currentLoad = allMentors.reduce((sum, m) => sum + (m.current_entrepreneurs || m.total_entrepreneurs || 0), 0);
        const capacityUtilization = totalCapacity > 0 ? (currentLoad / totalCapacity) * 100 : 0;
        const mentorsAtCapacity = allMentors.filter(m =>
          (m.current_entrepreneurs || m.total_entrepreneurs || 0) >= (m.max_entrepreneurs || 999)
        ).length;

        // Assignment metrics
        const totalAssignments = allMentors.reduce((sum, m) => sum + (m.total_assignments || 0), 0);
        const activeAssignments = currentLoad;
        const completedAssignments = allMentors.reduce((sum, m) => sum + (m.completed_assignments || 0), 0);

        // Performance metrics
        const successRates = allMentors
          .map(m => m.success_rate || 0)
          .filter(r => r > 0);
        const averageSuccessRate = successRates.length > 0
          ? successRates.reduce((sum, r) => sum + r, 0) / successRates.length
          : 0;

        const ratings = allMentors
          .map(m => m.rating || 0)
          .filter(r => r > 0);
        const averageRating = ratings.length > 0
          ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
          : 0;

        const averageEntrepreneursPerMentor = activeMentors > 0
          ? currentLoad / activeMentors
          : 0;

        // Dual roles (mentors who are also staff)
        const mentorsAlsoStaff = allMentors.filter(m => m.is_also_staff).length;

        // Assignment distribution
        const assignmentDistribution = allMentors
          .filter(m => m.status === 'active')
          .map(m => ({
            mentorName: `${m.first_name} ${m.last_name}`,
            current: m.current_entrepreneurs || m.total_entrepreneurs || 0,
            max: m.max_entrepreneurs || 10
          }))
          .sort((a, b) => b.current - a.current)
          .slice(0, 10); // Top 10 mentors

        // Expertise distribution
        const expertiseCount: Record<string, number> = {};
        allMentors.forEach(m => {
          if (m.expertise && Array.isArray(m.expertise)) {
            m.expertise.forEach((exp: string) => {
              expertiseCount[exp] = (expertiseCount[exp] || 0) + 1;
            });
          }
        });
        const expertiseDistribution = Object.entries(expertiseCount)
          .map(([expertise, count]) => ({ expertise, count }))
          .sort((a, b) => b.count - a.count);

        // Assignments by month (estimated from joined_at)
        const assignmentsByMonth = generateAssignmentsByMonth(allMentors);

        setMetrics({
          totalMentors,
          activeMentors,
          mentorToEntrepreneurRatio,
          totalCapacity,
          currentLoad,
          capacityUtilization,
          mentorsAtCapacity,
          totalAssignments,
          activeAssignments,
          completedAssignments,
          averageSuccessRate,
          averageRating,
          averageEntrepreneursPerMentor,
          mentorsAlsoStaff,
          assignmentDistribution,
          expertiseDistribution,
          assignmentsByMonth
        });

      } catch (err) {
        console.error('Error fetching mentor metrics:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch mentor metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchMentorMetrics();
  }, [organisationId, dateRange]);

  return { metrics, loading, error };
};

const generateAssignmentsByMonth = (mentors: any[]): Array<{ month: string; assignments: number }> => {
  const monthlyData: Record<string, number> = {};

  mentors.forEach(m => {
    if (!m.joined_at) return;

    const joinedDate = new Date(m.joined_at);
    const monthKey = `${joinedDate.getFullYear()}-${String(joinedDate.getMonth() + 1).padStart(2, '0')}`;

    // Estimate assignments based on mentor joining (simplified)
    monthlyData[monthKey] = (monthlyData[monthKey] || 0) + (m.total_assignments || 0);
  });

  return Object.entries(monthlyData)
    .map(([month, assignments]) => ({ month, assignments }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-12);
};
