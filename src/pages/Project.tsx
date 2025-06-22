
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Download, Settings } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Tables } from "@/integrations/supabase/types";

const Project = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Tables<'project_summary'> | null>(null);
  const [originaliteData, setOriginaliteData] = useState<Tables<'originalite'> | null>(null);
  const [pertinenceData, setPertinenceData] = useState<Tables<'pertinence'> | null>(null);
  const [complexiteData, setComplexiteData] = useState<Tables<'complexite'> | null>(null);
  const [marcheData, setMarcheData] = useState<Tables<'marche'> | null>(null);
  const [b2cData, setB2cData] = useState<Tables<'b2c'> | null>(null);
  const [b2bData, setB2bData] = useState<Tables<'b2b'> | null>(null);
  const [organismsData, setOrganismsData] = useState<Tables<'organisms'> | null>(null);
  const [concurrenceData, setConcurrenceData] = useState<Tables<'concurrence'>[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjectData = async () => {
      setLoading(true);
      console.log("Fetching data for project ID:", projectId); // Log the project ID


      
      try {
        // Fetch project summary
        const { data: projectSummaryData, error: projectSummaryError } = await supabase
          .from('project_summary')
          .select('*')
          .eq('project_id', projectId)
          .single();

        if (projectSummaryError) {
          console.error("Supabase project_summary query error:", projectSummaryError); // Log Supabase error
          throw projectSummaryError;
        }

        console.log("Project summary data fetched:", projectSummaryData); // Log fetched data
        setProject(projectSummaryData);

        // Fetch originalite data
        const { data: originaliteData, error: originaliteError } = await supabase
          .from('originalite')
          .select('*')
          .eq('project_id', projectId)
          .single();

        if (originaliteError) {
          console.error("Supabase originalite query error:", originaliteError); // Log Supabase error
          // Don't throw an error here, as originalite data might be optional
          console.warn("No originalite data found for project ID:", projectId);
        }

        console.log("Originalite data fetched:", originaliteData); // Log fetched data
        setOriginaliteData(originaliteData);

        // Fetch pertinence data
        const { data: pertinenceData, error: pertinenceError } = await supabase
          .from('pertinence')
          .select('*')
          .eq('project_id', projectId)
          .single();

        if (pertinenceError) {
          console.error("Supabase pertinence query error:", pertinenceError); // Log Supabase error
          // Don't throw an error here, as pertinence data might be optional
          console.warn("No pertinence data found for project ID:", projectId);
        }

        console.log("Pertinence data fetched:", pertinenceData); // Log fetched data
        setPertinenceData(pertinenceData);

        // Fetch complexite data
        const { data: complexiteData, error: complexiteError } = await supabase
          .from('complexite')
          .select('*')
          .eq('project_id', projectId)
          .single();

        if (complexiteError) {
          console.error("Supabase complexite query error:", complexiteError); // Log Supabase error
          // Don't throw an error here, as complexite data might be optional
          console.warn("No complexite data found for project ID:", projectId);
        }

        if (complexiteData) {
          console.log("Complexite data fetched:", complexiteData); // Log fetched data
          setComplexiteData(complexiteData);
        } else {
          console.warn("No complexite data found for project ID:", projectId, "Using test data.");
          // Use test data if no data is found in Supabase
          const testComplexiteData = await import('../test-complexite-data.json');
          console.log("Test data imported in Project.tsx:", testComplexiteData.default);
          setComplexiteData(testComplexiteData.default as Tables<'complexite'>);
          console.log("complexiteData state set with test data in Project.tsx:", testComplexiteData.default);
        }

        // Fetch marche data
        const { data: marcheData, error: marcheError } = await supabase
          .from('marche')
          .select('*')
          .eq('project_id', projectId)
          .single();

        if (marcheError) {
          console.error("Supabase marche query error:", marcheError); // Log Supabase error
          // Don't throw an error here, as marche data might be optional
          console.warn("No marche data found for project ID:", projectId);
        }

        console.log("Marche data fetched:", marcheData); // Log fetched data
        setMarcheData(marcheData);

        // Fetch b2c data
        const { data: b2cData, error: b2cError } = await supabase
          .from('b2c')
          .select('*')
          .eq('project_id', projectId)
          .single();

        if (b2cError) {
          console.error("Supabase b2c query error:", b2cError); // Log Supabase error
          // Don't throw an error here, as b2c data might be optional
          console.warn("No b2c data found for project ID:", projectId);
        }

        console.log("B2C data fetched:", b2cData); // Log fetched data
        setB2cData(b2cData);

        // Fetch b2b data
        const { data: b2bData, error: b2bError } = await supabase
          .from('b2b')
          .select('*')
          .eq('project_id', projectId)
          .single();

        if (b2bError) {
          console.error("Supabase b2b query error:", b2bError); // Log Supabase error
          // Don't throw an error here, as b2b data might be optional
          console.warn("No b2b data found for project ID:", projectId);
        }

        console.log("B2B data fetched:", b2bData); // Log fetched data
        setB2bData(b2bData);

        // Fetch organisms data
        const { data: organismsData, error: organismsError } = await supabase
          .from('organisms')
          .select('*')
          .eq('project_id', projectId)
          .single();

        if (organismsError) {
          console.error("Supabase organisms query error:", organismsError); // Log Supabase error
          // Don't throw an error here, as organisms data might be optional
          console.warn("No organisms data found for project ID:", projectId);
        }

        console.log("Organisms data fetched:", organismsData); // Log fetched data
        setOrganismsData(organismsData);

        // Fetch concurrence data
        console.log("Attempting to fetch concurrence data for project ID:", projectId); // Added log
        const { data: concurrenceData, error: concurrenceError } = await supabase
          .from('concurrence')
          .select('*')
          .eq('project_id', projectId);

        if (concurrenceError) {
          console.error("Supabase concurrence query error:", concurrenceError); // Log Supabase error
          console.warn("No concurrence data found for project ID:", projectId); // Log Supabase warning
          console.log("Concurrence data after error:", concurrenceData); // Added log
        } else {
          console.log("Concurrence data fetched successfully:", concurrenceData); // Added log
        }

        setConcurrenceData(concurrenceData);
        console.log("DEBUG: concurrenceData fetched and set:", concurrenceData); // Added log

      } catch (error) {
        console.error("Error fetching project data:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données du projet. Veuillez réessayer plus tard.",
          variant: "destructive",
        });
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProjectData();
    }
  }, [projectId, navigate]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aurentia-pink"></div>
        </div>
      </div>
    );
  }

  if (!project) {
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

        <div className="grid grid-cols-12 gap-4 md:gap-5">
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
