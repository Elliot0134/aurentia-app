import React from 'react';
import { useCredits } from '../../hooks/useCreditsSimple';
import { Loader2, Coins } from 'lucide-react';

interface CreditDisplayProps {
  compact?: boolean;
  className?: string;
}

export const CreditDisplay: React.FC<CreditDisplayProps> = ({
  compact = false,
  className = ""
}) => {
  const { monthlyRemaining, monthlyLimit, isLoading, error } = useCredits();

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
        <span className="text-sm text-gray-500">Chargement...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center gap-2 text-red-600 ${className}`}>
        <Coins className="h-4 w-4" />
        <span className="text-sm">Erreur</span>
      </div>
    );
  }

  if (compact) {
    // Affichage compact pour la sidebar
    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        <div className="flex items-center gap-2 py-2 px-3 rounded-md text-sm bg-gray-100">
          <Coins className="h-4 w-4 text-yellow-500" />
          <div className="flex flex-col">
            <span className="text-xs text-gray-600">Crédits mensuels</span>
            <span className="font-medium text-yellow-600">
              {monthlyRemaining}/{monthlyLimit}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Affichage complet
  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
          <Coins className="w-5 h-5 text-yellow-500" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gray-900">
              {monthlyRemaining}
            </span>
            <span className="text-sm text-gray-500">/ {monthlyLimit} crédits</span>
          </div>
          <div className="text-xs text-gray-500">
            Crédits restants (mensuels: {monthlyRemaining})
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditDisplay;
