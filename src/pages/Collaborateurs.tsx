import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Users, Mail, Clock, CheckCircle, XCircle, Link2, Crown } from 'lucide-react';
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
import ShareCodeModal from '@/components/collaboration/ShareCodeModal';
import OwnershipTransferDialog from '@/components/collaboration/OwnershipTransferDialog';
import InvitationsTable from '@/components/collaboration/InvitationsTable';
import { useCollaborators } from '@/hooks/useCollaborators';
import { useProjectPermissions } from '@/hooks/useProjectPermissions';
import usePageTitle from '@/hooks/usePageTitle';

const CollaboratorsPage = () => {
  usePageTitle("Collaborateurs");
  const navigate = useNavigate();
  const { currentProjectId, userProjectsLoading } = useProject();
  const { userRole } = useUserRole();
  const { toast } = useToast();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isShareCodeModalOpen, setIsShareCodeModalOpen] = useState(false);
  const [isOwnershipTransferOpen, setIsOwnershipTransferOpen] = useState(false);
  const [invitations, setInvitations] = useState([]);
  const [invitationsLoading, setInvitationsLoading] = useState(true);

  // Get permissions for current project
  const permissions = useProjectPermissions(currentProjectId);
  
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
        email: invitation.email,
        role: invitation.role,
        status: invitation.status,
        invited_at: invitation.invited_at,
        expires_at: invitation.expires_at,
        project_name: project?.nom_projet
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

  // Get current project for modals
  const currentProject = projects.find(p => p.id === currentProjectId);

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
          <div className="flex flex-col gap-6 mb-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl font-bold flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Users className="text-blue-600 dark:text-blue-400" size={32} />
                  </div>
                  <span>Gestion des Collaborateurs</span>
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg">
                  Invitez et gérez les collaborateurs de vos projets entrepreneuriaux
                </p>
              </div>
            </div>

            {/* Action Buttons - Improved Layout */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-3">
              {permissions.canInvite && (
                <Button
                  onClick={() => setIsInviteModalOpen(true)}
                  className="bg-gradient-primary text-white flex items-center justify-center gap-2 min-h-[44px] shadow-md hover:shadow-lg transition-all duration-200"
                  aria-label="Inviter un collaborateur par email"
                >
                  <UserPlus size={18} aria-hidden="true" />
                  <span>Inviter par email</span>
                </Button>
              )}
              {permissions.canGenerateShareCodes && (
                <Button
                  onClick={() => setIsShareCodeModalOpen(true)}
                  variant="outline"
                  className="flex items-center justify-center gap-2 min-h-[44px] border-2 hover:bg-accent transition-all duration-200"
                  aria-label="Générer un code d'invitation partageable"
                >
                  <Link2 size={18} aria-hidden="true" />
                  <span>Codes d'invitation</span>
                </Button>
              )}
              {permissions.canTransferOwnership && (
                <Button
                  onClick={() => setIsOwnershipTransferOpen(true)}
                  variant="outline"
                  className="flex items-center justify-center gap-2 min-h-[44px] border-2 border-yellow-300 hover:bg-yellow-50 dark:border-yellow-700 dark:hover:bg-yellow-950/30 transition-all duration-200"
                  aria-label="Transférer la propriété du projet"
                >
                  <Crown size={18} className="text-yellow-600 dark:text-yellow-400" aria-hidden="true" />
                  <span>Transférer la propriété</span>
                </Button>
              )}
            </div>
          </div>

          {/* Statistiques */}
          <CollaboratorStats stats={stats} loading={loading} />

          {/* Tableau des collaborateurs */}
          <Card className="animate-slide-up shadow-sm hover:shadow-md transition-shadow duration-200" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-white dark:from-blue-950/30 dark:to-gray-950">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Users size={20} className="text-blue-600 dark:text-blue-400" aria-hidden="true" />
                </div>
                <span>Liste des Collaborateurs</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto pt-6">
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
          <Card className="mt-8 animate-slide-up shadow-sm hover:shadow-md transition-shadow duration-200" style={{ animationDelay: '0.3s' }}>
            <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <Mail size={20} className="text-primary" aria-hidden="true" />
                </div>
                <span>Invitations Envoyées</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <InvitationsTable
                invitations={invitations}
                loading={invitationsLoading}
                onRefresh={refreshInvitations}
              />
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

          {/* Share Code Modal */}
          {currentProjectId && (
            <ShareCodeModal
              isOpen={isShareCodeModalOpen}
              onClose={() => setIsShareCodeModalOpen(false)}
              projectId={currentProjectId}
              projectName={currentProject?.name}
            />
          )}

          {/* Ownership Transfer Dialog */}
          {currentProjectId && (
            <OwnershipTransferDialog
              isOpen={isOwnershipTransferOpen}
              onClose={() => setIsOwnershipTransferOpen(false)}
              projectId={currentProjectId}
              projectName={currentProject?.name || 'votre projet'}
              collaborators={collaborators}
              onTransferComplete={() => {
                // Refresh the page to update all data and permissions
                window.location.reload();
              }}
            />
          )}

        </div>
      </div>
    </ProjectRequiredGuard>
  );
};

export default CollaboratorsPage;
