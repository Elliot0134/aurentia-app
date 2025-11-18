/**
 * Organization Integrations Page
 * Manage integrations for organizations
 */

import { Settings } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useOrgPageTitle } from '@/hooks/usePageTitle';
import { useOrganisationData } from '@/hooks/useOrganisationData';
import { useIntegrations, useIntegrationWebhooks, useIntegrationApiKeys } from '@/hooks/useIntegrations';
import { IntegrationsGrid } from '@/components/integrations/IntegrationsGrid';
import { WebhooksSection } from '@/components/integrations/WebhooksSection';
import { ApiKeysSection } from '@/components/integrations/ApiKeysSection';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const OrganisationIntegrations = () => {
  useOrgPageTitle("Intégrations");
  const { id: organisationId } = useParams();
  const { organisation, loading: orgLoading } = useOrganisationData();
  const { data: integrations = [], isLoading: integrationsLoading } = useIntegrations();
  const { data: webhooks = [], isLoading: webhooksLoading } = useIntegrationWebhooks();
  const { data: apiKeys = [], isLoading: apiKeysLoading } = useIntegrationApiKeys();

  // Get organization branding
  const orgBranding = organisation?.settings?.branding;
  const primaryColor = orgBranding?.primaryColor || '#F04F6A';

  if (orgLoading || integrationsLoading || webhooksLoading || apiKeysLoading) {
    return <LoadingSpinner message="Chargement des intégrations..." fullScreen />;
  }

  return (
    <div className="mx-auto py-8 min-h-screen animate-fade-in">
      <div className="w-[90vw] md:w-11/12 mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Settings className="w-6 h-6" style={{ color: primaryColor }} />
            Intégrations Organisation
          </h1>
          <p className="text-gray-600 mt-2">
            Gérez les intégrations pour {organisation?.name || 'votre organisation'}
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

export default OrganisationIntegrations;
