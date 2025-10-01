import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useOrganisationData } from '@/hooks/useOrganisationData';
import {
  Settings,
  Users,
  Shield,
  Bell,
  Globe,
  Palette,
  Database,
  Mail,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Info,
  Lock,
  Eye,
  Key
} from "lucide-react";

interface OrganisationSettings {
  general: {
    name: string;
    description: string;
    website?: string;
    logo?: string;
    timezone: string;
    language: string;
  };
  security: {
    twoFactorRequired: boolean;
    passwordPolicy: 'basic' | 'medium' | 'strong';
    sessionTimeout: number;
    ipWhitelist: string[];
    allowPublicProjects: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    projectUpdates: boolean;
    mentorAssignments: boolean;
    weeklyReports: boolean;
    systemAlerts: boolean;
  };
  integrations: {
    slack: { enabled: boolean; webhook?: string };
    discord: { enabled: boolean; webhook?: string };
    teams: { enabled: boolean; webhook?: string };
    zapier: { enabled: boolean; apiKey?: string };
  };
  branding: {
    primaryColor: string;
    secondaryColor: string;
    customDomain?: string;
    whiteLabel: boolean;
  };
  billing: {
    plan: 'starter' | 'professional' | 'enterprise';
    billingEmail: string;
    autoRenewal: boolean;
    usageAlerts: boolean;
  };
}

const OrganisationSettings = () => {
  const { id: organisationId } = useParams();
  const { organisation, loading } = useOrganisationData();
  const [activeTab, setActiveTab] = useState('general');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [settingsChanged, setSettingsChanged] = useState(false);

  // Créer les paramètres à partir des données Supabase
  const settings = organisation ? {
    general: {
      name: organisation.name || '',
      description: organisation.description || '',
      website: organisation.website || '',
      timezone: 'Europe/Paris', // TODO: Ajouter timezone à la table
      language: 'fr-FR' // TODO: Ajouter language à la table
    },
    security: {
      twoFactorRequired: false, // TODO: Ajouter security settings à la table
      passwordPolicy: 'medium' as const,
      sessionTimeout: 480,
      ipWhitelist: [] as string[],
      allowPublicProjects: false
    },
    notifications: {
      emailNotifications: true, // TODO: Ajouter notification settings à la table
      projectUpdates: true,
      mentorAssignments: true,
      weeklyReports: false,
      systemAlerts: true
    },
    branding: {
      primaryColor: '#ff5932',
      secondaryColor: '#1a1a1a',
      whiteLabel: false
    },
    integrations: {
      slack: { enabled: false },
      discord: { enabled: false },
      teams: { enabled: false, webhook: '' },
      zapier: { enabled: false, apiKey: '' }
    },
    billing: {
      plan: 'professional',
      billingEmail: organisation.email || '',
      autoRenewal: true,
      usageAlerts: true
    }
  } : null;

  const handleSave = async () => {
    setSaveStatus('saving');
    
    try {
      // TODO: Implémenter la sauvegarde avec Supabase
      console.log('Sauvegarde des paramètres...');
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const updateSettings = (section: string, field: string, value: any) => {
    // TODO: Implémenter la mise à jour avec Supabase
    console.log('Update settings:', section, field, value);
  };

  if (loading) {
    return (
      <div className="space-y-6 p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Chargement des paramètres...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="space-y-6 p-8">
        <div className="text-center">
          <p className="text-gray-500">Organisation non trouvée</p>
        </div>
      </div>
    );
  }

  const getPlanLabel = (plan: string) => {
    const labels = {
      starter: 'Starter',
      professional: 'Professional',
      enterprise: 'Enterprise'
    };
    return labels[plan as keyof typeof labels];
  };

  const getPlanColor = (plan: string) => {
    const colors = {
      starter: 'bg-blue-100 text-blue-800',
      professional: 'bg-purple-100 text-purple-800',
      enterprise: 'bg-gold-100 text-gold-800'
    };
    return colors[plan as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="mx-auto py-8 min-h-screen animate-fade-in">
      <div className="w-[80vw] md:w-11/12 mx-auto px-4">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Paramètres</h1>
              <p className="text-gray-600 text-base">
                Configurez les paramètres de votre organisation.
              </p>
            </div>
            <Button 
              onClick={handleSave}
              disabled={saveStatus === 'saving'}
              style={{ backgroundColor: '#ff5932' }} 
              className="hover:opacity-90 text-white"
            >
              {saveStatus === 'saving' ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : saveStatus === 'saved' ? (
                <CheckCircle className="w-4 h-4 mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {saveStatus === 'saving' ? 'Enregistrement...' : 
               saveStatus === 'saved' ? 'Enregistré' : 'Enregistrer'}
            </Button>
          </div>
        </div>

        {/* Status de sauvegarde */}
        {saveStatus === 'saved' && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800">Paramètres sauvegardés avec succès</span>
          </div>
        )}

        {/* Onglets de paramètres */}
        <Card>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="border-b">
                <TabsList className="grid grid-cols-2 lg:grid-cols-6 w-full h-auto bg-transparent">
                  <TabsTrigger value="general" className="flex items-center gap-2 p-4">
                    <Settings className="w-4 h-4" />
                    <span className="hidden sm:inline">Général</span>
                  </TabsTrigger>
                  <TabsTrigger value="security" className="flex items-center gap-2 p-4">
                    <Shield className="w-4 h-4" />
                    <span className="hidden sm:inline">Sécurité</span>
                  </TabsTrigger>
                  <TabsTrigger value="notifications" className="flex items-center gap-2 p-4">
                    <Bell className="w-4 h-4" />
                    <span className="hidden sm:inline">Notifications</span>
                  </TabsTrigger>
                  <TabsTrigger value="integrations" className="flex items-center gap-2 p-4">
                    <Globe className="w-4 h-4" />
                    <span className="hidden sm:inline">Intégrations</span>
                  </TabsTrigger>
                  <TabsTrigger value="branding" className="flex items-center gap-2 p-4">
                    <Palette className="w-4 h-4" />
                    <span className="hidden sm:inline">Branding</span>
                  </TabsTrigger>
                  <TabsTrigger value="billing" className="flex items-center gap-2 p-4">
                    <Database className="w-4 h-4" />
                    <span className="hidden sm:inline">Facturation</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="p-6">
                {/* Onglet Général */}
                <TabsContent value="general" className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Informations générales</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Nom de l'organisation</label>
                        <Input 
                          value={settings.general.name}
                          onChange={(e) => updateSettings('general', 'name', e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-2 block">Site web</label>
                        <Input 
                          value={settings.general.website || ''}
                          onChange={(e) => updateSettings('general', 'website', e.target.value)}
                          placeholder="https://exemple.com"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium mb-2 block">Description</label>
                        <Textarea 
                          value={settings.general.description}
                          onChange={(e) => updateSettings('general', 'description', e.target.value)}
                          rows={3}
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-2 block">Fuseau horaire</label>
                        <Select 
                          value={settings.general.timezone}
                          onValueChange={(value) => updateSettings('general', 'timezone', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Europe/Paris">Europe/Paris (UTC+1)</SelectItem>
                            <SelectItem value="Europe/London">Europe/London (UTC+0)</SelectItem>
                            <SelectItem value="America/New_York">America/New_York (UTC-5)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-2 block">Langue</label>
                        <Select 
                          value={settings.general.language}
                          onValueChange={(value) => updateSettings('general', 'language', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fr-FR">Français</SelectItem>
                            <SelectItem value="en-US">English</SelectItem>
                            <SelectItem value="es-ES">Español</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Onglet Sécurité */}
                <TabsContent value="security" className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Paramètres de sécurité</h3>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Authentification à deux facteurs obligatoire</h4>
                          <p className="text-sm text-gray-600">Exiger 2FA pour tous les membres</p>
                        </div>
                        <Switch 
                          checked={settings.security.twoFactorRequired}
                          onCheckedChange={(checked) => updateSettings('security', 'twoFactorRequired', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Projets publics autorisés</h4>
                          <p className="text-sm text-gray-600">Permettre la création de projets publics</p>
                        </div>
                        <Switch 
                          checked={settings.security.allowPublicProjects}
                          onCheckedChange={(checked) => updateSettings('security', 'allowPublicProjects', checked)}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Politique de mot de passe</label>
                          <Select 
                            value={settings.security.passwordPolicy}
                            onValueChange={(value) => updateSettings('security', 'passwordPolicy', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="basic">Basique (8 caractères min)</SelectItem>
                              <SelectItem value="medium">Moyenne (10 car. + chiffres)</SelectItem>
                              <SelectItem value="strong">Forte (12 car. + symboles)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium mb-2 block">Timeout de session (minutes)</label>
                          <Input 
                            type="number"
                            value={settings.security.sessionTimeout}
                            onChange={(e) => updateSettings('security', 'sessionTimeout', parseInt(e.target.value))}
                            min="30"
                            max="1440"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Onglet Notifications */}
                <TabsContent value="notifications" className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Préférences de notification</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Notifications par email</h4>
                          <p className="text-sm text-gray-600">Recevoir des notifications par email</p>
                        </div>
                        <Switch 
                          checked={settings.notifications.emailNotifications}
                          onCheckedChange={(checked) => updateSettings('notifications', 'emailNotifications', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Mises à jour de projets</h4>
                          <p className="text-sm text-gray-600">Notifications sur l'avancement des projets</p>
                        </div>
                        <Switch 
                          checked={settings.notifications.projectUpdates}
                          onCheckedChange={(checked) => updateSettings('notifications', 'projectUpdates', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Assignations de mentors</h4>
                          <p className="text-sm text-gray-600">Notifications des assignations mentor/entrepreneur</p>
                        </div>
                        <Switch 
                          checked={settings.notifications.mentorAssignments}
                          onCheckedChange={(checked) => updateSettings('notifications', 'mentorAssignments', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Rapports hebdomadaires</h4>
                          <p className="text-sm text-gray-600">Recevoir un résumé hebdomadaire d'activité</p>
                        </div>
                        <Switch 
                          checked={settings.notifications.weeklyReports}
                          onCheckedChange={(checked) => updateSettings('notifications', 'weeklyReports', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Alertes système</h4>
                          <p className="text-sm text-gray-600">Notifications importantes du système</p>
                        </div>
                        <Switch 
                          checked={settings.notifications.systemAlerts}
                          onCheckedChange={(checked) => updateSettings('notifications', 'systemAlerts', checked)}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Onglet Intégrations */}
                <TabsContent value="integrations" className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Intégrations tierces</h3>
                    <div className="space-y-6">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Globe className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <h4 className="font-medium">Microsoft Teams</h4>
                                <p className="text-sm text-gray-600">Notifications dans Teams</p>
                              </div>
                            </div>
                            <Switch 
                              checked={settings.integrations.teams.enabled}
                              onCheckedChange={(checked) => 
                                setSettings(prev => ({
                                  ...prev,
                                  integrations: {
                                    ...prev.integrations,
                                    teams: { ...prev.integrations.teams, enabled: checked }
                                  }
                                }))
                              }
                            />
                          </div>
                          {settings.integrations.teams.enabled && (
                            <Input 
                              placeholder="URL du webhook Teams"
                              value={settings.integrations.teams.webhook || ''}
                              onChange={(e) => 
                                setSettings(prev => ({
                                  ...prev,
                                  integrations: {
                                    ...prev.integrations,
                                    teams: { ...prev.integrations.teams, webhook: e.target.value }
                                  }
                                }))
                              }
                            />
                          )}
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <Globe className="w-5 h-5 text-green-600" />
                              </div>
                              <div>
                                <h4 className="font-medium">Slack</h4>
                                <p className="text-sm text-gray-600">Notifications dans Slack</p>
                              </div>
                            </div>
                            <Switch 
                              checked={settings.integrations.slack.enabled}
                              onCheckedChange={(checked) => 
                                setSettings(prev => ({
                                  ...prev,
                                  integrations: {
                                    ...prev.integrations,
                                    slack: { ...prev.integrations.slack, enabled: checked }
                                  }
                                }))
                              }
                            />
                          </div>
                          {settings.integrations.slack.enabled && (
                            <Input 
                              placeholder="URL du webhook Slack"
                              value={settings.integrations.slack.webhook || ''}
                              onChange={(e) => 
                                setSettings(prev => ({
                                  ...prev,
                                  integrations: {
                                    ...prev.integrations,
                                    slack: { ...prev.integrations.slack, webhook: e.target.value }
                                  }
                                }))
                              }
                            />
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                {/* Onglet Branding */}
                <TabsContent value="branding" className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Personnalisation de la marque</h3>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Couleur primaire</label>
                          <div className="flex gap-2">
                            <Input 
                              type="color"
                              value={settings.branding.primaryColor}
                              onChange={(e) => updateSettings('branding', 'primaryColor', e.target.value)}
                              className="w-16 h-10"
                            />
                            <Input 
                              value={settings.branding.primaryColor}
                              onChange={(e) => updateSettings('branding', 'primaryColor', e.target.value)}
                              className="flex-1"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium mb-2 block">Couleur secondaire</label>
                          <div className="flex gap-2">
                            <Input 
                              type="color"
                              value={settings.branding.secondaryColor}
                              onChange={(e) => updateSettings('branding', 'secondaryColor', e.target.value)}
                              className="w-16 h-10"
                            />
                            <Input 
                              value={settings.branding.secondaryColor}
                              onChange={(e) => updateSettings('branding', 'secondaryColor', e.target.value)}
                              className="flex-1"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-2 block">Domaine personnalisé</label>
                        <Input 
                          value={settings.branding.customDomain || ''}
                          onChange={(e) => updateSettings('branding', 'customDomain', e.target.value)}
                          placeholder="app.votre-domaine.com"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Mode white-label</h4>
                          <p className="text-sm text-gray-600">Masquer la marque Aurentia (plan Enterprise requis)</p>
                        </div>
                        <Switch 
                          checked={settings.branding.whiteLabel}
                          onCheckedChange={(checked) => updateSettings('branding', 'whiteLabel', checked)}
                          disabled={settings.billing.plan !== 'enterprise'}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Onglet Facturation */}
                <TabsContent value="billing" className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Facturation et abonnement</h3>
                    <div className="space-y-6">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h4 className="font-medium">Plan actuel</h4>
                              <p className="text-sm text-gray-600">Votre abonnement actuel</p>
                            </div>
                            <Badge className={getPlanColor(settings.billing.plan)}>
                              {getPlanLabel(settings.billing.plan)}
                            </Badge>
                          </div>
                          <Button variant="outline">
                            Changer de plan
                          </Button>
                        </CardContent>
                      </Card>
                      
                      <div>
                        <label className="text-sm font-medium mb-2 block">Email de facturation</label>
                        <Input 
                          type="email"
                          value={settings.billing.billingEmail}
                          onChange={(e) => updateSettings('billing', 'billingEmail', e.target.value)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Renouvellement automatique</h4>
                          <p className="text-sm text-gray-600">Renouveler automatiquement l'abonnement</p>
                        </div>
                        <Switch 
                          checked={settings.billing.autoRenewal}
                          onCheckedChange={(checked) => updateSettings('billing', 'autoRenewal', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Alertes d'utilisation</h4>
                          <p className="text-sm text-gray-600">Être alerté en cas de dépassement</p>
                        </div>
                        <Switch 
                          checked={settings.billing.usageAlerts}
                          onCheckedChange={(checked) => updateSettings('billing', 'usageAlerts', checked)}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrganisationSettings;