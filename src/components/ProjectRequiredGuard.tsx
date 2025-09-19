import React from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { useParams } from 'react-router-dom';

interface ProjectRequiredGuardProps {
  children: React.ReactNode;
}

const ProjectRequiredGuard: React.FC<ProjectRequiredGuardProps> = ({ children }) => {
  const { projectId: urlProjectId } = useParams();
  const { userProjects, userProjectsLoading, currentProjectId } = useProject();

  const hasProject = userProjects.length > 0;
  const activeProjectId = currentProjectId || urlProjectId || (userProjects.length > 0 ? userProjects[0].project_id : null);

  if (userProjectsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Chargement des projets...</div>
      </div>
    );
  }

  if (!hasProject || !activeProjectId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F4F4F1] p-4">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Page non disponible</h2>
          <p className="text-gray-600">Vous n'avez pas encore de projet actif.</p>
          <p className="text-gray-600 mt-2">Veuillez créer un nouveau projet pour accéder à cette fonctionnalité.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProjectRequiredGuard;
