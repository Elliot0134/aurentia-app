import { useEffect, useRef } from 'react';
import { driver, Driver, Config } from 'driver.js';
import 'driver.js/dist/driver.css';
import '@/styles/driver-custom.css';
import { RESOURCE_BUILDER_TOUR_STEPS, TOUR_CONFIG } from '@/utils/tourSteps';
import { useResourceBuilderTour } from '@/hooks/useResourceBuilderTour';

interface ResourceBuilderTourProps {
  /**
   * Déclencher le tour manuellement
   */
  shouldStart?: boolean;

  /**
   * Callback appelé quand le tour est terminé
   */
  onComplete?: () => void;

  /**
   * Callback appelé quand le tour est fermé/annulé
   */
  onClose?: () => void;
}

/**
 * Composant qui gère le tour interactif Driver.js pour le ResourceBuilder
 * Auto-démarre lors de la première visite ou peut être déclenché manuellement
 */
export function ResourceBuilderTour({
  shouldStart = false,
  onComplete,
  onClose,
}: ResourceBuilderTourProps) {
  const driverRef = useRef<Driver | null>(null);
  const {
    shouldAutoShow,
    markTourCompleted,
    disableAutoShow,
  } = useResourceBuilderTour();

  // Initialiser Driver.js
  useEffect(() => {
    const driverConfig: Config = {
      ...TOUR_CONFIG,
      steps: RESOURCE_BUILDER_TOUR_STEPS,
      onDestroyStarted: () => {
        // Tour terminé avec succès
        if (driverRef.current?.getActiveIndex() === RESOURCE_BUILDER_TOUR_STEPS.length - 1) {
          markTourCompleted();
          onComplete?.();
        } else {
          // Tour fermé avant la fin
          disableAutoShow();
          onClose?.();
        }
        driverRef.current?.destroy();
        driverRef.current = null;
      },
      onPopoverRender: (popover, { config, state }) => {
        // Personnaliser le popover si nécessaire
        const progressText = document.querySelector('.driver-popover-progress-text');
        if (progressText && state.activeIndex !== undefined) {
          const current = state.activeIndex + 1;
          const total = RESOURCE_BUILDER_TOUR_STEPS.length;
          progressText.textContent = `${current} sur ${total}`;
        }
      },
    };

    driverRef.current = driver(driverConfig);

    return () => {
      if (driverRef.current) {
        driverRef.current.destroy();
        driverRef.current = null;
      }
    };
  }, [markTourCompleted, disableAutoShow, onComplete, onClose]);

  // Auto-démarrage à la première visite
  useEffect(() => {
    if (shouldAutoShow && driverRef.current) {
      // Petit délai pour laisser le DOM se charger
      const timer = setTimeout(() => {
        driverRef.current?.drive();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [shouldAutoShow]);

  // Démarrage manuel
  useEffect(() => {
    if (shouldStart && driverRef.current) {
      driverRef.current.drive();
    }
  }, [shouldStart]);

  // Ce composant ne rend rien visuellement
  return null;
}

/**
 * Hook pour contrôler le tour depuis un composant parent
 */
export function useStartTour() {
  const startTour = () => {
    const driverInstance = driver({
      ...TOUR_CONFIG,
      steps: RESOURCE_BUILDER_TOUR_STEPS,
    });
    driverInstance.drive();
  };

  return { startTour };
}

export default ResourceBuilderTour;
