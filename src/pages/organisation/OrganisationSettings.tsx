import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useOrganisationData } from '@/hooks/useOrganisationData';
import { useOrgPageTitle } from '@/hooks/usePageTitle';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { updateOrganisationSettings } from '@/services/organisationService';
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
  Lock,
  Mail,
  Send
} from "lucide-react";

const OrganisationSettings = () => {
  useOrgPageTitle("Paramètres");
  const { id: organisationId } = useParams();
  const { organisation, loading, refetch } = useOrganisationData();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get tab from URL params (source of truth)
  const [searchParams, setSearchParams] = useSearchParams();
  const validTabs = ['notifications', 'branding', 'permissions', 'integrations'];
  const tabFromUrl = searchParams.get('tab') || 'notifications';
  const activeTab = validTabs.includes(tabFromUrl) ? tabFromUrl : 'notifications';

  // Function to update tab and URL
  const setActiveTab = (tab: string) => {
    setSearchParams({ tab });
  };

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [settingsChanged, setSettingsChanged] = useState(false);

  // Fetch staff members for permissions management
  const { data: staffMembers, isLoading: staffLoading } = useQuery({
    queryKey: ["organization-staff", organisationId],
    queryFn: async () => {
      if (!organisationId) return [];

      const { data, error } = await supabase
        .from("user_organizations")
        .select(`
          id,
          user_id,
          user_role,
          can_manage_newsletters,
          can_manage_org_messages,
          profiles:user_id (
            id,
            email,
            first_name,
            last_name
          )
        `)
        .eq("organization_id", organisationId)
        .eq("user_role", "staff")
        .eq("status", "active");

      if (error) {
        console.error("Error fetching staff:", error);
        throw error;
      }

      return data || [];
    },
    enabled: !!organisationId,
  });

  // Mutation to update staff permissions
  const updatePermissionMutation = useMutation({
    mutationFn: async ({
      userOrgId,
      field,
      value,
    }: {
      userOrgId: string;
      field: "can_manage_newsletters" | "can_manage_org_messages";
      value: boolean;
    }) => {
      const { error } = await supabase
        .from("user_organizations")
        .update({ [field]: value })
        .eq("id", userOrgId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization-staff", organisationId] });
      toast({
        title: "Permission mise à jour",
        description: "Les permissions du staff ont été modifiées avec succès.",
      });
    },
    onError: (error) => {
      console.error("Error updating permission:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les permissions.",
        variant: "destructive",
      });
    },
  });

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
        description: "Les modifications ont été appliquées avec succès. La page va se rafraîchir...",
      });

      // Reload page after 1 second to apply new branding
      setTimeout(() => {
        window.location.reload();
      }, 1000);
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
          { key: "permissions", label: "Permissions Staff", icon: Shield },
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

        {/* Onglet Permissions Staff */}
        {activeTab === "permissions" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Permissions du Staff
              </CardTitle>
              <CardDescription>
                Gérez les permissions d'accès aux fonctionnalités pour les membres du staff
              </CardDescription>
            </CardHeader>
            <CardContent>
              {staffLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : !staffMembers || staffMembers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                  <p>Aucun membre du staff trouvé</p>
                  <p className="text-sm mt-1">Invitez des membres du staff pour gérer leurs permissions</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground mb-4">
                    Activez ou désactivez les permissions pour chaque membre du staff. Les propriétaires de l'organisation ont toutes les permissions par défaut.
                  </div>

                  {staffMembers.map((staff: any) => (
                    <Card key={staff.id} className="bg-muted/30">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div>
                            <div className="font-medium">
                              {staff.profiles?.first_name && staff.profiles?.last_name
                                ? `${staff.profiles.first_name} ${staff.profiles.last_name}`
                                : staff.profiles?.email || "Utilisateur"}
                            </div>
                            <div className="text-sm text-muted-foreground">{staff.profiles?.email}</div>
                            <Badge variant="outline" className="mt-2">Staff</Badge>
                          </div>
                        </div>

                        <div className="space-y-3 border-t pt-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Send className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <h4 className="font-medium text-sm">Gestion des Newsletters</h4>
                                <p className="text-xs text-muted-foreground">
                                  Créer, modifier et envoyer des newsletters
                                </p>
                              </div>
                            </div>
                            <Switch
                              checked={staff.can_manage_newsletters ?? false}
                              onCheckedChange={(checked) =>
                                updatePermissionMutation.mutate({
                                  userOrgId: staff.id,
                                  field: "can_manage_newsletters",
                                  value: checked,
                                })
                              }
                              disabled={updatePermissionMutation.isPending}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <h4 className="font-medium text-sm">Messagerie Organisation</h4>
                                <p className="text-xs text-muted-foreground">
                                  Accéder et gérer les messages de l'organisation
                                </p>
                              </div>
                            </div>
                            <Switch
                              checked={staff.can_manage_org_messages ?? false}
                              onCheckedChange={(checked) =>
                                updatePermissionMutation.mutate({
                                  userOrgId: staff.id,
                                  field: "can_manage_org_messages",
                                  value: checked,
                                })
                              }
                              disabled={updatePermissionMutation.isPending}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
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