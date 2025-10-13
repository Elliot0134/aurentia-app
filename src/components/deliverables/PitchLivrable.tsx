import React, { useState, useEffect } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { useParams } from 'react-router-dom';
import HarmonizedDeliverableCard from './shared/HarmonizedDeliverableCard';
import HarmonizedDeliverableModal from './shared/HarmonizedDeliverableModal';
import { useHarmonizedModal } from './shared/useHarmonizedModal';
import { useDeliverableWithComments } from '@/hooks/useDeliverableWithComments';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Copy, Check } from 'lucide-react';

interface PitchData {
  pitch_30_secondes_texte: string;
  pitch_30_secondes_appel_action: string;
  pitch_court_texte: string;
  pitch_court_appel_action: string;
  pitch_complet_texte: string;
  pitch_complet_appel_action: string;
  avis: string | null;
}

const PitchLivrable: React.FC = () => {
  const [pitchData, setPitchData] = useState<PitchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedState, setCopiedState] = useState<{ [key: string]: boolean }>({});

  const { projectId } = useParams<{ projectId: string }>();

  // Utilisation du hook harmonisé pour la modal
  const { isPopupOpen, handleTemplateClick, handlePopupClose } = useHarmonizedModal({
    hasContent: true,
    hasDefinition: true
  });

  // Initialize deliverable for comments
  const { deliverableId, organizationId } = useDeliverableWithComments({
    projectId: projectId || '',
    deliverableType: 'pitch',
    deliverableTitle: 'Pitch',
  });

  useEffect(() => {
    const fetchPitchData = async () => {
      if (!projectId) {
        setError("Project ID not found in URL.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('pitch')
        .select('*, avis')
        .eq('project_id', projectId)
        .single();

      if (error) {
        setError(error.message);
        setPitchData(null);
      } else {
        setPitchData(data);
      }
      setLoading(false);
    };

    fetchPitchData();
  }, [projectId, supabase]);

  const title = "Pitch";
  const description = "Présentations commerciales de votre projet";
  const definition = "Le pitch est une présentation concise et percutante de votre projet d'entreprise, conçue pour capter l'attention et convaincre votre audience en différents formats selon le contexte.";
  const importance = "Le pitch est essentiel pour communiquer efficacement sur votre projet, que ce soit pour convaincre des investisseurs, des partenaires ou des clients potentiels. Il vous permet de structurer votre discours et de présenter votre valeur ajoutée de manière claire et impactante.";

  // Contenu spécifique du Pitch
  const pitchContent = (
    <>
      {loading && <p>Loading pitch data...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      {pitchData && (
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="pitch-express">
            <AccordionTrigger className="text-lg">Pitch Express (30 secondes)</AccordionTrigger>
            <AccordionContent>
              <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                <h4 className="text-sm font-semibold mb-2">Contenu du pitch de 30 secondes</h4>
                <p className="text-[#4B5563]" style={{ whiteSpace: 'pre-wrap' }}>{pitchData.pitch_30_secondes_texte}</p>
                <div className="flex justify-end mt-2">
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(pitchData.pitch_30_secondes_texte);
                      setCopiedState({ ...copiedState, pitch_30_secondes_texte: true });
                      setTimeout(() => {
                        setCopiedState(prev => ({ ...prev, pitch_30_secondes_texte: false }));
                      }, 2000);
                    }}
                    className="bg-gradient-to-r from-aurentia-pink to-aurentia-orange text-white px-3 py-1 text-sm rounded transition-all duration-300 hover:shadow-md"
                  >
                    {copiedState.pitch_30_secondes_texte ? (
                      <>
                        <Check className="mr-1 h-4 w-4" /> Copié
                      </>
                    ) : (
                      <>
                        <Copy className="mr-1 h-4 w-4" /> Copier
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold">Appel à l'action du pitch de 30 secondes</h4>
                </div>
                <p className="text-[#4B5563]" style={{ whiteSpace: 'pre-wrap' }}>{pitchData.pitch_30_secondes_appel_action}</p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="pitch-court">
            <AccordionTrigger className="text-lg">Pitch Court</AccordionTrigger>
            <AccordionContent>
              <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                <h4 className="text-sm font-semibold mb-2">Contenu du pitch court</h4>
                <p className="text-[#4B5563]" style={{ whiteSpace: 'pre-wrap' }}>{pitchData.pitch_court_texte}</p>
                <div className="flex justify-end mt-2">
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(pitchData.pitch_court_texte);
                      setCopiedState({ ...copiedState, pitch_court_texte: true });
                      setTimeout(() => {
                        setCopiedState(prev => ({ ...prev, pitch_court_texte: false }));
                      }, 2000);
                    }}
                    className="bg-gradient-to-r from-aurentia-pink to-aurentia-orange text-white px-3 py-1 text-sm rounded transition-all duration-300 hover:shadow-md"
                  >
                    {copiedState.pitch_court_texte ? (
                      <>
                        <Check className="mr-1 h-4 w-4" /> Copié
                      </>
                    ) : (
                      <>
                        <Copy className="mr-1 h-4 w-4" /> Copier
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold">Appel à l'action du pitch court</h4>
                </div>
                <p className="text-[#4B5563]" style={{ whiteSpace: 'pre-wrap' }}>{pitchData.pitch_court_appel_action}</p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="pitch-complet">
            <AccordionTrigger className="text-lg">Pitch Complet</AccordionTrigger>
            <AccordionContent>
              <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                <h4 className="text-sm font-semibold mb-2">Contenu du pitch complet</h4>
                <p className="text-[#4B5563]" style={{ whiteSpace: 'pre-wrap' }}>{pitchData.pitch_complet_texte}</p>
                <div className="flex justify-end mt-2">
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(pitchData.pitch_complet_texte);
                      setCopiedState({ ...copiedState, pitch_complet_texte: true });
                      setTimeout(() => {
                        setCopiedState(prev => ({ ...prev, pitch_complet_texte: false }));
                      }, 2000);
                    }}
                    className="bg-gradient-to-r from-aurentia-pink to-aurentia-orange text-white px-3 py-1 text-sm rounded transition-all duration-300 hover:shadow-md"
                  >
                    {copiedState.pitch_complet_texte ? (
                      <>
                        <Check className="mr-1 h-4 w-4" /> Copié
                      </>
                    ) : (
                      <>
                        <Copy className="mr-1 h-4 w-4" /> Copier
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold">Appel à l'action du pitch complet</h4>
                </div>
                <p className="text-[#4B5563]" style={{ whiteSpace: 'pre-wrap' }}>{pitchData.pitch_complet_appel_action}</p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </>
  );

  return (
    <>
      {/* Utilisation de la carte harmonisée */}
      <HarmonizedDeliverableCard
        title={title}
        description={description}
        avis={pitchData?.avis || 'Commentaire'}
        iconSrc="/icones-livrables/pitch-icon.png"
        onClick={handleTemplateClick}
      />

      {/* Utilisation de la modal harmonisée */}
      <HarmonizedDeliverableModal
        isOpen={isPopupOpen}
        onClose={handlePopupClose}
        title={title}
        iconComponent={<img src="/icones-livrables/pitch-icon.png" alt="Pitch Icon" className="w-full h-full object-contain" />}
        contentComponent={pitchContent}
        definition={definition}
        importance={importance}
        showContentTab={true}
        showCommentsTab={true}
        deliverableId={deliverableId || undefined}
        organizationId={organizationId || undefined}
      />
    </>
  );
};

export default PitchLivrable;
