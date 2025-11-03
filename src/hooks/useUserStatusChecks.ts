import { useState, useEffect } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { useActionPlanData } from '@/hooks/useActionPlanData';

export interface UserStatusCheck {
  id: string;
  label: string;
  description: string;
  isCompleted: boolean;
  icon: string;
  priority: number; // 1 = high, 2 = medium, 3 = low
}

export interface UserStatusChecks {
  checks: UserStatusCheck[];
  completionPercentage: number;
  completedCount: number;
  totalCount: number;
}

/**
 * Hook pour vérifier les statuts utilisateur (plan d'action, livrables premium, etc.)
 * @param projectId ID du projet actuel
 * @returns Statuts utilisateur avec pourcentage de complétion
 */
export const useUserStatusChecks = (projectId: string | null) => {
  const { deliverableNames, deliverablesLoading } = useProject();
  const { data: actionPlanData, isLoading: actionPlanLoading } = useActionPlanData(projectId);
  const [statusChecks, setStatusChecks] = useState<UserStatusChecks>({
    checks: [],
    completionPercentage: 0,
    completedCount: 0,
    totalCount: 0
  });

  // Définir les livrables premium (prioritaires et importants)
  const PREMIUM_DELIVERABLES = [
    'Vision/Mission',
    'Cible B2C',
    'Cible B2B',
    'Pitch',
    'Proposition de valeur',
    'Business Model'
  ];

  useEffect(() => {
    if (!projectId || deliverablesLoading || actionPlanLoading) {
      return;
    }

    // Vérifier si un plan d'action existe
    const hasActionPlan = !!actionPlanData.userResponses;

    // Vérifier combien de livrables premium ont été générés
    const premiumDeliverablesGenerated = PREMIUM_DELIVERABLES.filter(
      deliverable => deliverableNames.includes(deliverable)
    );

    // Vérifier si au moins un livrable a été généré
    const hasAnyDeliverable = deliverableNames.length > 0;

    // Vérifier si plus de 3 livrables premium ont été générés
    const hasMultiplePremiumDeliverables = premiumDeliverablesGenerated.length >= 3;

    // Vérifier si tous les livrables premium ont été générés
    const hasAllPremiumDeliverables = premiumDeliverablesGenerated.length === PREMIUM_DELIVERABLES.length;

    // Construire la liste des checks
    const checks: UserStatusCheck[] = [
      {
        id: 'action_plan',
        label: 'Plan d\'action créé',
        description: hasActionPlan
          ? 'Votre plan d\'action est prêt'
          : 'Créez un plan d\'action pour structurer votre démarche',
        isCompleted: hasActionPlan,
        icon: hasActionPlan ? '✓' : '○',
        priority: 1
      },
      {
        id: 'first_deliverable',
        label: 'Premier livrable généré',
        description: hasAnyDeliverable
          ? `${deliverableNames.length} livrable${deliverableNames.length > 1 ? 's' : ''} créé${deliverableNames.length > 1 ? 's' : ''}`
          : 'Générez votre premier livrable avec le chatbot',
        isCompleted: hasAnyDeliverable,
        icon: hasAnyDeliverable ? '✓' : '○',
        priority: 1
      },
      {
        id: 'premium_deliverables',
        label: 'Livrables essentiels',
        description: hasMultiplePremiumDeliverables
          ? `${premiumDeliverablesGenerated.length}/${PREMIUM_DELIVERABLES.length} livrables essentiels créés`
          : 'Créez au moins 3 livrables essentiels',
        isCompleted: hasMultiplePremiumDeliverables,
        icon: hasMultiplePremiumDeliverables ? '✓' : '○',
        priority: 2
      },
      {
        id: 'all_premium_deliverables',
        label: 'Tous les livrables essentiels',
        description: hasAllPremiumDeliverables
          ? 'Tous les livrables essentiels sont créés !'
          : `${premiumDeliverablesGenerated.length}/${PREMIUM_DELIVERABLES.length} livrables essentiels complétés`,
        isCompleted: hasAllPremiumDeliverables,
        icon: hasAllPremiumDeliverables ? '✓' : '○',
        priority: 3
      }
    ];

    // Calculer le pourcentage de complétion
    const completedCount = checks.filter(check => check.isCompleted).length;
    const totalCount = checks.length;
    const completionPercentage = Math.round((completedCount / totalCount) * 100);

    setStatusChecks({
      checks,
      completionPercentage,
      completedCount,
      totalCount
    });
  }, [projectId, deliverableNames, actionPlanData, deliverablesLoading, actionPlanLoading]);

  return {
    ...statusChecks,
    isLoading: deliverablesLoading || actionPlanLoading
  };
};
