import React, { useState, useEffect } from 'react';
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion"; // Importation des composants Accordion
import { supabase } from '../../integrations/supabase/client';
import { useParams } from 'react-router-dom';
import HarmonizedDeliverableCard from './shared/HarmonizedDeliverableCard';
import HarmonizedDeliverableModal from './shared/HarmonizedDeliverableModal';
import { useHarmonizedModal } from './shared/useHarmonizedModal';
import { useDeliverableWithComments } from '@/hooks/useDeliverableWithComments';

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
  const [personaData, setPersonaData] = useState<PersonaData | null>(null);
  const [personaBusinessData, setPersonaBusinessData] = useState<PersonaBusinessData | null>(null);
  const [personaOrganismeData, setPersonaOrganismeData] = useState<PersonaOrganismeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>('Particulier');

  const { projectId } = useParams<{ projectId: string }>();

  // Utilisation du hook harmonisé pour la modal
  const { isPopupOpen, handleTemplateClick, handlePopupClose } = useHarmonizedModal({
    hasContent: true,
    hasRecommendations: true,
    hasDefinition: true
  });

  // Initialize deliverable for comments
  const { deliverableId, organizationId, isInOrganization } = useDeliverableWithComments({
    projectId: projectId || '',
    deliverableType: 'other',
    deliverableTitle: 'Persona Express',
  });

  // Debug: Log deliverable info
  useEffect(() => {
    console.log('🔍 PersonaExpress Deliverable Debug:', {
      deliverableId,
      organizationId,
      isInOrganization,
      showCommentsTab: true,
      shouldShowTab: true && !!deliverableId
    });
  }, [deliverableId, organizationId, isInOrganization]);

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
        // Handle b2b error if necessary
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
  }, [projectId]);

  useEffect(() => {
    console.log("Persona Data (Particulier):", personaData);
    console.log("Persona Business Data (Entreprise):", personaBusinessData);
    console.log("Persona Organisme Data (Organisme):", personaOrganismeData);
    console.log("Selected Type:", selectedType);
    console.log("Recommendations for selected type:", getGeneralRecommendations());
  }, [personaData, personaBusinessData, personaOrganismeData, selectedType]);

  const title = "Persona Express";
  const definition = "Un persona est un profil semi-fictif représentant votre client idéal, basé sur des données réelles et des recherches sur votre marché cible.";
  const importanceText = "Créer des personas permet de mieux comprendre vos clients, d'adapter votre communication, de développer des produits qui répondent à leurs besoins et d'optimiser vos stratégies marketing et commerciales";

  // Prépare les recommandations générales pour l'onglet "Recommandations"
  // Fonction utilitaire pour formater le texte avec des sauts de ligne et du gras
  const getGeneralRecommendations = (): string => {
    let recommendationsContent = personaData?.recommandations;
    if (Array.isArray(recommendationsContent)) {
      // Si c'est un tableau, itérer sur les éléments et les convertir en chaîne
      return recommendationsContent.map(item => {
        if (typeof item === 'object' && item !== null) {
          // Tenter d'extraire une propriété 'text' ou 'value', sinon stringify
          return item.text || item.value || JSON.stringify(item);
        }
        return String(item);
      }).join('\n\n'); // Joindre avec des doubles sauts de ligne pour le Markdown
    }
    return recommendationsContent || '';
  };

  // Fonction utilitaire pour formater le texte avec des sauts de ligne et du gras
  // Cette fonction ne sera plus utilisée pour les recommandations générales, mais peut rester pour d'autres usages
  const formatText = (text: string | null | undefined) => {
    if (!text) return null;
    
    // Convertir le texte en éléments React avec mise en forme
    const formatLine = (line: string) => {
      // Expression régulière pour trouver le texte en gras (entouré de ** ou __)
      const boldRegex = /(\*\*|__)(.*?)\1/g;
      const parts = [];
      let lastIndex = 0;
      let match;
      
      while ((match = boldRegex.exec(line)) !== null) {
        // Ajouter le texte avant le gras
        if (match.index > lastIndex) {
          parts.push(line.substring(lastIndex, match.index));
        }
        
        // Ajouter le texte en gras
        parts.push(<strong key={`${line}-${match.index}`}>{match[2]}</strong>);
        lastIndex = match.index + match[0].length;
      }
      
      // Ajouter le reste du texte après le dernier élément en gras
      if (lastIndex < line.length) {
        parts.push(line.substring(lastIndex));
      }
      
      return parts;
    };
    
    // Convertir les sauts de ligne en balises <br />
    const lines = text.split('\n');
    return lines.map((line, index) => (
      <React.Fragment key={index}>
        {index > 0 && <br />}
        {formatLine(line)}
      </React.Fragment>
    ));
  };

  // Contenu spécifique de PersonaExpress avec le sélecteur
  const personaContent = (
    <>
      <ToggleGroup type="single" value={selectedType} onValueChange={setSelectedType} className="flex-row mb-4 mt-4 justify-start">
        <ToggleGroupItem
          value="Particulier"
          aria-label="Toggle particuliers"
          className={`px-3 py-1 text-sm mr-2 ${selectedType === 'Particulier' ? 'bg-aurentia-orange-aurentia text-white' : 'bg-gray-200'}`}
        >
          <span className={selectedType === 'Particulier' ? 'text-white' : ''}>Particuliers</span>
        </ToggleGroupItem>
        <ToggleGroupItem
          value="Entreprise"
          aria-label="Toggle entreprises"
          className={`px-3 py-1 text-sm mr-2 ${selectedType === 'Entreprise' ? 'bg-aurentia-orange-aurentia text-white' : 'bg-gray-200'}`}
        >
          <span className={selectedType === 'Entreprise' ? 'text-white' : ''}>Entreprises</span>
        </ToggleGroupItem>
        <ToggleGroupItem
          value="Organisme"
          aria-label="Toggle organismes"
          className={`px-3 py-1 text-sm mr-2 ${selectedType === 'Organisme' ? 'bg-aurentia-orange-aurentia text-white' : 'bg-gray-200'}`}
        >
          <span className={selectedType === 'Organisme' ? 'text-white' : ''}>Organismes</span>
        </ToggleGroupItem>
      </ToggleGroup>

      {error && <p className="text-red-500">Error: {error}</p>}
      {loading && <p>Loading persona data...</p>}

      {selectedType === 'Particulier' && personaData && (
        <div>
          {personaData.recommandations_b2c && (
            <Accordion type="single" collapsible className="w-full mb-6">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-lg font-semibold">Recommandations spécifiques</AccordionTrigger>
                <AccordionContent>
                  <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
                    <p className="text-[#4B5563]">{formatText(personaData.recommandations_b2c)}</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
          <div className="grid grid-cols-1 gap-6"> {/* Changed to grid-cols-1 */}
            <div className="rounded-md p-4 bg-aurentia-orange-light-1">
              <h3 className="text-lg font-semibold mb-2">Profil Client</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> {/* New grid for sub-items */}
                <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                  <h4 className="text-sm font-semibold mb-2">Identité et profil du persona</h4>
                  <p className="text-[#4B5563]">{personaData.identite}</p>
                </div>
                <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                  <h4 className="text-sm font-semibold mb-2">Situation personnelle et environnement</h4>
                  <p className="text-[#4B5563]">{personaData.contexte_personnel}</p>
                </div>
              </div>
            </div>

            <div className="rounded-md p-4 bg-aurentia-orange-light-2">
              <h3 className="text-lg font-semibold mb-2">Psychologie Client</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> {/* New grid for sub-items */}
                <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                  <h4 className="text-sm font-semibold mb-2">Motivations principales et valeurs</h4>
                  <p className="text-[#4B5563]">{personaData.motivations_valeurs}</p>
                </div>
                <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                  <h4 className="text-sm font-semibold mb-2">Défis rencontrés et frustrations</h4>
                  <p className="text-[#4B5563]">{personaData.defis_frustrations}</p>
                </div>
              </div>
            </div>

            <div className="rounded-md p-4 bg-aurentia-orange-light-3">
              <h3 className="text-lg font-semibold mb-2">Comportement d'Achat</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> {/* New grid for sub-items */}
                <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                  <h4 className="text-sm font-semibold mb-2">Habitudes et comportements d'achat</h4>
                  <p className="text-[#4B5563]">{personaData.comportement_achat}</p>
                </div>
                <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                  <h4 className="text-sm font-semibold mb-2">Présence et activité sur les canaux digitaux</h4>
                  <p className="text-[#4B5563]">{personaData.presence_digitale}</p>
                </div>
              </div>
            </div>

            <div className="rounded-md p-4 bg-aurentia-orange-light-4">
              <h3 className="text-lg font-semibold mb-2">Stratégies Recommandées</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> {/* New grid for sub-items */}
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
          </div>
        </div>
      )}

      {selectedType === 'Entreprise' && personaBusinessData && (
        <div>
          {personaBusinessData.recommandations_b2b && (
            <Accordion type="single" collapsible className="w-full mb-6">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-lg font-semibold">Recommandations spécifiques</AccordionTrigger>
                <AccordionContent>
                  <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
                    <p className="text-[#4B5563]">{formatText(personaBusinessData.recommandations_b2b)}</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
          <div className="grid grid-cols-1 gap-6"> {/* Changed to grid-cols-1 */}
            <div className="rounded-md p-4 bg-aurentia-orange-light-1">
              <h3 className="text-lg font-semibold mb-2">Profil Professionnel</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> {/* New grid for sub-items */}
                <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                  <h4 className="text-sm font-semibold mb-2">Identité et profil professionnel</h4>
                  <p className="text-[#4B5563]">{personaBusinessData.identite_professionnelle}</p>
                </div>
                <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                  <h4 className="text-sm font-semibold mb-2">Contexte et environnement organisationnel</h4>
                  <p className="text-[#4B5563]">{personaBusinessData.contexte_organisationnel}</p>
                </div>
              </div>
            </div>

            <div className="rounded-md p-4 bg-aurentia-orange-light-2">
              <h3 className="text-lg font-semibold mb-2">Contexte Business</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> {/* New grid for sub-items */}
                <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                  <h4 className="text-sm font-semibold mb-2">Responsabilités principales</h4>
                  <p className="text-[#4B5563]">{personaBusinessData.responsabilites_cles}</p>
                </div>
                <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                  <h4 className="text-sm font-semibold mb-2">Enjeux et défis business</h4>
                  <p className="text-[#4B5563]">{personaBusinessData.enjeux_business}</p>
                </div>
              </div>
            </div>

            <div className="rounded-md p-4 bg-aurentia-orange-light-3">
              <h3 className="text-lg font-semibold mb-2">Processus Décisionnel</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> {/* New grid for sub-items */}
                <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                  <h4 className="text-sm font-semibold mb-2">Processus de prise de décision</h4>
                  <p className="text-[#4B5563]">{personaBusinessData.processus_decision}</p>
                </div>
                <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                  <h4 className="text-sm font-semibold mb-2">Méthodes de recherche d'infos</h4>
                  <p className="text-[#4B5563]">{personaBusinessData.recherche_information}</p>
                </div>
              </div>
            </div>

            <div className="rounded-md p-4 bg-aurentia-orange-light-4">
              <h3 className="text-lg font-semibold mb-2">Stratégies d'Approche</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> {/* New grid for sub-items */}
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
          </div>
        </div>
      )}

      {selectedType === 'Organisme' && personaOrganismeData && (
        <div>
          {personaOrganismeData.recommandations_organisme && (
            <Accordion type="single" collapsible className="w-full mb-6">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-lg font-semibold">Recommandations spécifiques</AccordionTrigger>
                <AccordionContent>
                  <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
                    <p className="text-[#4B5563]">{formatText(personaOrganismeData.recommandations_organisme)}</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
          <div className="grid grid-cols-1 gap-6"> {/* Changed to grid-cols-1 */}
            <div className="rounded-md p-4 bg-aurentia-orange-light-1">
              <h3 className="text-lg font-semibold mb-2">Profil Institutionnel</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> {/* New grid for sub-items */}
                <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                  <h4 className="text-sm font-semibold mb-2">Identité et profil institutionnel</h4>
                  <p className="text-[#4B5563]">{personaOrganismeData.identite_institutionnelle}</p>
                </div>
                <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                  <h4 className="text-sm font-semibold mb-2">Contexte et environnement organisationnel</h4>
                  <p className="text-[#4B5563]">{personaOrganismeData.contexte_organisationnel}</p>
                </div>
              </div>
            </div>

            <div className="rounded-md p-4 bg-aurentia-orange-light-2">
              <h3 className="text-lg font-semibold mb-2">Mission et Contraintes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> {/* New grid for sub-items */}
                <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                  <h4 className="text-sm font-semibold mb-2">Mission et responsabilités de l'organisme</h4>
                  <p className="text-[#4B5563]">{personaOrganismeData.mission_responsabilites}</p>
                </div>
                <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                  <h4 className="text-sm font-semibold mb-2">Contraintes et limitations budgétaires</h4>
                  <p className="text-[#4B5563]">{personaOrganismeData.contraintes_budgetaires}</p>
                </div>
              </div>
            </div>

            <div className="rounded-md p-4 bg-aurentia-orange-light-3">
              <h3 className="text-lg font-semibold mb-2">Enjeux et Décisions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> {/* New grid for sub-items */}
                <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                  <h4 className="text-sm font-semibold mb-2">Enjeux et priorités principales</h4>
                  <p className="text-[#4B5563]">{personaOrganismeData.enjeux_prioritaires}</p>
                </div>
                <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                  <h4 className="text-sm font-semibold mb-2">Processus de prise de décision</h4>
                  <p className="text-[#4B5563]">{personaOrganismeData.processus_decision}</p>
                </div>
              </div>
            </div>

            <div className="rounded-md p-4 bg-aurentia-orange-light-4">
              <h3 className="text-lg font-semibold mb-2">Valeurs et Stratégies</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> {/* New grid for sub-items */}
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
        description={personaData?.justification_avis}
        avis={personaData?.avis || 'Commentaire'}
        iconSrc="/icones-livrables/persona-icon.png"
        onClick={handleTemplateClick}
      />

      {/* Utilisation de la modal harmonisée */}
      <HarmonizedDeliverableModal
        isOpen={isPopupOpen}
        onClose={handlePopupClose}
        title={title}
        iconComponent={<img src="/icones-livrables/persona-icon.png" alt="Persona Icon" className="w-full h-full object-contain" />}
        contentComponent={personaContent}
        recommendations={getGeneralRecommendations()} // Utilisation de la nouvelle fonction
        definition={definition}
        importance={importanceText} // Passage de la nouvelle prop 'importance'
        showContentTab={true}
        showCommentsTab={true} // Always show comments tab
        deliverableId={deliverableId || undefined}
        organizationId={organizationId || undefined}
      />
    </>
  );
};

export default PersonaExpressLivrable;