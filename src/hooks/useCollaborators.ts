import { useState, useEffect } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { CollaboratorsService } from '@/services/collaborators.service';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useCollaborators = (projectId?: string) => {
  const { userProjects, currentProjectId } = useProject();
  const [collaborators, setCollaborators] = useState([]);
  const [invitations, setPendingInvitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  // Transformer les projets utilisateur pour le format attendu
  const projects = userProjects.map(project => ({
    id: project.project_id,
    name: project.nom_projet || 'Projet sans nom',
    description: `Créé le ${new Date(project.created_at).toLocaleDateString('fr-FR')}`
  }));

  // Fonction pour normaliser les collaborateurs et s'assurer qu'ils ont toutes les propriétés requises
  const normalizeCollaborators = (data) => {
    return data.map(collaborator => ({
      ...collaborator,
      email: collaborator.email || collaborator.user?.email || '',
      projects: collaborator.projects || [],
      status: collaborator.status || 'active',
      role: collaborator.role || 'viewer'
    }));
  };

  // Charger les collaborateurs
  const loadCollaborators = async () => {
    setLoading(true);
    try {
      const data = projectId 
        ? await CollaboratorsService.getProjectCollaborators(projectId)
        : await CollaboratorsService.getUserCollaborators();
      
      setCollaborators(normalizeCollaborators(data));
    } catch (err) {
      setError(err.message);
      toast({
        title: "Erreur",
        description: "Impossible de charger les collaborateurs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Charger les invitations en attente
  const loadPendingInvitations = async () => {
    try {
      const data = await CollaboratorsService.getSentInvitations();
      setPendingInvitations(data);
    } catch (err) {
      console.error('Erreur lors du chargement des invitations:', err);
    }
  };

  // S'abonner aux changements en temps réel
  useEffect(() => {
    loadCollaborators();
    loadPendingInvitations();

    // Subscription pour les changements de collaborateurs
    const collaboratorsSubscription = supabase
      .channel('collaborators_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'project_collaborators',
        filter: projectId ? `project_id=eq.${projectId}` : undefined
      }, () => {
        loadCollaborators();
      })
      .subscribe();

    // Subscription pour les nouvelles invitations
    const invitationsSubscription = supabase
      .channel('invitations_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'project_invitations'
      }, () => {
        loadPendingInvitations();
      })
      .subscribe();

    return () => {
      collaboratorsSubscription.unsubscribe();
      invitationsSubscription.unsubscribe();
    };
  }, [projectId, currentProjectId]);

  // Inviter un collaborateur
  const inviteCollaborator = async (inviteData) => {
    setLoading(true);
    try {
      const { email, role, projects: selectedProjects } = inviteData;
      const projectIds = selectedProjects || [currentProjectId];
      
      let allSuccessful = true;
      let lastError = null;
      
      for (const pid of projectIds) {
        const result = await CollaboratorsService.inviteCollaborator(pid, email, role);
        if (!result.success) {
          allSuccessful = false;
          lastError = result.error;
          break;
        }
      }
      
      if (allSuccessful) {
        toast({
          title: "Invitation envoyée",
          description: `Une invitation a été envoyée à ${email}`,
        });
        
        await loadCollaborators();
        return { success: true };
      } else {
        toast({
          title: "Erreur",
          description: lastError,
          variant: "destructive"
        });
        return { success: false, error: lastError };
      }
    } catch (err) {
      toast({
        title: "Erreur",
        description: err.message,
        variant: "destructive"
      });
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Accepter une invitation
  const acceptInvitation = async (token) => {
    try {
      const result = await CollaboratorsService.acceptInvitation(token);
      
      if (result.success) {
        toast({
          title: "Invitation acceptée",
          description: "Vous avez maintenant accès au projet",
        });
        
        await loadCollaborators();
        await loadPendingInvitations();
        return { success: true };
      } else {
        toast({
          title: "Erreur",
          description: result.error,
          variant: "destructive"
        });
        return { success: false, error: result.error };
      }
    } catch (err) {
      toast({
        title: "Erreur",
        description: err.message,
        variant: "destructive"
      });
      return { success: false, error: err.message };
    }
  };

  // Mettre à jour un collaborateur
  const updateCollaborator = async (collaboratorId, updates) => {
    try {
      if (updates.role) {
        await CollaboratorsService.updateCollaboratorRole(collaboratorId, updates.role);
      }
      
      if (updates.status) {
        await CollaboratorsService.updateCollaboratorStatus(collaboratorId, updates.status);
      }
      
      await loadCollaborators();
      return { success: true };
    } catch (err) {
      toast({
        title: "Erreur",
        description: err.message,
        variant: "destructive"
      });
      return { success: false, error: err.message };
    }
  };

  // Supprimer un collaborateur
  const removeCollaborator = async (collaboratorId) => {
    try {
      await CollaboratorsService.removeCollaborator(collaboratorId);
      
      toast({
        title: "Collaborateur supprimé",
        description: "Le collaborateur a été retiré du projet",
      });
      
      await loadCollaborators();
      return { success: true };
    } catch (err) {
      toast({
        title: "Erreur",
        description: err.message,
        variant: "destructive"
      });
      return { success: false, error: err.message };
    }
  };

  // Changer le statut d'un collaborateur
  const changeCollaboratorStatus = async (collaboratorId, newStatus) => {
    return updateCollaborator(collaboratorId, { status: newStatus });
  };

  // Vérifier les permissions
  const checkPermission = async (action, userId) => {
    if (!currentProjectId || !userId) return false;
    
    try {
      const permissions = await CollaboratorsService.checkUserPermissions(currentProjectId, userId);
      
      const actionPermissionMap = {
        'read': permissions.permissions.canRead,
        'write': permissions.permissions.canWrite,
        'delete': permissions.permissions.canDelete,
        'manage': permissions.permissions.canManageCollaborators
      };
      
      return actionPermissionMap[action] || false;
    } catch (err) {
      console.error('Erreur lors de la vérification des permissions:', err);
      return false;
    }
  };

  // Obtenir un collaborateur par ID
  const getCollaboratorById = (id) => {
    return collaborators.find(collaborator => collaborator.id === id);
  };

  // Obtenir les collaborateurs par statut
  const getCollaboratorsByStatus = (status) => {
    return collaborators.filter(collaborator => collaborator.status === status);
  };

  // Obtenir les projets d'un collaborateur
  const getCollaboratorProjects = (collaboratorId) => {
    const collaborator = getCollaboratorById(collaboratorId);
    if (!collaborator) return [];
    
    return projects.filter(project => 
      collaborators.some(c => 
        c.user_id === collaborator.user_id && 
        c.project_id === project.id
      )
    );
  };

  // Statistiques
  const stats = {
    total: collaborators.length,
    active: collaborators.filter(c => c.status === 'active').length,
    pending: invitations.length,
    suspended: collaborators.filter(c => c.status === 'suspended').length,
    collaborativeProjects: projects.filter(p =>
      collaborators.some(c => c.project?.project_id === p.id && c.status === 'active')
    ).length,
    byRole: {
      viewer: collaborators.filter(c => c.role === 'viewer').length,
      editor: collaborators.filter(c => c.role === 'editor').length,
      admin: collaborators.filter(c => c.role === 'admin').length,
      owner: collaborators.filter(c => c.role === 'owner').length,
    }
  };

  return {
    // État
    collaborators,
    invitations,
    projects,
    loading,
    error,
    stats,

    // Actions
    inviteCollaborator,
    acceptInvitation,
    updateCollaborator,
    removeCollaborator,
    changeCollaboratorStatus,

    // Utilitaires
    getCollaboratorById,
    getCollaboratorsByStatus,
    getCollaboratorProjects,
    checkPermission,

    // Actions de rafraîchissement
    refresh: loadCollaborators,
    clearError: () => setError(null)
  };
};

export default useCollaborators;