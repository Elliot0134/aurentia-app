import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Users, Mail, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ProjectRequiredGuard from '@/components/ProjectRequiredGuard';
import { useProject } from '@/contexts/ProjectContext';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from "@/components/ui/LoadingSpinner";

// Import des composants de collaboration
import CollaboratorStats from '@/components/collaboration/CollaboratorStats';
import CollaboratorsTable from '@/components/collaboration/CollaboratorsTable';
import InviteModal from '@/components/collaboration/InviteModal';
import { useCollaborators } from '@/hooks/useCollaborators';
import { TemplateDataTable } from '@/pages/individual/ComponentsTemplate';

const CollaboratorsPage = () => {
  const navigate = useNavigate();
  const { currentProjectId, userProjectsLoading } = useProject();
  const { userRole } = useUserRole();
  const { toast } = useToast();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [invitations, setInvitations] = useState([]);
  const [invitationsLoading, setInvitationsLoading] = useState(true);
  
  const {
    collaborators,
    projects,
    loading,
    error,
    stats,
    inviteCollaborator,
    updateCollaborator,
    removeCollaborator,
    changeCollaboratorStatus,
    clearError
  } = useCollaborators();

  // Récupérer les invitations
  useEffect(() => {
    refreshInvitations();
  }, [currentProjectId]);

  // Fonction pour recharger les invitations
  const refreshInvitations = async () => {
    if (!currentProjectId) return;
    
    setInvitationsLoading(true);
    try {
      const { data, error } = await supabase
        .from('project_invitations')
        .select(`
          id,
          email,
          status,
          role,
          invited_at,
          expires_at,
          project_id
        `)
        .eq('project_id', currentProjectId)
        .order('invited_at', { ascending: false });

      if (error) throw error;

      // Récupérer les informations du projet séparément
      const { data: project } = await supabase
        .from('project_summary')
        .select('nom_projet')
        .eq('project_id', currentProjectId)
        .single();

      const formattedInvitations = data?.map((invitation) => ({
        id: invitation.id,
        col1: invitation.email,
        col2: project?.nom_projet || 'Projet inconnu',
        col3: invitation.role === 'admin' ? 'Administrateur' : 
              invitation.role === 'editor' ? 'Éditeur' : 'Lecteur',
        col4: invitation.status === 'pending' ? 'En attente' : 
              invitation.status === 'accepted' ? 'Acceptée' : 'Expirée',
        col5: new Date(invitation.invited_at).toLocaleDateString('fr-FR'),
        dateCreated: new Date(invitation.invited_at),
        email: invitation.email,
        status: invitation.status,
        role: invitation.role,
        expiresAt: invitation.expires_at,
        projectName: project?.nom_projet
      })) || [];

      setInvitations(formattedInvitations);
    } catch (err) {
      console.error('Erreur lors du chargement des invitations:', err);
    } finally {
      setInvitationsLoading(false);
    }
  };

  // Gérer l'invitation d'un nouveau collaborateur
  const handleInviteCollaborator = async (inviteData) => {
    const result = await inviteCollaborator(inviteData);
    
    if (result.success) {
      toast({
        title: "Invitation envoyée",
        description: `L'invitation a été envoyée à ${inviteData.email}`,
      });
      setIsInviteModalOpen(false);
      // Recharger les invitations pour afficher la nouvelle invitation
      refreshInvitations();
    } else {
      toast({
        title: "Erreur",
        description: result.error || "Impossible d'envoyer l'invitation",
        variant: "destructive",
      });
    }
    
    return result;
  };

  // Gérer la mise à jour d'un collaborateur
  const handleUpdateCollaborator = async (collaboratorId, updates) => {
    const result = await updateCollaborator(collaboratorId, updates);
    
    if (result.success) {
      toast({
        title: "Collaborateur mis à jour",
        description: "Les modifications ont été sauvegardées",
      });
    } else {
      toast({
        title: "Erreur",
        description: result.error || "Impossible de mettre à jour le collaborateur",
        variant: "destructive",
      });
    }
    
    return result;
  };

  // Gérer la suppression d'un collaborateur
  const handleRemoveCollaborator = async (collaboratorId) => {
    const result = await removeCollaborator(collaboratorId);
    
    if (result.success) {
      toast({
        title: "Collaborateur supprimé",
        description: "Le collaborateur a été retiré de vos projets",
      });
    } else {
      toast({
        title: "Erreur",
        description: result.error || "Impossible de supprimer le collaborateur",
        variant: "destructive",
      });
    }
    
    return result;
  };

  // Gérer le changement de statut
  const handleChangeStatus = async (collaboratorId, newStatus) => {
    const result = await changeCollaboratorStatus(collaboratorId, newStatus);
    
    if (result.success) {
      const statusLabels = {
        active: 'activé',
        suspended: 'suspendu',
        pending: 'mis en attente'
      };
      
      toast({
        title: "Statut modifié",
        description: `Le collaborateur a été ${statusLabels[newStatus]}`,
      });
    } else {
      toast({
        title: "Erreur",
        description: result.error || "Impossible de modifier le statut",
        variant: "destructive",
      });
    }
    
    return result;
  };

  // Effacer les erreurs au montage
  React.useEffect(() => {
    if (error) {
      clearError();
    }
  }, []);

  if (userProjectsLoading) {
    return <LoadingSpinner message="Chargement..." fullScreen />;
  }

  if (!currentProjectId) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] animate-popup-appear">
        <div className="container mx-auto px-4 py-8 text-center bg-white p-8 rounded-lg shadow-lg max-w-lg w-[90vw]">
          <h2 className="text-3xl font-bold mb-4 text-gray-800">Que l'aventure commence !</h2>
          <p className="text-gray-600 mb-6 text-lg">Créez un nouveau projet pour découvrir tout le potentiel de votre idée.</p>
          <Button 
            onClick={() => navigate("/individual/warning")} 
            className="mt-4 px-4 py-2 rounded-lg bg-gradient-primary hover:from-blue-600 hover:to-purple-700 text-white text-lg font-semibold shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            Créer un nouveau projet
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ProjectRequiredGuard>
      <div className="container mx-auto py-8 min-h-screen animate-fade-in">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* En-tête */}
          <div className="flex flex-col lg:flex-row lg:flex-wrap justify-between items-start lg:items-center gap-4 mb-8">
            <div className="flex-grow">
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <Users className="text-blue-600" size={32} />
                Gestion des Collaborateurs
              </h1>
              <p className="text-gray-600">
                Invitez et gérez les collaborateurs de vos projets entrepreneuriaux
              </p>
            </div>
            
            <Button
              onClick={() => setIsInviteModalOpen(true)}
              className="bg-gradient-primary text-white flex items-center gap-2 w-full lg:w-auto mt-4 lg:mt-0"
            >
              <UserPlus size={16} />
              Inviter un collaborateur
            </Button>
          </div>

          {/* Statistiques */}
          <CollaboratorStats stats={stats} loading={loading} />

          {/* Tableau des collaborateurs */}
          <Card className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users size={20} />
                Liste des Collaborateurs
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <CollaboratorsTable
                collaborators={collaborators}
                projects={projects}
                onUpdateCollaborator={handleUpdateCollaborator}
                onRemoveCollaborator={handleRemoveCollaborator}
                onChangeStatus={handleChangeStatus}
                loading={loading}
              />
            </CardContent>
          </Card>

          {/* Tableau de suivi des invitations */}
          <Card className="mt-8 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail size={20} />
                Suivi des Invitations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {invitationsLoading ? (
                <LoadingSpinner message="Chargement des invitations..." />
              ) : invitations.length > 0 ? (
                <TemplateDataTable data={invitations} />
              ) : (
                <div className="text-center py-8">
                  <Mail size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Aucune invitation envoyée
                  </h3>
                  <p className="text-gray-500">
                    Les invitations que vous envoyez apparaîtront ici avec leur statut.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Modal d'invitation */}
          <InviteModal
            isOpen={isInviteModalOpen}
            onClose={() => setIsInviteModalOpen(false)}
            onInvite={handleInviteCollaborator}
            projects={projects}
            loading={loading}
            error={error}
          />

          {/* Message d'état vide */}
          {!loading && collaborators.length === 0 && (
            <Card className="mt-8 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <CardContent className="text-center py-12">
                <Users size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Aucun collaborateur pour le moment
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Commencez à collaborer en invitant des personnes à rejoindre vos projets. 
                  Elles pourront consulter, modifier ou administrer vos projets selon leurs permissions.
                </p>
                <Button
                  onClick={() => setIsInviteModalOpen(true)}
                  className="bg-gradient-primary text-white"
                >
                  <UserPlus size={16} className="mr-2" />
                  Inviter votre premier collaborateur
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ProjectRequiredGuard>
  );
};

export default CollaboratorsPage;
