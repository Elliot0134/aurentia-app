import React, { useState, useEffect } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import HarmonizedDeliverableCard from './shared/HarmonizedDeliverableCard';
import HarmonizedDeliverableModal from './shared/HarmonizedDeliverableModal';
import { useHarmonizedModal } from './shared/useHarmonizedModal';
import { useDeliverableWithComments } from '@/hooks/useDeliverableWithComments';

interface AnalyseDeLaConcurrenceData {
  free_direct_definition: string;
  free_direct_importance: string;
  free_indirect_definition: string;
  free_indirect_importance: string;
  free_potentiel_definition: string;
  free_potentiel_importance: string;
  free_segmentation_concurrentielle: string;
  free_critere_differentiation_1: string;
  free_critere_differentiation_2: string;
  free_critere_differentiation_3: string;
  concurrent_1_nom: string;
  concurrent_1_description: string;
  concurrent_1_url: string;
  concurrent_1_forces: string;
  concurrent_1_faiblesses: string;
  concurrent_1_caracteristiques: string;
  concurrent_2_nom: string;
  concurrent_2_description: string;
  concurrent_2_url: string;
  concurrent_2_forces: string;
  concurrent_2_faiblesses: string;
  concurrent_2_caracteristiques: string;
  concurrent_3_nom: string;
  concurrent_3_description: string;
  concurrent_3_url: string;
  concurrent_3_forces: string;
  concurrent_3_faiblesses: string;
  concurrent_3_caracteristiques: string;
  concurrent_4_nom: string;
  concurrent_4_description: string;
  concurrent_4_url: string;
  concurrent_4_forces: string;
  concurrent_4_faiblesses: string;
  concurrent_4_caracteristiques: string;
  concurrent_5_nom: string;
  concurrent_5_description: string;
  concurrent_5_url: string;
  concurrent_5_forces: string;
  concurrent_5_faiblesses: string;
  concurrent_5_caracteristiques: string;
  concurrent_6_nom: string;
  concurrent_6_description: string;
  concurrent_6_url: string;
  concurrent_6_forces: string;
  concurrent_6_faiblesses: string;
  concurrent_6_caracteristiques: string;
  concurrent_7_nom: string;
  concurrent_7_description: string;
  concurrent_7_url: string;
  concurrent_7_forces: string;
  concurrent_7_faiblesses: string;
  concurrent_7_caracteristiques: string;
  concurrent_8_nom: string;
  concurrent_8_description: string;
  concurrent_8_url: string;
  concurrent_8_forces: string;
  concurrent_8_faiblesses: string;
  concurrent_8_caracteristiques: string;
  recommandations: string;
  avis: string;
  justification_avis: string;
}

interface AnalyseDeLaConcurrenceLivrableProps {
  projectStatus?: string | null;
}

const AnalyseDeLaConcurrenceLivrable: React.FC<AnalyseDeLaConcurrenceLivrableProps> = ({ projectStatus }) => {
  const [concurrenceData, setConcurrenceData] = useState<AnalyseDeLaConcurrenceData | null>(null);
  const [activeDefinition, setActiveDefinition] = useState<'direct' | 'indirect' | 'potentiel'>('direct');
  const [activeCompetitor, setActiveCompetitor] = useState<'principal' | 'secondaire' | 'concurrent3' | 'concurrent4' | 'concurrent5' | 'concurrent6' | 'concurrent7' | 'concurrent8'>('principal');
  const { projectId } = useParams<{ projectId: string }>();

  const deliverableColor = "#6191e2";
  const title = "Concurrence";
  const description = projectStatus === 'free' 
    ? 'Analyse concurrentielle de votre projet (forces et faiblesses des concurrents) + site web'
    : concurrenceData?.justification_avis;
  const definition = "L'analyse de la concurrence est une étude stratégique qui permet d'identifier et d'analyser les entreprises qui opèrent sur le même marché, offrent des produits ou services similaires, ou ciblent la même clientèle.\n\n**Importance :** Cette analyse est cruciale pour positionner efficacement l'entreprise sur son marché, identifier les opportunités de différenciation, anticiper les menaces concurrentielles et développer des stratégies marketing et commerciales adaptées.";

  // Utilisation du hook harmonisé pour la modal
  const { isPopupOpen, handleTemplateClick, handlePopupClose } = useHarmonizedModal({
    hasContent: true,
    hasRecommendations: !!concurrenceData?.recommandations,
    hasDefinition: true
  });

  // Initialize deliverable for comments
  const { deliverableId, organizationId } = useDeliverableWithComments({
    projectId: projectId || '',
    deliverableType: 'market-analysis',
    deliverableTitle: 'Analyse de la Concurrence',
  });

  useEffect(() => {
    const fetchData = async () => {
      if (projectId) {
        const { data, error } = await supabase
          .from('concurrence')
          .select('*')
          .eq('project_id', projectId)
          .single();

        if (error) {
          console.error('Error fetching concurrence data:', error);
        } else {
          setConcurrenceData(data);
        }
      }
    };

    fetchData();
  }, [projectId]);

  // Listen for deliverables refresh event
  useEffect(() => {
    const handleRefreshDeliverables = (event: CustomEvent) => {
      const { projectId: refreshProjectId } = event.detail;
      if (refreshProjectId === projectId) {
        console.log('🔄 Refreshing AnalyseDeLaConcurrenceLivrable data...');
        const fetchData = async () => {
          if (projectId) {
            const { data, error } = await supabase
              .from('concurrence')
              .select('*')
              .eq('project_id', projectId)
              .single();

            if (error) {
              console.error('Error fetching concurrence data:', error);
            } else {
              setConcurrenceData(data);
            }
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

  const formatRecommendationText = (text: string | null | undefined): JSX.Element | null => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return (
      <>
        {parts.map((part, index) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index}>{part.substring(2, part.length - 2)}</strong>;
          }
          return part;
        })}
      </>
    );
  };

  // Contenu spécifique de l'analyse de la concurrence
  const concurrenceContent = (
    <>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="definition-concurrents">
          <AccordionTrigger className="text-lg">Définition des concurrents</AccordionTrigger>
          <AccordionContent>
            <div className="flex gap-2 mb-4">
              <button
                className={`text-xs px-2 py-1 rounded-full cursor-pointer ${
                  activeDefinition === 'direct'
                    ? 'text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
                style={activeDefinition === 'direct' ? { backgroundColor: deliverableColor } : {}}
                onClick={() => setActiveDefinition('direct')}
              >
                Concurrents direct
              </button>
              <button
                className={`text-xs px-2 py-1 rounded-full cursor-pointer ${
                  activeDefinition === 'indirect'
                    ? 'text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
                style={activeDefinition === 'indirect' ? { backgroundColor: deliverableColor } : {}}
                onClick={() => setActiveDefinition('indirect')}
              >
                Concurrence indirecte
              </button>
              <button
                className={`text-xs px-2 py-1 rounded-full cursor-pointer ${
                  activeDefinition === 'potentiel'
                    ? 'text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
                style={activeDefinition === 'potentiel' ? { backgroundColor: deliverableColor } : {}}
                onClick={() => setActiveDefinition('potentiel')}
              >
                Concurrents potentiels
              </button>
            </div>

            {activeDefinition === 'direct' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4 md:mb-0">
                  <h4 className="text-sm font-semibold mb-2">Définition</h4>
                  <p className="text-[#4B5563]">{concurrenceData?.free_direct_definition}</p>
                </div>
                <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4 md:mb-0">
                  <h4 className="text-sm font-semibold mb-2">Importance</h4>
                  <p className="text-[#4B5563]">{concurrenceData?.free_direct_importance}</p>
                </div>
              </div>
            )}

            {activeDefinition === 'indirect' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4 md:mb-0">
                  <h4 className="text-sm font-semibold mb-2">Définition</h4>
                  <p className="text-[#4B5563]">{concurrenceData?.free_indirect_definition}</p>
                </div>
                <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4 md:mb-0">
                  <h4 className="text-sm font-semibold mb-2">Importance</h4>
                  <p className="text-[#4B5563]">{concurrenceData?.free_potentiel_importance}</p>
                </div>
              </div>
            )}

            {activeDefinition === 'potentiel' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4 md:mb-0">
                  <h4 className="text-sm font-semibold mb-2">Définition</h4>
                  <p className="text-[#4B5563]">{concurrenceData?.free_potentiel_definition}</p>
                </div>
                <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4 md:mb-0">
                  <h4 className="text-sm font-semibold mb-2">Importance</h4>
                  <p className="text-[#4B5563]">{concurrenceData?.free_potentiel_importance}</p>
                </div>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="concurrents">
          <AccordionTrigger className="text-lg">Concurrents</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-wrap gap-2 mb-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => {
                const competitorKey = num === 1 ? 'principal' : num === 2 ? 'secondaire' : `concurrent${num}`;
                const competitorName = concurrenceData?.[`concurrent_${num}_nom`] || `Concurrent ${num === 1 ? 'Principal' : num === 2 ? 'Secondaire' : num}`;
                
                return (
                  <button
                    key={num}
                    className={`text-xs px-2 py-1 rounded-full cursor-pointer ${
                      activeCompetitor === competitorKey
                        ? 'text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                    style={activeCompetitor === competitorKey ? { backgroundColor: deliverableColor } : {}}
                    onClick={() => setActiveCompetitor(competitorKey as any)}
                  >
                    {competitorName}
                  </button>
                );
              })}
            </div>

            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => {
              const competitorKey = num === 1 ? 'principal' : num === 2 ? 'secondaire' : `concurrent${num}`;
              const isActive = activeCompetitor === competitorKey;
              
              if (!isActive) return null;
              
              return (
                <div key={num}>
                  <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                    <h4 className="text-sm font-semibold mb-2">Description</h4>
                    <p className="text-[#4B5563]">{concurrenceData?.[`concurrent_${num}_description`]}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#E8F7DF] rounded-md px-4 pb-4 pt-4 mb-4 md:mb-0">
                      <h4 className="text-sm font-semibold mb-2 text-black">Forces</h4>
                      <p className="text-[#4B5563]">{concurrenceData?.[`concurrent_${num}_forces`]}</p>
                    </div>
                    <div className="bg-[#FFDFDF] rounded-md px-4 pb-4 pt-4 mb-4 md:mb-0">
                      <h4 className="text-sm font-semibold mb-2 text-black">Faiblesses</h4>
                      <p className="text-[#4B5563]">{concurrenceData?.[`concurrent_${num}_faiblesses`]}</p>
                    </div>
                  </div>
                  <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4 mt-4">
                    <h4 className="text-sm font-semibold mb-2">Caractéristiques</h4>
                    <p className="text-[#4B5563]">{concurrenceData?.[`concurrent_${num}_caracteristiques`]}</p>
                  </div>
                  <div className="mt-4">
                    <a
                      href={concurrenceData?.[`concurrent_${num}_url`]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center bg-[#6191e2] text-white py-2 px-4 rounded-md hover:bg-[#4a7acb] transition-colors duration-200 flex items-center justify-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
                        <path d="M2 12h20"></path>
                      </svg>
                      Site web
                    </a>
                  </div>
                </div>
              );
            })}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="strategie-differentiation">
          <AccordionTrigger className="text-lg">Stratégie de Différenciation</AccordionTrigger>
          <AccordionContent>
            <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
              <h4 className="text-sm font-semibold mb-2">Segmentation concurrentielle</h4>
              <p className="text-[#4B5563]">{concurrenceData?.free_segmentation_concurrentielle}</p>
            </div>
            <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
              <h4 className="text-sm font-semibold mb-2">Premier critère de différenciation</h4>
              <p className="text-[#4B5563]">{concurrenceData?.free_critere_differentiation_1}</p>
            </div>
            <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
              <h4 className="text-sm font-semibold mb-2">Deuxième critère de différenciation</h4>
              <p className="text-[#4B5563]">{concurrenceData?.free_critere_differentiation_2}</p>
            </div>
            <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
              <h4 className="text-sm font-semibold mb-2">Troisième critère de différenciation</h4>
              <p className="text-[#4B5563]">{concurrenceData?.free_critere_differentiation_3}</p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  );

  return (
    <>
      {/* Utilisation de la carte harmonisée */}
      <HarmonizedDeliverableCard
        title={title}
        description={description}
        avis={projectStatus === 'free' ? 'commentaire' : concurrenceData?.avis || 'Commentaire'}
        iconSrc="/icones-livrables/concurrence-icon.png"
        onClick={handleTemplateClick}
      />

      {/* Utilisation de la modal harmonisée */}
      <HarmonizedDeliverableModal
        isOpen={isPopupOpen}
        onClose={handlePopupClose}
        title="Analyse de la Concurrence"
        iconComponent={<img src="/icones-livrables/concurrence-icon.png" alt="Concurrence Icon" className="w-full h-full object-contain" />}
        contentComponent={concurrenceContent}
        recommendations={concurrenceData?.recommandations}
        definition={definition}
        showContentTab={true}
        showCommentsTab={true}
        deliverableId={deliverableId || undefined}
        organizationId={organizationId || undefined}
      />
    </>
  );
};

export default AnalyseDeLaConcurrenceLivrable;
