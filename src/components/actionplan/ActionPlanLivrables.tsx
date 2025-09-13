import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Livrable } from '@/hooks/useActionPlanData';
import ActionPlanStatusBadge from './ActionPlanStatusBadge';
import { Package, FileText, CheckSquare, User, Calendar, ArrowRight } from 'lucide-react';

interface ActionPlanLivrablesProps {
  livrables: Livrable[];
}

const ActionPlanLivrables: React.FC<ActionPlanLivrablesProps> = ({ livrables }) => {
  if (!livrables || livrables.length === 0) {
    return (
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="livrables">
          <AccordionTrigger className="text-lg font-semibold">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Livrables ({0})
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>Aucun livrable défini pour ce projet</p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  }

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const parseCriteresQualite = (criteres: any) => {
    if (Array.isArray(criteres)) {
      return criteres;
    }
    if (typeof criteres === 'string') {
      try {
        const parsed = JSON.parse(criteres);
        return Array.isArray(parsed) ? parsed : [criteres];
      } catch {
        return [criteres];
      }
    }
    return [];
  };

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="livrables">
        <AccordionTrigger className="text-lg font-semibold">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Livrables ({livrables.length})
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {livrables.map((livrable) => (
              <Card key={livrable.id} className="border-gray-200 hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base font-semibold text-gray-900 leading-tight">
                        {livrable.livrable_nom}
                      </CardTitle>
                      <CardDescription className="text-xs text-gray-500 mt-1">
                        {livrable.livrable_id}
                      </CardDescription>
                    </div>
                    <ActionPlanStatusBadge type="status" value={livrable.statut} />
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Contexte hiérarchique */}
                  <div className="space-y-2">
                    {livrable.nom_phase && (
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                        <span className="text-gray-600 font-medium">{livrable.nom_phase}</span>
                      </div>
                    )}
                    
                    {livrable.nom_tache && (
                      <div className="flex items-center gap-2 text-sm ml-4">
                        <ArrowRight className="h-3 w-3 text-gray-400" />
                        <span className="text-gray-500">{livrable.nom_tache}</span>
                      </div>
                    )}
                  </div>

                  {/* Format attendu */}
                  {livrable.format_attendu && (
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="text-xs font-medium text-gray-700">Format</span>
                      </div>
                      <Badge variant="outline" className="text-xs bg-gray-50">
                        {livrable.format_attendu}
                      </Badge>
                    </div>
                  )}

                  {/* Critères de qualité */}
                  {livrable.criteres_qualite && parseCriteresQualite(livrable.criteres_qualite).length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <CheckSquare className="h-4 w-4 text-gray-500" />
                        <span className="text-xs font-medium text-gray-700">Critères qualité</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {parseCriteresQualite(livrable.criteres_qualite).map((critere, index) => (
                          <Badge 
                            key={index} 
                            variant="outline" 
                            className="text-xs bg-green-50 border-green-200 text-green-700"
                          >
                            {critere}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Validateur */}
                  {livrable.validateur && (
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-xs font-medium text-gray-700">Validateur</span>
                      </div>
                      <Badge variant="outline" className="text-xs bg-purple-50 border-purple-200 text-purple-700">
                        {livrable.validateur}
                      </Badge>
                    </div>
                  )}

                  {/* Date de création */}
                  <div className="border-t pt-3 mt-4">
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Créé le {formatDate(livrable.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Statistiques en bas */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {livrables.length}
                </div>
                <div className="text-xs text-gray-500">Total livrables</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {livrables.filter(l => l.statut === 'À faire').length}
                </div>
                <div className="text-xs text-gray-500">À faire</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {livrables.filter(l => l.statut === 'En cours').length}
                </div>
                <div className="text-xs text-gray-500">En cours</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {livrables.filter(l => l.statut === 'Terminé').length}
                </div>
                <div className="text-xs text-gray-500">Terminé</div>
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default ActionPlanLivrables;