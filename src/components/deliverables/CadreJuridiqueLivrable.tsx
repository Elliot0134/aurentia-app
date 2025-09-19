import React, { useState, useEffect } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import ReactMarkdown from 'react-markdown';
import { createClient } from '@supabase/supabase-js';
import HarmonizedDeliverableCard from './shared/HarmonizedDeliverableCard';
import HarmonizedDeliverableModal from './shared/HarmonizedDeliverableModal';
import { useHarmonizedModal } from './shared/useHarmonizedModal'; // Import the new hook

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
  description: string; // Ajout de la description
  iconSrc?: string; // Add iconSrc prop for the card image
  definition?: string; // Nouvelle prop pour la définition
  importance?: string; // Nouvelle prop pour l'importance
  recommendations?: string; // Nouvelle prop pour les recommandations
  projectId: string; // Ajout de projectId pour filtrer les données
}

const CadreJuridiqueLivrable: React.FC<LivrableProps> = ({
  title,
  description, // Récupération de la description
  iconSrc = "/icones-livrables/juridique-icon.png", // Default icon for Cadre Juridique
  projectId,
}) => {
  const [structureData, setStructureData] = useState<any>(null); // Données de la colonne 'structure'
  const [dbRecommendations, setDbRecommendations] = useState<string | null>(null); // Recommandations de la DB
  const [dbAvis, setDbAvis] = useState<string | null>(null); // Avis de la DB
  const [dbJustificationAvis, setDbJustificationAvis] = useState<string | null>(null); // Justification Avis de la DB
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Données statiques du livrable
  const staticDefinition = "Le cadre juridique d'une entreprise constitue l'architecture légale fondamentale qui détermine sa structure, son fonctionnement et ses obligations. Il englobe le choix de la forme juridique (SARL, SAS, etc.) qui définit les modalités de gouvernance, la répartition des pouvoirs, les responsabilités des dirigeants et associés, ainsi que le régime fiscal applicable.\n\nCette analyse comprend également l'identification et la maîtrise des risques juridiques spécifiques au secteur d'activité, incluant les obligations réglementaires, les certifications requises, les licences nécessaires et la conformité aux normes sectorielles. Elle intègre la mise en place de mesures préventives, la souscription d'assurances adaptées et la définition des protocoles de compliance.\n\nLe volet propriété intellectuelle constitue un pilier essentiel, couvrant la protection des marques, des brevets potentiels, des droits d'auteur et des secrets d'affaires. Il établit la stratégie de dépôt, de surveillance et de défense des actifs immatériels qui forment souvent la valeur différenciatrice de l'entreprise.";
  const staticImportance = "Le cadre juridique est le socle de sécurité et de crédibilité de toute entreprise. Une structuration juridique inadéquate peut entraîner des conséquences dramatiques : responsabilité personnelle illimitée des dirigeants, exposition patrimoniale maximale, difficultés de financement, problèmes de gouvernance, conflits entre associés non anticipés, et impossibilité de céder ou transmettre l'entreprise dans de bonnes conditions.\n\nL'absence de maîtrise des risques sectoriels expose l'entrepreneur à des sanctions administratives, pénales ou civiles, des rappels de produits, des dommages-intérêts, une perte de réputation irréversible et potentiellement la fermeture de l'activité. Dans des secteurs réglementés, l'ignorance de la compliance peut coûter l'existence même de l'entreprise.\n\nLa négligence de la propriété intellectuelle représente un risque majeur de spoliation. Sans protection adéquate, les concurrents peuvent s'approprier librement les innovations, la marque, l'image de marque et les développements techniques, anéantissant l'avantage concurrentiel et la valeur de l'entreprise. Inversement, l'entrepreneur non protégé s'expose aux actions en contrefaçon de tiers.\n\nUn cadre juridique solide facilite les levées de fonds, rassure les partenaires commerciaux, optimise la fiscalité, préserve la flexibilité opérationnelle et prépare les évolutions futures de l'entreprise. Il constitue un facteur déterminant de pérennité et de croissance.";

  // Utilisation du hook harmonisé pour la modal
  const { isPopupOpen, handleTemplateClick, handlePopupClose } = useHarmonizedModal({
    hasContent: !!structureData,
    hasDefinition: !!staticDefinition,
    hasRecommendations: !!dbRecommendations,
  });

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
      {/* Utilisation de la carte harmonisée */}
      <HarmonizedDeliverableCard
        title={title}
        description={dbJustificationAvis || description}
        avis={dbAvis || 'Non généré'}
        iconSrc={iconSrc}
        onClick={handleTemplateClick}
      />

      {/* Utilisation de la modal harmonisée */}
      <HarmonizedDeliverableModal
        isOpen={isPopupOpen}
        onClose={handlePopupClose}
        title={title}
        iconComponent={<img src={iconSrc} alt={`${title} icon`} className="h-16 w-16 object-contain" />}
        contentComponent={renderStructureContent()}
        definition={staticDefinition}
        importance={staticImportance}
        recommendations={dbRecommendations}
        showContentTab={true}
      />
    </>
  );
};

export default CadreJuridiqueLivrable;
