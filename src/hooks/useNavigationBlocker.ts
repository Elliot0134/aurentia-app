import { useEffect } from 'react';

/**
 * Custom navigation blocker compatible with BrowserRouter
 * This is an alternative to useBlocker which requires a data router
 *
 * @param shouldBlock - Function that returns true when navigation should be blocked
 * @returns void - This hook manages blocking via beforeunload event
 */
export const useNavigationBlocker = (
  shouldBlock: boolean | ((args: { currentLocation: Location; nextLocation: Location }) => boolean)
): void => {
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Determine if we should block
      const shouldBlockNow = typeof shouldBlock === 'function'
        ? shouldBlock({ currentLocation: window.location, nextLocation: window.location })
        : shouldBlock;

      if (shouldBlockNow) {
        // Modern browsers require returnValue to be set
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    // Only add listener if blocking is active
    const isBlocking = typeof shouldBlock === 'function'
      ? shouldBlock({ currentLocation: window.location, nextLocation: window.location })
      : shouldBlock;

    if (isBlocking) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [shouldBlock]);
};

/**
 * Compatibility helper for components using useBlocker
 * Provides a no-op blocker that can be safely ignored
 */
export const useCompatBlocker = () => {
  return {
    state: 'unblocked' as const,
    proceed: undefined,
    reset: undefined,
  };
};
