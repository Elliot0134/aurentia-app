import { Card, CardContent } from '@/components/ui/card';
import { useUserStatusChecks } from '@/hooks/useUserStatusChecks';
import { useProject } from '@/contexts/ProjectContext';
import { CheckCircle2, Circle, Sparkles, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface StatusIndicatorsWidgetProps {
  className?: string;
}

export const StatusIndicatorsWidget = ({ className }: StatusIndicatorsWidgetProps) => {
  const { currentProjectId } = useProject();
  const { checks, completionPercentage, completedCount, totalCount, isLoading } = useUserStatusChecks(currentProjectId);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card className={cn("card-static", className)}>
        <CardContent className="pt-6">
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
        <CardContent className="pt-6">
          <div className="text-center text-text-muted py-4 text-sm">
            Sélectionnez un projet pour voir les indicateurs
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("card-static", className)}>
      <CardContent className="pt-6 space-y-4">
        {/* Progression globale */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[#ff592b]" />
            <span className="text-sm font-semibold text-text-primary">Progression</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted">{completedCount}/{totalCount}</span>
            <span className="text-lg font-bold text-[#ff592b]">{completionPercentage}%</span>
          </div>
        </div>

        {/* Liste des indicateurs */}
        <div className="space-y-2">
          {checks.map((check) => (
            <div
              key={check.id}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg transition-all duration-200",
                check.isCompleted
                  ? "bg-green-50 border border-green-200"
                  : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
              )}
            >
              {/* Icône de statut */}
              <div className="flex-shrink-0 mt-0.5">
                {check.isCompleted ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-400" />
                )}
              </div>

              {/* Contenu */}
              <div className="flex-1 min-w-0">
                <h4
                  className={cn(
                    "text-sm font-medium mb-0.5",
                    check.isCompleted ? "text-green-900" : "text-text-primary"
                  )}
                >
                  {check.label}
                </h4>
                <p
                  className={cn(
                    "text-xs",
                    check.isCompleted ? "text-green-700" : "text-text-muted"
                  )}
                >
                  {check.description}
                </p>
              </div>

              {/* Badge de priorité (optionnel, affiché uniquement si non complété) */}
              {!check.isCompleted && check.priority === 1 && (
                <div className="flex-shrink-0">
                  <Sparkles className="h-4 w-4 text-orange-500" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Message de félicitation si tout est complété */}
        {completionPercentage === 100 && (
          <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg text-center">
            <p className="text-sm font-semibold text-green-900">
              🎉 Excellent travail ! Tous les objectifs sont atteints.
            </p>
          </div>
        )}

        {/* Call to action si progression faible */}
        {completionPercentage < 50 && (
          <div className="mt-4 p-3 bg-aurentia-pink/5 border border-aurentia-pink/20 rounded-lg">
            <p className="text-xs text-text-muted text-center">
              Utilisez le chatbot pour générer vos livrables et créer votre plan d'action
            </p>
            <button
              onClick={() => navigate('/individual/chatbot')}
              className="w-full mt-2 px-3 py-1.5 bg-[#ff592b] hover:bg-[#ff592b]/90 text-white text-xs font-medium rounded-md transition-colors duration-200"
            >
              Accéder au chatbot
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
