import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

/**
 * Reusable loading spinner component
 * Used consistently across the app for loading states
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Chargement...', 
  size = 'md',
  fullScreen = false 
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const containerClasses = fullScreen 
    ? 'min-h-screen flex items-center justify-center'
    : 'flex items-center justify-center py-8';

  return (
    <div className={containerClasses}>
      <div className="text-center">
        <div className={`animate-spin rounded-full ${sizeClasses[size]} border-b-2 border-aurentia-pink mx-auto mb-4`}></div>
        <p className={`text-gray-500 ${textSizeClasses[size]}`}>{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
