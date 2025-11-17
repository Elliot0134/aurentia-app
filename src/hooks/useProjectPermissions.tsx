import { useState, useEffect } from 'react';
import { CollaboratorsService } from '@/services/collaborators.service';
import { useProject } from '@/contexts/ProjectContext';
import { supabase } from '@/integrations/supabase/client';
import { CollaboratorRole } from '@/types/collaboration';

interface ProjectPermissions {
  isOwner: boolean;
  isCollaborator: boolean;
  role?: CollaboratorRole;
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  canInvite: boolean;
  canManageCollaborators: boolean;
  canChangeSettings: boolean;
  canTransferOwnership: boolean;
  canGenerateShareCodes: boolean;
  loading: boolean;
  error?: string;
}

/**
 * Hook to get user's permissions for the current project
 * Returns permissions based on user's role (owner, administrator, editor, viewer)
 */
export const useProjectPermissions = (projectId?: string): ProjectPermissions => {
  const { currentProjectId } = useProject();
  const effectiveProjectId = projectId || currentProjectId;

  const [permissions, setPermissions] = useState<ProjectPermissions>({
    isOwner: false,
    isCollaborator: false,
    canRead: false,
    canWrite: false,
    canDelete: false,
    canInvite: false,
    canManageCollaborators: false,
    canChangeSettings: false,
    canTransferOwnership: false,
    canGenerateShareCodes: false,
    loading: true
  });

  useEffect(() => {
    const loadPermissions = async () => {
      if (!effectiveProjectId) {
        setPermissions({
          isOwner: false,
          isCollaborator: false,
          canRead: false,
          canWrite: false,
          canDelete: false,
          canInvite: false,
          canManageCollaborators: false,
          canChangeSettings: false,
          canTransferOwnership: false,
          canGenerateShareCodes: false,
          loading: false,
          error: 'No project selected'
        });
        return;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setPermissions({
            isOwner: false,
            isCollaborator: false,
            canRead: false,
            canWrite: false,
            canDelete: false,
            canInvite: false,
            canManageCollaborators: false,
            canChangeSettings: false,
            canTransferOwnership: false,
            canGenerateShareCodes: false,
            loading: false,
            error: 'Not authenticated'
          });
          return;
        }

        const result = await CollaboratorsService.checkUserPermissions(
          effectiveProjectId,
          user.id
        );

        setPermissions({
          isOwner: result.isOwner,
          isCollaborator: result.isCollaborator,
          role: result.role,
          canRead: result.permissions.canRead,
          canWrite: result.permissions.canWrite,
          canDelete: result.permissions.canDelete,
          canInvite: result.permissions.canManageCollaborators,
          canManageCollaborators: result.permissions.canManageCollaborators,
          canChangeSettings: result.permissions.canChangeSettings,
          canTransferOwnership: result.isOwner, // Only owner can transfer
          canGenerateShareCodes: result.isOwner || result.permissions.canManageCollaborators,
          loading: false
        });
      } catch (error: any) {
        console.error('Error loading permissions:', error);
        setPermissions({
          isOwner: false,
          isCollaborator: false,
          canRead: false,
          canWrite: false,
          canDelete: false,
          canInvite: false,
          canManageCollaborators: false,
          canChangeSettings: false,
          canTransferOwnership: false,
          canGenerateShareCodes: false,
          loading: false,
          error: error.message
        });
      }
    };

    loadPermissions();
  }, [effectiveProjectId]);

  return permissions;
};

/**
 * Helper hook to quickly check if user can perform a specific action
 */
export const useCanPerformAction = (
  action: 'read' | 'write' | 'delete' | 'invite' | 'manageCollaborators' | 'changeSettings' | 'transferOwnership',
  projectId?: string
): boolean => {
  const permissions = useProjectPermissions(projectId);

  switch (action) {
    case 'read':
      return permissions.canRead;
    case 'write':
      return permissions.canWrite;
    case 'delete':
      return permissions.canDelete;
    case 'invite':
      return permissions.canInvite;
    case 'manageCollaborators':
      return permissions.canManageCollaborators;
    case 'changeSettings':
      return permissions.canChangeSettings;
    case 'transferOwnership':
      return permissions.canTransferOwnership;
    default:
      return false;
  }
};
