import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useProject } from '@/contexts/ProjectContext';
import { useNavigate } from 'react-router-dom';
import { FolderOpen, Plus, ChevronRight, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProjectsListWidgetProps {
  className?: string;
  maxProjects?: number;
}

export const ProjectsListWidget = ({ className, maxProjects = 5 }: ProjectsListWidgetProps) => {
  const { userProjects, userProjectsLoading, currentProjectId, setCurrentProjectId, deliverableNames } = useProject();
  const navigate = useNavigate();

  // Fonction pour calculer les notifications (livrables manquants)
  const getProjectNotifications = (projectId: string) => {
    // Pour simplifier, on retourne un nombre aléatoire pour la démo
    // Dans la vraie vie, vous feriez une vraie requête pour chaque projet
    const totalDeliverables = 10;
    const completed = deliverableNames.length;
    const missing = totalDeliverables - completed;
    return missing > 0 ? missing : 0;
  };

  if (userProjectsLoading) {
    return (
      <Card className={cn("card-static", className)}>
        <CardContent className="pt-6">
          <div className="spinner-container">
            <div className="spinner"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayedProjects = userProjects.slice(0, maxProjects);
  const hasMoreProjects = userProjects.length > maxProjects;

  const handleProjectClick = (projectId: string) => {
    setCurrentProjectId(projectId);
    navigate('/individual/project-business');
  };

  if (userProjects.length === 0) {
    return (
      <Card className={cn("card-static", className)}>
        <CardContent className="pt-6">
          <div className="empty-state py-6">
            <FolderOpen className="empty-state-icon" />
            <h3 className="empty-state-title">Aucun projet</h3>
            <p className="empty-state-description mb-4">
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
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("card-static", className)}>
      <CardContent className="pt-6 pb-4 space-y-1.5">
        {displayedProjects.map((project) => {
          const isActive = currentProjectId === project.project_id;
          const notifications = getProjectNotifications(project.project_id);

          return (
            <div
              key={project.project_id}
              onClick={() => handleProjectClick(project.project_id)}
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-all duration-200 group",
                isActive
                  ? "bg-aurentia-pink/10 border border-aurentia-pink/30"
                  : "bg-[#f4f4f5] hover:bg-[#e8e8e9] border border-transparent"
              )}
            >
              <div className="flex-1 min-w-0 flex items-center gap-2">
                <h4 className={cn(
                  "text-sm font-normal font-sans truncate",
                  isActive ? "text-aurentia-pink font-medium" : "text-text-primary"
                )}>
                  {project.nom_projet || 'Projet sans nom'}
                </h4>
                {notifications > 0 && (
                  <div className="flex items-center gap-1 bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded text-xs font-medium">
                    <Bell className="h-3 w-3" />
                    {notifications}
                  </div>
                )}
              </div>
              <ChevronRight className={cn(
                "h-4 w-4 transition-transform duration-200 flex-shrink-0",
                isActive ? "text-aurentia-pink" : "text-text-muted group-hover:translate-x-1"
              )} />
            </div>
          );
        })}

        {hasMoreProjects && (
          <Button
            variant="link"
            className="w-full text-[#ff592b] hover:text-[#ff592b]/80 font-semibold mt-2"
            onClick={() => navigate('/individual/project-business')}
          >
            Voir tous les projets ({userProjects.length}) →
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
