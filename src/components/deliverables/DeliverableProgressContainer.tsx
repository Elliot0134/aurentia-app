import React from 'react';
import { DeliverableStatus } from '@/hooks/useDeliverableProgress';

interface DeliverableProgressContainerProps {
  deliverable: DeliverableStatus;
}

const DeliverableProgressContainer: React.FC<DeliverableProgressContainerProps> = ({ deliverable }) => {
  const getStatusDisplay = (status: string | null) => {
    if (!status) return { text: 'En attente', style: 'bg-gray-200 text-gray-600' };
    
    switch (status.toLowerCase()) {
      case 'completed':
      case 'terminé':
      case 'complete':
        return { text: 'Terminé', style: 'bg-green-100 text-green-700' };
      case 'in_progress':
      case 'en_cours':
      case 'processing':
        return { text: 'En cours', style: 'bg-blue-100 text-blue-700' };
      case 'pending':
      case 'en_attente':
        return { text: 'En attente', style: 'bg-gray-200 text-gray-600' };
      default:
        return { text: 'En cours', style: 'bg-blue-100 text-blue-700' };
    }
  };

  // Utiliser le statut juridique si le livrable est "juridique"
  const currentStatus = deliverable.key === 'juridique' ? deliverable.statut_juridique : deliverable.status;
  const statusDisplay = getStatusDisplay(currentStatus);

  // Mapping des icônes vers les images
  const getIconImage = (key: string) => {
    const iconMap: { [key: string]: string } = {
      'concurrence': '/icones-livrables/concurrence-icon.png',
      'pestel': '/icones-livrables/market-icon.png',
      'proposition_valeur': '/icones-livrables/proposition-valeur-icon.png',
      'business_model': '/icones-livrables/business-model-icon.png',
      'ressources': '/icones-livrables/ressources-icon.png',
      'juridique': '/icones-livrables/juridique-icon.png' // Ajout de l'icône juridique
    };
    return iconMap[key] || '/icones-livrables/market-icon.png';
  };

  return (
    <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
      {/* Icône et nom du livrable */}
      <div className="flex items-center gap-3">
          <img
            src={getIconImage(deliverable.key)}
            alt={deliverable.name}
            className="w-8 h-8 object-contain"
          />
        <span className="text-sm font-medium text-gray-800">
          {deliverable.name}
        </span>
      </div>

      {/* Statut */}
      <div className={`px-2 py-1 rounded-full text-xs font-medium ${statusDisplay.style}`}>
        {statusDisplay.text}
      </div>
    </div>
  );
};

export default DeliverableProgressContainer;
