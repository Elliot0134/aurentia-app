import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { useProject } from "@/contexts/ProjectContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardMetricsCards } from "@/components/dashboard/DashboardMetricsCards";
import { QuickActionsPanel } from "@/components/dashboard/QuickActionsPanel";
import { PendingInvitesSection } from "@/components/dashboard/PendingInvitesSection";
import { useUserStatusChecks } from "@/hooks/useUserStatusChecks";
import { CreditsUsageChart } from "@/components/dashboard/CreditsUsageChart";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { usePendingInvitations } from "@/hooks/usePendingInvitations";
import { useCollaborativeProjects } from "@/hooks/useCollaborativeProjects";
import { CheckCircle2, FolderOpen, Plus, Circle, ChevronRight, Bell, TrendingUp, Sparkles, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import usePageTitle from "@/hooks/usePageTitle";

declare global {
  interface Window {
    Tally: {
      loadEmbeds: () => void;
    };
  }
}

const Dashboard = () => {
  usePageTitle("Tableau de bord");
  const navigate = useNavigate();
  const { userProfile } = useUser();
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  // Use Project Context instead of local state
  const { userProjects, userProjectsLoading, deleteProject, currentProjectId, setCurrentProjectId, loadUserProjects } = useProject();
  const { onboardingCompleted, loading: onboardingLoading } = useOnboardingStatus();

  // Hook for pending invitations
  const { invitations, loading: invitationsLoading, handleInvitationAccepted, refetch: refetchInvitations } = usePendingInvitations();

  // Hook for collaborative projects
  const { collaborativeProjects, loading: collabProjectsLoading } = useCollaborativeProjects();

  // Hook pour les indicateurs de statut
  const { checks, completionPercentage, completedCount, totalCount, isLoading: statusLoading } = useUserStatusChecks(currentProjectId);

  // Fonction pour calculer les notifications (livrables manquants) - simplifié pour la démo
  const getProjectNotifications = (projectId: string) => {
    // Dans une vraie implémentation, on ferait une vraie requête
    const totalDeliverables = 10;
    const completed = 5; // Simulé
    const missing = totalDeliverables - completed;
    return missing > 0 ? missing : 0;
  };

  // Redirect to onboarding if user has no projects and hasn't completed onboarding
  useEffect(() => {
    if (!userProjectsLoading && !onboardingLoading) {
      if (userProjects.length === 0 && !onboardingCompleted) {
        navigate('/onboarding', { replace: true });
      }
    }
  }, [userProjects, userProjectsLoading, onboardingCompleted, onboardingLoading, navigate]);

  // Format projects for display
  const formattedProjects = userProjects.map(project => ({
    id: project.project_id,
    title: project.nom_projet || "Projet sans nom",
    status: "En cours", // You can enhance this with actual status from project data
    createdAt: new Date(project.created_at).toLocaleDateString('fr-FR')
  }));

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    
    const success = await deleteProject(projectToDelete);
    if (success) {
      setProjectToDelete(null);
    }
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://tally.so/widgets/embed.js";
    script.async = true;
    script.onload = () => {
      if (window.Tally) {
        window.Tally.loadEmbeds();
      }
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Get user's first name for greeting
  const firstName = userProfile?.first_name || 'Entrepreneur';

  return (
    <div className="container-aurentia min-h-screen py-8 animate-fade-in-blur">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Hero Section */}
        <div className="mb-6">
          <h1 className="text-4xl font-heading text-text-primary mb-2">
            Bonjour, {firstName}! 👋
          </h1>
          <p className="text-base text-text-muted">
            Voici un aperçu de votre parcours entrepreneurial
          </p>
        </div>

        {/* Metrics Cards */}
        <DashboardMetricsCards />

        {/* Credits Usage Chart - Full Width */}
        <CreditsUsageChart />

        {/* Quick Actions Panel */}
        <QuickActionsPanel />

        {/* Spacing wrapper for Status & Projects section */}
        <div className="mt-10">
          {/* Widgets Grid - Status & Projects */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Étape de création */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-text-primary font-sans">
                Étape de création
              </h2>
              {!statusLoading && currentProjectId && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted">{completedCount}/{totalCount}</span>
                  <span className="text-lg font-bold text-[#ff592b]">{completionPercentage}%</span>
                </div>
              )}
            </div>

            {/* Items des indicateurs de statut - sans container, avec hauteur fixe */}
            <div style={{ minHeight: '380px' }}>
              {statusLoading ? (
                <div className="flex items-center justify-center" style={{ height: '380px' }}>
                  <div className="spinner"></div>
                </div>
              ) : !currentProjectId ? (
                <div className="flex items-center justify-center text-center text-text-muted text-sm" style={{ height: '380px' }}>
                  Sélectionnez un projet pour voir les étapes
                </div>
              ) : (
                <div className="space-y-2">
                  {checks.map((check) => (
                    <div
                      key={check.id}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg transition-all duration-200",
                        check.isCompleted
                          ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                          : "bg-gray-50 dark:bg-[#585a60] border border-gray-200 dark:border-[#787b80] hover:bg-gray-100 dark:hover:bg-[#6a6d72]"
                      )}
                    >
                      {/* Icône de statut */}
                      <div className="flex-shrink-0 mt-0.5">
                        {check.isCompleted ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-400" />
                        )}
                      </div>

                      {/* Contenu */}
                      <div className="flex-1 min-w-0">
                        <h4
                          className={cn(
                            "text-sm font-medium mb-0.5 font-sans",
                            check.isCompleted ? "text-green-900 dark:text-green-100" : "text-[#2e333d] dark:text-[#f9f6f1]"
                          )}
                        >
                          {check.label}
                        </h4>
                        <p
                          className={cn(
                            "text-xs",
                            check.isCompleted ? "text-green-700" : "text-text-muted"
                          )}
                        >
                          {check.description}
                        </p>
                      </div>

                      {/* Badge de priorité */}
                      {!check.isCompleted && check.priority === 1 && (
                        <div className="flex-shrink-0">
                          <Sparkles className="h-4 w-4 text-orange-500" />
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Message de félicitation si tout est complété */}
                  {completionPercentage === 100 && (
                    <div className="mt-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg text-center">
                      <p className="text-sm font-semibold text-green-900">
                        🎉 Excellent travail ! Tous les objectifs sont atteints.
                      </p>
                    </div>
                  )}

                  {/* Call to action si progression faible */}
                  {completionPercentage < 50 && (
                    <div className="mt-3 p-3 bg-aurentia-pink/5 border border-aurentia-pink/20 rounded-lg">
                      <p className="text-xs text-text-muted text-center">
                        Utilisez le chatbot pour générer vos livrables et créer votre plan d'action
                      </p>
                      <button
                        onClick={() => navigate('/individual/chatbot')}
                        className="w-full mt-2 px-3 py-1.5 bg-[#ff592b] hover:bg-[#ff592b]/90 text-white text-xs font-medium rounded-md transition-colors duration-200"
                      >
                        Accéder au chatbot
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mes Projets */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-text-primary font-sans">
                Mes Projets
                {userProjects.length > 0 && (
                  <span className="text-xs font-normal text-text-muted ml-2">
                    ({userProjects.length})
                  </span>
                )}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/individual/warning')}
                className="h-7 px-2 flex items-center gap-1 text-[#ff592b] hover:text-[#ff592b]/80 text-xs"
              >
                <Plus className="h-3 w-3" />
                Nouveau
              </Button>
            </div>

            {/* Items des projets - sans container */}
            {userProjectsLoading || invitationsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="spinner"></div>
              </div>
            ) : userProjects.length === 0 && invitations.length === 0 ? (
              <div className="text-center py-8">
                <FolderOpen className="h-12 w-12 mx-auto mb-3 text-text-muted/50" />
                <h3 className="text-base font-semibold text-text-primary mb-2">Aucun projet</h3>
                <p className="text-sm text-text-muted mb-4">
                  Créez votre premier projet pour commencer
                </p>
                <Button
                  onClick={() => navigate('/individual/warning')}
                  className="btn-primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Créer un projet
                </Button>
              </div>
            ) : (
              <>
                {/* Pending Invitations Section */}
                {!invitationsLoading && invitations.length > 0 && (
                  <PendingInvitesSection
                    invitations={invitations}
                    onInvitationHandled={() => {
                      handleInvitationAccepted();
                      refetchInvitations();
                      // CRITICAL: Reload projects to show newly accessible collaborative projects
                      loadUserProjects();
                    }}
                  />
                )}

                {/* Projects List */}
                <div className="space-y-1.5">
                  {userProjects.slice(0, 5).map((project) => {
                    const isActive = currentProjectId === project.project_id;
                    const notifications = getProjectNotifications(project.project_id);

                    return (
                      <div
                        key={project.project_id}
                        onClick={() => {
                          setCurrentProjectId(project.project_id);
                        }}
                        className={cn(
                          "flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-all duration-200 group",
                          isActive
                            ? "bg-[#ff592b] border border-[#ff592b]"
                            : "bg-[#f4f4f5] dark:bg-[#585a60] hover:bg-[#e8e8e9] dark:hover:bg-[#6a6d72] border border-transparent"
                        )}
                      >
                        <div className="flex-1 min-w-0">
                          <h4 className={cn(
                            "text-sm font-normal font-sans truncate",
                            isActive ? "text-white font-medium" : "text-[#2e333d] dark:text-[#f9f6f1]"
                          )}>
                            {project.nom_projet || 'Projet sans nom'}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {notifications > 0 && (
                            <div className={cn(
                              "flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium",
                              isActive
                                ? "bg-white/20 text-white"
                                : "bg-orange-100 text-orange-700"
                            )}>
                              <Bell className="h-3 w-3" />
                              {notifications}
                            </div>
                          )}
                          <ChevronRight className={cn(
                            "h-4 w-4 transition-transform duration-200",
                            isActive ? "text-white" : "text-text-muted group-hover:translate-x-1"
                          )} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {userProjects.length > 5 && (
                  <Button
                    variant="link"
                    className="w-full text-[#ff592b] hover:text-[#ff592b]/80 font-semibold mt-2"
                    onClick={() => navigate('/individual/project-business')}
                  >
                    Voir tous les projets ({userProjects.length}) →
                  </Button>
                )}

                {/* Collaborative Projects Section */}
                {!collabProjectsLoading && collaborativeProjects.length > 0 && (
                  <div className="mt-8 space-y-3">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-text-muted" />
                      <h3 className="text-lg font-semibold text-text-primary font-sans">
                        Mes projets (Collab)
                        <span className="text-xs font-normal text-text-muted ml-2">
                          ({collaborativeProjects.length})
                        </span>
                      </h3>
                    </div>

                    <div className="space-y-1.5">
                      {collaborativeProjects.map((project) => {
                        const isActive = currentProjectId === project.project_id;

                        return (
                          <div
                            key={project.project_id}
                            onClick={() => setCurrentProjectId(project.project_id)}
                            className={cn(
                              "flex items-center justify-between px-3 py-2.5 rounded-md cursor-pointer transition-all duration-200 group border",
                              isActive
                                ? "bg-blue-50 border-blue-200"
                                : "bg-gray-50/50 hover:bg-gray-100/50 border-gray-200/50"
                            )}
                          >
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className={cn(
                                  "text-sm font-normal font-sans truncate",
                                  isActive ? "text-blue-900 font-medium" : "text-text-primary"
                                )}>
                                  {project.nom_projet || 'Projet sans nom'}
                                </h4>
                                {/* Role Badge */}
                                <span className={cn(
                                  "inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium flex-shrink-0",
                                  project.my_role === 'admin' && "bg-purple-100 text-purple-700 border border-purple-200",
                                  project.my_role === 'editor' && "bg-blue-100 text-blue-700 border border-blue-200",
                                  project.my_role === 'viewer' && "bg-gray-100 text-gray-700 border border-gray-200"
                                )}>
                                  {project.my_role === 'admin' ? 'Admin' :
                                   project.my_role === 'editor' ? 'Éditeur' :
                                   'Lecteur'}
                                </span>
                              </div>
                              {/* Owner indicator */}
                              <p className="text-xs text-text-muted flex items-center gap-1">
                                <span>Propriétaire:</span>
                                <span className="font-medium">{project.owner_name || project.owner_email}</span>
                              </p>
                            </div>
                            <ChevronRight className={cn(
                              "h-4 w-4 transition-transform duration-200 flex-shrink-0",
                              isActive ? "text-blue-600" : "text-text-muted group-hover:translate-x-1"
                            )} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        </div>


        {/* Tally Form Embed - Keep at the bottom */}
        <Card className="card-static">
          <CardContent className="p-6">
            <iframe
              data-tally-src="https://tally.so/embed/3qq1e8?alignLeft=1&transparentBackground=1&dynamicHeight=1"
              loading="lazy"
              width="100%"
              height="552"
              frameBorder="0"
              marginHeight={0}
              marginWidth={0}
              allow="microphone; camera; geolocation; autoplay"
              title="Votre avis nous aide à grandir !"
            ></iframe>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
