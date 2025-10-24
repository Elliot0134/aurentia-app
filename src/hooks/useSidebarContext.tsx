/**
 * Hook to manage sidebar context tracking
 * Stores whether user is in 'individual' or 'organisation' sidebar context
 * Used to preserve sidebar when navigating to shared routes like /messages
 */

export type SidebarContext = 'individual' | 'organisation';

const STORAGE_KEY = 'sidebar-context';

/**
 * Get the current sidebar context from sessionStorage
 * @returns The stored context or 'individual' as default
 */
export const getSidebarContext = (): SidebarContext => {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored === 'individual' || stored === 'organisation') {
      return stored;
    }
  } catch (error) {
    console.error('Error reading sidebar context from sessionStorage:', error);
  }
  return 'individual'; // Default fallback
};

/**
 * Set the sidebar context in sessionStorage
 * @param context - The context to store ('individual' or 'organisation')
 */
export const setSidebarContext = (context: SidebarContext): void => {
  try {
    sessionStorage.setItem(STORAGE_KEY, context);
  } catch (error) {
    console.error('Error writing sidebar context to sessionStorage:', error);
  }
};

/**
 * Detect sidebar context from current pathname
 * @param pathname - Current URL pathname
 * @returns The detected context or null if cannot be determined
 */
export const detectSidebarContextFromPath = (pathname: string): SidebarContext | null => {
  if (pathname.startsWith('/organisation/')) {
    return 'organisation';
  }
  if (pathname.startsWith('/individual/')) {
    return 'individual';
  }
  // For root dashboard, default to individual
  if (pathname === '/dashboard') {
    return 'individual';
  }
  return null;
};

/**
 * Custom hook to manage sidebar context
 * @returns Object with context getter and setter utilities
 */
export const useSidebarContext = () => {
  return {
    getContext: getSidebarContext,
    setContext: setSidebarContext,
    detectFromPath: detectSidebarContextFromPath,
  };
};
