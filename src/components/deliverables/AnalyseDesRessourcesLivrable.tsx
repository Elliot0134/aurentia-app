import React, { useState } from 'react';
import { useProject } from '@/contexts/ProjectContext';

interface AnalyseDesRessourcesLivrableProps {}

const AnalyseDesRessourcesLivrable: React.FC<AnalyseDesRessourcesLivrableProps> = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [showDefinitionPlaceholder, setShowDefinitionPlaceholder] = useState(false);
  const [showRecommendationPlaceholder, setShowRecommendationPlaceholder] = useState(false);

  // Use Project Context instead of individual API calls
  const { currentProject, loading, error } = useProject();
  const data = currentProject?.ressources_requises;
  
  // Local state for UI interactions
  const [openSubCategories, setOpenSubCategories] = useState<Record<string, boolean>>({});
  const [selectedCategory, setSelectedCategory] = useState<string | null>('materielles');

  // Helper function to parse JSON data safely
  const parseJsonData = (jsonString: any) => {
    if (!jsonString) return null;
    if (typeof jsonString === 'object') return jsonString;
    try {
      return JSON.parse(jsonString);
    } catch (e) {
      console.error('Error parsing JSON:', e);
      return null;
    }
  };

  const handleTemplateClick = () => {
    setIsPopupOpen(true);
  };

  const handlePopupClose = () => {
    setIsPopupOpen(false);
    setShowDefinitionPlaceholder(false);
    setShowRecommendationPlaceholder(false);
  };

  const deliverableTitle = "Analyse des ressources";
  const deliverableDescription = "Identification et planification des ressources nécessaires au projet";
  const deliverableDefinition = "L'analyse des ressources consiste à identifier, quantifier et planifier l'ensemble des moyens matériels, humains et techniques nécessaires à la réalisation et au fonctionnement d'un projet d'entreprise.";
  const deliverableImportance = "Cette analyse est cruciale car elle permet d'évaluer les investissements requis, de planifier les recrutements, d'anticiper les coûts et de s'assurer que tous les moyens nécessaires seront disponibles au moment opportun pour le lancement et la croissance de l'entreprise.";
  const deliverableColor = "#57acc2";

  const renderResourceCategory = (categoryObject: any, openCategories: Record<string, boolean>, setOpenCategories: React.Dispatch<React.SetStateAction<Record<string, boolean>>>) => {
    if (!categoryObject || !categoryObject.categorie || !Array.isArray(categoryObject.elements)) {
      console.log("Invalid category object:", categoryObject);
      return null;
    }

    const categoryName = categoryObject.categorie;
    const items = categoryObject.elements;
    const isOpen = openCategories[categoryName] || false;

    const toggleCategory = () => {
      setOpenCategories(prev => ({
        ...prev,
        [categoryName]: !prev[categoryName]
      }));
    };

    if (items.length === 0) return null;

    return (
      <div key={categoryName} className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
        <button
          className="w-full text-left py-2 focus:outline-none flex justify-between items-center"
          onClick={toggleCategory}
        >
          <h4 className="text-base font-semibold text-gray-800">{categoryName}</h4>
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? 'max-h-[9999px]' : 'max-h-0'
          }`}
        >
          <div className="mt-3">
            {/* Table View for larger screens */}
            <div className="overflow-x-auto hidden sm:block">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantité</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Justification</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priorité</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Alternative économique</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item: any, index: number) => (
                    <tr key={index}>
                      <td className="px-6 py-6 text-sm font-medium text-gray-900 break-words">{item.nom}</td>
                      <td className="px-6 py-6 text-sm text-gray-500 break-words">{item.quantite}</td>
                      <td className="px-6 py-6 text-sm text-gray-500 break-words">{item.justification}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          item.priorite === '🔥 Prioritaire' ? 'bg-red-100 text-red-800' :
                          item.priorite === 'Moyen' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {item.priorite}
                        </span>
                      </td>
                      <td className="px-6 py-6 text-sm text-blue-600 break-words">
                        {item.alternative_economique && item.alternative_economique !== "Aucune" ? item.alternative_economique : "Aucune"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Card View for small screens */}
            <div className="sm:hidden space-y-4">
              {items.map((item: any, index: number) => (
                <div
                  key={index}
                  className={`bg-white p-4 rounded-md shadow-sm border-l-4 ${
                    item.priorite === '🔥 Prioritaire' ? 'border-red-100' :
                    item.priorite === 'Moyen' ? 'border-yellow-100' :
                    'border-gray-100'
                  }`}
                >
                  <div className="mb-2">
                    <h5 className="font-medium text-gray-900 text-base">{item.nom}</h5>
                    <span className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${
                      item.priorite === '🔥 Prioritaire' ? 'bg-red-100 text-red-800' :
                      item.priorite === 'Moyen' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {item.priorite}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Quantité:</strong> {item.quantite}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Justification:</strong> {item.justification}
                  </p>
                  {item.alternative_economique && item.alternative_economique !== "Aucune" && (
                    <p className="text-sm text-blue-600">
                      <strong>Alternative économique:</strong> {item.alternative_economique}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div>Chargement des ressources...</div>;
  }

  if (error) {
    return <div>Erreur: {error}</div>;
  }

  // Vérifier si des données sont disponibles avec une vérification plus robuste
  const hasResourceData = data && (
    (data.ressources_materielles?.categories_ressources && data.ressources_materielles.categories_ressources.length > 0) ||
    (data.ressources_humaines?.categories_ressources && data.ressources_humaines.categories_ressources.length > 0) ||
    (data.ressources_techniques?.categories_ressources && data.ressources_techniques.categories_ressources.length > 0)
  );

  // Si pas de données, afficher un message (sans log console verbeux)
  if (!data || !hasResourceData) {
    return (
      <>
        {/* Livrable Template Part (always visible) */}
        <div
          className={`border rounded-lg p-4 mb-4 bg-[#57acc2] text-white transition-transform duration-200 hover:-translate-y-1 cursor-pointer flex justify-between h-48`}
          onClick={handleTemplateClick}
        >
          <div className="flex-grow mr-4">
            <h2 className="text-xl font-bold mb-2">{deliverableTitle}</h2>
            {deliverableDescription && <p className="text-white mb-4">{deliverableDescription}</p>}
          </div>
          <div className="flex-shrink-0">
            <img src="/icones-livrables/ressources-icon.png" alt="Ressources Icon" className="w-8 h-8 object-cover self-start" />
          </div>
        </div>

        {/* Livrable Popup Part (shows message if no data) */}
        {isPopupOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handlePopupClose}>
            <div
              className="bg-white text-black rounded-lg p-6 w-full mx-2.5 md:w-9/10 relative transform transition-all duration-300 ease-out scale-95 opacity-0 max-h-[calc(100vh-100px)] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
              style={{ animation: 'scaleIn 0.3s ease-out forwards' }}
            >
              <h2 className="text-xl font-bold mb-2">{deliverableTitle}</h2>
              <p className="mt-4">Aucune donnée de ressource disponible pour ce projet.</p>
              <button
                className="sticky top-0 right-4 float-right mb-4 bg-white/90 backdrop-blur-sm text-gray-400 hover:text-gray-600 rounded-full p-2 shadow-md border z-10"
                onClick={handlePopupClose}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
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
  }

  return (
    <>
      {/* Livrable Template Part */}
      <div
        className={`border rounded-lg p-4 mb-4 bg-[#57acc2] text-white transition-transform duration-200 hover:-translate-y-1 cursor-pointer flex justify-between h-48`}
        onClick={handleTemplateClick}
      >
        <div className="flex-grow mr-4">
          <h2 className="text-xl font-bold mb-2">{deliverableTitle}</h2>
          {deliverableDescription && <p className="text-white mb-4">{deliverableDescription}</p>}
        </div>
        <div className="flex-shrink-0">
          <img src="/icones-livrables/ressources-icon.png" alt="Ressources Icon" className="w-8 h-8 object-cover self-start" />
        </div>
      </div>

      {/* Livrable Popup Part */}
      {isPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handlePopupClose}>
          <div
            className="bg-white text-black rounded-lg p-6 w-full mx-2.5 md:w-9/10 relative transform transition-all duration-300 ease-out scale-95 opacity-0 max-h-[calc(100vh-100px)] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: 'scaleIn 0.3s ease-out forwards' }}
          >
            <h2 className="text-xl font-bold mb-2">{deliverableTitle}</h2>
            <div className="flex gap-2 mb-4">
              <button
                className={`text-xs px-2 py-1 rounded-full cursor-pointer ${
                  showDefinitionPlaceholder
                    ? `bg-[${deliverableColor}] text-white`
                    : 'bg-gray-200 text-gray-700'
                }`}
                onClick={() => {
                  setShowDefinitionPlaceholder(!showDefinitionPlaceholder);
                  // setShowRecommendationPlaceholder(false); // Removed as per user request
                }}
              >
                Définition
              </button>
            </div>

            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out mt-4 ${ // Added mt-4 here
                showDefinitionPlaceholder ? 'max-h-screen' : 'max-h-0'
              }`}
            >
              <div className="mt-2">
                <div className="bg-gray-100 rounded-md p-4 mb-2">
                  <p className="text-[#4B5563]"><strong>Définition :</strong> {deliverableDefinition}</p>
                </div>
                <div className="bg-gray-100 rounded-md p-4">
                  <p className="text-[#4B5563]"><strong>Importance :</strong> {deliverableImportance}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              <button
                className={`text-xs px-2 py-1 rounded-full cursor-pointer ${
                  selectedCategory === 'materielles'
                    ? `bg-[${deliverableColor}] text-white`
                    : 'bg-gray-200 text-gray-700'
                }`}
                onClick={() => setSelectedCategory('materielles')}
              >
                Ressources matérielles
              </button>
              <button
                className={`text-xs px-2 py-1 rounded-full cursor-pointer ${
                  selectedCategory === 'humaines'
                    ? `bg-[${deliverableColor}] text-white`
                    : 'bg-gray-200 text-gray-700'
                }`}
                onClick={() => setSelectedCategory('humaines')}
              >
                Ressources humaines
              </button>
              <button
                className={`text-xs px-2 py-1 rounded-full cursor-pointer ${
                  selectedCategory === 'techniques'
                    ? `bg-[${deliverableColor}] text-white`
                    : 'bg-gray-200 text-gray-700'
                }`}
                onClick={() => setSelectedCategory('techniques')}
              >
                Ressources techniques
              </button>
            </div>

            {selectedCategory === 'materielles' && (
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-4">Ressources matérielles</h3>
                {data?.ressources_materielles?.categories_ressources && data.ressources_materielles.categories_ressources.length > 0 ? (
                  data.ressources_materielles.categories_ressources.map((categoryObject: any, index: number) => (
                    <div key={index}>
                      {renderResourceCategory(categoryObject, openSubCategories, setOpenSubCategories)}
                    </div>
                  ))
                ) : (
                  <p>Aucune ressource matérielle trouvée.</p>
                )}
              </div>
            )}

            {selectedCategory === 'humaines' && (
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-4">Ressources humaines</h3>
                {data?.ressources_humaines?.categories_ressources && data.ressources_humaines.categories_ressources.length > 0 ? (
                  data.ressources_humaines.categories_ressources.map((categoryObject: any, index: number) => (
                    <div key={index}>
                      {renderResourceCategory(categoryObject, openSubCategories, setOpenSubCategories)}
                    </div>
                  ))
                ) : (
                  <p>Aucune ressource humaine trouvée.</p>
                )}
              </div>
            )}

            {selectedCategory === 'techniques' && (
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-4">Ressources techniques</h3>
                {data?.ressources_techniques?.categories_ressources && data.ressources_techniques.categories_ressources.length > 0 ? (
                  data.ressources_techniques.categories_ressources.map((categoryObject: any, index: number) => (
                    <div key={index}>
                      {renderResourceCategory(categoryObject, openSubCategories, setOpenSubCategories)}
                    </div>
                  ))
                ) : (
                  <p>Aucune ressource technique trouvée.</p>
                )}
              </div>
            )}

            <button
              className="sticky top-0 right-4 float-right mb-4 bg-white/90 backdrop-blur-sm text-gray-400 hover:text-gray-600 rounded-full p-2 shadow-md border z-10"
              onClick={handlePopupClose}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
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

export default AnalyseDesRessourcesLivrable;
