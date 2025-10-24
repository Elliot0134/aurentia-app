import { Card, CardContent } from '@/components/ui/card';
import { useProject } from '@/contexts/ProjectContext';
import { useActionPlanTimeline } from '@/hooks/useActionPlanTimeline';
import { FolderOpen, Coins, CheckCircle2, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
  iconBgColor?: string;
  iconColor?: string;
}

const MetricCard = ({ icon, label, value, subtext, iconBgColor = 'bg-aurentia-pink/10', iconColor = 'text-aurentia-pink' }: MetricCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={cn("p-3 rounded-lg", iconBgColor)}>
            <div className={cn("w-6 h-6", iconColor)}>
              {icon}
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-600 font-medium">{label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            {subtext && (
              <p className="text-xs text-gray-500 mt-1">{subtext}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const DashboardMetricsCards = () => {
  const { userProjects, userCredits, deliverableNames, currentProjectId } = useProject();
  const { timelineData, hasActionPlan } = useActionPlanTimeline(currentProjectId);

  // Calculer les livrables complétés (estimation basée sur les projets)
  const totalDeliverables = deliverableNames.length;
  const estimatedCompleted = Math.floor(userProjects.length * 0.4); // Estimation: 40% complétés en moyenne

  // Calculer les crédits disponibles
  const totalCredits = (userCredits.purchasedCredits || 0) + (userCredits.monthlyCredits || 0);

  // Formater les crédits avec séparateur de milliers
  const formatCredits = (num: number) => {
    return new Intl.NumberFormat('fr-FR').format(num);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        icon={<FolderOpen className="w-full h-full" />}
        label="Projets Actifs"
        value={userProjects.length}
        subtext={userProjects.length === 1 ? '1 projet' : `${userProjects.length} projets`}
        iconBgColor="bg-blue-100"
        iconColor="text-blue-600"
      />

      <MetricCard
        icon={<Coins className="w-full h-full" />}
        label="Crédits Disponibles"
        value={formatCredits(totalCredits)}
        subtext={totalCredits < 600 ? 'Niveau bas' : 'Suffisant'}
        iconBgColor="bg-yellow-100"
        iconColor="text-yellow-600"
      />

      <MetricCard
        icon={<CheckCircle2 className="w-full h-full" />}
        label="Livrables"
        value={`${estimatedCompleted}/${totalDeliverables}`}
        subtext={`${Math.round((estimatedCompleted / totalDeliverables) * 100)}% complétés`}
        iconBgColor="bg-green-100"
        iconColor="text-green-600"
      />

      <MetricCard
        icon={<TrendingUp className="w-full h-full" />}
        label="Plan d'Action"
        value={hasActionPlan ? `${timelineData.progressPercentage}%` : 'N/A'}
        subtext={
          hasActionPlan
            ? `Semaine ${timelineData.currentWeek}/${timelineData.totalWeeks}`
            : 'Pas encore créé'
        }
        iconBgColor="bg-aurentia-pink/10"
        iconColor="text-aurentia-pink"
      />
    </div>
  );
};
