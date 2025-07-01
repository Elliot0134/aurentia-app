import React, { useState, useEffect } from 'react';
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { supabase } from '../../integrations/supabase/client';
import { useParams } from 'react-router-dom';

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
  const [personaData, setPersonaData] = useState<PersonaData | null>(null);
  const [personaBusinessData, setPersonaBusinessData] = useState<PersonaBusinessData | null>(null);
  const [personaOrganismeData, setPersonaOrganismeData] = useState<PersonaOrganismeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>('Particulier');

  const { projectId } = useParams<{ projectId: string }>();
  const supabaseClient = supabase;

  useEffect(() => {
    const fetchAllPersonaData = async () => {
      if (!projectId) {
        setError("Project ID not found in URL.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const [b2cResult, b2bResult, organismeResult] = await Promise.all([
        supabase.from('persona_express_b2c').select('*').eq('project_id', projectId).single(),
        supabase.from('persona_express_b2b').select('*').eq('project_id', projectId).single(),
        supabase.from('persona_express_organismes').select('*').eq('project_id', projectId).single(),
      ]);

      if (b2cResult.error) {
        setError(b2cResult.error.message);
      } else {
        setPersonaData(b2cResult.data as PersonaData);
      }

      if (b2bResult.error) {
        // Handle b2b error if necessary, maybe set a specific error state for b2b
      } else {
        setPersonaBusinessData(b2bResult.data as PersonaBusinessData);
      }

      if (organismeResult.error) {
        // Handle organisme error if necessary
      } else {
        setPersonaOrganismeData(organismeResult.data as PersonaOrganismeData);
      }

      setLoading(false);
    };

    fetchAllPersonaData();
  }, [projectId, supabase]);

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
            className="bg-white text-black rounded-lg w-full mx-2.5 md:w-3/4 relative transform transition-all duration-300 ease-out scale-95 opacity-0 max-h-[calc(100vh-100px)] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: 'scaleIn 0.3s ease-out forwards' }}
          >
            {/* Sticky Header */}
            <div className="sticky top-0 bg-white z-10 border-b border-gray-200 p-6 pb-4 flex justify-between items-start">
              <h2 className="text-xl font-bold">{title}</h2>
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
                  {personaData?.recommandations?.split('\n').filter(Boolean).map((item, index) => (
                    <p key={index} className="text-[#4B5563] mb-2" dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></p>
                  ))}
                </div>
              </div>
            </div>

            <ToggleGroup type="single" value={selectedType} onValueChange={setSelectedType} className="flex-col md:flex-row mb-4 mt-4">
              <ToggleGroupItem
                value="Particulier"
                aria-label="Toggle particulier"
                className={`w-full ${selectedType === 'Particulier' ? 'bg-gradient-to-r from-pink-500 to-orange-500 text-white' : ''}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-2 ${selectedType === 'Particulier' ? 'text-white' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-2-2a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                <span className={selectedType === 'Particulier' ? 'text-white' : ''}>Particulier</span>
              </ToggleGroupItem>
              <ToggleGroupItem
                value="Entreprise"
                aria-label="Toggle entreprise"
                className={`w-full ${selectedType === 'Entreprise' ? 'bg-gradient-to-r from-pink-500 to-orange-500 text-white' : ''}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-2 ${selectedType === 'Entreprise' ? 'text-white' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"/><path d="M10 12h4"/><path d="M12 17v-5"/><path d="M5 22v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3"/><path d="M15 22v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3"/><path d="M2 10l10-7 10 7"/></svg>
                <span className={selectedType === 'Entreprise' ? 'text-white' : ''}>Entreprise</span>
              </ToggleGroupItem>
              <ToggleGroupItem
                value="Organisme"
                aria-label="Toggle organisme"
                className={`w-full ${selectedType === 'Organisme' ? 'bg-gradient-to-r from-pink-500 to-orange-500 text-white' : ''}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-2 ${selectedType === 'Organisme' ? 'text-white' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                <span className={selectedType === 'Organisme' ? 'text-white' : ''}>Organisme</span>
              </ToggleGroupItem>
            </ToggleGroup>

            {error && <p className="text-red-500">Error: {error}</p>}
            {loading && <p>Loading persona data...</p>} {/* Keep loading message */}

            {selectedType === 'Particulier' && personaData && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-md p-4" style={{ backgroundColor: '#E1BEE7' }}> {/* Very light purple */}
                  <h3 className="text-lg font-semibold mb-2">Profil Client</h3>
                  <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                    <h4 className="text-sm font-semibold mb-2">Identité et profil du persona</h4>
                    <p className="text-[#4B5563]">{personaData.identite}</p>
                  </div>
                  <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                    <h4 className="text-sm font-semibold mb-2">Situation personnelle et environnement</h4>
                    <p className="text-[#4B5563]">{personaData.contexte_personnel}</p>
                  </div>
                </div>

                <div className="rounded-md p-4" style={{ backgroundColor: '#FFF9C4' }}> {/* Very light yellow */}
                  <h3 className="text-lg font-semibold mb-2">Psychologie Client</h3>
                  <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                    <h4 className="text-sm font-semibold mb-2">Motivations principales et valeurs</h4>
                    <p className="text-[#4B5563]">{personaData.motivations_valeurs}</p>
                  </div>
                  <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                    <h4 className="text-sm font-semibold mb-2">Défis rencontrés et frustrations</h4>
                    <p className="text-[#4B5563]">{personaData.defis_frustrations}</p>
                  </div>
                </div>

                <div className="rounded-md p-4" style={{ backgroundColor: '#C8E6C9' }}> {/* Very light green */}
                  <h3 className="text-lg font-semibold mb-2">Comportement d'Achat</h3>
                  <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                    <h4 className="text-sm font-semibold mb-2">Habitudes et comportements d'achat</h4>
                    <p className="text-[#4B5563]">{personaData.comportement_achat}</p>
                  </div>
                  <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                    <h4 className="text-sm font-semibold mb-2">Présence et activité sur les canaux digitaux</h4>
                    <p className="text-[#4B5563]">{personaData.presence_digitale}</p>
                  </div>
                </div>

                <div className="rounded-md p-4" style={{ backgroundColor: '#BBDEFB' }}> {/* Very light blue */}
                  <h3 className="text-lg font-semibold mb-2">Stratégies Recommandées</h3>
                  <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                    <h4 className="text-sm font-semibold mb-2">Stratégies marketing recommandées</h4>
                    <p className="text-[#4B5563]">{personaData.strategies_marketing}</p>
                  </div>
                  <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                    <h4 className="text-sm font-semibold mb-2">Approche de vente adaptée</h4>
                    <p className="text-[#4B5563]">{personaData.approche_vente}</p>
                  </div>
                </div>
              </div>
            )}

            {selectedType === 'Entreprise' && personaBusinessData && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-md p-4" style={{ backgroundColor: '#E1BEE7' }}> {/* Very light purple */}
                  <h3 className="text-lg font-semibold mb-2">Profil Professionnel</h3>
                  <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                    <h4 className="text-sm font-semibold mb-2">Identité et profil professionnel</h4>
                    <p className="text-[#4B5563]">{personaBusinessData.identite_professionnelle}</p>
                  </div>
                  <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                    <h4 className="text-sm font-semibold mb-2">Contexte et environnement organisationnel</h4>
                    <p className="text-[#4B5563]">{personaBusinessData.contexte_organisationnel}</p>
                  </div>
                </div>

                <div className="rounded-md p-4" style={{ backgroundColor: '#FFF9C4' }}> {/* Very light yellow */}
                  <h3 className="text-lg font-semibold mb-2">Contexte Business</h3>
                  <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                    <h4 className="text-sm font-semibold mb-2">Responsabilités principales</h4>
                    <p className="text-[#4B5563]">{personaBusinessData.responsabilites_cles}</p>
                  </div>
                  <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                    <h4 className="text-sm font-semibold mb-2">Enjeux et défis business</h4>
                    <p className="text-[#4B5563]">{personaBusinessData.enjeux_business}</p>
                  </div>
                </div>

                <div className="rounded-md p-4" style={{ backgroundColor: '#C8E6C9' }}> {/* Very light green */}
                  <h3 className="text-lg font-semibold mb-2">Processus Décisionnel</h3>
                  <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                    <h4 className="text-sm font-semibold mb-2">Processus de prise de décision</h4>
                    <p className="text-[#4B5563]">{personaBusinessData.processus_decision}</p>
                  </div>
                  <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                    <h4 className="text-sm font-semibold mb-2">Méthodes de recherche d'infos</h4>
                    <p className="text-[#4B5563]">{personaBusinessData.recherche_information}</p>
                  </div>
                </div>

                <div className="rounded-md p-4" style={{ backgroundColor: '#BBDEFB' }}> {/* Very light blue */}
                  <h3 className="text-lg font-semibold mb-2">Stratégies d'Approche</h3>
                  <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                    <h4 className="text-sm font-semibold mb-2">Objections et freins</h4>
                    <p className="text-[#4B5563]">{personaBusinessData.objections_courantes}</p>
                  </div>
                  <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                    <h4 className="text-sm font-semibold mb-2">Stratégie d'approche</h4>
                    <p className="text-[#4B5563]">{personaBusinessData.strategie_approche}</p>
                  </div>
                </div>
              </div>
            )}

            {selectedType === 'Organisme' && personaOrganismeData && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-md p-4" style={{ backgroundColor: '#E1BEE7' }}> {/* Very light purple */}
                  <h3 className="text-lg font-semibold mb-2">Profil Institutionnel</h3>
                  <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                    <h4 className="text-sm font-semibold mb-2">Identité et profil institutionnel</h4>
                    <p className="text-[#4B5563]">{personaOrganismeData.identite_institutionnelle}</p>
                  </div>
                  <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                    <h4 className="text-sm font-semibold mb-2">Contexte et environnement organisationnel</h4>
                    <p className="text-[#4B5563]">{personaOrganismeData.contexte_organisationnel}</p>
                  </div>
                </div>

                <div className="rounded-md p-4" style={{ backgroundColor: '#FFF9C4' }}> {/* Very light yellow */}
                  <h3 className="text-lg font-semibold mb-2">Mission et Contraintes</h3>
                  <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                    <h4 className="text-sm font-semibold mb-2">Mission et responsabilités de l'organisme</h4>
                    <p className="text-[#4B5563]">{personaOrganismeData.mission_responsabilites}</p>
                  </div>
                  <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                    <h4 className="text-sm font-semibold mb-2">Contraintes et limitations budgétaires</h4>
                    <p className="text-[#4B5563]">{personaOrganismeData.contraintes_budgetaires}</p>
                  </div>
                </div>

                <div className="rounded-md p-4" style={{ backgroundColor: '#C8E6C9' }}> {/* Very light green */}
                  <h3 className="text-lg font-semibold mb-2">Enjeux et Décisions</h3>
                  <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                    <h4 className="text-sm font-semibold mb-2">Enjeux et priorités principales</h4>
                    <p className="text-[#4B5563]">{personaOrganismeData.enjeux_prioritaires}</p>
                  </div>
                  <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                    <h4 className="text-sm font-semibold mb-2">Processus de prise de décision</h4>
                    <p className="text-[#4B5563]">{personaOrganismeData.processus_decision}</p>
                  </div>
                </div>

                <div className="rounded-md p-4" style={{ backgroundColor: '#BBDEFB' }}> {/* Very light blue */}
                  <h3 className="text-lg font-semibold mb-2">Valeurs et Stratégies</h3>
                  <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                    <h4 className="text-sm font-semibold mb-2">Valeurs et attentes de l'organisme</h4>
                    <p className="text-[#4B5563]">{personaOrganismeData.valeurs_attentes}</p>
                  </div>
                  <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                    <h4 className="text-sm font-semibold mb-2">Stratégie d'approche recommandée</h4>
                    <p className="text-[#4B5563]">{personaOrganismeData.strategie_approche}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Recommandations Section */}
            <div className="mt-6">
              <h2 className="text-xl font-bold mb-2">Recommandations</h2>
              <div className="bg-gray-100 rounded-md p-4">
                {selectedType === 'Particulier' && personaData?.recommandations_b2c?.split('\n').filter(Boolean).map((item, index) => (
                  <p key={index} className="text-[#4B5563] mb-2" dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></p>
                ))}
                {selectedType === 'Entreprise' && personaBusinessData?.recommandations_b2b?.split('\n').filter(Boolean).map((item, index) => (
                  <p key={index} className="text-[#4B5563] mb-2" dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></p>
                ))}
                {selectedType === 'Organisme' && personaOrganismeData?.recommandations_organisme?.split('\n').filter(Boolean).map((item, index) => (
                  <p key={index} className="text-[#4B5563] mb-2" dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></p>
                ))}
              </div>
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

export default PersonaExpressLivrable;