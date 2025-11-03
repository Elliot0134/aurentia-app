import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Timeline from '@/components/Timeline';
import { Trophy, Globe, Handshake } from 'lucide-react';
import HarmonizedDeliverableCard from './shared/HarmonizedDeliverableCard';
import HarmonizedDeliverableModal from './shared/HarmonizedDeliverableModal';
import { useHarmonizedModal } from './shared/useHarmonizedModal';
import { useDeliverableWithComments } from '@/hooks/useDeliverableWithComments';
import DeliverableCardSkeleton from './shared/DeliverableCardSkeleton';
import { useDeliverablesLoading } from '@/contexts/DeliverablesLoadingContext';

interface SuccessStoryData {
  projections_un_an_titre: string;
  projections_un_an_vision: string;
  projections_trois_ans_titre: string;
  projections_trois_ans_vision: string;
  projections_cinq_ans_titre: string;
  projections_cinq_ans_vision: string;
  message_motivation: string;
  avis: string | null;
}

const MaSuccessStoryLivrable: React.FC = () => {
  const [successStoryData, setSuccessStoryData] = useState<SuccessStoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isGlobalLoading, registerDeliverable, setDeliverableLoaded } = useDeliverablesLoading();

  const { projectId } = useParams<{ projectId: string }>();

  // Register this deliverable on mount
  useEffect(() => {
    registerDeliverable('success-story');
  }, [registerDeliverable]);

  const deliverableTitle = "Ma Success Story";
  const deliverableDescription = "Visualisez vos projections d'évolution entrepreneuriale";
  const deliverableDefinition = "La Success Story est un outil de projection qui permet de visualiser l'évolution de votre entreprise à travers différentes échéances temporelles, accompagnée d'un message de motivation personnalisé.";
  const deliverableImportance = "Ce livrable est essentiel pour maintenir la motivation entrepreneuriale, clarifier la vision à long terme et structurer les objectifs de croissance de l'entreprise selon des horizons temporels définis.";

  // Utilisation du hook harmonisé pour la modal
  const { isPopupOpen, handleTemplateClick, handlePopupClose } = useHarmonizedModal({
    hasContent: true,
    hasDefinition: true
  });

  // Initialize deliverable for comments
  const { deliverableId, organizationId } = useDeliverableWithComments({
    projectId: projectId || '',
    deliverableType: 'other',
    deliverableTitle: 'Ma Success Story',
  });

  const transformDataToTimelineItems = (data: SuccessStoryData) => {
    const items = [];

    if (data.projections_un_an_titre || data.projections_un_an_vision) {
      items.push({
        id: 'projection-1-year',
        title: data.projections_un_an_titre || 'Projection 1 An',
        subtitle: 'Projections à court terme (1 an)',
        description: data.projections_un_an_vision || '',
        date: '1 an',
        icon: <Trophy className="w-5 h-5" />,
      });
    }

    if (data.projections_trois_ans_titre || data.projections_trois_ans_vision) {
      items.push({
        id: 'projection-3-years',
        title: data.projections_trois_ans_titre || 'Projection 3 Ans',
        subtitle: 'Projections à moyen terme (3 ans)',
        description: data.projections_trois_ans_vision || '',
        date: '3 ans',
        icon: <Globe className="w-5 h-5" />,
      });
    }

    if (data.projections_cinq_ans_titre || data.projections_cinq_ans_vision) {
      items.push({
        id: 'projection-5-years',
        title: data.projections_cinq_ans_titre || 'Projection 5 Ans',
        subtitle: 'Projections à long terme (5 ans)',
        description: data.projections_cinq_ans_vision || '',
        date: '5 ans',
        icon: <Handshake className="w-5 h-5" />,
      });
    }

    return items;
  };

  useEffect(() => {
    const fetchSuccessStoryData = async () => {
      if (!projectId) {
        setError("Project ID not found in URL");
        setLoading(false);
        setDeliverableLoaded('success-story');
        return;
      }

      const { data, error } = await supabase
        .from('success_story')
        .select('*, avis')
        .eq('project_id', projectId)
        .single();

      if (error) {
        setError(error.message);
        setSuccessStoryData(null);
      } else {
        setSuccessStoryData(data);
      }
      setLoading(false);
      setDeliverableLoaded('success-story');
    };

    fetchSuccessStoryData();
  }, [projectId, setDeliverableLoaded]);

  // Content component for the modal
  const successStoryContent = (
    <>
      {loading && <p>Loading data...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      {successStoryData && (
        <>
          {successStoryData.message_motivation && (
            <div className="mb-8">
              <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                <h3 className="text-lg font-semibold mb-2">Un petit message pour toi...</h3>
                <p className="text-[#4B5563]">{successStoryData.message_motivation}</p>
              </div>
            </div>
          )}
          <Timeline items={transformDataToTimelineItems(successStoryData)} />
        </>
      )}
    </>
  );

  // Show skeleton while global loading OR individual loading
  if (isGlobalLoading || loading) {
    return <DeliverableCardSkeleton />;
  }

  return (
    <>
      {/* Utilisation de la carte harmonisée */}
      <HarmonizedDeliverableCard
        title={deliverableTitle}
        description={deliverableDescription}
        avis={successStoryData?.avis || 'Commentaire'}
        iconSrc="/icones-livrables/story-icon.png"
        onClick={handleTemplateClick}
      />

      {/* Utilisation de la modal harmonisée */}
      <HarmonizedDeliverableModal
        isOpen={isPopupOpen}
        onClose={handlePopupClose}
        title={deliverableTitle}
        iconComponent={<img src="/icones-livrables/story-icon.png" alt="Success Story Icon" className="w-full h-full object-contain" />}
        contentComponent={successStoryContent}
        definition={deliverableDefinition}
        importance={deliverableImportance}
        showContentTab={true}
        showCommentsTab={true}
        deliverableId={deliverableId || undefined}
        organizationId={organizationId || undefined}
      />
    </>
  );
};

export default MaSuccessStoryLivrable;
