import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 })
  }

  try {
    const { token, new_password } = await req.json()
    
    if (!token || !new_password) {
      throw new Error('Token et nouveau mot de passe requis')
    }
    
    // Créer un client Supabase avec la clé service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Hasher le token entrant pour correspondre au hash stocké
    const encoder = new TextEncoder()
    const data = encoder.encode(token)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const token_hash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')

    // Chercher la demande de réinitialisation
    // On cherche les entrées avec confirmation_type 'single' qui correspondent à des resets
    const { data: request, error: requestError } = await supabaseAdmin
      .from('email_confirmations')
      .select('*')
      .eq('token_hash', token_hash)
      .eq('status', 'pending')
      .single()

    if (requestError || !request) {
      throw new Error("Le jeton de réinitialisation est invalide ou a expiré.")
    }

    // Vérifier que c'est bien une demande de reset (pas de old_email_token_hash/new_email_token_hash)
    if (request.old_email_token_hash || request.new_email_token_hash) {
      throw new Error("Ce token n'est pas valide pour une réinitialisation de mot de passe.")
    }

    // Vérifier si le token a expiré
    if (new Date(request.expires_at) < new Date()) {
      await supabaseAdmin.from('email_confirmations').update({ status: 'expired' }).eq('id', request.id)
      throw new Error("Le jeton de réinitialisation a expiré.")
    }

    // Mettre à jour le mot de passe de l'utilisateur
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      request.user_id,
      { password: new_password }
    )

    if (updateError) {
      throw new Error("Impossible de mettre à jour le mot de passe.")
    }

    // Marquer la demande comme confirmée
    await supabaseAdmin
      .from('email_confirmations')
      .update({ status: 'confirmed', confirmed_at: new Date().toISOString() })
      .eq('id', request.id)

    return new Response(JSON.stringify({ 
      message: "🎉 Votre mot de passe a été mis à jour avec succès ! Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.",
      status: "success"
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Error in confirm-password-reset:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
