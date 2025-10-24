/**
 * Discord Message Formatter
 * Formats Aurentia events into rich Discord embeds
 */

import type { IntegrationEvent } from '@/types/integrationTypes';
import type { DiscordMessage, DiscordEmbed } from './discordTypes';
import { DISCORD_COLORS } from './discordTypes';

class DiscordFormatter {
  /**
   * Get app URL for links
   */
  private getAppUrl(): string {
    return import.meta.env.VITE_APP_URL || window.location.origin;
  }

  /**
   * Format an integration event into a Discord message
   */
  formatEvent(event: IntegrationEvent): DiscordMessage {
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
  private formatProjectCreated(event: IntegrationEvent): DiscordMessage {
    const { data } = event;

    const embed: DiscordEmbed = {
      title: '🎉 Nouveau Projet Créé',
      description: data.description || undefined,
      color: DISCORD_COLORS.GREEN,
      fields: [
        {
          name: 'Projet',
          value: data.name || 'Sans nom',
          inline: true,
        },
        {
          name: 'Créé par',
          value: data.creator_name || 'Utilisateur',
          inline: true,
        },
        {
          name: 'Statut',
          value: data.status || 'Actif',
          inline: true,
        },
        {
          name: 'Date',
          value: new Date(data.created_at || Date.now()).toLocaleDateString('fr-FR'),
          inline: true,
        },
      ],
      footer: {
        text: 'Aurentia Platform',
      },
      timestamp: new Date().toISOString(),
    };

    // Add link if available
    if (data.id) {
      embed.url = `${this.getAppUrl()}/project/${data.id}`;
    }

    return {
      content: `🎉 Nouveau projet: **${data.name}**`,
      embeds: [embed],
    };
  }

  /**
   * Format: Project Updated
   */
  private formatProjectUpdated(event: IntegrationEvent): DiscordMessage {
    const { data } = event;

    const embed: DiscordEmbed = {
      title: '📝 Projet Mis à Jour',
      description: `**${data.name}** a été modifié`,
      color: DISCORD_COLORS.BLUE,
      url: data.id ? `${this.getAppUrl()}/project/${data.id}` : undefined,
      footer: {
        text: 'Aurentia Platform',
      },
      timestamp: new Date().toISOString(),
    };

    return {
      embeds: [embed],
    };
  }

  /**
   * Format: Deliverable Submitted
   */
  private formatDeliverableSubmitted(event: IntegrationEvent): DiscordMessage {
    const { data } = event;

    const embed: DiscordEmbed = {
      title: '📝 Nouveau Livrable Soumis',
      description: `**${data.name || data.type}** a été soumis pour révision`,
      color: DISCORD_COLORS.AURENTIA_PINK,
      fields: [
        {
          name: 'Livrable',
          value: data.name || data.type,
          inline: true,
        },
        {
          name: 'Type',
          value: data.type,
          inline: true,
        },
        {
          name: 'Projet',
          value: data.project_name || 'N/A',
          inline: true,
        },
        {
          name: 'Soumis par',
          value: data.submitter_name || 'Entrepreneur',
          inline: true,
        },
        {
          name: 'Statut',
          value: '⏰ En attente de révision',
          inline: false,
        },
      ],
      url: data.id ? `${this.getAppUrl()}/deliverables/${data.id}` : undefined,
      footer: {
        text: 'Aurentia Platform',
      },
      timestamp: new Date().toISOString(),
    };

    return {
      content: '📝 Un nouveau livrable attend votre révision!',
      embeds: [embed],
    };
  }

  /**
   * Format: Deliverable Reviewed
   */
  private formatDeliverableReviewed(event: IntegrationEvent): DiscordMessage {
    const { data } = event;
    const approved = data.status === 'approved' || data.approved;

    const embed: DiscordEmbed = {
      title: approved ? '✅ Livrable Approuvé' : '📝 Livrable Évalué',
      description: `**${data.name}** a été ${approved ? 'approuvé' : 'évalué'} par ${data.reviewer_name || 'un mentor'}`,
      color: approved ? DISCORD_COLORS.GREEN : DISCORD_COLORS.BLUE,
      url: data.id ? `${this.getAppUrl()}/deliverables/${data.id}` : undefined,
      footer: {
        text: 'Aurentia Platform',
      },
      timestamp: new Date().toISOString(),
    };

    return {
      content: approved ? '✅ Félicitations!' : '📝 Évaluation reçue',
      embeds: [embed],
    };
  }

  /**
   * Format: Comment Added
   */
  private formatCommentAdded(event: IntegrationEvent): DiscordMessage {
    const { data } = event;

    const commentPreview = data.comment_text?.substring(0, 200);
    const truncated = data.comment_text?.length > 200;

    const embed: DiscordEmbed = {
      title: '💬 Nouveau Commentaire',
      description: `${data.author_name} a ajouté un commentaire sur **${data.deliverable_name}**`,
      color: DISCORD_COLORS.PURPLE,
      fields: [
        {
          name: 'Commentaire',
          value: `${commentPreview}${truncated ? '...' : ''}`,
          inline: false,
        },
      ],
      url: data.deliverable_id ? `${this.getAppUrl()}/deliverables/${data.deliverable_id}` : undefined,
      footer: {
        text: 'Aurentia Platform',
      },
      timestamp: new Date().toISOString(),
    };

    return {
      embeds: [embed],
    };
  }

  /**
   * Format: Member Joined
   */
  private formatMemberJoined(event: IntegrationEvent): DiscordMessage {
    const { data } = event;

    const embed: DiscordEmbed = {
      title: '👋 Nouveau Membre',
      description: `**${data.name}** vient de rejoindre **${data.organisation_name}** en tant que ${data.role || 'membre'}!`,
      color: DISCORD_COLORS.AQUA,
      footer: {
        text: 'Aurentia Platform',
      },
      timestamp: new Date().toISOString(),
    };

    return {
      content: `👋 Bienvenue à ${data.name}!`,
      embeds: [embed],
    };
  }

  /**
   * Format: Event Created
   */
  private formatEventCreated(event: IntegrationEvent): DiscordMessage {
    const { data } = event;

    const startDate = data.start_date ? new Date(data.start_date).toLocaleDateString('fr-FR') : 'Date non définie';
    const startTime = data.start_time || '';

    const fields = [
      {
        name: 'Date',
        value: `${startDate} ${startTime}`,
        inline: true,
      },
      {
        name: 'Lieu',
        value: data.location || 'Non spécifié',
        inline: true,
      },
      {
        name: 'Type',
        value: data.type || 'Événement',
        inline: true,
      },
    ];

    const embed: DiscordEmbed = {
      title: '📅 Nouvel Événement',
      description: `**${data.title}**\n\n${data.description || ''}`,
      color: DISCORD_COLORS.AURENTIA_ORANGE,
      fields,
      url: `${this.getAppUrl()}/events`,
      footer: {
        text: 'Aurentia Platform',
      },
      timestamp: new Date().toISOString(),
    };

    return {
      content: '📅 Un nouvel événement a été créé!',
      embeds: [embed],
    };
  }

  /**
   * Format: Generic Event (fallback)
   */
  private formatGeneric(event: IntegrationEvent): DiscordMessage {
    const embed: DiscordEmbed = {
      title: 'Événement Aurentia',
      description: `Type: ${event.type}`,
      color: DISCORD_COLORS.GREY,
      fields: [
        {
          name: 'Données',
          value: `\`\`\`json\n${JSON.stringify(event.data, null, 2).substring(0, 1000)}\n\`\`\``,
          inline: false,
        },
      ],
      footer: {
        text: 'Aurentia Platform',
      },
      timestamp: new Date().toISOString(),
    };

    return {
      embeds: [embed],
    };
  }

  /**
   * Create a test message for connection testing
   */
  createTestMessage(): DiscordMessage {
    const embed: DiscordEmbed = {
      title: '✅ Connexion Réussie!',
      description:
        'Votre intégration Discord avec **Aurentia** fonctionne correctement.\n\n' +
        'Vous recevrez désormais des notifications ici lorsque des événements se produisent dans votre espace Aurentia.',
      color: DISCORD_COLORS.GREEN,
      footer: {
        text: `🤖 Message de test envoyé le ${new Date().toLocaleString('fr-FR')}`,
      },
      timestamp: new Date().toISOString(),
    };

    return {
      content: '🎉 **Aurentia - Test de connexion réussi!**',
      embeds: [embed],
    };
  }
}

export const discordFormatter = new DiscordFormatter();
