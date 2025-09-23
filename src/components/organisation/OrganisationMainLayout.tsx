import React from 'react';
import { Outlet } from 'react-router-dom';

interface OrganisationMainLayoutProps {
  children?: React.ReactNode;
}

/**
 * Layout principal pour toutes les pages d'organisation
 * Garantit une largeur contenue et évite le scroll horizontal
 */
export const OrganisationMainLayout: React.FC<OrganisationMainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#F4F4F1]">
      {/* Container principal avec largeur maximale et centrage */}
      <div className="max-w-[100vw] overflow-x-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
          {children || <Outlet />}
        </div>
      </div>
    </div>
  );
};

interface OrganisationPageWrapperProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  headerActions?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | '7xl' | 'full';
  noPadding?: boolean;
}

/**
 * Wrapper pour les pages d'organisation avec en-tête standardisé
 * Optimisé pour le responsive et évite le débordement horizontal
 */
export const OrganisationPageWrapper: React.FC<OrganisationPageWrapperProps> = ({
  title,
  description,
  children,
  headerActions,
  maxWidth = '7xl',
  noPadding = false
}) => {
  const maxWidthClass = `max-w-${maxWidth}`;
  const paddingClass = noPadding ? '' : 'p-4 sm:p-6 lg:p-8';

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#F4F4F1]">
      <div className={`mx-auto ${maxWidthClass} ${paddingClass}`}>
        {/* En-tête de page */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
                {title}
              </h1>
              {description && (
                <p className="mt-2 text-sm sm:text-base text-gray-600 leading-relaxed">
                  {description}
                </p>
              )}
            </div>
            {headerActions && (
              <div className="flex-shrink-0">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  {headerActions}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contenu principal */}
        <div className="w-full">
          {children}
        </div>
      </div>
    </div>
  );
};

interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: 2 | 3 | 4 | 5 | 6 | 8;
  className?: string;
}

/**
 * Grille responsive optimisée pour les dashboards d'organisation
 */
export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  columns = 3,
  gap = 4,
  className = ''
}) => {
  const getGridClass = () => {
    const baseClass = 'grid gap-' + gap;
    
    switch (columns) {
      case 1:
        return `${baseClass} grid-cols-1`;
      case 2:
        return `${baseClass} grid-cols-1 md:grid-cols-2`;
      case 3:
        return `${baseClass} grid-cols-1 md:grid-cols-2 lg:grid-cols-3`;
      case 4:
        return `${baseClass} grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`;
      case 5:
        return `${baseClass} grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5`;
      case 6:
        return `${baseClass} grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6`;
      default:
        return `${baseClass} grid-cols-1 md:grid-cols-2 lg:grid-cols-3`;
    }
  };

  return (
    <div className={`${getGridClass()} ${className}`}>
      {children}
    </div>
  );
};

interface FlexContainerProps {
  children: React.ReactNode;
  direction?: 'row' | 'col';
  gap?: 2 | 3 | 4 | 5 | 6 | 8;
  wrap?: boolean;
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  align?: 'start' | 'center' | 'end' | 'stretch';
  className?: string;
}

/**
 * Container flex responsive pour les layouts complexes
 */
export const FlexContainer: React.FC<FlexContainerProps> = ({
  children,
  direction = 'row',
  gap = 4,
  wrap = false,
  justify = 'start',
  align = 'start',
  className = ''
}) => {
  const flexDirection = direction === 'row' ? 'flex-row' : 'flex-col';
  const flexWrap = wrap ? 'flex-wrap' : 'flex-nowrap';
  const justifyContent = `justify-${justify}`;
  const alignItems = `items-${align}`;
  const gapClass = `gap-${gap}`;

  return (
    <div className={`flex ${flexDirection} ${flexWrap} ${justifyContent} ${alignItems} ${gapClass} ${className}`}>
      {children}
    </div>
  );
};

export default OrganisationMainLayout;