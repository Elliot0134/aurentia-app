import React, { createContext, useState, useContext, ReactNode } from 'react';

interface CreditsDialogContextType {
  isCreditsDialogOpen: boolean;
  openCreditsDialog: () => void;
  closeCreditsDialog: () => void;
}

const CreditsDialogContext = createContext<CreditsDialogContextType | undefined>(undefined);

export const CreditsDialogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isCreditsDialogOpen, setIsCreditsDialogOpen] = useState(false);

  const openCreditsDialog = () => setIsCreditsDialogOpen(true);
  const closeCreditsDialog = () => setIsCreditsDialogOpen(false);

  return (
    <CreditsDialogContext.Provider value={{ isCreditsDialogOpen, openCreditsDialog, closeCreditsDialog }}>
      {children}
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
