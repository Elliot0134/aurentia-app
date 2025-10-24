import type {
  StorageLimit,
  OrganizationPlan,
  SubscriptionStatus,
  STORAGE_LIMITS,
  STORAGE_WARNING_THRESHOLDS,
} from '@/types/knowledgeBaseTypes';

// Storage limits in bytes
const STORAGE_LIMITS_BYTES = {
  project: {
    active: 5 * 1024 * 1024 * 1024, // 5 GB
    inactive: 0, // Blocked
  },
  organization: {
    starter: 50 * 1024 * 1024 * 1024, // 50 GB
    pro: 150 * 1024 * 1024 * 1024, // 150 GB
    max: 500 * 1024 * 1024 * 1024, // 500 GB
    free: 0, // Blocked
    custom: 0, // Blocked
  },
} as const;

/**
 * Get storage limit for a project based on subscription status
 */
export const getProjectStorageLimit = (
  subscriptionStatus: SubscriptionStatus
): number => {
  return subscriptionStatus === 'active'
    ? STORAGE_LIMITS_BYTES.project.active
    : STORAGE_LIMITS_BYTES.project.inactive;
};

/**
 * Get storage limit for an organization based on plan
 */
export const getOrganizationStorageLimit = (plan: OrganizationPlan): number => {
  return STORAGE_LIMITS_BYTES.organization[plan] || 0;
};

/**
 * Calculate storage limit details
 */
export const calculateStorageLimit = (
  usedBytes: number,
  limitBytes: number
): StorageLimit => {
  const percentage = limitBytes > 0 ? (usedBytes / limitBytes) * 100 : 0;
  const isExceeded = usedBytes >= limitBytes;
  const remainingBytes = Math.max(0, limitBytes - usedBytes);

  return {
    limit_bytes: limitBytes,
    used_bytes: usedBytes,
    percentage: Math.round(percentage * 100) / 100, // Round to 2 decimal places
    is_exceeded: isExceeded,
    remaining_bytes: remainingBytes,
  };
};

/**
 * Check if a file can be uploaded without exceeding storage limit
 */
export const canUploadFile = (
  currentUsageBytes: number,
  fileSize: number,
  limitBytes: number
): { canUpload: boolean; reason?: string } => {
  if (limitBytes === 0) {
    return {
      canUpload: false,
      reason: 'Veuillez souscrire à un plan pour accéder à la base de connaissance.',
    };
  }

  const newTotal = currentUsageBytes + fileSize;

  if (newTotal > limitBytes) {
    const exceededBy = newTotal - limitBytes;
    return {
      canUpload: false,
      reason: `Ce fichier dépasserait votre limite de stockage de ${formatBytes(exceededBy)}.`,
    };
  }

  return { canUpload: true };
};

/**
 * Get storage warning level based on usage percentage
 */
export const getStorageWarningLevel = (
  percentage: number
): 'none' | 'warning' | 'critical' | 'full' => {
  if (percentage >= 100) return 'full';
  if (percentage >= 75) return 'warning';
  return 'none';
};

/**
 * Get storage warning message based on warning level
 */
export const getStorageWarningMessage = (
  warningLevel: 'none' | 'warning' | 'critical' | 'full',
  percentage: number,
  remainingBytes: number
): string | null => {
  switch (warningLevel) {
    case 'warning':
      return `Attention: Vous avez utilisé ${percentage.toFixed(1)}% de votre espace de stockage. Il vous reste ${formatBytes(remainingBytes)}.`;
    case 'critical':
      return `Alerte: Vous avez utilisé ${percentage.toFixed(1)}% de votre espace de stockage. Il ne vous reste que ${formatBytes(remainingBytes)}.`;
    case 'full':
      return "Stockage plein: Vous avez atteint votre limite de stockage. Veuillez supprimer des fichiers ou mettre à niveau votre plan.";
    default:
      return null;
  }
};

/**
 * Format bytes to human-readable string
 */
export const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Format bytes to GB (for display purposes)
 */
export const formatBytesToGB = (bytes: number, decimals: number = 2): string => {
  const gb = bytes / (1024 * 1024 * 1024);
  return gb.toFixed(decimals);
};

/**
 * Get storage display text (e.g., "2.5 GB / 5 GB")
 */
export const getStorageDisplayText = (
  usedBytes: number,
  limitBytes: number
): string => {
  return `${formatBytes(usedBytes)} / ${formatBytes(limitBytes)}`;
};

/**
 * Check if user has access to knowledge base based on subscription/plan
 */
export const hasKnowledgeBaseAccess = (
  entityType: 'project' | 'organization',
  subscriptionStatus?: SubscriptionStatus,
  organizationPlan?: OrganizationPlan
): { hasAccess: boolean; reason?: string } => {
  if (entityType === 'project') {
    if (!subscriptionStatus || subscriptionStatus !== 'active') {
      return {
        hasAccess: false,
        reason: 'Vous devez avoir un abonnement actif pour accéder à la base de connaissance.',
      };
    }
    return { hasAccess: true };
  }

  if (entityType === 'organization') {
    if (!organizationPlan || organizationPlan === 'free' || organizationPlan === 'custom') {
      return {
        hasAccess: false,
        reason: 'Votre plan actuel ne permet pas d\'accéder à la base de connaissance. Veuillez mettre à niveau votre plan.',
      };
    }
    return { hasAccess: true };
  }

  return { hasAccess: false, reason: 'Type d\'entité invalide.' };
};

/**
 * Get storage limit display text based on entity type and plan/subscription
 */
export const getStorageLimitText = (
  entityType: 'project' | 'organization',
  subscriptionStatus?: SubscriptionStatus,
  organizationPlan?: OrganizationPlan
): string => {
  if (entityType === 'project') {
    const limit = getProjectStorageLimit(subscriptionStatus || 'inactive');
    return formatBytes(limit);
  }

  if (entityType === 'organization') {
    const limit = getOrganizationStorageLimit(organizationPlan || 'free');
    return formatBytes(limit);
  }

  return '0 B';
};
