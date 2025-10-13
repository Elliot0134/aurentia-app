import { useEffect } from 'react';

interface WhiteLabelConfig {
  enabled: boolean;
  primaryColor?: string;
  secondaryColor?: string;
}

/**
 * Hook to apply organization white label colors globally
 * This completely overrides Aurentia's default colors when white label mode is active
 */
export const useWhiteLabelColors = (config: WhiteLabelConfig) => {
  useEffect(() => {
    if (!config.enabled || !config.primaryColor) {
      // Reset to Aurentia defaults
      document.documentElement.style.removeProperty('--color-primary');
      document.documentElement.style.removeProperty('--color-secondary');
      document.documentElement.style.removeProperty('--color-aurentia-pink');
      document.documentElement.style.removeProperty('--color-aurentia-orange');
      return;
    }

    // Apply organization colors as CSS variables
    document.documentElement.style.setProperty('--color-primary', config.primaryColor);
    document.documentElement.style.setProperty('--color-aurentia-pink', config.primaryColor);
    document.documentElement.style.setProperty('--color-aurentia-orange', config.primaryColor);
    
    if (config.secondaryColor) {
      document.documentElement.style.setProperty('--color-secondary', config.secondaryColor);
    } else {
      document.documentElement.style.setProperty('--color-secondary', config.primaryColor);
    }

    // Cleanup on unmount
    return () => {
      document.documentElement.style.removeProperty('--color-primary');
      document.documentElement.style.removeProperty('--color-secondary');
      document.documentElement.style.removeProperty('--color-aurentia-pink');
      document.documentElement.style.removeProperty('--color-aurentia-orange');
    };
  }, [config.enabled, config.primaryColor, config.secondaryColor]);
};

/**
 * Get inline style object for components that need dynamic colors
 */
export const getWhiteLabelStyles = (config: WhiteLabelConfig) => {
  if (!config.enabled || !config.primaryColor) {
    return {};
  }

  return {
    '--color-primary': config.primaryColor,
    '--color-secondary': config.secondaryColor || config.primaryColor,
  } as React.CSSProperties;
};
