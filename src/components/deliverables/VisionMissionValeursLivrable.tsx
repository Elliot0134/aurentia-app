import React, { useState, useEffect } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { supabase } from '@/integrations/supabase/client';

interface VisionData {
  vision_globale: string;
  vision_1_an: string;
  vision_2_ans: string;
  vision_3_ans: string;
  vision_4_ans: string;
  vision_5_ans: string;
}


interface MissionData {
  enonce: string;
  impact_social_environnemental: string;
}

interface ValeurData {
  nom: string;
  description: string;
}

interface CoherenceStrategiqueData {
  alignement_vision_mission: string;
  progression_temporelle: string;
  operationnalisation_valeurs: string;
}

interface VisionMissionValeursData {
  vision: VisionData;
  mission: MissionData;
  valeurs: ValeurData[];
  coherence_strategique: CoherenceStrategiqueData;
  project_id: string;
}

// Supabase raw data interface (before JSON parsing)
interface RawVisionMissionValeursData {
  vision: string; // Stored as JSON string
  mission: string; // Stored as JSON string
  valeurs: string; // Stored as JSON string
  coherence_strategique: string; // Stored as JSON string
  project_id: string;
}

interface VisionMissionValeursLivrableProps {
  projectId: string;
}


const VisionMissionValeursLivrable: React.FC<VisionMissionValeursLivrableProps> = ({ projectId }) => {
  const [visionMissionValeursData, setVisionMissionValeursData] = useState<VisionMissionValeursData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [showDefinitionPlaceholder, setShowDefinitionPlaceholder] = useState(false);
  const [activeSection, setActiveSection] = useState<'vision' | 'mission' | 'valeurs' | 'coherence_strategique'>('vision');

  const livrableTitle = "Vision Mission Valeurs";
  const livrableDescription = "Définition de l'identité stratégique du projet";
  const livrableDefinition = "La vision, mission et valeurs constituent le fondement stratégique d'une entreprise. La vision définit l'ambition à long terme, la mission précise le but et l'impact recherché, tandis que les valeurs établissent les principes directeurs qui guident les décisions et comportements.";
  const livrableImportance = "Ces éléments sont essentiels pour donner une direction claire à l'entreprise, aligner les équipes autour d'objectifs communs, et communiquer efficacement avec les parties prenantes sur l'identité et les aspirations de l'organisation.";
  const livrableColor = "#fab85b";


  useEffect(() => {
    const fetchVisionMissionValeurs = async () => {
      if (!projectId) {
        setLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('vision_mission_valeurs')
          .select('*')
          .eq('project_id', projectId)
          .single();

        if (error) {
          console.error('Error fetching vision_mission_valeurs:', error);
          setVisionMissionValeursData(null);
        } else {
          // Parse JSON strings
          const parsedData: VisionMissionValeursData = {
            ...data,
            vision: data.vision ? JSON.parse(data.vision) : {},
            mission: data.mission ? JSON.parse(data.mission) : {},
            valeurs: data.valeurs ? JSON.parse(data.valeurs) : [],
            coherence_strategique: data.coherence_strategique ? JSON.parse(data.coherence_strategique) : {},
          };
          setVisionMissionValeursData(parsedData);
        }
      } catch (error) {
        console.error('Unexpected error during fetch or parse:', error);
        setVisionMissionValeursData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchVisionMissionValeurs();
  }, [projectId]);


  const handleTemplateClick = () => {
    setIsPopupOpen(true);
  };

  const handlePopupClose = () => {
    setIsPopupOpen(false);
    setShowDefinitionPlaceholder(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }


  return (
    <>
      {/* Livrable Template Part */}
      <div
        className="border rounded-lg p-4 mb-4 text-white transition-transform duration-200 hover:-translate-y-1 cursor-pointer flex justify-between"
        style={{ backgroundColor: livrableColor }}
        onClick={handleTemplateClick}
      >
        <div className="flex-grow mr-4">
          <h2 className="text-xl font-bold mb-2">{livrableTitle}</h2>
          {livrableDescription && <p className="text-white mb-4">{livrableDescription}</p>}
          <div>
            {/* Children for the template content */}
          </div>
        </div>
        <div className="flex-shrink-0">
          <img src="/icones-livrables/vision-icon.png" alt="Vision Mission Valeurs Icon" className="w-8 h-8 object-cover self-start" />
        </div>
      </div>


{/* Livrable Popup Part */}
{isPopupOpen && (
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handlePopupClose}>
<div
className="bg-white text-black rounded-lg w-full mx-2.5 md:w-3/4 relative transform transition-all duration-300 ease-out scale-95 opacity-0 max-h-[calc(100vh-100px)] overflow-hidden flex flex-col"
onClick={(e) => e.stopPropagation()}
style={{ animation: 'scaleIn 0.3s ease-out forwards' }}
>
{/* Sticky Header */}
<div className="sticky top-0 bg-white z-10 border-b border-gray-200 p-6 pb-4 flex justify-between items-start">
<h2 className="text-xl font-bold">{livrableTitle}</h2>
<button
className="text-gray-600 hover:text-gray-900 transition-colors"
onClick={handlePopupClose}
>
<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
</svg>
</button>
</div>

{/* Scrollable Content */}
<div className="flex-1 overflow-y-auto p-6 pt-4">
<div className="flex gap-2 mb-4">
<button
className={`text-xs px-2 py-1 rounded-full cursor-pointer ${
showDefinitionPlaceholder
? `bg-[${livrableColor}] text-white`
: 'bg-gray-200 text-gray-700'
}`}
onClick={() => {
setShowDefinitionPlaceholder(!showDefinitionPlaceholder);
}}
>
Définition
</button>
</div>


<div

className={`overflow-hidden transition-all duration-300 ease-in-out ${

showDefinitionPlaceholder ? 'max-h-screen mb-4' : 'max-h-0'

}`}

>

<div className="mt-2">

<div className="bg-gray-100 rounded-md p-4 mb-2">

<p className="text-[#4B5563]"><strong>Définition :</strong> {livrableDefinition}</p>

</div>

<div className="bg-gray-100 rounded-md p-4">

<p className="text-[#4B5563]"><strong>Importance :</strong> {livrableImportance}</p>

</div>

</div>

</div>


{/* New buttons for Vision, Mission, Valeurs, and Cohérence Stratégique */}

<div className="flex flex-wrap md:flex-nowrap gap-2 mb-4">

<button

className={`text-sm px-4 py-2 rounded-full cursor-pointer w-[calc(50%-0.25rem)] md:w-auto ${

activeSection === 'vision'

? `text-white`

: 'bg-gray-200 text-gray-700'

}`}

style={activeSection === 'vision' ? { backgroundColor: livrableColor } : {}}

onClick={() => setActiveSection('vision')}

>

Vision

</button>

<button

className={`text-sm px-4 py-2 rounded-full cursor-pointer w-[calc(50%-0.25rem)] md:w-auto ${

activeSection === 'mission'

? `text-white`

: 'bg-gray-200 text-gray-700'

}`}

style={activeSection === 'mission' ? { backgroundColor: livrableColor } : {}}

onClick={() => setActiveSection('mission')}

>

Mission

</button>

<button

className={`text-sm px-4 py-2 rounded-full cursor-pointer w-[calc(50%-0.25rem)] md:w-auto ${

activeSection === 'valeurs'

? `text-white`

: 'bg-gray-200 text-gray-700'

}`}

style={activeSection === 'valeurs' ? { backgroundColor: livrableColor } : {}}

onClick={() => setActiveSection('valeurs')}

>

Valeurs

</button>

<button

className={`text-sm px-4 py-2 rounded-full cursor-pointer w-[calc(50%-0.25rem)] md:w-auto ${

activeSection === 'coherence_strategique'

? `text-white`

: 'bg-gray-200 text-gray-700'

}`}

style={activeSection === 'coherence_strategique' ? { backgroundColor: livrableColor } : {}}

onClick={() => setActiveSection('coherence_strategique')}

>

Cohérence

</button>

</div>


{/* Conditional rendering for Vision, Mission, Valeurs, and Cohérence Stratégique content */}

{activeSection === 'vision' && (

<div className="mt-2">

<div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">

<h4 className="text-sm font-semibold mb-2">Vision globale de l'entreprise</h4>

<p className="text-[#4B5563]">{visionMissionValeursData?.vision?.vision_globale || 'N/A'}</p>

</div>


<h4 className="text-sm font-semibold mb-2 mt-4">Projections sur 5 ans</h4>

{/* Table for larger screens */}

<div className="bg-[#F9FAFB] rounded-md p-4 hidden md:block">

<table className="w-full text-left table-auto">

<thead>

<tr>

<th className="px-4 py-2 border-b-2 border-gray-200 w-24">Année</th>

<th className="px-4 py-2 border-b-2 border-gray-200">Description</th>

</tr>

</thead>

<tbody>

<tr>

<td className="px-4 py-2 border-b border-gray-200 w-24">Année 1</td>

<td className="px-4 py-2 border-b border-gray-200">{visionMissionValeursData?.vision?.vision_1_an || 'N/A'}</td>

</tr>

<tr>

<td className="px-4 py-2 border-b border-gray-200 w-24">Année 2</td>

<td className="px-4 py-2 border-b border-gray-200">{visionMissionValeursData?.vision?.vision_2_ans || 'N/A'}</td>

</tr>

<tr>

<td className="px-4 py-2 border-b border-gray-200 w-24">Année 3</td>

<td className="px-4 py-2 border-b border-gray-200">{visionMissionValeursData?.vision?.vision_3_ans || 'N/A'}</td>

</tr>

<tr>

<td className="px-4 py-2 border-b border-gray-200 w-24">Année 4</td>

<td className="px-4 py-2 border-b border-gray-200">{visionMissionValeursData?.vision?.vision_4_ans || 'N/A'}</td>

</tr>

<tr>

<td className="px-4 py-2 w-24">Année 5</td>

<td className="px-4 py-2">{visionMissionValeursData?.vision?.vision_5_ans || 'N/A'}</td>

</tr>

</tbody>

</table>

</div>


{/* Cards for smaller screens */}

<div className="block md:hidden mt-4">

{visionMissionValeursData?.vision &&

[1, 2, 3, 4, 5].map((year) => {

const projectionKey = year === 1 ? 'vision_1_an' : `vision_${year}_ans`;

const projectionValue = visionMissionValeursData.vision[projectionKey] !== undefined

? visionMissionValeursData.vision[projectionKey]

: 'N/A';

return (

<div key={year} className="bg-[#F9FAFB] rounded-md p-4 mb-4 last:mb-0">

<h5 className="text-sm font-semibold mb-2">Année {year}</h5>

<p className="text-[#4B5563]">

{projectionValue}

</p>

</div>

);

})}

</div>

</div>

)}


{activeSection === 'mission' && (

<div className="mt-2">

<div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">

<h4 className="text-sm font-semibold mb-2">Énoncé de la mission</h4>

<p className="text-[#4B5563]">{visionMissionValeursData?.mission?.enonce || 'N/A'}</p>

</div>

<div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">

<h4 className="text-sm font-semibold mb-2">Impact social et environnemental</h4>

<p className="text-[#4B5563]">{visionMissionValeursData?.mission?.impact_social_environnemental || 'N/A'}</p>

</div>

</div>

)}


{activeSection === 'valeurs' && (

<div className="mt-2">

{/* Table for larger screens */}

<div className="bg-[#F9FAFB] rounded-md p-4 hidden md:block">

<Table>

<TableHeader>

<TableRow>

<TableHead className="w-[200px]">Nom de la valeur</TableHead>

<TableHead>Description</TableHead>

</TableRow>

</TableHeader>

<TableBody>

{visionMissionValeursData?.valeurs?.map((valeur, index) => (

<TableRow key={index}>

<TableCell className="font-medium">{valeur.nom || 'N/A'}</TableCell>

<TableCell>{valeur.description || 'N/A'}</TableCell>

</TableRow>

))}

{/* Render empty rows if there are fewer than 6 values */}

{Array.from({ length: Math.max(0, 6 - (visionMissionValeursData?.valeurs?.length || 0)) }).map((_, index) => (

<TableRow key={`empty-${index}`}>

<TableCell className="font-medium">N/A</TableCell>

<TableCell>N/A</TableCell>

</TableRow>

))}

</TableBody>

</Table>

</div>


{/* Cards for smaller screens */}

<div className="block md:hidden mt-4">

{visionMissionValeursData?.valeurs?.map((valeur, index) => (

<div key={index} className="bg-[#F9FAFB] rounded-md p-4 mb-4 last:mb-0">

<h5 className="text-sm font-semibold mb-2">{valeur.nom || 'N/A'}</h5>

<p className="text-[#4B5563]">{valeur.description || 'N/A'}</p>

</div>

))}

{/* Render placeholders for missing values if less than 6 */}

{Array.from({ length: Math.max(0, 6 - (visionMissionValeursData?.valeurs?.length || 0)) }).map((_, index) => (

<div key={`placeholder-${index}`} className="bg-[#F9FAFB] rounded-md p-4 mb-4 last:mb-0">

<h5 className="text-sm font-semibold mb-2">N/A</h5>

<p className="text-[#4B5563]">N/A</p>

</div>

))}

</div>

</div>

)}


            {activeSection === 'coherence_strategique' && (
              <div className="mt-2">
                <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                  <h4 className="text-sm font-semibold mb-2">Alignement Vision-Mission</h4>
                  <p className="text-[#4B5563]">{visionMissionValeursData?.coherence_strategique?.alignement_vision_mission || 'N/A'}</p>
                </div>

                <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                  <h4 className="text-sm font-semibold mb-2">Progression temporelle</h4>
                  <p className="text-[#4B5563]">{visionMissionValeursData?.coherence_strategique?.progression_temporelle || 'N/A'}</p>
                </div>

                <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
                  <h4 className="text-sm font-semibold mb-2">Opérationnalisation des valeurs</h4>
                  <p className="text-[#4B5563]">{visionMissionValeursData?.coherence_strategique?.operationnalisation_valeurs || 'N/A'}</p>
                </div>
              </div>
            )}
            </div>
          </div>
          <style>
            {`
              @keyframes scaleIn {
                to {
                  opacity: 1;
                  transform: scale(1);
                }
              }
            `}
          </style>
        </div>
      )}
    </>
  );
};

export default VisionMissionValeursLivrable;
