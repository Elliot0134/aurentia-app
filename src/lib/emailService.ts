import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendInvitationEmail(email: string, projectName: string, invitationUrl: string) {
  try {
    await resend.emails.send({
      from: 'noreply@votre-domaine.com',
      to: email,
      subject: `Invitation à collaborer sur ${projectName}`,
      html: `
        <h2>Vous avez été invité à collaborer !</h2>
        <p>Vous avez été invité à rejoindre le projet <strong>${projectName}</strong> sur Aurentia.</p>
        <p><a href="${invitationUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Accepter l'invitation</a></p>
      `
    })
    return { success: true }
  } catch (error) {
    console.error('Erreur envoi email:', error)
    return { success: false, error }
  }
}