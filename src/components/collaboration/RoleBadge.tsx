import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Crown, UserCog, PencilLine, Eye } from 'lucide-react';
import { CollaboratorRole } from '@/types/collaboration';
import { cn } from '@/lib/utils';

interface RoleBadgeProps {
  role: CollaboratorRole;
  showIcon?: boolean;
  className?: string;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({
  role,
  showIcon = true,
  className
}) => {
  const roleConfig: Record<CollaboratorRole, {
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    className: string;
  }> = {
    admin: {
      label: 'Administrateur',
      icon: UserCog,
      className: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800',
    },
    editor: {
      label: 'Éditeur',
      icon: PencilLine,
      className: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
    },
    viewer: {
      label: 'Lecteur',
      icon: Eye,
      className: 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600',
    },
  };

  const config = roleConfig[role];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        'text-xs font-medium px-2 py-1',
        config.className,
        className
      )}
    >
      {showIcon && <Icon size={12} className="mr-1" />}
      {config.label}
    </Badge>
  );
};
