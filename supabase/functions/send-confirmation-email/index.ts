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

    const confirmUrl = `${siteUrl}/confirm-email?token=${token}`;
    const emailHtml = `<p>Bonjour,</p><p>Veuillez confirmer votre adresse email en cliquant sur le lien ci-dessous:</p><p><a href="${confirmUrl}">Confirmer mon email</a></p><p>Ce lien expirera dans 24 heures.</p>`;

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
