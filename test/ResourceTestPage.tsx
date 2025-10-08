// Test script pour valider l'implémentation de la page de détails des ressources
// Ce fichier peut être utilisé pour tester les composants de manière isolée

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ResourceModal from '../src/components/resources/ResourceModal';
import ResourceCard from '../src/components/resources/ResourceCard';
import { ResourceWithStats } from '../src/types/resources';

// Données de test pour la démonstration
const mockResource: ResourceWithStats = {
  id: 'test-1',
  name: 'Template Business Plan Complet',
  description: 'Un template professionnel pour créer votre business plan',
  detailed_description: 'Ce template complet vous guide étape par étape dans la création d\'un business plan professionnel. Il inclut tous les éléments essentiels pour convaincre vos investisseurs.',
  category: 'Business Plan',
  type: 'template',
  price: 25,
  image_url: 'https://example.com/business-plan.jpg',
  image_2_url: 'https://example.com/business-plan-2.jpg',
  tags: ['business', 'template', 'professionnel'],
  difficulty: 'Intermédiaire',
  estimated_time: '2-3 heures',
  view_count: 1247,
  download_count: 89,
  file_url: 'https://example.com/download/business-plan.zip',
  
  // Nouvelles données FAQ
  faq_question_1: 'Ce template est-il compatible avec Word ?',
  faq_answer_1: 'Oui, ce template est fourni aux formats Word (.docx) et Google Docs pour une compatibilité maximale.',
  faq_question_2: 'Y a-t-il des exemples inclus ?',
  faq_answer_2: 'Absolument ! Le template contient 3 exemples complets de business plans pour différents secteurs.',
  faq_question_3: 'Puis-je personnaliser le design ?',
  faq_answer_3: 'Bien sûr ! Tous les éléments sont modifiables : couleurs, logos, mise en page, etc.',
  
  // Raisons de choisir
  reason_1_title: 'Template Professionnel',
  reason_1_text: 'Créé par des experts en business plan, ce template respecte les standards attendus par les investisseurs.',
  reason_2_title: 'Guide Détaillé',
  reason_2_text: 'Chaque section est accompagnée d\'instructions claires et d\'exemples pour vous guider.',
  reason_3_title: 'Format Universel',
  reason_3_text: 'Compatible avec tous les logiciels populaires (Word, Google Docs, Pages).',
  
  // Items inclus
  included_items: [
    { emoji: '📄', text: 'Template Business Plan (35 pages)' },
    { emoji: '📊', text: 'Modèles de tableaux financiers' },
    { emoji: '🎯', text: 'Guide de rédaction complet' },
    { emoji: '💡', text: '3 exemples de business plans' },
    { emoji: '🎨', text: 'Pack d\'icônes et graphiques' },
    { emoji: '📞', text: 'Support email pendant 30 jours' }
  ],
  
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-20T15:30:00Z',
  average_rating: 4.8,
  rating_count: 23,
  is_favorite: false
};

const queryClient = new QueryClient();

// Composant de test
const ResourceTestPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isFavorite, setIsFavorite] = React.useState(false);

  const handleCardClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const handleDownload = () => {
    console.log('Téléchargement simulé de:', mockResource.name);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="p-8 bg-gray-100 min-h-screen">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Test - Page de Détails des Ressources
        </h1>
        
        <div className="max-w-md mx-auto mb-8">
          <h2 className="text-xl font-semibold mb-4">ResourceCard (nouveau design)</h2>
          <ResourceCard
            resource={mockResource}
            onClick={handleCardClick}
            onToggleFavorite={handleToggleFavorite}
            onDownload={handleDownload}
            isFavorite={isFavorite}
            isDownloading={false}
          />
        </div>

        {/* Modal */}
        <ResourceModal
          resource={mockResource}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onToggleFavorite={handleToggleFavorite}
          isFavorite={isFavorite}
        />
      </div>
    </QueryClientProvider>
  );
};

export default ResourceTestPage;

/*
INSTRUCTIONS POUR TESTER:

1. Importer ce composant dans votre App.tsx ou créer une route de test
2. Cliquer sur la ResourceCard pour ouvrir le modal
3. Tester toutes les fonctionnalités :
   - ✅ Bouton "Acheter" au lieu de "Télécharger"
   - ✅ Modal avec layout 2 colonnes
   - ✅ Section "Pourquoi choisir" avec 3 containers
   - ✅ Section "Inclus dans la template" avec emojis
   - ✅ Section FAQ avec accordéons
   - ✅ Section Avis avec formulaire
   - ✅ Bouton favori fonctionnel
   - ✅ Responsive design

VALIDATION EXPECTED:
- Le bouton sur la card affiche "Acheter" avec icône panier
- Le modal s'ouvre avec toutes les sections
- Les accordéons FAQ sont fonctionnels
- Le formulaire d'avis s'affiche quand on clique "Ajouter un avis"
- Le design est responsive sur mobile/desktop
- Les couleurs orange (#F86E19) sont appliquées
*/