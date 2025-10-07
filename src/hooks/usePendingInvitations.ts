import { useState, useEffect } from 'react';
import { CollaboratorsService } from '@/services/collaborators.service';
import { Invitation } from '@/types/collaboration';
import { supabase } from '@/integrations/supabase/client';

export const usePendingInvitations = () => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchPendingInvitations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setInvitations([]);
        return;
      }

      const pendingInvitations = await CollaboratorsService.getPendingInvitations();
      setInvitations(pendingInvitations);
      
      // Afficher le modal seulement s'il y a des invitations en attente
      if (pendingInvitations.length > 0) {
        setShowModal(true);
      } else {
        setShowModal(false);
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des invitations:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  // Vérifier les invitations au montage du hook
  useEffect(() => {
    fetchPendingInvitations();
  }, []);

  // Écouter les changements d'authentification
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        fetchPendingInvitations();
      } else if (event === 'SIGNED_OUT') {
        setInvitations([]);
        setShowModal(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Écouter les changements dans la table project_invitations en temps réel
  useEffect(() => {
    const setupRealtimeSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) return;

      const channel = supabase
        .channel('project_invitations_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'project_invitations',
            filter: `email=eq.${user.email}`,
          },
          () => {
            // Rafraîchir les invitations quand il y a des changements
            fetchPendingInvitations();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupRealtimeSubscription();
  }, []);

  const handleInvitationAccepted = () => {
    // Rafraîchir la liste après acceptation d'une invitation
    fetchPendingInvitations();
  };

  return {
    invitations,
    loading,
    error,
    showModal,
    handleInvitationAccepted,
    refetch: fetchPendingInvitations,
  };
};