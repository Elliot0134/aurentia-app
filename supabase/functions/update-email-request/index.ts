import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 })
  }

  try {
    console.log('=== UPDATE EMAIL REQUEST START ===')
    
    // 1. Parse request body
    let body;
    try {
      body = await req.json()
      console.log('Request body parsed:', { has_new_email: !!body.new_email })
    } catch (e) {
      console.error('Failed to parse request body:', e)
      throw new Error('Invalid JSON in request body')
    }

    const { new_email } = body
    if (!new_email) {
      throw new Error('new_email is required')
    }
    console.log('New email provided:', new_email)

    // 2. Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
    const authHeader = req.headers.get('Authorization')
    
    console.log('Environment check:', {
      has_url: !!supabaseUrl,
      has_anon_key: !!supabaseAnonKey,
      has_auth: !!authHeader
    })

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables')
    }

    const supabaseClient = createClient(
      supabaseUrl,
      supabaseAnonKey,
      { global: { headers: { Authorization: authHeader! } } }
    )

    // 3. Get user
    console.log('Getting user...')
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError) {
      console.error('User error:', userError)
      throw userError
    }
    if (!user) {
      throw new Error('User not found')
    }
    console.log('User found:', { id: user.id, email: user.email })

    // 4. Generate tokens
    console.log('Generating tokens...')
    const oldEmailToken = crypto.randomUUID()
    const newEmailToken = crypto.randomUUID()
    const expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000)

    // 5. Hash tokens
    console.log('Hashing tokens...')
    const encoder = new TextEncoder()
    
    const oldEmailData = encoder.encode(oldEmailToken)
    const oldEmailHashBuffer = await crypto.subtle.digest('SHA-256', oldEmailData)
    const oldEmailHashArray = Array.from(new Uint8Array(oldEmailHashBuffer))
    const old_email_token_hash = oldEmailHashArray.map((b) => b.toString(16).padStart(2, '0')).join('')

    const newEmailData = encoder.encode(newEmailToken)
    const newEmailHashBuffer = await crypto.subtle.digest('SHA-256', newEmailData)
    const newEmailHashArray = Array.from(new Uint8Array(newEmailHashBuffer))
    const new_email_token_hash = newEmailHashArray.map((b) => b.toString(16).padStart(2, '0')).join('')

    console.log('Tokens hashed successfully')

    // 6. Insert into database
    console.log('Inserting into database...')
    const insertData = {
      user_id: user.id,
      email: new_email,
      token_hash: old_email_token_hash, // Pour compatibilité avec l'ancienne structure
      old_email_token_hash,
      new_email_token_hash,
      expires_at: expires_at.toISOString(),
      status: 'pending',
      confirmation_type: 'double'
    }
    console.log('Insert data:', insertData)

    const { error: insertError } = await supabaseClient
      .from('email_confirmations')
      .insert(insertData)

    if (insertError) {
      console.error('Insert error:', insertError)
      throw insertError
    }
    console.log('Database insert successful')

    // 7. Generate URLs
    const siteUrl = Deno.env.get('SITE_URL')
    console.log('Site URL:', siteUrl)
    
    const oldEmailConfirmationUrl = `${siteUrl}/update-email-confirm?token=${oldEmailToken}&type=old`
    const newEmailConfirmationUrl = `${siteUrl}/update-email-confirm?token=${newEmailToken}&type=new`

    // 8. Send emails
    console.log('Sending email to old address:', user.email)
    const { error: oldEmailError } = await supabaseClient.functions.invoke('send-email', {
      body: {
        to: user.email,
        subject: "🔒 Confirmez la demande de changement d'email Aurentia",
        template: 'confirm-old-email-template',
        data: {
          OldEmail: user.email,
          NewEmail: new_email,
          ConfirmationURL: oldEmailConfirmationUrl,
        },
      },
    })

    if (oldEmailError) {
      console.error('Old email error:', oldEmailError)
      throw oldEmailError
    }
    console.log('Old email sent successfully')

    console.log('Sending email to new address:', new_email)
    const { error: newEmailError } = await supabaseClient.functions.invoke('send-email', {
      body: {
        to: new_email,
        subject: "✅ Validez votre nouvelle adresse email Aurentia",
        template: 'confirm-new-email-template',
        data: {
          OldEmail: user.email,
          NewEmail: new_email,
          ConfirmationURL: newEmailConfirmationUrl,
        },
      },
    })

    if (newEmailError) {
      console.error('New email error:', newEmailError)
      throw newEmailError
    }
    console.log('New email sent successfully')

    console.log('=== UPDATE EMAIL REQUEST SUCCESS ===')
    return new Response(JSON.stringify({ 
      message: "Des e-mails de confirmation ont été envoyés à votre ancienne ET nouvelle adresse. Vous devez confirmer dans les DEUX emails pour finaliser le changement." 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('=== UPDATE EMAIL REQUEST ERROR ===')
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.stack
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
