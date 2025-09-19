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

interface EmailConfirmationRequest {
  email: string;
  userId?: string;
  isResend?: boolean;
  userAgent?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const siteUrl = Deno.env.get('SITE_URL');

    if (!supabaseUrl || !serviceRoleKey || !siteUrl) {
      throw new Error('Variables d\'environnement Supabase manquantes.');
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const { email, userId, isResend, userAgent } = await req.json() as EmailConfirmationRequest;

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email manquant.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // --- Logique de limite de taux (inchangée) ---
    const { data: existingConfirmations, error: fetchError } = await supabase
      .from('email_confirmations')
      .select('id, created_at, attempts, max_attempts, last_sent_at')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1);

    if (fetchError) throw fetchError;

    const lastConfirmation = existingConfirmations?.[0];
    const now = new Date();
    const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
    const MAX_ATTEMPTS_PER_WINDOW = 5;
    let timeSinceLastSend = 0;

    if (lastConfirmation) {
      const lastSentAt = new Date(lastConfirmation.last_sent_at || lastConfirmation.created_at);
      timeSinceLastSend = now.getTime() - lastSentAt.getTime();
      if (timeSinceLastSend < RATE_LIMIT_WINDOW_MS && lastConfirmation.attempts >= MAX_ATTEMPTS_PER_WINDOW) {
        const retryAfter = Math.ceil((RATE_LIMIT_WINDOW_MS - timeSinceLastSend) / 1000);
        return new Response(JSON.stringify({ success: false, error: 'Limite de taux atteinte.', retryAfter }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    // --- Logique de création/mise à jour de token (inchangée) ---
    const token = crypto.randomUUID();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
    let confirmationId: string;

    if (lastConfirmation && timeSinceLastSend < RATE_LIMIT_WINDOW_MS) {
      const { data: updated, error } = await supabase.from('email_confirmations').update({ token_hash: token, expires_at: expiresAt, status: 'pending', attempts: lastConfirmation.attempts + 1, last_sent_at: now.toISOString() }).eq('id', lastConfirmation.id).select().single();
      if (error) throw error;
      confirmationId = updated.id;
    } else {
      const { data: created, error } = await supabase.from('email_confirmations').insert({ user_id: userId, email: email, token_hash: token, expires_at: expiresAt, status: 'pending', attempts: 1, last_sent_at: now.toISOString(), user_agent: userAgent }).select().single();
      if (error) throw error;
      confirmationId = created.id;
    }

    // --- LOGIQUE D'ENVOI D'EMAIL VIA L'API RESEND (HTTP) ---
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const senderEmail = Deno.env.get('SENDER_EMAIL');

    if (!resendApiKey || !senderEmail) {
      throw new Error('Variables d\'environnement RESEND_API_KEY ou SENDER_EMAIL manquantes.');
    }

    const supabaseApiUrl = Deno.env.get('SUPABASE_URL');
    const redirectToUrl = `${siteUrl}/login`; // Rediriger vers la page de connexion après confirmation
    const confirmUrl = `${supabaseApiUrl}/auth/v1/verify?token=${token}&type=signup&redirect_to=${encodeURIComponent(redirectToUrl)}`;
    console.log('Confirmation URL:', confirmUrl); // Ajout du console.log pour le débogage
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
            border-top-left-radius: 12px;
            border-top-right-radius: 12px;
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
        .instruction-text {
            font-size: 18px; /* Augmenté de 2px par rapport à la taille par défaut de 16px */
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
                <img src="https://llcliurrrrxnkquwmwsi.supabase.co/storage/v1/object/public/DESIGN/Aurentia%20logo%20(1800%20x%204000%20px).png" alt="Logo Aurentia" class="logo">
                <h1>Confirmez votre email</h1>
            </div>
            
            <div class="content">
                <p class="welcome-text">
                    Merci de vous être inscrit(e) ! Il ne reste plus qu'une étape pour activer votre compte.
                </p>
                
                <p class="instruction-text">
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

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: senderEmail,
        to: [email],
        subject: 'Confirmez votre adresse email',
        html: emailHtml,
      }),
    });

    if (!resendResponse.ok) {
      const errorBody = await resendResponse.json();
      console.error('Resend API error:', errorBody);
      throw new Error(`Erreur de l'API Resend: ${errorBody.message || 'Envoi échoué'}`);
    }
    // --- FIN DE LA LOGIQUE D'ENVOI ---

    console.log('Email de confirmation envoyé avec succès à:', email);

    return new Response(JSON.stringify({ success: true, message: 'Email de confirmation envoyé.' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erreur dans send-confirmation-email:', error);
    // Mettre à jour le statut en 'failed' en cas d'erreur d'envoi
    // Note: confirmationId pourrait ne pas être défini si l'erreur se produit avant
    // Vous pourriez vouloir ajouter une logique pour gérer ce cas
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
