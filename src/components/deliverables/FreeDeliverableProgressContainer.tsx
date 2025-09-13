import React from 'react';
import { FreeDeliverableStatus } from '@/hooks/useFreeDeliverableProgress';

interface FreeDeliverableProgressContainerProps {
  deliverable: FreeDeliverableStatus;
}

const FreeDeliverableProgressContainer: React.FC<FreeDeliverableProgressContainerProps> = ({ deliverable }) => {
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

  return (
    <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
      {/* Icône et nom du livrable */}
      <div className="flex items-center gap-4">
        <img
          src={deliverable.icon}
          alt={deliverable.name}
          className="w-8 h-8 object-contain"
        />
        <span className="text-base text-gray-800">
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

export default FreeDeliverableProgressContainer;
