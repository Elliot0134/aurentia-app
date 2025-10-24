/**
 * Integrations Grid Component
 * Displays grid of all available integrations
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link2 } from 'lucide-react';
import { IntegrationCard } from './IntegrationCard';
import { AVAILABLE_INTEGRATIONS } from '@/lib/integrationConstants';
import type { Integration } from '@/types/integrationTypes';

interface IntegrationsGridProps {
  integrations: Integration[];
}

export const IntegrationsGrid = ({ integrations }: IntegrationsGridProps) => {
  // Create a map of connected integrations for quick lookup
  const connectedMap = new Map(integrations.map((int) => [int.integration_type, int]));

  // Filter to show only Phase 1 integrations (or all if you want)
  const availableIntegrations = AVAILABLE_INTEGRATIONS; // .filter(i => i.phase === 1);

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Link2 className="w-5 h-5 text-aurentia-pink" />
          <CardTitle>Applications disponibles</CardTitle>
        </div>
        <CardDescription>
          Connectez des applications pour recevoir des notifications et synchroniser vos données
        </CardDescription>
      </CardHeader>
      <CardContent>
        {availableIntegrations.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Link2 className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>Aucune intégration disponible</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableIntegrations.map((appConfig) => {
              const connectedIntegration = connectedMap.get(appConfig.type);

              return (
                <IntegrationCard
                  key={appConfig.type}
                  config={appConfig}
                  integration={connectedIntegration}
                />
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
