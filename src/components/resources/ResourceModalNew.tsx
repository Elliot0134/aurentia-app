import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Loader2, X, Star } from 'lucide-react';
import { ResourceWithStats } from '@/types/resources';
import { cn } from '@/lib/utils';
import { useResourceDownload } from '@/hooks/useResourcesNew';
import { toast } from 'sonner';
import ImageSlider from './ImageSlider';
import FAQAccordion from './FAQAccordion';
import ReviewSection from './ReviewSection';

interface ResourceModalProps {
  resource: ResourceWithStats | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleFavorite: () => void;
  isFavorite: boolean;
}

const ResourceModal: React.FC<ResourceModalProps> = ({
  resource,
  isOpen,
  onClose,
  onToggleFavorite,
  isFavorite
}) => {
  const downloadMutation = useResourceDownload();
  
  // États pour les nouvelles fonctionnalités
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Incrémenter les vues à l'ouverture
  useEffect(() => {
    if (resource && isOpen) {
      console.log(`Vue ajoutée pour la ressource ${resource.id}`);
    }
  }, [resource, isOpen]);

  if (!resource) return null;

  // Préparer les images pour le slider
  const images = [
    resource.image_url,
    resource.image_2_url,
    resource.image_3_url,
    resource.image_4_url
  ].filter(Boolean) as string[];

  // Préparer la liste "Inclus dans le pack" par défaut
  const defaultIncludedItems = [
    { emoji: '✅', text: 'Plus de 350 prompts testés et optimisés' },
    { emoji: '✅', text: '18 catégories complètes de business' },
    { emoji: '✅', text: 'Prompts pour débutants et experts' },
    { emoji: '✅', text: 'Guide d\'utilisation inclus' },
    { emoji: '✅', text: 'Templates de conversations avancées' },
    { emoji: '✅', text: 'Stratégies de vente et marketing' },
    { emoji: '✅', text: 'Outils de création de contenu' },
    { emoji: '✅', text: 'Systèmes d\'automatisation' },
    { emoji: '✅', text: 'Prompts pour réseaux sociaux' },
    { emoji: '✅', text: 'Solutions e-commerce et tunnels de vente' },
    { emoji: '✅', text: 'Techniques de copywriting éprouvées' },
    { emoji: '✅', text: 'Stratégies SEO et génération de leads' }
  ];

  const includedItems = resource.included_items && resource.included_items.length > 0 
    ? resource.included_items 
    : defaultIncludedItems;

  // Préparer les FAQ
  const faqItems = [
    resource.faq_question_1 && resource.faq_answer_1 && {
      question: resource.faq_question_1,
      answer: resource.faq_answer_1
    },
    resource.faq_question_2 && resource.faq_answer_2 && {
      question: resource.faq_question_2,
      answer: resource.faq_answer_2
    },
    resource.faq_question_3 && resource.faq_answer_3 && {
      question: resource.faq_question_3,
      answer: resource.faq_answer_3
    }
  ].filter(Boolean) as Array<{ question: string; answer: string }>;

  // Mock reviews pour démonstration
  const mockReviews = [
    {
      id: '1',
      user: { firstName: 'Marie', lastName: 'Dubois', email: 'marie@example.com' },
      rating: 5,
      comment: 'Excellente ressource ! Très bien documentée et facile à utiliser.',
      createdAt: '2024-01-15T10:30:00Z',
      verified: true,
      helpful: 12
    },
    {
      id: '2',
      user: { firstName: 'Thomas', lastName: 'Martin', email: 'thomas@example.com' },
      rating: 4,
      comment: 'Très utile pour mon projet. Quelques améliorations possibles mais globalement satisfait.',
      createdAt: '2024-01-10T14:20:00Z',
      verified: true,
      helpful: 8
    }
  ];

  const handlePurchase = async () => {
    setPurchasing(true);
    try {
      // Logique d'achat (déduire les crédits, débloquer la ressource, etc.)
      // await purchaseResource(resource.id);
      handleDownload();
      toast.success('Achat réussi ! Téléchargement en cours...');
    } catch (error) {
      toast.error('Erreur lors de l\'achat');
    } finally {
      setPurchasing(false);
    }
  };

  const handleDownload = () => {
    if (resource.file_url) {
      downloadMutation.mutate(
        resource.id,
        {
          onSuccess: () => {
            // Ouvrir le lien de téléchargement
            window.open(resource.file_url, '_blank');
            toast.success('Téléchargement démarré !');
          },
          onError: () => {
            toast.error('Erreur lors du téléchargement');
          }
        }
      );
    } else {
      toast.error('Lien de téléchargement non disponible');
    }
  };

  const handleAddReview = async (rating: number, comment: string) => {
    // Logique pour ajouter un avis
    console.log('Avis ajouté:', { rating, comment, resourceId: resource.id });
    // Ici, vous ajouteriez l'appel à votre API
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header fixe */}
        <div className="sticky top-0 z-50 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h1 className="text-2xl font-bold truncate pr-4">
            {resource.name}
          </h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full flex-shrink-0"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Contenu principal */}
        <div className="grid lg:grid-cols-2 gap-8 p-6 lg:p-8 max-h-[calc(90vh-80px)] overflow-hidden">
          {/* Section Gauche - Images Fixes */}
          <div className="lg:sticky lg:top-8 h-fit">
            <div className="relative">
              <ImageSlider
                images={images}
                activeIndex={activeImageIndex}
                onIndexChange={setActiveImageIndex}
              />
              
              {/* Bouton favori en overlay */}
              <div className="absolute top-4 right-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-10 w-10 p-0 rounded-full bg-white/90 backdrop-blur-sm",
                    isFavorite && "bg-[#F86E19]/10"
                  )}
                  onClick={onToggleFavorite}
                >
                  <Heart 
                    className={cn(
                      "h-5 w-5",
                      isFavorite ? "text-[#F86E19] fill-[#F86E19]" : "text-gray-600"
                    )} 
                  />
                </Button>
              </div>
            </div>
          </div>

          {/* Section Droite - Scrollable */}
          <div className="overflow-y-auto max-h-[80vh] pr-4 space-y-8">
            {/* En-tête */}
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-4">
                {resource.name}
              </h1>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-6">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-current" />
                  ))}
                </div>
                <span className="text-gray-600">
                  {resource.rating_count || 3} avis
                </span>
              </div>

              {/* Prix */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <img src="/credit-3D.png" alt="Crédit" className="w-8 h-8" />
                  <span className="text-4xl font-bold">{resource.price}</span>
                  <span className="text-xl text-gray-600">crédits</span>
                </div>
                <p className="text-sm text-gray-600">Taxes incluses</p>
              </div>

              {/* Description */}
              <div className="prose mb-6">
                <div className="text-xl font-bold text-center py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg mb-4">
                  🔥 ENFIN L'ARME SECRÈTE QUE VOUS ATTENDIEZ 🔥
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {resource.detailed_description || resource.description}
                </p>
              </div>

              {/* Bouton Achat */}
              <Button 
                onClick={handlePurchase}
                disabled={purchasing}
                className="w-full bg-[#FFC439] hover:bg-[#FFD666] text-black font-semibold py-4 px-6 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg mb-8"
              >
                {purchasing ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Traitement...
                  </>
                ) : (
                  'Payer avec PayPal'
                )}
              </Button>
            </div>

            {/* Inclus dans le pack */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Inclus dans le pack</h2>
              <ul className="space-y-3">
                {includedItems.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-green-500 text-xl mt-0.5">{item.emoji}</span>
                    <span className="text-gray-700">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pourquoi choisir */}
            {(resource.reason_1_title || resource.reason_2_title || resource.reason_3_title) && (
              <div>
                <h2 className="text-2xl font-bold mb-6">
                  Pourquoi choisir cette template
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  {resource.reason_1_title && (
                    <div className="bg-black/5 rounded-xl p-6 hover:bg-black/8 transition-all duration-200">
                      <h3 className="font-semibold mb-2 text-emerald-700">
                        {resource.reason_1_title}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {resource.reason_1_text}
                      </p>
                    </div>
                  )}
                  
                  {resource.reason_2_title && (
                    <div className="bg-black/5 rounded-xl p-6 hover:bg-black/8 transition-all duration-200">
                      <h3 className="font-semibold mb-2 text-emerald-700">
                        {resource.reason_2_title}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {resource.reason_2_text}
                      </p>
                    </div>
                  )}
                  
                  {resource.reason_3_title && (
                    <div className="bg-black/5 rounded-xl p-6 hover:bg-black/8 transition-all duration-200">
                      <h3 className="font-semibold mb-2 text-emerald-700">
                        {resource.reason_3_title}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {resource.reason_3_text}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* FAQ */}
            {faqItems.length > 0 && (
              <div className="bg-[#EDEBE6] rounded-2xl p-6">
                <h2 className="text-2xl font-bold mb-4">FAQ</h2>
                <FAQAccordion items={faqItems} />
              </div>
            )}

            {/* Avis */}
            <ReviewSection
              resourceId={resource.id}
              reviews={mockReviews}
              averageRating={resource.average_rating || 4.5}
              totalReviews={resource.rating_count || 3}
              canAddReview={true}
              onAddReview={handleAddReview}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceModal;