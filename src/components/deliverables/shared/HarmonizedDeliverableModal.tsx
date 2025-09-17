import React, { useState, useRef, useLayoutEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatRecommendations } from '@/utils/textFormatter';

interface HarmonizedDeliverableModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  iconComponent?: React.ReactNode; // Changement de iconSrc à iconComponent
  contentComponent: React.ReactNode;
  recommendations?: React.ReactNode;
  definition?: React.ReactNode;
  importance?: React.ReactNode; // Nouvelle prop pour le contenu de l'importance
  chatComponent?: React.ReactNode; // Nouvelle prop pour le contenu du chat
  showContentTab?: boolean;
  children?: React.ReactNode;
  modalWidthClass?: string; // Nouvelle prop pour la largeur de la modal
}

const HarmonizedDeliverableModal: React.FC<HarmonizedDeliverableModalProps> = ({
  isOpen,
  onClose,
  title,
  iconComponent, // Changement de iconSrc à iconComponent
  contentComponent,
  recommendations,
  definition,
  importance, // Récupération de la nouvelle prop
  chatComponent, // Récupération de la nouvelle prop
  showContentTab = true,
  children,
  modalWidthClass = "md:w-3/4", // Valeur par défaut
}) => {
  const [activeTab, setActiveTab] = useState<'structure' | 'definition' | 'recommendations' | 'chat'>(
    showContentTab ? 'structure' : (recommendations ? 'recommendations' : (definition ? 'definition' : (importance ? 'definition' : (chatComponent ? 'chat' : 'structure'))))
  );
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [contentHeight, setContentHeight] = useState<number>(0);
  const [modalHeight, setModalHeight] = useState<string>('auto');
  
  const contentRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // UseLayoutEffect pour mesurer la hauteur initiale et surveiller les changements
  useLayoutEffect(() => {
    if (isOpen && contentRef.current && modalRef.current) {
      const contentHeight = contentRef.current.scrollHeight;
      const headerHeight = modalRef.current.querySelector('.sticky')?.clientHeight || 100;
      const tabsHeight = modalRef.current.querySelector('.border-b')?.clientHeight || 50;
      const paddingHeight = 48; // p-6 pt-4 = 24+16 = 40px + petit margin
      
      const totalHeight = contentHeight + headerHeight + tabsHeight + paddingHeight;
      setContentHeight(contentHeight);
      setModalHeight(`${totalHeight}px`);

      // Observer les changements de taille du contenu
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
  }, [isOpen, activeTab, isTransitioning]);

  const handleTabChange = (newTab: 'structure' | 'definition' | 'recommendations' | 'chat') => {
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

  const handleModalClose = () => {
    onClose();
    // Reset des états lors de la fermeture
    setActiveTab(showContentTab ? 'structure' : (recommendations ? 'recommendations' : (definition ? 'definition' : (chatComponent ? 'chat' : 'structure'))));
    setIsTransitioning(false);
    setModalHeight('auto');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleModalClose}>
      <div
        ref={modalRef}
        className={`bg-white text-black rounded-xl shadow-2xl w-full mx-2.5 ${modalWidthClass} relative transform scale-95 opacity-0 overflow-hidden flex flex-col`}
        onClick={(e) => e.stopPropagation()}
        style={{
          animation: 'scaleIn 0.3s ease-out forwards',
          height: modalHeight,
          maxHeight: 'calc(100vh - 100px)',
          transition: 'height 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.3s ease-out'
        }}
      >
        {/* Sticky Header */}
        <div className="sticky top-0 bg-white z-10 border-b border-gray-200 p-6 pb-4 flex justify-between items-start">
          <div className="flex flex-col sm:flex-row sm:items-center"> {/* Ajout de flex-col pour mobile et sm:flex-row pour desktop */}
            {iconComponent && <div className="w-8 h-8 flex items-center justify-center mb-2 sm:mb-0 sm:mr-3">{iconComponent}</div>} {/* Ajout de mb-2 pour mobile et sm:mb-0 sm:mr-3 pour desktop */}
            <h2 className="text-xl font-bold">{title}</h2>
          </div>
          <button
            className="text-gray-600 hover:text-gray-900 transition-colors"
            onClick={handleModalClose}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex bg-white border-b border-gray-100">
          {showContentTab && (
            <button
              className={`py-3 px-6 text-sm font-medium transition-all duration-200 ${activeTab === 'structure' ? 'border-b-2 border-orange-500 text-orange-500' : 'text-gray-600 hover:text-gray-800'}`}
              onClick={() => handleTabChange('structure')}
            >
              Contenu
            </button>
          )}
          {recommendations && (
            <button
              className={`py-3 px-6 text-sm font-medium transition-all duration-200 ${activeTab === 'recommendations' ? 'border-b-2 border-orange-500 text-orange-500' : 'text-gray-600 hover:text-gray-800'}`}
              onClick={() => handleTabChange('recommendations')}
            >
              Recommandations
            </button>
          )}
          {definition && (
            <button
              className={`py-3 px-6 text-sm font-medium transition-all duration-200 ${activeTab === 'definition' ? 'border-b-2 border-orange-500 text-orange-500' : 'text-gray-600 hover:text-gray-800'}`}
              onClick={() => handleTabChange('definition')}
            >
              Définition
            </button>
          )}
          {chatComponent && (
            <button
              className={`py-3 px-6 text-sm font-medium transition-all duration-200 ${activeTab === 'chat' ? 'border-b-2 border-orange-500 text-orange-500' : 'text-gray-600 hover:text-gray-800'}`}
              onClick={() => handleTabChange('chat')}
            >
              Chat
            </button>
          )}
        </div>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 pt-4">
          <div
            ref={contentRef}
            className={`transition-all duration-300 ${isTransitioning ? 'opacity-0 blur-sm transform translate-y-2' : 'opacity-100 blur-0 transform translate-y-0'}`}
          >
            {activeTab === 'structure' && (
              <>
                {contentComponent || children || (
                  <div className="prose max-w-none">
                    <p className="text-gray-500">Aucun contenu disponible pour le moment.</p>
                  </div>
                )}
              </>
            )}

            {activeTab === 'recommendations' && (
              <div className="prose max-w-none">
                {recommendations ? (
                  <div style={{ whiteSpace: 'pre-wrap' }}>
                    <ReactMarkdown>{formatRecommendations(String(recommendations))}</ReactMarkdown>
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
                    {definition}
                  </div>
                ) : (
                  <p className="text-gray-500">Aucune définition disponible pour le moment.</p>
                )}

                {/* Section Importance */}
                <h3 className="text-lg font-bold mb-2 mt-6">Importance</h3>
                {importance ? (
                  <div style={{ whiteSpace: 'pre-wrap' }}>
                    {importance}
                  </div>
                ) : (
                  <p className="text-gray-500">Aucune importance disponible pour le moment.</p>
                )}
              </div>
            )}

            {activeTab === 'chat' && (
              <>
                {chatComponent || (
                  <div className="prose max-w-none">
                    <p className="text-gray-500">Aucun chat disponible pour le moment.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Define keyframes for the animation */}
      <style>
        {`
          @keyframes scaleIn {
            from {
              opacity: 0;
              transform: scale(0.95) translateY(20px); /* Ajout du décalage vertical */
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
};

export default HarmonizedDeliverableModal;
