import React, { useEffect, useRef } from 'react';
import { useOrganisationNavigation } from '@/hooks/useOrganisationNavigation';

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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aurentia-pink mx-auto mb-4"></div>
          <p className="text-gray-600">Redirection vers votre organisation...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default OrganisationRedirect;