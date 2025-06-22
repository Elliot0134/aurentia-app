
import { useState, useEffect, memo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { ArrowRight, Settings } from "lucide-react";

const ProjectSelector = memo(() => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const { projectId } = useParams(); // Get project ID from URL

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);

      try {
        // Get the current session to get the user ID
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setLoading(false);
          return;
        }

        // Fetch projects for the current user
        const { data, error } = await supabase
          .from('form_business_idea')
          .select('project_id, nom_projet, created_at')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const fetchedProjects = data || [];
        setProjects(fetchedProjects);

        // After fetching, if a projectId is in the URL, set the selected project
        if (projectId && fetchedProjects.length > 0) {
          const projectFromUrl = fetchedProjects.find(p => p.project_id === projectId);
          if (projectFromUrl) {
            setSelectedProject(projectFromUrl);
          }
        }

      } catch (error) {
        console.error("Error fetching projects:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger vos projets. Veuillez réessayer plus tard.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Sync selected project with URL
  useEffect(() => {
    if (projects.length > 0) {
      if (projectId) {
        const projectFromUrl = projects.find(p => p.project_id === projectId);
        if (projectFromUrl) {
          setSelectedProject(projectFromUrl);
        } else {
          // Handle case where project ID in URL doesn't exist in user's projects
          // Maybe navigate to dashboard or show an error
          console.warn(`Project with ID ${projectId} not found for this user.`);
          setSelectedProject(null); // Clear selected project if URL ID is invalid
          // Optionally navigate away or show a message
        }
      } else {
        // If no project ID in URL but user has projects, clear selected project
        setSelectedProject(null);
      }
    } else {
      // If no projects for user, clear selected project
      setSelectedProject(null);
    }
  }, [projects, projectId]);


  const goToProject = (project) => {
    if (project) {
      navigate(`/project-business/${project.project_id}`);
    }
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const selectProject = (project) => {
    setSelectedProject(project);
    setIsOpen(false);
    goToProject(project); // Navigate to the selected project's page
  };

  if (loading) {
    return (
      <button className="w-full py-2 px-3 text-left font-medium text-sm rounded-md flex items-center gap-2 bg-gray-100 animate-pulse">
        <Settings size={18} />
        <span>Chargement des projets...</span>
      </button>
    );
  }

  if (projects.length === 0) {
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

  return (
    <div className="relative">
      <button 
        onClick={toggleDropdown}
        className="w-full py-2 px-3 text-left font-medium text-sm rounded-md flex items-center justify-between gap-2 bg-gray-100 hover:bg-gray-200 transition"
      >
        <div className="flex items-center gap-2">
          <Settings size={18} />
          <span className="truncate">
            {selectedProject ? (selectedProject.nom_projet || "Projet sans nom") : "Sélection projet"}
          </span>
        </div>
        <ArrowRight size={16} className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-md shadow-lg z-10 max-h-56 overflow-y-auto">
          <div className="p-1">
            {projects.map(project => (
              <button
                key={project.project_id}
                onClick={() => selectProject(project)}
                className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition flex items-center justify-between"
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
