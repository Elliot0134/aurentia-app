// Utilise SmtpClient pour envoyer des emails via le fournisseur SMTP configuré
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SendEmailRequest {
  to: string;
  subject: string;
  html: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { to, subject, html } = await req.json() as SendEmailRequest;

    const smtpHost = Deno.env.get('SMTP_HOST');
    const smtpPort = Deno.env.get('SMTP_PORT');
    const smtpUser = Deno.env.get('SMTP_USER');
    const smtpPass = Deno.env.get('SMTP_PASS'); // C'est votre clé API Resend
    const senderEmail = Deno.env.get('SENDER_EMAIL');

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPass || !senderEmail) {
      console.error('Erreur: Une ou plusieurs variables d\'environnement SMTP sont manquantes.');
      return new Response(
        JSON.stringify({ error: 'Configuration du serveur incomplète.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const client = new SmtpClient();
    await client.connect({
      hostname: smtpHost,
      port: parseInt(smtpPort),
      tls: true,
      auth: {
        username: smtpUser,
        password: smtpPass,
      },
    });

    await client.send({
      from: senderEmail,
      to: to,
      subject: subject,
      html: html,
    });

    await client.close();

    return new Response(JSON.stringify({ success: true, message: 'Email envoyé avec succès.' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erreur dans la fonction send-email:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
