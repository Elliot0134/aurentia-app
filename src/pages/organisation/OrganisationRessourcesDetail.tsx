import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNavigationBlocker } from '@/hooks/useNavigationBlocker';
import { useOrgPageTitle } from '@/hooks/usePageTitle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Edit, Trash2, Eye, Save, X, Settings, ChevronDown, FileText, MessageSquare, Copy, History, Download, Sparkles, Mail } from 'lucide-react';
import CustomTabs from '@/components/ui/CustomTabs';
import { cn } from '@/lib/utils';
import { useOrganizationResources } from '@/hooks/useOrganizationResources';
import { useToast } from '@/hooks/use-toast';
import { ResourceBuilderV2 as ResourceBuilder } from '@/components/resource-builder/ResourceBuilderV2';
import { ResourceViewerV2 as ResourceViewer } from '@/components/resource-viewer/ResourceViewerV2';
import { VersionHistoryDialog } from '@/components/resource-builder/VersionHistoryDialog';
import { ExportDialog } from '@/components/resource-builder/ExportDialog';
import { SaveAsTemplateDialog } from '@/components/resource-builder/SaveAsTemplateDialog';
import { ShareAsNewsletterDialog } from '@/components/newsletters/ShareAsNewsletterDialog';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { ResourceContent } from '@/types/resourceTypes';
import type { OrganizationResource, UpdateResourceData } from '@/services/resourcesService';
import DeliverableComments from '@/components/deliverables/shared/DeliverableComments';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const OrganisationRessourcesDetail = () => {
  useOrgPageTitle("Détail Ressource");
  const { id: organisationId, resourceId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { resources, loading, editResource, removeResource, refetch, trackView } = useOrganizationResources(organisationId);

  const [resource, setResource] = useState<OrganizationResource | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [saveAsTemplateOpen, setSaveAsTemplateOpen] = useState(false);
  const [shareNewsletterOpen, setShareNewsletterOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settingsExpanded, setSettingsExpanded] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [contentChanged, setContentChanged] = useState(false);
  const [viewerActiveTab, setViewerActiveTab] = useState('content');

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    resource_type: 'guide' as const,
    visibility: 'public' as const,
    status: 'draft' as const
  });

  // Block browser navigation (refresh, close tab) when there are unsaved changes
  useNavigationBlocker(hasUnsavedChanges && editMode);

  useEffect(() => {
    if (resources.length > 0 && resourceId) {
      const found = resources.find(r => r.id === resourceId);
      if (found) {
        setResource(found);
        setEditFormData({
          title: found.title,
          description: found.description || '',
          resource_type: (found.resource_type || 'guide') as any,
          visibility: (found.visibility || 'organization') as any,
          status: (found.status || 'draft') as any
        });
        setHasUnsavedChanges(false);
        setContentChanged(false);
      }
    }
  }, [resources, resourceId]);

  // Track form changes
  useEffect(() => {
    if (resource && editMode) {
      const hasMetadataChanges =
        editFormData.title !== resource.title ||
        editFormData.description !== (resource.description || '') ||
        editFormData.resource_type !== resource.resource_type ||
        editFormData.visibility !== resource.visibility ||
        editFormData.status !== resource.status;

      setHasUnsavedChanges(hasMetadataChanges || contentChanged);
    }
  }, [editFormData, contentChanged, resource, editMode]);

  // Track resource view when viewing (not editing)
  useEffect(() => {
    if (resource && !editMode && resourceId) {
      trackView(resourceId);
    }
  }, [resource?.id, editMode]);

  const handleSaveMetadata = async () => {
    if (!resource || !organisationId) return;

    setSaving(true);

    const updateData: UpdateResourceData = {
      title: editFormData.title,
      description: editFormData.description,
      resource_type: editFormData.resource_type,
      visibility: editFormData.visibility,
      status: editFormData.status
    };

    const updated = await editResource(resource.id, updateData);

    if (updated) {
      toast({
        title: "Succès",
        description: "Les informations ont été mises à jour.",
      });
      setResource(updated);
      setHasUnsavedChanges(false);
      setContentChanged(false);
      refetch();
    } else {
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour.",
        variant: "destructive",
      });
    }

    setSaving(false);
  };

  const handleSaveContent = (content: ResourceContent) => {
    setContentChanged(true);
    if (resource) {
      setResource({ ...resource, content });
    }
  };

  const handleSaveAll = async () => {
    if (!resource || !organisationId) return;

    setSaving(true);

    const updateData: UpdateResourceData = {
      title: editFormData.title,
      description: editFormData.description,
      resource_type: editFormData.resource_type,
      visibility: editFormData.visibility,
      status: editFormData.status,
      content: resource.content
    };

    const updated = await editResource(resource.id, updateData);

    if (updated) {
      toast({
        title: "Succès",
        description: "La ressource a été enregistrée avec succès.",
      });
      setResource(updated);
      setHasUnsavedChanges(false);
      setContentChanged(false);
      refetch();
    } else {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'enregistrement.",
        variant: "destructive",
      });
    }

    setSaving(false);
  };

  const handleDelete = async () => {
    if (!resource) return;

    const success = await removeResource(resource.id);

    if (success) {
      toast({
        title: "Succès",
        description: "La ressource a été supprimée.",
      });
      navigate(`/organisation/${organisationId}/ressources`);
    } else {
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      'draft': { label: 'Brouillon', className: 'bg-yellow-100 text-yellow-700' },
      'published': { label: 'Publié', className: 'bg-green-100 text-green-700' },
      'archived': { label: 'Archivé', className: 'bg-gray-100 text-gray-700' }
    };
    return statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-700' };
  };

  if (loading) {
    return <LoadingSpinner message="Chargement..." fullScreen />;
  }

  if (!resource) {
    return (
      <div className="min-h-screen" style={{ background: '#F4F4F1' }}>
        <div className="mx-auto px-4 py-8" style={{ width: '85%', maxWidth: '1400px' }}>
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-gray-400 mb-4 text-4xl">📄</div>
              <h3 className="text-lg font-semibold mb-2">Ressource introuvable</h3>
              <p className="text-gray-600 mb-4">
                Cette ressource n'existe pas ou a été supprimée.
              </p>
              <Button
                onClick={() => navigate(`/organisation/${organisationId}/ressources`)}
                className="btn-white-label hover:opacity-90"
              >
                Retour aux ressources
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const statusBadge = getStatusBadge(resource.status);

  return (
    <div className="min-h-screen" style={{ background: '#F4F4F1' }}>
      <div className="mx-auto px-4 py-8" style={{ width: '85%', maxWidth: '1400px' }}>
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(`/organisation/${organisationId}/ressources`)}
            className="mb-4 hover:bg-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux ressources
          </Button>

          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {resource.title}
                </h1>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusBadge.className}`}>
                  {statusBadge.label}
                </span>
              </div>
              <p className="text-gray-600">
                {resource.description || 'Aucune description'}
              </p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span>Type: <span className="font-medium capitalize">{resource.resource_type || 'guide'}</span></span>
                <span>•</span>
                <span>Créé le {resource.created_at ? new Date(resource.created_at).toLocaleDateString('fr-FR') : 'N/A'}</span>
                {resource.updated_at && (
                  <>
                    <span>•</span>
                    <span>Modifié le {new Date(resource.updated_at).toLocaleDateString('fr-FR')}</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!editMode ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setVersionHistoryOpen(true)}
                    className="bg-white"
                    title="Voir l'historique des versions"
                  >
                    <History className="w-4 h-4 mr-2" />
                    Historique
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setExportDialogOpen(true)}
                    className="bg-white"
                    title="Exporter la ressource"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exporter
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShareNewsletterOpen(true)}
                    className="bg-white"
                    title="Partager comme newsletter"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Partager comme newsletter
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSaveAsTemplateOpen(true)}
                    className="bg-white"
                    title="Sauvegarder comme modèle"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Sauvegarder comme modèle
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditMode(true)}
                    className="bg-white"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Modifier
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setDeleteDialogOpen(true)}
                    className="bg-white text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setEditMode(false)}
                  className="bg-white"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Aperçu
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        {editMode ? (
          <div className="space-y-6">
            {/* Horizontal Settings Panel */}
            <Card>
              <CardHeader className="pb-4 cursor-pointer" onClick={() => setSettingsExpanded(!settingsExpanded)}>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Paramètres de la ressource
                    </CardTitle>
                    <CardDescription>Métadonnées et configuration</CardDescription>
                  </div>
                  <ChevronDown className={cn("w-5 h-5 transition-transform", !settingsExpanded && "-rotate-90")} />
                </div>
              </CardHeader>
              {settingsExpanded && (
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    <div>
                      <Label htmlFor="edit-title" className="text-sm font-medium">Titre</Label>
                      <Input
                        id="edit-title"
                        value={editFormData.title}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Titre de la ressource..."
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="edit-type" className="text-sm font-medium">Type</Label>
                      <Select
                        value={editFormData.resource_type}
                        onValueChange={(value: any) => setEditFormData(prev => ({ ...prev, resource_type: value }))}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="guide">Guide</SelectItem>
                          <SelectItem value="tutorial">Tutoriel</SelectItem>
                          <SelectItem value="template">Modèle</SelectItem>
                          <SelectItem value="document">Document</SelectItem>
                          <SelectItem value="faq">FAQ</SelectItem>
                          <SelectItem value="policy">Politique</SelectItem>
                          <SelectItem value="procedure">Procédure</SelectItem>
                          <SelectItem value="reference">Référence</SelectItem>
                          <SelectItem value="onboarding">Onboarding</SelectItem>
                          <SelectItem value="training">Formation</SelectItem>
                          <SelectItem value="custom">Personnalisé</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="edit-visibility" className="text-sm font-medium">Visibilité</Label>
                      <Select
                        value={editFormData.visibility}
                        onValueChange={(value: any) => setEditFormData(prev => ({ ...prev, visibility: value }))}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public (Tous les membres)</SelectItem>
                          <SelectItem value="private">Privé (Staff uniquement)</SelectItem>
                          <SelectItem value="personal">Personnel (Moi uniquement)</SelectItem>
                          <SelectItem value="custom">Personnalisé (Sélection manuelle)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="edit-status" className="text-sm font-medium">Statut</Label>
                      <Select
                        value={editFormData.status}
                        onValueChange={(value: any) => setEditFormData(prev => ({ ...prev, status: value }))}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Brouillon</SelectItem>
                          <SelectItem value="published">Publié</SelectItem>
                          <SelectItem value="archived">Archivé</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">
                        💡 <span className="font-medium">Astuce :</span> Utilisez les boutons "+" pour ajouter des blocs
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Label htmlFor="edit-description" className="text-sm font-medium">Description courte</Label>
                    <Textarea
                      id="edit-description"
                      value={editFormData.description}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Description visible dans la liste des ressources..."
                      rows={3}
                      className="mt-2"
                    />
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Main Content - Resource Builder - Full Width */}
            <Card className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Contenu de la ressource
                </h2>
                <p className="text-sm text-gray-600">
                  Modifiez votre contenu avec des blocs enrichis (texte, images, vidéos, tableaux, etc.). Cliquez sur les boutons <kbd className="px-2 py-0.5 bg-gray-100 border rounded text-xs font-mono">+ Ajouter un block</kbd> pour ajouter du contenu.
                </p>
              </div>

              <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 bg-gray-50/30">
                <ResourceBuilder
                  initialContent={resource.content}
                  organizationId={organisationId}
                  onSave={handleSaveContent}
                  autoSave={false}
                  readOnly={false}
                  resourceType={editFormData.resource_type}
                />
              </div>
            </Card>
          </div>
        ) : (
          <Card className="p-6">
            <CustomTabs
              tabs={[
                {
                  key: 'content',
                  label: 'Contenu',
                  icon: FileText
                },
                {
                  key: 'comments',
                  label: 'Commentaires',
                  icon: MessageSquare
                }
              ]}
              activeTab={viewerActiveTab}
              onTabChange={setViewerActiveTab}
            >
              {viewerActiveTab === 'content' ? (
                <div className="mt-6">
                  <ResourceViewer resource={resource} showComments={false} organizationId={organisationId} />
                </div>
              ) : (
                <div className="mt-6 max-w-4xl mx-auto">
                  <DeliverableComments
                    deliverableId={resource.id}
                    organizationId={resource.organization_id}
                    itemType="resource"
                  />
                </div>
              )}
            </CustomTabs>
          </Card>
        )}

        {/* Sticky Save Button - Bottom Right (only in edit mode) */}
        {editMode && (
          <div className="fixed bottom-8 right-8 md:bottom-8 md:right-8 sm:bottom-4 sm:right-4 z-50">
            <Button
              onClick={handleSaveAll}
              disabled={saving || !hasUnsavedChanges}
              style={{ backgroundColor: '#ff5932' }}
              className="hover:opacity-90 text-white shadow-lg hover:shadow-xl transition-shadow"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette ressource ? Cette action est irréversible et toutes les données associées seront perdues.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Version History Dialog */}
      {resource && organisationId && (
        <VersionHistoryDialog
          resourceId={resource.id}
          organizationId={organisationId}
          isOpen={versionHistoryOpen}
          onClose={() => setVersionHistoryOpen(false)}
          onRestore={(version) => {
            // Refresh the resource after restoration
            refetch();
            setResource({ ...resource, title: version.title, content: version.content as any });
          }}
        />
      )}

      {/* Export Dialog */}
      {resource && (
        <ExportDialog
          resource={resource as any}
          isOpen={exportDialogOpen}
          onClose={() => setExportDialogOpen(false)}
        />
      )}

      {/* Save as Template Dialog */}
      {resource && (
        <SaveAsTemplateDialog
          resource={resource}
          isOpen={saveAsTemplateOpen}
          onClose={() => setSaveAsTemplateOpen(false)}
          onSuccess={() => {
            toast({
              title: 'Modèle créé',
              description: 'La ressource a été sauvegardée comme modèle réutilisable',
            });
          }}
        />
      )}

      {/* Share as Newsletter Dialog */}
      {resource && (
        <ShareAsNewsletterDialog
          resource={resource}
          open={shareNewsletterOpen}
          onOpenChange={setShareNewsletterOpen}
        />
      )}
    </div>
  );
};

export default OrganisationRessourcesDetail;
