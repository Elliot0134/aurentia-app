import { supabase } from '@/integrations/supabase/client';

/**
 * Obtient l'URL de base de l'application
 */
function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'https://aurentia.app';
}

/**
 * Service de gestion des emails
 */
export class EmailService {
  /**
   * Envoie un email d'invitation à collaborer en utilisant le template Supabase
   */
  static async sendCollaborationInvitation(
    email: string,
    token: string,
    projectName: string,
    inviterEmail: string,
    projectDescription?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('📧 EmailService.sendCollaborationInvitation appelé avec:', {
        email,
        projectName,
        inviterEmail,
        hasToken: !!token
      });

      const baseUrl = getBaseUrl();
      const inviteUrl = `${baseUrl}/login?invitation_token=${token}`;

      console.log('🔗 URL d\'invitation:', inviteUrl);

      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          to: email,
          subject: 'Invitation à collaborer - Aurentia',
          template: 'collaboration-invitation-template',
          data: {
            InviterEmail: inviterEmail,
            ProjectName: projectName,
            ProjectDescription: projectDescription || '',
            InvitationURL: inviteUrl
          }
        }
      });

      if (error) {
        console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
        return { success: false, error: 'Erreur lors de l\'envoi de l\'email' };
      }

      console.log('✅ Appel à la fonction send-email réussi');
      return { success: true };
    } catch (error) {
      console.error('❌ Exception lors de l\'envoi de l\'email d\'invitation:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Envoie un email de notification lorsqu'une invitation est acceptée
   */
  static async sendInvitationAcceptedNotification(
    inviterEmail: string,
    accepterEmail: string,
    projectName: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Invitation acceptée - Aurentia</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { background: #fff; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎉 Invitation acceptée !</h1>
          </div>
          <div class="content">
            <h2>Bonne nouvelle !</h2>
            <p><strong>${accepterEmail}</strong> a accepté votre invitation à collaborer sur le projet <strong>${projectName}</strong>.</p>
            <p>Vous pouvez maintenant commencer à collaborer ensemble sur Aurentia.</p>
            <p><a href="${getBaseUrl()}/individual/collaborateurs" style="color: #667eea;">Voir vos collaborateurs</a></p>
          </div>
          <div class="footer">
            <p>Aurentia - Votre plateforme de développement de projets entrepreneuriaux</p>
          </div>
        </body>
        </html>
      `;

      const textContent = `
INVITATION ACCEPTÉE - AURENTIA

Bonne nouvelle !

${accepterEmail} a accepté votre invitation à collaborer sur le projet "${projectName}".

Vous pouvez maintenant commencer à collaborer ensemble sur Aurentia.

---
Aurentia - Votre plateforme de développement de projets entrepreneuriaux
https://app.aurentia.fr
      `.trim();

      const { error } = await supabase.functions.invoke('send-notification-email', {
        body: { 
          email: inviterEmail,
          subject: '🎉 Invitation acceptée - Aurentia',
          htmlContent,
          textContent
        }
      });

      if (error) {
        console.error('Erreur lors de l\'envoi de la notification:', error);
        return { success: false, error: 'Erreur lors de l\'envoi de la notification' };
      }

      return { success: true };
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification:', error);
      return { success: false, error: error.message };
    }
  }
}
