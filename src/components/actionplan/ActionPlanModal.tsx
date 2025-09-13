import React from 'react';
import HarmonizedDeliverableModal from '@/components/deliverables/shared/HarmonizedDeliverableModal';
import { HierarchicalElement } from '@/hooks/useActionPlanData';
import ActionPlanModalContent from './ActionPlanModalContent';
import { ListTodo, Flag, CheckSquare, Info, Clock, Calendar, User, CheckSquare as CheckSquareIcon, Link as LinkIcon, Wrench, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
interface ActionPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  element: HierarchicalElement | null;
}

const ActionPlanModal: React.FC<ActionPlanModalProps> = ({
  isOpen,
  onClose,
  element
}) => {
  if (!element) return null;

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

  const taskContent = element.type === 'tache' ? (
    <div className="space-y-6 w-full mx-auto">
      {element.objectif_principal && (
        <div className="mb-6">
          <p className="text-gray-700 text-[16px] whitespace-pre-line">
            {element.objectif_principal}
          </p>
        </div>
      )}

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

      {element.criteres_validation && formatArray(element.criteres_validation).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckSquareIcon className="h-4 w-4" />
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

      {element.dependances_taches && formatArray(element.dependances_taches).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
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

      {element.outils_necessaires && formatArray(element.outils_necessaires).length > 0 && (
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
  ) : null;

  return (
    <HarmonizedDeliverableModal
      isOpen={isOpen}
      onClose={onClose}
      title={element.nom}
      iconComponent={
        element.type === 'phase' ? <ListTodo className="w-6 h-6" /> :
        element.type === 'jalon' ? <Flag className="w-6 h-6" /> :
        element.type === 'tache' ? <CheckSquare className="w-6 h-6" /> : null
      }
      contentComponent={element.type === 'tache' ? taskContent : <ActionPlanModalContent element={element} />}
      recommendations={element.type === 'tache' && element.recommandations_pratiques ? element.recommandations_pratiques : undefined}
      modalWidthClass="max-w-5xl"
    />
  );
};

export default ActionPlanModal;
