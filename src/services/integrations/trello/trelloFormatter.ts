/**
 * Trello Card Formatter
 * Converts Aurentia events into Trello cards
 */

import type { IntegrationEvent } from '@/types/integrationTypes';
import type { CreateCardRequest, TrelloSettings } from './trelloTypes';

class TrelloFormatter {
  /**
   * Format an Aurentia event into a Trello card
   */
  formatEvent(
    event: IntegrationEvent,
    settings: TrelloSettings,
    defaultListId: string
  ): CreateCardRequest | null {
    // Check if this event type should create a card
    if (!settings.create_cards_for?.includes(event.type)) {
      return null;
    }

    switch (event.type) {
      case 'project.created':
        return this.formatProjectCreated(event, settings, defaultListId);
      case 'deliverable.submitted':
        return this.formatDeliverableSubmitted(event, settings, defaultListId);
      case 'event.created':
        return this.formatEventCreated(event, settings, defaultListId);
      default:
        return null;
    }
  }

  /**
   * Format: Project Created
   */
  private formatProjectCreated(
    event: IntegrationEvent,
    settings: TrelloSettings,
    defaultListId: string
  ): CreateCardRequest {
    const { data } = event;

    const description = this.buildCardDescription({
      mainContent: data.description || '',
      fields: [
        { label: 'Créé par', value: data.creator_name || 'Utilisateur' },
        { label: 'Statut', value: data.status || 'Actif' },
        { label: 'Date de création', value: new Date(data.created_at || Date.now()).toLocaleDateString('fr-FR') },
      ],
      footer: '🎉 Nouveau projet créé sur Aurentia',
    });

    return {
      name: `🎯 Projet: ${data.name || 'Sans nom'}`,
      desc: description,
      idList: this.getListId('project', settings, defaultListId),
      pos: 'top',
      urlSource: this.buildAurentiaUrl(`/project/${data.id}`),
    };
  }

  /**
   * Format: Deliverable Submitted
   */
  private formatDeliverableSubmitted(
    event: IntegrationEvent,
    settings: TrelloSettings,
    defaultListId: string
  ): CreateCardRequest {
    const { data } = event;

    const description = this.buildCardDescription({
      mainContent: data.content || '',
      fields: [
        { label: 'Type', value: data.type },
        { label: 'Projet', value: data.project_name || 'N/A' },
        { label: 'Soumis par', value: data.submitter_name || 'Entrepreneur' },
        { label: 'Date de soumission', value: new Date().toLocaleDateString('fr-FR') },
      ],
      footer: '📝 Livrable en attente de révision',
    });

    return {
      name: `📝 Livrable: ${data.name || data.type}`,
      desc: description,
      idList: this.getListId('deliverable.submitted', settings, defaultListId),
      pos: 'top',
      urlSource: this.buildAurentiaUrl(`/deliverables/${data.id}`),
    };
  }

  /**
   * Format: Event Created
   */
  private formatEventCreated(
    event: IntegrationEvent,
    settings: TrelloSettings,
    defaultListId: string
  ): CreateCardRequest {
    const { data } = event;

    const startDate = data.start_date ? new Date(data.start_date).toLocaleDateString('fr-FR') : null;
    const startTime = data.start_time || '';

    const description = this.buildCardDescription({
      mainContent: data.description || '',
      fields: [
        { label: 'Date', value: startDate ? `${startDate} ${startTime}` : 'Date non définie' },
        { label: 'Lieu', value: data.location || 'Non spécifié' },
        { label: 'Type', value: data.type || 'Événement' },
      ],
      footer: '📅 Nouvel événement Aurentia',
    });

    // Parse due date for Trello
    let dueDate: string | undefined;
    if (data.start_date) {
      try {
        const dateStr = data.start_time
          ? `${data.start_date}T${data.start_time}:00`
          : `${data.start_date}T09:00:00`;
        dueDate = new Date(dateStr).toISOString();
      } catch {
        dueDate = undefined;
      }
    }

    return {
      name: `📅 Événement: ${data.title}`,
      desc: description,
      idList: this.getListId('event', settings, defaultListId),
      pos: 'top',
      due: dueDate,
      urlSource: this.buildAurentiaUrl('/events'),
    };
  }

  /**
   * Build card description with consistent formatting
   */
  private buildCardDescription(options: {
    mainContent: string;
    fields: Array<{ label: string; value: string }>;
    footer: string;
  }): string {
    let description = '';

    if (options.mainContent) {
      description += `${options.mainContent}\n\n`;
    }

    description += '---\n\n';
    description += '**Détails:**\n\n';

    for (const field of options.fields) {
      description += `**${field.label}:** ${field.value}\n`;
    }

    description += `\n---\n\n${options.footer}`;

    return description;
  }

  /**
   * Get Trello list ID based on event type and settings
   */
  private getListId(eventType: string, settings: TrelloSettings, defaultListId: string): string {
    if (settings.list_mapping && settings.list_mapping[eventType]) {
      return settings.list_mapping[eventType];
    }

    return defaultListId;
  }

  /**
   * Build Aurentia URL for card link
   */
  private buildAurentiaUrl(path: string): string {
    const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
    return `${baseUrl}${path}`;
  }
}

export const trelloFormatter = new TrelloFormatter();
