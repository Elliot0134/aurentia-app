import React, { useState, useRef, useLayoutEffect } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import ReactMarkdown from 'react-markdown';

interface StructureContent {
  title: string;
  content: string;
}

interface StructureSection {
  title: string;
  items: StructureContent[];
}

interface LivrableProps {
  title: string;
  avis: string; // Texte de l'étiquette de la carte
  justification_avis: string; // Description de la carte
  structure: StructureSection[]; // Contenu du popup en JSON B
  iconSrc?: string; // Add iconSrc prop for the card image
  definition?: string; // Nouvelle prop pour la définition
  recommendations?: string; // Nouvelle prop pour les recommandations
}

const Livrable: React.FC<LivrableProps> = ({
  title,
  avis,
  justification_avis,
  structure,
  iconSrc = "/icones-livrables/market-icon.png", // Default icon
  definition,
  recommendations,
}) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'structure' | 'definition' | 'recommendations'>(
    structure.length > 0 ? 'structure' : (recommendations ? 'recommendations' : (definition ? 'definition' : 'structure'))
  );
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [contentHeight, setContentHeight] = useState<number>(0);
  const [modalHeight, setModalHeight] = useState<string>('auto');
  
  const contentRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleTemplateClick = () => {
    setIsPopupOpen(true);
    setActiveTab(structure.length > 0 ? 'structure' : (recommendations ? 'recommendations' : (definition ? 'definition' : 'structure')));
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

  return (
    <>
      {/* Livrable Template Part */}
      <div
        className="border rounded-lg p-4 mb-4 text-white transition-transform duration-200 hover:-translate-y-1 cursor-pointer flex justify-between h-full"
        onClick={handleTemplateClick}
        style={{ borderColor: '#e2e8f0', backgroundColor: 'white' }}
      >
        <div className="flex-grow flex flex-col">
          <h2 className="text-xl font-bold mb-2 text-black">{title}</h2>
          {justification_avis && <p className="text-gray-700 mb-4 line-clamp-3">{justification_avis}</p>}
          <div className="flex-grow">
            {/* Content will be dynamically generated */}
          </div>
          <div className="flex-shrink-0 mt-auto">
            <button className={`text-xs px-2 py-1 rounded-full cursor-default pointer-events-none`} style={{ backgroundColor: '#FEF2ED', color: '#FF5932', border: '1px solid #FFBDA4' }}>
              {avis}
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
              {structure.length > 0 && (
                <button
                  className={`py-3 px-6 text-sm font-medium transition-all duration-200 ${activeTab === 'structure' ? 'border-b-2 border-orange-500 text-orange-500' : 'text-gray-600 hover:text-gray-800'}`}
                  onClick={() => handleTabChange('structure')}
                >
                  Contenu
                </button>
              )}
              <button
                className={`py-3 px-6 text-sm font-medium transition-all duration-200 ${activeTab === 'recommendations' ? 'border-b-2 border-orange-500 text-orange-500' : 'text-gray-600 hover:text-gray-800'}`}
                onClick={() => handleTabChange('recommendations')}
              >
                Recommandations
              </button>
              <button
                className={`py-3 px-6 text-sm font-medium transition-all duration-200 ${activeTab === 'definition' ? 'border-b-2 border-orange-500 text-orange-500' : 'text-gray-600 hover:text-gray-800'}`}
                onClick={() => handleTabChange('definition')}
              >
                Définition
              </button>
            </div>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 pt-4">
              <div
                ref={contentRef}
                className={`transition-all duration-300 ${isTransitioning ? 'opacity-0 blur-sm transform translate-y-2' : 'opacity-100 blur-0 transform translate-y-0'}`}
              >
              {activeTab === 'structure' && (
                <>
                  {structure.length > 0 ? (
                    <Accordion type="single" collapsible className="w-full">
                      {structure.map((section, sectionIndex) => (
                        <AccordionItem value={`section-${sectionIndex}`} key={sectionIndex}>
                          <AccordionTrigger className="text-lg">{section.title}</AccordionTrigger>
                          <AccordionContent>
                            {section.items.map((item, itemIndex) => (
                              <div key={itemIndex} className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                                <h4 className="text-sm font-semibold mb-2">{item.title}</h4>
                                <div className="text-[#4B5563]" style={{ whiteSpace: 'pre-wrap' }}>
                                  <ReactMarkdown>{item.content}</ReactMarkdown>
                                </div>
                              </div>
                            ))}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  ) : (
                    <div className="prose max-w-none">
                      <p className="text-gray-500">Aucun contenu disponible pour le moment.</p>
                    </div>
                  )}
                </>
              )}

              {activeTab === 'recommendations' && (
                <div className="prose max-w-none">
                  <h3 className="text-lg font-bold mb-2">Recommandations</h3>
                  {recommendations ? (
                    <div style={{ whiteSpace: 'pre-wrap' }}>
                      <ReactMarkdown>{recommendations}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-gray-500">Aucune recommandation disponible pour le moment.</p>
                  )}
                </div>
              )}

              {activeTab === 'definition' && (
                <div className="prose max-w-none">
                  <h3 className="text-lg font-bold mb-2">Définition</h3>
                  {definition ? (
                    <div style={{ whiteSpace: 'pre-wrap' }}>
                      <ReactMarkdown>{definition}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-gray-500">Aucune définition disponible pour le moment.</p>
                  )}

                  <h3 className="text-lg font-bold mb-2 mt-6">Importance</h3>
                  <div className="text-gray-500" style={{ whiteSpace: 'pre-wrap' }}>
                    <ReactMarkdown>L'importance de cette définition réside dans sa capacité à clarifier les concepts clés et à fournir une base solide pour la compréhension du livrable. Elle permet d'aligner toutes les parties prenantes sur une vision commune et d'assurer la cohérence des actions.</ReactMarkdown>
                  </div>
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

export default Livrable;
