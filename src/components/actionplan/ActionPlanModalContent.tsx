import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HierarchicalElement } from '@/hooks/useActionPlanData';
import ActionPlanStatusBadge from './ActionPlanStatusBadge';
import { 
  Layers3, 
  Target, 
  CheckSquare, 
  DollarSign, 
  Users, 
  Clock, 
  AlertTriangle, 
  Package,
  Wrench,
  Brain,
  Link,
  Calendar,
  User,
  Info
} from 'lucide-react';

interface ActionPlanModalContentProps {
  element: HierarchicalElement;
}

const ActionPlanModalContent: React.FC<ActionPlanModalContentProps> = ({ element }) => {

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const formatArray = (arr: any[]) => {
    if (!Array.isArray(arr) || arr.length === 0) return [];
    return arr.map(item => typeof item === 'string' ? item : String(item));
  };

  return (
    <div className="space-y-6 w-full mx-auto">
      {/* Contenu spécifique aux tâches */}
      {element.type === 'tache' && element.objectif_principal && (
        <div className="mb-6"> {/* Ajout d'une marge en bas pour séparer des infos générales */}
          <p className="text-gray-700 text-[16px] whitespace-pre-line">
            {element.objectif_principal}
          </p>
        </div>
      )}

      {/* Informations de base */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="h-4 w-4" />
            Informations générales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {element.duree && (
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <Clock className="h-4 w-4" />
                  <span>Durée</span>
                </div>
                <div className="font-medium">{element.duree}</div>
              </div>
            )}

            {element.periode && (
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <Calendar className="h-4 w-4" />
                  <span>Période</span>
                </div>
                <div className="font-medium">{element.periode}</div>
              </div>
            )}

            {element.responsable && (
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <User className="h-4 w-4" />
                  <span>Responsable</span>
                </div>
                <div className="font-medium">{element.responsable}</div>
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <Calendar className="h-4 w-4" />
                <span>Créé le</span>
              </div>
              <div className="font-medium text-sm">{formatDate(element.created_at)}</div>
            </div>

            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <Calendar className="h-4 w-4" />
                <span>Modifié le</span>
              </div>
              <div className="font-medium text-sm">{formatDate(element.updated_at)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contenu spécifique aux phases */}
      {element.type === 'phase' && (
        <>
          {/* Budget */}
          {(element.budget_minimum || element.budget_optimal) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Budget
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {element.budget_minimum && (
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Budget minimum</div>
                      <div className="text-lg font-bold text-green-600">
                        {element.budget_minimum.toLocaleString()}€
                      </div>
                    </div>
                  )}
                  {element.budget_optimal && (
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Budget optimal</div>
                      <div className="text-lg font-bold text-blue-600">
                        {element.budget_optimal.toLocaleString()}€
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Focus sectoriel */}
          {element.focus_sectoriel && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Focus sectoriel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 break-words">{element.focus_sectoriel}</p>
              </CardContent>
            </Card>
          )}

          {/* Livrables majeurs */}
          {element.livrables_majeurs && formatArray(element.livrables_majeurs).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Livrables majeurs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {formatArray(element.livrables_majeurs).map((livrable, index) => (
                    <Badge key={index} variant="outline" className="bg-green-50 border-green-200 text-green-700">
                      {livrable}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ressources clés */}
          {element.ressources_cles && formatArray(element.ressources_cles).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Ressources clés
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {formatArray(element.ressources_cles).map((ressource, index) => (
                    <Badge key={index} variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
                      {ressource}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Risques de phase */}
          {element.risques_phase && formatArray(element.risques_phase).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Risques identifiés
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {formatArray(element.risques_phase).map((risque, index) => (
                    <Badge key={index} variant="outline" className="bg-red-50 border-red-200 text-red-700">
                      {risque}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Contenu spécifique aux jalons */}
      {element.type === 'jalon' && element.impact_si_echec && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Impact en cas d'échec
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 break-words">{element.impact_si_echec}</p>
          </CardContent>
        </Card>
      )}

      {/* Critères de validation */}
      {element.type === 'tache' && element.criteres_validation && formatArray(element.criteres_validation).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              Critères de validation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {formatArray(element.criteres_validation).map((critere, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                  <span className="text-gray-700">{critere}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dépendances */}
      {element.type === 'tache' && element.dependances_taches && formatArray(element.dependances_taches).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Link className="h-4 w-4" />
              Dépendances
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {formatArray(element.dependances_taches).map((dependance, index) => (
                <Badge key={index} variant="outline" className="bg-orange-50 border-orange-200 text-orange-700">
                  {dependance}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Outils nécessaires */}
      {element.type === 'tache' && element.outils_necessaires && formatArray(element.outils_necessaires).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Outils nécessaires
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {formatArray(element.outils_necessaires).map((outil, index) => (
                <Badge key={index} variant="outline" className="bg-purple-50 border-purple-200 text-purple-700">
                  {outil}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ActionPlanModalContent;
