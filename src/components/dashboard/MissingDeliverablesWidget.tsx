import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProject } from '@/contexts/ProjectContext';
import { useNavigate } from 'react-router-dom';
import { Sparkles, MessageSquare, CheckCircle2, Target, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MissingDeliverablesWidgetProps {
  className?: string;
}

// Configuration des livrables avec priorités et descriptions
const DELIVERABLES_CONFIG = [
  {
    name: 'Cible B2C',
    key: 'Cible B2C',
    priority: 1,
    description: 'Définissez votre client idéal B2C',
    icon: '👥',
    category: 'Marché'
  },
  {
    name: 'Cible B2B',
    key: 'Cible B2B',
    priority: 1,
    description: 'Identifiez votre cible B2B',
    icon: '🏢',
    category: 'Marché'
  },
  {
    name: 'Cible Organismes',
    key: 'Cible Organismes',
    priority: 1,
    description: 'Ciblez les organismes publics',
    icon: '🏛️',
    category: 'Marché'
  },
  {
    name: 'Pitch',
    key: 'Pitch',
    priority: 2,
    description: 'Créez votre pitch de 2 minutes',
    icon: '🎤',
    category: 'Communication'
  },
  {
    name: 'Proposition de valeur',
    key: 'Proposition de valeur',
    priority: 2,
    description: 'Définissez votre valeur unique',
    icon: '💎',
    category: 'Stratégie'
  },
  {
    name: 'Business Model',
    key: 'Business Model',
    priority: 3,
    description: 'Structurez votre modèle économique',
    icon: '💼',
    category: 'Business'
  },
  {
    name: 'Analyse des ressources',
    key: 'Analyse des ressources',
    priority: 3,
    description: 'Identifiez vos ressources nécessaires',
    icon: '🛠️',
    category: 'Opérations'
  },
  {
    name: 'Concurrence',
    key: 'Concurrence',
    priority: 2,
    description: 'Analysez vos concurrents',
    icon: '⚔️',
    category: 'Marché'
  },
  {
    name: 'Marché',
    key: 'Marché',
    priority: 2,
    description: 'Étudiez votre marché cible',
    icon: '📊',
    category: 'Marché'
  },
  {
    name: 'Vision/Mission',
    key: 'Vision/Mission',
    priority: 1,
    description: 'Clarifiez votre vision et mission',
    icon: '🎯',
    category: 'Stratégie'
  }
];

const getPriorityBadge = (priority: number) => {
  switch (priority) {
    case 1:
      return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 text-xs">Prioritaire</Badge>;
    case 2:
      return <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200 text-xs">Important</Badge>;
    case 3:
      return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 text-xs">Recommandé</Badge>;
    default:
      return null;
  }
};

export const MissingDeliverablesWidget = ({ className }: MissingDeliverablesWidgetProps) => {
  const { deliverableNames, deliverablesLoading, currentProjectId } = useProject();
  const navigate = useNavigate();

  // Identifier les livrables manquants
  const missingDeliverables = DELIVERABLES_CONFIG.filter(
    (deliverable) => !deliverableNames.includes(deliverable.name)
  );

  // Trier par priorité (1 = haute, 3 = basse)
  const sortedMissing = missingDeliverables.sort((a, b) => a.priority - b.priority);

  // Prendre les 5 premiers
  const topMissing = sortedMissing.slice(0, 5);

  const handleGenerateDeliverable = (deliverableName: string) => {
    // Naviguer vers le chatbot avec un prompt pré-rempli
    navigate('/individual/chatbot', {
      state: {
        initialPrompt: `Je souhaite générer le livrable "${deliverableName}" pour mon projet.`
      }
    });
  };

  if (deliverablesLoading) {
    return (
      <Card className={cn("card-static", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#ff592b]" />
            Livrables suggérés
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="spinner-container">
            <div className="spinner"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentProjectId) {
    return (
      <Card className={cn("card-static", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#ff592b]" />
            Livrables suggérés
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-text-muted py-6">
            <Target className="h-12 w-12 mx-auto mb-3 text-text-muted/50" />
            <p>Sélectionnez un projet pour voir les livrables suggérés</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (missingDeliverables.length === 0) {
    return (
      <Card className={cn("card-static", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#ff592b]" />
            Livrables suggérés
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-500" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Félicitations ! 🎉
            </h3>
            <p className="text-sm text-text-muted">
              Tous les livrables principaux ont été générés pour ce projet !
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const completionPercent = Math.round(
    ((DELIVERABLES_CONFIG.length - missingDeliverables.length) / DELIVERABLES_CONFIG.length) * 100
  );

  return (
    <Card className={cn("card-static", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#ff592b]" />
            Livrables suggérés
          </CardTitle>
          <Badge variant="secondary" className="bg-aurentia-pink/10 text-aurentia-pink">
            {completionPercent}% complétés
          </Badge>
        </div>
        <p className="text-sm text-text-muted mt-1">
          {missingDeliverables.length} livrable{missingDeliverables.length > 1 ? 's' : ''} à générer
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {topMissing.map((deliverable) => (
          <div
            key={deliverable.key}
            className="flex items-center justify-between p-3 rounded-lg bg-[#f4f4f5] hover:bg-[#e8e8e9] transition-all duration-200 cursor-pointer group"
            onClick={() => handleGenerateDeliverable(deliverable.name)}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{deliverable.icon}</span>
                <h4 className="font-semibold text-text-primary truncate">
                  {deliverable.name}
                </h4>
                {getPriorityBadge(deliverable.priority)}
              </div>
              <p className="text-xs text-text-muted">
                {deliverable.description}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs bg-gray-200">
                  {deliverable.category}
                </Badge>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-text-muted group-hover:translate-x-1 transition-transform duration-200 flex-shrink-0 ml-2" />
          </div>
        ))}

        {missingDeliverables.length > 5 && (
          <div className="text-center pt-2">
            <p className="text-xs text-text-muted">
              Et {missingDeliverables.length - 5} autre{missingDeliverables.length - 5 > 1 ? 's' : ''} livrable{missingDeliverables.length - 5 > 1 ? 's' : ''}
            </p>
          </div>
        )}

        <Button
          onClick={() => navigate('/individual/chatbot')}
          className="w-full btn-secondary mt-3"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Générer avec le chatbot
        </Button>
      </CardContent>
    </Card>
  );
};
