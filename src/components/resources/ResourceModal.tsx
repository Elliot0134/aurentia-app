import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Download, Star, Eye, Clock, Calendar, Tag, ExternalLink, ShoppingCart, ChevronDown, Loader2, Plus, X } from 'lucide-react';
import { ResourceWithStats } from '@/types/resources';
import { cn } from '@/lib/utils';
import { useResourceDownload } from '@/hooks/useResourcesNew';
import { useCredits } from '@/hooks/useCreditsSimple';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import ResourceRatingForm from './ResourceRatingForm';
import ResourceRatingsList from './ResourceRatingsList';

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
  const { consumeCredits, totalRemaining } = useCredits();
  
  // États pour les nouvelles fonctionnalités
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
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

  if (!resource) return null;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Débutant':
        return 'bg-green-100 text-green-800';
      case 'Intermédiaire':
        return 'bg-orange-100 text-orange-800';
      case 'Avancé':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'notion':
        return '📝';
      case 'canva':
        return '🎨';
      case 'pdf':
        return '📄';
      case 'template':
        return '📋';
      case 'guide':
        return '📖';
      case 'video':
        return '🎥';
      case 'audio':
        return '🎧';
      case 'tool':
        return '🛠️';
      default:
        return '📄';
    }
  };

  const toggleFaq = (faqNumber: number) => {
    setOpenFaq(openFaq === faqNumber ? null : faqNumber);
  };

  const handlePurchase = async () => {
    setPurchasing(true);
    try {
      // Vérifier si l'utilisateur a assez de crédits
      if (totalRemaining < resource.price) {
        toast.error(`Crédits insuffisants. Vous avez ${totalRemaining} crédits, ${resource.price} requis.`);
        setPurchasing(false);
        return;
      }

      // Déduire les crédits
      const result = await consumeCredits(resource.price);
      
      if (result.success) {
        // Lancer le téléchargement après l'achat réussi
        handleDownload();
        toast.success('Achat réussi ! Téléchargement en cours...');
      } else {
        toast.error(result.error || 'Erreur lors de l\'achat');
      }
    } catch (error) {
      console.error('Erreur lors de l\'achat:', error);
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="resource-modal-content w-[80%] max-w-[95vw] max-h-[90vh] p-0 overflow-hidden rounded-2xl">
        {/* Navbar fixe */}
        <div className="sticky top-0 z-50 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <DialogTitle className="text-xl font-bold">
            {resource.name}
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Contenu scrollable */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
          {/* Section Header (2 colonnes) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
            {/* COLONNE GAUCHE - Image carrée */}
            <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
              {resource.image_url ? (
                <img 
                  src={resource.image_url} 
                  alt={resource.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl">
                  {getTypeIcon(resource.type)}
                </div>
              )}
              
              {/* Bouton favori en overlay top-right */}
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

            {/* COLONNE DROITE - Informations */}
            <div className="flex flex-col justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-3">{resource.name}</h2>
                
                {/* Avis avec étoiles UNIQUEMENT */}
                <div className="flex items-center gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        "h-5 w-5",
                        star <= Math.round(resource.average_rating || 0)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      )}
                    />
                  ))}
                  <span className="text-sm text-gray-600 ml-1">
                    ({resource.rating_count || 0} avis)
                  </span>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className={getDifficultyColor(resource.difficulty)}>
                    {resource.difficulty}
                  </Badge>
                  <Badge variant="outline">{resource.category}</Badge>
                  <Badge variant="outline">{resource.type}</Badge>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 text-sm text-gray-600 mb-6">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{resource.view_count} vues</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Download className="h-4 w-4" />
                    <span>{resource.download_count} téléchargements</span>
                  </div>
                </div>

                {/* Description détaillée */}
                <div className="mb-6">
                  <p className="text-gray-700 leading-relaxed">
                    {resource.detailed_description || resource.description}
                  </p>
                </div>
              </div>

              {/* Prix + Bouton Acheter */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2">
                  <img src="/credit-3D.png" alt="Crédit" className="w-8 h-8" />
                  <span className="text-3xl font-bold">{resource.price}</span>
                  <span className="text-gray-600">crédits</span>
                </div>
                
                <Button
                  size="lg"
                  className="bg-[#F86E19] hover:bg-[#E55A00] text-white px-8"
                  onClick={handlePurchase}
                  disabled={purchasing}
                >
                  {purchasing ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Achat en cours...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Acheter
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Section "Pourquoi choisir cette template ?" */}
          {(resource.reason_1_title || resource.reason_2_title || resource.reason_3_title) && (
            <div className="px-6 py-8 bg-gradient-to-br from-emerald-50 to-teal-50">
              <h3 className="text-2xl font-bold text-center mb-8">
                Pourquoi choisir cette template ?
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {/* Container 1 */}
                {resource.reason_1_title && (
                  <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
                    <h4 className="text-lg font-semibold mb-3 text-emerald-700">
                      {resource.reason_1_title}
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      {resource.reason_1_text}
                    </p>
                  </div>
                )}
                
                {/* Container 2 */}
                {resource.reason_2_title && (
                  <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
                    <h4 className="text-lg font-semibold mb-3 text-emerald-700">
                      {resource.reason_2_title}
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      {resource.reason_2_text}
                    </p>
                  </div>
                )}
                
                {/* Container 3 */}
                {resource.reason_3_title && (
                  <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
                    <h4 className="text-lg font-semibold mb-3 text-emerald-700">
                      {resource.reason_3_title}
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      {resource.reason_3_text}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section "Inclus dans la template" */}
          {includedItems && includedItems.length > 0 && (
            <div className="px-6 py-8 bg-white">
              <h3 className="text-2xl font-bold mb-6">✨ Inclus dans la template</h3>
              
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-4xl">
                {includedItems.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">{item.emoji}</span>
                    <span className="text-gray-700 pt-1">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Section Avis - PLEINE LARGEUR */}
          <div className="px-6 py-8 bg-gray-50">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">💬 Avis des clients</h3>
                <Button
                  variant="outline"
                  onClick={() => setShowReviewForm(!showReviewForm)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un avis
                </Button>
              </div>

              {/* Formulaire d'ajout d'avis (conditionnel) */}
              {showReviewForm && (
                <div className="mb-6 bg-white p-6 rounded-lg shadow-md">
                  <ResourceRatingForm
                    resourceId={resource.id}
                    onSuccess={() => {
                      setShowReviewForm(false);
                      toast.success('Avis ajouté avec succès !');
                    }}
                  />
                </div>
              )}

              {/* Liste des avis */}
              <div className="space-y-4">
                <ResourceRatingsList resourceId={resource.id} />
              </div>
            </div>
          </div>

          {/* Section FAQ */}
          {(resource.faq_question_1 || resource.faq_question_2 || resource.faq_question_3) && (
            <div className="px-6 py-8 bg-white">
              <h3 className="text-2xl font-bold mb-6">❓ Questions fréquentes</h3>
              
              <div className="max-w-4xl mx-auto space-y-3">
                {/* Question 1 */}
                {resource.faq_question_1 && (
                  <div className="bg-gray-50 rounded-lg overflow-hidden">
                    <button
                      className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-100 transition-colors"
                      onClick={() => toggleFaq(1)}
                    >
                      <span className="font-semibold">{resource.faq_question_1}</span>
                      <ChevronDown 
                        className={cn(
                          "h-5 w-5 transition-transform",
                          openFaq === 1 && "rotate-180"
                        )} 
                      />
                    </button>
                    {openFaq === 1 && (
                      <div className="px-6 pb-4 text-gray-700">
                        {resource.faq_answer_1}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Question 2 */}
                {resource.faq_question_2 && (
                  <div className="bg-gray-50 rounded-lg overflow-hidden">
                    <button
                      className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-100 transition-colors"
                      onClick={() => toggleFaq(2)}
                    >
                      <span className="font-semibold">{resource.faq_question_2}</span>
                      <ChevronDown 
                        className={cn(
                          "h-5 w-5 transition-transform",
                          openFaq === 2 && "rotate-180"
                        )} 
                      />
                    </button>
                    {openFaq === 2 && (
                      <div className="px-6 pb-4 text-gray-700">
                        {resource.faq_answer_2}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Question 3 */}
                {resource.faq_question_3 && (
                  <div className="bg-gray-50 rounded-lg overflow-hidden">
                    <button
                      className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-100 transition-colors"
                      onClick={() => toggleFaq(3)}
                    >
                      <span className="font-semibold">{resource.faq_question_3}</span>
                      <ChevronDown 
                        className={cn(
                          "h-5 w-5 transition-transform",
                          openFaq === 3 && "rotate-180"
                        )} 
                      />
                    </button>
                    {openFaq === 3 && (
                      <div className="px-6 pb-4 text-gray-700">
                        {resource.faq_answer_3}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResourceModal;