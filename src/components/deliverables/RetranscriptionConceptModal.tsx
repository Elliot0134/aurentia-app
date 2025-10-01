import React from 'react';
import DeliverableModalHeader from './shared/DeliverableModalHeader';
import { useCustomModalTabs } from './shared/useCustomModalTabs';
import { Button } from "@/components/ui/button";

interface ConceptContent {
  projectName: string;
  syntheticDescription: string;
  detailedDescription: string;
  produitService: string;
  propositionValeur: string;
  elementsDistinctifs: string;
  problemes: string;
  publicCible: string;
  buyerProfiles: { title: string; description: string }[];
  marcheCible: string;
  marchesAnnexes: string;
  localisationProjet: string;
  budget: string;
  equipeFondatrice: string;
}

interface RetranscriptionConceptModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  iconComponent?: React.ReactNode;
  onEdit?: () => void;
  isEditing?: boolean;
  onCancel?: () => void;
  onSave?: (editedContent: ConceptContent) => void;
  content: ConceptContent;
  modalWidthClass?: string;
}

const RetranscriptionConceptModal: React.FC<RetranscriptionConceptModalProps> = ({
  isOpen,
  onClose,
  title,
  iconComponent,
  onEdit,
  isEditing = false,
  onCancel,
  onSave,
  content,
  modalWidthClass = "md:w-3/4",
}) => {
  const [editedContent, setEditedContent] = React.useState(content);

  // Sync editedContent with content when content changes
  React.useEffect(() => {
    setEditedContent(content);
  }, [content]);

  // Also sync when entering edit mode
  React.useEffect(() => {
    if (isEditing) {
      setEditedContent(content);
    }
  }, [isEditing, content]);

  const tabs = ['general', 'profiles', 'other'];
  const {
    activeTab,
    isTransitioning,
    modalHeight,
    contentRef,
    modalRef,
    handleTabChange,
    resetTab
  } = useCustomModalTabs({
    tabs,
    defaultTab: 'general'
  });

  const handleModalClose = () => {
    onClose();
    resetTab();
  };

  if (!isOpen) return null;

  const renderContent = () => {
    const displayContent = isEditing ? editedContent : content;

    switch (activeTab) {
      case 'general':
        return (
          <div>
            <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
              <h4 className="text-sm font-semibold mb-2">Nom du projet</h4>
              {isEditing ? (
                <input
                  type="text"
                  value={displayContent.projectName}
                  onChange={(e) => setEditedContent(prev => ({ ...prev, projectName: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              ) : (
                <p className="text-[#4B5563]">{content.projectName}</p>
              )}
            </div>
            <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
              <h4 className="text-sm font-semibold mb-2">Description synthétique</h4>
              {isEditing ? (
                <textarea
                  value={displayContent.syntheticDescription}
                  onChange={(e) => setEditedContent(prev => ({ ...prev, syntheticDescription: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded h-24"
                />
              ) : (
                <p className="text-[#4B5563]">{content.syntheticDescription}</p>
              )}
            </div>
            <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
              <h4 className="text-sm font-semibold mb-2">Produit ou service</h4>
              {isEditing ? (
                <textarea
                  value={displayContent.produitService}
                  onChange={(e) => setEditedContent(prev => ({ ...prev, produitService: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded h-24"
                />
              ) : (
                <p className="text-[#4B5563]">{content.produitService}</p>
              )}
            </div>
            <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
              <h4 className="text-sm font-semibold mb-2">Proposition de valeur</h4>
              {isEditing ? (
                <textarea
                  value={displayContent.propositionValeur}
                  onChange={(e) => setEditedContent(prev => ({ ...prev, propositionValeur: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded h-24"
                />
              ) : (
                <p className="text-[#4B5563]">{content.propositionValeur}</p>
              )}
            </div>
            <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
              <h4 className="text-sm font-semibold mb-2">Éléments distinctifs</h4>
              {isEditing ? (
                <textarea
                  value={displayContent.elementsDistinctifs}
                  onChange={(e) => setEditedContent(prev => ({ ...prev, elementsDistinctifs: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded h-24"
                />
              ) : (
                <p className="text-[#4B5563]">{content.elementsDistinctifs}</p>
              )}
            </div>
            <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
              <h4 className="text-sm font-semibold mb-2">Problèmes à résoudre</h4>
              {isEditing ? (
                <textarea
                  value={displayContent.problemes}
                  onChange={(e) => setEditedContent(prev => ({ ...prev, problemes: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded h-24"
                />
              ) : (
                <p className="text-[#4B5563]">{content.problemes}</p>
              )}
            </div>
          </div>
        );
      case 'profiles':
        return (
          <div>
            <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
              <h4 className="text-sm font-semibold mb-2">Public cible principal</h4>
              {isEditing ? (
                <input
                  type="text"
                  value={displayContent.publicCible}
                  onChange={(e) => setEditedContent(prev => ({ ...prev, publicCible: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              ) : (
                <p className="text-[#4B5563]">{content.publicCible}</p>
              )}
            </div>

            <div>
              <h4 className="text-lg font-bold mb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                Particuliers
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
                  <h4 className="text-sm font-semibold mb-2">Profil</h4>
                  {isEditing ? (
                    <textarea
                      value={displayContent.buyerProfiles[0]?.description || ''}
                      onChange={(e) => setEditedContent(prev => ({
                        ...prev,
                        buyerProfiles: prev.buyerProfiles.map((profile, index) =>
                          index === 0 ? { ...profile, description: e.target.value } : profile
                        )
                      }))}
                      className="w-full p-2 border border-gray-300 rounded h-20"
                    />
                  ) : (
                    <p className="text-[#4B5563]">{content.buyerProfiles[0]?.description}</p>
                  )}
                </div>
                <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
                  <h4 className="text-sm font-semibold mb-2">Problèmes à résoudre</h4>
                  {isEditing ? (
                    <textarea
                      value={displayContent.buyerProfiles[1]?.description || ''}
                      onChange={(e) => setEditedContent(prev => ({
                        ...prev,
                        buyerProfiles: prev.buyerProfiles.map((profile, index) =>
                          index === 1 ? { ...profile, description: e.target.value } : profile
                        )
                      }))}
                      className="w-full p-2 border border-gray-300 rounded h-20"
                    />
                  ) : (
                    <p className="text-[#4B5563]">{content.buyerProfiles[1]?.description}</p>
                  )}
                </div>
              </div>
              <h4 className="text-lg font-bold mb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect><path d="M17 22v-4a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v4"></path><path d="M12 7V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v3"></path><path d="M12 7V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v3"></path></svg>
                Entreprises
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
                  <h4 className="text-sm font-semibold mb-2">Profil</h4>
                  {isEditing ? (
                    <textarea
                      value={displayContent.buyerProfiles[2]?.description || ''}
                      onChange={(e) => setEditedContent(prev => ({
                        ...prev,
                        buyerProfiles: prev.buyerProfiles.map((profile, index) =>
                          index === 2 ? { ...profile, description: e.target.value } : profile
                        )
                      }))}
                      className="w-full p-2 border border-gray-300 rounded h-20"
                    />
                  ) : (
                    <p className="text-[#4B5563]">{content.buyerProfiles[2]?.description}</p>
                  )}
                </div>
                <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
                  <h4 className="text-sm font-semibold mb-2">Problèmes à résoudre</h4>
                  {isEditing ? (
                    <textarea
                      value={displayContent.buyerProfiles[3]?.description || ''}
                      onChange={(e) => setEditedContent(prev => ({
                        ...prev,
                        buyerProfiles: prev.buyerProfiles.map((profile, index) =>
                          index === 3 ? { ...profile, description: e.target.value } : profile
                        )
                      }))}
                      className="w-full p-2 border border-gray-300 rounded h-20"
                    />
                  ) : (
                    <p className="text-[#4B5563]">{content.buyerProfiles[3]?.description}</p>
                  )}
                </div>
              </div>
              <h4 className="text-lg font-bold mb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                Organismes
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
                  <h4 className="text-sm font-semibold mb-2">Profil</h4>
                  {isEditing ? (
                    <textarea
                      value={displayContent.buyerProfiles[4]?.description || ''}
                      onChange={(e) => setEditedContent(prev => ({
                        ...prev,
                        buyerProfiles: prev.buyerProfiles.map((profile, index) =>
                          index === 4 ? { ...profile, description: e.target.value } : profile
                        )
                      }))}
                      className="w-full p-2 border border-gray-300 rounded h-20"
                    />
                  ) : (
                    <p className="text-[#4B5563]">{content.buyerProfiles[4]?.description}</p>
                  )}
                </div>
                <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
                  <h4 className="text-sm font-semibold mb-2">Problèmes à résoudre</h4>
                  {isEditing ? (
                    <textarea
                      value={displayContent.buyerProfiles[5]?.description || ''}
                      onChange={(e) => setEditedContent(prev => ({
                        ...prev,
                        buyerProfiles: prev.buyerProfiles.map((profile, index) =>
                          index === 5 ? { ...profile, description: e.target.value } : profile
                        )
                      }))}
                      className="w-full p-2 border border-gray-300 rounded h-20"
                    />
                  ) : (
                    <p className="text-[#4B5563]">{content.buyerProfiles[5]?.description}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      case 'other':
        return (
          <div>
            <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
              <h4 className="text-sm font-semibold mb-2">Marché cible</h4>
              {isEditing ? (
                <input
                  type="text"
                  value={displayContent.marcheCible}
                  onChange={(e) => setEditedContent(prev => ({ ...prev, marcheCible: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              ) : (
                <p className="text-[#4B5563]">{content.marcheCible}</p>
              )}
            </div>
            <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
              <h4 className="text-sm font-semibold mb-2">Marchés annexes</h4>
              {isEditing ? (
                <input
                  type="text"
                  value={displayContent.marchesAnnexes}
                  onChange={(e) => setEditedContent(prev => ({ ...prev, marchesAnnexes: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              ) : (
                <p className="text-[#4B5563]">{content.marchesAnnexes}</p>
              )}
            </div>
            <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
              <h4 className="text-sm font-semibold mb-2">Localisation du projet</h4>
              {isEditing ? (
                <input
                  type="text"
                  value={displayContent.localisationProjet}
                  onChange={(e) => setEditedContent(prev => ({ ...prev, localisationProjet: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              ) : (
                <p className="text-[#4B5563]">{content.localisationProjet}</p>
              )}
            </div>
            <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
              <h4 className="text-sm font-semibold mb-2">Budget</h4>
              {isEditing ? (
                <input
                  type="text"
                  value={displayContent.budget}
                  onChange={(e) => setEditedContent(prev => ({ ...prev, budget: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              ) : (
                <p className="text-[#4B5563]">{content.budget}</p>
              )}
            </div>
            <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
              <h4 className="text-sm font-semibold mb-2">L'équipe fondatrice</h4>
              {isEditing ? (
                <textarea
                  value={displayContent.equipeFondatrice}
                  onChange={(e) => setEditedContent(prev => ({ ...prev, equipeFondatrice: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded h-24"
                />
              ) : (
                <p className="text-[#4B5563]">{content.equipeFondatrice}</p>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

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
        <DeliverableModalHeader
          title={title}
          iconComponent={iconComponent}
          onClose={handleModalClose}
          onEdit={onEdit}
        />

        <div className="flex bg-white border-b border-gray-100">
          <button
            className={`py-3 px-6 text-sm font-medium transition-all duration-200 ${activeTab === 'general' ? 'border-b-2 border-orange-500 text-orange-500' : 'text-gray-600 hover:text-gray-800'}`}
            onClick={() => handleTabChange('general')}
          >
            Informations générales
          </button>
          <button
            className={`py-3 px-6 text-sm font-medium transition-all duration-200 ${activeTab === 'profiles' ? 'border-b-2 border-orange-500 text-orange-500' : 'text-gray-600 hover:text-gray-800'}`}
            onClick={() => handleTabChange('profiles')}
          >
            Profils acheteurs
          </button>
          <button
            className={`py-3 px-6 text-sm font-medium transition-all duration-200 ${activeTab === 'other' ? 'border-b-2 border-orange-500 text-orange-500' : 'text-gray-600 hover:text-gray-800'}`}
            onClick={() => handleTabChange('other')}
          >
            Autres informations
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 pt-4">
          <div
            ref={contentRef}
            className={`transition-all duration-300 ${isTransitioning ? 'opacity-0 blur-sm transform translate-y-2' : 'opacity-100 blur-0 transform translate-y-0'}`}
          >
            {renderContent()}
          </div>
        </div>

        {isEditing && (
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <Button
              variant="outline"
              onClick={onCancel}
            >
              Annuler
            </Button>
            <Button
              onClick={() => onSave?.(editedContent)}
            >
              Sauvegarder
            </Button>
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes scaleIn {
            from {
              opacity: 0;
              transform: scale(0.95) translateY(20px);
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

export default RetranscriptionConceptModal;
