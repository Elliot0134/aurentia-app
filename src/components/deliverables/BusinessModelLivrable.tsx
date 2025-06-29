import React, { useState, useEffect } from 'react';
import { useProject } from '@/contexts/ProjectContext';

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
  const [showStructureCoutsAnalyse, setShowStructureCoutsAnalyse] = useState(true);
  const [showSourcesRevenusAnalyse, setShowSourcesRevenusAnalyse] = useState(true);

  // Use Project Context instead of individual API calls
  const { currentProject, loading } = useProject();
  const businessModelData = currentProject?.business_model;

  const handleTemplateClick = () => {
    setIsPopupOpen(true);
  };

  const handlePopupClose = () => {
    setIsPopupOpen(false);
    setShowDefinitionPlaceholder(false);
    setShowRecommendationPlaceholder(false);
  };

  const deliverableTitle = "Business Model";
  const deliverableDescription = "Modèle économique et stratégie de création de valeur";
  const deliverableColor = "#ff8c00";

  return (
    <>
      {/* Livrable Template Part */}
      <div
        className="border rounded-lg p-4 mb-4 text-white transition-transform duration-200 hover:-translate-y-1 cursor-pointer flex justify-between"
        onClick={handleTemplateClick}
        style={{ borderColor: deliverableColor, backgroundColor: deliverableColor }}
      >
        <div className="flex-grow mr-4 flex flex-col">
          <h2 className="text-xl font-bold mb-2">{deliverableTitle}</h2>
          <p className="text-white mb-4">{deliverableDescription}</p>
          <div className="flex-grow">
            {/* Children for the template content */}
          </div>
          <div className="flex-shrink-0 mt-auto">
            <button className={`text-xs bg-white px-2 py-1 rounded-full cursor-default pointer-events-none font-bold`} style={{ color: deliverableColor }}>
              {businessModelData?.avis || 'Évaluation'}
            </button>
          </div>
        </div>
        <div className="flex-shrink-0">
          <img src="/icones-livrables/business-model-icon.png" alt="Business Model Icon" className="w-8 h-8 object-cover self-start" />
        </div>
      </div>

      {/* Livrable Popup Part */}
      {isPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handlePopupClose}>
          <div
            className="bg-white text-black rounded-lg p-6 w-full mx-2.5 md:w-3/4 relative transform transition-all duration-300 ease-out scale-95 opacity-0 max-h-[calc(100vh-100px)] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: 'scaleIn 0.3s ease-out forwards' }}
          >
            <h2 className="text-xl font-bold mb-2">{deliverableTitle}</h2>
            <div className="flex gap-2 mb-4">
              <button
                className={`text-xs px-2 py-1 rounded-full cursor-pointer ${
                  showDefinitionPlaceholder
                    ? 'text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
                style={{ backgroundColor: showDefinitionPlaceholder ? deliverableColor : '' }}
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
                    ? 'text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
                style={{ backgroundColor: showRecommendationPlaceholder ? deliverableColor : '' }}
                onClick={() => {
                  setShowRecommendationPlaceholder(!showRecommendationPlaceholder);
                  setShowDefinitionPlaceholder(false);
                }}
              >
                Recommandations
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
                  <p className="text-[#4B5563]">
                    <strong>Recommandations :</strong> {businessModelData?.recommandations || "Aucune recommandation disponible pour ce business model."}
                  </p>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Chargement des données...</p>
              </div>
            ) : businessModelData ? (
              <div className="space-y-6">
                {/* Business Model Canvas Structure */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Partenaires clés */}
                  <div className="bg-[#F9FAFB] rounded-md p-4">
                    <h4 className="text-sm font-semibold mb-2">Partenaires clés</h4>
                    <p className="text-[#4B5563]">{businessModelData.partenaires_cles || "Non défini"}</p>
                  </div>

                  {/* Activités clés */}
                  <div className="bg-[#F9FAFB] rounded-md p-4">
                    <h4 className="text-sm font-semibold mb-2">Activités clés</h4>
                    <p className="text-[#4B5563]">{businessModelData.activites_cles || "Non défini"}</p>
                  </div>

                  {/* Ressources clés */}
                  <div className="bg-[#F9FAFB] rounded-md p-4">
                    <h4 className="text-sm font-semibold mb-2">Ressources clés</h4>
                    <p className="text-[#4B5563]">{businessModelData.ressources_cles || "Non défini"}</p>
                  </div>
                </div>

                {/* Proposition de valeur - Full width */}
                <div className="bg-[#E3F2FD] rounded-md p-4">
                  <h4 className="text-sm font-semibold mb-2">Proposition de valeur</h4>
                  <p className="text-[#4B5563]">{businessModelData.proposition_valeur || "Non définie"}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Relations clients */}
                  <div className="bg-[#F9FAFB] rounded-md p-4">
                    <h4 className="text-sm font-semibold mb-2">Relations avec les clients</h4>
                    <p className="text-[#4B5563]">{businessModelData.relations_clients || "Non défini"}</p>
                  </div>

                  {/* Canaux */}
                  <div className="bg-[#F9FAFB] rounded-md p-4">
                    <h4 className="text-sm font-semibold mb-2">Canaux</h4>
                    <p className="text-[#4B5563]">{businessModelData.canaux || "Non défini"}</p>
                  </div>
                </div>

                {/* Segments clients - Full width */}
                <div className="bg-[#E8F5E8] rounded-md p-4">
                  <h4 className="text-sm font-semibold mb-2">Segments de clients</h4>
                  <p className="text-[#4B5563]">{businessModelData.segments_clients || "Non défini"}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Structure des coûts */}
                  <div className="bg-[#FFF3E0] rounded-md p-4">
                    <h4 className="text-sm font-semibold mb-2">Structure des coûts</h4>
                    <p className="text-[#4B5563]">{businessModelData.structure_couts || "Non définie"}</p>
                    
                    {businessModelData.structure_couts_analyse && (
                      <div className="mt-4">
                        <button
                          onClick={() => setShowStructureCoutsAnalyse(!showStructureCoutsAnalyse)}
                          className="text-xs px-2 py-1 rounded-md bg-orange-100 text-orange-700 hover:bg-orange-200 transition"
                        >
                          {showStructureCoutsAnalyse ? 'Masquer l\'analyse' : 'Afficher l\'analyse'}
                        </button>
                        {showStructureCoutsAnalyse && (
                          <div className="mt-2 p-2 bg-white rounded border">
                            <p className="text-xs text-gray-600">{businessModelData.structure_couts_analyse}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Sources de revenus */}
                  <div className="bg-[#E8F5E8] rounded-md p-4">
                    <h4 className="text-sm font-semibold mb-2">Sources de revenus</h4>
                    <p className="text-[#4B5563]">{businessModelData.sources_revenus || "Non définies"}</p>
                    
                    {businessModelData.sources_revenus_analyse && (
                      <div className="mt-4">
                        <button
                          onClick={() => setShowSourcesRevenusAnalyse(!showSourcesRevenusAnalyse)}
                          className="text-xs px-2 py-1 rounded-md bg-green-100 text-green-700 hover:bg-green-200 transition"
                        >
                          {showSourcesRevenusAnalyse ? 'Masquer l\'analyse' : 'Afficher l\'analyse'}
                        </button>
                        {showSourcesRevenusAnalyse && (
                          <div className="mt-2 p-2 bg-white rounded border">
                            <p className="text-xs text-gray-600">{businessModelData.sources_revenus_analyse}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Évaluation et justification */}
                {businessModelData.avis && (
                  <div className="bg-gray-50 rounded-md p-4">
                    <h4 className="text-sm font-semibold mb-2">Évaluation</h4>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700 font-medium">
                        {businessModelData.avis}
                      </span>
                    </div>
                    {businessModelData.justification_avis && (
                      <p className="text-[#4B5563] text-sm">{businessModelData.justification_avis}</p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">Aucune donnée de business model disponible.</p>
              </div>
            )}

            <button
              onClick={handlePopupClose}
              className="sticky top-0 right-4 float-right mb-4 bg-white/90 backdrop-blur-sm text-gray-400 hover:text-gray-600 rounded-full p-2 shadow-md border z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default BusinessModelLivrable;
