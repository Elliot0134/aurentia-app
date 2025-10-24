import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useActionPlanTimeline } from '@/hooks/useActionPlanTimeline';
import { useProject } from '@/contexts/ProjectContext';
import { BarChart3, CheckCircle2, Circle, AlertCircle, Settings, TrendingUp, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ActionPlanTimelineWidgetProps {
  className?: string;
}

export const ActionPlanTimelineWidget = ({ className }: ActionPlanTimelineWidgetProps) => {
  const { userProjects, currentProjectId, setCurrentProjectId } = useProject();
  const { timelineData, isLoading, updateCurrentPhase, hasActionPlan } = useActionPlanTimeline(currentProjectId);
  const { toast } = useToast();
  const [changeFocusOpen, setChangeFocusOpen] = useState(false);
  const [selectedPhaseId, setSelectedPhaseId] = useState('');

  const handleChangeFocus = async () => {
    if (!selectedPhaseId) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner une phase',
        variant: 'destructive'
      });
      return;
    }

    const success = await updateCurrentPhase(selectedPhaseId);

    if (success) {
      toast({
        title: 'Focus changé',
        description: 'Votre focus a été mis à jour avec succès'
      });
      setChangeFocusOpen(false);
      setSelectedPhaseId('');
    } else {
      toast({
        title: 'Erreur',
        description: 'Impossible de changer le focus',
        variant: 'destructive'
      });
    }
  };

  const handleAcceptSuggestion = async () => {
    if (!timelineData.suggestedNextPhase) return;

    const success = await updateCurrentPhase(timelineData.suggestedNextPhase.phase_id);

    if (success) {
      toast({
        title: 'Phase suivante activée',
        description: `Vous travaillez maintenant sur: ${timelineData.suggestedNextPhase.nom_phase}`
      });
    }
  };

  const getCriticiteColor = (criticite: string) => {
    switch (criticite) {
      case 'Critique':
      case 'Bloquante':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Élevée':
      case 'Important':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  if (isLoading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-aurentia-pink" />
            Plan d'Action
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-pulse text-gray-500">Chargement...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hasActionPlan) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-aurentia-pink" />
            Plan d'Action
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Aucun plan d'action généré</p>
            <p className="text-sm text-gray-500">
              Créez un plan d'action pour suivre votre progression
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={cn("w-full", className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-aurentia-pink" />
              Plan d'Action
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setChangeFocusOpen(true)}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Changer Focus
            </Button>
          </div>
          {userProjects.length > 1 && (
            <Select value={currentProjectId || ''} onValueChange={setCurrentProjectId}>
              <SelectTrigger className="w-full mt-2">
                <SelectValue placeholder="Sélectionner un projet" />
              </SelectTrigger>
              <SelectContent>
                {userProjects.map((project) => (
                  <SelectItem key={project.project_id} value={project.project_id}>
                    {project.nom_projet}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Completion Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-aurentia-pink" />
                <span className="font-medium">Progression Globale</span>
              </div>
              <span className="text-lg font-bold text-aurentia-pink">
                {timelineData.completionPercentage}%
              </span>
            </div>
            <Progress value={timelineData.completionPercentage} className="h-3" />
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{timelineData.completedTasks + timelineData.completedMilestones} complétés</span>
              <span>{timelineData.totalTasks + timelineData.totalMilestones} total</span>
            </div>
          </div>

          {/* Smart Suggestion Alert */}
          {timelineData.isPhaseComplete && timelineData.suggestedNextPhase && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="flex items-center justify-between">
                <span className="text-sm text-green-800">
                  Phase actuelle terminée ! Passer à: <strong>{timelineData.suggestedNextPhase.nom_phase}</strong>
                </span>
                <Button
                  size="sm"
                  onClick={handleAcceptSuggestion}
                  className="ml-2 bg-green-600 hover:bg-green-700 text-white"
                >
                  Activer
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Current Phase Panel */}
          {timelineData.currentPhase && (
            <div className="border rounded-lg p-4 bg-gradient-to-br from-aurentia-pink/5 to-purple-50">
              <div className="flex items-start gap-3 mb-3">
                <Target className="h-5 w-5 text-aurentia-pink flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 mb-1">Focus Actuel</h3>
                  <p className="text-sm font-semibold text-aurentia-pink">
                    {timelineData.currentPhase.nom_phase}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-600">
                    {timelineData.currentPhase.duree_mois && (
                      <span className="flex items-center gap-1">
                        📅 {timelineData.currentPhase.duree_mois}
                      </span>
                    )}
                    {timelineData.currentPhase.periode && (
                      <span className="flex items-center gap-1">
                        🗓️ {timelineData.currentPhase.periode}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Task Stats in Current Phase */}
              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-gray-600">
                    {timelineData.tasksInCurrentPhase.filter(t => t.statut === 'Terminé').length} OK
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Circle className="h-4 w-4 text-blue-600" />
                  <span className="text-gray-600">
                    {timelineData.tasksInCurrentPhase.filter(t => t.statut === 'En cours').length} En cours
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Circle className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">
                    {timelineData.tasksInCurrentPhase.filter(t => t.statut === 'À faire').length} À faire
                  </span>
                </div>
              </div>

              {/* Milestones in Current Phase */}
              {timelineData.milestonesInCurrentPhase.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <h4 className="text-xs font-medium text-gray-700 mb-2">Jalons de cette phase</h4>
                  <div className="space-y-2">
                    {timelineData.milestonesInCurrentPhase.slice(0, 3).map((milestone) => (
                      <div
                        key={milestone.id}
                        className="flex items-center justify-between p-2 bg-white/70 rounded border border-gray-200"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className={cn(
                            "w-2 h-2 rounded-full flex-shrink-0",
                            milestone.statut === 'Terminé' ? 'bg-green-500' :
                            milestone.statut === 'En cours' ? 'bg-blue-500' : 'bg-gray-300'
                          )} />
                          <span className="text-xs truncate">{milestone.jalon_nom}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn("text-xs ml-2", getCriticiteColor(milestone.criticite))}
                        >
                          {milestone.semaine}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Upcoming Milestones (Next 3 across all phases) */}
          {timelineData.upcomingMilestones.length > 0 && (
            <div className="border rounded-lg p-4 bg-gray-50/50">
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                🎯 Prochains Jalons Importants
              </h4>
              <div className="space-y-2">
                {timelineData.upcomingMilestones.map((milestone) => (
                  <div
                    key={milestone.id}
                    className="flex items-center justify-between p-2 bg-white rounded border"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {milestone.jalon_nom}
                      </p>
                      <p className="text-xs text-gray-500">{milestone.semaine}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn("ml-2", getCriticiteColor(milestone.criticite))}
                    >
                      {milestone.criticite}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* View All Tasks Button */}
          <Button
            variant="link"
            className="w-full text-aurentia-pink hover:text-aurentia-pink/80"
            onClick={() => window.location.href = '/individual/plan-action'}
          >
            Voir toutes les tâches →
          </Button>
        </CardContent>
      </Card>

      {/* Change Focus Dialog */}
      <Dialog open={changeFocusOpen} onOpenChange={setChangeFocusOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Changer votre focus</DialogTitle>
            <DialogDescription>
              Sélectionnez la phase sur laquelle vous souhaitez vous concentrer.
              Cela mettra à jour les tâches et jalons affichés dans votre dashboard.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Phase à activer
              </label>
              <Select value={selectedPhaseId} onValueChange={setSelectedPhaseId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une phase" />
                </SelectTrigger>
                <SelectContent>
                  {timelineData.phases.map((phase) => (
                    <SelectItem key={phase.phase_id} value={phase.phase_id}>
                      {phase.nom_phase}
                      {phase.duree_mois && ` (${phase.duree_mois})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {timelineData.currentPhase && (
                <p className="text-xs text-gray-500 mt-1">
                  Focus actuel : {timelineData.currentPhase.nom_phase}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChangeFocusOpen(false)}>
              Annuler
            </Button>
            <Button
              className="bg-aurentia-pink hover:bg-aurentia-pink/90"
              onClick={handleChangeFocus}
            >
              Changer Focus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
