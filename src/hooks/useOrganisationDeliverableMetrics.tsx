import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { DateRange } from '@/components/organisation/analytics/TimeRangeFilter';

export interface DeliverableMetrics {
  // Overall Stats
  totalDeliverables: number;
  completedDeliverables: number;
  completionRate: number;

  // By Type
  deliverablesByType: Array<{
    type: string;
    total: number;
    completed: number;
    completionRate: number;
  }>;

  // Quality
  averageQualityScore: number;
  qualityDistribution: Array<{ range: string; count: number }>;

  // Timeline
  averageCompletionTime: number; // in days
  completionsByMonth: Array<{ month: string; completed: number }>;

  // Status Distribution
  statusDistribution: Array<{ status: string; count: number }>;
}

// Deliverable types based on CLAUDE.md
const DELIVERABLE_TYPES = [
  'persona_express_b2c',
  'persona_express_b2b',
  'persona_express_organismes',
  'pitch',
  'concurrence',
  'marche',
  'proposition_valeur',
  'business_model',
  'ressources_requises',
  'vision_mission'
];

const DELIVERABLE_LABELS: Record<string, string> = {
  persona_express_b2c: 'Cible B2C',
  persona_express_b2b: 'Cible B2B',
  persona_express_organismes: 'Cible Organismes',
  pitch: 'Pitch',
  concurrence: 'Concurrence',
  marche: 'Marché',
  proposition_valeur: 'Proposition de valeur',
  business_model: 'Business Model',
  ressources_requises: 'Ressources requises',
  vision_mission: 'Vision/Mission'
};

export const useOrganisationDeliverableMetrics = (dateRange?: DateRange) => {
  const { id: organisationId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<DeliverableMetrics | null>(null);

  useEffect(() => {
    const fetchDeliverableMetrics = async () => {
      if (!organisationId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch projects first
        const { data: projects, error: projectsError } = await supabase
          .from('project_summary')
          .select('project_id, user_id, created_at')
          .eq('organization_id', organisationId);

        if (projectsError) throw projectsError;

        if (!projects || projects.length === 0) {
          // No projects, return empty metrics
          setMetrics({
            totalDeliverables: 0,
            completedDeliverables: 0,
            completionRate: 0,
            deliverablesByType: [],
            averageQualityScore: 0,
            qualityDistribution: [],
            averageCompletionTime: 0,
            completionsByMonth: [],
            statusDistribution: []
          });
          return;
        }

        // Fetch all deliverable types
        const deliverableData: any[] = [];

        for (const type of DELIVERABLE_TYPES) {
          const { data, error: deliverableError } = await supabase
            .from(type)
            .select('*')
            .in('project_id', projects.map(p => p.project_id));

          if (!deliverableError && data) {
            deliverableData.push(...data.map(d => ({ ...d, deliverable_type: type })));
          }
        }

        // Filter by date range if provided
        let filteredDeliverables = deliverableData;
        if (dateRange) {
          filteredDeliverables = deliverableData.filter(d => {
            const createdDate = new Date(d.created_at || d.updated_at);
            return createdDate >= dateRange.from && createdDate <= dateRange.to;
          });
        }

        // Calculate overall stats
        const totalDeliverables = deliverableData.length;
        const completedDeliverables = deliverableData.filter(d =>
          d.status === 'completed' || d.status === 'reviewed'
        ).length;
        const completionRate = totalDeliverables > 0
          ? (completedDeliverables / totalDeliverables) * 100
          : 0;

        // Calculate by type
        const typeStats: Record<string, { total: number; completed: number }> = {};
        DELIVERABLE_TYPES.forEach(type => {
          typeStats[type] = { total: 0, completed: 0 };
        });

        deliverableData.forEach(d => {
          const type = d.deliverable_type;
          typeStats[type].total++;
          if (d.status === 'completed' || d.status === 'reviewed') {
            typeStats[type].completed++;
          }
        });

        const deliverablesByType = Object.entries(typeStats)
          .map(([type, stats]) => ({
            type: DELIVERABLE_LABELS[type] || type,
            total: stats.total,
            completed: stats.completed,
            completionRate: stats.total > 0 ? (stats.completed / stats.total) * 100 : 0
          }))
          .filter(d => d.total > 0);

        // Calculate quality scores
        const qualityScores = deliverableData
          .map(d => d.quality_score || 0)
          .filter(q => q > 0);
        const averageQualityScore = qualityScores.length > 0
          ? qualityScores.reduce((sum, q) => sum + q, 0) / qualityScores.length
          : 0;

        // Quality distribution
        const qualityRanges = [
          { range: '0-20%', min: 0, max: 20 },
          { range: '21-40%', min: 21, max: 40 },
          { range: '41-60%', min: 41, max: 60 },
          { range: '61-80%', min: 61, max: 80 },
          { range: '81-100%', min: 81, max: 100 }
        ];
        const qualityDistribution = qualityRanges.map(r => ({
          range: r.range,
          count: qualityScores.filter(q => q >= r.min && q <= r.max).length
        }));

        // Calculate average completion time (placeholder - would need actual completion dates)
        const averageCompletionTime = 14; // Placeholder days

        // Completions by month
        const completionsByMonth = generateCompletionsByMonth(deliverableData);

        // Status distribution
        const statusCount: Record<string, number> = {};
        deliverableData.forEach(d => {
          const status = d.status || 'pending';
          statusCount[status] = (statusCount[status] || 0) + 1;
        });
        const statusDistribution = Object.entries(statusCount).map(([status, count]) => ({
          status,
          count
        }));

        setMetrics({
          totalDeliverables,
          completedDeliverables,
          completionRate,
          deliverablesByType,
          averageQualityScore,
          qualityDistribution,
          averageCompletionTime,
          completionsByMonth,
          statusDistribution
        });

      } catch (err) {
        console.error('Error fetching deliverable metrics:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch deliverable metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchDeliverableMetrics();
  }, [organisationId, dateRange]);

  return { metrics, loading, error };
};

const generateCompletionsByMonth = (deliverables: any[]): Array<{ month: string; completed: number }> => {
  const monthlyData: Record<string, number> = {};

  deliverables
    .filter(d => d.status === 'completed' || d.status === 'reviewed')
    .forEach(d => {
      const completedDate = new Date(d.updated_at || d.created_at);
      const monthKey = `${completedDate.getFullYear()}-${String(completedDate.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
    });

  return Object.entries(monthlyData)
    .map(([month, completed]) => ({ month, completed }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-12);
};
