import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { CreditsInsufficientDialog } from '../components/ui/CreditsInsufficientDialog';

// Déclaration globale pour la fonction de déclenchement
declare global {
  interface Window {
    triggerCreditsInsufficientDialog: (creditsNeeded?: string) => void;
  }
}

interface CreditsDialogContextType {
  showCreditsDialog: (creditsNeeded?: string) => void;
}

const CreditsDialogContext = createContext<CreditsDialogContextType | undefined>(undefined);

export const CreditsDialogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [creditsNeeded, setCreditsNeeded] = useState<string | undefined>(undefined);

  const showCreditsDialog = (needed?: string) => {
    setCreditsNeeded(needed);
    setIsDialogOpen(true);
  };

  const hideCreditsDialog = () => {
    setIsDialogOpen(false);
    setCreditsNeeded(undefined); // Réinitialiser les crédits nécessaires à la fermeture
  };

  // Exposer la fonction de déclenchement globalement
  useEffect(() => {
    window.triggerCreditsInsufficientDialog = showCreditsDialog;
    return () => {
      // Nettoyage si le composant est démonté
      delete window.triggerCreditsInsufficientDialog;
    };
  }, []);

  return (
    <CreditsDialogContext.Provider value={{ showCreditsDialog }}>
      {children}
      <CreditsInsufficientDialog isOpen={isDialogOpen} onClose={hideCreditsDialog} creditsNeeded={creditsNeeded} />
    </CreditsDialogContext.Provider>
  );
};

export const useCreditsDialog = () => {
  const context = useContext(CreditsDialogContext);
  if (context === undefined) {
    throw new Error('useCreditsDialog must be used within a CreditsDialogProvider');
  }
  return context;
};
