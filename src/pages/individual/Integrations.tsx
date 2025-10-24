/**
 * Individual Integrations Page
 * Manage integrations for individual users
 */

import { Settings } from 'lucide-react';
import { useIntegrations, useIntegrationWebhooks, useIntegrationApiKeys } from '@/hooks/useIntegrations';
import { IntegrationsGrid } from '@/components/integrations/IntegrationsGrid';
import { WebhooksSection } from '@/components/integrations/WebhooksSection';
import { ApiKeysSection } from '@/components/integrations/ApiKeysSection';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const Integrations = () => {
  const { data: integrations = [], isLoading: integrationsLoading } = useIntegrations();
  const { data: webhooks = [], isLoading: webhooksLoading } = useIntegrationWebhooks();
  const { data: apiKeys = [], isLoading: apiKeysLoading } = useIntegrationApiKeys();

  if (integrationsLoading || webhooksLoading || apiKeysLoading) {
    return <LoadingSpinner message="Chargement des intégrations..." fullScreen />;
  }

  return (
    <div className="mx-auto py-8 min-h-screen animate-fade-in">
      <div className="w-[90vw] md:w-11/12 mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Intégrations
          </h1>
          <p className="text-gray-600 mt-2">
            Connectez des applications tierces pour recevoir des notifications et automatiser vos workflows
          </p>
        </div>

        {/* Integrations Grid */}
        <IntegrationsGrid integrations={integrations} />

        {/* Webhooks Section (only shown if webhooks exist) */}
        <WebhooksSection webhooks={webhooks} />

        {/* API Keys Section (only shown if API keys exist) */}
        <ApiKeysSection apiKeys={apiKeys} />
      </div>
    </div>
  );
};

export default Integrations;
