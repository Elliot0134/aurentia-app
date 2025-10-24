import { useState, useEffect, useCallback } from 'react';
import { TOUR_COMPLETED_KEY, TOUR_AUTO_SHOW_DISABLED_KEY } from '@/utils/tourSteps';

/**
 * Hook pour gérer l'état du tour interactif du ResourceBuilder
 * Gère la détection de première visite et le statut de complétion
 */
export function useResourceBuilderTour() {
  const [tourCompleted, setTourCompleted] = useState(false);
  const [shouldAutoShow, setShouldAutoShow] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  // Charger l'état depuis localStorage au montage
  useEffect(() => {
    const completed = localStorage.getItem(TOUR_COMPLETED_KEY) === 'true';
    const autoShowDisabled = localStorage.getItem(TOUR_AUTO_SHOW_DISABLED_KEY) === 'true';

    setTourCompleted(completed);
    setIsFirstVisit(!completed && !autoShowDisabled);
    setShouldAutoShow(!completed && !autoShowDisabled);
  }, []);

  /**
   * Marquer le tour comme complété
   */
  const markTourCompleted = useCallback(() => {
    localStorage.setItem(TOUR_COMPLETED_KEY, 'true');
    setTourCompleted(true);
    setShouldAutoShow(false);
  }, []);

  /**
   * Réinitialiser le tour (pour permettre de le refaire)
   */
  const resetTour = useCallback(() => {
    localStorage.removeItem(TOUR_COMPLETED_KEY);
    localStorage.removeItem(TOUR_AUTO_SHOW_DISABLED_KEY);
    setTourCompleted(false);
    setIsFirstVisit(true);
    setShouldAutoShow(true);
  }, []);

  /**
   * Désactiver l'affichage automatique (l'utilisateur a fermé le tour)
   */
  const disableAutoShow = useCallback(() => {
    localStorage.setItem(TOUR_AUTO_SHOW_DISABLED_KEY, 'true');
    setShouldAutoShow(false);
  }, []);

  /**
   * Vérifier si le tour doit être affiché automatiquement
   */
  const checkShouldAutoShow = useCallback((): boolean => {
    return shouldAutoShow;
  }, [shouldAutoShow]);

  return {
    tourCompleted,
    isFirstVisit,
    shouldAutoShow,
    markTourCompleted,
    resetTour,
    disableAutoShow,
    checkShouldAutoShow,
  };
}

export default useResourceBuilderTour;
