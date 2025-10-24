/**
 * Slack Message Formatter
 * Formats Aurentia events into rich Slack Block Kit messages
 */

import type { IntegrationEvent } from '@/types/integrationTypes';
import type { SlackMessage, SlackBlock } from './slackTypes';
import { NOTIFICATION_COLORS } from '@/lib/integrationConstants';

class SlackFormatter {
  /**
   * Get app URL for links
   */
  private getAppUrl(): string {
    return import.meta.env.VITE_APP_URL || window.location.origin;
  }

  /**
   * Format an integration event into a Slack message
   */
  formatEvent(event: IntegrationEvent): SlackMessage {
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
  private formatProjectCreated(event: IntegrationEvent): SlackMessage {
    const { data } = event;
    const blocks: SlackBlock[] = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🎉 Nouveau Projet Créé',
          emoji: true
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Projet:*\n${data.name || 'Sans nom'}`
          },
          {
            type: 'mrkdwn',
            text: `*Créé par:*\n${data.creator_name || 'Utilisateur'}`
          },
          {
            type: 'mrkdwn',
            text: `*Statut:*\n${data.status || 'Actif'}`
          },
          {
            type: 'mrkdwn',
            text: `*Date:*\n${new Date(data.created_at || Date.now()).toLocaleDateString('fr-FR')}`
          }
        ]
      }
    ];

    if (data.description) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Description:*\n${data.description}`
        }
      });
    }

    blocks.push({
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'Voir le projet'
          },
          url: `${this.getAppUrl()}/project/${data.id}`,
          style: 'primary'
        }
      ]
    });

    return {
      text: `🎉 Nouveau projet: ${data.name}`,
      blocks
    };
  }

  /**
   * Format: Project Updated
   */
  private formatProjectUpdated(event: IntegrationEvent): SlackMessage {
    const { data } = event;

    return {
      text: `📝 Projet mis à jour: ${data.name}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*📝 Projet mis à jour*\n\n*${data.name}* a été modifié`
          }
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Voir les changements'
              },
              url: `${this.getAppUrl()}/project/${data.id}`
            }
          ]
        }
      ]
    };
  }

  /**
   * Format: Deliverable Submitted
   */
  private formatDeliverableSubmitted(event: IntegrationEvent): SlackMessage {
    const { data } = event;
    const blocks: SlackBlock[] = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '📝 Nouveau Livrable Soumis',
          emoji: true
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Livrable:*\n${data.name || data.type}`
          },
          {
            type: 'mrkdwn',
            text: `*Type:*\n${data.type}`
          },
          {
            type: 'mrkdwn',
            text: `*Projet:*\n${data.project_name || 'N/A'}`
          },
          {
            type: 'mrkdwn',
            text: `*Soumis par:*\n${data.submitter_name || 'Entrepreneur'}`
          }
        ]
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `⏰ *En attente de révision*`
        }
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Réviser le livrable'
            },
            url: `${this.getAppUrl()}/deliverables/${data.id}`,
            style: 'primary'
          }
        ]
      }
    ];

    return {
      text: `📝 Livrable soumis: ${data.name || data.type}`,
      blocks
    };
  }

  /**
   * Format: Deliverable Reviewed
   */
  private formatDeliverableReviewed(event: IntegrationEvent): SlackMessage {
    const { data } = event;
    const approved = data.status === 'approved' || data.approved;

    return {
      text: `${approved ? '✅' : '📝'} Livrable évalué: ${data.name}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `${approved ? '*✅ Livrable approuvé*' : '*📝 Livrable évalué*'}\n\n*${data.name}* a été ${approved ? 'approuvé' : 'évalué'} par ${data.reviewer_name || 'un mentor'}`
          }
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Voir les détails'
              },
              url: `${this.getAppUrl()}/deliverables/${data.id}`
            }
          ]
        }
      ]
    };
  }

  /**
   * Format: Comment Added
   */
  private formatCommentAdded(event: IntegrationEvent): SlackMessage {
    const { data } = event;

    return {
      text: `💬 Nouveau commentaire sur ${data.deliverable_name}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*💬 Nouveau commentaire*\n\n${data.author_name} a ajouté un commentaire sur *${data.deliverable_name}*`
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `> ${data.comment_text?.substring(0, 200)}${data.comment_text?.length > 200 ? '...' : ''}`
          }
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Voir le commentaire'
              },
              url: `${this.getAppUrl()}/deliverables/${data.deliverable_id}`
            }
          ]
        }
      ]
    };
  }

  /**
   * Format: Member Joined
   */
  private formatMemberJoined(event: IntegrationEvent): SlackMessage {
    const { data } = event;

    return {
      text: `👋 ${data.name} a rejoint ${data.organisation_name}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `👋 *${data.name}* vient de rejoindre *${data.organisation_name}* en tant que ${data.role || 'membre'}!`
          }
        }
      ]
    };
  }

  /**
   * Format: Event Created
   */
  private formatEventCreated(event: IntegrationEvent): SlackMessage {
    const { data } = event;

    const startDate = data.start_date ? new Date(data.start_date).toLocaleDateString('fr-FR') : 'Date non définie';
    const startTime = data.start_time || '';

    return {
      text: `📅 Nouvel événement: ${data.title}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '📅 Nouvel Événement',
            emoji: true
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Titre:*\n${data.title}`
            },
            {
              type: 'mrkdwn',
              text: `*Date:*\n${startDate} ${startTime}`
            },
            {
              type: 'mrkdwn',
              text: `*Lieu:*\n${data.location || 'Non spécifié'}`
            },
            {
              type: 'mrkdwn',
              text: `*Type:*\n${data.type || 'Événement'}`
            }
          ]
        },
        ...(data.description
          ? [
              {
                type: 'section' as const,
                text: {
                  type: 'mrkdwn' as const,
                  text: `*Description:*\n${data.description}`
                }
              }
            ]
          : []),
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Voir l\'événement'
              },
              url: `${this.getAppUrl()}/events`
            }
          ]
        }
      ]
    };
  }

  /**
   * Format: Generic Event (fallback)
   */
  private formatGeneric(event: IntegrationEvent): SlackMessage {
    return {
      text: `Événement Aurentia: ${event.type}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Événement:* ${event.type}\n\`\`\`${JSON.stringify(event.data, null, 2)}\`\`\``
          }
        }
      ]
    };
  }

  /**
   * Create a test message for connection testing
   */
  createTestMessage(): SlackMessage {
    return {
      text: '✅ Aurentia - Test de connexion réussi!',
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '✅ Connexion Réussie!',
            emoji: true
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: 'Votre intégration Slack avec *Aurentia* fonctionne correctement.\n\nVous recevrez désormais des notifications ici lorsque des événements se produisent dans votre espace Aurentia.'
          }
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `🤖 Message de test envoyé le ${new Date().toLocaleString('fr-FR')}`
            }
          ]
        }
      ]
    };
  }
}

export const slackFormatter = new SlackFormatter();
