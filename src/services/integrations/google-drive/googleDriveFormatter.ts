/**
 * Google Drive Formatter
 * Formats Aurentia data for Google Drive API
 */

import type { IntegrationEvent } from '@/types/integrationTypes';
import type { GoogleDriveFile, GoogleDriveSettings } from './googleDriveTypes';

class GoogleDriveFormatter {
  /**
   * Format integration event to determine Drive action
   * Returns null if event shouldn't create Drive content
   */
  formatEvent(
    event: IntegrationEvent,
    settings: GoogleDriveSettings
  ): GoogleDriveFile | null {
    // Check if this event type should trigger Drive sync
    if (settings.events && !settings.events.includes(event.type)) {
      return null;
    }

    switch (event.type) {
      case 'deliverable.submitted':
        return this.formatDeliverableSubmission(event);

      case 'project.created':
        return this.formatProjectCreation(event);

      default:
        return null;
    }
  }

  /**
   * Format deliverable submission for Drive
   * Creates a Google Doc with deliverable content
   */
  private formatDeliverableSubmission(event: IntegrationEvent): GoogleDriveFile {
    const { data } = event;

    return {
      name: `${data.deliverable_name || 'Livrable'} - ${data.project_name || 'Projet'}`,
      mimeType: 'application/vnd.google-apps.document',
      description: `Livrable soumis le ${new Date().toLocaleDateString('fr-FR')}\n${data.description || ''}`,
    };
  }

  /**
   * Format project creation for Drive
   * Creates a folder for the project
   */
  private formatProjectCreation(event: IntegrationEvent): GoogleDriveFile {
    const { data } = event;

    return {
      name: data.project_name || 'Nouveau Projet',
      mimeType: 'application/vnd.google-apps.folder',
      description: `Projet créé le ${new Date().toLocaleDateString('fr-FR')}`,
    };
  }
}

export const googleDriveFormatter = new GoogleDriveFormatter();
