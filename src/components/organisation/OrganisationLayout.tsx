import React from 'react';
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useOrganisationData } from '@/hooks/useOrganisationData';
import { Loader2 } from 'lucide-react';

interface OrganisationPageLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  headerActions?: React.ReactNode;
  loading?: boolean;
  error?: string | null;
}

/**
 * Layout standardisé pour toutes les pages d'organisation
 * Inclut l'en-tête, la gestion du loading et des erreurs
 */
export const OrganisationPageLayout: React.FC<OrganisationPageLayoutProps> = ({
  title,
  description,
  children,
  headerActions,
  loading = false,
  error = null
}) => {
  const { organisation, loading: orgLoading } = useOrganisationData();

  if (orgLoading || loading) {
    return <LoadingSpinner message="Chargement..." fullScreen />;
  }

  if (error) {
    return (
      <div className="mx-auto py-8 min-h-screen">
        <div className="w-[80vw] md:w-11/12 mx-auto px-4">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800">Erreur</CardTitle>
              <CardDescription className="text-red-600">
                {error}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="border-red-300 text-red-800 hover:bg-red-100"
              >
                Réessayer
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto py-8 min-h-screen animate-fade-in">
      <div className="w-[80vw] md:w-11/12 mx-auto px-4">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{title}</h1>
              <p className="text-gray-600 text-base">
                {description || `${organisation?.name} - ${title}`}
              </p>
            </div>
            {headerActions && (
              <div className="flex items-center gap-3">
                {headerActions}
              </div>
            )}
          </div>
        </div>

        {/* Contenu principal */}
        {children}
      </div>
    </div>
  );
};

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  color?: 'default' | 'pink' | 'orange' | 'blue' | 'green' | 'purple';
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
}

/**
 * Composant standardisé pour les cartes de statistiques
 */
export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  description,
  icon,
  color = 'default',
  trend
}) => {
  const getColorClass = (color: string) => {
    switch (color) {
      case 'pink': return 'text-aurentia-pink';
      case 'orange': return 'text-aurentia-orange';
      case 'blue': return 'text-blue-600';
      case 'green': return 'text-green-600';
      case 'purple': return 'text-purple-600';
      default: return 'text-muted-foreground';
    }
  };

  const getTrendColor = (positive: boolean) => {
    return positive ? 'text-green-600' : 'text-red-600';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className={`h-4 w-4 ${getColorClass(color)}`}>{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
        {trend && (
          <p className={`text-xs mt-1 ${getTrendColor(trend.positive ?? true)}`}>
            {trend.positive ? '+' : ''}{trend.value} {trend.label}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

interface ActionCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  color?: 'pink' | 'orange' | 'blue' | 'green' | 'purple' | 'indigo';
  onClick: () => void;
  buttonText?: string;
}

/**
 * Composant standardisé pour les cartes d'action
 */
export const ActionCard: React.FC<ActionCardProps> = ({
  title,
  description,
  icon,
  color = 'pink',
  onClick,
  buttonText = 'Accéder'
}) => {
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'pink': return {
        icon: 'text-aurentia-pink',
        button: 'bg-aurentia-pink hover:bg-aurentia-pink/90'
      };
      case 'orange': return {
        icon: 'text-aurentia-orange',
        button: 'bg-aurentia-orange hover:bg-aurentia-orange/90'
      };
      case 'blue': return {
        icon: 'text-blue-600',
        button: 'bg-blue-600 hover:bg-blue-600/90'
      };
      case 'green': return {
        icon: 'text-green-600',
        button: 'bg-green-600 hover:bg-green-600/90'
      };
      case 'purple': return {
        icon: 'text-purple-600',
        button: 'bg-purple-600 hover:bg-purple-600/90'
      };
      case 'indigo': return {
        icon: 'text-indigo-600',
        button: 'bg-indigo-600 hover:bg-indigo-600/90'
      };
      default: return {
        icon: 'text-aurentia-pink',
        button: 'bg-aurentia-pink hover:bg-aurentia-pink/90'
      };
    }
  };

  const colorClasses = getColorClasses(color);

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon && <div className={`h-5 w-5 ${colorClasses.icon}`}>{icon}</div>}
          {title}
        </CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <button className={`w-full ${colorClasses.button} text-white py-2 px-4 rounded-md transition`}>
          {buttonText}
        </button>
      </CardContent>
    </Card>
  );
};