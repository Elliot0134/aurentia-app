import React, { useState, useEffect } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Copy, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useParams } from 'react-router-dom';

interface PitchData {
  pitch_30_secondes_texte: string;
  pitch_30_secondes_appel_action: string;
  pitch_court_texte: string;
  pitch_court_appel_action: string;
  pitch_complet_texte: string;
  pitch_complet_appel_action: string;
}

const PitchLivrable: React.FC = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [showDefinitionPlaceholder, setShowDefinitionPlaceholder] = useState(false);
  const [pitchData, setPitchData] = useState<PitchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedState, setCopiedState] = useState<{ [key: string]: boolean }>({});

  const { projectId } = useParams<{ projectId: string }>();
  const supabaseClient = supabase;

  useEffect(() => {
    const fetchPitchData = async () => {
      if (!projectId) {
        setError("Project ID is missing.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('pitch')
        .select('*')
        .eq('project_id', projectId)
        .single();

      if (error) {
        setError(error.message);
        setPitchData(null);
      } else {
        setPitchData(data);
        setError(null);
      }
      setLoading(false);
    };

    fetchPitchData();
  }, [projectId, supabase]);

  const handleTemplateClick = () => {
    setIsPopupOpen(true);
  };

  const handlePopupClose = () => {
    setIsPopupOpen(false);
    setShowDefinitionPlaceholder(false);
  };

  const title = "Pitch";
  const description = "Présentations commerciales de votre projet";
  const definition = "Le pitch est une présentation concise et percutante de votre projet d'entreprise, conçue pour capter l'attention et convaincre votre audience en différents formats selon le contexte.";
  const importance = "Le pitch est essentiel pour communiquer efficacement sur votre projet, que ce soit pour convaincre des investisseurs, des partenaires ou des clients potentiels. Il vous permet de structurer votre discours et de présenter votre valeur ajoutée de manière claire et impactante.";
  const color = "#FDE047"; // Couleur du livrable

  return (
    <>
      {/* Livrable Template Part */}
      <div
        className="border rounded-lg p-4 mb-4 bg-green-500 text-white transition-transform duration-200 hover:-translate-y-1 cursor-pointer flex justify-between h-30"
        onClick={handleTemplateClick}
      >
        <div className="flex-grow mr-4 flex flex-col">
          <h2 className="text-xl font-bold mb-2">{title}</h2>
          {description && <p className="text-white mb-4">{description}</p>}
          <div className="flex-grow">
            {/* Children for the template content */}
          </div>
          {/* The PitchLivrable doesn't have a comment button in the main view, but I'll add a placeholder div with mt-auto for consistency in case content is added later */}
          <div className="flex-shrink-0 mt-auto">
            {/* Placeholder for button */}
          </div>
        </div>
        <div className="flex-shrink-0">
          <img src="/icones-livrables/pitch-icon.png" alt="Pitch Icon" className="w-8 h-8 object-cover self-start" />
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
                    ? `bg-green-500 text-white`
                    : 'bg-gray-200 text-gray-700'
                }`}
                onClick={() => {
                  setShowDefinitionPlaceholder(!showDefinitionPlaceholder);
                }}
              >
                Définition
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
                          }}
                          className="bg-gradient-to-r from-aurentia-pink to-aurentia-orange text-white px-3 py-1 text-sm rounded transition-all duration-300 hover:shadow-md"
                        >
                          {copiedState.pitch_30_secondes_texte ? (
                            <>
                              <Check className="mr-1 h-4 w-4" /> Coller
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
                          }}
                          className="bg-gradient-to-r from-aurentia-pink to-aurentia-orange text-white px-3 py-1 text-sm rounded transition-all duration-300 hover:shadow-md"
                        >
                          {copiedState.pitch_court_texte ? (
                            <>
                              <Check className="mr-1 h-4 w-4" /> Coller
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
                          }}
                          className="bg-gradient-to-r from-aurentia-pink to-aurentia-orange text-white px-3 py-1 text-sm rounded transition-all duration-300 hover:shadow-md"
                        >
                          {copiedState.pitch_complet_texte ? (
                            <>
                              <Check className="mr-1 h-4 w-4" /> Coller
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

            </div>
          </div>
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

export default PitchLivrable;