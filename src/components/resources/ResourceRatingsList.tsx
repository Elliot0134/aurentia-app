import React from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { useResourceRatings } from '@/hooks/useResourceRatings';
import { ResourceRating } from '@/types/resources';
import { cn } from '@/lib/utils';

interface ResourceRatingsListProps {
  resourceId: string;
}

const ResourceRatingsList: React.FC<ResourceRatingsListProps> = ({ resourceId }) => {
  const { data: ratings = [], isLoading, error } = useResourceRatings(resourceId);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return 'Décevant';
      case 2: return 'Moyen';
      case 3: return 'Correct';
      case 4: return 'Bon';
      case 5: return 'Excellent';
      default: return '';
    }
  };

  const getAverageRating = () => {
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
    return Math.round((sum / ratings.length) * 10) / 10;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-red-600">Erreur lors du chargement des avis</p>
      </div>
    );
  }

  if (ratings.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun avis pour le moment</h3>
        <p className="text-muted-foreground">
          Soyez le premier à partager votre expérience avec cette ressource !
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Résumé des notes */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
            <span className="text-xl font-bold">{getAverageRating()}</span>
            <span className="text-muted-foreground">sur 5</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {ratings.length} avis
          </span>
        </div>
        
        {/* Distribution des notes */}
        <div className="space-y-1">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = ratings.filter(r => r.rating === star).length;
            const percentage = ratings.length > 0 ? (count / ratings.length) * 100 : 0;
            
            return (
              <div key={star} className="flex items-center gap-2 text-xs">
                <span className="w-4">{star}</span>
                <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-8 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Liste des avis */}
      <div className="space-y-4">
        {ratings.map((rating) => (
          <div key={rating.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {/* Étoiles */}
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        "h-4 w-4",
                        star <= rating.rating
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      )}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium">
                  {getRatingText(rating.rating)}
                </span>
              </div>
              <time className="text-xs text-muted-foreground">
                {formatDate(rating.created_at)}
              </time>
            </div>
            
            {rating.comment && (
              <p className="text-sm text-gray-700 leading-relaxed">
                {rating.comment}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResourceRatingsList;