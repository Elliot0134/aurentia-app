import { useNavigate } from "react-router-dom";
import { FileText, Plus, Zap, Book, X } from "lucide-react";
import { useProject } from "@/contexts/ProjectContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  
  // Use Project Context instead of local state
  const { userProjects, userProjectsLoading, deleteProject } = useProject();

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

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Tableau de bord</h1>
          <p className="text-gray-600">Bienvenue sur votre espace de gestion de projets entrepreneuriaux</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-5 animate-slide-up">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Projets totaux</p>
                <p className="text-2xl font-bold text-gray-900">{userProjects.length}</p>
              </div>
              <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 animate-slide-up" style={{animationDelay: "0.1s"}}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Livrables générés</p>
                <p className="text-2xl font-bold text-gray-900">{userProjects.length * 4}</p>
              </div>
              <div className="h-12 w-12 bg-green-50 rounded-lg flex items-center justify-center">
                <Zap className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-3 bg-white rounded-xl shadow-sm p-5 animate-slide-up" style={{animationDelay: "0.1s"}}>
            <h2 className="text-base font-semibold mb-4">Vos projets</h2>
            {userProjectsLoading ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-aurentia-pink"></div>
              </div>
            ) : formattedProjects.length > 0 ? (
              <div className="space-y-3">
                {formattedProjects.map(project => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => navigate(`/project-business/${project.id}`)}
                    >
                      <h3 className="font-medium text-sm">{project.title}</h3>
                    </div>
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        project.status === "Complété" ? "bg-green-100 text-green-800" :
                        project.status === "En analyse" ? "bg-blue-100 text-blue-800" :
                        "bg-yellow-100 text-yellow-800"
                      }`}>
                        {project.status}
                      </span>
                      <button 
                        className="ml-3 p-1.5 text-gray-500 hover:text-gray-700"
                        onClick={() => navigate(`/project-business/${project.id}`)}
                      >
                        <FileText size={16} />
                      </button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button 
                            className="ml-2 p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              setProjectToDelete(project.id);
                            }}
                          >
                            <X size={16} />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Cette action ne peut pas être annulée. Cela supprimera définitivement le projet "{project.title}" et toutes ses données associées.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setProjectToDelete(null)}>
                              Non
                            </AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={handleDeleteProject}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Oui
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Vous n'avez pas encore de projets</p>
                <button
                  onClick={() => navigate("/warning")}
                  className="btn-primary"
                >
                  Créer votre premier projet
                </button>
              </div>
            )}
          </div>
          
          {/* Bouton créer un projet - visible uniquement en mobile */}
          <div className="md:hidden mt-6">
            <button
              onClick={() => navigate("/warning")}
              className="btn-primary w-full flex items-center justify-center gap-2 px-4 py-3"
            >
              <Plus size={20} />
              Créer un nouveau projet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
