import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 })
  }

  try {
    const { token, type } = await req.json()
    
    if (!token || !type || !['old', 'new'].includes(type)) {
      throw new Error('Token et type (old/new) requis')
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

    // Chercher la demande de changement basée sur le type de token
    const tokenColumn = type === 'old' ? 'old_email_token_hash' : 'new_email_token_hash'
    
    const { data: request, error: requestError } = await supabaseAdmin
      .from('email_confirmations')
      .select('*')
      .eq(tokenColumn, token_hash)
      .eq('confirmation_type', 'double')
      .eq('status', 'pending')
      .single()

    if (requestError || !request) {
      throw new Error("Le jeton de confirmation est invalide ou a expiré.")
    }

    // Vérifier si le token a expiré
    if (new Date(request.expires_at) < new Date()) {
      await supabaseAdmin.from('email_confirmations').update({ status: 'expired' }).eq('id', request.id)
      throw new Error("Le jeton de confirmation a expiré.")
    }

    // Marquer cette confirmation comme effectuée
    const updateField = type === 'old' ? 'old_email_confirmed_at' : 'new_email_confirmed_at'
    const { error: updateError } = await supabaseAdmin
      .from('email_confirmations')
      .update({ [updateField]: new Date().toISOString() })
      .eq('id', request.id)

    if (updateError) throw updateError

    // Récupérer la demande mise à jour pour vérifier si les deux confirmations sont faites
    const { data: updatedRequest, error: fetchError } = await supabaseAdmin
      .from('email_confirmations')
      .select('*')
      .eq('id', request.id)
      .single()

    if (fetchError) throw fetchError

    const bothConfirmed = updatedRequest.old_email_confirmed_at && updatedRequest.new_email_confirmed_at

    if (bothConfirmed) {
      // Les deux confirmations sont faites, on peut mettre à jour l'email dans Supabase Auth
      const { error: updateUserError } = await supabaseAdmin.auth.admin.updateUserById(
        updatedRequest.user_id,
        { email: updatedRequest.email }
      )

      if (updateUserError) {
        throw new Error("Impossible de mettre à jour l'adresse e-mail dans le système d'authentification.")
      }

      // Marquer la demande comme confirmée
      await supabaseAdmin
        .from('email_confirmations')
        .update({ status: 'confirmed', confirmed_at: new Date().toISOString() })
        .eq('id', updatedRequest.id)

      return new Response(JSON.stringify({ 
        message: "🎉 Parfait ! Votre adresse e-mail a été mise à jour avec succès. Les deux confirmations ont été effectuées.",
        status: "completed",
        both_confirmed: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    } else {
      // Une seule confirmation effectuée, on attend l'autre
      const waitingFor = type === 'old' ? 'nouvelle adresse' : 'ancienne adresse'
      
      return new Response(JSON.stringify({ 
        message: `✅ Confirmation reçue ! En attente de la validation de l'${waitingFor}. Une fois que les deux adresses auront confirmé, votre changement d'email sera effectif.`,
        status: "partial",
        both_confirmed: false,
        confirmed_type: type,
        waiting_for: waitingFor
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }
  } catch (error) {
    console.error('Error in confirm-email-update:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
