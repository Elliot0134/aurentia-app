import { useNavigate } from "react-router-dom";
import { FileText, Plus, Zap, Book } from "lucide-react";
import { useProject } from "@/contexts/ProjectContext";

const Dashboard = () => {
  const navigate = useNavigate();
  
  // Use Project Context instead of local state
  const { userProjects, userProjectsLoading } = useProject();

  // Format projects for display
  const formattedProjects = userProjects.map(project => ({
    id: project.project_id,
    title: project.nom_projet || "Projet sans nom",
    status: "En cours", // You can enhance this with actual status from project data
    createdAt: new Date(project.created_at).toLocaleDateString('fr-FR')
  }));

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
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-5 animate-slide-up" style={{animationDelay: "0.1s"}}>
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
                    className="flex items-center justify-between bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                    onClick={() => navigate(`/project-business/${project.id}`)}
                  >
                    <div>
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
                      <button className="ml-3 p-1.5 text-gray-500 hover:text-gray-700">
                        <FileText size={16} />
                      </button>
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

          <div className="bg-white rounded-xl shadow-sm p-5 animate-slide-up" style={{animationDelay: "0.2s"}}>
            <h2 className="text-base font-semibold mb-4">Actions rapides</h2>
            <div className="space-y-3">
              <button
                onClick={() => navigate("/form-business-idea")}
                className="w-full text-left p-3 rounded-lg bg-gradient-to-r from-aurentia-pink to-aurentia-pink-dark text-white hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-3">
                  <Plus size={20} />
                  <div>
                    <div className="font-medium">Nouveau projet</div>
                    <div className="text-xs opacity-90">Créer un nouveau projet d'entreprise</div>
                  </div>
                </div>
              </button>
              <button
                onClick={() => navigate("/outils")}
                className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-3">
                  <Zap size={20} className="text-gray-600" />
                  <div>
                    <div className="font-medium text-gray-900">Outils</div>
                    <div className="text-xs text-gray-500">Découvrir les outils disponibles</div>
                  </div>
                </div>
              </button>
              <button
                onClick={() => navigate("/knowledge")}
                className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-3">
                  <Book size={20} className="text-gray-600" />
                  <div>
                    <div className="font-medium text-gray-900">Centre de connaissances</div>
                    <div className="text-xs text-gray-500">Accéder aux ressources</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
