import React from 'react';
import { OrganisationMainLayout } from './OrganisationMainLayout';

interface OrganisationLayoutWrapperProps {
  children: React.ReactNode;
}

/**
 * Wrapper qui applique automatiquement le layout d'organisation
 * à toutes les pages du module organisation
 */
export const OrganisationLayoutWrapper: React.FC<OrganisationLayoutWrapperProps> = ({ children }) => {
  return (
    <OrganisationMainLayout>
      {children}
    </OrganisationMainLayout>
  );
};

export default OrganisationLayoutWrapper;