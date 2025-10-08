declare global {
  namespace Deno {
    namespace env {
      function get(key: string): string | undefined;
    }
  }
}

import { serve } from 'https://deno.land/std@0.200.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.44.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AuthHookRequest {
  type: 'signup' | 'email_change' | 'magiclink' | 'recovery';
  user: { id: string; email: string; };
  data: { [key: string]: any; }
}

interface DirectApiRequest {
  email: string;
  userId?: string;
  userAgent?: string;
}

async function sendEmail(to: string, subject: string, html: string) {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  const senderEmail = Deno.env.get('SENDER_EMAIL');
  if (!resendApiKey || !senderEmail) {
    throw new Error('Variables d\'environnement RESEND_API_KEY ou SENDER_EMAIL manquantes.');
  }
    const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({ from: senderEmail, to: [to], subject, html }),
    });
    if (!res.ok) {
        let errorBody;
        try {
            errorBody = await res.json();
        } catch (jsonError) {
            errorBody = { message: await res.text() };
        }
        throw new Error(`Erreur de l'API Resend: ${errorBody.message || 'Envoi échoué'}`);
    }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  try {
    const hookSecret = Deno.env.get('AUTH_HOOK_SECRET');
    const signature = req.headers.get('Authorization');
    const isHookCall = hookSecret && signature === `Bearer ${hookSecret}`;
    const body = await req.json();

    if (isHookCall) {
      // Gère les appels sécurisés par le hook Auth de Supabase
      const { type, user, data } = body as AuthHookRequest;
      let subject = '';
      let emailHtml = '';
      let toEmail = user.email;

      switch (type) {
        case 'signup':
          subject = 'Confirmez votre adresse email';
          emailHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmez votre email</title>
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
    </style>
</head>
<body>
    <div class="container">
        <div class="inner-container">
            <div class="header">
                <img src="https://cdn.prod.website-files.com/68b2fd357db03bbb045b95e1/68c5d9c555c56a4153719885_logo-long.svg" alt="Logo Aurentia" class="logo">
                <h1>Confirmez votre email</h1>
            </div>
            
            <div class="content">
                <p class="welcome-text">
                    Merci de vous être inscrit(e) ! Il ne reste plus qu'une étape pour activer votre compte.
                </p>
                
                <p>
                    Pour confirmer votre adresse email et finaliser votre inscription, cliquez simplement sur le bouton ci-dessous :
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${data.ConfirmationURL}" class="cta-button" style="color: #ffffff !important;">
                        ✓ Confirmer mon inscription
                    </a>
                </div>
                
                <div class="security-info">
                    <p><strong>🔒 Sécurité :</strong> Ce lien de confirmation est valable pendant 24 heures et ne peut être utilisé qu'une seule fois. Si vous n'avez pas demandé cette inscription, vous pouvez ignorer cet email en toute sécurité.</p>
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
</html>`;
          break;

        case 'email_change':
          subject = 'Confirmez votre changement d\'email';
          toEmail = data.NewEmail;
          emailHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmez votre changement d'email</title>
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
        .arrow {
            margin: 0 15px;
            color: #FF592C;
            font-size: 18px;
            font-weight: bold;
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
                <h1>Confirmez votre changement d'email</h1>
            </div>
            
            <div class="content">
                <p class="welcome-text">
                    Vous avez demandé à modifier l'adresse email associée à votre compte Aurentia.
                </p>
                
                <div class="email-change-info">
                    <p style="margin-top: 0; font-weight: 600; color: #2c3e50;">Résumé du changement :</p>
                    <div class="email-row">
                        <span class="email-label">Ancienne adresse :</span>
                        <span class="email-address">${data.Email}</span>
                    </div>
                    <div style="text-align: center; margin: 15px 0;">
                        <span class="arrow">↓</span>
                    </div>
                    <div class="email-row">
                        <span class="email-label">Nouvelle adresse :</span>
                        <span class="email-address">${data.NewEmail}</span>
                    </div>
                </div>
                
                <p>
                    Pour confirmer ce changement et mettre à jour votre adresse email, cliquez sur le bouton ci-dessous :
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${data.ConfirmationURL}" class="cta-button" style="color: #ffffff !important;">
                        ✓ Confirmer le changement d'email
                    </a>
                </div>
                
                <div class="warning-info">
                    <p><strong>⚠️ Vous n'avez pas demandé ce changement ?</strong></p>
                    <p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet email et contactez immédiatement notre support. Votre adresse email actuelle restera inchangée.</p>
                </div>
                
                <div class="security-info">
                    <p><strong>🔒 Sécurité :</strong> Ce lien de confirmation est valable pendant 24 heures et ne peut être utilisé qu'une seule fois. Une fois confirmé, vous devrez utiliser votre nouvelle adresse email pour vous connecter à Aurentia.</p>
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
</html>`;
          break;

        default:
          console.warn(`Email type "${type}" non géré.`);
          return new Response(JSON.stringify({ success: true, message: 'Type d\'email non géré.' }), { status: 200 });
      }
      await sendEmail(toEmail, subject, emailHtml);
      console.log(`Email via hook envoyé à: ${toEmail}`);
      
    } else {
      // Gère les appels directs depuis le client (ex: inscription initiale, renvoi)
      const { email, userId, userAgent } = body as DirectApiRequest;
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      const siteUrl = Deno.env.get('SITE_URL');

      if (!supabaseUrl || !serviceRoleKey || !siteUrl || !email) {
        throw new Error('Variables d\'environnement ou email manquants.');
      }

      const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
      
      const { data: existingConfirmations, error: fetchError } = await supabase
        .from('email_confirmations')
        .select('id, created_at, attempts, max_attempts, last_sent_at')
        .eq('email', email)
        .order('created_at', { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      const lastConfirmation = existingConfirmations?.[0];
      const now = new Date();
      
      // Rate limiting configuration - can be disabled for testing
      const DISABLE_RATE_LIMIT = true; // Disable rate limiting for testing purposes
      const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
      const MAX_ATTEMPTS_PER_WINDOW = 60; // Increased to 60 attempts per hour

      console.log('[send-confirmation-email] Rate limit check:', {
        DISABLE_RATE_LIMIT,
        lastConfirmation: lastConfirmation ? 'exists' : 'none',
        attempts: lastConfirmation?.attempts
      });
      
      if (!DISABLE_RATE_LIMIT && lastConfirmation) {
        const lastSentAt = new Date(lastConfirmation.last_sent_at || lastConfirmation.created_at);
        const timeSinceLastSend = now.getTime() - lastSentAt.getTime();

        if (timeSinceLastSend < RATE_LIMIT_WINDOW_MS && lastConfirmation.attempts >= MAX_ATTEMPTS_PER_WINDOW) {
          const retryAfter = Math.ceil((RATE_LIMIT_WINDOW_MS - timeSinceLastSend) / 1000);
          return new Response(JSON.stringify({ success: false, error: 'Limite de taux atteinte.', retryAfter }), { status: 429 });
        }
      }

      const token = crypto.randomUUID();
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
      const redirectToUrl = `${siteUrl}/login`;
      // Use custom confirm-email edge function instead of Supabase's built-in auth endpoint
      const confirmUrl = `${supabaseUrl}/functions/v1/confirm-email?token=${token}`;
      
      // Hash the token before storing it in the database
      const tokenData = new TextEncoder().encode(token);
      const hashBuffer = await crypto.subtle.digest('SHA-256', tokenData);
      const tokenHash = Array.from(new Uint8Array(hashBuffer), byte => 
        byte.toString(16).padStart(2, '0')
      ).join('');
      
      if (lastConfirmation && (now.getTime() - new Date(lastConfirmation.last_sent_at || lastConfirmation.created_at).getTime()) < RATE_LIMIT_WINDOW_MS) {
        await supabase.from('email_confirmations').update({ 
          token_hash: tokenHash, 
          expires_at: expiresAt, 
          status: 'pending', 
          attempts: lastConfirmation.attempts + 1, 
          last_sent_at: now.toISOString() 
        }).eq('id', lastConfirmation.id);
      } else {
        await supabase.from('email_confirmations').insert({ 
          user_id: userId, 
          email: email, 
          token_hash: tokenHash, 
          expires_at: expiresAt, 
          status: 'pending', 
          attempts: 1, 
          last_sent_at: now.toISOString(), 
          user_agent: userAgent 
        });
      }

      const emailHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmez votre email</title>
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
    </style>
</head>
<body>
    <div class="container">
        <div class="inner-container">
            <div class="header">
                <img src="https://cdn.prod.website-files.com/68b2fd357db03bbb045b95e1/68c5d9c555c56a4153719885_logo-long.svg" alt="Logo Aurentia" class="logo">
                <h1>Confirmez votre email</h1>
            </div>
            
            <div class="content">
                <p class="welcome-text">
                    Merci de vous être inscrit(e) ! Il ne reste plus qu'une étape pour activer votre compte.
                </p>
                
                <p>
                    Pour confirmer votre adresse email et finaliser votre inscription, cliquez simplement sur le bouton ci-dessous :
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${confirmUrl}" class="cta-button" style="color: #ffffff !important;">
                        ✓ Confirmer mon inscription
                    </a>
                </div>
                
                <div class="security-info">
                    <p><strong>🔒 Sécurité :</strong> Ce lien de confirmation est valable pendant 24 heures et ne peut être utilisé qu'une seule fois. Si vous n'avez pas demandé cette inscription, vous pouvez ignorer cet email en toute sécurité.</p>
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
</html>`;
      await sendEmail(email, 'Confirmez votre adresse email', emailHtml);
      console.log(`Email direct envoyé avec succès à: ${email}`);
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
  } catch (error) {
    console.error('Erreur dans send-confirmation-email:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
  }
});
