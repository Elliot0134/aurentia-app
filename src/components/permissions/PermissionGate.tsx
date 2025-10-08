import { ReactNode, useEffect, useState } from 'react';
import { CollaboratorsService } from '@/services/collaborators.service';
import { supabase } from '@/integrations/supabase/client';

interface PermissionGateProps {
  children: ReactNode;
  projectId: string;
  requiredPermission: 'read' | 'write' | 'delete' | 'manage';
  fallback?: ReactNode;
}

export const PermissionGate = ({ 
  children, 
  projectId, 
  requiredPermission, 
  fallback = null 
}: PermissionGateProps) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setHasPermission(false);
          return;
        }

        const permissions = await CollaboratorsService.checkUserPermissions(projectId, user.id);
        
        const permissionMap = {
          'read': permissions.permissions.canRead,
          'write': permissions.permissions.canWrite,
          'delete': permissions.permissions.canDelete,
          'manage': permissions.permissions.canManageCollaborators
        };
        
        setHasPermission(permissionMap[requiredPermission] || false);
      } catch (error) {
        console.error('Erreur lors de la vérification des permissions:', error);
        setHasPermission(false);
      } finally {
        setLoading(false);
      }
    };

    checkPermissions();
  }, [projectId, requiredPermission]);
  
  if (loading) {
    return <div>Vérification des permissions...</div>;
  }
  
  if (!hasPermission) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};

export default PermissionGate;