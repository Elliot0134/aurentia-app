/**
 * Gmail Formatter
 * Formats Aurentia events as email messages
 */

import type { IntegrationEvent } from '@/types/integrationTypes';
import type { GmailMessage, GmailSettings } from './gmailTypes';

class GmailFormatter {
  /**
   * Format integration event to email message
   * Returns null if event shouldn't trigger an email
   */
  formatEvent(event: IntegrationEvent, settings: GmailSettings): GmailMessage | null {
    // Check if this event type should trigger email
    if (settings.events && !settings.events.includes(event.type)) {
      return null;
    }

    switch (event.type) {
      case 'deliverable.submitted':
        return this.formatDeliverableSubmission(event);

      case 'deliverable.reviewed':
        return this.formatDeliverableReview(event);

      case 'comment.added':
        return this.formatCommentAdded(event);

      case 'project.created':
        return this.formatProjectCreated(event);

      case 'member.joined':
        return this.formatMemberJoined(event);

      case 'event.created':
        return this.formatEventCreated(event);

      default:
        return null;
    }
  }

  /**
   * Format deliverable submission email
   */
  private formatDeliverableSubmission(event: IntegrationEvent): GmailMessage {
    const { data } = event;

    return {
      to: [data.mentor_email || data.organisation_email || ''],
      subject: `📤 Nouveau livrable soumis : ${data.deliverable_name}`,
      body: this.createHtmlEmail(
        'Nouveau Livrable Soumis',
        `
        <p>Un nouveau livrable a été soumis pour révision.</p>
        <ul>
          <li><strong>Projet :</strong> ${data.project_name}</li>
          <li><strong>Livrable :</strong> ${data.deliverable_name}</li>
          <li><strong>Soumis par :</strong> ${data.user_name || 'Entrepreneur'}</li>
          <li><strong>Date :</strong> ${new Date().toLocaleDateString('fr-FR')}</li>
        </ul>
        <p>${data.description || ''}</p>
        <p><a href="${data.app_url}/organisation/${data.organisation_id}/projets" style="background-color: #8b5cf6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Voir le livrable</a></p>
        `
      ),
      isHtml: true,
    };
  }

  /**
   * Format deliverable review email
   */
  private formatDeliverableReview(event: IntegrationEvent): GmailMessage {
    const { data } = event;
    const status = data.status === 'approved' ? 'approuvé ✅' : 'refusé ❌';

    return {
      to: [data.user_email || ''],
      subject: `${data.status === 'approved' ? '✅' : '❌'} Livrable ${status} : ${data.deliverable_name}`,
      body: this.createHtmlEmail(
        `Livrable ${status}`,
        `
        <p>Votre livrable a été évalué.</p>
        <ul>
          <li><strong>Projet :</strong> ${data.project_name}</li>
          <li><strong>Livrable :</strong> ${data.deliverable_name}</li>
          <li><strong>Statut :</strong> ${status}</li>
          <li><strong>Note :</strong> ${data.score || 'N/A'}/10</li>
        </ul>
        <p><strong>Commentaire du mentor :</strong></p>
        <p>${data.feedback || 'Aucun commentaire'}</p>
        <p><a href="${data.app_url}/projets" style="background-color: #8b5cf6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Voir mes projets</a></p>
        `
      ),
      isHtml: true,
    };
  }

  /**
   * Format comment added email
   */
  private formatCommentAdded(event: IntegrationEvent): GmailMessage {
    const { data } = event;

    return {
      to: [data.recipient_email || ''],
      subject: `💬 Nouveau commentaire sur ${data.deliverable_name}`,
      body: this.createHtmlEmail(
        'Nouveau Commentaire',
        `
        <p>Un nouveau commentaire a été ajouté sur un livrable.</p>
        <ul>
          <li><strong>Livrable :</strong> ${data.deliverable_name}</li>
          <li><strong>Commenté par :</strong> ${data.commenter_name}</li>
          <li><strong>Date :</strong> ${new Date().toLocaleDateString('fr-FR')}</li>
        </ul>
        <p><strong>Commentaire :</strong></p>
        <p>${data.comment}</p>
        `
      ),
      isHtml: true,
    };
  }

  /**
   * Format project created email
   */
  private formatProjectCreated(event: IntegrationEvent): GmailMessage {
    const { data } = event;

    return {
      to: [data.organisation_email || ''],
      subject: `🎉 Nouveau projet créé : ${data.project_name}`,
      body: this.createHtmlEmail(
        'Nouveau Projet Créé',
        `
        <p>Un nouveau projet a été créé dans Aurentia.</p>
        <ul>
          <li><strong>Projet :</strong> ${data.project_name}</li>
          <li><strong>Créé par :</strong> ${data.user_name}</li>
          <li><strong>Date :</strong> ${new Date().toLocaleDateString('fr-FR')}</li>
        </ul>
        <p>${data.description || ''}</p>
        `
      ),
      isHtml: true,
    };
  }

  /**
   * Format member joined email
   */
  private formatMemberJoined(event: IntegrationEvent): GmailMessage {
    const { data } = event;

    return {
      to: [data.organisation_email || ''],
      subject: `👋 Nouveau membre : ${data.user_name}`,
      body: this.createHtmlEmail(
        'Nouveau Membre',
        `
        <p>Un nouveau membre a rejoint votre organisation.</p>
        <ul>
          <li><strong>Nom :</strong> ${data.user_name}</li>
          <li><strong>Email :</strong> ${data.user_email}</li>
          <li><strong>Date :</strong> ${new Date().toLocaleDateString('fr-FR')}</li>
        </ul>
        `
      ),
      isHtml: true,
    };
  }

  /**
   * Format event created email
   */
  private formatEventCreated(event: IntegrationEvent): GmailMessage {
    const { data } = event;

    return {
      to: data.attendees || [],
      subject: `📅 Nouvel événement : ${data.event_title}`,
      body: this.createHtmlEmail(
        'Nouvel Événement',
        `
        <p>Un nouvel événement a été créé dans le calendrier.</p>
        <ul>
          <li><strong>Titre :</strong> ${data.event_title}</li>
          <li><strong>Date :</strong> ${data.start_date ? new Date(data.start_date).toLocaleDateString('fr-FR') : 'À définir'}</li>
          <li><strong>Heure :</strong> ${data.start_time || 'À définir'}</li>
          ${data.location ? `<li><strong>Lieu :</strong> ${data.location}</li>` : ''}
        </ul>
        <p>${data.description || ''}</p>
        `
      ),
      isHtml: true,
    };
  }

  /**
   * Create HTML email template
   */
  private createHtmlEmail(title: string, content: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="margin: 0; font-size: 24px;">${title}</h1>
  </div>
  <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
    ${content}
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
    <p style="color: #6b7280; font-size: 12px; text-align: center;">
      Cet email a été envoyé par Aurentia. Si vous ne souhaitez plus recevoir ces notifications, vous pouvez les désactiver dans vos paramètres.
    </p>
  </div>
</body>
</html>
    `.trim();
  }
}

export const gmailFormatter = new GmailFormatter();
