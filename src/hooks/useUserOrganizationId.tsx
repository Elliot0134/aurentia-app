import { useUser } from '@/contexts/UserContext';

/**
 * Hook to get the user's organization_id from the UserContext
 * This is now a simple wrapper around useUser for backward compatibility
 */
export const useUserOrganizationId = (_userId?: string | undefined) => {
  const { organizationId, loading } = useUser();

  return { organizationId, loading };
};
