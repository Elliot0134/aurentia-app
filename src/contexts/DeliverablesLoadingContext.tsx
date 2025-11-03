import React, { createContext, useContext, useState, useCallback } from 'react';

interface DeliverablesLoadingContextType {
  isGlobalLoading: boolean;
  deliverableStatuses: Record<string, boolean>;
  registerDeliverable: (id: string) => void;
  setDeliverableLoaded: (id: string) => void;
  resetLoading: () => void;
}

const DeliverablesLoadingContext = createContext<DeliverablesLoadingContextType | undefined>(undefined);

export const DeliverablesLoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deliverableStatuses, setDeliverableStatuses] = useState<Record<string, boolean>>({});
  const [registeredDeliverables, setRegisteredDeliverables] = useState<Set<string>>(new Set());

  const registerDeliverable = useCallback((id: string) => {
    setRegisteredDeliverables(prev => new Set(prev).add(id));
    setDeliverableStatuses(prev => ({ ...prev, [id]: false }));
  }, []);

  const setDeliverableLoaded = useCallback((id: string) => {
    setDeliverableStatuses(prev => ({ ...prev, [id]: true }));
  }, []);

  const resetLoading = useCallback(() => {
    setDeliverableStatuses({});
    setRegisteredDeliverables(new Set());
  }, []);

  // Check if all registered deliverables are loaded
  const isGlobalLoading = Array.from(registeredDeliverables).some(
    id => deliverableStatuses[id] === false
  );

  return (
    <DeliverablesLoadingContext.Provider
      value={{
        isGlobalLoading,
        deliverableStatuses,
        registerDeliverable,
        setDeliverableLoaded,
        resetLoading,
      }}
    >
      {children}
    </DeliverablesLoadingContext.Provider>
  );
};

export const useDeliverablesLoading = () => {
  const context = useContext(DeliverablesLoadingContext);
  if (!context) {
    throw new Error('useDeliverablesLoading must be used within DeliverablesLoadingProvider');
  }
  return context;
};
