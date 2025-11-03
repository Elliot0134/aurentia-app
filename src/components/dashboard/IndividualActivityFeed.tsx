import { Button } from '@/components/ui/button';
import { useIndividualActivities } from '@/hooks/useIndividualActivities';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Activity, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IndividualActivityFeedProps {
  limit?: number;
  showLoadMore?: boolean;
  className?: string;
}

export const IndividualActivityFeed = ({
  limit = 15,
  showLoadMore = true,
  className
}: IndividualActivityFeedProps) => {
  const { activities, loading, loadingMore, hasMore, loadMore, error } = useIndividualActivities(limit);

  if (loading) {
    return (
      <div className={cn("spinner-container", className)}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("error-state", className)}>
        <Activity className="error-state-icon" />
        <h3 className="error-state-title">Erreur de chargement</h3>
        <p className="error-state-message">{error}</p>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className={cn("empty-state", className)}>
        <Activity className="empty-state-icon" />
        <h3 className="empty-state-title">Aucune activité récente</h3>
        <p className="empty-state-description">
          Commencez à travailler sur vos projets pour voir votre activité ici
        </p>
      </div>
    );
  }

  // Grouper les activités par date
  const groupedActivities = activities.reduce((groups: any, activity) => {
    const date = new Date(activity.created_at);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    let dateLabel: string;
    if (date.toDateString() === today.toDateString()) {
      dateLabel = "Aujourd'hui";
    } else if (date.toDateString() === yesterday.toDateString()) {
      dateLabel = 'Hier';
    } else if (date > weekAgo) {
      dateLabel = 'Cette semaine';
    } else {
      dateLabel = 'Plus ancien';
    }

    if (!groups[dateLabel]) {
      groups[dateLabel] = [];
    }
    groups[dateLabel].push(activity);
    return groups;
  }, {});

  const groupOrder = ["Aujourd'hui", 'Hier', 'Cette semaine', 'Plus ancien'];

  return (
    <div className={cn("space-y-4", className)}>
      {groupOrder.map((group) => {
        if (!groupedActivities[group] || groupedActivities[group].length === 0) {
          return null;
        }

        return (
          <div key={group}>
            <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3 px-2">{group}</h3>
            <div className="space-y-2">
              {groupedActivities[group].map((activity: any) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-4 bg-[#f4f4f5] rounded-lg hover:bg-[#e8e8e9] transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#ff592b]/10 flex items-center justify-center text-lg transition-transform duration-200 group-hover:scale-110">
                    {activity.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary">
                      {activity.title}
                    </p>
                    <p className="text-sm text-text-muted mt-0.5">
                      {activity.description}
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                      {formatDistanceToNow(new Date(activity.created_at), {
                        addSuffix: true,
                        locale: fr
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {showLoadMore && hasMore && (
        <div className="text-center pt-4">
          <Button
            onClick={loadMore}
            disabled={loadingMore}
            className="btn-secondary w-full"
          >
            {loadingMore ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Chargement...
              </>
            ) : (
              'Charger plus'
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
