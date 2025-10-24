import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { DateRange } from '@/components/organisation/analytics/TimeRangeFilter';

export interface FormMetrics {
  totalForms: number;
  publishedForms: number;
  draftForms: number;

  // Submissions
  totalSubmissions: number;
  submissionsThisPeriod: number;

  // Response Rates
  averageResponseRate: number;
  formsWithResponses: number;

  // By Category
  formsByCategory: Array<{ category: string; count: number }>;

  // Performance
  topPerformingForms: Array<{
    formName: string;
    responses: number;
    responseRate: number;
  }>;

  // Timeline
  submissionsByMonth: Array<{ month: string; submissions: number }>;

  // Invitation Metrics
  invitationsGenerated: number;
  invitationsUsed: number;
  invitationUsageRate: number;
  invitationsByRole: Array<{ role: string; count: number; used: number }>;
}

export const useOrganisationFormMetrics = (dateRange?: DateRange) => {
  const { id: organisationId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<FormMetrics | null>(null);

  useEffect(() => {
    const fetchFormMetrics = async () => {
      if (!organisationId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch forms
        const { data: forms, error: formsError } = await supabase
          .from('organisation_forms')
          .select('*')
          .eq('organisation_id', organisationId);

        if (formsError) throw formsError;

        // Fetch invitations
        const { data: invitations, error: invitationsError } = await supabase
          .from('invitation_codes')
          .select('*')
          .eq('organisation_id', organisationId);

        if (invitationsError) throw invitationsError;

        const allForms = forms || [];
        const allInvitations = invitations || [];

        // Filter by date range
        let filteredForms = allForms;
        if (dateRange) {
          filteredForms = allForms.filter(f => {
            const createdDate = new Date(f.created_at);
            return createdDate >= dateRange.from && createdDate <= dateRange.to;
          });
        }

        // Calculate form metrics
        const totalForms = allForms.length;
        const publishedForms = allForms.filter(f => f.published).length;
        const draftForms = allForms.filter(f => !f.published).length;

        // Note: Actual submission count would require form_submissions table
        // Using placeholder logic for now
        const totalSubmissions = 0; // Would query form_submissions table
        const submissionsThisPeriod = 0;

        // Calculate average response rate (placeholder)
        const averageResponseRate = 0;
        const formsWithResponses = 0;

        // Forms by category
        const categoryCount: Record<string, number> = {};
        allForms.forEach(f => {
          const category = f.category || 'uncategorized';
          categoryCount[category] = (categoryCount[category] || 0) + 1;
        });
        const formsByCategory = Object.entries(categoryCount).map(([category, count]) => ({
          category,
          count
        }));

        // Top performing forms (placeholder)
        const topPerformingForms: Array<{
          formName: string;
          responses: number;
          responseRate: number;
        }> = [];

        // Submissions by month (placeholder)
        const submissionsByMonth: Array<{ month: string; submissions: number }> = [];

        // Invitation metrics
        const invitationsGenerated = allInvitations.length;
        const invitationsUsed = allInvitations.filter(inv => inv.current_uses > 0).length;
        const invitationUsageRate = invitationsGenerated > 0
          ? (invitationsUsed / invitationsGenerated) * 100
          : 0;

        // Invitations by role
        const roleCount: Record<string, { count: number; used: number }> = {};
        allInvitations.forEach(inv => {
          const role = inv.role || 'unknown';
          if (!roleCount[role]) {
            roleCount[role] = { count: 0, used: 0 };
          }
          roleCount[role].count++;
          if (inv.current_uses > 0) {
            roleCount[role].used++;
          }
        });
        const invitationsByRole = Object.entries(roleCount).map(([role, data]) => ({
          role,
          count: data.count,
          used: data.used
        }));

        setMetrics({
          totalForms,
          publishedForms,
          draftForms,
          totalSubmissions,
          submissionsThisPeriod,
          averageResponseRate,
          formsWithResponses,
          formsByCategory,
          topPerformingForms,
          submissionsByMonth,
          invitationsGenerated,
          invitationsUsed,
          invitationUsageRate,
          invitationsByRole
        });

      } catch (err) {
        console.error('Error fetching form metrics:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch form metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchFormMetrics();
  }, [organisationId, dateRange]);

  return { metrics, loading, error };
};
