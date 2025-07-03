import { useState, useEffect, memo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowRight, Settings, Plus } from "lucide-react";
import { useProject } from "@/contexts/ProjectContext";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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

  // Helper function to truncate project names
  const truncateProjectName = (name: string, maxLength: number = 18) => {
    if (!name) return "Projet sans nom";
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + "...";
  };

  // Update context when projectId changes
  useEffect(() => {
    if (projectId && projectId !== currentProjectId) {
      setCurrentProjectId(projectId);
    }
  }, [projectId, currentProjectId, setCurrentProjectId]);

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
      <Tooltip>
        <TooltipTrigger asChild>
          <button 
            onClick={toggleDropdown}
            className="w-full py-2 px-3 text-left font-medium text-sm rounded-md flex items-center justify-between gap-2 bg-gray-100 hover:bg-gray-200 transition"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Settings size={18} className="flex-shrink-0" />
              <span className="truncate">
                {truncateProjectName(displayText)}
              </span>
            </div>
            <ArrowRight size={16} className={`transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-90' : ''}`} />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <p>{displayText}</p>
        </TooltipContent>
      </Tooltip>
      
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
              <Tooltip key={project.project_id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => selectProject(project)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition flex items-center justify-between ${
                      project.project_id === projectId ? 'bg-blue-50 border-l-2 border-blue-500' : ''
                    }`}
                  >
                    <span className="truncate">{truncateProjectName(project.nom_projet || "Projet sans nom")}</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        goToProject(project);
                      }}
                      className="text-aurentia-pink hover:underline text-xs flex items-center gap-1 flex-shrink-0 ml-2"
                    >
                      Voir <ArrowRight size={12} />
                    </button>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <p>{project.nom_projet || "Projet sans nom"}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

export default ProjectSelector;
