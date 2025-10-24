import { useState, useEffect } from 'react';
import {
  getOrganisationDeliverables,
  createDeliverable,
  updateDeliverable,
  deleteDeliverable,
  Deliverable
} from '@/services/organisationService';
import type { ResourceContent, ResourceType, ResourceVisibility } from '@/types/resourceTypes';

export type { Deliverable };

export interface DeliverableFormData {
  organization_id: string;
  project_id?: string;
  entrepreneur_id?: string;
  title: string;
  description?: string;
  type: 'business-model' | 'market-analysis' | 'pitch' | 'legal' | 'financial' | 'prototype' | 'presentation' | 'other';
  status: 'pending' | 'in-progress' | 'completed' | 'reviewed' | 'approved';
  quality_score?: number;
  due_date?: string;
  // New resource fields
  content?: ResourceContent;
  resource_type?: ResourceType;
  visibility?: ResourceVisibility;
  assigned_to?: string[];
}

export interface DeliverableStats {
  total: number;
  completed: number;
  inProgress: number;
  overdue: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
}

export const useDeliverables = (organizationId?: string) => {
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDeliverables = async () => {
    if (!organizationId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await getOrganisationDeliverables(organizationId);
      setDeliverables(data || []);
    } catch (err) {
      console.error('Erreur lors du chargement des livrables:', err);
      setError('Erreur lors du chargement des livrables');
    } finally {
      setLoading(false);
    }
  };

  const addDeliverable = async (deliverableData: DeliverableFormData): Promise<boolean> => {
    try {
      setError(null);
      const newDeliverable = await createDeliverable(deliverableData);
      if (newDeliverable) {
        setDeliverables(prev => [...prev, newDeliverable]);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erreur lors de la création du livrable:', err);
      setError('Erreur lors de la création du livrable');
      return false;
    }
  };

  const editDeliverable = async (id: string, deliverableData: Partial<DeliverableFormData>): Promise<boolean> => {
    try {
      setError(null);
      const updated = await updateDeliverable(id, deliverableData);
      if (updated) {
        setDeliverables(prev => prev.map(d => d.id === id ? { ...d, ...updated } : d));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erreur lors de la mise à jour du livrable:', err);
      setError('Erreur lors de la mise à jour du livrable');
      return false;
    }
  };

  const removeDeliverable = async (id: string): Promise<boolean> => {
    try {
      setError(null);
      const success = await deleteDeliverable(id);
      if (success) {
        setDeliverables(prev => prev.filter(d => d.id !== id));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erreur lors de la suppression du livrable:', err);
      setError('Erreur lors de la suppression du livrable');
      return false;
    }
  };

  const getStats = (): DeliverableStats => {
    const total = deliverables.length;
    const completed = deliverables.filter(d => d.status === 'completed').length;
    const inProgress = deliverables.filter(d => d.status === 'in-progress').length;
    
    // Calculer les en retard (due_date passée et pas completed)
    const now = new Date();
    const overdue = deliverables.filter(d => 
      d.due_date && 
      new Date(d.due_date) < now && 
      d.status !== 'completed'
    ).length;

    // Grouper par type
    const byType = deliverables.reduce((acc, d) => {
      acc[d.type] = (acc[d.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Grouper par statut
    const byStatus = deliverables.reduce((acc, d) => {
      acc[d.status] = (acc[d.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      completed,
      inProgress,
      overdue,
      byType,
      byStatus
    };
  };

  useEffect(() => {
    if (organizationId) {
      fetchDeliverables();
    }
  }, [organizationId]);

  const updateResourceContent = async (id: string, content: ResourceContent): Promise<boolean> => {
    try {
      setError(null);
      const updated = await updateDeliverable(id, { content });
      if (updated) {
        setDeliverables(prev => prev.map(d => d.id === id ? { ...d, content } : d));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erreur lors de la mise à jour du contenu:', err);
      setError('Erreur lors de la mise à jour du contenu');
      return false;
    }
  };

  return {
    deliverables,
    loading,
    error,
    addDeliverable,
    editDeliverable,
    removeDeliverable,
    updateResourceContent,
    refetch: fetchDeliverables,
    stats: getStats()
  };
};