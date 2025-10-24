/**
 * Integration Configuration Dialog
 * Modal for configuring integrations (webhooks and OAuth)
 */

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { Loader2, ExternalLink, CheckCircle2, XCircle, HelpCircle } from 'lucide-react';
import { useCreateIntegration, useUpdateIntegration, useTestIntegration } from '@/hooks/useIntegrations';
import { AVAILABLE_EVENTS } from '@/lib/integrationConstants';
import { IntegrationHelpModal } from './IntegrationHelpModal';
import type { IntegrationConfig, Integration } from '@/types/integrationTypes';

interface IntegrationConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: IntegrationConfig;
  integration?: Integration;
}

export const IntegrationConfigDialog = ({
  open,
  onOpenChange,
  config,
  integration,
}: IntegrationConfigDialogProps) => {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  const { mutate: createIntegration, isPending: isCreating } = useCreateIntegration();
  const { mutate: updateIntegration, isPending: isUpdating } = useUpdateIntegration();
  const { mutate: testIntegration, isPending: isTesting } = useTestIntegration();

  // Load existing integration data
  useEffect(() => {
    if (integration) {
      setSelectedEvents(integration.settings?.events || []);
      setTestStatus('idle');
    } else {
      setWebhookUrl('');
      setSelectedEvents([]);
      setTestStatus('idle');
    }
  }, [integration, open]);

  const handleSave = () => {
    // Validation
    if (!config.requiresOAuth && !webhookUrl.trim()) {
      toast({
        title: 'Erreur',
        description: 'Veuillez entrer l\'URL du webhook',
        variant: 'destructive',
      });
      return;
    }

    if (selectedEvents.length === 0) {
      toast({
        title: 'Attention',
        description: 'Aucun événement sélectionné. Vous ne recevrez aucune notification.',
        variant: 'default',
      });
    }

    const integrationData = {
      integration_type: config.type,
      credentials: { webhookUrl },
      settings: {
        events: selectedEvents,
        notification_format: 'rich',
      },
    };

    if (integration) {
      // Update existing
      updateIntegration(
        { id: integration.id, data: integrationData },
        {
          onSuccess: () => {
            toast({
              title: 'Intégration mise à jour',
              description: 'Vos paramètres ont été enregistrés avec succès',
            });
            onOpenChange(false);
          },
          onError: (error: any) => {
            toast({
              title: 'Erreur',
              description: error.message || 'Impossible de mettre à jour l\'intégration',
              variant: 'destructive',
            });
          },
        }
      );
    } else {
      // Create new
      createIntegration(integrationData, {
        onSuccess: () => {
          toast({
            title: 'Intégration créée',
            description: `${config.name} a été connecté avec succès. Testez la connexion pour valider.`,
          });
          setTestStatus('idle');
        },
        onError: (error: any) => {
          toast({
            title: 'Erreur',
            description: error.message || 'Impossible de créer l\'intégration',
            variant: 'destructive',
          });
        },
      });
    }
  };

  const handleTest = () => {
    if (!integration?.id) {
      toast({
        title: 'Erreur',
        description: 'Enregistrez d\'abord l\'intégration avant de tester',
        variant: 'destructive',
      });
      return;
    }

    setTestStatus('testing');

    testIntegration(integration.id, {
      onSuccess: (result) => {
        if (result.success) {
          setTestStatus('success');
          setTestMessage(result.message);
          toast({
            title: 'Test réussi',
            description: result.message,
          });
        } else {
          setTestStatus('error');
          setTestMessage(result.details || result.message);
          toast({
            title: 'Test échoué',
            description: result.message,
            variant: 'destructive',
          });
        }
      },
      onError: (error: any) => {
        setTestStatus('error');
        setTestMessage(error.message);
        toast({
          title: 'Erreur',
          description: 'Impossible de tester la connexion',
          variant: 'destructive',
        });
      },
    });
  };

  const handleOAuthConnect = () => {
    // For Phase 2: Redirect to OAuth flow
    toast({
      title: 'Bientôt disponible',
      description: `L'authentification OAuth pour ${config.name} sera disponible dans la Phase 2`,
    });
  };

  const toggleAllEvents = (checked: boolean) => {
    if (checked) {
      setSelectedEvents(AVAILABLE_EVENTS.map((e) => e.type));
    } else {
      setSelectedEvents([]);
    }
  };

  const allEventsSelected = selectedEvents.length === AVAILABLE_EVENTS.length;
  const someEventsSelected = selectedEvents.length > 0 && selectedEvents.length < AVAILABLE_EVENTS.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">{config.icon}</span>
              {integration ? `Configurer ${config.name}` : `Connecter ${config.name}`}
            </DialogTitle>
            {['slack', 'discord', 'teams', 'trello'].includes(config.type) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHelp(true)}
                className="shrink-0"
                title="Voir les instructions détaillées"
              >
                <HelpCircle className="w-5 h-5" />
              </Button>
            )}
          </div>
          <DialogDescription>{config.setupInstructions}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* OAuth or Webhook URL Input */}
          {config.requiresOAuth ? (
            <div className="space-y-4">
              {!integration ? (
                <>
                  <p className="text-sm text-gray-600">
                    Cliquez sur le bouton ci-dessous pour autoriser Aurentia à accéder à votre compte{' '}
                    {config.name}.
                  </p>
                  <Button onClick={handleOAuthConnect} className="w-full">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Autoriser avec {config.name}
                  </Button>
                  <p className="text-xs text-gray-500">
                    Phase 2: Authentification OAuth - Disponible prochainement
                  </p>
                </>
              ) : (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Connecté à {config.name}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="grid gap-2">
              <Label htmlFor="webhook-url">{config.credentialLabel || 'URL du Webhook'}</Label>
              <Input
                id="webhook-url"
                placeholder={config.credentialPlaceholder}
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                type="url"
                disabled={!!integration}
              />
              <p className="text-xs text-gray-500">{config.credentialHint}</p>
            </div>
          )}

          {/* Event Selection */}
          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <Label>Événements à notifier</Label>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="select-all"
                  checked={allEventsSelected}
                  ref={(el) => {
                    if (el) {
                      el.indeterminate = someEventsSelected;
                    }
                  }}
                  onCheckedChange={toggleAllEvents}
                />
                <label htmlFor="select-all" className="text-sm cursor-pointer text-gray-600">
                  Tout sélectionner
                </label>
              </div>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-4 bg-gray-50">
              {AVAILABLE_EVENTS.map((event) => (
                <div key={event.type} className="flex items-start space-x-3 py-2">
                  <Checkbox
                    id={event.type}
                    checked={selectedEvents.includes(event.type)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedEvents([...selectedEvents, event.type]);
                      } else {
                        setSelectedEvents(selectedEvents.filter((e) => e !== event.type));
                      }
                    }}
                  />
                  <div className="space-y-1 flex-1">
                    <label htmlFor={event.type} className="text-sm font-medium cursor-pointer leading-none">
                      {event.label}
                    </label>
                    <p className="text-xs text-gray-500">{event.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-500">
              {selectedEvents.length} événement{selectedEvents.length !== 1 ? 's' : ''} sélectionné{selectedEvents.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Test Status */}
          {integration && testStatus !== 'idle' && (
            <div
              className={`p-4 rounded-lg border ${
                testStatus === 'success'
                  ? 'bg-green-50 border-green-200'
                  : testStatus === 'error'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-blue-50 border-blue-200'
              }`}
            >
              <div className="flex items-start gap-2">
                {testStatus === 'testing' && <Loader2 className="w-4 h-4 animate-spin mt-0.5" />}
                {testStatus === 'success' && <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />}
                {testStatus === 'error' && <XCircle className="w-4 h-4 text-red-600 mt-0.5" />}
                <div className="flex-1">
                  <p
                    className={`text-sm font-medium ${
                      testStatus === 'success'
                        ? 'text-green-800'
                        : testStatus === 'error'
                        ? 'text-red-800'
                        : 'text-blue-800'
                    }`}
                  >
                    {testStatus === 'testing'
                      ? 'Test en cours...'
                      : testStatus === 'success'
                      ? 'Connexion réussie!'
                      : 'Test échoué'}
                  </p>
                  {testMessage && (
                    <p
                      className={`text-xs mt-1 ${
                        testStatus === 'success'
                          ? 'text-green-700'
                          : testStatus === 'error'
                          ? 'text-red-700'
                          : 'text-blue-700'
                      }`}
                    >
                      {testMessage}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0">
          {integration && (
            <Button variant="outline" onClick={handleTest} disabled={isTesting || isCreating || isUpdating}>
              {isTesting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Test en cours...
                </>
              ) : (
                'Tester la connexion'
              )}
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={isCreating || isUpdating || isTesting}>
            {isCreating || isUpdating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enregistrement...
              </>
            ) : integration ? (
              'Enregistrer'
            ) : (
              'Connecter'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Help Modal */}
      <IntegrationHelpModal
        open={showHelp}
        onOpenChange={setShowHelp}
        integrationType={config.type}
      />
    </Dialog>
  );
};
