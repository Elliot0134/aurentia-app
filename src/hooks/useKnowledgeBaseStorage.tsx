import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getStorageUsage } from '@/services/knowledgeBaseService';
import {
  calculateStorageLimit,
  getProjectStorageLimit,
  getOrganizationStorageLimit,
  getStorageWarningLevel,
  getStorageWarningMessage,
  hasKnowledgeBaseAccess,
  canUploadFile,
} from '@/services/knowledgeBaseStorageService';
import type {
  StorageLimit,
  OrganizationPlan,
  SubscriptionStatus,
} from '@/types/knowledgeBaseTypes';

// =====================================================
// PROJECT STORAGE HOOK
// =====================================================

/**
 * Hook to manage project knowledge base storage
 */
export const useProjectKnowledgeBaseStorage = (projectId: string | undefined) => {
  // Fetch user subscription status
  const { data: subscriptionStatus, isLoading: isLoadingSubscription } = useQuery({
    queryKey: ['userSubscriptionStatus'],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .select('subscription_status')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      return (data?.subscription_status as SubscriptionStatus) || 'inactive';
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch storage usage
  const { data: storageUsage, isLoading: isLoadingUsage } = useQuery({
    queryKey: ['projectStorageUsage', projectId],
    queryFn: async () => {
      if (!projectId) throw new Error('Project ID is required');
      const usage = await getStorageUsage('project', projectId);
      return usage?.total_size_bytes || 0;
    },
    enabled: !!projectId,
    staleTime: 1000 * 30, // 30 seconds
  });

  // Calculate storage limit and details
  const storageLimit = subscriptionStatus
    ? getProjectStorageLimit(subscriptionStatus)
    : 0;

  const usedBytes = storageUsage || 0;

  const limitDetails: StorageLimit = calculateStorageLimit(usedBytes, storageLimit);

  const warningLevel = getStorageWarningLevel(limitDetails.percentage);

  const warningMessage = getStorageWarningMessage(
    warningLevel,
    limitDetails.percentage,
    limitDetails.remaining_bytes
  );

  const accessCheck = hasKnowledgeBaseAccess('project', subscriptionStatus);

  return {
    // Access control
    hasAccess: accessCheck.hasAccess,
    accessDeniedReason: accessCheck.reason,
    subscriptionStatus,

    // Storage details
    usedBytes,
    limitBytes: storageLimit,
    limitDetails,

    // Warnings
    warningLevel,
    warningMessage,

    // Upload validation
    canUpload: (fileSize: number) =>
      canUploadFile(usedBytes, fileSize, storageLimit),

    // Loading states
    isLoading: isLoadingSubscription || isLoadingUsage,
  };
};

// =====================================================
// ORGANIZATION STORAGE HOOK
// =====================================================

/**
 * Hook to manage organization knowledge base storage
 */
export const useOrganizationKnowledgeBaseStorage = (organizationId: string | undefined) => {
  // Fetch organization plan
  const { data: organizationPlan, isLoading: isLoadingPlan } = useQuery({
    queryKey: ['organizationPlan', organizationId],
    queryFn: async () => {
      if (!organizationId) throw new Error('Organization ID is required');

      const { data, error } = await supabase
        .from('organizations')
        .select('plan')
        .eq('id', organizationId)
        .single();

      if (error) throw error;

      return (data?.plan as OrganizationPlan) || 'free';
    },
    enabled: !!organizationId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch storage usage
  const { data: storageUsage, isLoading: isLoadingUsage } = useQuery({
    queryKey: ['organizationStorageUsage', organizationId],
    queryFn: async () => {
      if (!organizationId) throw new Error('Organization ID is required');
      const usage = await getStorageUsage('organization', organizationId);
      return usage?.total_size_bytes || 0;
    },
    enabled: !!organizationId,
    staleTime: 1000 * 30, // 30 seconds
  });

  // Calculate storage limit and details
  const storageLimit = organizationPlan
    ? getOrganizationStorageLimit(organizationPlan)
    : 0;

  const usedBytes = storageUsage || 0;

  const limitDetails: StorageLimit = calculateStorageLimit(usedBytes, storageLimit);

  const warningLevel = getStorageWarningLevel(limitDetails.percentage);

  const warningMessage = getStorageWarningMessage(
    warningLevel,
    limitDetails.percentage,
    limitDetails.remaining_bytes
  );

  const accessCheck = hasKnowledgeBaseAccess('organization', undefined, organizationPlan);

  return {
    // Access control
    hasAccess: accessCheck.hasAccess,
    accessDeniedReason: accessCheck.reason,
    organizationPlan,

    // Storage details
    usedBytes,
    limitBytes: storageLimit,
    limitDetails,

    // Warnings
    warningLevel,
    warningMessage,

    // Upload validation
    canUpload: (fileSize: number) =>
      canUploadFile(usedBytes, fileSize, storageLimit),

    // Loading states
    isLoading: isLoadingPlan || isLoadingUsage,
  };
};
