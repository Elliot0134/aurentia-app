import React, { useState } from 'react';
import { useActionPlanData, HierarchicalElement } from '@/hooks/useActionPlanData';
import ActionPlanClassification from './ActionPlanClassification';
import ActionPlanLivrables from './ActionPlanLivrables';
import ActionPlanHierarchy from './ActionPlanHierarchy';
import ActionPlanModal from './ActionPlanModal';

const ActionPlanTestPage: React.FC = () => {
  const [selectedElement, setSelectedElement] = useState<HierarchicalElement | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Forcer le chargement des données mockées avec un projectId factice
  const { data: actionPlanData, isLoading, error } = useActionPlanData('test-project-id');

  const handleElementClick = (element: HierarchicalElement) => {
    setSelectedElement(element);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedElement(null);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aurentia-orange"></div>
          <span className="ml-3 text-gray-600">Chargement du plan d'action...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Erreur lors du chargement : {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Test - Plan d'action complet</h1>
        <p className="text-gray-600 text-base">
          Prévisualisation de tous les composants du plan d'action avec données mockées
        </p>
      </div>

      {actionPlanData && (
        <>
          {/* Section 1: Classification du projet */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-blue-600">Section 1: Classification</h2>
            <ActionPlanClassification 
              userResponses={actionPlanData.userResponses}
              classificationProjet={actionPlanData.classificationProjet}
            />
          </div>

          {/* Section 2: Livrables */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-green-600">Section 2: Livrables</h2>
            <ActionPlanLivrables 
              livrables={actionPlanData.livrables}
            />
          </div>

          {/* Section 3: Hiérarchie */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-purple-600">Section 3: Hiérarchie</h2>
            <ActionPlanHierarchy 
              hierarchicalData={actionPlanData.hierarchicalData}
              onElementClick={handleElementClick}
            />
          </div>

          {/* Modal de détails */}
          <ActionPlanModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            element={selectedElement}
          />

          {/* Statistiques pour test */}
          <div className="bg-gray-50 rounded-lg p-6 mt-8">
            <h3 className="text-lg font-semibold mb-4">Statistiques des données de test</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {actionPlanData.hierarchicalData.length}
                </div>
                <div className="text-sm text-gray-600">Éléments total</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {actionPlanData.hierarchicalData.filter(e => e.type === 'phase').length}
                </div>
                <div className="text-sm text-gray-600">Phases</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {actionPlanData.hierarchicalData.filter(e => e.type === 'jalon').length}
                </div>
                <div className="text-sm text-gray-600">Jalons</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {actionPlanData.hierarchicalData.filter(e => e.type === 'tache').length}
                </div>
                <div className="text-sm text-gray-600">Tâches</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ActionPlanTestPage;