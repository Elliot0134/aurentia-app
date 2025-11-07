import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { supabase } from '../../integrations/supabase/client';
import HarmonizedDeliverableCard from './shared/HarmonizedDeliverableCard';
import HarmonizedDeliverableModal from './shared/HarmonizedDeliverableModal';
import { useHarmonizedModal } from './shared/useHarmonizedModal';
import { useDeliverableWithComments } from '@/hooks/useDeliverableWithComments';
import DeliverableCardSkeleton from './shared/DeliverableCardSkeleton';
import { useDeliverablesLoading } from '@/contexts/DeliverablesLoadingContext';
import { DefinitionContent } from './shared/DefinitionContent';

const AnalyseDesRessourcesLivrable: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { isGlobalLoading, registerDeliverable, setDeliverableLoaded } = useDeliverablesLoading();

  // Register this deliverable on mount
  useEffect(() => {
    registerDeliverable('analyse-ressources');
  }, [registerDeliverable]);
  const [error, setError] = useState<string | null>(null);
  const [openSubCategories, setOpenSubCategories] = useState<Record<string, boolean>>({});
  const [selectedCategory, setSelectedCategory] = useState<string | null>('materielles');

  const deliverableTitle = "Ressources requises";
  const deliverableDescription = "Identification et planification des ressources nécessaires au projet";
  const deliverableDefinition = <DefinitionContent deliverableType="ressources_requises" />;

  // Utilisation du hook harmonisé pour la modal
  const { isPopupOpen, handleTemplateClick, handlePopupClose } = useHarmonizedModal({
    hasContent: true,
    hasDefinition: true
  });

  // Initialize deliverable for comments
  const { deliverableId, organizationId } = useDeliverableWithComments({
    projectId: projectId || '',
    deliverableType: 'other',
    deliverableTitle: 'Analyse des Ressources',
  });

  // Fonction utilitaire pour parser les données JSON avec gestion d'erreurs
  const parseJsonData = (jsonString: string | null) => {
    if (!jsonString) return { categories_ressources: [] };
    
    try {
      const parsed = JSON.parse(jsonString);
      console.log("Parsed JSON structure:", parsed);
      
      // Gérer la structure imbriquée output.agent_response.categories_ressources
      if (parsed.output && parsed.output.agent_response && parsed.output.agent_response.categories_ressources) {
        return { categories_ressources: parsed.output.agent_response.categories_ressources };
      }
      
      // Gérer la structure directe categories_ressources
      if (parsed.categories_ressources) {
        return { categories_ressources: parsed.categories_ressources };
      }
      
      // Si aucune structure reconnue
      console.warn("Structure JSON non reconnue:", parsed);
      return { categories_ressources: [] };
    } catch (error) {
      console.error("Erreur lors du parsing JSON:", error);
      return { categories_ressources: [] };
    }
  };

  useEffect(() => {
    console.log("AnalyseDesRessourcesLivrable: useEffect triggered");
    const fetchData = async () => {
      if (!projectId) {
        setError("Project ID not found in URL.");
        setLoading(false);
        setDeliverableLoaded('analyse-ressources');
        console.log("AnalyseDesRessourcesLivrable: Project ID not found.");
        return;
      }

      try {
        const { data: ressourcesData, error } = await supabase
          .from('ressources_requises')
          .select('*, avis')
          .eq('project_id', projectId)
          .single();

        if (error) {
          // Check if the error is specifically for no rows found
          if (error.code === 'PGRST116') { // PGRST116 is the error code for "No rows found"
            console.log("AnalyseDesRessourcesLivrable: No data found for project ID (PGRST116 error):", projectId);
            setData(null); // Set data to null to trigger the "no data" display
            setError(null); // Clear any previous error state
          } else {
            // For other types of errors, set the error state
            setError(error.message || "An unknown error occurred while fetching data.");
            console.error("AnalyseDesRessourcesLivrable: Fetch error:", error);
          }
        } else if (!ressourcesData) { // This case might not be hit if single() always errors on no data
          console.log("AnalyseDesRessourcesLivrable: No data found for project ID (ressourcesData is null):", projectId);
          setData(null);
          setError(null); // Clear error if data is explicitly null
        } else {
          console.log("AnalyseDesRessourcesLivrable: Raw data from Supabase:", ressourcesData);
          
          // Parse JSON columns avec la nouvelle fonction
          const parsedData = {
            ...ressourcesData,
            ressources_materielles: parseJsonData(ressourcesData.ressources_materielles),
            ressources_humaines: parseJsonData(ressourcesData.ressources_humaines),
            ressources_techniques: parseJsonData(ressourcesData.ressources_techniques),
          };
          
          setData(parsedData);
          console.log("AnalyseDesRessourcesLivrable: Parsed data:", parsedData);
        }
      } catch (err: any) {
        setError(err.message || "An unknown error occurred while fetching data.");
        console.error("AnalyseDesRessourcesLivrable: Fetch error:", err);
      } finally {
        setLoading(false);
        setDeliverableLoaded('analyse-ressources');
        console.log("AnalyseDesRessourcesLivrable: Loading finished.");
      }
    };

    fetchData();
  }, [projectId]);

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

  // Show skeleton while global loading OR individual loading
  if (isGlobalLoading || loading) {
    return <DeliverableCardSkeleton />;
  }

  if (error) {
    console.log("AnalyseDesRessourcesLivrable: Rendering Error state.");
    return <div>Erreur: {error}</div>;
  }

  // Vérifier si des données sont disponibles avec une vérification plus robuste
  const hasResourceData = data && (
    (data.ressources_materielles?.categories_ressources && data.ressources_materielles.categories_ressources.length > 0) ||
    (data.ressources_humaines?.categories_ressources && data.ressources_humaines.categories_ressources.length > 0) ||
    (data.ressources_techniques?.categories_ressources && data.ressources_techniques.categories_ressources.length > 0)
  );

  // Contenu spécifique avec sélecteur de catégories de ressources
  const ressourcesContent = hasResourceData ? (
    <>
      <ToggleGroup type="single" value={selectedCategory} onValueChange={setSelectedCategory} className="flex-row mb-4 mt-4 justify-start">
        <ToggleGroupItem
          value="materielles"
          aria-label="Toggle matérielles"
          className={`px-3 py-1 text-sm mr-2 ${selectedCategory === 'materielles' ? 'bg-aurentia-orange-aurentia text-white' : 'bg-gray-200'}`}
        >
          <span className={selectedCategory === 'materielles' ? 'text-white' : ''}>Ressources matérielles</span>
        </ToggleGroupItem>
        <ToggleGroupItem
          value="humaines"
          aria-label="Toggle humaines"
          className={`px-3 py-1 text-sm mr-2 ${selectedCategory === 'humaines' ? 'bg-aurentia-orange-aurentia text-white' : 'bg-gray-200'}`}
        >
          <span className={selectedCategory === 'humaines' ? 'text-white' : ''}>Ressources humaines</span>
        </ToggleGroupItem>
        <ToggleGroupItem
          value="techniques"
          aria-label="Toggle techniques"
          className={`px-3 py-1 text-sm mr-2 ${selectedCategory === 'techniques' ? 'bg-aurentia-orange-aurentia text-white' : 'bg-gray-200'}`}
        >
          <span className={selectedCategory === 'techniques' ? 'text-white' : ''}>Ressources techniques</span>
        </ToggleGroupItem>
      </ToggleGroup>

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
    </>
  ) : (
    <p className="mt-4">Aucune donnée de ressource disponible pour ce projet.</p>
  );

  return (
    <>
      {/* Utilisation de la carte harmonisée */}
      <HarmonizedDeliverableCard
        title={deliverableTitle}
        description={deliverableDescription}
        avis={data?.avis || 'Commentaire'}
        iconSrc="/icones-livrables/ressources-icon.png"
        onClick={handleTemplateClick}
      />

      {/* Utilisation de la modal harmonisée */}
      <HarmonizedDeliverableModal
        isOpen={isPopupOpen}
        onClose={handlePopupClose}
        title={deliverableTitle}
        iconComponent={<img src="/icones-livrables/ressources-icon.png" alt="Ressources Icon" className="w-full h-full object-contain" />}
        contentComponent={ressourcesContent}
        definition={deliverableDefinition}
        showContentTab={true}
        showCommentsTab={true}
        deliverableId={deliverableId || undefined}
        organizationId={organizationId || undefined}
        modalWidthClass="md:w-[90%]"
      />
    </>
  );
};

export default AnalyseDesRessourcesLivrable;
