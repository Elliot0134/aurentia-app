import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import ReactMarkdown from 'react-markdown';
import { PlusCircle } from 'lucide-react';

// Interface pour les données de score_projet
interface ScoreProjetData {
  project_id: string;
  score_final: number;
  analyse_juridique: any;
  marche_concurrence: any;
  faisabilite_business: any;
  innovation_risques: any;
  evaluation_finale: any;
}

// Interface pour les sections de popup détaillées
interface PopupSection {
  title: string;
  items: { title: string; content: string | string[] | number | boolean }[];
}

// Composant générique pour les popups détaillées (basé sur TemplateLivrable)
interface ScoreDetailPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  sections: PopupSection[];
  iconSrc?: string;
  recommendations?: any[];
}

import { useRef, useLayoutEffect } from 'react'; // Import useRef and useLayoutEffect

const ScoreDetailPopup: React.FC<ScoreDetailPopupProps> = ({ isOpen, onClose, title, sections, iconSrc, recommendations }) => {
  const [activeTab, setActiveTab] = useState<'content' | 'recommendations'>('content');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [contentHeight, setContentHeight] = useState<number>(0);
  const [modalHeight, setModalHeight] = useState<string>('auto');
  const contentRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Fonction pour gérer le changement d'onglet
  const handleTabChange = (newTab: 'content' | 'recommendations') => {
    if (newTab === activeTab || isTransitioning) return;
    
    setIsTransitioning(true);
    
    // Phase 1: Flou du contenu actuel
    setTimeout(() => {
      // Change le contenu
      setActiveTab(newTab);
      
      // Phase 2: Mesure la nouvelle hauteur et anime vers celle-ci
      setTimeout(() => {
        if (contentRef.current && modalRef.current) {
          const newContentHeight = contentRef.current.scrollHeight;
          const headerHeight = modalRef.current.querySelector('.sticky')?.clientHeight || 100;
          const tabsHeight = modalRef.current.querySelector('.border-b')?.clientHeight || 50;
          const paddingHeight = 48;
          
          const newTotalHeight = newContentHeight + headerHeight + tabsHeight + paddingHeight;
          setContentHeight(newContentHeight);
          setModalHeight(`${newTotalHeight}px`);
        }
        
        // Phase 3: Retire le flou
        setTimeout(() => {
          setIsTransitioning(false);
        }, 60);
      }, 30);
    }, 100);
  };

  // UseLayoutEffect pour mesurer la hauteur initiale et surveiller les changements d'accordéons
  useLayoutEffect(() => {
    if (isOpen && contentRef.current && modalRef.current) {
      const contentScrollHeight = contentRef.current.scrollHeight;
      const headerHeight = modalRef.current.querySelector('.sticky')?.clientHeight || 100;
      const tabsHeight = modalRef.current.querySelector('.border-b')?.clientHeight || 50;
      const paddingHeight = 48; // p-6 pt-4 = 24+16 = 40px + petit margin
      
      const totalHeight = contentScrollHeight + headerHeight + tabsHeight + paddingHeight;
      setContentHeight(contentScrollHeight);
      setModalHeight(`${totalHeight}px`);

      // Observer les changements de taille du contenu (accordéons qui s'ouvrent/ferment)
      const resizeObserver = new ResizeObserver(() => {
        if (contentRef.current && !isTransitioning && modalRef.current) {
          const newContentScrollHeight = contentRef.current.scrollHeight;
          if (newContentScrollHeight !== contentHeight) {
            const newTotalHeight = newContentScrollHeight + headerHeight + tabsHeight + paddingHeight;
            setContentHeight(newContentScrollHeight);
            setModalHeight(`${newTotalHeight}px`);
          }
        }
      });

      resizeObserver.observe(contentRef.current);

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [isOpen, activeTab, isTransitioning]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        ref={modalRef}
        className="bg-white text-black rounded-lg w-full mx-2.5 md:w-3/4 relative transform scale-95 opacity-0 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the popup
        style={{
          animation: 'scaleIn 0.3s ease-out forwards',
          height: modalHeight,
          maxHeight: 'calc(100vh - 100px)',
          transition: 'height 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.3s ease-out'
        }}
      >
        {/* Sticky Header */}
        <div className="sticky top-0 bg-white z-10 border-b border-gray-200 p-6 pb-4 flex justify-between items-start">
          <div className="flex items-center">
            {iconSrc && <img src={iconSrc} alt="Icon" className="w-8 h-8 object-cover mr-3" />}
            <h2 className="text-xl font-bold">{title}</h2>
          </div>
          <button
            className="text-gray-600 hover:text-gray-900 transition-colors"
            onClick={onClose}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Tab Navigation - Seulement pour l'évaluation globale */}
        {title === "Évaluation Globale de Viabilité" && (
          <div className="flex bg-white border-b border-gray-100">
            <button
              className={`py-3 px-6 text-sm font-medium transition-all duration-200 ${activeTab === 'content' ? 'border-b-2 border-orange-500 text-orange-500' : 'text-gray-600 hover:text-gray-800'}`}
              onClick={() => handleTabChange('content')}
            >
              Contenu
            </button>
            <button
              className={`py-3 px-6 text-sm font-medium transition-all duration-200 ${activeTab === 'recommendations' ? 'border-b-2 border-orange-500 text-orange-500' : 'text-gray-600 hover:text-gray-800'}`}
              onClick={() => handleTabChange('recommendations')}
            >
              Recommandations
            </button>
          </div>
        )}
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 pt-4">
          <div
            ref={contentRef}
            className={`transition-all duration-300 ${isTransitioning ? 'opacity-0 blur-sm transform translate-y-2' : 'opacity-100 blur-0 transform translate-y-0'}`}
          >
            {title === "Évaluation Globale de Viabilité" ? (
              // Contenu spécial pour l'évaluation globale avec onglets
              <>
                {activeTab === 'content' && (
                  <>
                    {sections.filter(section => section.title !== "Recommandations Prioritaires").length > 0 ? (
                      <Accordion type="single" collapsible className="w-full">
                        {sections.filter(section => section.title !== "Recommandations Prioritaires").map((section, sectionIndex) => (
                          <AccordionItem value={`section-${sectionIndex}`} key={sectionIndex}>
                            <AccordionTrigger className="text-lg">{section.title}</AccordionTrigger>
                            <AccordionContent>
                              {section.items.map((item, itemIndex) => (
                                <div key={itemIndex} className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                                  <h4 className="text-sm font-semibold mb-2">{item.title}</h4>
                                  <div className="text-[#4B5563]" style={{ whiteSpace: 'pre-wrap' }}>
                                    {Array.isArray(item.content) ? (
                                      <ul>
                                        {item.content.map((line, lineIndex) => (
                                          <li key={lineIndex}><ReactMarkdown>{String(line)}</ReactMarkdown></li>
                                        ))}
                                      </ul>
                                    ) : (
                                      <ReactMarkdown>{String(item.content)}</ReactMarkdown>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    ) : (
                      <div className="prose max-w-none">
                        <p className="text-gray-500">Aucun contenu disponible pour le moment.</p>
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'recommendations' && (
                  <div className="w-full">
                    {recommendations && recommendations.length > 0 ? (
                      <>
                        {/* Version Desktop - Tableau */}
                        <div className="hidden md:block">
                          <table className="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">Recommandation</th>
                                <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">Priorité</th>
                                <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">Impact Attendu</th>
                              </tr>
                            </thead>
                            <tbody>
                              {recommendations.map((rec: any, recIndex: number) => (
                                <tr key={recIndex} className="hover:bg-gray-50">
                                  <td className="border border-gray-300 px-4 py-3 text-gray-800">{rec.action || 'N/A'}</td>
                                  <td className="border border-gray-300 px-4 py-3">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      rec.priorite === 'Haute' || rec.priorite === 'Élevée' ? 'bg-red-100 text-red-800' :
                                      rec.priorite === 'Moyenne' || rec.priorite === 'Modérée' ? 'bg-yellow-100 text-yellow-800' :
                                      rec.priorite === 'Faible' || rec.priorite === 'Basse' ? 'bg-green-100 text-green-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {rec.priorite || 'N/A'}
                                    </span>
                                  </td>
                                  <td className="border border-gray-300 px-4 py-3 text-gray-800">{rec.impact_attendu || 'N/A'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Version Mobile - Cartes */}
                        <div className="md:hidden space-y-4">
                          {recommendations.map((rec: any, recIndex: number) => (
                            <div key={recIndex} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                              <div className="flex items-start justify-between mb-3">
                                <h5 className="font-semibold text-gray-900 text-sm flex-1 pr-2">{rec.action || 'N/A'}</h5>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                                  rec.priorite === 'Haute' || rec.priorite === 'Élevée' ? 'bg-red-100 text-red-800' :
                                  rec.priorite === 'Moyenne' || rec.priorite === 'Modérée' ? 'bg-yellow-100 text-yellow-800' :
                                  rec.priorite === 'Faible' || rec.priorite === 'Basse' ? 'bg-green-100 text-green-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {rec.priorite || 'N/A'}
                                </span>
                              </div>
                              <div className="text-sm text-gray-600">
                                <span className="font-medium">Impact attendu:</span> {rec.impact_attendu || 'N/A'}
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="prose max-w-none">
                        <p className="text-gray-500">Aucune recommandation disponible pour le moment.</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              // Contenu normal pour les autres popups
              <>
                {sections.length > 0 ? (
                  <Accordion type="single" collapsible className="w-full">
                    {sections.map((section, sectionIndex) => (
                      <AccordionItem value={`section-${sectionIndex}`} key={sectionIndex}>
                        <AccordionTrigger className="text-lg">{section.title}</AccordionTrigger>
                        <AccordionContent>
                          {section.items.map((item, itemIndex) => (
                            <div key={itemIndex} className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
                              <h4 className="text-sm font-semibold mb-2">{item.title}</h4>
                              <div className="text-[#4B5563]" style={{ whiteSpace: 'pre-wrap' }}>
                                {Array.isArray(item.content) ? (
                                  <ul>
                                    {item.content.map((line, lineIndex) => (
                                      <li key={lineIndex}><ReactMarkdown>{String(line)}</ReactMarkdown></li>
                                    ))}
                                  </ul>
                                ) : (
                                  <ReactMarkdown>{String(item.content)}</ReactMarkdown>
                                )}
                              </div>
                            </div>
                          ))}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <div className="prose max-w-none">
                    <p className="text-gray-500">Aucun contenu disponible pour le moment.</p>
                  </div>
                )}
              </>
            )}
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
    </div>
  );
};

// Composant pour une carte de score individuelle
interface ScoreCardProps {
  title: string;
  score: number;
  subtitle?: string;
  resumeExecutif?: string;
  isMain?: boolean;
  onViewMore: () => void;
  isDisabled?: boolean;
}

const ScoreCard: React.FC<ScoreCardProps> = ({ title, score, subtitle, resumeExecutif, isMain = false, onViewMore, isDisabled = false }) => {
  const getScoreColor = (s: number) => {
    if (s >= 4) return '#10B981'; // Vert
    if (s === 3) return '#FF6B47'; // Orange
    if (s <= 2) return '#EF4444'; // Rouge
    return '#6B7280'; // Gris pour score 0 ou non défini
  };

  const scoreColor = getScoreColor(score);

  if (isMain) {
    // Fonction pour tronquer le texte à 200 caractères
    const truncateText = (text: string, maxLength: number = 200) => {
      if (!text) return "";
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + "...";
    };

    return (
      <div 
        className={`relative bg-white border border-gray-200 rounded-xl p-6 cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={!isDisabled ? onViewMore : undefined}
        style={{ minHeight: '240px' }}
      >
        {/* Menu icon */}
        <div className="absolute top-3 right-3 text-gray-400">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="2"/>
            <circle cx="12" cy="12" r="2"/>
            <circle cx="12" cy="19" r="2"/>
          </svg>
        </div>
        
        {/* Content */}
        <div className="flex flex-col h-full items-center justify-center text-center">
          {/* Score et titre */}
          <div className="flex flex-col items-center mb-6">
            <div 
              className="text-5xl font-bold mb-2"
              style={{ color: scoreColor }}
            >
              {score}/5
            </div>
            <div className="text-lg font-medium text-gray-900">
              {title}
            </div>
          </div>
          
          {/* Résumé exécutif centré avec largeur limitée */}
          {resumeExecutif && (
            <div className="w-full lg:w-[70%] mx-auto">
              <div className="text-sm text-gray-600 text-center">
                {truncateText(resumeExecutif, 200)}
              </div>
            </div>
          )}
        </div>
        
        {isDisabled && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-75 rounded-xl">
            <span className="text-gray-600 font-semibold">Analyse non disponible</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      className={`relative bg-white border border-gray-200 rounded-xl p-5 cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={!isDisabled ? onViewMore : undefined}
      style={{ minHeight: '120px' }}
    >
      {/* Menu icon */}
      <div className="absolute top-3 right-3 text-gray-400">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="2"/>
          <circle cx="12" cy="12" r="2"/>
          <circle cx="12" cy="19" r="2"/>
        </svg>
      </div>
      
      {/* Content */}
      <div className="flex flex-col justify-center h-full">
        <div 
          className="text-2xl font-semibold mb-1"
          style={{ color: scoreColor }}
        >
          {score}/5
        </div>
        <div className="text-sm font-medium text-gray-900 mb-1">
          {title}
        </div>
        {subtitle && (
          <div className="text-xs italic text-gray-500">
            {subtitle}
          </div>
        )}
      </div>
      
      {isDisabled && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-75 rounded-xl">
          <span className="text-gray-600 font-semibold">Analyse non disponible</span>
        </div>
      )}
    </div>
  );
};

interface ProjectScoreCardsProps {
  className?: string;
}

const ProjectScoreCards: React.FC<ProjectScoreCardsProps> = ({ className }) => {
  const { projectId } = useParams<{ projectId: string }>();
  const [scoreData, setScoreData] = useState<ScoreProjetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupContent, setPopupContent] = useState<{ title: string; sections: PopupSection[]; iconSrc?: string; recommendations?: any[] } | null>(null);

  useEffect(() => {
    if (!projectId) {
      toast({
        title: "Erreur",
        description: "ID du projet manquant pour charger les scores.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const fetchScoreData = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('score_projet')
        .select('*') // Sélectionner toutes les colonnes pour l'instant
        .eq('project_id', projectId)
        .single();

      if (error) {
        console.error("Error fetching score data:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les scores du projet.",
          variant: "destructive",
        });
        setScoreData(null);
      } else {
        setScoreData(data as ScoreProjetData);
      }
      setLoading(false);
    };

    fetchScoreData();
  }, [projectId]);

  const openDetailPopup = (title: string, sections: PopupSection[], iconSrc?: string, recommendations?: any[]) => {
    setPopupContent({ title, sections, iconSrc, recommendations });
    setIsPopupOpen(true);
  };

  const closeDetailPopup = () => {
    setIsPopupOpen(false);
    setPopupContent(null);
  };

  if (loading) {
    return <div>Chargement des scores...</div>;
  }

  if (!scoreData) {
    return <div>Aucune donnée de score disponible pour ce projet.</div>;
  }

  // Fonction utilitaire pour extraire les données JSONB en toute sécurité
  const getJsonbValue = (data: any, path: string, defaultValue: any = null) => {
    if (!data) return defaultValue;
    const parts = path.split('->');
    let current = data;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].replace(/'/g, ''); // Supprimer les guillemets simples
      if (part.startsWith('>')) { // Gérer le cas ->>'key'
        const key = part.substring(1);
        current = current ? current[key] : undefined;
      } else {
        current = current ? current[part] : undefined;
      }
      if (current === undefined) return defaultValue;
    }
    return current !== undefined ? current : defaultValue;
  };

  // Données pour les cartes
  const evaluationFinale = scoreData.evaluation_finale;
  const analyseJuridique = scoreData.analyse_juridique;
  const marcheConcurrence = scoreData.marche_concurrence;
  const faisabiliteBusiness = scoreData.faisabilite_business;
  const innovationRisques = scoreData.innovation_risques;

  // Debug: Log des données pour vérifier la structure
  console.log("Score data:", scoreData);
  console.log("Evaluation finale:", evaluationFinale);

  const cards = [
    {
      id: 'evaluation_finale',
      title: "Score Global de Viabilité",
      score: parseInt(getJsonbValue(evaluationFinale, "evaluation_finale->score_global->>note_finale", "0")) || 0,
      subtitle: getJsonbValue(evaluationFinale, "evaluation_finale->score_global->>niveau_difficulte"),
      resumeExecutif: getJsonbValue(evaluationFinale, "evaluation_finale->conclusion->>resume_executif", ""),
      isMain: true,
      data: evaluationFinale,
      popupTitle: "Évaluation Globale de Viabilité",
      iconSrc: "/icones-livrables/score-icon.png",
      getSections: (data: any): PopupSection[] => [
        {
          title: "Synthèse du Projet",
          items: [
            { title: "Opportunité principale", content: getJsonbValue(data, "evaluation_finale->synthese->>opportunite_principale", "N/A") },
            { title: "Facteur limitant", content: getJsonbValue(data, "evaluation_finale->synthese->>facteur_limitant_principal", "N/A") },
            { title: "Points forts majeurs", content: getJsonbValue(data, "evaluation_finale->synthese->points_forts_majeurs", []) },
            { title: "Faiblesses critiques", content: getJsonbValue(data, "evaluation_finale->synthese->faiblesses_critiques", []) },
          ],
        },
        {
          title: "Conclusion & Décision",
          items: [
            { title: "Résumé exécutif", content: getJsonbValue(data, "evaluation_finale->conclusion->>resume_executif", "N/A") },
            { title: "Décision recommandée", content: getJsonbValue(data, "evaluation_finale->score_global->>decision_recommandee", "N/A") },
            { title: "Niveau de confiance", content: getJsonbValue(data, "evaluation_finale->conclusion->>niveau_confiance", "N/A") },
            { title: "Prochaines étapes", content: getJsonbValue(data, "evaluation_finale->conclusion->next_steps", []) },
          ],
        },
        {
          title: "Recommandations Prioritaires",
          items: [{
            title: "Tableau des Recommandations",
            content: getJsonbValue(data, "evaluation_finale->recommandations_prioritaires", [])
          }]
        },
      ],
    },
    {
      id: 'analyse_juridique',
      title: "Complexité Juridique",
      score: parseInt(getJsonbValue(analyseJuridique, "analyse_juridique->evaluation_globale->>score_difficulte", "0")) || 0,
      subtitle: getJsonbValue(analyseJuridique, "analyse_juridique->evaluation_globale->>niveau_complexite"),
      data: analyseJuridique,
      popupTitle: "Analyse Juridique & Réglementaire",
      iconSrc: "/icones-livrables/juridique-icon.png",
      getSections: (data: any): PopupSection[] => [
        {
          title: "Facteurs de Risque",
          items: [
            { title: "Risques majeurs", content: getJsonbValue(data, "analyse_juridique->facteurs_risque->risques_majeurs", []) },
            { title: "Risques mineurs", content: getJsonbValue(data, "analyse_juridique->facteurs_risque->risques_mineurs", []) },
            { title: "Délais critiques", content: getJsonbValue(data, "analyse_juridique->facteurs_risque->delais_critiques", []) },
            { title: "Points bloquants", content: getJsonbValue(data, "analyse_juridique->facteurs_risque->points_bloquants", []) },
          ],
        },
        {
          title: "Conformité & Structure",
          items: [
            { title: "RGPD applicable", content: getJsonbValue(data, "analyse_juridique->analyse_detaillee->conformite_generale->>rgpd_applicable", "N/A") },
            { title: "Autres conformités", content: getJsonbValue(data, "analyse_juridique->analyse_detaillee->conformite_generale->autres_conformites", []) },
            { title: "Formes juridiques", content: getJsonbValue(data, "analyse_juridique->analyse_detaillee->structure_juridique->formes_juridiques_recommandees", []) },
            { title: "Capital minimum", content: getJsonbValue(data, "analyse_juridique->analyse_detaillee->structure_juridique->>capital_minimum_requis", "N/A") },
          ],
        },
        {
          title: "Propriété Intellectuelle",
          items: [
            { title: "Urgence dépôt", content: getJsonbValue(data, "analyse_juridique->analyse_detaillee->propriete_intellectuelle->>urgence_depot", "N/A") },
            { title: "Coût protection", content: getJsonbValue(data, "analyse_juridique->analyse_detaillee->propriete_intellectuelle->>cout_protection", "N/A") },
            { title: "Protections nécessaires", content: getJsonbValue(data, "analyse_juridique->analyse_detaillee->propriete_intellectuelle->protections_necessaires", []) },
          ],
        },
        {
          title: "Recommandations Juridiques",
          items: getJsonbValue(data, "analyse_juridique->recommandations_prioritaires", []).map((rec: any) => ({
            title: rec.action,
            content: `Délai: ${rec.delai}\nPriorité: ${rec.priorite}\nCoût estimé: ${rec.cout_estime}\nImpact lancement: ${rec.impact_lancement}`,
          })),
        },
      ],
    },
    {
      id: 'marche_concurrence',
      title: "Accessibilité du Marché",
      score: parseInt(getJsonbValue(marcheConcurrence, "analyse_marche_concurrence->evaluation_globale->>score_accessibilite", "0")) || 0,
      subtitle: getJsonbValue(marcheConcurrence, "analyse_marche_concurrence->evaluation_globale->>niveau_difficulte"),
      data: marcheConcurrence,
      popupTitle: "Analyse Marché & Concurrence",
      iconSrc: "/icones-livrables/market-icon.png",
      getSections: (data: any): PopupSection[] => [
        {
          title: "Taille & Opportunités du Marché",
          items: [
            { title: "Volume global", content: getJsonbValue(data, "analyse_marche_concurrence->analyse_marche->taille_marche->>volume_global", "N/A") },
            { title: "Croissance", content: getJsonbValue(data, "analyse_marche_concurrence->analyse_marche->taille_marche->>croissance_tendance", "N/A") },
            { title: "Segments porteurs", content: getJsonbValue(data, "analyse_marche_concurrence->analyse_marche->taille_marche->segments_porteurs", []) },
            { title: "Niches inexploitées", content: getJsonbValue(data, "analyse_marche_concurrence->analyse_marche->opportunites_marche->niches_inexploitees", []) },
          ],
        },
        {
          title: "Barrières d'Entrée",
          items: [
            { title: "Types de barrières", content: getJsonbValue(data, "analyse_marche_concurrence->analyse_marche->barrieres_entree->types_barrieres", []) },
            { title: "Niveau barrières", content: getJsonbValue(data, "analyse_marche_concurrence->analyse_marche->barrieres_entree->>niveau_barrieres", "N/A") },
            { title: "Compétences critiques", content: getJsonbValue(data, "analyse_marche_concurrence->analyse_marche->barrieres_entree->competences_critiques", []) },
            { title: "Délais établissement", content: getJsonbValue(data, "analyse_marche_concurrence->analyse_marche->barrieres_entree->>delais_etablissement", "N/A") },
          ],
        },
        {
          title: "Analyse Concurrentielle",
          items: [
            { title: "Intensité", content: getJsonbValue(data, "analyse_marche_concurrence->analyse_concurrence->intensite_concurrentielle->>niveau_intensite", "N/A") },
            { title: "Axes différenciation", content: getJsonbValue(data, "analyse_marche_concurrence->analyse_concurrence->facilite_differentiation->axes_differentiation", []) },
            { title: "Leaders établis", content: getJsonbValue(data, "analyse_marche_concurrence->analyse_concurrence->positionnement_concurrent->leaders_etablis", []) },
            { title: "Espaces libres", content: getJsonbValue(data, "analyse_marche_concurrence->analyse_concurrence->positionnement_concurrent->espaces_libres", []) },
          ],
        },
        {
          title: "Stratégies Recommandées",
          items: [
            { title: "Défis majeurs", content: getJsonbValue(data, "analyse_marche_concurrence->synthesis_competitive->defis_majeurs", []) },
            { title: "Positions favorables", content: getJsonbValue(data, "analyse_marche_concurrence->synthesis_competitive->position_favorable", []) },
            { title: "Stratégies", content: getJsonbValue(data, "analyse_marche_concurrence->synthesis_competitive->strategies_recommandees", []) },
          ],
        },
      ],
    },
    {
      id: 'faisabilite_business',
      title: "Faisabilité Business",
      score: parseInt(getJsonbValue(faisabiliteBusiness, "analyse_faisabilite_business->evaluation_globale->>score_faisabilite", "0")) || 0,
      subtitle: getJsonbValue(faisabiliteBusiness, "analyse_faisabilite_business->evaluation_globale->>niveau_complexite"),
      data: faisabiliteBusiness,
      popupTitle: "Faisabilité Business",
      iconSrc: "/icones-livrables/business-model-icon.png",
      getSections: (data: any): PopupSection[] => [
        {
          title: "Facteurs de Réussite",
          items: [
            { title: "Atouts majeurs", content: getJsonbValue(data, "analyse_faisabilite_business->facteurs_reussite->atouts_majeurs", []) },
            { title: "Conditions de succès", content: getJsonbValue(data, "analyse_faisabilite_business->facteurs_reussite->conditions_succes", []) },
            { title: "Risques principaux", content: getJsonbValue(data, "analyse_faisabilite_business->facteurs_reussite->risques_principaux", []) },
          ],
        },
        {
          title: "Solidité du Business Model",
          items: [
            { title: "Clarté concept", content: getJsonbValue(data, "analyse_faisabilite_business->solidite_business_model->>clarte_concept", "N/A") },
            { title: "Différenciation", content: getJsonbValue(data, "analyse_faisabilite_business->solidite_business_model->>differentiation", "N/A") },
            { title: "Scalabilité", content: getJsonbValue(data, "analyse_faisabilite_business->solidite_business_model->>scalabilite", "N/A") },
            { title: "Cohérence globale", content: getJsonbValue(data, "analyse_faisabilite_business->solidite_business_model->>coherence_globale", "N/A") },
          ],
        },
        {
          title: "Complexité Opérationnelle",
          items: [
            { title: "Délais lancement", content: getJsonbValue(data, "analyse_faisabilite_business->complexite_operationnelle->>delais_lancement", "N/A") },
            { title: "Facilité mise en œuvre", content: getJsonbValue(data, "analyse_faisabilite_business->complexite_operationnelle->>facilite_mise_oeuvre", "N/A") },
            { title: "Défis principaux", content: getJsonbValue(data, "analyse_faisabilite_business->complexite_operationnelle->principaux_defis", []) },
            { title: "Ressources nécessaires", content: getJsonbValue(data, "analyse_faisabilite_business->complexite_operationnelle->>ressources_necessaires", "N/A") },
          ],
        },
      ],
    },
    {
      id: 'innovation_risques',
      title: "Innovation & Adoption",
      score: parseInt(getJsonbValue(innovationRisques, "analyse_innovation_risques->evaluation_globale->>score_innovation_risque", "0")) || 0,
      subtitle: getJsonbValue(innovationRisques, "analyse_innovation_risques->evaluation_globale->>niveau_risque"),
      data: innovationRisques,
      popupTitle: "Innovation & Risques d'Adoption",
      iconSrc: "/icones-livrables/lightbulb-icon.png", // Assuming a lightbulb icon for innovation
      getSections: (data: any): PopupSection[] => [
        {
          title: "Niveau d'Originalité",
          items: [
            { title: "Degré innovation", content: getJsonbValue(data, "analyse_innovation_risques->niveau_originalite->>degre_innovation", "N/A") },
            { title: "Nouveauté concept", content: getJsonbValue(data, "analyse_innovation_risques->niveau_originalite->>nouveaute_concept", "N/A") },
            { title: "Avantage concurrentiel", content: getJsonbValue(data, "analyse_innovation_risques->niveau_originalite->>avantage_concurrentiel", "N/A") },
            { title: "Différenciation marché", content: getJsonbValue(data, "analyse_innovation_risques->niveau_originalite->>differentiation_marche", "N/A") },
          ],
        },
        {
          title: "Risques d'Adoption",
          items: [
            { title: "Barrières principales", content: getJsonbValue(data, "analyse_innovation_risques->risques_adoption->barrieres_principales", []) },
            { title: "Temps adoption", content: getJsonbValue(data, "analyse_innovation_risques->risques_adoption->>temps_adoption_estime", "N/A") },
            { title: "Facilité compréhension", content: getJsonbValue(data, "analyse_innovation_risques->risques_adoption->>facilite_comprehension", "N/A") },
            { title: "Résistance utilisateurs", content: getJsonbValue(data, "analyse_innovation_risques->risques_adoption->>resistance_utilisateurs", "N/A") },
          ],
        },
        {
          title: "Facteurs de Succès",
          items: [
            { title: "Atouts innovation", content: getJsonbValue(data, "analyse_innovation_risques->facteurs_succes_innovation->atouts_innovation", []) },
            { title: "Risques d'échec", content: getJsonbValue(data, "analyse_innovation_risques->facteurs_succes_innovation->risques_echec", []) },
            { title: "Conditions d'acceptation", content: getJsonbValue(data, "analyse_innovation_risques->facteurs_succes_innovation->conditions_acceptation", []) },
          ],
        },
      ],
    },
  ];

  const mainCard = cards.find(card => card.isMain);
  const secondaryCards = cards.filter(card => !card.isMain);

  const getScoreColor = (s: number) => {
    if (s === 5) return 'bg-green-500';
    if (s === 4) return 'bg-lime-500';
    if (s === 3) return 'bg-orange-400';
    if (s === 2) return 'bg-red-400';
    if (s === 1) return 'bg-red-600';
    return 'bg-gray-400'; // Score 0 ou non défini
  };

  return (
    <div className={`p-6 border border-gray-200 rounded-xl shadow-sm bg-white ${className}`}>
      {/* Layout responsive avec carte principale et grid 2x2 */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6">
        {/* Carte principale */}
        {mainCard && (
          <ScoreCard
            key={mainCard.id}
            title="Note globale"
            score={mainCard.score}
            subtitle={mainCard.subtitle}
            resumeExecutif={mainCard.resumeExecutif}
            isMain={true}
            onViewMore={() => openDetailPopup(
              mainCard.popupTitle, 
              mainCard.getSections(mainCard.data), 
              mainCard.iconSrc,
              getJsonbValue(mainCard.data, "evaluation_finale->recommandations_prioritaires", [])
            )}
            isDisabled={!mainCard.data}
          />
        )}

        {/* Grid 2x2 pour les cartes secondaires */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {secondaryCards.map((card) => (
            <ScoreCard
              key={card.id}
              title={card.title}
              score={card.score}
              subtitle={card.subtitle}
              isMain={false}
              onViewMore={() => openDetailPopup(card.popupTitle, card.getSections(card.data), card.iconSrc)}
              isDisabled={!card.data}
            />
          ))}
        </div>
      </div>

      <ScoreDetailPopup
        isOpen={isPopupOpen}
        onClose={closeDetailPopup}
        title={popupContent?.title || ""}
        sections={popupContent?.sections || []}
        iconSrc={popupContent?.iconSrc}
        recommendations={popupContent?.recommendations}
      />
    </div>
  );
};

export default ProjectScoreCards;
