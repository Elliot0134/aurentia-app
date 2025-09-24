import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getOrganisationMembers } from '@/services/organisationService';

export interface OrganisationMember {
  id: string;
  user_id: string;
  organization_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  user_role: 'organisation' | 'staff' | 'member';
  status: 'active' | 'inactive' | 'pending';
  joined_at: string;
  avatar_url?: string;
}

export const useOrganisationMembers = () => {
  const { id: organisationId } = useParams();
  const [members, setMembers] = useState<OrganisationMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMembers = async () => {
      if (!organisationId) return;

      try {
        setLoading(true);
        const rawMembers = await getOrganisationMembers(organisationId);
        
        // Adapter les données du service
        const adaptedMembers: OrganisationMember[] = rawMembers.map((member) => ({
          id: member.id,
          user_id: member.id,
          organization_id: member.organization_id,
          first_name: member.first_name || member.email.split('@')[0],
          last_name: member.last_name || '',
          email: member.email,
          phone: member.phone || undefined,
          user_role: member.user_role as 'organisation' | 'staff' | 'member',
          status: 'active', // Par défaut, tous les membres récupérés sont actifs
          joined_at: member.created_at
        }));

        setMembers(adaptedMembers);
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement des membres:', err);
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [organisationId]);

  // Fonctions utilitaires pour filtrer les membres par rôle
  const getOwners = () => members.filter(m => m.user_role === 'organisation');
  const getStaff = () => members.filter(m => m.user_role === 'staff');
  const getAdherents = () => members.filter(m => m.user_role === 'member');

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'organisation': return 'Propriétaire';
      case 'staff': return 'Staff';
      case 'member': return 'Adhérent';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'organisation': return 'bg-purple-100 text-purple-800';
      case 'staff': return 'bg-blue-100 text-blue-800';
      case 'member': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return {
    members,
    loading,
    error,
    getOwners,
    getStaff,
    getAdherents,
    getRoleLabel,
    getRoleColor
  };
};