import React, { useState, useEffect } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Copy, Check } from 'lucide-react';
import { useProject } from '@/contexts/ProjectContext';

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
  const [copiedState, setCopiedState] = useState<{ [key: string]: boolean }>({});

  // Use Project Context instead of individual API calls
  const { currentProject, loading } = useProject();
  const pitchData = currentProject?.pitch as PitchData | null;

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
  const color = "#FDE047";

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedState(prev => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setCopiedState(prev => ({ ...prev, [key]: false }));
      }, 2000);
    });
  };

  return (
    <>
      {/* Livrable Template Part */}
      <div
        className="border rounded-lg p-4 mb-4 text-black transition-transform duration-200 hover:-translate-y-1 cursor-pointer flex justify-between"
        onClick={handleTemplateClick}
        style={{ borderColor: color, backgroundColor: color }}
      >
        <div className="flex-grow mr-4 flex flex-col">
          <h2 className="text-xl font-bold mb-2">{title}</h2>
          <p className="text-black mb-4">{description}</p>
          <div className="flex-grow">
            {/* Children for the template content */}
          </div>
          <div className="flex-shrink-0 mt-auto">
            <button className={`text-xs bg-white px-2 py-1 rounded-full cursor-default pointer-events-none font-bold`} style={{ color: color }}>
              {pitchData ? 'Disponible' : 'En attente'}
            </button>
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
            className="bg-white text-black rounded-lg p-6 w-full mx-2.5 md:w-3/4 relative transform transition-all duration-300 ease-out scale-95 opacity-0 max-h-[calc(100vh-100px)] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: 'scaleIn 0.3s ease-out forwards' }}
          >
            <h2 className="text-xl font-bold mb-2">{title}</h2>
            <div className="flex gap-2 mb-4">
              <button
                className={`text-xs px-2 py-1 rounded-full cursor-pointer ${
                  showDefinitionPlaceholder
                    ? 'text-black'
                    : 'bg-gray-200 text-gray-700'
                }`}
                style={{ backgroundColor: showDefinitionPlaceholder ? color : '' }}
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

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Chargement des données...</p>
              </div>
            ) : pitchData ? (
              <div className="space-y-6">
                <Accordion type="single" collapsible className="w-full">
                  {/* Pitch 30 secondes */}
                  <AccordionItem value="pitch-30-secondes">
                    <AccordionTrigger className="text-left text-lg flex-1 pr-4">
                      Pitch 30 secondes - Ascenseur
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <div className="bg-[#F9FAFB] rounded-md p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-sm font-semibold">Texte du pitch</h4>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(pitchData.pitch_30_secondes_texte, 'pitch_30_texte')}
                              className="flex items-center gap-1"
                            >
                              {copiedState['pitch_30_texte'] ? <Check size={16} /> : <Copy size={16} />}
                              {copiedState['pitch_30_texte'] ? 'Copié' : 'Copier'}
                            </Button>
                          </div>
                          <p className="text-[#4B5563] whitespace-pre-wrap">{pitchData.pitch_30_secondes_texte}</p>
                        </div>
                        <div className="bg-[#E3F2FD] rounded-md p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-sm font-semibold">Appel à l'action</h4>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(pitchData.pitch_30_secondes_appel_action, 'pitch_30_cta')}
                              className="flex items-center gap-1"
                            >
                              {copiedState['pitch_30_cta'] ? <Check size={16} /> : <Copy size={16} />}
                              {copiedState['pitch_30_cta'] ? 'Copié' : 'Copier'}
                            </Button>
                          </div>
                          <p className="text-[#4B5563] whitespace-pre-wrap">{pitchData.pitch_30_secondes_appel_action}</p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Pitch court */}
                  <AccordionItem value="pitch-court">
                    <AccordionTrigger className="text-left text-lg flex-1 pr-4">
                      Pitch court - Présentation rapide
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <div className="bg-[#F9FAFB] rounded-md p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-sm font-semibold">Texte du pitch</h4>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(pitchData.pitch_court_texte, 'pitch_court_texte')}
                              className="flex items-center gap-1"
                            >
                              {copiedState['pitch_court_texte'] ? <Check size={16} /> : <Copy size={16} />}
                              {copiedState['pitch_court_texte'] ? 'Copié' : 'Copier'}
                            </Button>
                          </div>
                          <p className="text-[#4B5563] whitespace-pre-wrap">{pitchData.pitch_court_texte}</p>
                        </div>
                        <div className="bg-[#E3F2FD] rounded-md p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-sm font-semibold">Appel à l'action</h4>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(pitchData.pitch_court_appel_action, 'pitch_court_cta')}
                              className="flex items-center gap-1"
                            >
                              {copiedState['pitch_court_cta'] ? <Check size={16} /> : <Copy size={16} />}
                              {copiedState['pitch_court_cta'] ? 'Copié' : 'Copier'}
                            </Button>
                          </div>
                          <p className="text-[#4B5563] whitespace-pre-wrap">{pitchData.pitch_court_appel_action}</p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Pitch complet */}
                  <AccordionItem value="pitch-complet">
                    <AccordionTrigger className="text-left text-lg flex-1 pr-4">
                      Pitch complet - Présentation détaillée
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <div className="bg-[#F9FAFB] rounded-md p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-sm font-semibold">Texte du pitch</h4>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(pitchData.pitch_complet_texte, 'pitch_complet_texte')}
                              className="flex items-center gap-1"
                            >
                              {copiedState['pitch_complet_texte'] ? <Check size={16} /> : <Copy size={16} />}
                              {copiedState['pitch_complet_texte'] ? 'Copié' : 'Copier'}
                            </Button>
                          </div>
                          <p className="text-[#4B5563] whitespace-pre-wrap">{pitchData.pitch_complet_texte}</p>
                        </div>
                        <div className="bg-[#E3F2FD] rounded-md p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-sm font-semibold">Appel à l'action</h4>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(pitchData.pitch_complet_appel_action, 'pitch_complet_cta')}
                              className="flex items-center gap-1"
                            >
                              {copiedState['pitch_complet_cta'] ? <Check size={16} /> : <Copy size={16} />}
                              {copiedState['pitch_complet_cta'] ? 'Copié' : 'Copier'}
                            </Button>
                          </div>
                          <p className="text-[#4B5563] whitespace-pre-wrap">{pitchData.pitch_complet_appel_action}</p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">Aucune donnée de pitch disponible.</p>
              </div>
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

export default PitchLivrable;
