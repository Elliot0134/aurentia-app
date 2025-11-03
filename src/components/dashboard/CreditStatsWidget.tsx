import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useCreditStats } from '@/hooks/useCreditStats';
import {
  Coins,
  TrendingDown,
  Calendar,
  AlertTriangle,
  AlertCircle,
  Zap,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface CreditStatsWidgetProps {
  className?: string;
}

export const CreditStatsWidget = ({ className }: CreditStatsWidgetProps) => {
  const { stats, isLoading, error, refresh } = useCreditStats();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card className={cn("card-static", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-[#ff592b]" />
            Gestion des Crédits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="spinner-container">
            <div className="spinner"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card className={cn("card-static", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-[#ff592b]" />
            Gestion des Crédits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-text-muted py-4">
            {error || 'Impossible de charger les statistiques'}
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatNumber = (num: number) => new Intl.NumberFormat('fr-FR').format(num);

  return (
    <Card className={cn("card-static", className)}>
      <CardContent className="pt-6 space-y-4">
        {/* Alertes critiques */}
        {stats.isCriticalCredits && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Crédits critiques !</strong> Il ne vous reste que {stats.remainingPercent}% de vos crédits.
              {stats.estimatedDaysRemaining !== null && stats.estimatedDaysRemaining < 7 && (
                <span> À ce rythme, vous serez à court dans environ {stats.estimatedDaysRemaining} jour{stats.estimatedDaysRemaining > 1 ? 's' : ''}.</span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {stats.isLowCredits && !stats.isCriticalCredits && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Attention !</strong> Vos crédits sont bientôt épuisés ({stats.remainingPercent}% restants).
              {stats.estimatedDaysRemaining !== null && (
                <span> Environ {stats.estimatedDaysRemaining} jour{stats.estimatedDaysRemaining > 1 ? 's' : ''} restant{stats.estimatedDaysRemaining > 1 ? 's' : ''}.</span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Crédits disponibles */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-text-primary">Crédits disponibles</span>
            <span className="text-2xl font-bold text-[#ff592b]">
              {formatNumber(stats.totalRemaining)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span>Mensuels: {formatNumber(stats.monthlyRemaining)}</span>
            <span>•</span>
            <span>Achetés: {formatNumber(stats.purchasedRemaining)}</span>
          </div>
        </div>

        {/* Utilisation mensuelle */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-text-muted" />
              <span className="text-sm font-medium text-text-primary">Utilisés ce mois</span>
            </div>
            <span className="text-lg font-semibold text-text-primary">
              {formatNumber(stats.usedThisMonth)} / {formatNumber(stats.monthlyLimit)}
            </span>
          </div>
          <Progress
            value={stats.monthlyUsagePercent}
            className={cn(
              "h-2",
              stats.monthlyUsagePercent >= 90 ? "bg-red-100" :
              stats.monthlyUsagePercent >= 70 ? "bg-orange-100" : "bg-gray-100"
            )}
          />
          <div className="flex items-center justify-between mt-1 text-xs text-text-muted">
            <span>{stats.monthlyUsagePercent}% utilisés</span>
            <span>Reset dans {stats.daysUntilReset} jours</span>
          </div>
        </div>

        {/* Statistiques détaillées */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200">
          <div className="flex flex-col">
            <div className="flex items-center gap-1 text-xs text-text-muted mb-1">
              <Zap className="h-3 w-3" />
              Aujourd'hui
            </div>
            <span className="text-lg font-semibold text-text-primary">
              {formatNumber(stats.usedToday)}
            </span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1 text-xs text-text-muted mb-1">
              <Calendar className="h-3 w-3" />
              Cette semaine
            </div>
            <span className="text-lg font-semibold text-text-primary">
              {formatNumber(stats.usedThisWeek)}
            </span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1 text-xs text-text-muted mb-1">
              <TrendingDown className="h-3 w-3" />
              Moyenne/jour
            </div>
            <span className="text-lg font-semibold text-text-primary">
              {formatNumber(stats.averageDailyUsage)}
            </span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1 text-xs text-text-muted mb-1">
              <Calendar className="h-3 w-3" />
              Jours restants
            </div>
            <span className="text-lg font-semibold text-text-primary">
              {stats.estimatedDaysRemaining !== null
                ? `~${stats.estimatedDaysRemaining}j`
                : 'N/A'}
            </span>
          </div>
        </div>

        {/* Bouton d'achat */}
        {(stats.isLowCredits || stats.isCriticalCredits) && (
          <Button
            onClick={() => navigate('/individual/credits')}
            className="w-full btn-primary mt-2"
          >
            <Coins className="h-4 w-4 mr-2" />
            Acheter des crédits
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
