import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrgPageTitle } from '@/hooks/usePageTitle';
import { FormBuilder, Question } from '@/components/form-builder/FormBuilder';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface FormData {
  title: string;
  description: string;
  questions: Question[];
}

export default function CreateForm() {
  useOrgPageTitle("Créer Formulaire");
  const { id: orgId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSave = async (data: FormData) => {
    console.log('Auto-saving form:', data);
    // Auto-save functionality - implement later if needed
  };

  const handlePublish = async (data: FormData) => {
    try {
      console.log('Publishing form:', data);
      
      if (!data.title.trim()) {
        toast({
          title: "Erreur",
          description: "Le titre du formulaire est requis.",
          variant: "destructive",
        });
        return;
      }

      if (data.questions.length === 0) {
        toast({
          title: "Erreur", 
          description: "Le formulaire doit contenir au moins une question.",
          variant: "destructive",
        });
        return;
      }
      
      const formRecord = {
        title: data.title.trim(),
        description: data.description?.trim() || null,
        organisation_id: orgId,
        published: true,
        form_data: data.questions,
      };

      console.log('Inserting form record:', formRecord);

      const { error } = await supabase
        .from('organisation_forms')
        .insert(formRecord);

      if (error) throw error;

      toast({
        title: "Formulaire publié",
        description: "Votre formulaire a été publié avec succès.",
      });

      navigate(`/organisation/${orgId}/forms`);
    } catch (error) {
      console.error('Error publishing form:', error);
      toast({
        title: "Erreur",
        description: "Impossible de publier le formulaire.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full">
      <FormBuilder
        onSave={handleSave}
        onPublish={handlePublish}
      />
    </div>
  );
}
