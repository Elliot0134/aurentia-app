import React, { useState, useEffect } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { supabase } from '@/integrations/supabase/client';
import { useParams } from 'react-router-dom';

type ProjectSummary = {
  b2b_problems: string | null;
  b2b_profile: string | null;
  b2c_problems: string | null;
  b2c_profile: string | null;
  budget: string | null;
  business_model: string | null;
  competences: string | null;
  created_at: string;
  description_synthetique: string | null;
  elements_distinctifs: string | null;
  mail_user: string | null;
  Marche_cible: string | null;
  marches_annexes: string | null;
  nom_projet: string | null;
  organismes_problems: string | null;
  organismes_profile: string | null;
  problemes: string | null;
  produit_service: string | null;
  project_id: string;
  project_location: string | null;
  project_type: string | null;
  proposition_valeur: string | null;
  public_cible: string | null;
  statut: string | null;
  "statut buyer personna": string | null;
  updated_at: string;
  user_id: string | null;
  validation_complexite: string | null;
  validation_concurrence: string | null;
  validation_originalite: string | null;
  validation_pertinence: string | null;
  validation_pestel: string | null;
  validation_profile_acheteur: string | null;
  vision_3_ans: string | null;
  equipe_fondatrice: string | null;
};

const RetranscriptionConceptLivrable: React.FC = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [showDefinitionPlaceholder, setShowDefinitionPlaceholder] = useState(false);
  const [showRecommendationPlaceholder, setShowRecommendationPlaceholder] = useState(false);
  const [projectSummary, setProjectSummary] = useState<ProjectSummary | null>(null);
  const { projectId } = useParams<{ projectId: string }>();

  useEffect(() => {
    const fetchProjectSummary = async () => {
      if (projectId) {
        const { data, error } = await supabase
          .from('project_summary')
          .select('*')
          .eq('project_id', projectId)
          .single();

        if (error) {
          console.error('Error fetching project summary:', error);
        } else {
          setProjectSummary(data);
        }
      }
    };

    fetchProjectSummary();
  }, [projectId, supabase]);


  const handleTemplateClick = () => {
    setIsPopupOpen(true);
  };

  const handlePopupClose = () => {
    setIsPopupOpen(false);
    // Reset placeholder states when closing popup
    setShowDefinitionPlaceholder(false);
    setShowRecommendationPlaceholder(false);
  };

  return (
    <>
      {/* Livrable Template Part */}
      <div
        className="border rounded-lg p-4 mb-4 text-white transition-transform duration-200 hover:-translate-y-1 cursor-pointer flex justify-between h-full"
        onClick={handleTemplateClick}
        style={{ background: 'white' }}
      >
        <div className="flex-grow"> {/* Container for text content */}
          <h2 className="text-3xl font-bold mb-2 text-black">{projectSummary?.nom_projet || "Retranscription du concept"}</h2>
          <p className="text-sm text-gray-700 mb-4 line-clamp-3">{projectSummary?.description_synthetique || "Synthèse complète de votre projet d'entreprise"}</p>
          <div>
            {/* Children for the template content */}
            {/* The actual deliverable content might go here or be passed via children */}
          </div>
        </div>
        <div className="flex-shrink-0"> {/* Container for image */}
          <img src="/icones-livrables/retranscription-icon.png" alt="Retranscription Icon" className="w-8 h-8 object-cover self-start" />
        </div>
      </div>

      {/* Livrable Popup Part */}
      {isPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handlePopupClose}>
          <div
            className="bg-white text-black rounded-lg w-full mx-2.5 md:w-3/4 relative transform transition-all duration-300 ease-out scale-95 opacity-0 max-h-[calc(100vh-100px)] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the popup
            style={{ animation: 'scaleIn 0.3s ease-out forwards' }} // Apply animation
          >
            {/* Sticky Header */}
            <div className="sticky top-0 bg-white z-10 border-b border-gray-200 p-6 pb-4 flex justify-between items-start">
              <h2 className="text-3xl font-bold">{projectSummary?.nom_projet || "Retranscription du concept"}</h2>
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
                    ? 'bg-aurentia-orange text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
                onClick={() => {
                  setShowDefinitionPlaceholder(!showDefinitionPlaceholder);
                  setShowRecommendationPlaceholder(false); // Optional: hide other placeholders
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
                  <p><strong>Définition :</strong> La retranscription du concept est un document qui synthétise l'ensemble des éléments fondamentaux de votre projet d'entreprise, depuis la description du produit/service jusqu'aux profils de vos clients cibles.</p>
                </div>
                <div className="bg-gray-100 rounded-md p-4">
                  <p><strong>Importance :</strong> Ce livrable est essentiel pour structurer votre réflexion entrepreneuriale et communiquer clairement votre vision à des partenaires, investisseurs ou collaborateurs potentiels.</p>
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
                  <p>[Placeholder pour la recommandation]</p>
                </div>
              </div>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="informations-globales">
                <AccordionTrigger className="text-lg">Informations globales</AccordionTrigger>
                <AccordionContent>
                  <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                    <h4 className="text-sm font-semibold mb-2">Nom du projet</h4>
                    <p className="text-[#4B5563]">{projectSummary?.nom_projet || 'N/A'}</p>
                  </div>
                  <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                    <h4 className="text-sm font-semibold mb-2">Description synthétique</h4>
                    <p className="text-[#4B5563]">{projectSummary?.description_synthetique || 'N/A'}</p>
                  </div>
                  <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                    <h4 className="text-sm font-semibold mb-2">Produit ou service</h4>
                    <p className="text-[#4B5563]">{projectSummary?.produit_service || 'N/A'}</p>
                  </div>
                  <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                    <h4 className="text-sm font-semibold mb-2">Proposition de valeur</h4>
                    <p className="text-[#4B5563]">{projectSummary?.proposition_valeur || 'N/A'}</p>
                  </div>
                  <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                    <h4 className="text-sm font-semibold mb-2">Éléments distinctifs</h4>
                    <p className="text-[#4B5563]">{projectSummary?.elements_distinctifs || 'N/A'}</p>
                  </div>
                  <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
                    <h4 className="text-sm font-semibold mb-2">Problèmes à résoudre</h4>
                    <p className="text-[#4B5563]">{projectSummary?.problemes || 'N/A'}</p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="profils-acheteurs">
                <AccordionTrigger className="text-lg">Profils acheteurs</AccordionTrigger>
                <AccordionContent>
                  <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                    <h4 className="text-sm font-semibold mb-2">Public cible principal</h4>
                    <p className="text-[#4B5563]">{projectSummary?.public_cible || 'N/A'}</p>
                  </div>
                  <h4 className="text-lg font-bold mb-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    Particuliers
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
                      <h4 className="text-sm font-semibold mb-2">Profil</h4>
                      <p className="text-[#4B5563]">{projectSummary?.b2c_profile || 'N/A'}</p>
                    </div>
                    <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
                      <h4 className="text-sm font-semibold mb-2">Problèmes à résoudre</h4>
                      <p className="text-[#4B5563]">{projectSummary?.b2c_problems || 'N/A'}</p>
                    </div>
                  </div>
                  <h4 className="text-lg font-bold mb-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect><path d="M17 22v-4a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v4"></path><path d="M12 7V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v3"></path><path d="M12 7V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v3"></path></svg>
                    Entreprises
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
                      <h4 className="text-sm font-semibold mb-2">Profil</h4>
                      <p className="text-[#4B5563]">{projectSummary?.b2b_profile || 'N/A'}</p>
                    </div>
                    <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
                      <h4 className="text-sm font-semibold mb-2">Problèmes à résoudre</h4>
                      <p className="text-[#4B5563]">{projectSummary?.b2b_problems || 'N/A'}</p>
                    </div>
                  </div>
                  <h4 className="text-lg font-bold mb-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    Organismes
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
                      <h4 className="text-sm font-semibold mb-2">Profil</h4>
                      <p className="text-[#4B5563]">{projectSummary?.organismes_profile || 'N/A'}</p>
                    </div>
                    <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
                      <h4 className="text-sm font-semibold mb-2">Problèmes à résoudre</h4>
                      <p className="text-[#4B5563]">{projectSummary?.organismes_problems || 'N/A'}</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="autres-informations">
                <AccordionTrigger className="text-lg">Autres informations</AccordionTrigger>
                <AccordionContent>
                  <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                    <h4 className="text-sm font-semibold mb-2">Marché cible</h4>
                    <p className="text-[#4B5563]">{projectSummary?.Marche_cible || 'N/A'}</p>
                  </div>
                  <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                    <h4 className="text-sm font-semibold mb-2">Marchés annexes</h4>
                    <p className="text-[#4B5563]">{projectSummary?.marches_annexes || 'N/A'}</p>
                  </div>
                  <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                    <h4 className="text-sm font-semibold mb-2">Localisation du projet</h4>
                    <p className="text-[#4B5563]">{projectSummary?.project_location || 'N/A'}</p>
                  </div>
                  <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
                    <h4 className="text-sm font-semibold mb-2">Budget</h4>
                    <p className="text-[#4B5563]">{projectSummary?.budget || 'N/A'}</p>
                  </div>
                  <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
                    <h4 className="text-sm font-semibold mb-2">L'équipe fondatrice</h4>
                    <p className="text-[#4B5563]">{projectSummary?.equipe_fondatrice || 'N/A'}</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
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

export default RetranscriptionConceptLivrable;
