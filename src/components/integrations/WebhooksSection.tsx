/**
 * Webhooks Section Component
 * Displays and manages user-defined webhooks (Phase 1: basic display)
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Webhook } from 'lucide-react';
import type { IntegrationWebhook } from '@/types/integrationTypes';

interface WebhooksSectionProps {
  webhooks: IntegrationWebhook[];
}

export const WebhooksSection = ({ webhooks }: WebhooksSectionProps) => {
  if (webhooks.length === 0) {
    return null; // Hide section if no webhooks (Phase 1)
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Webhook className="w-5 h-5 text-aurentia-pink" />
          <CardTitle>Webhooks personnalisés</CardTitle>
        </div>
        <CardDescription>
          Recevez des événements Aurentia sur vos propres endpoints
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {webhooks.map((webhook) => (
            <div key={webhook.id} className="p-4 border rounded-lg bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{webhook.name}</h4>
                    {webhook.active ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                        Actif
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-700 text-xs">
                        Inactif
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 font-mono break-all">{webhook.url}</p>
                  {webhook.events.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {webhook.events.map((event) => (
                        <Badge key={event} variant="outline" className="text-xs">
                          {event}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
