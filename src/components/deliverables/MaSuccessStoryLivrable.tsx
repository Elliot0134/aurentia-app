import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // Import useParams to get project_id from URL
import { supabase } from '@/integrations/supabase/client'; // Import supabase client
import Timeline from '@/components/Timeline'; // Import the Timeline component
import { Trophy, Globe, Handshake } from 'lucide-react'; // Import icons

interface SuccessStoryData {
  projections_un_an_titre: string;
  projections_un_an_vision: string;
  projections_trois_ans_titre: string;
  projections_trois_ans_vision: string;
  projections_cinq_ans_titre: string;
  projections_cinq_ans_vision: string;
  message_motivation: string;
  avis: string | null;
}

const MaSuccessStoryLivrable: React.FC = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [showDefinitionPlaceholder, setShowDefinitionPlaceholder] = useState(false);
  const [showRecommendationPlaceholder, setShowRecommendationPlaceholder] = useState(false);
  const [successStoryData, setSuccessStoryData] = useState<SuccessStoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { projectId } = useParams<{ projectId: string }>(); // Get project_id from URL

  const transformDataToTimelineItems = (data: SuccessStoryData) => {
    const items = [];

    if (data.projections_un_an_titre || data.projections_un_an_vision) {
      items.push({
        id: 'projection-1-year',
        title: data.projections_un_an_titre || 'Projection 1 An',
        subtitle: 'Projections à court terme (1 an)',
        description: data.projections_un_an_vision || '',
        date: '1 an',
        icon: <Trophy className="w-5 h-5" />,
      });
    }

    if (data.projections_trois_ans_titre || data.projections_trois_ans_vision) {
      items.push({
        id: 'projection-3-years',
        title: data.projections_trois_ans_titre || 'Projection 3 Ans',
        subtitle: 'Projections à moyen terme (3 ans)',
        description: data.projections_trois_ans_vision || '',
        date: '3 ans',
        icon: <Globe className="w-5 h-5" />,
      });
    }

    if (data.projections_cinq_ans_titre || data.projections_cinq_ans_vision) {
      items.push({
        id: 'projection-5-years',
        title: data.projections_cinq_ans_titre || 'Projection 5 Ans',
        subtitle: 'Projections à long terme (5 ans)',
        description: data.projections_cinq_ans_vision || '',
        date: '5 ans',
        icon: <Handshake className="w-5 h-5" />,
      });
    }

    return items;
  };

  useEffect(() => {
    const fetchSuccessStoryData = async () => {
      if (!projectId) {
        setError("Project ID not found in URL");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('success_story')
        .select('*, avis')
        .eq('project_id', projectId)
        .single();

      if (error) {
        setError(error.message);
        setSuccessStoryData(null);
      } else {
        setSuccessStoryData(data);
      }
      setLoading(false);
    };

    if (isPopupOpen) {
      fetchSuccessStoryData();
    }
  }, [isPopupOpen, projectId]); // Fetch data when popup opens or projectId changes

  const handleTemplateClick = () => {
    setIsPopupOpen(true);
  };

  const handlePopupClose = () => {
    setIsPopupOpen(false);
    // Reset placeholder states when closing popup
    setShowDefinitionPlaceholder(false);
    setShowRecommendationPlaceholder(false);
  };

  const deliverableTitle = "Ma Success Story";
  const deliverableDescription = "Visualisez vos projections d'évolution entrepreneuriale";
  const deliverableDefinition = "La Success Story est un outil de projection qui permet de visualiser l'évolution de votre entreprise à travers différentes échéances temporelles, accompagnée d'un message de motivation personnalisé.";
  const deliverableImportance = "Ce livrable est essentiel pour maintenir la motivation entrepreneuriale, clarifier la vision à long terme et structurer les objectifs de croissance de l'entreprise selon des horizons temporels définis.";
  const deliverableColor = "#87CEEB";

  return (
    <>
      {/* Livrable Template Part */}
      <div
        className="border border-gray-200 rounded-lg p-4 mb-4 bg-white text-black transition-transform duration-200 hover:-translate-y-1 cursor-pointer flex justify-between h-full"
        onClick={handleTemplateClick}
      >
        <div className="flex-grow flex flex-col"> {/* Container for text content */}
          <h2 className="text-xl font-bold mb-2 text-black">{deliverableTitle}</h2>
          {deliverableDescription && <p className="text-gray-700 mb-4 line-clamp-3">{deliverableDescription}</p>}
          <div className="flex-grow">
            {/* Children for the template content */}
            {/* The actual deliverable content might go here or be passed via children */}
          </div>
          <div className="flex-shrink-0 mt-auto">
            <button className={`text-xs px-2 py-1 rounded-full cursor-default pointer-events-none`} style={{ backgroundColor: '#FEF2ED', color: '#FF5932', border: '1px solid #FFBDA4' }}>
              {successStoryData?.avis || 'Commentaire'}
            </button>
          </div>
        </div>
        <div className="flex-shrink-0"> {/* Container for image */}
          <img src="/icones-livrables/story-icon.png" alt="Success Story Icon" className="w-8 h-8 object-cover self-start" />
        </div>
      </div>

      {/* Livrable Popup Part */}
      {isPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handlePopupClose}>
          <div
            className="bg-white text-black rounded-lg w-full mx-2.5 md:w-3/4 relative transform transition-all duration-300 ease-out scale-95 opacity-0 max-h-[calc(100vh-100px)] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the popup
            style={{ animation: 'scaleIn 0.3s ease-out forwards' }} // Apply animation
          >
            {/* Sticky Header */}
            <div className="sticky top-0 bg-white z-10 border-b border-gray-200 p-6 pb-4 flex justify-between items-start">
              <h2 className="text-xl font-bold">{deliverableTitle}</h2>
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
              {/* Removed Définition button */}
              {/* Removed Recommandation button */}
            </div>

            {/* Removed Recommendation placeholder section */}

            {loading && <p>Loading data...</p>}
            {error && <p className="text-red-500">Error: {error}</p>}
            {successStoryData && (
              <>
                {successStoryData.message_motivation && (
                  <div className="mb-8"> {/* Changed mt-8 to mb-8 for spacing below the message */}
                    <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                      <h3 className="text-lg font-semibold mb-2">Un petit message pour toi...</h3> {/* Moved title inside */}
                      <p className="text-[#4B5563]">{successStoryData.message_motivation}</p>
                    </div>
                  </div>
                )}

                <Timeline items={transformDataToTimelineItems(successStoryData)} />
              </>
            )}

            </div>
          </div>
          {/* Define keyframes for the animation */}
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

export default MaSuccessStoryLivrable;
