import { useNavigate } from 'react-router-dom';
import ProjectRequiredGuard from '@/components/ProjectRequiredGuard';
import { useProject } from '@/contexts/ProjectContext';
import { Button } from "@/components/ui/button";
import ResourcesPage from '@/pages/individual/ResourcesPage';
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import usePageTitle from '@/hooks/usePageTitle';

const Ressources = () => {
  usePageTitle("Ressources");
  const navigate = useNavigate();
  const { currentProjectId, userProjectsLoading } = useProject();

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
      <div className="animate-fade-in">
        <ResourcesPage />
      </div>
    </ProjectRequiredGuard>
  );
};

export default Ressources;
