import React, { useEffect, useRef } from 'react';
import { useOrganisationNavigation } from '@/hooks/useOrganisationNavigation';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const OrganisationRedirect: React.FC = () => {
  const { navigateToOrganisation, loading } = useOrganisationNavigation();
  const hasNavigated = useRef(false);

  useEffect(() => {
    // Only navigate once to prevent infinite loops
    if (!hasNavigated.current && !loading) {
      hasNavigated.current = true;
      navigateToOrganisation();
    }
  }, [navigateToOrganisation, loading]);

  if (loading) {
    return <LoadingSpinner message="Redirection vers votre organisation..." fullScreen />;
  }

  return null;
};

export default OrganisationRedirect;