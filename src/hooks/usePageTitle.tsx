import { useEffect } from 'react';
import { useOrganisationData } from './useOrganisationData';

/**
 * Custom hook to set the page title dynamically
 * @param pageName - The name of the page (will be appended to "Aurentia - ")
 *
 * @example
 * usePageTitle('Dashboard') // Sets title to "Aurentia - Dashboard"
 * usePageTitle('Profile') // Sets title to "Aurentia - Profile"
 */
const usePageTitle = (pageName: string) => {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = `Aurentia - ${pageName}`;

    // Cleanup: restore previous title when component unmounts
    return () => {
      document.title = previousTitle;
    };
  }, [pageName]);
};

/**
 * Custom hook to set the page title for organization pages dynamically
 * Uses the organization name from context instead of "Aurentia"
 * @param pageName - The name of the page (will be appended to "{OrgName} - ")
 *
 * @example
 * useOrgPageTitle('Dashboard') // Sets title to "{OrgName} - Dashboard"
 * useOrgPageTitle('Members') // Sets title to "{OrgName} - Members"
 */
export const useOrgPageTitle = (pageName: string) => {
  const { organisation, loading } = useOrganisationData();

  useEffect(() => {
    const previousTitle = document.title;
    // Use org name if available, fallback to "Aurentia" while loading or if no org
    const orgName = organisation?.name || 'Aurentia';
    document.title = `${orgName} - ${pageName}`;

    // Cleanup: restore previous title when component unmounts
    return () => {
      document.title = previousTitle;
    };
  }, [organisation?.name, pageName, loading]);
};

export default usePageTitle;
