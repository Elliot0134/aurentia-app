import { useState } from 'react';

interface UseHarmonizedModalProps {
  defaultTab?: 'structure' | 'definition' | 'recommendations';
  hasContent?: boolean;
  hasRecommendations?: boolean;
  hasDefinition?: boolean;
}

export const useHarmonizedModal = ({
  defaultTab = 'structure',
  hasContent = true,
  hasRecommendations = false,
  hasDefinition = false
}: UseHarmonizedModalProps = {}) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  
  // Détermine l'onglet initial basé sur ce qui est disponible
  const getInitialTab = () => {
    if (hasContent && defaultTab === 'structure') return 'structure';
    if (hasRecommendations && (defaultTab === 'recommendations' || !hasContent)) return 'recommendations';
    if (hasDefinition && (defaultTab === 'definition' || (!hasContent && !hasRecommendations))) return 'definition';
    return 'structure'; // fallback
  };

  const handleTemplateClick = () => {
    setIsPopupOpen(true);
  };

  const handlePopupClose = () => {
    setIsPopupOpen(false);
  };

  return {
    isPopupOpen,
    handleTemplateClick,
    handlePopupClose,
    getInitialTab
  };
};