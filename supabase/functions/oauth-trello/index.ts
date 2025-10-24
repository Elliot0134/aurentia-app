/**
 * Trello OAuth Callback Handler
 *
 * This Edge Function handles the OAuth 1.0a callback from Trello.
 *
 * Flow:
 * 1. User clicks "Connect Trello" in UI
 * 2. Frontend redirects to Trello OAuth authorization page
 * 3. User authorizes the app
 * 4. Trello redirects back to this function with oauth_token and oauth_verifier
 * 5. This function exchanges these for permanent access token
 * 6. Token is encrypted and stored in integrations table
 * 7. User is redirected back to integrations page
 *
 * Environment Variables Required:
 * - TRELLO_API_KEY: API key from Trello Power-Up admin
 * - TRELLO_API_SECRET: API secret (for OAuth 1.0a)
 * - TRELLO_REDIRECT_URI: This function's URL
 * - ENCRYPTION_KEY: Key for encrypting tokens
 *
 * Note: Trello uses OAuth 1.0a, which is simpler than OAuth 2.0
 * but requires HMAC-SHA1 signatures for requests.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

const TRELLO_API_BASE = 'https://api.trello.com/1';

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
    const oauth_token = url.searchParams.get('oauth_token');
    const oauth_verifier = url.searchParams.get('oauth_verifier');
    const state = url.searchParams.get('state');

    // Validate required parameters
    if (!oauth_token || !oauth_verifier || !state) {
      return new Response(
        JSON.stringify({
          error: 'invalid_request',
          message: 'Missing oauth_token, oauth_verifier, or state parameter'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Parse state parameter (contains userId and organisationId)
    let stateData: { userId: string; organisationId?: string; redirectUrl: string };
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

    // For Trello, the oauth_token we receive IS the permanent token
    // We just need to verify it's valid by making a test API call
    const apiKey = Deno.env.get('TRELLO_API_KEY')!;

    // Test the token by fetching user's boards
    const testResponse = await fetch(
      `${TRELLO_API_BASE}/members/me?key=${apiKey}&token=${oauth_token}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!testResponse.ok) {
      console.error('[Trello OAuth] Token validation failed');
      return new Response(
        JSON.stringify({
          error: 'invalid_token',
          message: 'Failed to validate Trello token'
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const userInfo = await testResponse.json();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Encrypt credentials before storing
    const credentials = {
      apiKey,
      token: oauth_token,
      userId: userInfo.id,
      username: userInfo.username,
      fullName: userInfo.fullName,
    };

    // Use simple encryption (in production, use Supabase Vault)
    const encryptionKey = Deno.env.get('ENCRYPTION_KEY')!;
    const encryptedCredentials = await encryptCredentials(credentials, encryptionKey);

    // Store integration in database
    const { data: integration, error: dbError } = await supabase
      .from('integrations')
      .insert({
        user_id: stateData.userId,
        organisation_id: stateData.organisationId || null,
        integration_type: 'trello',
        status: 'connected',
        credentials: encryptedCredentials,
        settings: {
          events: [], // User will configure which events to sync
          board_id: null, // User will select board to sync with
          sync_enabled: true,
          create_cards_for: ['deliverable.submitted'], // Default: create Trello cards for submitted deliverables
        },
        connected_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (dbError) {
      console.error('[Trello OAuth] Database error:', dbError);
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
    return Response.redirect(`${redirectUrl}?integration=trello&status=success`, 302);

  } catch (error: any) {
    console.error('[Trello OAuth] Unexpected error:', error);
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
