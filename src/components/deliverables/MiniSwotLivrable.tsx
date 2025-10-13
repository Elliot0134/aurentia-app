import React, { useState, useEffect } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { useParams } from 'react-router-dom';
import HarmonizedDeliverableCard from './shared/HarmonizedDeliverableCard';
import HarmonizedDeliverableModal from './shared/HarmonizedDeliverableModal';
import { useHarmonizedModal } from './shared/useHarmonizedModal';
import { useDeliverableWithComments } from '@/hooks/useDeliverableWithComments';

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
  const [swotData, setSwotData] = useState<MiniSwotData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { projectId } = useParams<{ projectId: string }>();

  // Utilisation du hook harmonisé pour la modal
  const { isPopupOpen, handleTemplateClick, handlePopupClose } = useHarmonizedModal({
    hasContent: true,
    hasRecommendations: true,
    hasDefinition: true
  });

  // Initialize deliverable for comments
  const { deliverableId, organizationId } = useDeliverableWithComments({
    projectId: projectId || '',
    deliverableType: 'other',
    deliverableTitle: 'Mini SWOT',
  });

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

  const title = "Mini SWOT";
  const description = "Analyse stratégique simplifiée des forces, faiblesses, opportunités et menaces";
  const definition = "Le Mini SWOT est une version condensée de l'analyse SWOT traditionnelle qui permet d'identifier rapidement les facteurs internes (forces et faiblesses) et externes (opportunités et menaces) qui peuvent influencer le succès d'un projet d'entreprise";
  const importance = "Cette analyse est cruciale pour comprendre l'environnement concurrentiel et les capacités internes de l'entreprise, permettant ainsi de définir une stratégie adaptée et de prendre des décisions éclairées";
  const color = "#22c55e";

  // Contenu spécifique du Mini SWOT
  const swotContent = (
    <>
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
    </>
  );

  return (
    <>
      {/* Utilisation de la carte harmonisée */}
      <HarmonizedDeliverableCard
        title={title}
        description={swotData?.justification_avis}
        avis={swotData?.avis || 'Commentaire'}
        iconSrc="/icones-livrables/market-icon.png"
        onClick={handleTemplateClick}
      />

      {/* Utilisation de la modal harmonisée */}
      <HarmonizedDeliverableModal
        isOpen={isPopupOpen}
        onClose={handlePopupClose}
        title={title}
        iconComponent={<img src="/icones-livrables/market-icon.png" alt="Mini SWOT Icon" className="w-full h-full object-contain" />}
        contentComponent={swotContent}
        recommendations={swotData?.recommandations} // Passer directement la chaîne de caractères
        definition={definition}
        importance={importance}
        showContentTab={true}
        showCommentsTab={true}
        deliverableId={deliverableId || undefined}
        organizationId={organizationId || undefined}
      />
    </>
  );
};

export default MiniSwotLivrable;
