import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, FileText, Eye, Edit, Trash2, Copy, BarChart } from 'lucide-react';
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Form {
  id: string;
  title: string;
  description?: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  responses_count?: number;
}

export default function OrganisationForms() {
  const { id: orgId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [forms, setForms] = useState<Form[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteFormId, setDeleteFormId] = useState<string | null>(null);

  useEffect(() => {
    loadForms();
  }, [orgId]);

  const loadForms = async () => {
    try {
      setIsLoading(true);
      
      // Fetch forms - simplified without response count for better performance
      const { data: formsData, error } = await supabase
        .from('organisation_forms')
        .select(`
          id,
          title,
          description,
          published,
          created_at,
          updated_at
        `)
        .eq('organisation_id', orgId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setForms(formsData || []);
    } catch (error) {
      console.error('Error loading forms:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les formulaires.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteFormId) return;

    try {
      const { error } = await supabase
        .from('organisation_forms')
        .delete()
        .eq('id', deleteFormId);

      if (error) throw error;

      setForms(forms.filter(f => f.id !== deleteFormId));
      toast({
        title: "Formulaire supprimé",
        description: "Le formulaire a été supprimé avec succès.",
      });
    } catch (error) {
      console.error('Error deleting form:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le formulaire.",
        variant: "destructive",
      });
    } finally {
      setDeleteFormId(null);
    }
  };

  const handleDuplicate = async (formId: string) => {
    try {
      // Get the form to duplicate
      const { data: formData, error: fetchError } = await supabase
        .from('organisation_forms')
        .select('*')
        .eq('id', formId)
        .single();

      if (fetchError) throw fetchError;

      // Create a duplicate
      const duplicateForm = {
        ...formData,
        id: `form_${Date.now()}`,
        title: `${formData.title} (copie)`,
        published: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error: insertError } = await supabase
        .from('organisation_forms')
        .insert(duplicateForm);

      if (insertError) throw insertError;

      await loadForms();
      
      toast({
        title: "Formulaire dupliqué",
        description: "Le formulaire a été dupliqué avec succès.",
      });
    } catch (error) {
      console.error('Error duplicating form:', error);
      toast({
        title: "Erreur",
        description: "Impossible de dupliquer le formulaire.",
        variant: "destructive",
      });
    }
  };

  const getFormUrl = (formId: string) => {
    return `${window.location.origin}/form/${orgId}/${formId}`;
  };

  const copyFormUrl = (formId: string) => {
    navigator.clipboard.writeText(getFormUrl(formId));
    toast({
      title: "Lien copié",
      description: "Le lien du formulaire a été copié dans le presse-papier.",
    });
  };

  if (isLoading) {
    return <LoadingSpinner message="Chargement..." fullScreen />;
  }

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Formulaires</h1>
          <p className="text-muted-foreground mt-2">
            Créez et gérez vos formulaires de collecte de données
          </p>
        </div>
        <Button onClick={() => navigate(`/organisation/${orgId}/forms/create`)}>
          <Plus className="h-4 w-4 mr-2" />
          Créer un formulaire
        </Button>
      </div>

      {forms.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun formulaire</h3>
            <p className="text-muted-foreground mb-4">
              Créez votre premier formulaire pour commencer à collecter des données
            </p>
            <Button onClick={() => navigate(`/organisation/${orgId}/forms/create`)}>
              <Plus className="h-4 w-4 mr-2" />
              Créer un formulaire
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map((form) => (
            <Card key={form.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{form.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {form.description || 'Aucune description'}
                    </CardDescription>
                  </div>
                  <Badge variant={form.published ? "default" : "secondary"}>
                    {form.published ? "Publié" : "Brouillon"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <span>{form.responses_count || 0} réponses</span>
                  <span>Créé le {new Date(form.created_at).toLocaleDateString()}</span>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/organisation/${orgId}/forms/edit/${form.id}`)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Éditer
                  </Button>
                  
                  {form.published && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(getFormUrl(form.id), '_blank')}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Voir
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyFormUrl(form.id)}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Lien
                      </Button>
                    </>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/organisation/${orgId}/forms/responses/${form.id}`)}
                  >
                    <BarChart className="h-4 w-4 mr-1" />
                    Réponses
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDuplicate(form.id)}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Dupliquer
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteFormId(form.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteFormId} onOpenChange={() => setDeleteFormId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action supprimera définitivement le formulaire et toutes ses réponses.
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
