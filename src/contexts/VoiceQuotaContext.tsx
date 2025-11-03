import React, { createContext, useContext, useState, useEffect } from 'react';

interface VoiceQuotaContextType {
  getRemainingTime: (fieldId: string) => number;
  consumeTime: (fieldId: string, secondsUsed: number) => void;
  resetField: (fieldId: string) => void;
  resetAllFields: () => void;
}

const VoiceQuotaContext = createContext<VoiceQuotaContextType | undefined>(undefined);

const STORAGE_KEY = 'voice-quota-remaining-time';
const MAX_TIME_PER_FIELD = 30; // 30 seconds per field

export function VoiceQuotaProvider({ children }: { children: React.ReactNode }) {
  // Store remaining time for each field (fieldId -> seconds remaining)
  const [remainingTimes, setRemainingTimes] = useState<Record<string, number>>(() => {
    // Load from localStorage on mount
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Save to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(remainingTimes));
  }, [remainingTimes]);

  const getRemainingTime = (fieldId: string): number => {
    return remainingTimes[fieldId] ?? MAX_TIME_PER_FIELD;
  };

  const consumeTime = (fieldId: string, secondsUsed: number) => {
    setRemainingTimes((prev) => {
      const currentRemaining = prev[fieldId] ?? MAX_TIME_PER_FIELD;
      const newRemaining = Math.max(0, currentRemaining - secondsUsed);
      return {
        ...prev,
        [fieldId]: newRemaining,
      };
    });
  };

  const resetField = (fieldId: string) => {
    setRemainingTimes((prev) => {
      const newState = { ...prev };
      delete newState[fieldId];
      return newState;
    });
  };

  const resetAllFields = () => {
    setRemainingTimes({});
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <VoiceQuotaContext.Provider
      value={{ getRemainingTime, consumeTime, resetField, resetAllFields }}
    >
      {children}
    </VoiceQuotaContext.Provider>
  );
}

export function useVoiceQuota() {
  const context = useContext(VoiceQuotaContext);
  if (!context) {
    throw new Error('useVoiceQuota must be used within VoiceQuotaProvider');
  }
  return context;
}

export const MAX_TIME_PER_FIELD_SECONDS = MAX_TIME_PER_FIELD;
