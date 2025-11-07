import React, { useState, useEffect } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import ReactMarkdown from 'react-markdown';
import { supabase } from '@/integrations/supabase/client';
import HarmonizedDeliverableCard from './shared/HarmonizedDeliverableCard';
import HarmonizedDeliverableModal from './shared/HarmonizedDeliverableModal';
import { useHarmonizedModal } from './shared/useHarmonizedModal';
import { useDeliverableWithComments } from '@/hooks/useDeliverableWithComments';
import DeliverableCardSkeleton from './shared/DeliverableCardSkeleton';
import { useDeliverablesLoading } from '@/contexts/DeliverablesLoadingContext';
import { DefinitionContent } from './shared/DefinitionContent';

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
  const { isGlobalLoading, registerDeliverable, setDeliverableLoaded } = useDeliverablesLoading();

  // Register this deliverable on mount
  useEffect(() => {
    registerDeliverable('cadre-juridique');
  }, [registerDeliverable]);

  // Données statiques du livrable
  const staticDefinition = <DefinitionContent deliverableType="cadre_juridique" />;

  // Utilisation du hook harmonisé pour la modal
  const { isPopupOpen, handleTemplateClick, handlePopupClose } = useHarmonizedModal({
    hasContent: !!structureData,
    hasDefinition: !!staticDefinition,
    hasRecommendations: !!dbRecommendations,
  });

  // Initialize deliverable for comments
  const { deliverableId, organizationId } = useDeliverableWithComments({
    projectId: projectId || '',
    deliverableType: 'legal',
    deliverableTitle: 'Cadre Juridique',
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
        setDeliverableLoaded('cadre-juridique');
      }
    };

    if (projectId) {
      fetchJuridiqueData();
    }
  }, [projectId, setDeliverableLoaded]);

  // Show skeleton while global loading OR individual loading
  if (isGlobalLoading || isLoading) {
    return <DeliverableCardSkeleton />;
  }

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
                  <h4 className="text-base font-sans font-bold mb-2">{item.title}</h4>
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
        recommendations={dbRecommendations}
        showContentTab={true}
        showCommentsTab={true}
        deliverableId={deliverableId || undefined}
        organizationId={organizationId || undefined}
      />
    </>
  );
};

export default CadreJuridiqueLivrable;
