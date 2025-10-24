import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useActionPlanData, type Jalon, type Tache, type Phase } from '@/hooks/useActionPlanData';

export interface ActionPlanTimelineData {
  completionPercentage: number;
  currentPhase: Phase | null;
  currentPhaseId: string | null;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  totalMilestones: number;
  completedMilestones: number;
  tasksInCurrentPhase: Tache[];
  milestonesInCurrentPhase: Jalon[];
  upcomingMilestones: Jalon[];
  phases: Phase[];
  isPhaseComplete: boolean;
  suggestedNextPhase: Phase | null;
}

/**
 * Hook pour gérer la timeline du plan d'action avec suivi basé sur la complétion
 * Flexible tracking system - no rigid week-based progression
 * @param projectId ID du projet
 * @returns Données de la timeline et méthodes pour la gérer
 */
export const useActionPlanTimeline = (projectId: string | null) => {
  const { data: actionPlanData, isLoading, error } = useActionPlanData(projectId);
  const [timelineData, setTimelineData] = useState<ActionPlanTimelineData>({
    completionPercentage: 0,
    currentPhase: null,
    currentPhaseId: null,
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    todoTasks: 0,
    totalMilestones: 0,
    completedMilestones: 0,
    tasksInCurrentPhase: [],
    milestonesInCurrentPhase: [],
    upcomingMilestones: [],
    phases: [],
    isPhaseComplete: false,
    suggestedNextPhase: null
  });

  /**
   * Calculate overall completion percentage based on completed tasks and milestones
   */
  const calculateCompletionPercentage = useCallback((taches: Tache[], jalons: Jalon[]): number => {
    const totalItems = taches.length + jalons.length;
    if (totalItems === 0) return 0;

    const completedTasks = taches.filter(t => t.statut === 'Terminé').length;
    const completedMilestones = jalons.filter(j => j.statut === 'Terminé').length;
    const completedItems = completedTasks + completedMilestones;

    return Math.round((completedItems / totalItems) * 100);
  }, []);

  /**
   * Infer current phase from user activity or manual selection
   * Priority: 1) Manual selection, 2) Phase with most recent activity, 3) First incomplete phase
   */
  const inferCurrentPhase = useCallback((
    phases: Phase[],
    taches: Tache[],
    manualPhaseId: string | null
  ): Phase | null => {
    if (!phases || phases.length === 0) return null;

    // 1. If manually set, use that
    if (manualPhaseId) {
      const manualPhase = phases.find(p => p.phase_id === manualPhaseId);
      if (manualPhase) return manualPhase;
    }

    // 2. Find phase with most recently updated tasks
    const phasesWithActivity = phases.map(phase => {
      const phaseTasks = taches.filter(t => t.phase_parent_id === phase.phase_id);
      const latestUpdate = phaseTasks.reduce((latest, task) => {
        const taskDate = new Date(task.updated_at).getTime();
        return taskDate > latest ? taskDate : latest;
      }, 0);
      return { phase, latestUpdate, tasksCount: phaseTasks.length };
    }).filter(p => p.latestUpdate > 0);

    if (phasesWithActivity.length > 0) {
      phasesWithActivity.sort((a, b) => b.latestUpdate - a.latestUpdate);
      return phasesWithActivity[0].phase;
    }

    // 3. Return first incomplete phase
    const incompletePhase = phases.find(p => p.statut !== 'Terminé');
    return incompletePhase || phases[0];
  }, []);

  /**
   * Get tasks for a specific phase
   */
  const getTasksForPhase = useCallback((taches: Tache[], phaseId: string): Tache[] => {
    return taches.filter(t => t.phase_parent_id === phaseId);
  }, []);

  /**
   * Get milestones for a specific phase
   */
  const getMilestonesForPhase = useCallback((jalons: Jalon[], phaseId: string): Jalon[] => {
    return jalons.filter(j => j.phase_parent_id === phaseId);
  }, []);

  /**
   * Get next N upcoming incomplete milestones (across all phases)
   */
  const getUpcomingMilestones = useCallback((jalons: Jalon[], limit: number = 3): Jalon[] => {
    return jalons
      .filter(j => j.statut !== 'Terminé')
      .sort((a, b) => {
        // Sort by criticite first (Critique > Bloquante > Important > others)
        const criticalityOrder: Record<string, number> = {
          'Critique': 1,
          'Bloquante': 2,
          'Important': 3,
          'Élevée': 4,
          'Modérée': 5,
          'Normal': 6
        };
        const aCrit = criticalityOrder[a.criticite] || 10;
        const bCrit = criticalityOrder[b.criticite] || 10;
        if (aCrit !== bCrit) return aCrit - bCrit;

        // Then sort by semaine (S3, S6, S10, etc.)
        const extractWeek = (semaine: string | null): number => {
          if (!semaine) return 9999;
          const match = semaine.match(/S?(\d+)/);
          return match ? parseInt(match[1], 10) : 9999;
        };
        return extractWeek(a.semaine) - extractWeek(b.semaine);
      })
      .slice(0, limit);
  }, []);

  /**
   * Check if current phase is complete
   */
  const isPhaseComplete = useCallback((
    tasks: Tache[],
    milestones: Jalon[]
  ): boolean => {
    const allItems = [...tasks, ...milestones];
    if (allItems.length === 0) return false;
    return allItems.every(item => item.statut === 'Terminé');
  }, []);

  /**
   * Get suggested next phase (next incomplete phase after current)
   */
  const getSuggestedNextPhase = useCallback((
    phases: Phase[],
    currentPhase: Phase | null
  ): Phase | null => {
    if (!currentPhase) return null;

    const currentIndex = phases.findIndex(p => p.phase_id === currentPhase.phase_id);
    if (currentIndex === -1) return null;

    // Find next incomplete phase
    for (let i = currentIndex + 1; i < phases.length; i++) {
      if (phases[i].statut !== 'Terminé') {
        return phases[i];
      }
    }

    return null;
  }, []);

  /**
   * Update current phase (manual selection)
   */
  const updateCurrentPhase = useCallback(async (phaseId: string) => {
    if (!projectId) return false;

    try {
      const { error } = await supabase
        .rpc('update_action_plan_current_phase', {
          project_uuid: projectId,
          phase_id_value: phaseId
        });

      if (error) {
        console.error('Error updating current phase:', error);
        return false;
      }

      // Update local state
      setTimelineData(prev => ({
        ...prev,
        currentPhaseId: phaseId
      }));

      return true;
    } catch (err) {
      console.error('Error updating current phase:', err);
      return false;
    }
  }, [projectId]);

  // Calculate and update timeline data when action plan data changes
  useEffect(() => {
    if (!actionPlanData.phases.length || !actionPlanData.taches.length) {
      return;
    }

    const manualPhaseId = (actionPlanData.userResponses as any)?.current_phase_id || null;
    const currentPhase = inferCurrentPhase(actionPlanData.phases, actionPlanData.taches, manualPhaseId);

    const completionPercentage = calculateCompletionPercentage(
      actionPlanData.taches,
      actionPlanData.jalons
    );

    const completedTasks = actionPlanData.taches.filter(t => t.statut === 'Terminé').length;
    const inProgressTasks = actionPlanData.taches.filter(t => t.statut === 'En cours').length;
    const todoTasks = actionPlanData.taches.filter(t => t.statut === 'À faire').length;
    const completedMilestones = actionPlanData.jalons.filter(j => j.statut === 'Terminé').length;

    const tasksInCurrentPhase = currentPhase
      ? getTasksForPhase(actionPlanData.taches, currentPhase.phase_id)
      : [];

    const milestonesInCurrentPhase = currentPhase
      ? getMilestonesForPhase(actionPlanData.jalons, currentPhase.phase_id)
      : [];

    const upcomingMilestones = getUpcomingMilestones(actionPlanData.jalons, 3);
    const phaseComplete = isPhaseComplete(tasksInCurrentPhase, milestonesInCurrentPhase);
    const suggestedNextPhase = phaseComplete ? getSuggestedNextPhase(actionPlanData.phases, currentPhase) : null;

    setTimelineData({
      completionPercentage,
      currentPhase,
      currentPhaseId: currentPhase?.phase_id || null,
      totalTasks: actionPlanData.taches.length,
      completedTasks,
      inProgressTasks,
      todoTasks,
      totalMilestones: actionPlanData.jalons.length,
      completedMilestones,
      tasksInCurrentPhase,
      milestonesInCurrentPhase,
      upcomingMilestones,
      phases: actionPlanData.phases,
      isPhaseComplete: phaseComplete,
      suggestedNextPhase
    });
  }, [
    actionPlanData,
    calculateCompletionPercentage,
    inferCurrentPhase,
    getTasksForPhase,
    getMilestonesForPhase,
    getUpcomingMilestones,
    isPhaseComplete,
    getSuggestedNextPhase
  ]);

  return {
    timelineData,
    isLoading,
    error,
    updateCurrentPhase,
    hasActionPlan: !!actionPlanData.userResponses
  };
};
