import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, Plus, ThumbsUp, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Review {
  id: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
  verified: boolean;
  helpful?: number;
}

interface ReviewSectionProps {
  resourceId: string;
  reviews?: Review[];
  averageRating?: number;
  totalReviews?: number;
  canAddReview?: boolean;
  onAddReview?: (rating: number, comment: string) => Promise<void>;
  className?: string;
}

const ReviewCard: React.FC<{ review: Review }> = ({ review }) => {
  const getInitials = (firstName: string, lastName: string) => {
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#F86E19]/10 rounded-full flex items-center justify-center">
            <span className="text-[#F86E19] font-semibold text-sm">
              {getInitials(review.user.firstName, review.user.lastName)}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">
                {review.user.firstName} {review.user.lastName}
              </span>
              {review.verified && (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-4 w-4",
                      i < review.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    )}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">
                {format(new Date(review.createdAt), 'dd MMMM yyyy', { locale: fr })}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <p className="text-gray-700 leading-relaxed">{review.comment}</p>
      
      {review.helpful && (
        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
            <ThumbsUp className="h-4 w-4 mr-1" />
            Utile ({review.helpful})
          </Button>
        </div>
      )}
    </div>
  );
};

const ReviewForm: React.FC<{
  onSubmit: (rating: number, comment: string) => Promise<void>;
  onCancel: () => void;
}> = ({ onSubmit, onCancel }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error('Veuillez sélectionner une note');
      return;
    }
    
    if (comment.trim().length < 10) {
      toast.error('Votre commentaire doit contenir au moins 10 caractères');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(rating, comment.trim());
      setRating(0);
      setComment('');
      onCancel();
      toast.success('Votre avis a été publié avec succès !');
    } catch (error) {
      toast.error('Erreur lors de la publication de votre avis');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
      <h4 className="font-semibold text-lg">Laisser un avis</h4>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Note *
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="p-1 hover:scale-110 transition-transform"
              onClick={() => setRating(star)}
            >
              <Star
                className={cn(
                  "h-6 w-6",
                  star <= rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300 hover:text-yellow-200"
                )}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Commentaire *
        </label>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Partagez votre expérience avec cette ressource..."
          className="min-h-[100px]"
          maxLength={500}
        />
        <div className="text-right text-sm text-gray-500 mt-1">
          {comment.length}/500
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={isSubmitting || rating === 0 || comment.trim().length < 10}
          className="bg-[#F86E19] hover:bg-[#E55A0E] text-white"
        >
          {isSubmitting ? 'Publication...' : 'Publier l\'avis'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Annuler
        </Button>
      </div>
    </form>
  );
};

const ReviewSection: React.FC<ReviewSectionProps> = ({
  resourceId,
  reviews = [],
  averageRating = 0,
  totalReviews = 0,
  canAddReview = false,
  onAddReview,
  className
}) => {
  const [showReviewForm, setShowReviewForm] = useState(false);

  const handleAddReview = async (rating: number, comment: string) => {
    if (onAddReview) {
      await onAddReview(rating, comment);
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-2">
            💬 Avis des clients
          </h3>
          {totalReviews > 0 && (
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-5 w-5",
                        i < Math.floor(averageRating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      )}
                    />
                  ))}
                </div>
                <span className="font-semibold text-lg">{averageRating.toFixed(1)}</span>
                <span className="text-gray-600">({totalReviews} avis)</span>
              </div>
            </div>
          )}
        </div>
        
        {canAddReview && !showReviewForm && (
          <Button
            variant="outline"
            onClick={() => setShowReviewForm(true)}
            className="border-[#F86E19] text-[#F86E19] hover:bg-[#F86E19] hover:text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un avis
          </Button>
        )}
      </div>

      {showReviewForm && (
        <ReviewForm
          onSubmit={handleAddReview}
          onCancel={() => setShowReviewForm(false)}
        />
      )}

      <div className="space-y-4">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg">Aucun avis pour le moment</p>
            <p className="text-sm">Soyez le premier à partager votre expérience !</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewSection;