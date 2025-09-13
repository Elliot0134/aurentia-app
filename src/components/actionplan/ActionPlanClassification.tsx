import React from 'react';
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
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="classification">
        <AccordionTrigger className="text-lg font-semibold">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Classification du projet
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            
            {/* Bloc 1: Contexte Projet */}
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50">
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
            <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100/50">
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
            <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100/50">
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

            {/* Bloc 4: Analyse Stratégique */}
            <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <AlertTriangle className="h-5 w-5" />
                  Analyse Stratégique
                </CardTitle>
                <CardDescription>Enjeux et opportunités identifiés par l'IA</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {classificationProjet?.enjeux_strategiques && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-sm">Enjeux stratégiques</span>
                    </div>
                    <div className="space-y-2">
                      {parseEnjeux(classificationProjet.enjeux_strategiques).map((enjeu: any, index: number) => (
                        <div key={index} className="bg-white/80 rounded p-3 text-sm">
                          <div className="font-medium mb-1">{enjeu.enjeu}</div>
                          <Badge 
                            variant="outline" 
                            className={`text-xs mb-2 ${
                              enjeu.criticite === 'Critique' ? 'border-red-300 bg-red-50 text-red-700' :
                              enjeu.criticite === 'Important' ? 'border-orange-300 bg-orange-50 text-orange-700' :
                              'border-gray-300 bg-gray-50 text-gray-700'
                            }`}
                          >
                            {enjeu.criticite}
                          </Badge>
                          <p className="text-xs text-gray-600">{enjeu.impact_plan_action}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {classificationProjet?.opportunites_principales && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-sm">Opportunités principales</span>
                    </div>
                    <div className="bg-white/80 rounded p-3 text-sm">
                      {classificationProjet.opportunites_principales}
                    </div>
                  </div>
                )}

                {classificationProjet?.contraintes_principales && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-sm">Contraintes principales</span>
                    </div>
                    <div className="bg-white/80 rounded p-3 text-sm">
                      {classificationProjet.contraintes_principales}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default ActionPlanClassification;