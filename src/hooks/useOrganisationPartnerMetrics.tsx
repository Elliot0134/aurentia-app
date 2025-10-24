import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { DateRange } from '@/components/organisation/analytics/TimeRangeFilter';

export interface PartnerMetrics {
  totalPartners: number;
  activePartners: number;
  prospectPartners: number;
  inactivePartners: number;

  // By Type
  partnersByType: Array<{ type: string; count: number }>;

  // Collaboration Types
  collaborationTypes: Array<{ type: string; count: number }>;

  // Growth
  partnersAddedThisPeriod: number;
  partnerGrowthRate: number;

  // Conversion
  prospectToActiveConversion: number;

  // Timeline
  partnersByMonth: Array<{ month: string; total: number; active: number; prospects: number }>;

  // Rating Distribution
  averageRating: number;
  ratingDistribution: Array<{ rating: number; count: number }>;
}

export const useOrganisationPartnerMetrics = (dateRange?: DateRange) => {
  const { id: organisationId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<PartnerMetrics | null>(null);

  useEffect(() => {
    const fetchPartnerMetrics = async () => {
      if (!organisationId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch partners
        const { data: partners, error: partnersError } = await supabase
          .from('partners')
          .select('*')
          .eq('organisation_id', organisationId)
          .order('created_at', { ascending: true });

        if (partnersError) throw partnersError;

        const allPartners = partners || [];

        // Filter by date range
        let filteredPartners = allPartners;
        if (dateRange) {
          filteredPartners = allPartners.filter(p => {
            const createdDate = new Date(p.created_at);
            return createdDate >= dateRange.from && createdDate <= dateRange.to;
          });
        }

        // Calculate status distribution
        const totalPartners = allPartners.length;
        const activePartners = allPartners.filter(p => p.status === 'active').length;
        const prospectPartners = allPartners.filter(p => p.status === 'prospect').length;
        const inactivePartners = allPartners.filter(p => p.status === 'inactive').length;

        // Partners by type
        const typeCount: Record<string, number> = {};
        allPartners.forEach(p => {
          typeCount[p.type] = (typeCount[p.type] || 0) + 1;
        });
        const partnersByType = Object.entries(typeCount).map(([type, count]) => ({
          type: formatPartnerType(type),
          count
        }));

        // Collaboration types
        const collabCount: Record<string, number> = {};
        allPartners.forEach(p => {
          if (p.collaboration_type && Array.isArray(p.collaboration_type)) {
            p.collaboration_type.forEach((type: string) => {
              collabCount[type] = (collabCount[type] || 0) + 1;
            });
          }
        });
        const collaborationTypes = Object.entries(collabCount).map(([type, count]) => ({
          type,
          count
        }));

        // Growth metrics
        const partnersAddedThisPeriod = filteredPartners.length;

        // Calculate growth rate
        const periodDays = dateRange
          ? Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24))
          : 30;
        const previousPeriodStart = dateRange
          ? new Date(dateRange.from.getTime() - periodDays * 24 * 60 * 60 * 1000)
          : new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
        const previousPeriodEnd = dateRange ? dateRange.from : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const previousPeriodPartners = allPartners.filter(p => {
          const createdDate = new Date(p.created_at);
          return createdDate >= previousPeriodStart && createdDate < previousPeriodEnd;
        }).length;

        const partnerGrowthRate = previousPeriodPartners > 0
          ? ((partnersAddedThisPeriod - previousPeriodPartners) / previousPeriodPartners) * 100
          : partnersAddedThisPeriod > 0 ? 100 : 0;

        // Conversion rate (prospect to active)
        const totalProspects = allPartners.filter(p => p.status === 'prospect' || p.status === 'active').length;
        const prospectToActiveConversion = totalProspects > 0
          ? (activePartners / totalProspects) * 100
          : 0;

        // Partners by month
        const partnersByMonth = generatePartnersByMonth(allPartners);

        // Rating metrics
        const ratingsArray = allPartners
          .map(p => p.rating || 0)
          .filter(r => r > 0);
        const averageRating = ratingsArray.length > 0
          ? ratingsArray.reduce((sum, r) => sum + r, 0) / ratingsArray.length
          : 0;

        const ratingCount: Record<number, number> = {};
        allPartners.forEach(p => {
          if (p.rating && p.rating > 0) {
            ratingCount[p.rating] = (ratingCount[p.rating] || 0) + 1;
          }
        });
        const ratingDistribution = Object.entries(ratingCount).map(([rating, count]) => ({
          rating: Number(rating),
          count
        })).sort((a, b) => a.rating - b.rating);

        setMetrics({
          totalPartners,
          activePartners,
          prospectPartners,
          inactivePartners,
          partnersByType,
          collaborationTypes,
          partnersAddedThisPeriod,
          partnerGrowthRate,
          prospectToActiveConversion,
          partnersByMonth,
          averageRating,
          ratingDistribution
        });

      } catch (err) {
        console.error('Error fetching partner metrics:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch partner metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchPartnerMetrics();
  }, [organisationId, dateRange]);

  return { metrics, loading, error };
};

const formatPartnerType = (type: string): string => {
  const typeLabels: Record<string, string> = {
    investor: 'Investisseur',
    accelerator: 'Accélérateur',
    incubator: 'Incubateur',
    corporate: 'Entreprise',
    government: 'Public',
    university: 'Université',
    other: 'Autre'
  };
  return typeLabels[type] || type;
};

const generatePartnersByMonth = (partners: any[]): Array<{
  month: string;
  total: number;
  active: number;
  prospects: number;
}> => {
  const monthlyData: Record<string, { total: number; active: number; prospects: number }> = {};

  partners.forEach(p => {
    const createdDate = new Date(p.created_at);
    const monthKey = `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, '0')}`;

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { total: 0, active: 0, prospects: 0 };
    }

    monthlyData[monthKey].total++;
    if (p.status === 'active') monthlyData[monthKey].active++;
    if (p.status === 'prospect') monthlyData[monthKey].prospects++;
  });

  return Object.entries(monthlyData)
    .map(([month, data]) => ({ month, ...data }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-12);
};
