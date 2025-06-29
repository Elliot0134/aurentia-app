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
import AnalyseDesRessourcesLivrable from "@/components/deliverables/AnalyseDesRessourcesLivrable";
import { useProject } from "@/contexts/ProjectContext";

const ProjectBusiness = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [selectedPersonaExpress, setSelectedPersonaExpress] = useState<'Particulier' | 'Entreprise' | 'Organismes'>('Particulier');
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupContent, setPopupContent] = useState<{ title: string; content: React.ReactNode; buttonColor?: string } | null>(null);

  // Use Project Context
  const { currentProject, loading, error, loadProject, currentProjectId } = useProject();

  const openPopup = (title: string, content: React.ReactNode, buttonColor?: string) => {
    setPopupContent({ title, content, buttonColor });
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setPopupContent(null);
  };

  // Load project data when component mounts or projectId changes
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

        {/* Level 1 Deliverables */}
        <div className="grid grid-cols-12 gap-4 md:gap-5">
          {/* Retranscription du concept Deliverable */}
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
            <AnalyseDeMarcheLivrable projectId={projectId || ''} />
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

        {/* Level 4 Deliverables */}
        <div className="grid grid-cols-12 gap-4 md:gap-5 mt-8">
          <div className="col-span-12">
            <AnalyseDesRessourcesLivrable />
          </div>
        </div>
      </div>

    </div>
  );
};

export default ProjectBusiness;
