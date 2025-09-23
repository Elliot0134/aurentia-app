import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🔔 Webhook reçu')
    const body = await req.text()
    console.log('📦 Body:', body)
    
    const event = JSON.parse(body)
    console.log('📋 Event type:', event.type)
    
    // Traiter seulement les paiements réussis
    if (event.type !== 'invoice.payment_succeeded') {
      console.log('⚠️ Événement ignoré:', event.type)
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    const invoice = event.data.object
    const customer_email = invoice.customer_email
    const stripe_customer_id = invoice.customer
    
    console.log('📧 Email:', customer_email)
    console.log('👤 Customer ID:', stripe_customer_id)
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    let user_id = null

    // 1. Chercher par stripe_customer_id d'abord
    if (stripe_customer_id) {
      const { data: customer } = await supabase
        .from('stripe_customers')
        .select('user_id')
        .eq('stripe_customer_id', stripe_customer_id)
        .single()
      
      if (customer) {
        user_id = customer.user_id
      }
    }

    // 2. Fallback sur email si pas trouvé
    if (!user_id && customer_email) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', customer_email)
        .single()
      
      if (profile) {
        user_id = profile.id
        
        // Créer la liaison stripe_customer si elle n'existe pas
        if (stripe_customer_id) {
          await supabase
            .from('stripe_customers')
            .upsert({
              stripe_customer_id,
              user_id,
              email: customer_email
            })
        }
      }
    }

    if (!user_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'User not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Mettre à jour les crédits
    await supabase
      .from('profiles')
      .update({
        monthly_credits_remaining: 1500,
        monthly_credits_limit: 1500,
        subscription_status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', user_id)

    return new Response(
      JSON.stringify({ 
        success: true, 
        user_id: user_id,
        credits_added: 1500 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
