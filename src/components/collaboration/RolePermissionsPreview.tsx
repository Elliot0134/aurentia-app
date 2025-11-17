import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CollaboratorRole, getPermissions } from '@/types/collaboration';
import {
  Eye,
  PencilLine,
  Trash2,
  Users,
  Settings,
  CheckCircle2,
  XCircle,
  ShieldCheck
} from 'lucide-react';

interface RolePermissionsPreviewProps {
  role: CollaboratorRole;
  className?: string;
}

const RolePermissionsPreview: React.FC<RolePermissionsPreviewProps> = ({ role, className = '' }) => {
  const permissions = getPermissions(role);

  const permissionItems = [
    {
      key: 'canRead',
      icon: Eye,
      label: 'Consulter les projets et livrables',
      enabled: permissions.canRead
    },
    {
      key: 'canWrite',
      icon: PencilLine,
      label: 'Créer et modifier des livrables',
      enabled: permissions.canWrite
    },
    {
      key: 'canDelete',
      icon: Trash2,
      label: 'Supprimer des livrables et projets',
      enabled: permissions.canDelete
    },
    {
      key: 'canManageCollaborators',
      icon: Users,
      label: 'Inviter et gérer les collaborateurs',
      enabled: permissions.canManageCollaborators
    },
    {
      key: 'canChangeSettings',
      icon: Settings,
      label: 'Modifier les paramètres du projet',
      enabled: permissions.canChangeSettings
    }
  ];

  const getRoleColorClass = (role: CollaboratorRole) => {
    switch (role) {
      case 'viewer':
        return 'border-blue-200 bg-blue-50 dark:bg-blue-900/20';
      case 'editor':
        return 'border-green-200 bg-green-50 dark:bg-green-900/20';
      case 'admin':
        return 'border-purple-200 bg-purple-50 dark:bg-purple-900/20';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getRoleDescription = (role: CollaboratorRole) => {
    switch (role) {
      case 'viewer':
        return 'Accès en lecture seule - idéal pour les observateurs et consultants';
      case 'editor':
        return 'Peut créer et modifier du contenu - parfait pour les contributeurs actifs';
      case 'admin':
        return 'Accès complet avec gestion d\'équipe - pour les responsables de projet';
      default:
        return '';
    }
  };

  return (
    <Alert className={`${getRoleColorClass(role)} ${className}`}>
      <ShieldCheck className="h-4 w-4" />
      <AlertDescription>
        <div className="space-y-3">
          <div>
            <p className="font-semibold text-sm mb-1">
              Permissions du rôle {role === 'viewer' ? 'Lecteur' : role === 'editor' ? 'Éditeur' : 'Administrateur'}
            </p>
            <p className="text-xs opacity-80">
              {getRoleDescription(role)}
            </p>
          </div>

          <div className="space-y-1.5">
            {permissionItems.map((item) => {
              const Icon = item.icon;
              const StatusIcon = item.enabled ? CheckCircle2 : XCircle;

              return (
                <div
                  key={item.key}
                  className={`flex items-center gap-2 text-xs ${
                    item.enabled
                      ? 'text-gray-700 dark:text-gray-300'
                      : 'text-gray-400 dark:text-gray-600 line-through'
                  }`}
                >
                  <StatusIcon
                    size={14}
                    className={item.enabled ? 'text-green-600' : 'text-gray-400'}
                  />
                  <Icon size={14} className="opacity-70" />
                  <span>{item.label}</span>
                </div>
              );
            })}
          </div>

          {role === 'viewer' && (
            <p className="text-xs italic opacity-75 mt-2">
              💡 Les lecteurs peuvent voir tout le contenu mais ne peuvent rien modifier
            </p>
          )}
          {role === 'editor' && (
            <p className="text-xs italic opacity-75 mt-2">
              💡 Les éditeurs peuvent créer du contenu mais ne peuvent pas gérer l'équipe
            </p>
          )}
          {role === 'admin' && (
            <p className="text-xs italic opacity-75 mt-2">
              ⚠️ Les administrateurs ont un accès complet - choisissez avec soin
            </p>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default RolePermissionsPreview;
