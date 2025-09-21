import { useState, useEffect } from 'react';
import { 
  getOrganisationPartners, 
  createPartner, 
  updatePartner, 
  deletePartner 
} from '../services/organisationService';

// Types pour les partenaires
export interface Partner {
  id: string;
  organization_id: string;
  name: string;
  type: 'investor' | 'accelerator' | 'incubator' | 'corporate' | 'government' | 'university' | 'other';
  description?: string;
  logo?: string;
  website?: string;
  contact_email?: string;
  contact_phone?: string;
  collaboration_type: string[];
  rating: number;
  status: 'active' | 'inactive' | 'prospect';
  created_at: string;
  updated_at: string;
}

export interface PartnerFormData {
  name: string;
  type: Partner['type'];
  description?: string;
  website?: string;
  contact_email?: string;
  contact_phone?: string;
  collaboration_type: string[];
  status: Partner['status'];
  organization_id: string;
}

export const usePartners = (organisationId: string | undefined) => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPartners = async () => {
    if (!organisationId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await getOrganisationPartners(organisationId);
      setPartners(data);
    } catch (err) {
      setError('Erreur lors du chargement des partenaires');
      console.error('Erreur chargement partenaires:', err);
    } finally {
      setLoading(false);
    }
  };

  const addPartner = async (partnerData: PartnerFormData): Promise<boolean> => {
    try {
      const newPartner = await createPartner({
        ...partnerData,
        rating: 0,
        collaboration_type: partnerData.collaboration_type || []
      });
      
      if (newPartner) {
        setPartners(prev => [newPartner, ...prev]);
        return true;
      }
      return false;
    } catch (err) {
      setError('Erreur lors de la création du partenaire');
      console.error('Erreur création partenaire:', err);
      return false;
    }
  };

  const editPartner = async (partnerId: string, updates: Partial<Partner>): Promise<boolean> => {
    try {
      const updatedPartner = await updatePartner(partnerId, updates);
      
      if (updatedPartner) {
        setPartners(prev => prev.map(p => p.id === partnerId ? updatedPartner : p));
        return true;
      }
      return false;
    } catch (err) {
      setError('Erreur lors de la modification du partenaire');
      console.error('Erreur modification partenaire:', err);
      return false;
    }
  };

  const removePartner = async (partnerId: string): Promise<boolean> => {
    try {
      const success = await deletePartner(partnerId);
      
      if (success) {
        setPartners(prev => prev.filter(p => p.id !== partnerId));
        return true;
      }
      return false;
    } catch (err) {
      setError('Erreur lors de la suppression du partenaire');
      console.error('Erreur suppression partenaire:', err);
      return false;
    }
  };

  useEffect(() => {
    fetchPartners();
  }, [organisationId]);

  return {
    partners,
    loading,
    error,
    fetchPartners,
    addPartner,
    editPartner,
    removePartner
  };
};