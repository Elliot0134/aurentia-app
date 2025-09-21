import { useState, useEffect } from 'react';
import { 
  getFormTemplates, 
  getFormSubmissions, 
  createFormTemplate, 
  updateFormTemplate, 
  deleteFormTemplate,
  FormTemplate,
  FormSubmission,
  FormTemplateFormData
} from '@/services/organisationService';

export type { FormTemplate, FormSubmission, FormTemplateFormData };

export interface FormAnalytics {
  totalSubmissions: number;
  averageCompletionTime: number;
  mostPopularFields: string[];
  submissionTrends: {
    date: string;
    count: number;
  }[];
}

export const useFormTemplates = (organizationId?: string) => {
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = async () => {
    if (!organizationId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await getFormTemplates(organizationId);
      setTemplates(data || []);
    } catch (err) {
      console.error('Erreur lors du chargement des templates:', err);
      setError('Erreur lors du chargement des templates de formulaires');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    if (!organizationId) return;
    
    try {
      const data = await getFormSubmissions(organizationId);
      setSubmissions(data || []);
    } catch (err) {
      console.error('Erreur lors du chargement des soumissions:', err);
      setError('Erreur lors du chargement des soumissions');
    }
  };

  const addTemplate = async (templateData: FormTemplateFormData): Promise<boolean> => {
    try {
      setError(null);
      const newTemplate = await createFormTemplate(templateData);
      if (newTemplate) {
        setTemplates(prev => [...prev, newTemplate]);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erreur lors de la création du template:', err);
      setError('Erreur lors de la création du template');
      return false;
    }
  };

  const editTemplate = async (id: string, templateData: Partial<FormTemplateFormData>): Promise<boolean> => {
    try {
      setError(null);
      const updated = await updateFormTemplate(id, templateData);
      if (updated) {
        setTemplates(prev => prev.map(t => t.id === id ? { ...t, ...updated } : t));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erreur lors de la mise à jour du template:', err);
      setError('Erreur lors de la mise à jour du template');
      return false;
    }
  };

  const removeTemplate = async (id: string): Promise<boolean> => {
    try {
      setError(null);
      const success = await deleteFormTemplate(id);
      if (success) {
        setTemplates(prev => prev.filter(t => t.id !== id));
        // Supprimer aussi les soumissions associées
        setSubmissions(prev => prev.filter(s => s.form_id !== id));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erreur lors de la suppression du template:', err);
      setError('Erreur lors de la suppression du template');
      return false;
    }
  };

  const getAnalytics = (): FormAnalytics => {
    const totalSubmissions = submissions.length;
    
    // Calculer le temps moyen de completion (simulé car pas dans les données)
    const averageCompletionTime = Math.floor(Math.random() * 300) + 60; // 1-5 minutes
    
    // Identifier les champs les plus populaires (simulé)
    const mostPopularFields = ['email', 'nom', 'entreprise', 'secteur'];
    
    // Tendances de soumission (grouper par date)
    const submissionsByDate = submissions.reduce((acc, submission) => {
      const date = new Date(submission.submitted_at).toLocaleDateString('fr-FR');
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const submissionTrends = Object.entries(submissionsByDate)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      totalSubmissions,
      averageCompletionTime,
      mostPopularFields,
      submissionTrends
    };
  };

  useEffect(() => {
    if (organizationId) {
      fetchTemplates();
      fetchSubmissions();
    }
  }, [organizationId]);

  return {
    templates,
    submissions,
    loading,
    error,
    addTemplate,
    editTemplate,
    removeTemplate,
    refetch: () => {
      fetchTemplates();
      fetchSubmissions();
    },
    analytics: getAnalytics()
  };
};