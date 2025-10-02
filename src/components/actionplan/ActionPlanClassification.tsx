import React, { useState, useRef } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserResponses, ClassificationProjet } from '@/hooks/useActionPlanData';
import { Users, DollarSign, Calendar, Zap, Target, AlertTriangle, TrendingUp, Settings } from 'lucide-react';

interface ActionPlanClassificationProps {
  userResponses: UserResponses | null;
  classificationProjet: ClassificationProjet | null;
}

const ActionPlanClassification: React.FC<ActionPlanClassificationProps> = ({
  userResponses,
  classificationProjet
}) => {
  const [activeTab, setActiveTab] = useState<'contexte-planning' | 'analyse-strategique'>('contexte-planning');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleTabChange = (newTab: 'contexte-planning' | 'analyse-strategique') => {
    if (newTab === activeTab || isTransitioning) return;

    setIsTransitioning(true);

    setTimeout(() => {
      setActiveTab(newTab);

      setTimeout(() => {
        setIsTransitioning(false);
      }, 60);
    }, 100);
  };

  if (!userResponses && !classificationProjet) {
    return null;
  }

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const parseEnjeux = (enjeuxStr: string) => {
    try {
      const enjeux = JSON.parse(enjeuxStr);
      return Array.isArray(enjeux) ? enjeux : [];
    } catch {
      return [];
    }
  };

  const parseStringArray = (str: string) => {
    try {
      const arr = JSON.parse(str);
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  };

  const getTypeInvestissementLabel = (type: string) => {
    switch (type) {
      case 'econome': return 'Économe (solutions pas chères)';
      case 'equilibre': return 'Équilibré (investir quand utile)';
      case 'ambitieux': return 'Ambitieux (investir pour aller plus vite)';
      default: return type;
    }
  };

  const getUrgenceLabel = (urgence: string) => {
    switch (urgence) {
      case 'pas_presse': return 'Pas pressé';
      case 'rythme_normal': return 'Rythme normal';
      case 'assez_urgent': return 'Assez urgent';
      case 'tres_urgent': return 'Très urgent';
      default: return urgence;
    }
  };

  const getPreferenceLabel = (preference: string) => {
    switch (preference) {
      case 'tout_preparer': return 'Tout préparer (lancer quand c\'est parfait)';
      case 'tester_rapidement': return 'Tester rapidement (lancer vite et améliorer)';
      case 'suivre_chiffres': return 'Suivre les chiffres (décider avec les données)';
      default: return preference;
    }
  };

  return (
    <div className="bg-white border-0 shadow-md p-4 rounded-lg">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="classification" className="border-b-0">
        <AccordionTrigger className="text-lg font-semibold hover:no-underline">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Classification du projet
          </div>
        </AccordionTrigger>
        <AccordionContent>
          {/* Tab Navigation */}
          <div className="flex bg-white border-b border-gray-100 mb-6">
            <button
              className={`py-3 px-6 text-sm font-medium transition-all duration-200 ${
                activeTab === 'contexte-planning' ? 'border-b-2 border-orange-500 text-orange-500' : 'text-gray-600 hover:text-gray-800'
              }`}
              onClick={() => handleTabChange('contexte-planning')}
            >
              Contexte & Planning
            </button>
            <button
              className={`py-3 px-6 text-sm font-medium transition-all duration-200 ${
                activeTab === 'analyse-strategique' ? 'border-b-2 border-orange-500 text-orange-500' : 'text-gray-600 hover:text-gray-800'
              }`}
              onClick={() => handleTabChange('analyse-strategique')}
            >
              Analyse stratégique
            </button>
          </div>

          {/* Tab Content */}
          <div
            ref={contentRef}
            className={`transition-all duration-300 ${isTransitioning ? 'opacity-0 blur-sm transform translate-y-2' : 'opacity-100 blur-0 transform translate-y-0'}`}
          >
            {activeTab === 'contexte-planning' && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
              {/* Bloc 1: Contexte Projet */}
              <Card className="border-blue-200" style={{ backgroundColor: '#F3F4F6' }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <Users className="h-5 w-5" />
                    Contexte Projet
                  </CardTitle>
                  <CardDescription>Équipe et approche budgétaire</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {userResponses?.budget && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-sm">Budget disponible</span>
                      </div>
                      <Badge variant="outline" className="bg-white/80">
                        {userResponses.budget}
                      </Badge>
                    </div>
                  )}

                  {userResponses?.type_investissement && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Settings className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-sm">Style d'investissement</span>
                      </div>
                      <Badge variant="outline" className="bg-white/80">
                        {getTypeInvestissementLabel(userResponses.type_investissement)}
                      </Badge>
                    </div>
                  )}

                  {userResponses?.roles && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-sm">Équipe</span>
                      </div>
                      <div className="bg-white/80 rounded p-3 text-sm whitespace-pre-line">
                        {userResponses.roles}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Bloc 2: Planning & Urgence */}
              <Card className="border-orange-200" style={{ backgroundColor: '#F3F4F6' }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-800">
                    <Calendar className="h-5 w-5" />
                    Planning & Urgence
                  </CardTitle>
                  <CardDescription>Échéances et contraintes temporelles</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {userResponses?.date_lancement_prevu && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-orange-600" />
                        <span className="font-medium text-sm">Date de lancement souhaitée</span>
                      </div>
                      <Badge variant="outline" className="bg-white/80">
                        {formatDate(userResponses.date_lancement_prevu)}
                      </Badge>
                    </div>
                  )}

                  {userResponses?.urgence_lancement && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="h-4 w-4 text-orange-600" />
                        <span className="font-medium text-sm">Niveau d'urgence</span>
                      </div>
                      <Badge variant="outline" className="bg-white/80">
                        {getUrgenceLabel(userResponses.urgence_lancement)}
                      </Badge>
                    </div>
                  )}

                  {userResponses?.ressources_disponibles && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="h-4 w-4 text-orange-600" />
                        <span className="font-medium text-sm">Ressources disponibles</span>
                      </div>
                      <div className="bg-white/80 rounded p-3 text-sm">
                        {userResponses.ressources_disponibles}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Bloc 3: Style de Travail */}
              <Card className="border-purple-200" style={{ backgroundColor: '#F3F4F6' }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-800">
                    <TrendingUp className="h-5 w-5" />
                    Style de Travail
                  </CardTitle>
                  <CardDescription>Approche et tolérance au risque</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {userResponses?.prise_de_risque && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-purple-600" />
                        <span className="font-medium text-sm">Prise de risque</span>
                      </div>
                      <Badge variant="outline" className="bg-white/80">
                        {userResponses.prise_de_risque}
                      </Badge>
                    </div>
                  )}

                  {userResponses?.preference_avancement && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="h-4 w-4 text-purple-600" />
                        <span className="font-medium text-sm">Méthode préférée</span>
                      </div>
                      <div className="bg-white/80 rounded p-3 text-sm">
                        {getPreferenceLabel(userResponses.preference_avancement)}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'analyse-strategique' && (
            <div className="space-y-6 w-full">
              {classificationProjet?.enjeux_strategiques && (
                <div>
                  <h3 className="text-lg font-semibold text-black mb-4">Enjeux stratégiques</h3>

                  {/* Version mobile : cartes */}
                  <div className="md:hidden space-y-3">
                    {parseEnjeux(classificationProjet.enjeux_strategiques).map((enjeu: any, index: number) => (
                      <Card
                        key={index}
                        className={`border shadow-sm ${
                          enjeu.criticite === 'Critique' ? 'border-red-300' :
                          enjeu.criticite === 'Important' ? 'border-orange-300' :
                          'border-gray-300'
                        }`}
                      >
                        <CardHeader className="pb-3">
                          <div className="space-y-2">
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                enjeu.criticite === 'Critique' ? 'border-red-300 bg-red-50 text-red-700' :
                                enjeu.criticite === 'Important' ? 'border-orange-300 bg-orange-50 text-orange-700' :
                                'border-gray-300 bg-gray-50 text-gray-700'
                              }`}
                            >
                              {enjeu.criticite}
                            </Badge>
                            <CardTitle className="text-sm font-bold text-black">{enjeu.enjeu}</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-sm text-gray-600">{enjeu.impact_plan_action}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Version desktop : tableau */}
                  <div className="hidden md:block bg-white/80 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-100 border-b">
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Titre</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Niveau</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parseEnjeux(classificationProjet.enjeux_strategiques).map((enjeu: any, index: number) => (
                          <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium">{enjeu.enjeu}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{enjeu.impact_plan_action}</td>
                            <td className="px-4 py-3">
                              <Badge
                                variant="outline"
                                className={`text-xs ${
                                  enjeu.criticite === 'Critique' ? 'border-red-300 bg-red-50 text-red-700' :
                                  enjeu.criticite === 'Important' ? 'border-orange-300 bg-orange-50 text-orange-700' :
                                  'border-gray-300 bg-gray-50 text-gray-700'
                                }`}
                              >
                                {enjeu.criticite}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {classificationProjet?.opportunites_principales && (
                <div>
                  <h3 className="text-lg font-semibold text-black mb-4">Opportunités principales</h3>
                  <div className="bg-white/80 rounded p-4">
                    <ul className="space-y-2">
                      {parseStringArray(classificationProjet.opportunites_principales).map((item: string, index: number) => (
                        <li key={index} className="text-sm flex items-start">
                          <span className="text-gray-500 mr-2">•</span>
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {classificationProjet?.contraintes_principales && (
                <div>
                  <h3 className="text-lg font-semibold text-black mb-4">Contraintes principales</h3>
                  <div className="bg-white/80 rounded p-4">
                    <ul className="space-y-2">
                      {parseStringArray(classificationProjet.contraintes_principales).map((item: string, index: number) => (
                        <li key={index} className="text-sm flex items-start">
                          <span className="text-gray-500 mr-2">•</span>
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </div>
  );
};

export default ActionPlanClassification;
