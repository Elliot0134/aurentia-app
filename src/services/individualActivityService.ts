import { supabase } from '@/integrations/supabase/client';

export interface IndividualActivity {
  id: string;
  type: 'project_created' | 'project_updated' | 'deliverable_generated' | 'deliverable_completed' | 'task_status_changed' | 'milestone_completed' | 'chatbot_conversation' | 'resource_added' | 'collaborator_invited' | 'integration_connected' | 'credits_purchased' | 'action_plan_created';
  title: string;
  description: string;
  icon: string;
  entity_id?: string;
  entity_name?: string;
  created_at: string;
  metadata?: Record<string, any>;
}

/**
 * Récupère les activités récentes d'un utilisateur individuel
 * @param userId ID de l'utilisateur
 * @param limit Nombre d'activités à récupérer (défaut: 15)
 * @param offset Décalage pour la pagination (défaut: 0)
 * @returns Liste des activités récentes
 */
export const getRecentActivitiesForUser = async (
  userId: string,
  limit: number = 15,
  offset: number = 0
): Promise<IndividualActivity[]> => {
  const activities: IndividualActivity[] = [];

  console.log('getRecentActivitiesForUser called with:', { userId, limit, offset });

  if (!userId || userId === 'undefined' || userId === 'null') {
    console.warn('Invalid userId provided:', userId);
    return [];
  }

  try {
    const client = supabase as any;

    // 1. Projets créés
    const { data: projects } = await client
      .from('project_summary')
      .select('project_id, nom_projet, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (projects) {
      projects.forEach((project: any) => {
        activities.push({
          id: `project_${project.project_id}`,
          type: 'project_created',
          title: 'Nouveau projet créé',
          description: `Vous avez créé le projet "${project.nom_projet}"`,
          icon: '🚀',
          entity_id: project.project_id,
          entity_name: project.nom_projet,
          created_at: project.created_at
        });
      });
    }

    // 2. Projets mis à jour récemment
    const { data: updatedProjects } = await client
      .from('project_summary')
      .select('project_id, nom_projet, updated_at')
      .eq('user_id', userId)
      .neq('updated_at', null)
      .order('updated_at', { ascending: false })
      .limit(5);

    if (updatedProjects) {
      updatedProjects.forEach((project: any) => {
        activities.push({
          id: `project_updated_${project.project_id}`,
          type: 'project_updated',
          title: 'Projet mis à jour',
          description: `Vous avez mis à jour le projet "${project.nom_projet}"`,
          icon: '📈',
          entity_id: project.project_id,
          entity_name: project.nom_projet,
          created_at: project.updated_at
        });
      });
    }

    // 3. Plans d'action créés
    const { data: actionPlans } = await client
      .rpc('get_action_plan_user_responses_by_user', { user_uuid: userId });

    if (actionPlans && actionPlans.length > 0) {
      // Récupérer les noms des projets
      const projectIds = actionPlans.map((ap: any) => ap.project_id).filter(Boolean);
      const { data: projectNames } = await client
        .from('project_summary')
        .select('project_id, nom_projet')
        .in('project_id', projectIds);

      const projectNameMap = projectNames?.reduce((acc: any, p: any) => {
        acc[p.project_id] = p.nom_projet;
        return acc;
      }, {}) || {};

      actionPlans.forEach((plan: any) => {
        activities.push({
          id: `action_plan_${plan.project_id}`,
          type: 'action_plan_created',
          title: 'Plan d\'action créé',
          description: `Vous avez généré un plan d'action pour "${projectNameMap[plan.project_id] || 'votre projet'}"`,
          icon: '🎯',
          entity_id: plan.project_id,
          entity_name: projectNameMap[plan.project_id],
          created_at: plan.created_at
        });
      });
    }

    // 4. Tâches du plan d'action avec changement de statut récent
    const { data: tasks } = await client
      .rpc('get_action_plan_taches_by_user', { user_uuid: userId });

    if (tasks && tasks.length > 0) {
      // Filtrer les tâches terminées ou en cours récemment (basé sur updated_at)
      const recentTasks = tasks
        .filter((t: any) => t.statut !== 'À faire')
        .sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, 10);

      // Récupérer les noms des projets
      const taskProjectIds = recentTasks.map((t: any) => t.project_id).filter(Boolean);
      const { data: taskProjectNames } = await client
        .from('project_summary')
        .select('project_id, nom_projet')
        .in('project_id', taskProjectIds);

      const taskProjectNameMap = taskProjectNames?.reduce((acc: any, p: any) => {
        acc[p.project_id] = p.nom_projet;
        return acc;
      }, {}) || {};

      recentTasks.forEach((task: any) => {
        const statusText = task.statut === 'Terminé' ? 'terminée' : 'en cours';
        activities.push({
          id: `task_${task.id}`,
          type: 'task_status_changed',
          title: `Tâche ${statusText}`,
          description: `"${task.nom_tache}" marquée ${statusText}${taskProjectNameMap[task.project_id] ? ` dans ${taskProjectNameMap[task.project_id]}` : ''}`,
          icon: task.statut === 'Terminé' ? '✅' : '⚡',
          entity_id: task.id,
          entity_name: task.nom_tache,
          created_at: task.updated_at,
          metadata: {
            status: task.statut,
            project_id: task.project_id
          }
        });
      });
    }

    // 5. Jalons (milestones) terminés
    const { data: milestones } = await client
      .rpc('get_action_plan_jalons_by_user', { user_uuid: userId });

    if (milestones && milestones.length > 0) {
      const completedMilestones = milestones
        .filter((j: any) => j.statut === 'Terminé')
        .sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, 5);

      // Récupérer les noms des projets
      const milestoneProjectIds = completedMilestones.map((m: any) => m.project_id).filter(Boolean);
      const { data: milestoneProjectNames } = await client
        .from('project_summary')
        .select('project_id, nom_projet')
        .in('project_id', milestoneProjectIds);

      const milestoneProjectNameMap = milestoneProjectNames?.reduce((acc: any, p: any) => {
        acc[p.project_id] = p.nom_projet;
        return acc;
      }, {}) || {};

      completedMilestones.forEach((milestone: any) => {
        activities.push({
          id: `milestone_${milestone.id}`,
          type: 'milestone_completed',
          title: 'Jalon complété',
          description: `🎉 "${milestone.jalon_nom}" complété${milestoneProjectNameMap[milestone.project_id] ? ` dans ${milestoneProjectNameMap[milestone.project_id]}` : ''}`,
          icon: '🎯',
          entity_id: milestone.id,
          entity_name: milestone.jalon_nom,
          created_at: milestone.updated_at,
          metadata: {
            criticite: milestone.criticite,
            project_id: milestone.project_id
          }
        });
      });
    }

    // 6. Conversations chatbot créées (si on a une table pour ça)
    const { data: conversations } = await client
      .from('chatbot_conversations')
      .select('id, title, created_at, project_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (conversations) {
      conversations.forEach((conv: any) => {
        activities.push({
          id: `chatbot_${conv.id}`,
          type: 'chatbot_conversation',
          title: 'Nouvelle conversation chatbot',
          description: `Conversation "${conv.title || 'Sans titre'}" démarrée`,
          icon: '💬',
          entity_id: conv.id,
          entity_name: conv.title,
          created_at: conv.created_at,
          metadata: { project_id: conv.project_id }
        });
      });
    }

    // 7. Ressources ajoutées à la base de connaissances
    const { data: resources } = await client
      .from('knowledge_base_items')
      .select('id, title, type, created_at, project_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (resources) {
      resources.forEach((resource: any) => {
        const typeText = resource.type === 'url' ? '🔗 URL' : resource.type === 'file' ? '📄 Fichier' : '📝 Note';
        activities.push({
          id: `resource_${resource.id}`,
          type: 'resource_added',
          title: 'Ressource ajoutée',
          description: `${typeText}: "${resource.title}"`,
          icon: '📚',
          entity_id: resource.id,
          entity_name: resource.title,
          created_at: resource.created_at,
          metadata: {
            type: resource.type,
            project_id: resource.project_id
          }
        });
      });
    }

    // 8. Collaborateurs invités
    const { data: collaborators } = await client
      .from('project_collaborators')
      .select(`
        id,
        created_at,
        email,
        role,
        project_id,
        project_summary!project_collaborators_project_id_fkey (
          nom_projet
        )
      `)
      .eq('inviter_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (collaborators) {
      collaborators.forEach((collab: any) => {
        activities.push({
          id: `collaborator_${collab.id}`,
          type: 'collaborator_invited',
          title: 'Collaborateur invité',
          description: `Invitation envoyée à ${collab.email} pour "${collab.project_summary?.nom_projet || 'votre projet'}"`,
          icon: '👥',
          entity_id: collab.id,
          entity_name: collab.email,
          created_at: collab.created_at,
          metadata: {
            role: collab.role,
            project_id: collab.project_id
          }
        });
      });
    }

    // 9. Achats de crédits
    const { data: creditPurchases } = await client
      .from('credit_transactions')
      .select('id, amount, type, created_at')
      .eq('user_id', userId)
      .eq('type', 'purchase')
      .order('created_at', { ascending: false })
      .limit(3);

    if (creditPurchases) {
      creditPurchases.forEach((purchase: any) => {
        activities.push({
          id: `credits_${purchase.id}`,
          type: 'credits_purchased',
          title: 'Crédits achetés',
          description: `Achat de ${purchase.amount} crédits`,
          icon: '💳',
          entity_id: purchase.id,
          created_at: purchase.created_at,
          metadata: { amount: purchase.amount }
        });
      });
    }

    // Trier toutes les activités par date (plus récent d'abord)
    activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Appliquer la pagination
    const result = activities.slice(offset, offset + limit);

    console.log('getRecentActivitiesForUser returning:', {
      totalActivities: activities.length,
      returned: result.length
    });

    return result;

  } catch (error) {
    console.error('Erreur lors de la récupération des activités de l\'utilisateur:', error);
    return [];
  }
};

/**
 * Récupère le nombre total d'activités pour un utilisateur
 * @param userId ID de l'utilisateur
 * @returns Nombre total d'activités
 */
export const getTotalActivitiesCountForUser = async (userId: string): Promise<number> => {
  try {
    const client = supabase as any;

    const countPromises = [
      client.from('project_summary').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      client.from('chatbot_conversations').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      client.from('knowledge_base_items').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      client.from('project_collaborators').select('*', { count: 'exact', head: true }).eq('inviter_id', userId),
      client.from('credit_transactions').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('type', 'purchase')
    ];

    const results = await Promise.all(countPromises);

    const [
      { count: projectsCount },
      { count: conversationsCount },
      { count: resourcesCount },
      { count: collaboratorsCount },
      { count: creditsCount }
    ] = results;

    // Estimation: projets * 2 (création + mise à jour) + autres activités
    return (projectsCount || 0) * 2 +
           (conversationsCount || 0) +
           (resourcesCount || 0) +
           (collaboratorsCount || 0) +
           (creditsCount || 0) +
           10; // Approximation pour tâches/jalons

  } catch (error) {
    console.error('Erreur lors du comptage des activités:', error);
    return 0;
  }
};
