import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SubscriptionGateProps {
  children: React.ReactNode;
  isBlocked: boolean;
  reason?: string;
  onUnlockClick?: () => void;
}

/**
 * SubscriptionGate component - Displays a blur overlay with unlock button for inactive subscriptions
 * Based on BlurredDeliverableWrapper pattern
 */
const SubscriptionGate: React.FC<SubscriptionGateProps> = ({
  children,
  isBlocked,
  reason,
  onUnlockClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  if (!isBlocked) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-[600px]">
      {/* Content (blurred when blocked) */}
      <div className={cn('transition-all duration-300', isBlocked && 'blur-sm pointer-events-none')}>
        {children}
      </div>

      {/* Overlay */}
      {isBlocked && (
        <div
          className="absolute inset-0 bg-white bg-opacity-50 z-10 flex items-center justify-center transition-all duration-300 min-h-[600px]"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Blur overlay (increases on hover) */}
          <div
            className={cn(
              'absolute inset-0 transition-all duration-300',
              isHovered ? 'backdrop-blur-md' : 'backdrop-blur-sm'
            )}
          />

          {/* Unlock card */}
          <div className="relative z-20 bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 transform transition-all duration-300 hover:scale-105">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-aurentia-pink to-aurentia-orange flex items-center justify-center shadow-lg">
                <Lock className="w-10 h-10 text-white" />
              </div>
            </div>

            {/* Title */}
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-4">
              Débloquez la Base de connaissance
            </h3>

            {/* Description */}
            <p className="text-center text-gray-600 mb-6">
              {reason ||
                'Souscrivez à un plan pour accéder à la base de connaissance et enrichir votre projet avec des documents, textes et liens.'}
            </p>

            {/* Features list */}
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-aurentia-pink mt-2 flex-shrink-0" />
                <span className="text-sm text-gray-700">
                  Stockez jusqu'à 5 GB de documents par projet
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-aurentia-pink mt-2 flex-shrink-0" />
                <span className="text-sm text-gray-700">
                  Ajoutez des documents, textes et URLs
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-aurentia-pink mt-2 flex-shrink-0" />
                <span className="text-sm text-gray-700">
                  Enrichissez les réponses de l'assistant IA
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-aurentia-pink mt-2 flex-shrink-0" />
                <span className="text-sm text-gray-700">
                  Organisez vos connaissances avec des tags
                </span>
              </li>
            </ul>

            {/* Unlock button */}
            <Button
              onClick={onUnlockClick}
              className="w-full px-6 py-3 rounded-full text-white font-bold bg-gradient-to-r from-aurentia-pink to-aurentia-orange hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              Débloquer
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionGate;
