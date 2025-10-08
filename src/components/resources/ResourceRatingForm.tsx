import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { useSubmitResourceRating } from '@/hooks/useResourceRatings';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ResourceRatingFormProps {
  resourceId: string;
  onSuccess?: () => void;
  existingRating?: number;
  existingComment?: string;
}

const ResourceRatingForm: React.FC<ResourceRatingFormProps> = ({
  resourceId,
  onSuccess,
  existingRating,
  existingComment
}) => {
  const [rating, setRating] = useState(existingRating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState(existingComment || '');
  
  const submitRatingMutation = useSubmitResourceRating();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error('Veuillez sélectionner une note');
      return;
    }

    submitRatingMutation.mutate(
      {
        resourceId,
        rating,
        comment: comment.trim() || undefined
      },
      {
        onSuccess: () => {
          toast.success(existingRating ? 'Note mise à jour !' : 'Merci pour votre avis !');
          onSuccess?.();
        },
        onError: () => {
          toast.error('Erreur lors de l\'envoi de votre avis');
        }
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Sélection des étoiles */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Votre note
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="p-1 hover:scale-110 transition-transform"
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => setRating(star)}
            >
              <Star
                className={cn(
                  "h-6 w-6 transition-colors",
                  star <= (hoveredRating || rating)
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300"
                )}
              />
            </button>
          ))}
        </div>
        {rating > 0 && (
          <p className="text-sm text-muted-foreground mt-1">
            {rating === 1 && "Décevant"}
            {rating === 2 && "Moyen"}
            {rating === 3 && "Correct"}
            {rating === 4 && "Bon"}
            {rating === 5 && "Excellent"}
          </p>
        )}
      </div>

      {/* Commentaire optionnel */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Commentaire (optionnel)
        </label>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Partagez votre expérience avec cette ressource..."
          rows={3}
          maxLength={500}
        />
        <p className="text-xs text-muted-foreground mt-1">
          {comment.length}/500 caractères
        </p>
      </div>

      {/* Bouton de soumission */}
      <Button
        type="submit"
        disabled={rating === 0 || submitRatingMutation.isPending}
        className="w-full bg-[#F86E19] hover:bg-[#E55A00]"
      >
        {submitRatingMutation.isPending ? (
          <>
            <div className="animate-spin w-4 h-4 border border-white border-t-transparent rounded-full mr-2" />
            Envoi en cours...
          </>
        ) : existingRating ? (
          'Mettre à jour mon avis'
        ) : (
          'Publier mon avis'
        )}
      </Button>
    </form>
  );
};

export default ResourceRatingForm;