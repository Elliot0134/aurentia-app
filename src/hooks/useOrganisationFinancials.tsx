import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { DateRange } from '@/components/organisation/analytics/TimeRangeFilter';

export interface FinancialMetrics {
  // Revenue Metrics
  mrr: number; // Monthly Recurring Revenue
  totalRevenue: number;
  averageRevenuePerUser: number;

  // Payment Status
  paymentStatusDistribution: {
    current: number;
    overdue: number;
    failed: number;
  };

  // Subscription Metrics
  totalSubscribers: number;
  activeSubscribers: number;
  churnedSubscribers: number;
  churnRate: number;

  // Credit Metrics
  totalCreditsAllocated: number;
  totalCreditsUsed: number;
  creditUtilizationRate: number;
  averageCreditsPerUser: number;

  // Overdue Payments
  averageOverdueDays: number;
  totalOverdueAmount: number;

  // Time series data
  revenueByMonth: Array<{ month: string; revenue: number; subscribers: number }>;
  paymentsByDay: Array<{ date: string; amount: number; count: number }>;
}

interface PaymentStatusCount {
  status: string;
  count: number;
}

interface RevenueData {
  month: string;
  total_revenue: number;
  subscriber_count: number;
}

export const useOrganisationFinancials = (dateRange?: DateRange) => {
  const { id: organisationId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);

  useEffect(() => {
    const fetchFinancialMetrics = async () => {
      if (!organisationId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch adherents with subscription data
        const { data: adherents, error: adherentsError } = await supabase
          .from('adherents')
          .select('*')
          .eq('organization_id', organisationId);

        if (adherentsError) throw adherentsError;

        // Filter by date range if provided
        let filteredAdherents = adherents || [];
        if (dateRange) {
          filteredAdherents = filteredAdherents.filter(a => {
            const joinedDate = new Date(a.joined_at);
            return joinedDate >= dateRange.from && joinedDate <= dateRange.to;
          });
        }

        // Calculate MRR
        const mrr = filteredAdherents.reduce((sum, a) => {
          return sum + (a.subscription_amount || 0);
        }, 0);

        // Calculate payment status distribution
        const paymentStatusCounts: Record<string, number> = {
          current: 0,
          overdue: 0,
          failed: 0
        };

        filteredAdherents.forEach(a => {
          const status = a.payment_status?.toLowerCase() || 'current';
          if (status.includes('overdue') || (a.subscription_days_overdue && a.subscription_days_overdue > 0)) {
            paymentStatusCounts.overdue++;
          } else if (status.includes('failed')) {
            paymentStatusCounts.failed++;
          } else {
            paymentStatusCounts.current++;
          }
        });

        // Calculate subscription metrics
        const totalSubscribers = filteredAdherents.length;
        const activeSubscribers = filteredAdherents.filter(a => a.status === 'active').length;
        const churnedSubscribers = totalSubscribers - activeSubscribers;
        const churnRate = totalSubscribers > 0 ? (churnedSubscribers / totalSubscribers) * 100 : 0;

        // Calculate credit metrics
        const totalMonthlyCredits = filteredAdherents.reduce((sum, a) =>
          sum + (a.monthly_credits_remaining || 0), 0
        );
        const totalPurchasedCredits = filteredAdherents.reduce((sum, a) =>
          sum + (a.purchased_credits_remaining || 0), 0
        );
        const totalCreditsAllocated = totalMonthlyCredits + totalPurchasedCredits;

        // Estimate used credits (assuming initial allocation was higher)
        // This is an approximation - ideally track credit usage separately
        const estimatedInitialCredits = totalSubscribers * 100; // Assume 100 credits per user initially
        const totalCreditsUsed = estimatedInitialCredits - totalCreditsAllocated;
        const creditUtilizationRate = estimatedInitialCredits > 0
          ? (totalCreditsUsed / estimatedInitialCredits) * 100
          : 0;

        // Calculate overdue metrics
        const overdueAdherents = filteredAdherents.filter(a =>
          a.subscription_days_overdue && a.subscription_days_overdue > 0
        );
        const averageOverdueDays = overdueAdherents.length > 0
          ? overdueAdherents.reduce((sum, a) => sum + (a.subscription_days_overdue || 0), 0) / overdueAdherents.length
          : 0;
        const totalOverdueAmount = overdueAdherents.reduce((sum, a) =>
          sum + (a.subscription_amount || 0), 0
        );

        // Generate time series data (revenue by month)
        const revenueByMonth = generateRevenueTimeSeries(filteredAdherents);

        // Generate payments by day (last 30 days)
        const paymentsByDay = generatePaymentsByDay(filteredAdherents, dateRange);

        setMetrics({
          mrr,
          totalRevenue: mrr * 12, // Annualized
          averageRevenuePerUser: totalSubscribers > 0 ? mrr / totalSubscribers : 0,
          paymentStatusDistribution: paymentStatusCounts,
          totalSubscribers,
          activeSubscribers,
          churnedSubscribers,
          churnRate,
          totalCreditsAllocated,
          totalCreditsUsed: Math.max(0, totalCreditsUsed),
          creditUtilizationRate: Math.max(0, Math.min(100, creditUtilizationRate)),
          averageCreditsPerUser: totalSubscribers > 0
            ? totalCreditsAllocated / totalSubscribers
            : 0,
          averageOverdueDays,
          totalOverdueAmount,
          revenueByMonth,
          paymentsByDay
        });

      } catch (err) {
        console.error('Error fetching financial metrics:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch financial metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchFinancialMetrics();
  }, [organisationId, dateRange]);

  return { metrics, loading, error };
};

// Helper function to generate revenue time series
const generateRevenueTimeSeries = (adherents: any[]): Array<{ month: string; revenue: number; subscribers: number }> => {
  const monthlyData: Record<string, { revenue: number; subscribers: Set<string> }> = {};

  adherents.forEach(a => {
    const joinedDate = new Date(a.joined_at);
    const monthKey = `${joinedDate.getFullYear()}-${String(joinedDate.getMonth() + 1).padStart(2, '0')}`;

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { revenue: 0, subscribers: new Set() };
    }

    monthlyData[monthKey].revenue += a.subscription_amount || 0;
    monthlyData[monthKey].subscribers.add(a.id);
  });

  return Object.entries(monthlyData)
    .map(([month, data]) => ({
      month,
      revenue: data.revenue,
      subscribers: data.subscribers.size
    }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-12); // Last 12 months
};

// Helper function to generate payments by day
const generatePaymentsByDay = (adherents: any[], dateRange?: DateRange): Array<{ date: string; amount: number; count: number }> => {
  const dailyData: Record<string, { amount: number; count: number }> = {};

  adherents.forEach(a => {
    if (!a.last_payment_date) return;

    const paymentDate = new Date(a.last_payment_date);
    if (dateRange && (paymentDate < dateRange.from || paymentDate > dateRange.to)) {
      return;
    }

    const dateKey = paymentDate.toISOString().split('T')[0];

    if (!dailyData[dateKey]) {
      dailyData[dateKey] = { amount: 0, count: 0 };
    }

    dailyData[dateKey].amount += a.subscription_amount || 0;
    dailyData[dateKey].count += 1;
  });

  return Object.entries(dailyData)
    .map(([date, data]) => ({
      date,
      amount: data.amount,
      count: data.count
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
};
