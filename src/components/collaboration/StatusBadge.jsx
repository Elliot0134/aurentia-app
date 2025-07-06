import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const StatusBadge = ({ status, className = "" }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'active':
        return {
          label: 'Actif',
          variant: 'default',
          className: 'bg-green-100 text-green-800 hover:bg-green-200',
          icon: CheckCircle
        };
      case 'pending':
        return {
          label: 'En attente',
          variant: 'secondary',
          className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
          icon: Clock
        };
      case 'suspended':
        return {
          label: 'Suspendu',
          variant: 'destructive',
          className: 'bg-red-100 text-red-800 hover:bg-red-200',
          icon: XCircle
        };
      case 'inactive':
        return {
          label: 'Inactif',
          variant: 'outline',
          className: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
          icon: AlertCircle
        };
      default:
        return {
          label: 'Inconnu',
          variant: 'outline',
          className: 'bg-gray-100 text-gray-800',
          icon: AlertCircle
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <Badge 
      variant={config.variant}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium transition-colors ${config.className} ${className}`}
    >
      <Icon size={12} />
      {config.label}
    </Badge>
  );
};

export default StatusBadge;