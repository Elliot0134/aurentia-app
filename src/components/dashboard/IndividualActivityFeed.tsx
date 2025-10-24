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
      <div className={cn("flex items-center justify-center py-8", className)}>
        <Loader2 className="h-6 w-6 animate-spin text-aurentia-pink" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("text-center py-8", className)}>
        <p className="text-red-600">Erreur: {error}</p>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className={cn("text-center py-8", className)}>
        <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Aucune activité récente</p>
        <p className="text-sm text-gray-500 mt-1">
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
            <h3 className="text-sm font-semibold text-gray-700 mb-2 px-2">{group}</h3>
            <div className="space-y-2">
              {groupedActivities[group].map((activity: any) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 bg-white border rounded-lg hover:border-aurentia-pink/30 hover:shadow-sm transition-all cursor-pointer"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-aurentia-pink/10 flex items-center justify-center text-lg">
                    {activity.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-600 mt-0.5">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
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
            variant="outline"
            onClick={loadMore}
            disabled={loadingMore}
            className="w-full"
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
