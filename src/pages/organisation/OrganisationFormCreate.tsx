import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrgPageTitle } from '@/hooks/usePageTitle';
import { ArrowLeft, Save, Eye, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FormConfig, FormBlock } from '@/types/form';
import { useToast } from '@/hooks/use-toast';
import { FlowTallyEditor } from '@/components/form-builder/FlowTallyEditor';
import { supabase } from '@/integrations/supabase/client';

export default function OrganisationFormCreate() {
  useOrgPageTitle("Créer Formulaire");
  const { id: orgId, formId } = useParams<{ id: string; formId?: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditMode = !!formId;
  
  const [form, setForm] = useState<FormConfig>(() => ({
    id: formId || `form_${Date.now()}`,
    title: 'Nouveau formulaire',
    description: '',
    blocks: [],
    published: false,
    organisation_id: orgId || '',
    created_at: new Date(),
    updated_at: new Date(),
    created_by: '',
    settings: {
      allowMultipleSubmissions: false,
      requireLogin: false,
      showProgressBar: true
    }
  }));

  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);

  // Get current user
  useEffect(() => {
    const getUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setForm(prev => ({ ...prev, created_by: user.id }));
      }
    };
    getUserId();
  }, []);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (form.blocks.length > 0) {
        handleSave(false);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [form]);

  const handleSave = async (showToast = true) => {
    setIsLoading(true);
    try {
      // Check if form exists in database
      const { data: existingForm, error: fetchError } = await supabase
        .from('organisation_forms')
        .select('id')
        .eq('id', form.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      const formData = {
        id: form.id,
        title: form.title,
        description: form.description,
        blocks: form.blocks,
        published: form.published,
        organisation_id: orgId,
        created_by: form.created_by,
        settings: form.settings,
        updated_at: new Date().toISOString()
      };

      if (existingForm) {
        // Update existing form
        const { error } = await supabase
          .from('organisation_forms')
          .update(formData)
          .eq('id', form.id);
        
        if (error) throw error;
      } else {
        // Insert new form
        const { error } = await supabase
          .from('organisation_forms')
          .insert({
            ...formData,
            created_at: new Date().toISOString()
          });
        
        if (error) throw error;
      }

      setLastSaved(new Date());
      
      if (showToast) {
        toast({
          title: "Formulaire sauvegardé",
          description: "Vos modifications ont été enregistrées.",
        });
      }
    } catch (error) {
      console.error('Error saving form:', error);
      toast({
        title: "Erreur de sauvegarde",
        description: "Impossible de sauvegarder le formulaire.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlocksChange = (blocks: FormBlock[]) => {
    setForm(prev => ({
      ...prev,
      blocks,
      updated_at: new Date()
    }));
  };

  const handlePublish = async () => {
    const updatedForm = { ...form, published: true };
    setForm(updatedForm);
    
    await handleSave(false);
    
    toast({
      title: "Formulaire publié !",
      description: "Votre formulaire est maintenant accessible au public.",
    });
  };

  const handlePreview = () => {
    // Save before preview
    handleSave(false);
    // Open preview in new tab
    window.open(`/organisation/${orgId}/forms/preview/${form.id}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate(`/organisation/${orgId}/forms`)}
                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Retour aux formulaires</span>
              </button>
              <div className="h-6 w-px bg-border"></div>
              <div className="flex items-center space-x-3">
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="text-lg font-semibold border-none p-0 focus-visible:ring-0 bg-transparent"
                  placeholder="Titre du formulaire"
                />
                <Badge variant={form.published ? "default" : "secondary"}>
                  {form.published ? "Publié" : "Brouillon"}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {lastSaved && (
                <span className="text-xs text-muted-foreground">
                  Sauvegardé {lastSaved.toLocaleTimeString()}
                </span>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleSave(true)}
                disabled={isLoading}
              >
                <Save className="h-4 w-4 mr-2" />
                Sauvegarder
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handlePreview}
              >
                <Eye className="h-4 w-4 mr-2" />
                Aperçu
              </Button>
              <Button 
                size="sm" 
                onClick={handlePublish} 
                disabled={form.published || isLoading}
              >
                <Send className="h-4 w-4 mr-2" />
                {form.published ? "Publié" : "Publier"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">

        {/* Flow Tally Editor - Reproduction Exacte */}
        <FlowTallyEditor
          blocks={form.blocks || []}
          onBlocksChange={handleBlocksChange}
          title={form.title}
          description={form.description}
          onTitleChange={(title) => setForm({ ...form, title })}
          onDescriptionChange={(description) => setForm({ ...form, description })}
          className="min-h-[600px]"
        />
        {/* Ligne vide disponible sous le formulaire */}
        <div className="py-8"></div> 
      </div>
    </div>
  );
}
