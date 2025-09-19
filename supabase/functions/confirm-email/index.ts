declare global {
  namespace Deno {
    namespace env {
      function get(key: string): string | undefined;
    }
  }
}

import { serve } from 'https://deno.land/std@0.200.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.44.0'
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailConfirmationVerifyRequest {
  token: string;
  userAgent?: string;
}

serve(async (req) => {
  // Gérer les requêtes OPTIONS pour CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialiser Supabase client avec service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const method = req.method;
    const url = new URL(req.url);
    
    // Extraire le token depuis l'URL ou le body
    let token: string;
    let userAgent: string | undefined;

    if (method === 'GET') {
      token = url.searchParams.get('token') || '';
    } else if (method === 'POST') {
      const body: EmailConfirmationVerifyRequest = await req.json();
      token = body.token || '';
      userAgent = body.userAgent;
    } else {
      return new Response(
        JSON.stringify({ error: 'Méthode non autorisée' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Token requis' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Extraire l'adresse IP
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const finalUserAgent = userAgent || req.headers.get('user-agent') || 'unknown';

    // Hasher le token pour le chercher en base
    const tokenData = new TextEncoder().encode(token);
    const hashBuffer = await crypto.subtle.digest('SHA-256', tokenData);
    const tokenHash = Array.from(new Uint8Array(hashBuffer), byte => 
      byte.toString(16).padStart(2, '0')
    ).join('');

    // Rechercher le token en base
    const { data: confirmationData, error: fetchError } = await supabase
      .from('email_confirmations')
      .select('*')
      .eq('token_hash', tokenHash)
      .single();

    if (fetchError || !confirmationData) {
      // Logger la tentative échouée
      await supabase.from('email_confirmation_logs').insert({
        confirmation_id: null,
        user_id: null,
        action: 'failed',
        ip_address: clientIP,
        user_agent: finalUserAgent,
        success: false,
        error_message: 'Token invalide ou introuvable',
        metadata: { 
          token_hash_attempted: tokenHash.substring(0, 8) + '...',
          error_type: 'invalid_token'
        }
      });

      return new Response(
        JSON.stringify({ 
          error: 'Token de confirmation invalide',
          code: 'INVALID_TOKEN'
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Vérifier si le token a déjà été utilisé
    if (confirmationData.status === 'confirmed') {
      await supabase.from('email_confirmation_logs').insert({
        confirmation_id: confirmationData.id,
        user_id: confirmationData.user_id,
        action: 'failed',
        ip_address: clientIP,
        user_agent: finalUserAgent,
        success: false,
        error_message: 'Token déjà utilisé',
        metadata: { 
          error_type: 'already_confirmed',
          confirmed_at: confirmationData.confirmed_at
        }
      });

      return new Response(
        JSON.stringify({ 
          error: 'Email déjà confirmé',
          code: 'ALREADY_CONFIRMED',
          confirmedAt: confirmationData.confirmed_at
        }),
        { 
          status: 409, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Vérifier si le token a expiré
    const now = new Date();
    const expiresAt = new Date(confirmationData.expires_at);
    
    if (now > expiresAt) {
      // Marquer comme expiré
      await supabase
        .from('email_confirmations')
        .update({ 
          status: 'expired',
          updated_at: now.toISOString()
        })
        .eq('id', confirmationData.id);

      await supabase.from('email_confirmation_logs').insert({
        confirmation_id: confirmationData.id,
        user_id: confirmationData.user_id,
        action: 'expired',
        ip_address: clientIP,
        user_agent: finalUserAgent,
        success: false,
        error_message: 'Token expiré',
        metadata: { 
          error_type: 'expired',
          expires_at: confirmationData.expires_at,
          attempted_at: now.toISOString()
        }
      });

      return new Response(
        JSON.stringify({ 
          error: 'Token de confirmation expiré',
          code: 'TOKEN_EXPIRED',
          expiresAt: confirmationData.expires_at,
          email: confirmationData.email
        }),
        { 
          status: 410, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Vérifier si le statut est déjà failed ou cancelled
    if (['failed', 'cancelled'].includes(confirmationData.status)) {
      await supabase.from('email_confirmation_logs').insert({
        confirmation_id: confirmationData.id,
        user_id: confirmationData.user_id,
        action: 'failed',
        ip_address: clientIP,
        user_agent: finalUserAgent,
        success: false,
        error_message: `Token ${confirmationData.status}`,
        metadata: { 
          error_type: 'invalid_status',
          current_status: confirmationData.status
        }
      });

      return new Response(
        JSON.stringify({ 
          error: 'Token de confirmation invalide',
          code: 'INVALID_TOKEN',
          status: confirmationData.status
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const startTime = Date.now();

    // Logger le clic sur le lien
    await supabase.from('email_confirmation_logs').insert({
      confirmation_id: confirmationData.id,
      user_id: confirmationData.user_id,
      action: 'clicked',
      ip_address: clientIP,
      user_agent: finalUserAgent,
      success: true,
      metadata: { 
        clicked_at: now.toISOString(),
        method: req.method
      }
    });

    // Transaction : confirmer le token et mettre à jour le profil utilisateur
    try {
      // 1. Marquer la confirmation comme réussie
      const { error: updateConfirmationError } = await supabase
        .from('email_confirmations')
        .update({ 
          status: 'confirmed',
          confirmed_at: now.toISOString(),
          updated_at: now.toISOString()
        })
        .eq('id', confirmationData.id);

      if (updateConfirmationError) {
        throw new Error(`Erreur confirmation update: ${updateConfirmationError.message}`);
      }

      // 2. Mettre à jour le profil utilisateur si user_id existe
      if (confirmationData.user_id) {
        const { error: updateProfileError } = await supabase
          .from('profiles')
          .update({ 
            email_confirmed_at: now.toISOString(),
            email_confirmation_required: false
          })
          .eq('id', confirmationData.user_id);

        if (updateProfileError) {
          console.warn('Erreur mise à jour profil:', updateProfileError);
          // Ne pas faire échouer la confirmation pour ça
        }

        // Mettre à jour les métadonnées auth user si possible
        const { error: updateUserError } = await supabase.auth.admin.updateUserById(
          confirmationData.user_id,
          { 
            email_confirm: true,
            user_metadata: {
              ...confirmationData.user_id.user_metadata || {},
              email_confirmed_at: now.toISOString()
            }
          }
        );

        if (updateUserError) {
          console.warn('Erreur mise à jour auth user:', updateUserError);
        }
      }

      const responseTime = Date.now() - startTime;

      // Logger le succès
      await supabase.from('email_confirmation_logs').insert({
        confirmation_id: confirmationData.id,
        user_id: confirmationData.user_id,
        action: 'confirmed',
        ip_address: clientIP,
        user_agent: finalUserAgent,
        success: true,
        response_time_ms: responseTime,
        metadata: { 
          confirmed_at: now.toISOString(),
          email: confirmationData.email
        }
      });

      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Email confirmé avec succès',
          confirmedAt: now.toISOString(),
          email: confirmationData.email,
          userId: confirmationData.user_id
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );

    } catch (transactionError) {
      console.error('Erreur transaction confirmation:', transactionError);
      
      // Rollback : remettre le token en pending
      await supabase
        .from('email_confirmations')
        .update({ 
          status: 'pending',
          updated_at: now.toISOString()
        })
        .eq('id', confirmationData.id);

      const responseTime = Date.now() - startTime;

      // Logger l'échec
      await supabase.from('email_confirmation_logs').insert({
        confirmation_id: confirmationData.id,
        user_id: confirmationData.user_id,
        action: 'failed',
        ip_address: clientIP,
        user_agent: finalUserAgent,
        success: false,
        response_time_ms: responseTime,
        error_message: transactionError.message,
        metadata: { 
          error_type: 'transaction_failed',
          attempted_at: now.toISOString()
        }
      });

      return new Response(
        JSON.stringify({ 
          error: 'Erreur lors de la confirmation',
          code: 'CONFIRMATION_FAILED'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

  } catch (error) {
    console.error('Erreur générale:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erreur interne du serveur',
        code: 'INTERNAL_ERROR',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
