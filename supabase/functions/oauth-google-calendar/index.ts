/**
 * Google OAuth Callback Handler
 *
 * This Edge Function handles OAuth 2.0 callbacks for Google services:
 * - Google Calendar
 * - Google Drive
 * - Gmail
 *
 * Flow:
 * 1. User clicks "Connect Google [Service]" in UI
 * 2. Frontend redirects to Google OAuth consent screen with appropriate scopes
 * 3. User authorizes the app
 * 4. Google redirects back to this function with authorization code
 * 5. This function exchanges code for access token + refresh token
 * 6. Tokens are encrypted and stored in integrations table
 * 7. User is redirected back to integrations page
 *
 * Environment Variables Required:
 * - GOOGLE_CLIENT_ID: OAuth client ID from Google Cloud Console
 * - GOOGLE_CLIENT_SECRET: OAuth client secret
 * - GOOGLE_REDIRECT_URI: This function's URL
 * - ENCRYPTION_KEY: Key for encrypting tokens
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_ENDPOINT = 'https://www.googleapis.com/oauth2/v2/userinfo';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    // Handle OAuth errors
    if (error) {
      console.error('[Google OAuth] Authorization error:', error);
      return new Response(
        JSON.stringify({
          error: 'authorization_failed',
          message: `Google authorization failed: ${error}`
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate required parameters
    if (!code || !state) {
      return new Response(
        JSON.stringify({
          error: 'invalid_request',
          message: 'Missing code or state parameter'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Parse state parameter (contains userId, organisationId, and integrationType)
    let stateData: {
      userId: string;
      organisationId?: string;
      redirectUrl: string;
      integrationType?: 'google_calendar' | 'google_drive' | 'gmail';
    };
    try {
      stateData = JSON.parse(atob(state));
    } catch {
      return new Response(
        JSON.stringify({
          error: 'invalid_state',
          message: 'Invalid state parameter'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Default to google_calendar if not specified (backward compatibility)
    const integrationType = stateData.integrationType || 'google_calendar';

    // Exchange authorization code for tokens
    const tokenResponse = await fetch(GOOGLE_TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: Deno.env.get('GOOGLE_CLIENT_ID')!,
        client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET')!,
        redirect_uri: Deno.env.get('GOOGLE_REDIRECT_URI')!,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('[Google OAuth] Token exchange failed:', errorData);
      return new Response(
        JSON.stringify({
          error: 'token_exchange_failed',
          message: 'Failed to exchange authorization code for tokens',
          details: errorData
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const tokens = await tokenResponse.json();
    const { access_token, refresh_token, expires_in, scope } = tokens;

    // Get user info from Google
    const userInfoResponse = await fetch(GOOGLE_USERINFO_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!userInfoResponse.ok) {
      console.error('[Google OAuth] Failed to fetch user info');
    }

    const userInfo = userInfoResponse.ok ? await userInfoResponse.json() : {};

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Encrypt credentials before storing
    const credentials = {
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresAt: new Date(Date.now() + expires_in * 1000).toISOString(),
      scope,
      email: userInfo.email,
    };

    // Use simple encryption (in production, use Supabase Vault)
    const encryptionKey = Deno.env.get('ENCRYPTION_KEY')!;
    const encryptedCredentials = await encryptCredentials(credentials, encryptionKey);

    // Prepare settings based on integration type
    let settings: any = {
      events: [], // User will configure which events to trigger this integration
    };

    if (integrationType === 'google_calendar') {
      settings.calendar_id = 'primary'; // Default to primary calendar
      settings.sync_enabled = true;
    } else if (integrationType === 'google_drive') {
      settings.sync_enabled = true;
      settings.auto_create_folders = true;
    } else if (integrationType === 'gmail') {
      settings.notification_enabled = true;
    }

    // Store integration in database
    const { data: integration, error: dbError } = await supabase
      .from('integrations')
      .insert({
        user_id: stateData.userId,
        organisation_id: stateData.organisationId || null,
        integration_type: integrationType,
        status: 'connected',
        credentials: encryptedCredentials,
        settings,
        connected_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (dbError) {
      console.error('[Google OAuth] Database error:', dbError);
      return new Response(
        JSON.stringify({
          error: 'database_error',
          message: 'Failed to store integration',
          details: dbError
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Redirect back to integrations page with success message
    const redirectUrl = stateData.redirectUrl || `${Deno.env.get('APP_URL')}/integrations`;
    return Response.redirect(`${redirectUrl}?integration=${integrationType}&status=success`, 302);

  } catch (error: any) {
    console.error('[Google OAuth] Unexpected error:', error);
    return new Response(
      JSON.stringify({
        error: 'internal_error',
        message: 'An unexpected error occurred',
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

/**
 * Encrypt credentials using AES-256-GCM
 * In production, migrate to Supabase Vault for better security
 */
async function encryptCredentials(credentials: any, key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify(credentials));

  // Import key
  const keyData = encoder.encode(key.padEnd(32, '0').slice(0, 32));
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );

  // Generate IV
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Encrypt
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    data
  );

  // Combine IV + encrypted data and encode as base64
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), iv.length);

  return btoa(String.fromCharCode(...combined));
}
