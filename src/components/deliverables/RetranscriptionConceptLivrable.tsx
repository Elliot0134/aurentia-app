import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useProject } from '@/contexts/ProjectContext';

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
};

const RetranscriptionConceptLivrable: React.FC = () => {
  // Use Project Context
  const { currentProject } = useProject();
  const projectSummary = currentProject?.project_summary;

  // Helper function to format displayed values
  const formatValue = (value: string | null) => {
    return value && value.trim() ? value : "Information non renseignée";
  };

  if (!projectSummary) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-primary w-8 h-8 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">📝</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Retranscription du concept</h3>
              <p className="text-sm text-gray-600">Chargement des données du projet...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-primary w-8 h-8 rounded-lg flex items-center justify-center">
          <span className="text-white text-sm font-bold">📝</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold">Retranscription du concept</h3>
          <p className="text-sm text-gray-600">Synthèse complète de votre projet d'entreprise</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-[#F9FAFB] rounded-lg p-6">
          <h4 className="text-lg font-semibold mb-4 text-[#1F2937]">Aperçu du concept</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="text-sm font-semibold mb-2 text-[#374151]">Nom du projet</h5>
              <p className="text-[#4B5563] bg-white p-3 rounded-md">{formatValue(projectSummary.nom_projet)}</p>
            </div>
            <div>
              <h5 className="text-sm font-semibold mb-2 text-[#374151]">Type de projet</h5>
              <p className="text-[#4B5563] bg-white p-3 rounded-md">{formatValue(projectSummary.project_type)}</p>
            </div>
          </div>
          <div className="mt-4">
            <h5 className="text-sm font-semibold mb-2 text-[#374151]">Description synthétique</h5>
            <p className="text-[#4B5563] bg-white p-3 rounded-md">{formatValue(projectSummary.description_synthetique)}</p>
          </div>
        </div>

        <div className="bg-white border rounded-lg">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="informations-globales" className="border-b">
              <AccordionTrigger className="text-lg font-medium hover:no-underline px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Informations générales du projet
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#F8FAFC] rounded-lg p-4">
                      <h4 className="text-sm font-semibold mb-2 text-slate-700">Quel est le nom de votre projet ?</h4>
                      <p className="text-[#4B5563] text-sm leading-relaxed">{formatValue(projectSummary?.nom_projet)}</p>
                    </div>
                    <div className="bg-[#F8FAFC] rounded-lg p-4">
                      <h4 className="text-sm font-semibold mb-2 text-slate-700">Quelle est la nature de votre projet ?</h4>
                      <p className="text-[#4B5563] text-sm leading-relaxed">{formatValue(projectSummary?.project_type)}</p>
                    </div>
                  </div>
                  
                  <div className="bg-[#F8FAFC] rounded-lg p-4">
                    <h4 className="text-sm font-semibold mb-2 text-slate-700">Comment décririez-vous votre projet en quelques mots ?</h4>
                    <p className="text-[#4B5563] text-sm leading-relaxed">{formatValue(projectSummary?.description_synthetique)}</p>
                  </div>
                  
                  <div className="bg-[#F8FAFC] rounded-lg p-4">
                    <h4 className="text-sm font-semibold mb-2 text-slate-700">Quel produit ou service proposez-vous ?</h4>
                    <p className="text-[#4B5563] text-sm leading-relaxed">{formatValue(projectSummary?.produit_service)}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#F8FAFC] rounded-lg p-4">
                      <h4 className="text-sm font-semibold mb-2 text-slate-700">Quelle est votre proposition de valeur unique ?</h4>
                      <p className="text-[#4B5563] text-sm leading-relaxed">{formatValue(projectSummary?.proposition_valeur)}</p>
                    </div>
                    <div className="bg-[#F8FAFC] rounded-lg p-4">
                      <h4 className="text-sm font-semibold mb-2 text-slate-700">Qu'est-ce qui vous distingue de la concurrence ?</h4>
                      <p className="text-[#4B5563] text-sm leading-relaxed">{formatValue(projectSummary?.elements_distinctifs)}</p>
                    </div>
                  </div>
                  
                  <div className="bg-[#F8FAFC] rounded-lg p-4">
                    <h4 className="text-sm font-semibold mb-2 text-slate-700">Quel problème majeur résolvez-vous ?</h4>
                    <p className="text-[#4B5563] text-sm leading-relaxed">{formatValue(projectSummary?.problemes)}</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="profils-acheteurs" className="border-b">
              <AccordionTrigger className="text-lg font-medium hover:no-underline px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Profils des clients cibles
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                <div className="space-y-6">
                  <div className="bg-[#F8FAFC] rounded-lg p-4">
                    <h4 className="text-sm font-semibold mb-2 text-slate-700">Qui est votre public cible principal ?</h4>
                    <p className="text-[#4B5563] text-sm leading-relaxed">{formatValue(projectSummary?.public_cible)}</p>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                      Particuliers (B2C)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                        <h4 className="text-sm font-semibold mb-2 text-blue-800">Quel est le profil de vos clients particuliers ?</h4>
                        <p className="text-blue-700 text-sm leading-relaxed">{formatValue(projectSummary?.b2c_profile)}</p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                        <h4 className="text-sm font-semibold mb-2 text-blue-800">Quels problèmes rencontrent-ils ?</h4>
                        <p className="text-blue-700 text-sm leading-relaxed">{formatValue(projectSummary?.b2c_problems)}</p>
                      </div>
                    </div>
                    
                    <h4 className="text-lg font-bold flex items-center gap-2 text-slate-800 mt-6">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h18v18H3zM8 8h8v8H8z"></path></svg>
                      Entreprises (B2B)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                        <h4 className="text-sm font-semibold mb-2 text-green-800">Quel est le profil de vos clients entreprises ?</h4>
                        <p className="text-green-700 text-sm leading-relaxed">{formatValue(projectSummary?.b2b_profile)}</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                        <h4 className="text-sm font-semibold mb-2 text-green-800">Quels défis professionnels résolvez-vous ?</h4>
                        <p className="text-green-700 text-sm leading-relaxed">{formatValue(projectSummary?.b2b_problems)}</p>
                      </div>
                    </div>

                    <h4 className="text-lg font-bold flex items-center gap-2 text-slate-800 mt-6">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"></path><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                      Organismes publics
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                        <h4 className="text-sm font-semibold mb-2 text-purple-800">Quel type d'organismes ciblez-vous ?</h4>
                        <p className="text-purple-700 text-sm leading-relaxed">{formatValue(projectSummary?.organismes_profile)}</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                        <h4 className="text-sm font-semibold mb-2 text-purple-800">Quelles problématiques institutionnelles adressez-vous ?</h4>
                        <p className="text-purple-700 text-sm leading-relaxed">{formatValue(projectSummary?.organismes_problems)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="marche-cible" className="border-b">
              <AccordionTrigger className="text-lg font-medium hover:no-underline px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  Analyse du marché cible
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                <div className="space-y-4">
                  <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                    <h4 className="text-sm font-semibold mb-2 text-orange-800">Sur quel marché principal évoluez-vous ?</h4>
                    <p className="text-orange-700 text-sm leading-relaxed">{formatValue(projectSummary?.Marche_cible)}</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                    <h4 className="text-sm font-semibold mb-2 text-orange-800">Quels sont les marchés annexes d'opportunité ?</h4>
                    <p className="text-orange-700 text-sm leading-relaxed">{formatValue(projectSummary?.marches_annexes)}</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="business-model" className="border-b">
              <AccordionTrigger className="text-lg font-medium hover:no-underline px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  Modèle économique & Ressources
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                <div className="space-y-4">
                  <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                    <h4 className="text-sm font-semibold mb-2 text-indigo-800">Comment votre projet génère-t-il des revenus ?</h4>
                    <p className="text-indigo-700 text-sm leading-relaxed">{formatValue(projectSummary?.business_model)}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                      <h4 className="text-sm font-semibold mb-2 text-indigo-800">Quelles compétences sont nécessaires ?</h4>
                      <p className="text-indigo-700 text-sm leading-relaxed">{formatValue(projectSummary?.competences)}</p>
                    </div>
                    <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                      <h4 className="text-sm font-semibold mb-2 text-indigo-800">Quel budget estimez-vous nécessaire ?</h4>
                      <p className="text-indigo-700 text-sm leading-relaxed">{formatValue(projectSummary?.budget)}</p>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="vision">
              <AccordionTrigger className="text-lg font-medium hover:no-underline px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                  Vision & Localisation
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                <div className="space-y-4">
                  <div className="bg-pink-50 rounded-lg p-4 border border-pink-100">
                    <h4 className="text-sm font-semibold mb-2 text-pink-800">Où vous voyez-vous dans 3 ans ?</h4>
                    <p className="text-pink-700 text-sm leading-relaxed">{formatValue(projectSummary?.vision_3_ans)}</p>
                  </div>
                  <div className="bg-pink-50 rounded-lg p-4 border border-pink-100">
                    <h4 className="text-sm font-semibold mb-2 text-pink-800">Où sera localisé votre projet ?</h4>
                    <p className="text-pink-700 text-sm leading-relaxed">{formatValue(projectSummary?.project_location)}</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
};

export default RetranscriptionConceptLivrable;
