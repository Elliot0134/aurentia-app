import { useState, useEffect } from 'react';
import { useProject } from '@/contexts/ProjectContext';

// Données simulées pour la démonstration des collaborateurs
const mockCollaborators = [
  {
    id: '1',
    email: 'marie.dupont@example.com',
    role: 'admin',
    status: 'active',
    projects: [], // Sera rempli avec les vrais IDs de projets
    avatar: null,
    invitedAt: '2024-01-15T10:00:00Z',
    lastActive: '2024-01-20T14:30:00Z'
  },
  {
    id: '2',
    email: 'jean.martin@example.com',
    role: 'editor',
    status: 'active',
    projects: [], // Sera rempli avec les vrais IDs de projets
    avatar: null,
    invitedAt: '2024-01-10T09:00:00Z',
    lastActive: '2024-01-19T16:45:00Z'
  },
  {
    id: '3',
    email: 'sophie.bernard@example.com',
    role: 'viewer',
    status: 'pending',
    projects: [], // Sera rempli avec les vrais IDs de projets
    avatar: null,
    invitedAt: '2024-01-18T11:30:00Z',
    lastActive: null
  },
  {
    id: '4',
    email: 'pierre.durand@example.com',
    role: 'editor',
    status: 'suspended',
    projects: [],
    avatar: null,
    invitedAt: '2024-01-05T08:15:00Z',
    lastActive: '2024-01-12T10:20:00Z'
  }
];

export const useCollaborators = () => {
  const { userProjects } = useProject();
  const [collaborators, setCollaborators] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Transformer les projets utilisateur pour le format attendu
  const projects = userProjects.map(project => ({
    id: project.project_id,
    name: project.nom_projet || 'Projet sans nom',
    description: `Créé le ${new Date(project.created_at).toLocaleDateString('fr-FR')}`
  }));

  // Initialiser les collaborateurs avec des projets réels
  useEffect(() => {
    if (userProjects.length > 0) {
      const collaboratorsWithRealProjects = mockCollaborators.map((collaborator, index) => {
        // Assigner quelques projets réels aux collaborateurs pour la démo
        const assignedProjects = userProjects.slice(0, Math.min(2, userProjects.length))
          .map(p => p.project_id);
        
        return {
          ...collaborator,
          projects: index === 3 ? [] : assignedProjects // Le collaborateur suspendu n'a pas de projets
        };
      });
      setCollaborators(collaboratorsWithRealProjects);
    }
  }, [userProjects]);

  // Statistiques calculées
  const stats = {
    total: collaborators.length,
    active: collaborators.filter(c => c.status === 'active').length,
    pending: collaborators.filter(c => c.status === 'pending').length,
    suspended: collaborators.filter(c => c.status === 'suspended').length,
    collaborativeProjects: projects.filter(p => 
      collaborators.some(c => c.projects.includes(p.id) && c.status === 'active')
    ).length
  };

  // Inviter un nouveau collaborateur
  const inviteCollaborator = async (inviteData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Vérifier si l'email existe déjà
      const existingCollaborator = collaborators.find(c => c.email === inviteData.email);
      if (existingCollaborator) {
        throw new Error('Cet email est déjà invité');
      }

      const newCollaborator = {
        id: Date.now().toString(),
        email: inviteData.email,
        role: inviteData.role,
        status: 'pending',
        projects: inviteData.projects || [],
        avatar: null,
        invitedAt: new Date().toISOString(),
        lastActive: null
      };

      setCollaborators(prev => [...prev, newCollaborator]);
      return { success: true, collaborator: newCollaborator };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour un collaborateur
  const updateCollaborator = async (collaboratorId, updates) => {
    setLoading(true);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      setCollaborators(prev => prev.map(collaborator =>
        collaborator.id === collaboratorId
          ? { ...collaborator, ...updates }
          : collaborator
      ));

      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un collaborateur
  const removeCollaborator = async (collaboratorId) => {
    setLoading(true);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      setCollaborators(prev => prev.filter(c => c.id !== collaboratorId));
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Changer le statut d'un collaborateur
  const changeCollaboratorStatus = async (collaboratorId, newStatus) => {
    return updateCollaborator(collaboratorId, { status: newStatus });
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
    
    return projects.filter(project => collaborator.projects.includes(project.id));
  };

  return {
    // État
    collaborators,
    projects,
    loading,
    error,
    stats,

    // Actions
    inviteCollaborator,
    updateCollaborator,
    removeCollaborator,
    changeCollaboratorStatus,

    // Utilitaires
    getCollaboratorById,
    getCollaboratorsByStatus,
    getCollaboratorProjects,

    // Réinitialiser l'erreur
    clearError: () => setError(null)
  };
};

export default useCollaborators;