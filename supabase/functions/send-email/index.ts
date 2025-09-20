import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@1.1.0";
import { corsHeaders } from '../_shared/cors.ts'

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Templates directement intégrés dans le code avec les 3 nouveaux templates
const templates = {
  'update-email-template': `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmez votre changement d'email</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        body {
            font-family: 'Inter', sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #F4F4F1;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            overflow: hidden;
        }
        .header {
            background: #F4F4F1;
            color: #333;
            padding: 40px 30px;
            text-align: center;
        }
        .logo {
            width: 160px;
            height: auto;
            margin-bottom: 25px;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 400;
            color: #333;
        }
        .content {
            padding: 40px 30px;
            background: white;
        }
        .email-change-info {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 25px 0;
            border-left: 4px solid #FF592C;
        }
        .email-change-info .email-row {
            display: flex;
            align-items: center;
            margin: 10px 0;
            font-size: 14px;
        }
        .email-change-info .email-label {
            font-weight: 600;
            min-width: 120px;
            color: #495057;
        }
        .email-change-info .email-address {
            font-family: 'Courier New', monospace;
            background: white;
            padding: 8px 12px;
            border-radius: 4px;
            color: #FF592C;
            border: 1px solid #e9ecef;
        }
        .cta-button {
            display: inline-block !important;
            background: #FF592C !important;
            color: #ffffff !important;
            text-decoration: none !important;
            padding: 15px 35px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            padding: 25px;
            background: white;
            color: #6c757d;
            font-size: 14px;
            border-top: 1px solid #e9ecef;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://cdn.prod.website-files.com/68b2fd357db03bbb045b95e1/68c5d9c555c56a4153719885_logo-long.svg" alt="Logo Aurentia" class="logo">
            <h1>Confirmez votre changement d'email</h1>
        </div>
        
        <div class="content">
            <p>Vous avez demandé à modifier l'adresse email associée à votre compte Aurentia.</p>
            
            <div class="email-change-info">
                <p style="margin-top: 0; font-weight: 600; color: #2c3e50;">Résumé du changement :</p>
                <div class="email-row">
                    <span class="email-label">Ancienne adresse :</span>
                    <span class="email-address">{{ .Email }}</span>
                </div>
                <div style="text-align: center; margin: 15px 0;">
                    <span style="color: #FF592C; font-size: 18px; font-weight: bold;">↓</span>
                </div>
                <div class="email-row">
                    <span class="email-label">Nouvelle adresse :</span>
                    <span class="email-address">{{ .NewEmail }}</span>
                </div>
            </div>
            
            <p>Pour confirmer ce changement, cliquez sur le bouton ci-dessous :</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{ .ConfirmationURL }}" class="cta-button">
                    ✓ Confirmer le changement d'email
                </a>
            </div>
            
            <div style="margin-top: 25px; padding: 15px; background: #fff3cd; border-radius: 8px; font-size: 14px; color: #856404; border-left: 4px solid #ffc107;">
                <p><strong>⚠️ Vous n'avez pas demandé ce changement ?</strong></p>
                <p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet email et contactez notre support.</p>
            </div>
        </div>
        
        <div class="footer">
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.<br>
            Si vous avez des questions, contactez notre équipe support.</p>
        </div>
    </div>
</body>
</html>`,

  'confirm-old-email-template': `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🔒 Confirmez la demande de changement d'email</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        body {
            font-family: 'Inter', sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #F4F4F1;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            overflow: hidden;
        }
        .header {
            background: #F4F4F1;
            color: #333;
            padding: 40px 30px;
            text-align: center;
        }
        .logo {
            width: 160px;
            height: auto;
            margin-bottom: 25px;
        }
        .header h1 {
            margin: 0;
            font-size: 26px;
            font-weight: 400;
            color: #333;
        }
        .content {
            padding: 40px 30px;
            background: white;
        }
        .security-header {
            background: #fff3cd;
            padding: 20px;
            border-radius: 8px;
            margin: 25px 0;
            border-left: 4px solid #ffc107;
            text-align: center;
        }
        .security-header h2 {
            margin: 0 0 10px 0;
            color: #856404;
            font-size: 20px;
        }
        .email-change-info {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 25px 0;
            border-left: 4px solid #FF592C;
        }
        .email-change-info .email-row {
            display: flex;
            align-items: center;
            margin: 10px 0;
            font-size: 14px;
        }
        .email-change-info .email-label {
            font-weight: 600;
            min-width: 120px;
            color: #495057;
        }
        .email-change-info .email-address {
            font-family: 'Courier New', monospace;
            background: white;
            padding: 8px 12px;
            border-radius: 4px;
            color: #FF592C;
            border: 1px solid #e9ecef;
        }
        .cta-button {
            display: inline-block !important;
            background: #ffc107 !important;
            color: #000000 !important;
            text-decoration: none !important;
            padding: 15px 35px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            padding: 25px;
            background: white;
            color: #6c757d;
            font-size: 14px;
            border-top: 1px solid #e9ecef;
        }
        .warning-info {
            margin-top: 25px;
            padding: 15px;
            background: #f8d7da;
            border-radius: 8px;
            font-size: 14px;
            color: #721c24;
            border-left: 4px solid #dc3545;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://cdn.prod.website-files.com/68b2fd357db03bbb045b95e1/68c5d9c555c56a4153719885_logo-long.svg" alt="Logo Aurentia" class="logo">
            <h1>🔒 Sécurité : Confirmez la demande</h1>
        </div>
        
        <div class="content">
            <div class="security-header">
                <h2>⚠️ Demande de changement d'email détectée</h2>
                <p style="margin: 0; font-weight: 500;">Une demande de modification a été effectuée sur votre compte</p>
            </div>
            
            <p style="font-size: 16px; margin-bottom: 25px;">
                Une demande de changement d'adresse email a été effectuée sur votre compte Aurentia. Pour des raisons de sécurité, nous devons confirmer que vous êtes bien à l'origine de cette demande.
            </p>
            
            <div class="email-change-info">
                <p style="margin-top: 0; font-weight: 600; color: #2c3e50;">Détails du changement demandé :</p>
                <div class="email-row">
                    <span class="email-label">Adresse actuelle :</span>
                    <span class="email-address">{{ .OldEmail }}</span>
                </div>
                <div style="text-align: center; margin: 15px 0;">
                    <span style="color: #FF592C; font-size: 18px; font-weight: bold;">↓</span>
                </div>
                <div class="email-row">
                    <span class="email-label">Nouvelle adresse :</span>
                    <span class="email-address">{{ .NewEmail }}</span>
                </div>
            </div>
            
            <p><strong>Si vous êtes à l'origine de cette demande</strong>, cliquez sur le bouton ci-dessous pour autoriser le changement :</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{ .ConfirmationURL }}" class="cta-button">
                    🔒 Oui, j'autorise ce changement
                </a>
            </div>
            
            <div class="warning-info">
                <p><strong>🚨 VOUS N'AVEZ PAS DEMANDÉ CE CHANGEMENT ?</strong></p>
                <p>Si vous n'êtes pas à l'origine de cette demande :</p>
                <ul>
                    <li><strong>NE CLIQUEZ PAS</strong> sur le bouton ci-dessus</li>
                    <li><strong>Ignorez cet email</strong> complètement</li>
                    <li><strong>Contactez immédiatement</strong> notre support</li>
                    <li><strong>Changez votre mot de passe</strong> par précaution</li>
                </ul>
            </div>
        </div>
        
        <div class="footer">
            <p>Cet email a été envoyé automatiquement pour sécuriser votre compte.<br>
            Si vous avez des questions, contactez notre équipe support.</p>
        </div>
    </div>
</body>
</html>`,

  'confirm-new-email-template': `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>✅ Validez votre nouvelle adresse email</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        body {
            font-family: 'Inter', sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #F4F4F1;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            overflow: hidden;
        }
        .header {
            background: #F4F4F1;
            color: #333;
            padding: 40px 30px;
            text-align: center;
        }
        .logo {
            width: 160px;
            height: auto;
            margin-bottom: 25px;
        }
        .header h1 {
            margin: 0;
            font-size: 26px;
            font-weight: 400;
            color: #333;
        }
        .content {
            padding: 40px 30px;
            background: white;
        }
        .welcome-header {
            background: #d1ecf1;
            padding: 20px;
            border-radius: 8px;
            margin: 25px 0;
            border-left: 4px solid #17a2b8;
            text-align: center;
        }
        .welcome-header h2 {
            margin: 0 0 10px 0;
            color: #0c5460;
            font-size: 20px;
        }
        .email-change-info {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 25px 0;
            border-left: 4px solid #FF592C;
        }
        .email-change-info .email-row {
            display: flex;
            align-items: center;
            margin: 10px 0;
            font-size: 14px;
        }
        .email-change-info .email-label {
            font-weight: 600;
            min-width: 120px;
            color: #495057;
        }
        .email-change-info .email-address {
            font-family: 'Courier New', monospace;
            background: white;
            padding: 8px 12px;
            border-radius: 4px;
            color: #FF592C;
            border: 1px solid #e9ecef;
        }
        .cta-button {
            display: inline-block !important;
            background: #28a745 !important;
            color: #ffffff !important;
            text-decoration: none !important;
            padding: 15px 35px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            padding: 25px;
            background: white;
            color: #6c757d;
            font-size: 14px;
            border-top: 1px solid #e9ecef;
        }
        .info-box {
            margin-top: 25px;
            padding: 15px;
            background: #e7f3ff;
            border-radius: 8px;
            font-size: 14px;
            color: #004085;
            border-left: 4px solid #007bff;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://cdn.prod.website-files.com/68b2fd357db03bbb045b95e1/68c5d9c555c56a4153719885_logo-long.svg" alt="Logo Aurentia" class="logo">
            <h1>✅ Validez votre nouvelle adresse</h1>
        </div>
        
        <div class="content">
            <div class="welcome-header">
                <h2>🎉 Bienvenue sur votre nouvelle adresse !</h2>
                <p style="margin: 0; font-weight: 500;">Dernière étape pour finaliser le changement</p>
            </div>
            
            <p style="font-size: 16px; margin-bottom: 25px;">
                Parfait ! Vous recevez cet email car une demande de changement d'adresse a été effectuée pour associer cette adresse à votre compte Aurentia.
            </p>
            
            <div class="email-change-info">
                <p style="margin-top: 0; font-weight: 600; color: #2c3e50;">Récapitulatif du changement :</p>
                <div class="email-row">
                    <span class="email-label">Ancienne adresse :</span>
                    <span class="email-address">{{ .OldEmail }}</span>
                </div>
                <div style="text-align: center; margin: 15px 0;">
                    <span style="color: #FF592C; font-size: 18px; font-weight: bold;">↓</span>
                </div>
                <div class="email-row">
                    <span class="email-label">Nouvelle adresse :</span>
                    <span class="email-address">{{ .NewEmail }}</span>
                </div>
            </div>
            
            <p>Pour finaliser ce changement et commencer à utiliser cette nouvelle adresse, cliquez sur le bouton ci-dessous :</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{ .ConfirmationURL }}" class="cta-button">
                    ✅ Oui, c'est bien ma nouvelle adresse
                </a>
            </div>
            
            <div class="info-box">
                <p><strong>ℹ️ Double validation requise</strong></p>
                <p>Pour des raisons de sécurité, l'ancienne adresse ET cette nouvelle adresse doivent toutes les deux confirmer le changement. Une fois que les deux confirmations sont effectuées, votre nouvelle adresse sera active !</p>
            </div>
        </div>
        
        <div class="footer">
            <p>Cet email a été envoyé automatiquement suite à votre demande.<br>
            Si vous avez des questions, contactez notre équipe support.</p>
        </div>
    </div>
</body>
</html>`,

  'password-reset-template': `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Réinitialisez votre mot de passe</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=BIZ+UDPMincho:wght@400;700&display=swap');
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #F4F4F1;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: #F4F4F1;
            padding: 30px;
        }
        .inner-container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            overflow: hidden;
        }
        .header {
            background: #F4F4F1;
            color: #333;
            padding: 40px 30px;
            text-align: center;
        }
        .logo {
            width: 160px;
            height: auto;
            margin-bottom: 25px;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 400;
            font-family: 'BIZ UDPMincho', serif;
            color: #333;
        }
        .content {
            padding: 40px 30px;
            background: white;
        }
        .welcome-text {
            font-size: 18px;
            margin-bottom: 25px;
            color: #2c3e50;
        }
        .cta-button {
            display: inline-block !important;
            background: #FF592C !important;
            color: #ffffff !important;
            text-decoration: none !important;
            padding: 15px 35px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            transition: all 0.3s ease;
            border: none;
        }
        .cta-button:hover {
            background: #e04a1f !important;
            color: #ffffff !important;
            transform: translateY(-1px);
        }
        .cta-button:visited {
            color: #ffffff !important;
        }
        .cta-button:active {
            color: #ffffff !important;
        }
        .footer {
            text-align: center;
            padding: 25px;
            background: white;
            color: #6c757d;
            font-size: 14px;
            border-top: 1px solid #e9ecef;
        }
        .security-info {
            margin-top: 25px;
            padding: 15px;
            background: #FFF1EE;
            border-radius: 8px;
            font-size: 14px;
            color: #FF5B3A;
        }
        .warning-info {
            margin-top: 25px;
            padding: 15px;
            background: #fff3cd;
            border-radius: 8px;
            font-size: 14px;
            color: #856404;
            border-left: 4px solid #ffc107;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="inner-container">
            <div class="header">
                <img src="https://cdn.prod.website-files.com/68b2fd357db03bbb045b95e1/68c5d9c555c56a4153719885_logo-long.svg" alt="Logo Aurentia" class="logo">
                <h1>Réinitialisez votre mot de passe</h1>
            </div>
            
            <div class="content">
                <p class="welcome-text">
                    Vous avez demandé à réinitialiser votre mot de passe sur Aurentia.
                </p>
                
                <p>
                    Pour créer un nouveau mot de passe et retrouver l'accès à votre compte, cliquez sur le bouton ci-dessous :
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{{ .ConfirmationURL }}" class="cta-button" style="color: #ffffff !important;">
                        🔑 Créer un nouveau mot de passe
                    </a>
                </div>
                
                <div class="warning-info">
                    <p><strong>⚠️ Vous n'avez pas demandé cette réinitialisation ?</strong></p>
                    <p>Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet email. Votre compte reste sécurisé et votre mot de passe actuel n'a pas été modifié.</p>
                </div>
                
                <div class="security-info">
                    <p><strong>🔒 Sécurité :</strong> Ce lien de réinitialisation est valable pendant 1 heure et ne peut être utilisé qu'une seule fois. Pour votre sécurité, utilisez un mot de passe fort contenant des lettres, chiffres et caractères spéciaux.</p>
                </div>
            </div>
            
            <div class="footer">
                <p>
                    Cet email a été envoyé automatiquement, merci de ne pas y répondre.<br>
                    Si vous avez des questions, contactez notre équipe support.
                </p>
            </div>
        </div>
    </div>
</body>
</html>`
};

function getTemplate(templateName: string): string {
  const template = templates[templateName as keyof typeof templates];
  if (!template) {
    throw new Error(`Template ${templateName} not found. Available templates: ${Object.keys(templates).join(', ')}`);
  }
  return template;
}

function applyTemplateData(template: string, data: Record<string, string>): string {
  let content = template;
  for (const key in data) {
    const regex = new RegExp(`{{ .${key} }}`, 'g');
    content = content.replace(regex, data[key]);
  }
  return content;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 })
  }

  try {
    const { to, subject, template, data } = await req.json();

    console.log(`Sending email to ${to} with template ${template}`);

    // Vérification des paramètres
    if (!to || !subject || !template || !data) {
      throw new Error('Missing required parameters: to, subject, template, or data');
    }

    const htmlTemplate = getTemplate(template);
    const htmlBody = applyTemplateData(htmlTemplate, data);
    
    const emailResponse = await resend.emails.send({
      from: "Aurentia <team@mail.aurentia.fr>",
      to: to,
      subject: subject,
      html: htmlBody,
    });

    console.log('Email sent successfully:', emailResponse);

    return new Response(JSON.stringify({ 
      message: "Email sent successfully",
      email_id: emailResponse.data?.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.stack 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
