import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface LivrableProps {
  title?: string;
  description?: string;
  children?: React.ReactNode;
  textColor?: string;
  buttonColor?: string;
}

const BusinessModelLivrable: React.FC<LivrableProps> = ({
  title,
  description,
  children,
  textColor,
  buttonColor,
}) => {
  const definition = "Le Business Model Canvas est un outil stratégique qui permet de visualiser et structurer les éléments clés d'un modèle d'affaires, incluant la proposition de valeur, les segments clients, les ressources et la structure financière.";
  const importance = "Essentiel pour définir how the company creates, delivers, and captures value. It provides a global and coherent vision of the economic model and identifies growth levers.";
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [showDefinitionPlaceholder, setShowDefinitionPlaceholder] = useState(false);
  const [showRecommendationPlaceholder, setShowRecommendationPlaceholder] = useState(false);
  const [businessModelData, setBusinessModelData] = useState<any>(null);
  const [showStructureCoutsAnalyse, setShowStructureCoutsAnalyse] = useState(true);
  const [showSourcesRevenusAnalyse, setShowSourcesRevenusAnalyse] = useState(true);
  const { projectId } = useParams<{ projectId: string }>();

  useEffect(() => {
    const fetchData = async () => {
      if (!projectId) return;

      const { data, error } = await supabase
        .from('business_model')
        .select('*')
        .eq('project_id', projectId)
        .single();

      if (error) {
        console.error('Error fetching business model data:', error);
      } else {
        setBusinessModelData(data);
      }
    };

    fetchData();
  }, [projectId, supabase]);

  // Listen for deliverables refresh event
  useEffect(() => {
    const handleRefreshDeliverables = (event: CustomEvent) => {
      const { projectId: refreshProjectId } = event.detail;
      if (refreshProjectId === projectId) {
        console.log('🔄 Refreshing BusinessModelLivrable data...');
        // Refetch data
        const fetchData = async () => {
          if (!projectId) return;

          const { data, error } = await supabase
            .from('business_model')
            .select('*')
            .eq('project_id', projectId)
            .single();

          if (error) {
            console.error('Error fetching business model data:', error);
          } else {
            setBusinessModelData(data);
          }
        };
        fetchData();
      }
    };

    window.addEventListener('refreshDeliverables', handleRefreshDeliverables as EventListener);
    
    return () => {
      window.removeEventListener('refreshDeliverables', handleRefreshDeliverables as EventListener);
    };
  }, [projectId]);

  const handleTemplateClick = () => {
    setIsPopupOpen(true);
  };

  const handlePopupClose = () => {
    setIsPopupOpen(false);
    setShowDefinitionPlaceholder(false);
    setShowRecommendationPlaceholder(false);
  };

  return (
    <>
      {/* Livrable Template Part */}
      <div
        className="border rounded-lg p-4 mb-4 text-white transition-transform duration-200 hover:-translate-y-1 cursor-pointer flex justify-between h-30"
        onClick={handleTemplateClick}
        style={{ borderColor: '#57a68b', backgroundColor: '#57a68b' }}
      >
        <div className="flex-grow mr-4">
          <h2 className="text-xl font-bold mb-2">{title}</h2>
          {description && <p className="text-white mb-4">{description}</p>}
          <div>{children}</div>
        </div>
        <div className="flex-shrink-0">
          <img src="/icones-livrables/business-model-icon.png" alt="Business Model Icon" className="w-8 h-8 object-cover self-start" />
        </div>
      </div>

      {/* Livrable Popup Part */}
      {isPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handlePopupClose}>
          <div
            className="bg-white text-black rounded-lg w-[90vw] relative transform transition-all duration-300 ease-out scale-95 opacity-0 max-h-[calc(100vh-100px)] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: 'scaleIn 0.3s ease-out forwards' }}
          >
            {/* Sticky Header */}
            <div className="sticky top-0 bg-white z-10 border-b border-gray-200 p-6 pb-4 flex justify-between items-start">
              <h2 className="text-xl font-bold">{title}</h2>
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
                    ? `bg-[#57a68b] text-white`
                    : 'bg-gray-200 text-gray-700'
                }`}
                onClick={() => {
                  setShowDefinitionPlaceholder(!showDefinitionPlaceholder);
                  setShowRecommendationPlaceholder(false);
                }}
              >
                Définition
              </button>
            </div>

            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                showDefinitionPlaceholder ? 'max-h-screen' : 'max-h-0'
              }`}
            >
              <div className="mt-2">
                <div className="bg-gray-100 rounded-md p-4 mb-2">
                  <p className="text-[#4B5563] text-sm"><strong>Définition :</strong> {definition}</p>
                </div>
                <div className="bg-gray-100 rounded-md p-4">
                  <p className="text-[#4B5563] text-sm"><strong>Importance :</strong> {importance}</p>
                </div>
              </div>
            </div>

            {/* Business Model Canvas Layout */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4">
              {/* Row 1 */}
              <div className="col-span-1 md:col-span-1 md:row-span-2 bg-gray-100 p-2 rounded-lg shadow-md relative">
                <h4 className="text-sm font-semibold mb-2">Partenaires clés</h4>
                <img src="/icones-livrables/business-model-icon.png" alt="Business Model Icon" className="w-6 h-6 object-cover absolute top-2 right-2" />
                {businessModelData?.partenaires_cles?.split('\n').map((line: string, index: number) => {
                  const cleanedLine = line.startsWith('- ') ? line.substring(2) : line;
                  return (
                    <p key={index} className="text-[#4B5563] text-xs mb-1">- {cleanedLine}</p>
                  );
                })}
              </div>
              <div className="col-span-1 md:col-span-1 bg-gray-100 p-2 rounded-lg shadow-md relative">
                <h4 className="text-sm font-semibold mb-2">Activités clés</h4>
                <img src="/icones-livrables/business-model-icon.png" alt="Business Model Icon" className="w-6 h-6 object-cover absolute top-2 right-2" />
                {businessModelData?.activites_cles?.split('\n').map((line: string, index: number) => {
                  const cleanedLine = line.startsWith('- ') ? line.substring(2) : line;
                  return (
                    <p key={index} className="text-[#4B5563] text-xs mb-1">- {cleanedLine}</p>
                  );
                })}
              </div>
              <div className="col-span-1 md:col-span-1 bg-gray-100 p-2 rounded-lg shadow-md relative">
                <h4 className="text-sm font-semibold mb-2">Proposition de valeur</h4>
                <img src="/icones-livrables/business-model-icon.png" alt="Business Model Icon" className="w-6 h-6 object-cover absolute top-2 right-2" />
                {businessModelData?.proposition_valeur?.split('\n').map((line: string, index: number) => {
                  const cleanedLine = line.startsWith('- ') ? line.substring(2) : line;
                  return (
                    <p key={index} className="text-[#4B5563] text-xs mb-1">{cleanedLine}</p>
                  );
                })}
              </div>
              <div className="col-span-1 md:col-span-1 bg-gray-100 p-2 rounded-lg shadow-md relative">
                <h4 className="text-sm font-semibold mb-2">Relations clients</h4>
                <img src="/icones-livrables/business-model-icon.png" alt="Business Model Icon" className="w-6 h-6 object-cover absolute top-2 right-2" />
                {businessModelData?.relations_clients?.split('\n').map((line: string, index: number) => (
                  <p key={index} className="text-[#4B5563] text-xs mb-1">{line}</p>
                ))}
              </div>
              <div className="col-span-1 md:col-span-1 md:row-span-2 bg-gray-100 p-2 rounded-lg shadow-md relative">
                <h4 className="text-sm font-semibold mb-2">Segments de clients</h4>
                <img src="/icones-livrables/business-model-icon.png" alt="Business Model Icon" className="w-6 h-6 object-cover absolute top-2 right-2" />
                {businessModelData?.segments_clients?.split('\n').map((line: string, index: number) => {
                  const cleanedLine = line.startsWith('- ') ? line.substring(2) : line;
                  return (
                    <p key={index} className="text-[#4B5563] text-xs mb-1">- {cleanedLine}</p>
                  );
                })}
              </div>

              {/* Row 2 */}
              <div className="col-span-1 md:col-span-2 bg-gray-100 p-2 rounded-lg shadow-md relative">
                <h4 className="text-sm font-semibold mb-2">Ressources clés</h4>
                <img src="/icones-livrables/business-model-icon.png" alt="Business Model Icon" className="w-6 h-6 object-cover absolute top-2 right-2" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="col-span-1">
                    <h5 className="text-xs font-semibold mb-1">Humaines:</h5>
                    {businessModelData?.ressources_humaines?.split('\n').map((line: string, index: number) => {
                      const cleanedLine = line.startsWith('- ') ? line.substring(2) : line;
                      return (
                        <p key={index} className="text-[#4B5563] text-xs mb-1">- {cleanedLine}</p>
                      );
                    })}
                  </div>
                  <div className="col-span-1">
                    <h5 className="text-xs font-semibold mb-1">Financières:</h5>
                    {businessModelData?.ressources_financieres?.split('\n').map((line: string, index: number) => {
                      const cleanedLine = line.startsWith('- ') ? line.substring(2) : line;
                      return (
                        <p key={index} className="text-[#4B5563] text-xs mb-1">- {cleanedLine}</p>
                      );
                    })}
                  </div>
                  <div className="col-span-1">
                    <h5 className="text-xs font-semibold mb-1">Matérielles:</h5>
                    {businessModelData?.ressources_materielles?.split('\n').map((line: string, index: number) => {
                      const cleanedLine = line.startsWith('- ') ? line.substring(2) : line;
                      return (
                        <p key={index} className="text-[#4B5563] text-xs mb-1">- {cleanedLine}</p>
                      );
                    })}
                  </div>
                  <div className="col-span-1">
                    <h5 className="text-xs font-semibold mb-1">Intellectuelles:</h5>
                    {businessModelData?.ressources_intellectuelles?.split('\n').map((line: string, index: number) => {
                      const cleanedLine = line.startsWith('- ') ? line.substring(2) : line;
                      return (
                        <p key={index} className="text-[#4B5563] text-xs mb-1">- {cleanedLine}</p>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="col-span-1 md:col-span-1 bg-gray-100 p-2 rounded-lg shadow-md relative">
                <h4 className="text-sm font-semibold mb-2">Canaux de distribution</h4>
                <img src="/icones-livrables/business-model-icon.png" alt="Business Model Icon" className="w-6 h-6 object-cover absolute top-2 right-2" />
                {businessModelData?.canaux?.split('\n').map((line: string, index: number) => {
                  const cleanedLine = line.startsWith('- ') ? line.substring(2) : line;
                  return (
                    <p key={index} className="text-[#4B5563] text-xs mb-1">- {cleanedLine}</p>
                  );
                })}
              </div>
            </div>

            {/* Row 3 - Structure des coûts and Sources de revenus */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="col-span-1 bg-gray-100 p-2 rounded-lg shadow-md relative">
                <h4 className="text-sm font-semibold mb-2">Structure des coûts</h4>
                <img src="/icones-livrables/business-model-icon.png" alt="Business Model Icon" className="w-6 h-6 object-cover absolute top-2 right-2" />
                <button
                  className="text-xs px-2 py-1 rounded-full cursor-pointer bg-gray-200 text-gray-700 mb-2"
                  onClick={() => setShowStructureCoutsAnalyse(!showStructureCoutsAnalyse)}
                >
                  Description
                </button>
                {showStructureCoutsAnalyse && (
                  <div className="bg-white rounded-md p-2 mb-2">
                    {businessModelData?.structure_couts_analyse?.split('\n').map((line: string, index: number) => {
                      const cleanedLine = line.startsWith('- ') ? line.substring(2) : line;
                      return (
                        <p key={index} className="text-[#4B5563] whitespace-pre-wrap text-xs mb-1">{cleanedLine}</p>
                      );
                    })}
                  </div>
                )}
                {businessModelData?.structure_couts_liste_des_couts?.split('\n').map((line: string, index: number) => {
                  const cleanedLine = line.startsWith('- ') ? line.substring(2) : line;
                  return (
                    <p key={index} className="text-[#4B5563] whitespace-pre-wrap text-xs mb-1">- {cleanedLine}</p>
                  );
                })}
              </div>
              <div className="col-span-1 bg-gray-100 p-2 rounded-lg shadow-md relative">
                <h4 className="text-sm font-semibold mb-2">Sources de revenus</h4>
                <img src="/icones-livrables/market-icon.png" alt="Market Icon" className="w-6 h-6 object-cover absolute top-2 right-2" />
                <button
                  className="text-xs px-2 py-1 rounded-full cursor-pointer bg-gray-200 text-gray-700 mb-2"
                  onClick={() => setShowSourcesRevenusAnalyse(!showSourcesRevenusAnalyse)}
                >
                  Description
                </button>
                {showSourcesRevenusAnalyse && (
                  <div className="bg-white rounded-md p-2 mb-2">
                    {businessModelData?.flux_revenus_analyse?.split('\n').map((line: string, index: number) => {
                      const cleanedLine = line.startsWith('- ') ? line.substring(2) : line;
                      return (
                        <p key={index} className="text-[#4B5563] whitespace-pre-wrap text-xs mb-1">{cleanedLine}</p>
                      );
                    })}
                  </div>
                )}
                {businessModelData?.flux_revenus_liste_des_revenus?.split('\n').map((line: string, index: number) => {
                  const cleanedLine = line.startsWith('- ') ? line.substring(2) : line;
                  return (
                    <p key={index} className="text-[#4B5563] whitespace-pre-wrap text-xs mb-1">- {cleanedLine}</p>
                    );
                  })}
              </div>
            </div>

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

export default BusinessModelLivrable;