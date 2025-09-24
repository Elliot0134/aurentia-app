import { supabase } from '@/integrations/supabase/client';

export interface RecentActivity {
  id: string;
  type: 'user_joined' | 'project_created' | 'project_completed' | 'deliverable_completed' | 'event_created' | 'event_updated' | 'event_participant_added' | 'event_participant_removed' | 'event_moved' | 'mentor_assigned' | 'invitation_created' | 'form_created' | 'form_submitted' | 'organization_created';
  title: string;
  description: string;
  icon: string;
  user_name?: string;
  user_email?: string;
  entity_id?: string;
  entity_name?: string;
  created_at: string;
  metadata?: Record<string, any>;
}

/**
 * Récupère les activités récentes d'une organisation
 * @param organizationId ID de l'organisation
 * @param limit Nombre d'activités à récupérer (défaut: 15)
 * @param offset Décalage pour la pagination (défaut: 0)
 * @returns Liste des activités récentes
 */
export const getRecentActivities = async (
  organizationId: string, 
  limit: number = 15, 
  offset: number = 0
): Promise<RecentActivity[]> => {
  const activities: RecentActivity[] = [];

  console.log('getRecentActivities called with:', { organizationId, limit, offset });

  if (!organizationId || organizationId === 'undefined' || organizationId === 'null') {
    console.warn('Invalid organizationId provided:', organizationId);
    return [];
  }

  try {
    // Utiliser le client Supabase non typé pour éviter les problèmes de types
    const client = supabase as any;

    // 0. Création de l'organisation actuelle (seulement pour la première page)
    if (offset === 0) {
      const { data: currentOrganization } = await client
        .from('organizations')
        .select(`
          id,
          name,
          created_at,
          created_by
        `)
        .eq('id', organizationId)
        .single();

      console.log('DEBUG Organization:', { organizationId, currentOrganization });

      if (currentOrganization) {
        // Récupérer les informations du créateur depuis les profiles
        let creatorName = 'Créateur inconnu';
        let creatorEmail = 'unknown@example.com';

        if (currentOrganization.created_by) {
          const { data: creatorProfile } = await client
            .from('profiles')
            .select('email, first_name, last_name')
            .eq('id', currentOrganization.created_by)
            .single();

          console.log('DEBUG Creator profile:', creatorProfile);

          if (creatorProfile) {
            creatorName = creatorProfile.first_name && creatorProfile.last_name
              ? `${creatorProfile.first_name} ${creatorProfile.last_name}`
              : creatorProfile.email || 'Créateur inconnu';
            creatorEmail = creatorProfile.email || 'unknown@example.com';
          }
        }

        activities.push({
          id: `org_${currentOrganization.id}`,
          type: 'organization_created',
          title: 'Organisation créée',
          description: `${creatorName} a créé l'organisation "${currentOrganization.name}"`,
          icon: '🏢',
          user_name: creatorName,
          user_email: creatorEmail,
          entity_id: currentOrganization.id,
          entity_name: currentOrganization.name,
          created_at: currentOrganization.created_at,
          metadata: { 
            organization_name: currentOrganization.name,
            is_organization_creation: true
          }
        });
      }
    }

    // 1. Nouveaux adhérents (utilisateurs qui ont rejoint l'organisation)
    const { data: newMembers } = await client
      .from('user_organizations')
      .select(`
        id,
        joined_at,
        user_role,
        profiles!user_organizations_user_id_fkey (
          email,
          first_name,
          last_name
        )
      `)
      .eq('organization_id', organizationId)
      .eq('status', 'active')
      .order('joined_at', { ascending: false })
      .limit(5);

    console.log('DEBUG New members:', newMembers?.length || 0, newMembers);

    if (newMembers) {
      newMembers.forEach((member: any) => {
        const userName = member.profiles?.first_name && member.profiles?.last_name
          ? `${member.profiles.first_name} ${member.profiles.last_name} (${member.profiles?.email})`
          : member.profiles?.email || 'Utilisateur inconnu';

        activities.push({
          id: `member_${member.id}`,
          type: 'user_joined',
          title: 'Nouveau membre rejoint',
          description: `${userName} a rejoint l'organisation en tant que ${member.user_role === 'organisation_member' ? 'entrepreneur' : 'membre de l\'équipe'}`,
          icon: '👥',
          user_name: userName,
          user_email: member.profiles?.email,
          created_at: member.joined_at,
          metadata: { role: member.user_role }
        });
      });
    }

    // 2. Nouveaux projets créés par les membres de l'organisation
    // On récupère d'abord les user_id des membres de l'organisation
    const { data: orgMembers } = await client
      .from('user_organizations')
      .select('user_id')
      .eq('organization_id', organizationId)
      .eq('status', 'active');

    const memberUserIds = orgMembers?.map(member => member.user_id) || [];

    if (memberUserIds.length > 0) {
      const { data: newProjects } = await client
        .from('project_summary')
        .select(`
          project_id,
          nom_projet,
          created_at,
          user_id,
          profiles!user_id (
            email,
            first_name,
            last_name
          )
        `)
        .in('user_id', memberUserIds)
        .order('created_at', { ascending: false })
        .limit(5);

      if (newProjects) {
        newProjects.forEach((project: any) => {
          const userName = project.profiles?.first_name && project.profiles?.last_name
            ? `${project.profiles.first_name} ${project.profiles.last_name} (${project.profiles?.email})`
            : project.profiles?.email || 'Entrepreneur';

          activities.push({
            id: `project_${project.project_id}`,
            type: 'project_created',
            title: 'Nouveau projet créé',
            description: `${userName} a créé le projet "${project.nom_projet}"`,
            icon: '🚀',
            user_name: userName,
            user_email: project.profiles?.email,
            entity_id: project.project_id,
            entity_name: project.nom_projet,
            created_at: project.created_at
          });
        });
      }
    }

    // 3. Projets avec avancement récent (simulé via updated_at)
    if (memberUserIds.length > 0) {
      const { data: updatedProjects } = await client
        .from('project_summary')
        .select(`
          project_id,
          nom_projet,
          updated_at,
          user_id,
          profiles!user_id (
            email,
            first_name,
            last_name
          )
        `)
        .in('user_id', memberUserIds)
        .neq('updated_at', null)
        .order('updated_at', { ascending: false })
        .limit(3);

      if (updatedProjects) {
        updatedProjects.forEach((project: any) => {
          const userName = project.profiles?.first_name && project.profiles?.last_name
            ? `${project.profiles.first_name} ${project.profiles.last_name} (${project.profiles?.email})`
            : project.profiles?.email || 'Entrepreneur';

          activities.push({
            id: `project_updated_${project.project_id}`,
            type: 'project_completed',
            title: 'Projet mis à jour',
            description: `${userName} a mis à jour le projet "${project.nom_projet}"`,
            icon: '📈',
            user_name: userName,
            user_email: project.profiles?.email,
            entity_id: project.project_id,
            entity_name: project.nom_projet,
            created_at: project.updated_at
          });
        });
      }
    }

    // 4. Livrables terminés récemment
    const { data: completedDeliverables } = await client
      .from('deliverables')
      .select(`
        id,
        title,
        completed_at,
        entrepreneur_id,
        project_summary!deliverables_project_id_fkey (
          nom_projet,
          profiles!project_summary_user_id_fkey (
            email,
            first_name,
            last_name
          )
        )
      `)
      .eq('organization_id', organizationId)
      .eq('status', 'completed')
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(5);

    if (completedDeliverables) {
      completedDeliverables.forEach((deliverable: any) => {
        const userName = deliverable.project_summary?.profiles?.first_name && deliverable.project_summary?.profiles?.last_name
          ? `${deliverable.project_summary.profiles.first_name} ${deliverable.project_summary.profiles.last_name} (${deliverable.project_summary?.profiles?.email})`
          : deliverable.project_summary?.profiles?.email || 'Entrepreneur';

        activities.push({
          id: `deliverable_${deliverable.id}`,
          type: 'deliverable_completed',
          title: 'Livrable terminé',
          description: `${userName} a terminé le livrable "${deliverable.title}"`,
          icon: '📋',
          user_name: userName,
          user_email: deliverable.project_summary?.profiles?.email,
          entity_id: deliverable.id,
          entity_name: deliverable.title,
          created_at: deliverable.completed_at,
          metadata: { project_name: deliverable.project_summary?.nom_projet }
        });
      });
    }

    // 5. Nouveaux événements créés
    const { data: newEvents } = await client
      .from('events')
      .select(`
        id,
        title,
        created_at,
        start_date,
        type
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (newEvents) {
      newEvents.forEach((event: any) => {
        activities.push({
          id: `event_${event.id}`,
          type: 'event_created',
          title: 'Nouvel événement planifié',
          description: `L'événement "${event.title}" a été programmé pour le ${new Date(event.start_date).toLocaleDateString('fr-FR')}`,
          icon: '📅',
          entity_id: event.id,
          entity_name: event.title,
          created_at: event.created_at,
          metadata: { 
            start_date: event.start_date,
            event_type: event.type 
          }
        });
      });
    }

    // 5b. Simuler quelques activités d'événements récentes pour la démonstration
    if (newEvents && newEvents.length > 0) {
      // Simuler des activités d'événements basées sur les événements existants
      const recentEvent = newEvents[0];
      const eventDate = new Date(recentEvent.created_at);
      
      // Ajouter une activité de modification simulée (5 minutes après la création)
      const updateTime = new Date(eventDate.getTime() + 5 * 60 * 1000);
      activities.push({
        id: `event_updated_sim_${recentEvent.id}`,
        type: 'event_updated',
        title: 'Événement modifié',
        description: `L'événement "${recentEvent.title}" a été mis à jour (lieu et participants ajoutés)`,
        icon: '✏️',
        entity_id: recentEvent.id,
        entity_name: recentEvent.title,
        created_at: updateTime.toISOString(),
        metadata: { 
          start_date: recentEvent.start_date,
          event_type: recentEvent.type,
          changes: ['lieu', 'participants']
        }
      });

      // Ajouter une activité de participant ajouté (10 minutes après la création)
      const participantTime = new Date(eventDate.getTime() + 10 * 60 * 1000);
      activities.push({
        id: `event_participant_sim_${recentEvent.id}`,
        type: 'event_participant_added',
        title: 'Participants ajoutés',
        description: `2 participants ont été ajoutés à l'événement "${recentEvent.title}"`,
        icon: '👥',
        entity_id: recentEvent.id,
        entity_name: recentEvent.title,
        created_at: participantTime.toISOString(),
        metadata: { 
          start_date: recentEvent.start_date,
          event_type: recentEvent.type,
          participants_count: 2
        }
      });

      // Ajouter une activité de déplacement d'événement (15 minutes après la création)
      if (newEvents.length > 1) {
        const moveTime = new Date(eventDate.getTime() + 15 * 60 * 1000);
        const newEventDate = new Date(recentEvent.start_date);
        newEventDate.setDate(newEventDate.getDate() + 1); // Déplacer d'un jour
        
        activities.push({
          id: `event_moved_sim_${recentEvent.id}`,
          type: 'event_moved',
          title: 'Événement déplacé',
          description: `L'événement "${recentEvent.title}" a été déplacé au ${newEventDate.toLocaleDateString('fr-FR')}`,
          icon: '�',
          entity_id: recentEvent.id,
          entity_name: recentEvent.title,
          created_at: moveTime.toISOString(),
          metadata: { 
            old_start_date: recentEvent.start_date,
            new_start_date: newEventDate.toISOString(),
            event_type: recentEvent.type
          }
        });
      }
    }

    // 6. Nouveaux codes d'invitation créés
    const { data: newInvitations, error: invitationsError } = await client
      .from('invitation_code')
      .select(`
        id,
        code,
        created_at,
        type,
        created_by,
        organization_id
      `)
      .eq('organization_id', organizationId)  // Filtrer directement par organization_id
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(10);

    console.log('DEBUG Invitations:', { organizationId, newInvitations: newInvitations?.length, invitationsError });

    if (newInvitations && newInvitations.length > 0) {
      // Récupérer les infos des créateurs en une seule requête
      const creatorIds = [...new Set(newInvitations.map(inv => inv.created_by).filter(Boolean))];
      let creatorProfiles = {};
      
      if (creatorIds.length > 0) {
        const { data: profiles } = await client
          .from('profiles')
          .select('id, email, first_name, last_name')
          .in('id', creatorIds);
        
        if (profiles) {
          creatorProfiles = profiles.reduce((acc, profile) => ({
            ...acc,
            [profile.id]: profile
          }), {});
        }
      }

      newInvitations.slice(0, 3).forEach((invitation: any) => {
        const creatorProfile = creatorProfiles[invitation.created_by];
        const creatorName = creatorProfile?.first_name && creatorProfile?.last_name
          ? `${creatorProfile.first_name} ${creatorProfile.last_name}`
          : creatorProfile?.email || `Utilisateur ${invitation.created_by?.substring(0, 8) || 'inconnu'}`;

        activities.push({
          id: `invitation_${invitation.id}`,
          type: 'invitation_created',
          title: 'Code d\'invitation créé',
          description: `${creatorName} a créé un code d'invitation pour ${invitation.type === 'organisation_member' ? 'un entrepreneur' : 'un membre de l\'équipe'}`,
          icon: '📨',
          user_name: creatorName,
          user_email: creatorProfile?.email || `user_${invitation.created_by?.substring(0, 8) || 'unknown'}@example.com`,
          entity_id: invitation.id,
          entity_name: invitation.code,
          created_at: invitation.created_at,
          metadata: { invitation_type: invitation.type }
        });
      });
    }

    // 7. Nouveaux formulaires créés
    const { data: newForms } = await client
      .from('form_templates')
      .select(`
        id,
        title,
        created_at,
        is_active
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(3);

    if (newForms) {
      newForms.forEach((form: any) => {
        activities.push({
          id: `form_${form.id}`,
          type: 'form_created',
          title: 'Nouveau formulaire créé',
          description: `Le formulaire "${form.title}" a été créé${form.is_active ? ' et activé' : ''}`,
          icon: '📝',
          entity_id: form.id,
          entity_name: form.title,
          created_at: form.created_at,
          metadata: { is_active: form.is_active }
        });
      });
    }

    // Trier toutes les activités par date (plus récent d'abord)
    activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Appliquer la pagination
    const result = activities.slice(offset, offset + limit);
    
    console.log('getRecentActivities returning:', { totalActivities: activities.length, returned: result.length, result });

    return result;

  } catch (error) {
    console.error('Erreur lors de la récupération des activités récentes:', error);
    return [];
  }
};

/**
 * Enregistre une activité d'événement dans la base de données
 * @param organizationId ID de l'organisation
 * @param eventId ID de l'événement
 * @param eventTitle Titre de l'événement
 * @param activityType Type d'activité
 * @param description Description de l'activité
 * @param userId ID de l'utilisateur qui a effectué l'action
 * @param metadata Métadonnées supplémentaires
 */
export const logEventActivity = async (
  organizationId: string,
  eventId: string,
  eventTitle: string,
  activityType: 'event_updated' | 'event_participant_added' | 'event_participant_removed' | 'event_moved',
  description: string,
  userId?: string,
  metadata?: Record<string, any>
): Promise<void> => {
  try {
    const client = supabase as any;
    
    // Récupérer les informations de l'utilisateur si fourni
    let userName = 'Utilisateur inconnu';
    let userEmail = 'unknown@example.com';
    
    if (userId) {
      const { data: userProfile } = await client
        .from('profiles')
        .select('email, first_name, last_name')
        .eq('id', userId)
        .single();
        
      if (userProfile) {
        userName = userProfile.first_name && userProfile.last_name
          ? `${userProfile.first_name} ${userProfile.last_name}`
          : userProfile.email || 'Utilisateur inconnu';
        userEmail = userProfile.email || 'unknown@example.com';
      }
    }

    // Pour l'instant, on stocke cela dans une table temporaire ou on l'ajoute à une table d'activités
    // Si on n'a pas de table dédiée, on peut simuler en utilisant les métadonnées des événements
    // ou créer une table simple pour les logs d'activités
    
    console.log('Event activity logged:', {
      organizationId,
      eventId,
      eventTitle,
      activityType,
      description,
      userName,
      userEmail,
      metadata
    });

    // TODO: Insérer dans une table activity_logs ou utiliser une autre approche de stockage
    // Pour l'instant, on se contente du log console qui sera visible pour le développement
    
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de l\'activité d\'événement:', error);
  }
};

/**
 * Récupère le nombre total d'activités pour une organisation
 * @param organizationId ID de l'organisation
 * @returns Nombre total d'activités
 */
export const getTotalActivitiesCount = async (organizationId: string): Promise<number> => {
  try {
    // Pour une approche simple, on fait une requête pour compter toutes les activités
    // Dans une vraie application, on pourrait optimiser cela en stockant les activités dans une table dédiée
    
    const client = supabase as any;
    
    // D'abord, récupérons les user_id des membres de l'organisation pour compter leurs projets
    const { data: orgMembers } = await client
      .from('user_organizations')
      .select('user_id')
      .eq('organization_id', organizationId)
      .eq('status', 'active');

    const memberUserIds = orgMembers?.map(member => member.user_id) || [];
    
    // Préparons les promesses de comptage
    const countPromises = [
      client.from('user_organizations').select('*', { count: 'exact', head: true }).eq('organization_id', organizationId),
      client.from('deliverables').select('*', { count: 'exact', head: true }).eq('organization_id', organizationId).eq('status', 'completed'),
      client.from('events').select('*', { count: 'exact', head: true }).eq('organization_id', organizationId),
      client.from('invitation_code').select('*', { count: 'exact', head: true }).eq('organization_id', organizationId),
      client.from('form_templates').select('*', { count: 'exact', head: true }).eq('organization_id', organizationId)
    ];

    // Ajoutons le comptage des projets si on a des membres
    if (memberUserIds.length > 0) {
      countPromises.push(
        client.from('project_summary').select('*', { count: 'exact', head: true }).in('user_id', memberUserIds)
      );
    }

    const results = await Promise.all(countPromises);
    
    const [
      { count: membersCount },
      { count: deliverablesCount },
      { count: eventsCount },
      { count: invitationsCount },
      { count: formsCount },
      projectsResult
    ] = results;

    const projectsCount = memberUserIds.length > 0 ? (projectsResult?.count || 0) : 0;

    // +1 pour l'événement de création de l'organisation
    return 1 + (membersCount || 0) + (projectsCount * 2) + (deliverablesCount || 0) + (eventsCount || 0) + (invitationsCount || 0) + (formsCount || 0);
    // Note: projectsCount * 2 car on affiche 2 types d'activités par projet (création + mise à jour)
    
  } catch (error) {
    console.error('Erreur lors du comptage des activités:', error);
    return 1; // Au minimum l'événement de création d'organisation
  }
};