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

  const statusDisplay = getStatusDisplay(deliverable.status);

  // Mapping des icônes vers les images
  const getIconImage = (key: string) => {
    const iconMap: { [key: string]: string } = {
      'concurrence': '/icones-livrables/concurrence-icon.png',
      'pestel': '/icones-livrables/market-icon.png',
      'proposition_valeur': '/icones-livrables/proposition-valeur-icon.png',
      'business_model': '/icones-livrables/business-model-icon.png',
      'ressources': '/icones-livrables/ressources-icon.png'
    };
    return iconMap[key] || '/icones-livrables/market-icon.png';
  };

  return (
    <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
      {/* Icône et nom du livrable */}
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-md flex items-center justify-center"
          style={{ backgroundColor: deliverable.color }}
        >
          <img
            src={getIconImage(deliverable.key)}
            alt={deliverable.name}
            className="w-5 h-5 object-contain filter brightness-0 invert"
          />
        </div>
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