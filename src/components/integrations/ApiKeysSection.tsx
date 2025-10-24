/**
 * API Keys Section Component
 * Displays and manages API keys (Phase 1: basic display)
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Key } from 'lucide-react';
import type { IntegrationApiKey } from '@/types/integrationTypes';

interface ApiKeysSectionProps {
  apiKeys: IntegrationApiKey[];
}

export const ApiKeysSection = ({ apiKeys }: ApiKeysSectionProps) => {
  if (apiKeys.length === 0) {
    return null; // Hide section if no API keys (Phase 1)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Key className="w-5 h-5 text-aurentia-pink" />
          <CardTitle>Clés API</CardTitle>
        </div>
        <CardDescription>
          Accédez à l'API Aurentia de manière programmatique
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {apiKeys.map((key) => (
            <div key={key.id} className="p-4 border rounded-lg bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{key.name}</h4>
                    <Badge variant={key.scope === 'organization' ? 'default' : 'secondary'} className="text-xs">
                      {key.scope === 'organization' ? 'Organisation' : 'Personnelle'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">
                    Créée le {new Date(key.created_at).toLocaleDateString('fr-FR')}
                    {key.last_used_at &&
                      ` • Dernière utilisation: ${new Date(key.last_used_at).toLocaleDateString('fr-FR')}`}
                  </p>
                  <div className="mt-2 font-mono text-sm bg-white p-2 rounded border">
                    {key.key_prefix}••••••••••••••••••••
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
