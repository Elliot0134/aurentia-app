import React, { useState, useEffect } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { useParams } from 'react-router-dom';

interface MiniSwotData {
  economique_opportunite_1: string | null;
  economique_opportunite_2: string | null;
  economique_menace_1: string | null;
  economique_menace_2: string | null;
  socio_opportunite_1: string | null;
  socio_opportunite_2: string | null;
  socio_menace_1: string | null;
  socio_menace_2: string | null;
  force_1: string | null;
  force_2: string | null;
  force_3: string | null;
  force_4: string | null;
  faiblesse_1: string | null;
  faiblesse_2: string | null;
  faiblesse_3: string | null;
  faiblesse_4: string | null;
  recommandations: string | null;
  avis: string | null;
  justification_avis: string | null;
}

const MiniSwotLivrable: React.FC = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [showDefinitionPlaceholder, setShowDefinitionPlaceholder] = useState(false);
  const [showRecommendationPlaceholder, setShowRecommendationPlaceholder] = useState(false);
  const [swotData, setSwotData] = useState<MiniSwotData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { projectId } = useParams<{ projectId: string }>();

  useEffect(() => {
    const fetchData = async () => {
      if (!projectId) {
        setError("Project ID not found in URL.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('mini_swot')
        .select('*, recommandations, avis, justification_avis')
        .eq('project_id', projectId)
        .single();

      if (error) {
        setError(error.message);
        setSwotData(null);
      } else {
        setSwotData(data);
      }
      setLoading(false);
    };

    fetchData();
  }, [projectId, supabase]);

  const handleTemplateClick = () => {
    setIsPopupOpen(true);
  };

  const handlePopupClose = () => {
    setIsPopupOpen(false);
    setShowDefinitionPlaceholder(false);
    setShowRecommendationPlaceholder(false);
  };

  const title = "Mini SWOT";
  const description = "Analyse stratégique simplifiée des forces, faiblesses, opportunités et menaces";
  const definition = "Le Mini SWOT est une version condensée de l'analyse SWOT traditionnelle qui permet d'identifier rapidement les facteurs internes (forces et faiblesses) et externes (opportunités et menaces) qui peuvent influencer le succès d'un projet d'entreprise";
  const importance = "Cette analyse est cruciale pour comprendre l'environnement concurrentiel et les capacités internes de l'entreprise, permettant ainsi de définir une stratégie adaptée et de prendre des décisions éclairées";
  const color = "#22c55e";

  return (
    <>
      {/* Livrable Template Part */}
      <div
        className="border rounded-lg p-4 mb-4 bg-[#E91E62] text-white transition-transform duration-200 hover:-translate-y-1 cursor-pointer flex justify-between"
        onClick={handleTemplateClick}
      >
        <div className="flex-grow mr-4 flex flex-col">
          <h2 className="text-xl font-bold mb-2">{title}</h2>
          {swotData?.justification_avis && <p className="text-white mb-4">{swotData.justification_avis}</p>}
          <div className="flex-grow">
            {/* Children for the template content */}
          </div>
          <div className="flex-shrink-0 mt-auto">
            <button className={`text-xs bg-white px-2 py-1 rounded-full cursor-default pointer-events-none font-bold`} style={{ color: '#E91E62' }}>
              {swotData?.avis || 'Commentaire'}
            </button>
          </div>
        </div>
        <div className="flex-shrink-0">
          <img src="/icones-livrables/market-icon.png" alt="Market Icon" className="w-8 h-8 object-cover self-start" />
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
            <div className="border rounded-md p-4 mb-4 bg-yellow-100">
              <div className="flex items-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h3 className="text-xl font-semibold">A noter</h3>
              </div>
              <p className="text-gray-700 text-sm">
                Passez au niveau supérieur pour recevoir votre analyse de marché avec lien des sources à l'appuie.
              </p>
            </div>
            <div className="flex gap-2 mb-4">
              <button
                className={`text-xs px-2 py-1 rounded-full cursor-pointer ${
                  showDefinitionPlaceholder
                    ? `bg-[#E91E62] text-white`
                    : 'bg-gray-200 text-gray-700'
                }`}
                onClick={() => {
                  setShowDefinitionPlaceholder(!showDefinitionPlaceholder);
                  setShowRecommendationPlaceholder(false);
                }}
              >
                Définition
              </button>
              <button
                className={`text-xs px-2 py-1 rounded-full cursor-pointer ${
                  showRecommendationPlaceholder
                    ? `bg-[#E91E62] text-white`
                    : 'bg-gray-200 text-gray-700'
                }`}
                onClick={() => {
                  setShowRecommendationPlaceholder(!showRecommendationPlaceholder);
                  setShowDefinitionPlaceholder(false);
                }}
              >
                Recommandation
              </button>
            </div>

            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                showDefinitionPlaceholder ? 'max-h-screen' : 'max-h-0'
              }`}
            >
              <div className="mt-2">
                <div className="bg-gray-100 rounded-md p-4 mb-2">
                  <p className="text-[#4B5563]"><strong>Définition :</strong> {definition}</p>
                </div>
                <div className="bg-gray-100 rounded-md p-4">
                  <p className="text-[#4B5563]"><strong>Importance :</strong> {importance}</p>
                </div>
              </div>
            </div>

            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                showRecommendationPlaceholder ? 'max-h-screen' : 'max-h-0'
              }`}
            >
              <div className="mt-2">
                <div className="bg-gray-100 rounded-md p-4">
                  {swotData?.recommandations?.split('\n').filter(Boolean).map((item, index) => (
                    <p key={index} className="text-[#4B5563] mb-2" dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></p>
                  ))}
                </div>
              </div>
            </div>

            {loading && <p>Loading data...</p>}
            {error && <p className="text-red-500">Error: {error}</p>}
            {swotData && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <div className="bg-[#e8f7df] rounded-md p-4">
                      <h4 className="text-2xl font-semibold mb-2">Opportunités</h4>
                      <h5 className="text-sm font-semibold mb-2 mt-4">Économique</h5>
                      <div className="bg-white rounded-md p-2 mb-2">
                        <p className="text-[#4B5563]">{swotData.economique_opportunite_1}</p>
                      </div>
                      <div className="bg-white rounded-md p-2 mb-2">
                        <p className="text-[#4B5563]">{swotData.economique_opportunite_2}</p>
                      </div>
                      <h5 className="text-sm font-semibold mb-2 mt-4">Socio-démo</h5>
                      <div className="bg-white rounded-md p-2 mb-2">
                        <p className="text-[#4B5563]">{swotData.socio_opportunite_1}</p>
                      </div>
                      <div className="bg-white rounded-md p-2 mb-2">
                        <p className="text-[#4B5563]">{swotData.socio_opportunite_2}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                     <div className="bg-[#ffdfdf] rounded-md p-4">
                      <h4 className="text-2xl font-semibold mb-2">Menaces</h4>
                      <h5 className="text-sm font-semibold mb-2 mt-4">Économique</h5>
                      <div className="bg-white rounded-md p-2 mb-2">
                        <p className="text-[#4B5563]">{swotData.economique_menace_1}</p>
                      </div>
                      <div className="bg-white rounded-md p-2 mb-2">
                        <p className="text-[#4B5563]">{swotData.economique_menace_2}</p>
                      </div>
                      <h5 className="text-sm font-semibold mb-2 mt-4">Socio-démo</h5>
                      <div className="bg-white rounded-md p-2 mb-2">
                        <p className="text-[#4B5563]">{swotData.socio_menace_1}</p>
                      </div>
                      <div className="bg-white rounded-md p-2 mb-2">
                        <p className="text-[#4B5563]">{swotData.socio_menace_2}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <div className="bg-[#e8f7df] rounded-md p-4">
                      <h4 className="text-2xl font-semibold mb-2">Forces</h4>
                      <div className="bg-white rounded-md p-2 mb-2">
                        <p className="text-[#4B5563]">{swotData.force_1}</p>
                      </div>
                      <div className="bg-white rounded-md p-2 mb-2">
                        <p className="text-[#4B5563]">{swotData.force_2}</p>
                      </div>
                      <div className="bg-white rounded-md p-2 mb-2">
                        <p className="text-[#4B5563]">{swotData.force_3}</p>
                      </div>
                      <div className="bg-white rounded-md p-2 mb-2">
                        <p className="text-[#4B5563]">{swotData.force_4}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="bg-[#ffdfdf] rounded-md p-4">
                      <h4 className="text-2xl font-semibold mb-2">Faiblesses</h4>
                      <div className="bg-white rounded-md p-2 mb-2">
                        <p className="text-[#4B5563]">{swotData.faiblesse_1}</p>
                      </div>
                      <div className="bg-white rounded-md p-2 mb-2">
                        <p className="text-[#4B5563]">{swotData.faiblesse_2}</p>
                      </div>
                      <div className="bg-white rounded-md p-2 mb-2">
                        <p className="text-[#4B5563]">{swotData.faiblesse_3}</p>
                      </div>
                      <div className="bg-white rounded-md p-2 mb-2">
                        <p className="text-[#4B5563]">{swotData.faiblesse_4}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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

export default MiniSwotLivrable;