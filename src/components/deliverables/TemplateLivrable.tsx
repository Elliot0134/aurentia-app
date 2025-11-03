import React, { useEffect } from 'react';
import HarmonizedDeliverableModal from './shared/HarmonizedDeliverableModal';
import HarmonizedDeliverableCard from './shared/HarmonizedDeliverableCard';
import { useHarmonizedModal } from './shared/useHarmonizedModal';
import DeliverableCardSkeleton from './shared/DeliverableCardSkeleton';
import { useDeliverablesLoading } from '@/contexts/DeliverablesLoadingContext';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
  description: string;
  avis: string;
  justification_avis: string;
  structure: StructureSection[];
  iconSrc?: string;
  definition?: string;
  recommendations?: string;
  importance?: string;
}

const TemplateLivrable: React.FC<LivrableProps> = ({
  title,
  description,
  avis,
  justification_avis,
  structure,
  iconSrc = "/icones-livrables/market-icon.png",
  definition,
  recommendations,
  importance,
}) => {
  const { isGlobalLoading, registerDeliverable, setDeliverableLoaded } = useDeliverablesLoading();

  const { isPopupOpen, handleTemplateClick, handlePopupClose } = useHarmonizedModal({
    hasContent: !!avis || !!justification_avis || (structure && structure.length > 0),
    hasDefinition: !!definition,
    hasRecommendations: !!recommendations,
  });

  // Register this deliverable on mount and immediately mark as loaded (no async data)
  useEffect(() => {
    registerDeliverable('template-livrable');
    setDeliverableLoaded('template-livrable');
  }, [registerDeliverable, setDeliverableLoaded]);

  const modalContent = (
    <div className="space-y-6">
      {structure && structure.length > 0 && (
        <Accordion type="single" collapsible className="w-full">
          {structure.map((section, sectionIndex) => (
            <AccordionItem value={`section-${sectionIndex}`} key={sectionIndex}>
              <AccordionTrigger className="text-lg">{section.title}</AccordionTrigger>
              <AccordionContent>
                {section.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="bg-gray-50 rounded-md px-4 pb-4 pt-4 mb-4">
                    <h5 className="font-medium text-gray-700 mb-2">{item.title}</h5>
                    <p className="text-gray-600">{item.content}</p>
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );

  if (isGlobalLoading) {
    return <DeliverableCardSkeleton />;
  }

  return (
    <>
      <HarmonizedDeliverableCard
        title={title}
        description={description}
        avis={avis || 'Non généré'}
        iconSrc={iconSrc}
        onClick={handleTemplateClick}
      />

      <HarmonizedDeliverableModal
        isOpen={isPopupOpen}
        onClose={handlePopupClose}
        title={title}
        iconComponent={<img src={iconSrc} alt={`${title} icon`} className="h-16 w-16 object-contain" />}
        contentComponent={modalContent}
        definition={definition}
        importance={importance}
        recommendations={recommendations}
        showContentTab={true}
      />
    </>
  );
};

export default TemplateLivrable;
