import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Play, AlertCircle, AlertTriangle, Minus } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface ActionPlanStatusBadgeProps {
  type: 'status' | 'priority';
  value: string;
  className?: string;
  elementId?: string; // Ajout de l'ID de l'élément
  onStatusChange?: (elementId: string, newStatus: string) => void; // Fonction de rappel pour le changement de statut
}

const ActionPlanStatusBadge: React.FC<ActionPlanStatusBadgeProps> = ({
  type,
  value,
  className = "",
  elementId,
  onStatusChange
}) => {
  const getStatusConfig = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'à faire':
      case 'a faire':
        return {
          label: 'À faire',
          className: 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200',
          icon: Clock
        };
      case 'en cours':
        return {
          label: 'En cours',
          className: 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200',
          icon: Play
        };
      case 'terminé':
      case 'termine':
        return {
          label: 'Terminé',
          className: 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200',
          icon: CheckCircle
        };
      default:
        return {
          label: status || 'Inconnu',
          className: 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200',
          icon: Minus
        };
    }
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'critique':
      case 'bloquante':
      case 'élevée':
      case 'elevee':
        return {
          label: priority,
          className: 'bg-red-100 text-red-800 hover:bg-red-200 border-red-200',
          icon: AlertTriangle
        };
      case 'important':
      case 'importante':
      case 'moyenne':
        return {
          label: priority,
          className: 'bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-200',
          icon: AlertCircle
        };
      case 'normal':
      case 'normale':
      case 'modérée':
      case 'moderee':
      case 'faible':
        return {
          label: priority,
          className: 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200',
          icon: Minus
        };
      default:
        return {
          label: priority || 'Non défini',
          className: 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200',
          icon: Minus
        };
    }
  };

  const config = type === 'status' 
    ? getStatusConfig(value)
    : getPriorityConfig(value);
  
  const Icon = config.icon;

  if (!value) return null;

  const statusOptions = ['À faire', 'En cours', 'Terminé'];

  if (type === 'status' && elementId && onStatusChange) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Badge 
            variant="outline"
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium transition-colors border ${config.className} ${className} cursor-pointer`}
          >
            <Icon size={12} className="flex-shrink-0" />
            <span className="truncate">{config.label}</span>
          </Badge>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {statusOptions.map(option => (
            <DropdownMenuItem
              key={option}
              onClick={(e) => {
                e.stopPropagation(); // Empêcher la propagation de l'événement
                console.log(`DropdownMenuItem clicked: ${option} for element ${elementId}`);
                onStatusChange?.(elementId, option);
              }}
            >
              {option}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Badge 
      variant="outline"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium transition-colors border ${config.className} ${className}`}
    >
      <Icon size={12} className="flex-shrink-0" />
      <span className="truncate">{config.label}</span>
    </Badge>
  );
};

export default ActionPlanStatusBadge;
