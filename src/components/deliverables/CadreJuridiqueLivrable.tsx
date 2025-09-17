import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import ReactMarkdown from 'react-markdown';
import { createClient } from '@supabase/supabase-js';

// Initialiser Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface StructureContent {
  title: string;
  content: string | JSX.Element; // Permettre JSX.Element
}

interface StructureSection {
  title: string;
  items: StructureContent[];
}

interface LivrableProps {
  title: string;
  iconSrc?: string; // Add iconSrc prop for the card image
  definition?: string; // Nouvelle prop pour la définition
  importance?: string; // Nouvelle prop pour l'importance
  recommendations?: string; // Nouvelle prop pour les recommandations
  projectId: string; // Ajout de projectId pour filtrer les données
}

const CadreJuridiqueLivrable: React.FC<LivrableProps> = ({
  title,
  iconSrc = "/icones-livrables/juridique-icon.png", // Default icon for Cadre Juridique
  projectId,
}) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'structure' | 'definition' | 'recommendations'>(
    'structure'
  );
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [contentHeight, setContentHeight] = useState<number>(0);
  const [modalHeight, setModalHeight] = useState<string>('auto');
  const [structureData, setStructureData] = useState<any>(null); // Données de la colonne 'structure'
  const [dbRecommendations, setDbRecommendations] = useState<string | null>(null); // Recommandations de la DB
  const [dbAvis, setDbAvis] = useState<string | null>(null); // Avis de la DB
  const [dbJustificationAvis, setDbJustificationAvis] = useState<string | null>(null); // Justification Avis de la DB
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const contentRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Données statiques du livrable
  const staticDefinition = "Le cadre juridique d'une entreprise constitue l'architecture légale fondamentale qui détermine sa structure, son fonctionnement et ses obligations. Il englobe le choix de la forme juridique (SARL, SAS, etc.) qui définit les modalités de gouvernance, la répartition des pouvoirs, les responsabilités des dirigeants et associés, ainsi que le régime fiscal applicable.\n\nCette analyse comprend également l'identification et la maîtrise des risques juridiques spécifiques au secteur d'activité, incluant les obligations réglementaires, les certifications requises, les licences nécessaires et la conformité aux normes sectorielles. Elle intègre la mise en place de mesures préventives, la souscription d'assurances adaptées et la définition des protocoles de compliance.\n\nLe volet propriété intellectuelle constitue un pilier essentiel, couvrant la protection des marques, des brevets potentiels, des droits d'auteur et des secrets d'affaires. Il établit la stratégie de dépôt, de surveillance et de défense des actifs immatériels qui forment souvent la valeur différenciatrice de l'entreprise.";
  const staticImportance = "Le cadre juridique est le socle de sécurité et de crédibilité de toute entreprise. Une structuration juridique inadéquate peut entraîner des conséquences dramatiques : responsabilité personnelle illimitée des dirigeants, exposition patrimoniale maximale, difficultés de financement, problèmes de gouvernance, conflits entre associés non anticipés, et impossibilité de céder ou transmettre l'entreprise dans de bonnes conditions.\n\nL'absence de maîtrise des risques sectoriels expose l'entrepreneur à des sanctions administratives, pénales ou civiles, des rappels de produits, des dommages-intérêts, une perte de réputation irréversible et potentiellement la fermeture de l'activité. Dans des secteurs réglementés, l'ignorance de la compliance peut coûter l'existence même de l'entreprise.\n\nLa négligence de la propriété intellectuelle représente un risque majeur de spoliation. Sans protection adéquate, les concurrents peuvent s'approprier librement les innovations, la marque, l'image de marque et les développements techniques, anéantissant l'avantage concurrentiel et la valeur de l'entreprise. Inversement, l'entrepreneur non protégé s'expose aux actions en contrefaçon de tiers.\n\nUn cadre juridique solide facilite les levées de fonds, rassure les partenaires commerciaux, optimise la fiscalité, préserve la flexibilité opérationnelle et prépare les évolutions futures de l'entreprise. Il constitue un facteur déterminant de pérennité et de croissance.";

  useEffect(() => {
    const fetchJuridiqueData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('juridique')
          .select('structure, recommandations, avis, justification_avis') // Inclure avis et justification_avis
          .eq('project_id', projectId)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          setStructureData(data.structure?.agent_response || null);
          setDbRecommendations(data.recommandations || null);
          setDbAvis(data.avis || null); // Mettre à jour l'état avec l'avis de la DB
          setDbJustificationAvis(data.justification_avis || null); // Mettre à jour l'état avec la justification de la DB
        } else {
          setStructureData(null);
          setDbRecommendations(null);
          setDbAvis(null);
          setDbJustificationAvis(null);
        }
      } catch (err: any) {
        console.error("Erreur lors de la récupération des données juridiques:", err.message);
        setError("Impossible de charger les données juridiques pour ce projet.");
      } finally {
        setIsLoading(false);
      }
    };

    if (projectId) {
      fetchJuridiqueData();
    }
  }, [projectId]);

  const handleTemplateClick = () => {
    setIsPopupOpen(true);
    // Déterminer l'onglet actif initial en fonction des données disponibles
    if (structureData) {
      setActiveTab('structure');
    } else if (dbRecommendations) {
      setActiveTab('recommendations');
    } else {
      setActiveTab('definition');
    }
  };

  const handlePopupClose = () => {
    setIsPopupOpen(false);
  };

  // Fonction pour mesurer la hauteur du contenu
  const measureContentHeight = () => {
    if (contentRef.current) {
      const height = contentRef.current.scrollHeight;
      setContentHeight(height);
      return height;
    }
    return 0;
  };

  // UseLayoutEffect pour mesurer la hauteur initiale et surveiller les changements d'accordéons
  useLayoutEffect(() => {
    if (isPopupOpen && contentRef.current && modalRef.current) {
      const contentHeight = contentRef.current.scrollHeight;
      const headerHeight = modalRef.current.querySelector('.sticky')?.clientHeight || 100;
      const tabsHeight = modalRef.current.querySelector('.border-b')?.clientHeight || 50;
      const paddingHeight = 48; // p-6 pt-4 = 24+16 = 40px + petit margin
      
      const totalHeight = contentHeight + headerHeight + tabsHeight + paddingHeight;
      setContentHeight(contentHeight);
      setModalHeight(`${totalHeight}px`);

      // Observer les changements de taille du contenu (accordéons qui s'ouvrent/ferment)
      const resizeObserver = new ResizeObserver(() => {
        if (contentRef.current && !isTransitioning && modalRef.current) {
          const newContentHeight = contentRef.current.scrollHeight;
          if (newContentHeight !== contentHeight) {
            const newTotalHeight = newContentHeight + headerHeight + tabsHeight + paddingHeight;
            setContentHeight(newContentHeight);
            setModalHeight(`${newTotalHeight}px`);
          }
        }
      });

      resizeObserver.observe(contentRef.current);

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [isPopupOpen, activeTab, isTransitioning]);

  const handleTabChange = (newTab: 'structure' | 'definition' | 'recommendations') => {
    if (newTab === activeTab || isTransitioning) return;
    
    setIsTransitioning(true);
    
    // Phase 1: Flou du contenu actuel (plus rapide)
    setTimeout(() => {
      // Change le contenu
      setActiveTab(newTab);
      
      // Phase 2: Mesure la nouvelle hauteur et anime vers celle-ci
      setTimeout(() => {
        if (contentRef.current && modalRef.current) {
          const newContentHeight = contentRef.current.scrollHeight;
          const headerHeight = modalRef.current.querySelector('.sticky')?.clientHeight || 100;
          const tabsHeight = modalRef.current.querySelector('.border-b')?.clientHeight || 50;
          const paddingHeight = 48;
          
          const newTotalHeight = newContentHeight + headerHeight + tabsHeight + paddingHeight;
          setContentHeight(newContentHeight);
          setModalHeight(`${newTotalHeight}px`);
        }
        
        // Phase 3: Retire le flou (plus rapide)
        setTimeout(() => {
          setIsTransitioning(false);
        }, 60);
      }, 30);
    }, 100);
  };

  // Fonction pour rendre les listes (arrays)
  const renderList = (items: string[] | undefined): JSX.Element => {
    if (!items || items.length === 0) {
      return <p className="text-gray-500">Non spécifié.</p>;
    }
    return (
      <ul className="list-disc list-inside">
        {items.map((item, index) => (
          <li key={index}>
            <ReactMarkdown components={{ p: ({ node, ...props }) => <span {...props} /> }}>
              {item}
            </ReactMarkdown>
          </li>
        ))}
      </ul>
    );
  };

  // Fonction pour rendre le contenu de la structure
  const renderStructureContent = (): JSX.Element => {
    if (isLoading) {
      return <p className="text-gray-500">Chargement des données...</p>;
    }
    if (error) {
      return <p className="text-red-500">{error}</p>;
    }
    if (!structureData) {
      return <p className="text-gray-500">Aucune donnée juridique disponible pour ce projet.</p>;
    }

    const sections: StructureSection[] = [
      {
        title: "Forme Juridique Recommandée",
        items: [
          {
            title: "Choix recommandé",
            content: structureData.forme_juridique?.recommandation_principale || "Non spécifié."
          },
          {
            title: "Justification du choix",
            content: structureData.forme_juridique?.justification || "Non spécifié."
          },
          {
            title: "Alternatives possibles",
            content: renderList(structureData.forme_juridique?.alternatives)
          },
          {
            title: "Avantages fiscaux",
            content: renderList(structureData.forme_juridique?.avantages_fiscaux)
          },
        ].filter(item => item.content !== undefined && item.content !== null) as StructureContent[]
      },
      {
        title: "Risques Juridiques",
        items: [
          {
            title: "Risques majeurs identifiés",
            content: renderList(structureData.risques_juridiques?.risques_majeurs)
          },
          {
            title: "Mesures préventives",
            content: renderList(structureData.risques_juridiques?.mesures_preventives)
          },
          {
            title: "Assurances recommandées",
            content: renderList(structureData.risques_juridiques?.assurances_recommandees)
          },
        ].filter(item => item.content !== undefined && item.content !== null) as StructureContent[]
      },
      {
        title: "Compliance Sectorielle",
        items: [
          {
            title: "Licences requises",
            content: renderList(structureData.compliance_sectorielle?.licences_requises)
          },
          {
            title: "Organismes régulateurs",
            content: renderList(structureData.compliance_sectorielle?.organismes_regulateurs)
          },
          {
            title: "Certifications nécessaires",
            content: renderList(structureData.compliance_sectorielle?.certifications_necessaires)
          },
          {
            title: "Réglementations applicables",
            content: renderList(structureData.compliance_sectorielle?.reglementations_applicables)
          },
        ].filter(item => item.content !== undefined && item.content !== null) as StructureContent[]
      },
      {
        title: "Propriété Intellectuelle",
        items: [
          {
            title: "Protection de marque (nécessité)",
            content: structureData.protection_intellectuelle?.marque?.necessite || "Non spécifié."
          },
          {
            title: "Classes recommandées",
            content: renderList(structureData.protection_intellectuelle?.marque?.classes_recommandees)
          },
          {
            title: "Stratégie brevets",
            content: structureData.protection_intellectuelle?.brevets?.strategie || "Non spécifié."
          },
          {
            title: "Éléments brevetables",
            content: renderList(structureData.protection_intellectuelle?.brevets?.elements_brevetables)
          },
        ].filter(item => item.content !== undefined && item.content !== null) as StructureContent[]
      },
    ].filter(section => section.items.length > 0); // Filtrer les sections vides

    if (sections.length === 0) {
      return <p className="text-gray-500">Aucun contenu structuré disponible pour le moment.</p>;
    }

    return (
      <Accordion type="single" collapsible className="w-full">
        {sections.map((section, sectionIndex) => (
          <AccordionItem value={`section-${sectionIndex}`} key={sectionIndex}>
            <AccordionTrigger className="text-lg">{section.title}</AccordionTrigger>
            <AccordionContent>
              {section.items.map((item, itemIndex) => (
                <div key={itemIndex} className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                  <h4 className="text-sm font-semibold mb-2">{item.title}</h4>
                  <div className="text-[#4B5563]" style={{ whiteSpace: 'pre-wrap' }}>
                    {item.content}
                  </div>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    );
  };

  return (
    <>
      {/* Livrable Template Part */}
      <div
        className="border border-gray-200 rounded-xl p-4 mb-4 text-white cursor-pointer flex justify-between h-full transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
        onClick={handleTemplateClick}
        style={{ borderColor: '#e2e8f0', backgroundColor: 'white' }}
      >
        <div className="flex-grow flex flex-col">
          <h2 className="text-xl font-bold mb-2 text-black">{title}</h2>
          {dbJustificationAvis && <p className="text-gray-700 mb-4 line-clamp-3">{dbJustificationAvis}</p>}
          <div className="flex-grow">
            {/* Content will be dynamically generated */}
          </div>
          <div className="flex-shrink-0 mt-auto">
            <button className={`text-xs px-2 py-1 rounded-full cursor-default pointer-events-none`} style={{ backgroundColor: '#FEF2ED', color: '#FF5932', border: '1px solid #FFBDA4' }}>
              {dbAvis}
            </button>
          </div>
        </div>
        <div className="flex-shrink-0">
          <img src={iconSrc} alt="Template Icon" className="w-8 h-8 object-cover self-start" />
        </div>
      </div>

      {/* Livrable Popup Part */}
      {isPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handlePopupClose}>
          <div
            ref={modalRef}
            className="bg-white text-black rounded-lg w-full mx-2.5 md:w-3/4 relative transform scale-95 opacity-0 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the popup
            style={{
              animation: 'scaleIn 0.3s ease-out forwards',
              height: modalHeight,
              maxHeight: 'calc(100vh - 100px)',
              transition: 'height 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.3s ease-out'
            }} // Animation fluide et plus rapide
          >
            {/* Sticky Header */}
            <div className="sticky top-0 bg-white z-10 border-b border-gray-200 p-6 pb-4 flex justify-between items-start">
              <div className="flex items-center">
                <img src={iconSrc} alt="Template Icon" className="w-8 h-8 object-cover mr-3" />
                <h2 className="text-xl font-bold">{title}</h2>
              </div>
              <button
                className="text-gray-600 hover:text-gray-900 transition-colors"
                onClick={handlePopupClose}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Tab Navigation */}
            <div className="flex bg-white border-b border-gray-100">
              {structureData && (
                <button
                  className={`py-3 px-6 text-sm font-medium transition-all duration-200 ${activeTab === 'structure' ? 'border-b-2 border-orange-500 text-orange-500' : 'text-gray-600 hover:text-gray-800'}`}
                  onClick={() => handleTabChange('structure')}
                >
                  Contenu
                </button>
              )}
              {dbRecommendations && (
                <button
                  className={`py-3 px-6 text-sm font-medium transition-all duration-200 ${activeTab === 'recommendations' ? 'border-b-2 border-orange-500 text-orange-500' : 'text-gray-600 hover:text-gray-800'}`}
                  onClick={() => handleTabChange('recommendations')}
                >
                  Recommandations
                </button>
              )}
              {(staticDefinition || staticImportance) && (
                <button
                  className={`py-3 px-6 text-sm font-medium transition-all duration-200 ${activeTab === 'definition' ? 'border-b-2 border-orange-500 text-orange-500' : 'text-gray-600 hover:text-gray-800'}`}
                  onClick={() => handleTabChange('definition')}
                >
                  Définition
                </button>
              )}
            </div>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 pt-4">
              <div
                ref={contentRef}
                className={`transition-all duration-300 ${isTransitioning ? 'opacity-0 blur-sm transform translate-y-2' : 'opacity-100 blur-0 transform translate-y-0'}`}
              >
              {activeTab === 'structure' && renderStructureContent()}

              {activeTab === 'recommendations' && (
                <div className="prose max-w-none">
                  <h3 className="text-lg font-bold mb-2">Recommandations</h3>
                  {dbRecommendations ? (
                    <div style={{ whiteSpace: 'pre-wrap' }}>
                      <ReactMarkdown>{dbRecommendations}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-gray-500">Aucune recommandation disponible pour le moment.</p>
                  )}
                </div>
              )}

              {activeTab === 'definition' && (
                <div className="prose max-w-none">
                  <h3 className="text-lg font-bold mb-2">Définition</h3>
                  {staticDefinition ? (
                    <div className="text-gray-500" style={{ whiteSpace: 'pre-wrap' }}>
                      <ReactMarkdown>{staticDefinition}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-gray-500">Aucune définition disponible pour le moment.</p>
                  )}

                  <h3 className="text-lg font-bold mb-2 mt-6">Importance</h3>
                  {staticImportance ? (
                    <div className="text-gray-500" style={{ whiteSpace: 'pre-wrap' }}>
                      <ReactMarkdown>{staticImportance}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-gray-500">Aucune importance spécifiée pour le moment.</p>
                  )}
                </div>
              )}
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

export default CadreJuridiqueLivrable;
