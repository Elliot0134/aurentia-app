import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatRecommendations } from '@/utils/textFormatter';
import DeliverableModalHeader from './DeliverableModalHeader';
import { useAdvancedModalTabs, TabType } from './useAdvancedModalTabs';
import DeliverableComments from './DeliverableComments';

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
  deliverableId?: string; // ID du livrable pour les commentaires
  organizationId?: string | null; // ID de l'organisation pour les commentaires (nullable pour utilisateurs individuels)
  showCommentsTab?: boolean; // Afficher l'onglet commentaires
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
  deliverableId,
  organizationId,
  showCommentsTab = false,
}) => {
  // Debug: Log comments tab configuration
  console.log('🔍 HarmonizedDeliverableModal Debug:', {
    showCommentsTab,
    deliverableId,
    organizationId,
    hasDeliverableId: !!deliverableId,
    willRenderComments: showCommentsTab && !!deliverableId,
  });

  React.useEffect(() => {
    console.log('🔄 Modal deliverableId changed:', {
      deliverableId,
      organizationId,
      showCommentsTab,
    });
  }, [deliverableId, organizationId, showCommentsTab]);

  // Utilisation du nouveau hook pour gérer les onglets
  const {
    activeTab,
    isTransitioning,
    modalHeight,
    contentRef,
    modalRef,
    handleTabChange,
    resetTab
  } = useAdvancedModalTabs({
    hasContent: showContentTab,
    hasDefinition: !!definition,
    hasRecommendations: !!recommendations,
    hasChat: !!chatComponent,
    hasComments: showCommentsTab && !!deliverableId, // organizationId can be null for individual users
    defaultTab: showContentTab ? 'structure' : (recommendations ? 'recommendations' : (definition ? 'definition' : (chatComponent ? 'chat' : 'structure')))
  });

  const handleModalClose = () => {
    onClose();
    resetTab();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50" onClick={handleModalClose}>
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
        {/* Header */}
        <DeliverableModalHeader
          title={title}
          iconComponent={iconComponent}
          onClose={handleModalClose}
        />
        
        {/* Tab Navigation */}
        <div className="flex bg-white border-b border-gray-100 overflow-x-auto flex-shrink-0">
          {showContentTab && (
            <button
              className={`py-3 px-6 text-sm font-medium transition-all duration-200 whitespace-nowrap ${activeTab === 'structure' ? 'border-b-2 border-orange-500 text-orange-500' : 'text-gray-600 hover:text-gray-800'}`}
              onClick={() => handleTabChange('structure')}
            >
              Contenu
            </button>
          )}
          {recommendations && (
            <button
              className={`py-3 px-6 text-sm font-medium transition-all duration-200 whitespace-nowrap ${activeTab === 'recommendations' ? 'border-b-2 border-orange-500 text-orange-500' : 'text-gray-600 hover:text-gray-800'}`}
              onClick={() => handleTabChange('recommendations')}
            >
              Recommandations
            </button>
          )}
          {definition && (
            <button
              className={`py-3 px-6 text-sm font-medium transition-all duration-200 whitespace-nowrap ${activeTab === 'definition' ? 'border-b-2 border-orange-500 text-orange-500' : 'text-gray-600 hover:text-gray-800'}`}
              onClick={() => handleTabChange('definition')}
            >
              Définition
            </button>
          )}
          {chatComponent && (
            <button
              className={`py-3 px-6 text-sm font-medium transition-all duration-200 whitespace-nowrap ${activeTab === 'chat' ? 'border-b-2 border-orange-500 text-orange-500' : 'text-gray-600 hover:text-gray-800'}`}
              onClick={() => handleTabChange('chat')}
            >
              Chat
            </button>
          )}
          {showCommentsTab && deliverableId && (
            <button
              className={`py-3 px-6 text-sm font-medium transition-all duration-200 whitespace-nowrap ${activeTab === 'comments' ? 'border-b-2 border-orange-500 text-orange-500' : 'text-gray-600 hover:text-gray-800'}`}
              onClick={() => handleTabChange('comments' as TabType)}
            >
              Commentaires
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
                {/* Check if definition is a React component/element (enhanced definition) */}
                {React.isValidElement(definition) ? (
                  // Enhanced definition with its own structure
                  <div>{definition}</div>
                ) : (
                  // Legacy simple text definition
                  <>
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
                  </>
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

            {activeTab === 'comments' && showCommentsTab && deliverableId && (
              <DeliverableComments
                key={`comments-${deliverableId}`}
                deliverableId={deliverableId}
                organizationId={organizationId || null}
              />
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
