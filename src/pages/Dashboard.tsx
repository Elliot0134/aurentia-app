import { useNavigate } from "react-router-dom";
import { FileText, Plus, Zap, Book, X, Users, Crown, Eye, Edit } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { collaborationManager, ProjectCollaborator } from "@/services/collaborationManager";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProjectWithRole {
  project_id: string;
  nom_projet: string;
  description_synthetique?: string;
  created_at: string;
  role: 'owner' | 'Lecteur' | 'Éditeur';
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [collaboratedProjects, setCollaboratedProjects] = useState<ProjectWithRole[]>([]);
  const [collaborationsLoading, setCollaborationsLoading] = useState(true);
  
  // Use Project Context instead of local state
  const { userProjects, userProjectsLoading, deleteProject } = useProject();

  // Format projects for display
  const formattedProjects = userProjects.map(project => ({
    id: project.project_id,
    title: project.nom_projet || "Projet sans nom",
    status: "En cours", // You can enhance this with actual status from project data
    createdAt: new Date(project.created_at).toLocaleDateString('fr-FR')
  }));

  // Charger les projets de collaboration
  useEffect(() => {
    loadCollaboratedProjects();
  }, []);

  const loadCollaboratedProjects = async () => {
    try {
      setCollaborationsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: collaborations, error } = await supabase
        .from('project_collaborators')
        .select(`
          project_id,
          role,
          projects!inner (
            project_id,
            nom_projet,
            created_at
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'accepted');

      if (error) {
        console.error('Erreur lors du chargement des collaborations:', error);
        toast.error('Erreur lors du chargement des projets partagés');
        return;
      }

      const projectsWithRole: ProjectWithRole[] = collaborations?.map((collab: any) => ({
        project_id: collab.project_id,
        nom_projet: collab.projects.nom_projet,
        created_at: collab.projects.created_at,
        role: collab.role as 'Lecteur' | 'Éditeur'
      })) || [];

      setCollaboratedProjects(projectsWithRole);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des projets partagés');
    } finally {
      setCollaborationsLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    
    const success = await deleteProject(projectToDelete);
    if (success) {
      setProjectToDelete(null);
    }
  };

  const getRoleBadge = (role: 'owner' | 'Lecteur' | 'Éditeur') => {
    switch (role) {
      case 'owner':
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200"><Crown className="w-3 h-3 mr-1" />Propriétaire</Badge>;
      case 'Lecteur':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200"><Eye className="w-3 h-3 mr-1" />Lecteur</Badge>;
      case 'Éditeur':
        return <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200"><Edit className="w-3 h-3 mr-1" />Éditeur</Badge>;
      default:
        return null;
    }
  };

  const renderProjectsList = (projects: any[], isOwned: boolean = true) => {
    if (projects.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">
            {isOwned ? "Vous n'avez pas encore de projets" : "Vous ne collaborez sur aucun projet"}
          </p>
          {isOwned && (
            <button
              onClick={() => navigate("/warning")}
              className="btn-primary"
            >
              Créer votre premier projet
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {projects.map(project => (
          <div
            key={project.id || project.project_id}
            className="flex items-center justify-between bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition"
          >
            <div
              className="flex-1 cursor-pointer"
              onClick={() => navigate(`/project-business/${project.id || project.project_id}`)}
            >
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-sm">{project.title || project.nom_projet}</h3>
                {!isOwned && getRoleBadge(project.role)}
              </div>
              {!isOwned && (
                <p className="text-xs text-gray-500">
                  Ajouté le {new Date(project.created_at).toLocaleDateString('fr-FR')}
                </p>
              )}
            </div>
            <div className="flex items-center">
              {isOwned && (
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  project.status === "Complété" ? "bg-green-100 text-green-800" :
                  project.status === "En analyse" ? "bg-blue-100 text-blue-800" :
                  "bg-yellow-100 text-yellow-800"
                }`}>
                  {project.status}
                </span>
              )}
              <button
                className="ml-3 p-1.5 text-gray-500 hover:text-gray-700"
                onClick={() => navigate(`/project-business/${project.id || project.project_id}`)}
              >
                <FileText size={16} />
              </button>
              {isOwned && (
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
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Tableau de bord</h1>
          <p className="text-gray-600">Bienvenue sur votre espace de gestion de projets entrepreneuriaux</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-5 animate-slide-up">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Mes projets</p>
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
                <p className="text-sm font-medium text-gray-600">Projets partagés</p>
                <p className="text-2xl font-bold text-gray-900">{collaboratedProjects.length}</p>
              </div>
              <div className="h-12 w-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 animate-slide-up" style={{animationDelay: "0.2s"}}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Livrables générés</p>
                <p className="text-2xl font-bold text-gray-900">{(userProjects.length + collaboratedProjects.length) * 4}</p>
              </div>
              <div className="h-12 w-12 bg-green-50 rounded-lg flex items-center justify-center">
                <Zap className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-3 bg-white rounded-xl shadow-sm p-5 animate-slide-up" style={{animationDelay: "0.1s"}}>
            <Tabs defaultValue="owned" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="owned" className="flex items-center gap-2">
                  <Crown className="w-4 h-4" />
                  Mes Projets ({userProjects.length})
                </TabsTrigger>
                <TabsTrigger value="collaborated" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Projets Partagés ({collaboratedProjects.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="owned" className="mt-4">
                {userProjectsLoading ? (
                  <div className="flex justify-center py-6">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-aurentia-pink"></div>
                  </div>
                ) : (
                  renderProjectsList(formattedProjects, true)
                )}
              </TabsContent>

              <TabsContent value="collaborated" className="mt-4">
                {collaborationsLoading ? (
                  <div className="flex justify-center py-6">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-aurentia-pink"></div>
                  </div>
                ) : (
                  renderProjectsList(collaboratedProjects, false)
                )}
              </TabsContent>
            </Tabs>
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
