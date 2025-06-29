import React, { useState, useEffect } from 'react';
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { useProject } from '@/contexts/ProjectContext';

interface PersonaData {
  identite: string;
  contexte_personnel: string;
  motivations_valeurs: string;
  defis_frustrations: string;
  comportement_achat: string;
  presence_digitale: string;
  strategies_marketing: string;
  approche_vente: string;
  avis: string | null;
  justification_avis: string | null;
  recommandations: string | null;
  recommandations_b2c: string | null;
}

interface PersonaBusinessData {
  identite_professionnelle: string;
  contexte_organisationnel: string;
  responsabilites_cles: string;
  enjeux_business: string;
  processus_decision: string;
  recherche_information: string;
  objections_courantes: string;
  strategie_approche: string;
  recommandations_b2b: string | null;
}

interface PersonaOrganismeData {
  identite_institutionnelle: string;
  contexte_organisationnel: string;
  mission_responsabilites: string;
  contraintes_budgetaires: string;
  enjeux_prioritaires: string;
  processus_decision: string;
  valeurs_attentes: string;
  strategie_approche: string;
  recommandations_organisme: string | null;
}

const PersonaExpressLivrable: React.FC = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [showDefinitionPlaceholder, setShowDefinitionPlaceholder] = useState(false);
  const [showRecommendationPlaceholder, setShowRecommendationPlaceholder] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('Particulier');

  // Use Project Context instead of individual API calls
  const { currentProject, loading } = useProject();

  // Get persona data from context
  const personaData = currentProject?.persona_express_b2c as PersonaData | null;
  const personaBusinessData = currentProject?.persona_express_b2b as PersonaBusinessData | null;
  const personaOrganismeData = currentProject?.persona_express_organismes as PersonaOrganismeData | null;

  const handleTemplateClick = () => {
    setIsPopupOpen(true);
  };

  const handlePopupClose = () => {
    setIsPopupOpen(false);
    setShowDefinitionPlaceholder(false);
    setShowRecommendationPlaceholder(false);
  };

  const title = "Persona Express";
  const definition = "Un persona est un profil semi-fictif représentant votre client idéal, basé sur des données réelles et des recherches sur votre marché cible";
  const importance = "Créer des personas permet de mieux comprendre vos clients, d'adapter votre communication, de développer des produits qui répondent à leurs besoins et d'optimiser vos stratégies marketing et commerciales";
  const color = "#9C27B0"; // Couleur du livrable

  return (
    <>
      {/* Livrable Template Part */}
      <div
        className="border rounded-lg p-4 mb-4 text-white transition-transform duration-200 hover:-translate-y-1 cursor-pointer flex justify-between"
        onClick={handleTemplateClick}
        style={{ borderColor: color, backgroundColor: color }}
      >
        <div className="flex-grow mr-4 flex flex-col">
          <h2 className="text-xl font-bold mb-2">{title}</h2>
          {personaData?.justification_avis && <p className="text-white mb-4">{personaData.justification_avis}</p>}
          <div className="flex-grow">
            {/* Children for the template content */}
          </div>
          <div className="flex-shrink-0 mt-auto">
            <button className={`text-xs bg-white px-2 py-1 rounded-full cursor-default pointer-events-none font-bold`} style={{ color: color }}>
              {personaData?.avis || 'Commentaire'}
            </button>
          </div>
        </div>
        <div className="flex-shrink-0">
          <img src="/icones-livrables/persona-icon.png" alt="Persona Icon" className="w-8 h-8 object-cover self-start" />
        </div>
      </div>

      {/* Livrable Popup Part */}
      {isPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handlePopupClose}>
          <div
            className="bg-white text-black rounded-lg p-6 w-full mx-2.5 md:w-3/4 relative transform transition-all duration-300 ease-out scale-95 opacity-0 max-h-[calc(100vh-100px)] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: 'scaleIn 0.3s ease-out forwards' }}
          >
            <h2 className="text-xl font-bold mb-2">{title}</h2>
            <div className="flex gap-2 mb-4">
              <button
                className={`text-xs px-2 py-1 rounded-full cursor-pointer ${
                  showDefinitionPlaceholder
                    ? 'text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
                style={{ backgroundColor: showDefinitionPlaceholder ? color : '' }}
                onClick={() => {
                  setShowDefinitionPlaceholder(!showDefinitionPlaceholder);
                  setShowRecommendationPlaceholder(false);
                }}
              >
                Définition
              </button>
              <button
                className={`text-xs px-2 py-1 rounded-full cursor-pointer ${
                  showRecommendationPlaceholder
                    ? 'text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
                style={{ backgroundColor: showRecommendationPlaceholder ? color : '' }}
                onClick={() => {
                  setShowRecommendationPlaceholder(!showRecommendationPlaceholder);
                  setShowDefinitionPlaceholder(false);
                }}
              >
                Recommandations globales
              </button>
            </div>

            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                showDefinitionPlaceholder ? 'max-h-screen' : 'max-h-0'
              }`}
            >
              <div className="mt-2">
                <div className="bg-gray-100 rounded-md p-4 mb-2">
                  <p className="text-[#4B5563]"><strong>Définition :</strong> {definition}</p>
                </div>
                <div className="bg-gray-100 rounded-md p-4">
                  <p className="text-[#4B5563]"><strong>Importance :</strong> {importance}</p>
                </div>
              </div>
            </div>

            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                showRecommendationPlaceholder ? 'max-h-screen' : 'max-h-0'
              }`}
            >
              <div className="mt-2">
                <div className="bg-gray-100 rounded-md p-4">
                  <p className="text-[#4B5563]">
                    <strong>Recommandations générales :</strong> 
                    {selectedType === 'Particulier' && personaData?.recommandations_b2c ? 
                      personaData.recommandations_b2c : 
                      selectedType === 'Entreprise' && personaBusinessData?.recommandations_b2b ? 
                        personaBusinessData.recommandations_b2b :
                        selectedType === 'Organismes' && personaOrganismeData?.recommandations_organisme ?
                          personaOrganismeData.recommandations_organisme :
                          "Aucune recommandation disponible pour ce segment."}
                  </p>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Chargement des données...</p>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <ToggleGroup type="single" value={selectedType} onValueChange={setSelectedType}>
                    <ToggleGroupItem value="Particulier" aria-label="Particulier">
                      Particulier
                    </ToggleGroupItem>
                    <ToggleGroupItem value="Entreprise" aria-label="Entreprise">
                      Entreprise
                    </ToggleGroupItem>
                    <ToggleGroupItem value="Organismes" aria-label="Organismes">
                      Organismes
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>

                {/* Content for Particulier */}
                {selectedType === 'Particulier' && (
                  <div className="space-y-4">
                    {personaData ? (
                      <>
                        <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
                          <h4 className="text-sm font-semibold mb-2">Identité</h4>
                          <p className="text-[#4B5563]">{personaData.identite}</p>
                        </div>
                        <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
                          <h4 className="text-sm font-semibold mb-2">Contexte personnel</h4>
                          <p className="text-[#4B5563]">{personaData.contexte_personnel}</p>
                        </div>
                        <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
                          <h4 className="text-sm font-semibold mb-2">Motivations et valeurs</h4>
                          <p className="text-[#4B5563]">{personaData.motivations_valeurs}</p>
                        </div>
                        <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
                          <h4 className="text-sm font-semibold mb-2">Défis et frustrations</h4>
                          <p className="text-[#4B5563]">{personaData.defis_frustrations}</p>
                        </div>
                        <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
                          <h4 className="text-sm font-semibold mb-2">Comportement d'achat</h4>
                          <p className="text-[#4B5563]">{personaData.comportement_achat}</p>
                        </div>
                        <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
                          <h4 className="text-sm font-semibold mb-2">Présence digitale</h4>
                          <p className="text-[#4B5563]">{personaData.presence_digitale}</p>
                        </div>
                        <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
                          <h4 className="text-sm font-semibold mb-2">Stratégies marketing</h4>
                          <p className="text-[#4B5563]">{personaData.strategies_marketing}</p>
                        </div>
                        <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
                          <h4 className="text-sm font-semibold mb-2">Approche de vente</h4>
                          <p className="text-[#4B5563]">{personaData.approche_vente}</p>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-600">Aucune donnée disponible pour les particuliers.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Content for Entreprise */}
                {selectedType === 'Entreprise' && (
                  <div className="space-y-4">
                    {personaBusinessData ? (
                      <>
                        <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
                          <h4 className="text-sm font-semibold mb-2">Identité professionnelle</h4>
                          <p className="text-[#4B5563]">{personaBusinessData.identite_professionnelle}</p>
                        </div>
                        <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
                          <h4 className="text-sm font-semibold mb-2">Contexte organisationnel</h4>
                          <p className="text-[#4B5563]">{personaBusinessData.contexte_organisationnel}</p>
                        </div>
                        <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
                          <h4 className="text-sm font-semibold mb-2">Responsabilités clés</h4>
                          <p className="text-[#4B5563]">{personaBusinessData.responsabilites_cles}</p>
                        </div>
                        <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
                          <h4 className="text-sm font-semibold mb-2">Enjeux business</h4>
                          <p className="text-[#4B5563]">{personaBusinessData.enjeux_business}</p>
                        </div>
                        <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
                          <h4 className="text-sm font-semibold mb-2">Processus de décision</h4>
                          <p className="text-[#4B5563]">{personaBusinessData.processus_decision}</p>
                        </div>
                        <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
                          <h4 className="text-sm font-semibold mb-2">Recherche d'information</h4>
                          <p className="text-[#4B5563]">{personaBusinessData.recherche_information}</p>
                        </div>
                        <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
                          <h4 className="text-sm font-semibold mb-2">Objections courantes</h4>
                          <p className="text-[#4B5563]">{personaBusinessData.objections_courantes}</p>
                        </div>
                        <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
                          <h4 className="text-sm font-semibold mb-2">Stratégie d'approche</h4>
                          <p className="text-[#4B5563]">{personaBusinessData.strategie_approche}</p>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-600">Aucune donnée disponible pour les entreprises.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Content for Organismes */}
                {selectedType === 'Organismes' && (
                  <div className="space-y-4">
                    {personaOrganismeData ? (
                      <>
                        <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
                          <h4 className="text-sm font-semibold mb-2">Identité institutionnelle</h4>
                          <p className="text-[#4B5563]">{personaOrganismeData.identite_institutionnelle}</p>
                        </div>
                        <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
                          <h4 className="text-sm font-semibold mb-2">Contexte organisationnel</h4>
                          <p className="text-[#4B5563]">{personaOrganismeData.contexte_organisationnel}</p>
                        </div>
                        <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
                          <h4 className="text-sm font-semibold mb-2">Mission et responsabilités</h4>
                          <p className="text-[#4B5563]">{personaOrganismeData.mission_responsabilites}</p>
                        </div>
                        <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
                          <h4 className="text-sm font-semibold mb-2">Contraintes budgétaires</h4>
                          <p className="text-[#4B5563]">{personaOrganismeData.contraintes_budgetaires}</p>
                        </div>
                        <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
                          <h4 className="text-sm font-semibold mb-2">Enjeux prioritaires</h4>
                          <p className="text-[#4B5563]">{personaOrganismeData.enjeux_prioritaires}</p>
                        </div>
                        <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
                          <h4 className="text-sm font-semibold mb-2">Processus de décision</h4>
                          <p className="text-[#4B5563]">{personaOrganismeData.processus_decision}</p>
                        </div>
                        <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
                          <h4 className="text-sm font-semibold mb-2">Valeurs et attentes</h4>
                          <p className="text-[#4B5563]">{personaOrganismeData.valeurs_attentes}</p>
                        </div>
                        <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
                          <h4 className="text-sm font-semibold mb-2">Stratégie d'approche</h4>
                          <p className="text-[#4B5563]">{personaOrganismeData.strategie_approche}</p>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-600">Aucune donnée disponible pour les organismes.</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            <button
              className="sticky top-0 right-4 float-right mb-4 bg-white/90 backdrop-blur-sm text-gray-400 hover:text-gray-600 rounded-full p-2 shadow-md border z-10"
              onClick={handlePopupClose}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PersonaExpressLivrable;
