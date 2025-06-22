import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FileText, Download, Settings, DollarSign, Briefcase, Lightbulb, Package, Shield, TrendingUp, Book, ListChecks, BarChart, Globe } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import Livrable from "@/components/deliverables/TemplateLivrable";
import RetranscriptionConceptLivrable from "@/components/deliverables/RetranscriptionConceptLivrable";
import PersonaExpressLivrable from "@/components/deliverables/PersonaExpressLivrable";
import MiniSwotLivrable from "@/components/deliverables/MiniSwotLivrable";
import MaSuccessStoryLivrable from "@/components/deliverables/MaSuccessStoryLivrable";
import PitchLivrable from "@/components/deliverables/PitchLivrable";
import AnalyseDeLaConcurrenceLivrable from "@/components/deliverables/AnalyseDeLaConcurrenceLivrable";
import BusinessModelLivrable from "@/components/deliverables/BusinessModelLivrable";
import PropositionDeValeurLivrable from "@/components/deliverables/PropositionDeValeurLivrable";
import AnalyseDeMarcheLivrable from "@/components/deliverables/AnalyseDeMarcheLivrable"; // Import the new deliverable
import { supabase } from "@/integrations/supabase/client"; // Import Supabase client

const ProjectBusiness = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [selectedPersonaExpress, setSelectedPersonaExpress] = useState<'Particulier' | 'Entreprise' | 'Organismes'>('Particulier');
  const [loading, setLoading] = useState(true); // Set loading to true initially
  const [project, setProject] = useState<{ nom_projet?: string; description_projet?: string } | null>(null); // State for project data
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupContent, setPopupContent] = useState<{ title: string; content: React.ReactNode; buttonColor?: string } | null>(null);

  const openPopup = (title: string, content: React.ReactNode, buttonColor?: string) => {
    setPopupContent({ title, content, buttonColor });
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setPopupContent(null);
  };

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      setProject(null);
      return;
    }

    const fetchProject = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('project_summary')
        .select('nom_projet, description_synthetique') // Select the project name and description
        .eq('project_id', projectId)
        .single();

      if (error) {
        console.error("Error fetching project:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les détails du projet.",
          variant: "destructive",
        });
        setProject(null);
      } else {
        setProject({
          nom_projet: data?.nom_projet || "Projet sans nom",
          description_projet: data?.description_synthetique || "Aucune description",
        });
      }
      setLoading(false);
    };

    fetchProject();
  }, [projectId]); // Refetch when projectId changes

  if (loading) {
    return <div>Chargement...</div>; // Or a loading spinner component
  }

  if (!project) {
    return <div>Projet non trouvé.</div>; // Or an error message
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold">{project.nom_projet || "Projet sans nom"}</h1>
            <p className="text-gray-600 text-sm mt-1">{project.description_projet || "Aucune description"}</p>
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

        {/* Level 1 Deliverables */}
        <div className="grid grid-cols-12 gap-4 md:gap-5">
          {/* Retranscription du concept Deliverable */}
          <div className="col-span-12">
            <RetranscriptionConceptLivrable />
          </div>
          <div className="col-span-12 md:grid md:grid-cols-2 md:gap-5">
            <div className="col-span-12 md:col-span-1 md:h-full">
              <PersonaExpressLivrable />
            </div>
            <div className="col-span-12 md:col-span-1 md:h-full">
              <MiniSwotLivrable />
            </div>
          </div>
          <div className="col-span-12 md:grid md:grid-cols-2 md:gap-5 mt-4 md:mt-0">
            <div className="col-span-12 md:col-span-1 md:h-full">
              <MaSuccessStoryLivrable />
            </div>
            <div className="col-span-12 md:col-span-1 md:h-full">
              <PitchLivrable />
            </div>
          </div>
        </div>

        {/* Level 2 Deliverables */}
        <div className="grid grid-cols-12 gap-4 md:gap-5 mt-8">
          <div className="col-span-12 text-center">
            <button className="btn-primary">Débloquer les prochains livrables</button>
          </div>
        </div>

        {/* Analyse de la Concurrence and Analyse de Marché Deliverables */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 mt-8 items-stretch">
          {/* Analyse de la Concurrence Deliverable */}
          <div className="md:h-full">
            <AnalyseDeLaConcurrenceLivrable />
          </div>

          {/* Analyse de Marché Deliverable */}
          <div className="md:h-full">
            <AnalyseDeMarcheLivrable projectId={projectId} />
          </div>
        </div>

        {/* Level 3 Deliverables - Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 mt-8">
          {/* Proposition de Valeur Deliverable */}
          <div>
            <PropositionDeValeurLivrable />
          </div>

          {/* Business Model Deliverable */}
          <div>
            <BusinessModelLivrable
              title="Business Model"
              description="Modèle économique structuré de votre entreprise"
              textColor="#57a68b"
              buttonColor="#57a68b"
            />
          </div>
        </div>
      </div>

    </div>
  );
};

export default ProjectBusiness;
