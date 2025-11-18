import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useCreditsHistory, TimeRange } from "@/hooks/useMonthlyCreditsHistory";
import { cn } from "@/lib/utils";
import { Calendar } from "lucide-react";

const chartConfig = {
  credits: {
    label: "Crédits",
    color: "hsl(15, 100%, 59%)",
  },
} satisfies ChartConfig;

interface CreditsUsageChartProps {
  className?: string;
}

const TIME_RANGES = [
  { value: 'current_month' as TimeRange, label: 'Ce mois' },
  { value: 'last_month' as TimeRange, label: 'Mois dernier' },
  { value: 'year' as TimeRange, label: 'Année' },
];

export function CreditsUsageChart({ className }: CreditsUsageChartProps) {
  const [timeRange, setTimeRange] = React.useState<TimeRange>('current_month');
  const { dailyUsage, isLoading, error, totalUsed } = useCreditsHistory(timeRange);

  // Formater le label de période
  const periodLabel = React.useMemo(() => {
    const now = new Date();
    switch (timeRange) {
      case 'current_month':
        return now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      case 'last_month':
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return lastMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      case 'year':
        return '12 derniers mois';
      default:
        return '';
    }
  }, [timeRange]);

  return (
    <div className={cn("space-y-3", className)}>
      {/* En-tête avec titre et filtres */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-text-primary font-sans mb-1">
            Utilisation des Crédits
          </h2>
          <p className="flex items-center gap-1 text-xs text-text-muted">
            <Calendar className="h-3 w-3" />
            {isLoading ? 'Chargement...' : `${periodLabel} · ${totalUsed.toLocaleString('fr-FR')} crédits`}
          </p>
        </div>

        {/* Filtres temporels */}
        <div className="flex gap-1">
          {TIME_RANGES.map((range) => (
            <button
              key={range.value}
              onClick={() => setTimeRange(range.value)}
              disabled={isLoading}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-md transition-colors duration-200",
                timeRange === range.value
                  ? "bg-[#ff592b] text-white"
                  : "bg-gray-100 dark:bg-[#585a60] text-[#6b7280] dark:text-[#94a3b8] hover:bg-gray-200 dark:hover:bg-[#6a6d72]",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Graphique */}
      <div style={{ minHeight: '200px' }}>
        {isLoading ? (
          <div className="flex items-center justify-center h-[200px]">
            <div className="spinner"></div>
          </div>
        ) : error || dailyUsage.length === 0 ? (
          <div className="flex items-center justify-center h-[200px] text-center text-[#6b7280] dark:text-[#94a3b8] text-sm">
            {error || 'Aucune donnée disponible'}
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[200px] w-full"
          >
            <BarChart
              accessibilityLayer
              data={dailyUsage}
              margin={{
                left: 8,
                right: 8,
                top: 8,
                bottom: 0,
              }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.2} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={6}
                minTickGap={32}
                tick={{ fontSize: 11 }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                  });
                }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={6}
                tick={{ fontSize: 11 }}
                width={35}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="w-[160px]"
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      });
                    }}
                    formatter={(value) => [`${value} crédits`, "Utilisés"]}
                  />
                }
              />
              <Bar
                dataKey="credits"
                fill={chartConfig.credits.color}
                radius={[3, 3, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        )}
      </div>
    </div>
  );
}
