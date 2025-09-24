import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useOrganisationData } from '@/hooks/useOrganisationData';
import { useToast } from "@/hooks/use-toast";
import CustomTabs from "@/components/ui/CustomTabs";
import {
  Settings,
  Users,
  Shield,
  Bell,
  Globe,
  Palette,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Info,
  Lock
} from "lucide-react";

const OrganisationSettings = () => {
  const { id: organisationId } = useParams();
  const { organisation, loading, refetch } = useOrganisationData();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('notifications');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [settingsChanged, setSettingsChanged] = useState(false);

  // État local pour les paramètres éditables
  const [localSettings, setLocalSettings] = useState({
    notifications: {
      emailNotifications: organisation?.settings?.notifications?.emailNotifications ?? true,
      projectUpdates: organisation?.settings?.notifications?.projectUpdates ?? true,
      mentorAssignments: organisation?.settings?.notifications?.mentorAssignments ?? true,
      weeklyReports: organisation?.settings?.notifications?.weeklyReports ?? false,
      systemAlerts: organisation?.settings?.notifications?.systemAlerts ?? true
    },
    branding: {
      primaryColor: organisation?.settings?.branding?.primaryColor || organisation?.primary_color || '#ff5932',
      secondaryColor: organisation?.settings?.branding?.secondaryColor || organisation?.secondary_color || '#1a1a1a',
      whiteLabel: organisation?.settings?.branding?.whiteLabel ?? false,
      publicProfile: false
    }
  });

  // Effect pour synchroniser l'état local avec les données de l'organisation
  useEffect(() => {
    if (organisation) {
      setLocalSettings({
        notifications: {
          emailNotifications: organisation?.settings?.notifications?.emailNotifications ?? true,
          projectUpdates: organisation?.settings?.notifications?.projectUpdates ?? true,
          mentorAssignments: organisation?.settings?.notifications?.mentorAssignments ?? true,
          weeklyReports: organisation?.settings?.notifications?.weeklyReports ?? false,
          systemAlerts: organisation?.settings?.notifications?.systemAlerts ?? true
        },
        branding: {
          primaryColor: organisation?.settings?.branding?.primaryColor || organisation?.primary_color || '#ff5932',
          secondaryColor: organisation?.settings?.branding?.secondaryColor || organisation?.secondary_color || '#1a1a1a',
          whiteLabel: organisation?.settings?.branding?.whiteLabel ?? false,
          publicProfile: (organisation as any)?.is_public ?? true
        }
      });
    }
  }, [organisation]);

  const handleSaveSettings = async () => {
    if (!organisationId) return;

    setSaveStatus('saving');
    setSettingsChanged(false);

    try {
      // Importer la fonction de mise à jour
      const { updateOrganisationSettings } = await import('@/services/organisationService');
      
      // Préparer les données de mise à jour
      const updateData: any = {};
      
      // Si publicProfile est défini, mettre à jour la colonne is_public
      if (localSettings.branding.publicProfile !== undefined) {
        updateData.is_public = localSettings.branding.publicProfile;
      }
      
      // Construire l'objet settings à sauvegarder (sans publicProfile)
      const settingsToSave = {
        branding: {
          primaryColor: localSettings.branding.primaryColor,
          secondaryColor: localSettings.branding.secondaryColor,
          whiteLabel: localSettings.branding.whiteLabel
        },
        notifications: localSettings.notifications
      };
      
      updateData.settings = settingsToSave;
      
      // Sauvegarder en base de données
      await updateOrganisationSettings(organisationId, updateData);
      
      // Rafraîchir les données de l'organisation
      await refetch();
      
      setSaveStatus('saved');
      toast({
        title: "Paramètres sauvegardés",
        description: "Les modifications ont été appliquées avec succès.",
      });
      
      // Reset status after 3 seconds
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres.",
        variant: "destructive",
      });
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const updateLocalSettings = (section: string, key: string, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value
      }
    }));
    setSettingsChanged(true);
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Paramètres de l'Organisation
          </h1>
          <p className="text-gray-600">
            Gérez les paramètres et la configuration de votre organisation
          </p>
        </div>
        
        {settingsChanged && (
          <Button 
            onClick={handleSaveSettings}
            disabled={saveStatus === 'saving'}
            className="mt-4 sm:mt-0"
          >
            {saveStatus === 'saving' ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Sauvegarde...
              </>
            ) : saveStatus === 'saved' ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Sauvegardé
              </>
            ) : saveStatus === 'error' ? (
              <>
                <AlertCircle className="mr-2 h-4 w-4" />
                Erreur
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Sauvegarder
              </>
            )}
          </Button>
        )}
      </div>

      {/* Onglets de paramètres */}
      <CustomTabs
        tabs={[
          { key: "notifications", label: "Notifications", icon: Bell },
          { key: "branding", label: "Branding", icon: Palette },
          { key: "integrations", label: "Intégrations", icon: Globe }
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      >
        {/* Onglet Notifications */}
        {activeTab === "notifications" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Préférences de Notifications
              </CardTitle>
              <CardDescription>
                Gérez les notifications pour votre organisation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Notifications par email</h4>
                  <p className="text-sm text-gray-600">Recevoir les notifications importantes par email</p>
                </div>
                <Switch
                  checked={localSettings.notifications.emailNotifications}
                  onCheckedChange={(checked) => updateLocalSettings('notifications', 'emailNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Mises à jour de projets</h4>
                  <p className="text-sm text-gray-600">Notifications lors des mises à jour de projets</p>
                </div>
                <Switch
                  checked={localSettings.notifications.projectUpdates}
                  onCheckedChange={(checked) => updateLocalSettings('notifications', 'projectUpdates', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Assignations de mentors</h4>
                  <p className="text-sm text-gray-600">Notifications lors des assignations mentor-entrepreneur</p>
                </div>
                <Switch
                  checked={localSettings.notifications.mentorAssignments}
                  onCheckedChange={(checked) => updateLocalSettings('notifications', 'mentorAssignments', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Rapports hebdomadaires</h4>
                  <p className="text-sm text-gray-600">Recevoir un résumé hebdomadaire des activités</p>
                </div>
                <Switch
                  checked={localSettings.notifications.weeklyReports}
                  onCheckedChange={(checked) => updateLocalSettings('notifications', 'weeklyReports', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Alertes système</h4>
                  <p className="text-sm text-gray-600">Notifications pour les problèmes système</p>
                </div>
                <Switch
                  checked={localSettings.notifications.systemAlerts}
                  onCheckedChange={(checked) => updateLocalSettings('notifications', 'systemAlerts', checked)}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Onglet Branding */}
        {activeTab === "branding" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Personnalisation de Marque
              </CardTitle>
              <CardDescription>
                Personnalisez l'apparence de votre organisation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Couleur principale</label>
                  <div className="flex gap-3">
                    <Input
                      type="color"
                      value={localSettings.branding.primaryColor}
                      onChange={(e) => updateLocalSettings('branding', 'primaryColor', e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={localSettings.branding.primaryColor}
                      onChange={(e) => updateLocalSettings('branding', 'primaryColor', e.target.value)}
                      placeholder="#ff5932"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Couleur secondaire</label>
                  <div className="flex gap-3">
                    <Input
                      type="color"
                      value={localSettings.branding.secondaryColor}
                      onChange={(e) => updateLocalSettings('branding', 'secondaryColor', e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={localSettings.branding.secondaryColor}
                      onChange={(e) => updateLocalSettings('branding', 'secondaryColor', e.target.value)}
                      placeholder="#1a1a1a"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Mode white-label</h4>
                  <p className="text-sm text-gray-600">Masquer la marque Aurentia pour vos utilisateurs</p>
                </div>
                <Switch
                  checked={localSettings.branding.whiteLabel}
                  onCheckedChange={(checked) => updateLocalSettings('branding', 'whiteLabel', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Profil public</h4>
                  <p className="text-sm text-gray-600">Rendre le profil de l'organisation visible publiquement</p>
                </div>
                <Switch
                  checked={localSettings.branding.publicProfile}
                  onCheckedChange={(checked) => updateLocalSettings('branding', 'publicProfile', checked)}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Onglet Intégrations */}
        {activeTab === "integrations" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Intégrations Externes
              </CardTitle>
              <CardDescription>
                Connectez votre organisation avec des outils externes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center py-12">
                <Globe className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Intégrations à venir</h3>
                <p className="text-gray-500 mb-4">
                  Les intégrations avec Slack, Teams, et d'autres outils seront bientôt disponibles.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <div className="bg-gray-100 px-3 py-1 rounded-full text-sm">Slack</div>
                  <div className="bg-gray-100 px-3 py-1 rounded-full text-sm">Microsoft Teams</div>
                  <div className="bg-gray-100 px-3 py-1 rounded-full text-sm">Google Workspace</div>
                  <div className="bg-gray-100 px-3 py-1 rounded-full text-sm">Zapier</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CustomTabs>
    </>
  );
};

export default OrganisationSettings;