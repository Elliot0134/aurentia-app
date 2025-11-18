import { useProject } from '@/contexts/ProjectContext';
import { useActionPlanTimeline } from '@/hooks/useActionPlanTimeline';
import { useCreditStats } from '@/hooks/useCreditStats';
import { FolderOpen, Coins, CheckCircle2, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
  subtextColor?: string;
  trend?: 'up' | 'down' | 'neutral';
}

const MetricCard = ({ icon, label, value, subtext, subtextColor, trend }: MetricCardProps) => {
  return (
    <div className="bg-white dark:bg-[#40444d] border border-[#f2f2f1] dark:border-[#787b80] rounded-xl p-4 hover:border-aurentia-pink/20 transition-all duration-200">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[15px] text-[#6b7280] dark:text-[#94a3b8] font-normal">{label}</p>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium",
            trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
          )}>
            {trend === 'up' && <TrendingUp className="h-3 w-3" />}
            {trend === 'down' && <TrendingDown className="h-3 w-3" />}
          </div>
        )}
      </div>
      <p className="text-3xl font-bold text-[#2e333d] dark:text-[#f9f6f1] mb-1">{value}</p>
      {subtext && (
        <p className={cn("text-xs", subtextColor || "text-[#6b7280] dark:text-[#94a3b8]")}>
          {subtext}
        </p>
      )}
    </div>
  );
};

export const DashboardMetricsCards = () => {
  const { userProjects, deliverableNames, currentProjectId } = useProject();
  const { timelineData, hasActionPlan } = useActionPlanTimeline(currentProjectId);
  const { stats: creditStats } = useCreditStats();

  // Calculer les livrables complétés (vraies données)
  const totalDeliverablesCount = 10; // Nombre total de livrables disponibles
  const completedDeliverables = deliverableNames.length;
  const deliverablePercent = Math.round((completedDeliverables / totalDeliverablesCount) * 100);

  // Formater les nombres avec séparateur de milliers
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fr-FR').format(num);
  };

  // Déterminer le statut des crédits
  const getCreditStatus = () => {
    if (!creditStats) return { text: 'Chargement...', color: 'text-text-muted' };
    if (creditStats.isCriticalCredits) return { text: 'Niveau critique', color: 'text-red-600 font-semibold' };
    if (creditStats.isLowCredits) return { text: 'Niveau bas', color: 'text-orange-600 font-semibold' };
    return { text: 'Niveau suffisant', color: 'text-green-600' };
  };

  const creditStatus = getCreditStatus();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        icon={<FolderOpen className="w-full h-full" />}
        label="Projets Actifs"
        value={userProjects.length}
        subtext={userProjects.length === 1 ? '1 projet créé' : `${userProjects.length} projets créés`}
      />

      <MetricCard
        icon={<Coins className="w-full h-full" />}
        label="Crédits Disponibles"
        value={creditStats ? formatNumber(creditStats.totalRemaining) : '...'}
        subtext={creditStatus.text}
        subtextColor={creditStatus.color}
        trend={creditStats && creditStats.averageDailyUsage > 0 ? 'down' : 'neutral'}
      />

      <MetricCard
        icon={<CheckCircle2 className="w-full h-full" />}
        label="Livrables Créés"
        value={currentProjectId ? `${completedDeliverables}/${totalDeliverablesCount}` : '0'}
        subtext={currentProjectId ? `${deliverablePercent}% complétés` : 'Sélectionnez un projet'}
        trend={completedDeliverables > 5 ? 'up' : completedDeliverables > 0 ? 'neutral' : undefined}
      />

      <MetricCard
        icon={<TrendingUp className="w-full h-full" />}
        label="Plan d'Action"
        value={hasActionPlan ? `${timelineData.completionPercentage}%` : 'N/A'}
        subtext={
          hasActionPlan
            ? `${timelineData.completedTasks + timelineData.completedMilestones}/${timelineData.totalTasks + timelineData.totalMilestones} terminés`
            : 'Pas encore créé'
        }
        trend={hasActionPlan && timelineData.completionPercentage > 50 ? 'up' : undefined}
      />
    </div>
  );
};
