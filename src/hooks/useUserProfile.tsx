import { useUser } from '@/contexts/UserContext';

export const useUserProfile = () => {
  const { userProfile, loading, refetchProfile } = useUser();

  return { userProfile, loading, refetch: refetchProfile };
};