
import { useNavigate } from "react-router-dom";
import { FileText, Plus, Zap, Book } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

const Dashboard = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserAndProjects = async () => {
      setLoading(true);

      // Get the current session to get the user ID
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setLoading(false);
        return;
      }

      setUserId(session.user.id);

      try {
        // Fetch projects for the current user from form_responses
        const { data, error } = await supabase
          .from('form_business_idea')
          .select('project_id, nom_projet, created_at, project_summary_v2(statut)')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Format the data for display
        const formattedProjects = data.map(project => ({
          id: project.project_id,
          title: project.nom_projet || "Projet sans nom",
          status: project.project_summary_v2?.[0]?.statut === "completed" ? "Complété" :
                  project.project_summary_v2?.[0]?.statut === "pending" ? "En analyse" :
                  "En cours",
          createdAt: new Date(project.created_at).toLocaleDateString('fr-FR')
        }));

        setProjects(formattedProjects);
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger vos projets. Veuillez réessayer plus tard.",
          variant: "destructive",
        });
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndProjects();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Mon tableau de bord</h1>
            <p className="text-gray-600 text-sm mt-1">Bienvenue sur votre espace Aurentia</p>
          </div>
          <button
            onClick={() => navigate("/warning")}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} />
            Nouveau projet
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-5 animate-slide-up" style={{animationDelay: "0.1s"}}>
            <h2 className="text-base font-semibold mb-4">Vos projets</h2>
            {loading ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-aurentia-pink"></div>
              </div>
            ) : projects.length > 0 ? (
              <div className="space-y-3">
                {projects.map(project => (
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
              <div className="text-center py-5">
                <p className="text-gray-500 text-sm">Vous n'avez pas encore de projets. Commencez par créer un nouveau projet.</p>
                <button
                  onClick={() => navigate("/warning")}
                  className="mt-3 text-aurentia-pink hover:underline font-medium text-sm"
                >
                  Créer mon premier projet
                </button>
              </div>
            )}
          </div>
          
          <div className="bg-gradient-primary rounded-xl shadow-sm p-5 text-white animate-slide-up" style={{animationDelay: "0.2s"}}>
            <h2 className="text-base font-semibold mb-4">Commencez votre projet</h2>
            <p className="text-sm mb-5">
              Décrivez votre idée d'entreprise, et notre IA générera une analyse complète pour vous aider à la développer.
            </p>
            <button
              onClick={() => navigate("/form")}
              className="bg-white text-aurentia-pink font-medium px-4 py-2 text-sm rounded-full hover:shadow-lg transition-all duration-300"
            >
              Voir la démonstration
            </button>
          </div>
        </div>

        
        <div className="bg-white rounded-xl shadow-sm p-5 animate-slide-up" style={{animationDelay: "0.5s"}}>
          <div className="flex justify-between items-center mb-4">
          </div>
          
          <div className="text-center py-8">
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <FileText size={20} className="text-gray-400" />
              </div>
            </div>
            <h3 className="text-base font-medium">Aucun livrable récent</h3>
            <p className="text-gray-600 text-xs mt-1 mb-3 max-w-md mx-auto">
              Commencez un nouveau projet pour générer des analyses et livrables pour votre idée d'entreprise
            </p>
            <button
              onClick={() => navigate("/form")}
              className="btn-primary text-sm"
            >
              Découvrir les livrables
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
