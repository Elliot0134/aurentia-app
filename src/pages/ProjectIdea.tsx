import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FileText, Download, Settings } from "lucide-react";
import { useProject } from "@/contexts/ProjectContext";

const Project = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  // Use Project Context instead of individual state management
  const { 
    currentProject, 
    loading, 
    error, 
    loadProject, 
    currentProjectId 
  } = useProject();

  useEffect(() => {
    if (projectId && projectId !== currentProjectId) {
      loadProject(projectId);
    }
  }, [projectId, currentProjectId, loadProject]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aurentia-pink"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-xl font-medium">Erreur</h2>
          <p className="text-gray-600 mt-2">{error}</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-4 btn-primary"
          >
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  if (!currentProject?.project_summary) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-xl font-medium">Projet non trouvé</h2>
          <p className="text-gray-600 mt-2">Le projet que vous recherchez n'existe pas ou a été supprimé.</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-4 btn-primary"
          >
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  const project = currentProject.project_summary;

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold">{project.nom_projet || "Projet sans nom"}</h1>
            <p className="text-gray-600 text-sm mt-1">{project.description_synthetique || "Aucune description"}</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="btn-outline flex items-center gap-2 text-sm">
              <Settings size={16} />
              Modifier
            </button>
            <button className="btn-outline flex items-center gap-2 text-sm">
              <Download size={16} />
              Exporter
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4 md:gap-5">
          {/* Content will be displayed here - all data is now available in currentProject */}
          {/* You can access: 
              - currentProject.originalite
              - currentProject.pertinence  
              - currentProject.complexite
              - currentProject.marche
              - currentProject.b2c
              - currentProject.b2b
              - currentProject.organisms
              - currentProject.concurrence
              etc.
          */}
          
          {/* Concept transcription (full width) */}

          {/* First row of 3 cards */}



          {/* Second row of 2 cards */}




          {/* Bottom row with 2 wider cards */}

        </div>
      </div>
    </div>
  );
};

export default Project;
