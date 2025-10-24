/**
 * Microsoft Teams Message Formatter
 * Formats Aurentia events into Teams Adaptive Cards
 */

import type { IntegrationEvent } from '@/types/integrationTypes';
import type { TeamsAdaptiveCard, Fact } from './teamsTypes';
import { TEAMS_COLORS } from './teamsTypes';

class TeamsFormatter {
  /**
   * Get app URL for links
   */
  private getAppUrl(): string {
    return import.meta.env.VITE_APP_URL || window.location.origin;
  }

  /**
   * Create base adaptive card structure
   */
  private createBaseCard(themeColor: string = TEAMS_COLORS.PRIMARY): TeamsAdaptiveCard {
    return {
      type: 'message',
      attachments: [
        {
          contentType: 'application/vnd.microsoft.card.adaptive',
          content: {
            $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
            type: 'AdaptiveCard',
            version: '1.4',
            body: [],
            msteams: {
              width: 'Full',
            },
          },
        },
      ],
    };
  }

  /**
   * Format an integration event into a Teams message
   */
  formatEvent(event: IntegrationEvent): TeamsAdaptiveCard {
    switch (event.type) {
      case 'project.created':
        return this.formatProjectCreated(event);
      case 'project.updated':
        return this.formatProjectUpdated(event);
      case 'deliverable.submitted':
        return this.formatDeliverableSubmitted(event);
      case 'deliverable.reviewed':
        return this.formatDeliverableReviewed(event);
      case 'comment.added':
        return this.formatCommentAdded(event);
      case 'member.joined':
        return this.formatMemberJoined(event);
      case 'event.created':
        return this.formatEventCreated(event);
      default:
        return this.formatGeneric(event);
    }
  }

  /**
   * Format: Project Created
   */
  private formatProjectCreated(event: IntegrationEvent): TeamsAdaptiveCard {
    const { data } = event;
    const card = this.createBaseCard(TEAMS_COLORS.SUCCESS);

    const facts: Fact[] = [
      { title: 'Projet', value: data.name || 'Sans nom' },
      { title: 'Créé par', value: data.creator_name || 'Utilisateur' },
      { title: 'Statut', value: data.status || 'Actif' },
      { title: 'Date', value: new Date(data.created_at || Date.now()).toLocaleDateString('fr-FR') },
    ];

    card.attachments[0].content.body = [
      {
        type: 'TextBlock',
        text: '🎉 Nouveau Projet Créé',
        size: 'Large',
        weight: 'Bolder',
        color: 'Good',
      },
      {
        type: 'FactSet',
        facts,
        spacing: 'Medium',
      },
    ];

    if (data.description) {
      card.attachments[0].content.body.push({
        type: 'TextBlock',
        text: data.description,
        wrap: true,
        spacing: 'Medium',
      });
    }

    if (data.id) {
      card.attachments[0].content.actions = [
        {
          type: 'Action.OpenUrl',
          title: 'Voir le projet',
          url: `${this.getAppUrl()}/project/${data.id}`,
        },
      ];
    }

    return card;
  }

  /**
   * Format: Project Updated
   */
  private formatProjectUpdated(event: IntegrationEvent): TeamsAdaptiveCard {
    const { data } = event;
    const card = this.createBaseCard(TEAMS_COLORS.INFO);

    card.attachments[0].content.body = [
      {
        type: 'TextBlock',
        text: '📝 Projet Mis à Jour',
        size: 'Large',
        weight: 'Bolder',
        color: 'Accent',
      },
      {
        type: 'TextBlock',
        text: `**${data.name}** a été modifié`,
        wrap: true,
        spacing: 'Medium',
      },
    ];

    if (data.id) {
      card.attachments[0].content.actions = [
        {
          type: 'Action.OpenUrl',
          title: 'Voir les changements',
          url: `${this.getAppUrl()}/project/${data.id}`,
        },
      ];
    }

    return card;
  }

  /**
   * Format: Deliverable Submitted
   */
  private formatDeliverableSubmitted(event: IntegrationEvent): TeamsAdaptiveCard {
    const { data } = event;
    const card = this.createBaseCard(TEAMS_COLORS.AURENTIA_PINK);

    const facts: Fact[] = [
      { title: 'Livrable', value: data.name || data.type },
      { title: 'Type', value: data.type },
      { title: 'Projet', value: data.project_name || 'N/A' },
      { title: 'Soumis par', value: data.submitter_name || 'Entrepreneur' },
    ];

    card.attachments[0].content.body = [
      {
        type: 'TextBlock',
        text: '📝 Nouveau Livrable Soumis',
        size: 'Large',
        weight: 'Bolder',
        color: 'Attention',
      },
      {
        type: 'FactSet',
        facts,
        spacing: 'Medium',
      },
      {
        type: 'TextBlock',
        text: '⏰ **En attente de révision**',
        wrap: true,
        spacing: 'Medium',
        color: 'Attention',
      },
    ];

    if (data.id) {
      card.attachments[0].content.actions = [
        {
          type: 'Action.OpenUrl',
          title: 'Réviser le livrable',
          url: `${this.getAppUrl()}/deliverables/${data.id}`,
        },
      ];
    }

    return card;
  }

  /**
   * Format: Deliverable Reviewed
   */
  private formatDeliverableReviewed(event: IntegrationEvent): TeamsAdaptiveCard {
    const { data } = event;
    const approved = data.status === 'approved' || data.approved;
    const card = this.createBaseCard(approved ? TEAMS_COLORS.SUCCESS : TEAMS_COLORS.INFO);

    card.attachments[0].content.body = [
      {
        type: 'TextBlock',
        text: approved ? '✅ Livrable Approuvé' : '📝 Livrable Évalué',
        size: 'Large',
        weight: 'Bolder',
        color: approved ? 'Good' : 'Accent',
      },
      {
        type: 'TextBlock',
        text: `**${data.name}** a été ${approved ? 'approuvé' : 'évalué'} par ${data.reviewer_name || 'un mentor'}`,
        wrap: true,
        spacing: 'Medium',
      },
    ];

    if (data.id) {
      card.attachments[0].content.actions = [
        {
          type: 'Action.OpenUrl',
          title: 'Voir les détails',
          url: `${this.getAppUrl()}/deliverables/${data.id}`,
        },
      ];
    }

    return card;
  }

  /**
   * Format: Comment Added
   */
  private formatCommentAdded(event: IntegrationEvent): TeamsAdaptiveCard {
    const { data } = event;
    const card = this.createBaseCard(TEAMS_COLORS.INFO);

    const commentPreview = data.comment_text?.substring(0, 200);
    const truncated = data.comment_text?.length > 200;

    card.attachments[0].content.body = [
      {
        type: 'TextBlock',
        text: '💬 Nouveau Commentaire',
        size: 'Large',
        weight: 'Bolder',
        color: 'Accent',
      },
      {
        type: 'TextBlock',
        text: `${data.author_name} a ajouté un commentaire sur **${data.deliverable_name}**`,
        wrap: true,
        spacing: 'Medium',
      },
      {
        type: 'Container',
        items: [
          {
            type: 'TextBlock',
            text: `"${commentPreview}${truncated ? '...' : ''}"`,
            wrap: true,
            color: 'Default',
          },
        ],
        style: 'Emphasis',
        spacing: 'Medium',
      },
    ];

    if (data.deliverable_id) {
      card.attachments[0].content.actions = [
        {
          type: 'Action.OpenUrl',
          title: 'Voir le commentaire',
          url: `${this.getAppUrl()}/deliverables/${data.deliverable_id}`,
        },
      ];
    }

    return card;
  }

  /**
   * Format: Member Joined
   */
  private formatMemberJoined(event: IntegrationEvent): TeamsAdaptiveCard {
    const { data } = event;
    const card = this.createBaseCard(TEAMS_COLORS.SUCCESS);

    card.attachments[0].content.body = [
      {
        type: 'TextBlock',
        text: '👋 Nouveau Membre',
        size: 'Large',
        weight: 'Bolder',
        color: 'Good',
      },
      {
        type: 'TextBlock',
        text: `**${data.name}** vient de rejoindre **${data.organisation_name}** en tant que ${data.role || 'membre'}!`,
        wrap: true,
        spacing: 'Medium',
      },
    ];

    return card;
  }

  /**
   * Format: Event Created
   */
  private formatEventCreated(event: IntegrationEvent): TeamsAdaptiveCard {
    const { data } = event;
    const card = this.createBaseCard(TEAMS_COLORS.AURENTIA_ORANGE);

    const startDate = data.start_date ? new Date(data.start_date).toLocaleDateString('fr-FR') : 'Date non définie';
    const startTime = data.start_time || '';

    const facts: Fact[] = [
      { title: 'Titre', value: data.title },
      { title: 'Date', value: `${startDate} ${startTime}` },
      { title: 'Lieu', value: data.location || 'Non spécifié' },
      { title: 'Type', value: data.type || 'Événement' },
    ];

    card.attachments[0].content.body = [
      {
        type: 'TextBlock',
        text: '📅 Nouvel Événement',
        size: 'Large',
        weight: 'Bolder',
        color: 'Attention',
      },
      {
        type: 'FactSet',
        facts,
        spacing: 'Medium',
      },
    ];

    if (data.description) {
      card.attachments[0].content.body.push({
        type: 'TextBlock',
        text: data.description,
        wrap: true,
        spacing: 'Medium',
      });
    }

    card.attachments[0].content.actions = [
      {
        type: 'Action.OpenUrl',
        title: "Voir l'événement",
        url: `${this.getAppUrl()}/events`,
      },
    ];

    return card;
  }

  /**
   * Format: Generic Event (fallback)
   */
  private formatGeneric(event: IntegrationEvent): TeamsAdaptiveCard {
    const card = this.createBaseCard(TEAMS_COLORS.INFO);

    card.attachments[0].content.body = [
      {
        type: 'TextBlock',
        text: 'Événement Aurentia',
        size: 'Large',
        weight: 'Bolder',
      },
      {
        type: 'TextBlock',
        text: `**Type:** ${event.type}`,
        wrap: true,
        spacing: 'Medium',
      },
      {
        type: 'TextBlock',
        text: `\`\`\`\n${JSON.stringify(event.data, null, 2).substring(0, 500)}\n\`\`\``,
        wrap: true,
        spacing: 'Medium',
      },
    ];

    return card;
  }

  /**
   * Create a test message for connection testing
   */
  createTestMessage(): TeamsAdaptiveCard {
    const card = this.createBaseCard(TEAMS_COLORS.SUCCESS);

    card.attachments[0].content.body = [
      {
        type: 'TextBlock',
        text: '✅ Connexion Réussie!',
        size: 'ExtraLarge',
        weight: 'Bolder',
        color: 'Good',
      },
      {
        type: 'TextBlock',
        text: "Votre intégration Microsoft Teams avec **Aurentia** fonctionne correctement.\n\nVous recevrez désormais des notifications ici lorsque des événements se produisent dans votre espace Aurentia.",
        wrap: true,
        spacing: 'Medium',
      },
      {
        type: 'TextBlock',
        text: `🤖 Message de test envoyé le ${new Date().toLocaleString('fr-FR')}`,
        size: 'Small',
        color: 'Default',
        spacing: 'Medium',
      },
    ];

    return card;
  }
}

export const teamsFormatter = new TeamsFormatter();
