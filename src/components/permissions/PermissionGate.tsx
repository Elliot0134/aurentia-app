import React from 'react';
import { useProjectPermissions } from '@/hooks/useProjectPermissions';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export type PermissionRequirement =
  | 'read'
  | 'write'
  | 'delete'
  | 'invite'
  | 'manageCollaborators'
  | 'changeSettings'
  | 'transferOwnership'
  | 'generateShareCodes';

interface PermissionGateProps {
  children: React.ReactNode;
  require: PermissionRequirement;
  projectId?: string;
  fallback?: React.ReactNode;
  showTooltip?: boolean;
  tooltipMessage?: string;
}

const defaultTooltipMessages: Record<PermissionRequirement, string> = {
  read: 'Vous n avez pas la permission de consulter ce contenu',
  write: 'Vous n avez pas la permission de modifier ce contenu. Rôle requis: Éditeur ou supérieur',
  delete: 'Vous n avez pas la permission de supprimer. Rôle requis: Administrateur ou Propriétaire',
  invite: 'Vous n avez pas la permission d inviter des collaborateurs. Rôle requis: Administrateur ou Propriétaire',
  manageCollaborators: 'Vous n avez pas la permission de gérer les collaborateurs. Rôle requis: Administrateur ou Propriétaire',
  changeSettings: 'Vous n avez pas la permission de modifier les paramètres. Rôle requis: Propriétaire',
  transferOwnership: 'Seul le propriétaire peut transférer la propriété du projet',
  generateShareCodes: 'Vous n avez pas la permission de générer des codes d invitation. Rôle requis: Administrateur ou Propriétaire',
};

export const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  require,
  projectId,
  fallback = null,
  showTooltip = false,
  tooltipMessage,
}) => {
  const permissions = useProjectPermissions(projectId);

  // Loading state - show nothing or fallback
  if (permissions.loading) {
    return <>{fallback}</>;
  }

  // Map requirement to permission
  const permissionMap: Record<PermissionRequirement, boolean> = {
    read: permissions.canRead,
    write: permissions.canWrite,
    delete: permissions.canDelete,
    invite: permissions.canInvite,
    manageCollaborators: permissions.canManageCollaborators,
    changeSettings: permissions.canChangeSettings,
    transferOwnership: permissions.canTransferOwnership,
    generateShareCodes: permissions.canGenerateShareCodes,
  };

  const hasPermission = permissionMap[require];

  // If permission is granted, render children
  if (hasPermission) {
    return <>{children}</>;
  }

  // If no permission and showTooltip is true, wrap fallback in tooltip
  if (showTooltip && fallback) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {fallback}
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltipMessage || defaultTooltipMessages[require]}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Otherwise, just render fallback
  return <>{fallback}</>;
};

export const useCanPerformAction = (
  action: PermissionRequirement,
  projectId?: string
): boolean => {
  const permissions = useProjectPermissions(projectId);

  const permissionMap: Record<PermissionRequirement, boolean> = {
    read: permissions.canRead,
    write: permissions.canWrite,
    delete: permissions.canDelete,
    invite: permissions.canInvite,
    manageCollaborators: permissions.canManageCollaborators,
    changeSettings: permissions.canChangeSettings,
    transferOwnership: permissions.canTransferOwnership,
    generateShareCodes: permissions.canGenerateShareCodes,
  };

  return permissionMap[action] || false;
};
