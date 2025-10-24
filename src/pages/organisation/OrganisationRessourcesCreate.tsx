import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNavigationBlocker } from '@/hooks/useNavigationBlocker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, Eye, Settings, ChevronDown, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOrganizationResources } from '@/hooks/useOrganizationResources';
import { useToast } from '@/hooks/use-toast';
import { ResourceBuilderV2 as ResourceBuilder } from '@/components/resource-builder/ResourceBuilderV2';
import type { ResourceContent } from '@/types/resourceTypes';
import { createEmptyResourceContent } from '@/types/resourceTypes';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type { CreateResourceData } from '@/services/resourcesService';

const OrganisationRessourcesCreate = () => {
  const { id: organisationId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addResource } = useOrganizationResources(organisationId);

  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<CreateResourceData>>({
    title: '',
    description: '',
    resource_type: 'guide',
    visibility: 'public',
    status: 'draft',
    content: createEmptyResourceContent(),
    organization_id: organisationId || '',
    assigned_to: []
  });

  // Block browser navigation (refresh, close tab) when there are unsaved changes
  useNavigationBlocker(hasUnsavedChanges);

  // Track changes
  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [formData]);

  const handleSave = async (asDraft = false) => {
    if (!organisationId || !formData.title) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir le titre de la ressource.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    const resourceData: CreateResourceData = {
      organization_id: organisationId,
      title: formData.title,
      description: formData.description,
      resource_type: formData.resource_type || 'guide',
      visibility: formData.visibility || 'organization',
      status: asDraft ? 'draft' : 'published',
      content: formData.content || createEmptyResourceContent()
    };

    const newResource = await addResource(resourceData);

    if (newResource) {
      setHasUnsavedChanges(false); // Clear unsaved changes flag
      toast({
        title: "Succès",
        description: asDraft
          ? "La ressource a été enregistrée en brouillon."
          : "La ressource a été créée et publiée avec succès.",
      });
      navigate(`/organisation/${organisationId}/ressources`);
    } else {
      toast({
        title: "Erreur",
        description: "Erreur lors de la création de la ressource.",
        variant: "destructive",
      });
    }

    setSaving(false);
  };

  const handleContentUpdate = (content: ResourceContent) => {
    setFormData(prev => ({ ...prev, content }));
  };

  if (saving) {
    return <LoadingSpinner message="Enregistrement en cours..." fullScreen />;
  }

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

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {formData.title || 'Nouvelle Ressource'}
              </h1>
              <p className="text-gray-600">
                Créez une ressource personnalisée avec du contenu riche (texte, images, vidéos, tableaux, etc.)
              </p>
            </div>

            <Button
              variant="outline"
              onClick={() => setPreviewMode(!previewMode)}
              className="bg-white"
            >
              <Eye className="w-4 h-4 mr-2" />
              {previewMode ? 'Mode Édition' : 'Aperçu'}
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="space-y-6">
          {/* Horizontal Settings Panel */}
          <Card>
            <CardHeader className="pb-4 cursor-pointer" onClick={() => setFormData(prev => ({ ...prev, settingsExpanded: !prev.settingsExpanded }))}>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Paramètres de la ressource
                  </CardTitle>
                  <CardDescription>Configuration et métadonnées</CardDescription>
                </div>
                <ChevronDown className={cn("w-5 h-5 transition-transform", formData.settingsExpanded === false && "-rotate-90")} />
              </div>
            </CardHeader>
            {formData.settingsExpanded !== false && (
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <Label htmlFor="title" className="text-sm font-medium">Titre *</Label>
                    <Input
                      id="title"
                      value={formData.title || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Titre de la ressource..."
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="resource_type" className="text-sm font-medium">Type de ressource</Label>
                    <Select
                      value={formData.resource_type || 'guide'}
                      onValueChange={(value: any) => setFormData(prev => ({ ...prev, resource_type: value }))}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="guide">Guide</SelectItem>
                        <SelectItem value="template">Modèle</SelectItem>
                        <SelectItem value="document">Document</SelectItem>
                        <SelectItem value="custom">Personnalisé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="visibility" className="text-sm font-medium">Visibilité</Label>
                    <Select
                      value={formData.visibility || 'public'}
                      onValueChange={(value: any) => setFormData(prev => ({ ...prev, visibility: value }))}
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

                  <div className="md:col-span-2 lg:col-span-1">
                    <p className="text-sm text-gray-600">
                      💡 <span className="font-medium">Astuce :</span> Utilisez les boutons "+" pour ajouter des blocs de contenu
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <Label htmlFor="description" className="text-sm font-medium">Description courte</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
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
                Créez votre contenu avec des blocs enrichis (texte, images, vidéos, tableaux, etc.). Cliquez sur les boutons <kbd className="px-2 py-0.5 bg-gray-100 border rounded text-xs font-mono">+ Ajouter un block</kbd> pour ajouter du contenu.
              </p>
            </div>

            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 bg-gray-50/30">
              <ResourceBuilder
                initialContent={formData.content || createEmptyResourceContent()}
                organizationId={organisationId}
                onSave={handleContentUpdate}
                autoSave={false}
                readOnly={previewMode}
                resourceType={formData.resource_type}
              />
            </div>
          </Card>
        </div>

        {/* Sticky Save Buttons - Bottom Right */}
        <div className="fixed bottom-8 right-8 md:bottom-8 md:right-8 sm:bottom-4 sm:right-4 z-50 flex flex-col gap-2">
          <Button
            variant="outline"
            onClick={() => handleSave(true)}
            className="bg-white shadow-lg hover:shadow-xl transition-shadow"
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            Enregistrer brouillon
          </Button>
          <Button
            onClick={() => handleSave(false)}
            style={{ backgroundColor: '#ff5932' }}
            className="hover:opacity-90 text-white shadow-lg hover:shadow-xl transition-shadow"
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Enregistrement...' : 'Publier la ressource'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrganisationRessourcesCreate;
