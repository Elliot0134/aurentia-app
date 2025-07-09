import React, { useState, useEffect } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import DeliverableCard from './DeliverableCard';

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
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [showDefinitionPlaceholder, setShowDefinitionPlaceholder] = useState(false);
  const [showRecommendationPlaceholder, setShowRecommendationPlaceholder] = useState(false);
  const [concurrenceData, setConcurrenceData] = useState<AnalyseDeLaConcurrenceData | null>(null);
  const [activeDefinition, setActiveDefinition] = useState<'direct' | 'indirect' | 'potentiel'>('direct');
  const [activeCompetitor, setActiveCompetitor] = useState<'principal' | 'secondaire' | 'concurrent3' | 'concurrent4' | 'concurrent5' | 'concurrent6' | 'concurrent7' | 'concurrent8'>('principal');
  const { projectId } = useParams<{ projectId: string }>();

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
  }, [projectId, supabase]);

  // Listen for deliverables refresh event
  useEffect(() => {
    const handleRefreshDeliverables = (event: CustomEvent) => {
      const { projectId: refreshProjectId } = event.detail;
      if (refreshProjectId === projectId) {
        console.log('🔄 Refreshing AnalyseDeLaConcurrenceLivrable data...');
        // Refetch data
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

  const handleTemplateClick = () => {
    setIsPopupOpen(true);
  };

  const handlePopupClose = () => {
    setIsPopupOpen(false);
    setShowDefinitionPlaceholder(false);
    setShowRecommendationPlaceholder(false);
  };

  const deliverableColor = "#6191e2";

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

  return (
    <>
      {/* Livrable Template Part */}
      <div
        className={`border rounded-lg p-4 mb-4 bg-[${deliverableColor}] text-white transition-transform duration-200 hover:-translate-y-1 cursor-pointer flex justify-between`}
        onClick={handleTemplateClick}
      >
        <div className="flex-grow mr-4 flex flex-col">
          <h2 className="text-xl font-bold mb-2">Concurrence</h2>
          <p className="text-white mb-4">
            {projectStatus === 'free'
              ? 'Analyse concurrentielle de votre projet (forces et faiblesses des concurrents) + site web'
              : concurrenceData?.justification_avis}
          </p>
          <div className="flex-grow">
            {/* Children for the template content */}
          </div>
          <div className="flex-shrink-0 mt-auto">
            <button className={`text-xs bg-white text-[#6191e2] px-2 py-1 rounded-full cursor-default pointer-events-none font-bold`}>
              {projectStatus === 'free' ? 'commentaire' : concurrenceData?.avis}
            </button>
          </div>
        </div>
        <div className="flex-shrink-0">
          <img src="/icones-livrables/concurrence-icon.png" alt="Concurrence Icon" className="w-8 h-8 object-cover self-start" />
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
              <h2 className="text-xl font-bold">Analyse de la Concurrence</h2>
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
                    ? `bg-[${deliverableColor}] text-white`
                    : 'bg-gray-200 text-gray-700'
                }`}
                onClick={() => {
                  setShowDefinitionPlaceholder(!showDefinitionPlaceholder);
                  setShowRecommendationPlaceholder(false);
                }}
              >
                Définition & Importance
              </button>
              <button
                className={`text-xs px-2 py-1 rounded-full cursor-pointer ${
                  showRecommendationPlaceholder
                    ? `bg-[${deliverableColor}] text-white`
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
                  <p className="text-[#4B5563]"><strong>Définition :</strong> L'analyse de la concurrence est une étude stratégique qui permet d'identifier et d'analyser les entreprises qui opèrent sur le même marché, offrent des produits ou services similaires, ou ciblent la même clientèle.</p>
                </div>
                <div className="bg-[#F9FAFB] rounded-md p-4">
                  <p className="text-[#4B5563]"><strong>Importance :</strong> Cette analyse est cruciale pour positionner efficacement l'entreprise sur son marché, identifier les opportunités de différenciation, anticiper les menaces concurrentielles et développer des stratégies marketing et commerciales adaptées.</p>
                </div>
              </div>
            </div>

            {showRecommendationPlaceholder && (
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  showRecommendationPlaceholder ? 'max-h-screen' : 'max-h-0'
                } bg-[#F9FAFB] rounded-md p-4`}
              >
                <div className="mt-2">
                  <p className="text-[#4B5563] whitespace-pre-wrap">{formatRecommendationText(concurrenceData?.recommandations)}</p>
                </div>
              </div>
            )}

            <Accordion type="single" collapsible className="w-full">

              <AccordionItem value="definition-concurrents">
                <AccordionTrigger className="text-lg">Définition des concurrents</AccordionTrigger>
                <AccordionContent>
                  <div className="flex gap-2 mb-4">
                    <button
                      className={`text-xs px-2 py-1 rounded-full cursor-pointer ${
                        activeDefinition === 'direct'
                          ? `bg-[${deliverableColor}] text-white`
                          : 'bg-gray-200 text-gray-700'
                      }`}
                      onClick={() => setActiveDefinition('direct')}
                    >
                      Concurrents direct
                    </button>
                    <button
                      className={`text-xs px-2 py-1 rounded-full cursor-pointer ${
                        activeDefinition === 'indirect'
                          ? `bg-[${deliverableColor}] text-white`
                          : 'bg-gray-200 text-gray-700'
                      }`}
                      onClick={() => setActiveDefinition('indirect')}
                    >
                      Concurrence indirecte
                    </button>
                    <button
                      className={`text-xs px-2 py-1 rounded-full cursor-pointer ${
                        activeDefinition === 'potentiel'
                          ? `bg-[${deliverableColor}] text-white`
                          : 'bg-gray-200 text-gray-700'
                      }`}
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
                    <button
                      className={`text-xs px-2 py-1 rounded-full cursor-pointer ${
                        activeCompetitor === 'principal'
                          ? `bg-[${deliverableColor}] text-white`
                          : 'bg-gray-200 text-gray-700'
                      }`}
                      onClick={() => setActiveCompetitor('principal')}
                    >
                      {concurrenceData?.concurrent_1_nom || 'Concurrent Principal'}
                    </button>
                    <button
                      className={`text-xs px-2 py-1 rounded-full cursor-pointer ${
                        activeCompetitor === 'secondaire'
                          ? `bg-[${deliverableColor}] text-white`
                          : 'bg-gray-200 text-gray-700'
                      }`}
                      onClick={() => setActiveCompetitor('secondaire')}
                    >
                      {concurrenceData?.concurrent_2_nom || 'Concurrent Secondaire'}
                    </button>
                    <button
                      className={`text-xs px-2 py-1 rounded-full cursor-pointer ${
                        activeCompetitor === 'concurrent3'
                          ? `bg-[${deliverableColor}] text-white`
                          : 'bg-gray-200 text-gray-700'
                      }`}
                      onClick={() => setActiveCompetitor('concurrent3')}
                    >
                      {concurrenceData?.concurrent_3_nom || 'Concurrent 3'}
                    </button>
                    <button
                      className={`text-xs px-2 py-1 rounded-full cursor-pointer ${
                        activeCompetitor === 'concurrent4'
                          ? `bg-[${deliverableColor}] text-white`
                          : 'bg-gray-200 text-gray-700'
                      }`}
                      onClick={() => setActiveCompetitor('concurrent4')}
                    >
                      {concurrenceData?.concurrent_4_nom || 'Concurrent 4'}
                    </button>
                    <button
                      className={`text-xs px-2 py-1 rounded-full cursor-pointer ${
                        activeCompetitor === 'concurrent5'
                          ? `bg-[${deliverableColor}] text-white`
                          : 'bg-gray-200 text-gray-700'
                      }`}
                      onClick={() => setActiveCompetitor('concurrent5')}
                    >
                      {concurrenceData?.concurrent_5_nom || 'Concurrent 5'}
                    </button>
                    <button
                      className={`text-xs px-2 py-1 rounded-full cursor-pointer ${
                        activeCompetitor === 'concurrent6'
                          ? `bg-[${deliverableColor}] text-white`
                          : 'bg-gray-200 text-gray-700'
                      }`}
                      onClick={() => setActiveCompetitor('concurrent6')}
                    >
                      {concurrenceData?.concurrent_6_nom || 'Concurrent 6'}
                    </button>
                    <button
                      className={`text-xs px-2 py-1 rounded-full cursor-pointer ${
                        activeCompetitor === 'concurrent7'
                          ? `bg-[${deliverableColor}] text-white`
                          : 'bg-gray-200 text-gray-700'
                      }`}
                      onClick={() => setActiveCompetitor('concurrent7')}
                    >
                      {concurrenceData?.concurrent_7_nom || 'Concurrent 7'}
                    </button>
                    <button
                      className={`text-xs px-2 py-1 rounded-full cursor-pointer ${
                        activeCompetitor === 'concurrent8'
                          ? `bg-[${deliverableColor}] text-white`
                          : 'bg-gray-200 text-gray-700'
                      }`}
                      onClick={() => setActiveCompetitor('concurrent8')}
                    >
                      {concurrenceData?.concurrent_8_nom || 'Concurrent 8'}
                    </button>
                  </div>

                  {activeCompetitor === 'principal' && (
                    <>
                      <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                        <h4 className="text-sm font-semibold mb-2">Description</h4>
                        <p className="text-[#4B5563]">{concurrenceData?.concurrent_1_description}</p>
                      </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-[#E8F7DF] rounded-md px-4 pb-4 pt-4 mb-4 md:mb-0">
                            <h4 className="text-sm font-semibold mb-2 text-black">Forces</h4>
                            <p className="text-[#4B5563]">{concurrenceData?.concurrent_1_forces}</p>
                          </div>
                          <div className="bg-[#FFDFDF] rounded-md px-4 pb-4 pt-4 mb-4 md:mb-0">
                            <h4 className="text-sm font-semibold mb-2 text-black">Faiblesses</h4>
                            <p className="text-[#4B5563]">{concurrenceData?.concurrent_1_faiblesses}</p>
                          </div>
                        </div>
                      <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4 mt-4">
                        <h4 className="text-sm font-semibold mb-2">Caractéristiques</h4>
                        <p className="text-[#4B5563]">{concurrenceData?.concurrent_1_caracteristiques}</p>
                      </div>
                      <div className="mt-4">
                        <a
                          href={concurrenceData?.concurrent_1_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full text-center bg-[#6191e2] text-white py-2 px-4 rounded-md hover:bg-[#4a7acb] transition-colors duration-200 flex items-center justify-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
                          Site web
                        </a>
                      </div>
                    </>
                  )}

                  {activeCompetitor === 'secondaire' && (
                    <>
                      <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                        <h4 className="text-sm font-semibold mb-2">Description</h4>
                        <p className="text-[#4B5563]">{concurrenceData?.concurrent_2_description}</p>
                      </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-[#E8F7DF] rounded-md px-4 pb-4 pt-4 mb-4 md:mb-0">
                            <h4 className="text-sm font-semibold mb-2 text-black">Forces</h4>
                            <p className="text-[#4B5563]">{concurrenceData?.concurrent_2_forces}</p>
                          </div>
                          <div className="bg-[#FFDFDF] rounded-md px-4 pb-4 pt-4 mb-4 md:mb-0">
                            <h4 className="text-sm font-semibold mb-2 text-black">Faiblesses</h4>
                            <p className="text-[#4B5563]">{concurrenceData?.concurrent_2_faiblesses}</p>
                          </div>
                        </div>
                      <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4 mt-4">
                        <h4 className="text-sm font-semibold mb-2">Caractéristiques</h4>
                        <p className="text-[#4B5563]">{concurrenceData?.concurrent_2_caracteristiques}</p>
                      </div>
                      <div className="mt-4">
                        <a
                          href={concurrenceData?.concurrent_2_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full text-center bg-[#6191e2] text-white py-2 px-4 rounded-md hover:bg-[#4a7acb] transition-colors duration-200 flex items-center justify-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
                          Site web
                        </a>
                      </div>
                    </>
                  )}

                  {activeCompetitor === 'concurrent3' && (
                    <>
                      <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                        <h4 className="text-sm font-semibold mb-2">Description</h4>
                        <p className="text-[#4B5563]">{concurrenceData?.concurrent_3_description}</p>
                      </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-[#E8F7DF] rounded-md px-4 pb-4 pt-4 mb-4 md:mb-0">
                            <h4 className="text-sm font-semibold mb-2 text-black">Forces</h4>
                            <p className="text-[#4B5563]">{concurrenceData?.concurrent_3_forces}</p>
                          </div>
                          <div className="bg-[#FFDFDF] rounded-md px-4 pb-4 pt-4 mb-4 md:mb-0">
                            <h4 className="text-sm font-semibold mb-2 text-black">Faiblesses</h4>
                            <p className="text-[#4B5563]">{concurrenceData?.concurrent_3_faiblesses}</p>
                          </div>
                        </div>
                      <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4 mt-4">
                        <h4 className="text-sm font-semibold mb-2">Caractéristiques</h4>
                        <p className="text-[#4B5563]">{concurrenceData?.concurrent_3_caracteristiques}</p>
                      </div>
                      <div className="mt-4">
                        <a
                          href={concurrenceData?.concurrent_3_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full text-center bg-[#6191e2] text-white py-2 px-4 rounded-md hover:bg-[#4a7acb] transition-colors duration-200 flex items-center justify-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
                          Site web
                        </a>
                      </div>
                    </>
                  )}

                   {activeCompetitor === 'concurrent4' && (
                    <>
                      <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                        <h4 className="text-sm font-semibold mb-2">Description</h4>
                        <p className="text-[#4B5563]">{concurrenceData?.concurrent_4_description}</p>
                      </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-[#E8F7DF] rounded-md px-4 pb-4 pt-4 mb-4 md:mb-0">
                            <h4 className="text-sm font-semibold mb-2 text-black">Forces</h4>
                            <p className="text-[#4B5563]">{concurrenceData?.concurrent_4_forces}</p>
                          </div>
                          <div className="bg-[#FFDFDF] rounded-md px-4 pb-4 pt-4 mb-4 md:mb-0">
                            <h4 className="text-sm font-semibold mb-2 text-black">Faiblesses</h4>
                            <p className="text-[#4B5563]">{concurrenceData?.concurrent_4_faiblesses}</p>
                          </div>
                        </div>
                      <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4 mt-4">
                        <h4 className="text-sm font-semibold mb-2">Caractéristiques</h4>
                        <p className="text-[#4B5563]">{concurrenceData?.concurrent_4_caracteristiques}</p>
                      </div>
                      <div className="mt-4">
                        <a
                          href={concurrenceData?.concurrent_4_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full text-center bg-[#6191e2] text-white py-2 px-4 rounded-md hover:bg-[#4a7acb] transition-colors duration-200 flex items-center justify-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
                          Site web
                        </a>
                      </div>
                    </>
                  )}

                   {activeCompetitor === 'concurrent5' && (
                    <>
                      <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                        <h4 className="text-sm font-semibold mb-2">Description</h4>
                        <p className="text-[#4B5563]">{concurrenceData?.concurrent_5_description}</p>
                      </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-[#E8F7DF] rounded-md px-4 pb-4 pt-4 mb-4 md:mb-0">
                            <h4 className="text-sm font-semibold mb-2 text-black">Forces</h4>
                            <p className="text-[#4B5563]">{concurrenceData?.concurrent_5_forces}</p>
                          </div>
                          <div className="bg-[#FFDFDF] rounded-md px-4 pb-4 pt-4 mb-4 md:mb-0">
                            <h4 className="text-sm font-semibold mb-2 text-black">Faiblesses</h4>
                            <p className="text-[#4B5563]">{concurrenceData?.concurrent_5_faiblesses}</p>
                          </div>
                        </div>
                      <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4 mt-4">
                        <h4 className="text-sm font-semibold mb-2">Caractéristiques</h4>
                        <p className="text-[#4B5563]">{concurrenceData?.concurrent_5_caracteristiques}</p>
                      </div>
                      <div className="mt-4">
                        <a
                          href={concurrenceData?.concurrent_5_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full text-center bg-[#6191e2] text-white py-2 px-4 rounded-md hover:bg-[#4a7acb] transition-colors duration-200 flex items-center justify-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
                          Site web
                        </a>
                      </div>
                    </>
                  )}

                   {activeCompetitor === 'concurrent6' && (
                    <>
                      <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                        <h4 className="text-sm font-semibold mb-2">Description</h4>
                        <p className="text-[#4B5563]">{concurrenceData?.concurrent_6_description}</p>
                      </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-[#E8F7DF] rounded-md px-4 pb-4 pt-4 mb-4 md:mb-0">
                            <h4 className="text-sm font-semibold mb-2 text-black">Forces</h4>
                            <p className="text-[#4B5563]">{concurrenceData?.concurrent_6_forces}</p>
                          </div>
                          <div className="bg-[#FFDFDF] rounded-md px-4 pb-4 pt-4 mb-4 md:mb-0">
                            <h4 className="text-sm font-semibold mb-2 text-black">Faiblesses</h4>
                            <p className="text-[#4B5563]">{concurrenceData?.concurrent_6_faiblesses}</p>
                          </div>
                        </div>
                      <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4 mt-4">
                        <h4 className="text-sm font-semibold mb-2">Caractéristiques</h4>
                        <p className="text-[#4B5563]">{concurrenceData?.concurrent_6_caracteristiques}</p>
                      </div>
                      <div className="mt-4">
                        <a
                          href={concurrenceData?.concurrent_6_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full text-center bg-[#6191e2] text-white py-2 px-4 rounded-md hover:bg-[#4a7acb] transition-colors duration-200 flex items-center justify-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
                          Site web
                        </a>
                      </div>
                    </>
                  )}

                   {activeCompetitor === 'concurrent7' && (
                    <>
                      <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                        <h4 className="text-sm font-semibold mb-2">Description</h4>
                        <p className="text-[#4B5563]">{concurrenceData?.concurrent_7_description}</p>
                      </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-[#E8F7DF] rounded-md px-4 pb-4 pt-4 mb-4 md:mb-0">
                            <h4 className="text-sm font-semibold mb-2 text-black">Forces</h4>
                            <p className="text-[#4B5563]">{concurrenceData?.concurrent_7_forces}</p>
                          </div>
                          <div className="bg-[#FFDFDF] rounded-md px-4 pb-4 pt-4 mb-4 md:mb-0">
                            <h4 className="text-sm font-semibold mb-2 text-black">Faiblesses</h4>
                            <p className="text-[#4B5563]">{concurrenceData?.concurrent_7_faiblesses}</p>
                          </div>
                        </div>
                      <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4 mt-4">
                        <h4 className="text-sm font-semibold mb-2">Caractéristiques</h4>
                        <p className="text-[#4B5563]">{concurrenceData?.concurrent_7_caracteristiques}</p>
                      </div>
                      <div className="mt-4">
                        <a
                          href={concurrenceData?.concurrent_7_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full text-center bg-[#6191e2] text-white py-2 px-4 rounded-md hover:bg-[#4a7acb] transition-colors duration-200 flex items-center justify-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
                          Site web
                        </a>
                      </div>
                    </>
                  )}

                   {activeCompetitor === 'concurrent8' && (
                    <>
                      <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                        <h4 className="text-sm font-semibold mb-2">Description</h4>
                        <p className="text-[#4B5563]">{concurrenceData?.concurrent_8_description}</p>
                      </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-[#E8F7DF] rounded-md px-4 pb-4 pt-4 mb-4 md:mb-0">
                            <h4 className="text-sm font-semibold mb-2 text-black">Forces</h4>
                            <p className="text-[#4B5563]">{concurrenceData?.concurrent_8_forces}</p>
                          </div>
                          <div className="bg-[#FFDFDF] rounded-md px-4 pb-4 pt-4 mb-4 md:mb-0">
                            <h4 className="text-sm font-semibold mb-2 text-black">Faiblesses</h4>
                            <p className="text-[#4B5563]">{concurrenceData?.concurrent_8_faiblesses}</p>
                          </div>
                        </div>
                      <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4 mt-4">
                        <h4 className="text-sm font-semibold mb-2">Caractéristiques</h4>
                        <p className="text-[#4B5563]">{concurrenceData?.concurrent_8_caracteristiques}</p>
                      </div>
                      <div className="mt-4">
                        <a
                          href={concurrenceData?.concurrent_8_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full text-center bg-[#6191e2] text-white py-2 px-4 rounded-md hover:bg-[#4a7acb] transition-colors duration-200 flex items-center justify-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
                          Site web
                        </a>
                      </div>
                    </>
                  )}
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

export default AnalyseDeLaConcurrenceLivrable;
