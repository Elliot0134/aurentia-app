/**
 * Integration Card Component
 * Displays a single integration with connect/configure options
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Settings, AlertCircle } from 'lucide-react';
import { IntegrationConfigDialog } from './IntegrationConfigDialog';
import type { IntegrationConfig, Integration } from '@/types/integrationTypes';

interface IntegrationCardProps {
  config: IntegrationConfig;
  integration?: Integration;
}

export const IntegrationCard = ({ config, integration }: IntegrationCardProps) => {
  const [showConfig, setShowConfig] = useState(false);

  const isConnected = integration?.status === 'connected';
  const hasError = integration?.status === 'error';

  return (
    <>
      <div className="p-4 border rounded-lg hover:shadow-md transition-all duration-200 bg-white">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1">
            <span className="text-3xl" role="img" aria-label={config.name}>
              {config.icon}
            </span>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{config.name}</h4>
              <div className="flex flex-wrap gap-1 mt-1">
                {isConnected && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Connecté
                  </Badge>
                )}
                {hasError && (
                  <Badge variant="secondary" className="bg-red-100 text-red-700 text-xs">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Erreur
                  </Badge>
                )}
              </div>
            </div>
          </div>
          {isConnected && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowConfig(true)}
              className="shrink-0"
              aria-label={`Configurer ${config.name}`}
            >
              <Settings className="w-4 h-4" />
            </Button>
          )}
        </div>

        <p className="text-sm text-gray-600 mb-4 min-h-[40px]">{config.description}</p>

        {hasError && integration?.error_message && (
          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
            {integration.error_message}
          </div>
        )}

        <Button
          variant={isConnected ? 'outline' : 'default'}
          size="sm"
          className="w-full"
          onClick={() => setShowConfig(true)}
        >
          {isConnected ? 'Configurer' : 'Connecter'}
        </Button>
      </div>

      <IntegrationConfigDialog
        open={showConfig}
        onOpenChange={setShowConfig}
        config={config}
        integration={integration}
      />
    </>
  );
};
