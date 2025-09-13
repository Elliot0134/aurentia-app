import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import HarmonizedDeliverableCard from './shared/HarmonizedDeliverableCard';
import HarmonizedDeliverableModal from './shared/HarmonizedDeliverableModal';
import { useHarmonizedModal } from './shared/useHarmonizedModal';

interface LivrableProps {
  title?: string;
  description?: string;
  children?: React.ReactNode;
  textColor?: string;
  buttonColor?: string;
}

const BusinessModelLivrable: React.FC<LivrableProps> = ({
  title = "Business Model Canvas",
  description,
  children,
  textColor,
  buttonColor,
}) => {
  const definition = "Le Business Model Canvas est un outil stratégique qui permet de visualiser et structurer les éléments clés d'un modèle d'affaires, incluant la proposition de valeur, les segments clients, les ressources et la structure financière.";
  const importance = "Essentiel pour définir comment l'entreprise crée, délivre et capture de la valeur. Il fournit une vision globale et cohérente du modèle économique et identifie les leviers de croissance.";
  
  const [businessModelData, setBusinessModelData] = useState<any & { avis: string | null }>(null);
  const [showStructureCoutsAnalyse, setShowStructureCoutsAnalyse] = useState(true);
  const [showSourcesRevenusAnalyse, setShowSourcesRevenusAnalyse] = useState(true);
  const { projectId } = useParams<{ projectId: string }>();

  // Utilisation du hook harmonisé pour la modal
  const { isPopupOpen, handleTemplateClick, handlePopupClose } = useHarmonizedModal({
    hasContent: true,
    hasDefinition: true
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!projectId) return;

      const { data, error } = await supabase
        .from('business_model')
        .select('*') // Removed 'avis'
        .eq('project_id', projectId)
        .single();

      if (error) {
        console.error('Error fetching business model data:', error);
        setBusinessModelData(null); // Ensure data is null on error
      } else {
        console.log("Fetched business_model data:", data);
        setBusinessModelData(data);
      }
    };

    fetchData();
  }, [projectId]);

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
            setBusinessModelData(null); // Ensure data is null on error
          } else {
            console.log("Refreshed business_model data:", data);
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

  // Contenu spécifique du Business Model Canvas
  const businessModelContent = (
    <>
      {/* Business Model Canvas Layout */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4">
        {/* Row 1 */}
        <div className="col-span-1 md:col-span-1 md:row-span-2 bg-gray-100 p-2 rounded-lg shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <img src="/icones-livrables/business-model-icon.png" alt="Business Model Icon" className="w-6 h-6 object-cover" />
            <h4 className="text-base font-black">Partenaires clés</h4>
          </div>
          <ul className="list-disc list-inside">
            {businessModelData?.partenaires_cles?.split('\n').map((line: string, index: number) => {
              const cleanedLine = line.startsWith('- ') ? line.substring(2) : line;
              return (
                <li key={index} className="text-[#4B5563] text-sm mb-1">{cleanedLine}</li>
              );
            })}
          </ul>
        </div>
        <div className="col-span-1 md:col-span-1 bg-gray-100 p-2 rounded-lg shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <img src="/icones-livrables/business-model-icon.png" alt="Business Model Icon" className="w-6 h-6 object-cover" />
            <h4 className="text-base font-black">Activités clés</h4>
          </div>
          <ul className="list-disc list-inside">
            {businessModelData?.activites_cles?.split('\n').map((line: string, index: number) => {
              const cleanedLine = line.startsWith('- ') ? line.substring(2) : line;
              return (
                <li key={index} className="text-[#4B5563] text-sm mb-1">{cleanedLine}</li>
              );
            })}
          </ul>
        </div>
        <div className="col-span-1 md:col-span-1 bg-gray-100 p-2 rounded-lg shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <img src="/icones-livrables/business-model-icon.png" alt="Business Model Icon" className="w-6 h-6 object-cover" />
            <h4 className="text-base font-black">Proposition de valeur</h4>
          </div>
          {businessModelData?.proposition_valeur?.split('\n').map((line: string, index: number) => {
            const cleanedLine = line.startsWith('- ') ? line.substring(2) : line;
            return (
              <p key={index} className="text-[#4B5563] text-sm mb-1">{cleanedLine}</p>
            );
          })}
        </div>
        <div className="col-span-1 md:col-span-1 bg-gray-100 p-2 rounded-lg shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <img src="/icones-livrables/business-model-icon.png" alt="Business Model Icon" className="w-6 h-6 object-cover" />
            <h4 className="text-base font-black">Relations clients</h4>
          </div>
          {businessModelData?.relations_clients?.split('\n').map((line: string, index: number) => (
            <p key={index} className="text-[#4B5563] text-sm mb-1">{line}</p>
          ))}
        </div>
        <div className="col-span-1 md:col-span-1 md:row-span-2 bg-gray-100 p-2 rounded-lg shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <img src="/icones-livrables/business-model-icon.png" alt="Business Model Icon" className="w-6 h-6 object-cover" />
            <h4 className="text-base font-black">Segments de clients</h4>
          </div>
          <ul className="list-disc list-inside">
            {businessModelData?.segments_clients?.split('\n').map((line: string, index: number) => {
              const cleanedLine = line.startsWith('- ') ? line.substring(2) : line;
              return (
                <li key={index} className="text-[#4B5563] text-sm mb-1">{cleanedLine}</li>
              );
            })}
          </ul>
        </div>

        {/* Row 2 */}
        <div className="col-span-1 md:col-span-2 bg-gray-100 p-2 rounded-lg shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <img src="/icones-livrables/business-model-icon.png" alt="Business Model Icon" className="w-6 h-6 object-cover" />
            <h4 className="text-base font-black">Ressources clés</h4>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            {/* Humaines */}
            <div className="col-span-1 border-b lg:border-b-0 lg:border-r border-gray-300 pb-2 lg:pb-0 lg:pr-2">
              <h5 className="text-sm font-black mb-1">Humaines:</h5>
              <ul className="list-disc list-inside">
                {businessModelData?.ressources_humaines?.split('\n').map((line: string, index: number) => {
                  const cleanedLine = line.startsWith('- ') ? line.substring(2) : line;
                  return (
                    <li key={index} className="text-[#4B5563] text-sm mb-1">{cleanedLine}</li>
                  );
                })}
              </ul>
            </div>
            {/* Financières */}
            <div className="col-span-1 border-b lg:border-b-0 pb-2 lg:pb-0 lg:pl-2">
              <h5 className="text-sm font-black mb-1">Financières:</h5>
              <ul className="list-disc list-inside">
                {businessModelData?.ressources_financieres?.split('\n').map((line: string, index: number) => {
                  const cleanedLine = line.startsWith('- ') ? line.substring(2) : line;
                  return (
                    <li key={index} className="text-[#4B5563] text-sm mb-1">{cleanedLine}</li>
                  );
                })}
              </ul>
            </div>
            {/* Diviseur horizontal en desktop uniquement */}
            <div className="hidden lg:block lg:col-span-2">
              <hr className="my-2 border-gray-300" />
            </div>
            {/* Matérielles */}
            <div className="col-span-1 border-b lg:border-b-0 lg:border-r border-gray-300 pb-2 lg:pb-0 lg:pr-2">
              <h5 className="text-sm font-black mb-1">Matérielles:</h5>
              <ul className="list-disc list-inside">
                {businessModelData?.ressources_materielles?.split('\n').map((line: string, index: number) => {
                  const cleanedLine = line.startsWith('- ') ? line.substring(2) : line;
                  return (
                    <li key={index} className="text-[#4B5563] text-sm mb-1">{cleanedLine}</li>
                  );
                })}
              </ul>
            </div>
            {/* Intellectuelles */}
            <div className="col-span-1 lg:pl-2">
              <h5 className="text-sm font-black mb-1">Intellectuelles:</h5>
              <ul className="list-disc list-inside">
                {businessModelData?.ressources_intellectuelles?.split('\n').map((line: string, index: number) => {
                  const cleanedLine = line.startsWith('- ') ? line.substring(2) : line;
                  return (
                    <li key={index} className="text-[#4B5563] text-sm mb-1">{cleanedLine}</li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
        <div className="col-span-1 md:col-span-1 bg-gray-100 p-2 rounded-lg shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <img src="/icones-livrables/business-model-icon.png" alt="Business Model Icon" className="w-6 h-6 object-cover" />
            <h4 className="text-base font-black">Canaux de distribution</h4>
          </div>
          <ul className="list-disc list-inside">
            {businessModelData?.canaux?.split('\n').map((line: string, index: number) => {
              const cleanedLine = line.startsWith('- ') ? line.substring(2) : line;
              return (
                <li key={index} className="text-[#4B5563] text-sm mb-1">{cleanedLine}</li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Row 3 - Structure des coûts and Sources de revenus */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="col-span-1 bg-gray-100 p-2 rounded-lg shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <img src="/icones-livrables/business-model-icon.png" alt="Business Model Icon" className="w-6 h-6 object-cover" />
            <h4 className="text-base font-black">Structure des coûts</h4>
          </div>
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
                  <p key={index} className="text-[#4B5563] whitespace-pre-wrap text-sm mb-1">{cleanedLine}</p>
                );
              })}
            </div>
          )}
          <ul className="list-disc list-inside">
            {businessModelData?.structure_couts_liste_des_couts?.split('\n').map((line: string, index: number) => {
              const cleanedLine = line.startsWith('- ') ? line.substring(2) : line;
              return (
                <li key={index} className="text-[#4B5563] whitespace-pre-wrap text-sm mb-1">{cleanedLine}</li>
              );
            })}
          </ul>
        </div>
        <div className="col-span-1 bg-gray-100 p-2 rounded-lg shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <img src="/icones-livrables/market-icon.png" alt="Market Icon" className="w-6 h-6 object-cover" />
            <h4 className="text-base font-black">Sources de revenus</h4>
          </div>
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
                  <p key={index} className="text-[#4B5563] whitespace-pre-wrap text-sm mb-1">{cleanedLine}</p>
                );
              })}
            </div>
          )}
          <ul className="list-disc list-inside">
            {businessModelData?.flux_revenus_liste_des_revenus?.split('\n').map((line: string, index: number) => {
              const cleanedLine = line.startsWith('- ') ? line.substring(2) : line;
              return (
                <li key={index} className="text-[#4B5563] whitespace-pre-wrap text-sm mb-1">{cleanedLine}</li>
              );
            })}
          </ul>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Utilisation de la carte harmonisée */}
      <HarmonizedDeliverableCard
        title={title}
        description={description}
        avis={businessModelData?.avis || 'Commentaire'}
        iconSrc="/icones-livrables/business-model-icon.png"
        onClick={handleTemplateClick}
      />

      {/* Utilisation de la modal harmonisée */}
      <HarmonizedDeliverableModal
        isOpen={isPopupOpen}
        onClose={handlePopupClose}
        title={title}
        iconSrc="/icones-livrables/business-model-icon.png"
        contentComponent={businessModelContent}
        definition={definition}
        importance={importance}
        showContentTab={true}
        modalWidthClass="md:w-[90%]"
      />
    </>
  );
};

export default BusinessModelLivrable;
