import { Resend } from 'resend';

const resend = new Resend('re_QRvJqQrk_6frQuf67Q8Hpu1He93EqTXmQ');

async function debugEmailSending() {
  try {
    console.log('🔍 Diagnostic de l\'API Resend...');
    console.log('Clé API:', 're_QRvJqQrk_6frQuf67Q8Hpu1He93EqTXmQ'.substring(0, 10) + '...');
    
    // Test de la connexion API
    console.log('\n📡 Test de connexion à l\'API Resend...');
    
    const data = await resend.emails.send({
      from: 'Aurentia Team <team@mail.aurentia.fr>',
      to: ['elliot.estrade@gmail.com'],
      subject: 'Test MCP Resend - Aurentia App ✅',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">🎉 Test d'intégration MCP Resend</h2>
          <p>Bonjour Elliot,</p>
          <p>Ceci est un email de test envoyé via le serveur MCP Resend intégré dans Cursor.</p>
          <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; border-left: 4px solid #2563eb;">
            <p><strong>✅ L'intégration fonctionne parfaitement !</strong></p>
          </div>
          <p>Détails techniques :</p>
          <ul>
            <li><strong>Expéditeur :</strong> team@mail.aurentia.fr (domaine vérifié)</li>
            <li><strong>Destinataire :</strong> elliot.estrade@gmail.com</li>
            <li><strong>Serveur MCP :</strong> Resend</li>
            <li><strong>Configuration :</strong> .vscode/mcp.json</li>
            <li><strong>Timestamp :</strong> ${new Date().toISOString()}</li>
          </ul>
          <p>Tu peux maintenant utiliser Cursor en mode Agent pour envoyer des emails directement depuis l'éditeur !</p>
          <p>Cordialement,<br><strong>L'équipe Aurentia</strong></p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
          <small style="color: #6b7280;">Aurentia App - Système d'emails intégré via MCP Resend</small>
        </div>
      `
    });

    console.log('✅ Réponse de l\'API:', JSON.stringify(data, null, 2));
    
    if (data.id) {
      console.log('🎉 Email envoyé avec succès !');
      console.log('ID de l\'email:', data.id);
    } else {
      console.log('⚠️ L\'email semble avoir été envoyé mais sans ID retourné');
    }
    
  } catch (error) {
    console.error('❌ Erreur détaillée:', {
      message: error.message,
      status: error.status,
      name: error.name,
      stack: error.stack
    });
    
    if (error.message.includes('API key')) {
      console.log('🔑 Problème avec la clé API - vérifiez qu\'elle est valide');
    }
    
    if (error.message.includes('domain')) {
      console.log('🌐 Problème de domaine - utilisez un domaine vérifié');
    }
  }
}

debugEmailSending();