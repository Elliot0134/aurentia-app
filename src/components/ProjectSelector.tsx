import { useState, useEffect, memo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowRight, Settings, Plus } from "lucide-react";
import { useProject } from "@/contexts/ProjectContext";

const ProjectSelector = memo(() => {
  const navigate = useNavigate();
  const { projectId } = useParams(); // Get project ID from URL
  const [isOpen, setIsOpen] = useState(false);
  
  // Use the Project Context
  const { 
    userProjects, 
    userProjectsLoading, 
    currentProjectId, 
    setCurrentProjectId,
    loadUserProjects 
  } = useProject();

  // Get the current selected project info
  const getSelectedProject = () => {
    // Priority 1: If we have a projectId from URL, find it in userProjects
    if (projectId) {
      return userProjects.find(p => p.project_id === projectId) || null;
    }
    
    // Priority 2: If we have a currentProjectId, find it in userProjects
    if (currentProjectId) {
      return userProjects.find(p => p.project_id === currentProjectId) || null;
    }
    
    // Priority 3: Use the first available project from userProjects
    if (userProjects.length > 0) {
      return userProjects[0];
    }
    
    // Priority 4: No project available
    return null;
  };

  const selectedProject = getSelectedProject();

  // Update context when projectId changes
  useEffect(() => {
    if (projectId && projectId !== currentProjectId) {
      setCurrentProjectId(projectId);
    }
  }, [projectId, currentProjectId, setCurrentProjectId]);

  // Ensure user projects are loaded
  useEffect(() => {
    if (!userProjectsLoading && userProjects.length === 0) {
      loadUserProjects();
    }
  }, [userProjectsLoading, userProjects.length, loadUserProjects]);

  const goToProject = (project: { project_id: string; nom_projet: string; created_at: string }) => {
    if (project) {
      navigate(`/project-business/${project.project_id}`);
    }
  };

  const handleCreateNewProject = () => {
    setIsOpen(false);
    navigate("/warning");
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const selectProject = (project: { project_id: string; nom_projet: string; created_at: string }) => {
    setIsOpen(false);
    setCurrentProjectId(project.project_id); // Update the context
    goToProject(project); // Navigate to the selected project's page
  };

  if (userProjectsLoading) {
    return (
      <button className="w-full py-2 px-3 text-left font-medium text-sm rounded-md flex items-center gap-2 bg-gray-100 animate-pulse">
        <Settings size={18} />
        <span>Chargement des projets...</span>
      </button>
    );
  }

  if (userProjects.length === 0) {
    return (
      <button
        onClick={() => navigate("/warning")}
        className="w-full py-2 px-3 text-left font-medium text-sm rounded-md flex items-center gap-2 bg-gray-100"
      >
        <Settings size={18} />
        <span>Créer un nouveau projet</span>
      </button>
    );
  }

  // Determine what to display in the selector
  const displayText = selectedProject 
    ? (selectedProject.nom_projet || "Projet sans nom")
    : (projectId ? "Chargement du projet..." : "Sélection projet");

  return (
    <div className="relative">
      <button 
        onClick={toggleDropdown}
        className="w-full py-2 px-3 text-left font-medium text-sm rounded-md flex items-center justify-between gap-2 bg-gray-100 hover:bg-gray-200 transition"
      >
        <div className="flex items-center gap-2">
          <Settings size={18} />
          <span className="truncate">
            {displayText}
          </span>
        </div>
        <ArrowRight size={16} className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-md shadow-lg z-10 max-h-56 overflow-y-auto">
          <div className="p-1">
            {/* Create new project option */}
            <button
              onClick={handleCreateNewProject}
              className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition flex items-center gap-2 border-b border-gray-100 mb-1"
            >
              <Plus size={16} className="text-aurentia-pink" />
              <span className="text-aurentia-pink font-medium">Créer un nouveau projet</span>
            </button>
            
            {/* Existing projects */}
            {userProjects.map(project => (
              <button
                key={project.project_id}
                onClick={() => selectProject(project)}
                className={`w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition flex items-center justify-between ${
                  project.project_id === projectId ? 'bg-blue-50 border-l-2 border-blue-500' : ''
                }`}
              >
                <span className="truncate">{project.nom_projet || "Projet sans nom"}</span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    goToProject(project);
                  }}
                  className="text-aurentia-pink hover:underline text-xs flex items-center gap-1"
                >
                  Voir <ArrowRight size={12} />
                </button>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

export default ProjectSelector;
