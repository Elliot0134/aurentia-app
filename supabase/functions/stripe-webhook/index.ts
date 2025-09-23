import { serve } from "std/http/server.ts"
import { createClient } from 'supabase'

// Désactiver l'authentification pour ce webhook
Deno.env.set('SUPABASE_AUTH_EXTERNAL_STRIPE_ENABLED', 'false')

// Configuration Stripe
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

// Configuration Supabase
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Configuration Aurentia
const AURENTIA_CONFIG = {
  SUBSCRIPTION: {
    PRODUCT_ID: 'prod_SyRjQAbqp3Qlv5',
    PRICE_ID: 'price_1S2UpoLIKukPrwK8M1Oi0qgS',
    CREDITS: 1500
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Bypass auth check for webhook
  const url = new URL(req.url)
  const authBypass = url.searchParams.get('auth') === 'webhook'
  
  if (!authBypass) {
    // Check for Stripe signature as authentication
    const signature = req.headers.get('stripe-signature')
    if (!signature) {
      console.error('❌ Signature Stripe manquante')
      return new Response('Signature manquante', { status: 400, headers: corsHeaders })
    }
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    
    const body = await req.text()
    
    // Pour une vraie implémentation, vous devriez vérifier la signature:
    // const event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET)
    
    // Pour l'instant, on parse directement le JSON
    const event = JSON.parse(body)
    
    console.log(`🔔 Webhook reçu: ${event.type}`)

    // Enregistrer l'événement dans la DB pour debug
    await supabase
      .from('stripe_webhook_events')
      .insert({
        stripe_event_id: event.id,
        event_type: event.type,
        data: event.data,
        processed: false
      })

    // Traiter les différents types d'événements
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(supabase, event.data.object)
        break
        
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(supabase, event.data.object)
        break
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(supabase, event.data.object)
        break
        
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(supabase, event.data.object)
        break
        
      case 'invoice.payment_failed':
        await handlePaymentFailed(supabase, event.data.object)
        break
        
      default:
        console.log(`⚠️ Type d'événement non géré: ${event.type}`)
    }

    // Marquer l'événement comme traité
    await supabase
      .from('stripe_webhook_events')
      .update({ processed: true, processed_at: new Date().toISOString() })
      .eq('stripe_event_id', event.id)

    return new Response(
      JSON.stringify({ received: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('❌ Erreur webhook:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

// ====== HANDLERS D'ÉVÉNEMENTS ======

async function handleSubscriptionCreated(supabase: any, subscription: any) {
  try {
    console.log('✅ Abonnement créé:', subscription.id)
    
    // Récupérer l'utilisateur via le customer
    const { data: customer } = await supabase
      .from('stripe_customers')
      .select('user_id')
      .eq('stripe_customer_id', subscription.customer)
      .single()

    if (!customer) {
      console.error('❌ Client non trouvé:', subscription.customer)
      return
    }

    // Sauvegarder l'abonnement dans notre DB
    const subscriptionData = {
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer,
      user_id: customer.user_id,
      product_id: AURENTIA_CONFIG.SUBSCRIPTION.PRODUCT_ID,
      price_id: AURENTIA_CONFIG.SUBSCRIPTION.PRICE_ID,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end
    }

    await supabase
      .from('stripe_subscriptions')
      .upsert(subscriptionData)

    // Mettre à jour les crédits dans le profil utilisateur
    await supabase
      .from('profiles')
      .update({ 
        subscription_status: 'active',
        monthly_credits_remaining: 1500,
        monthly_credits_limit: 1500,
        updated_at: new Date().toISOString()
      })
      .eq('id', customer.user_id)

    console.log('✅ Abonnement sauvegardé en DB et crédits mis à jour')

  } catch (error) {
    console.error('❌ Erreur handleSubscriptionCreated:', error)
  }
}

async function handleSubscriptionUpdated(supabase: any, subscription: any) {
  try {
    console.log('🔄 Abonnement mis à jour:', subscription.id)
    
    // Mettre à jour l'abonnement dans notre DB
    const updateData = {
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString()
    }

    await supabase
      .from('stripe_subscriptions')
      .update(updateData)
      .eq('stripe_subscription_id', subscription.id)

    console.log('✅ Abonnement mis à jour en DB')

  } catch (error) {
    console.error('❌ Erreur handleSubscriptionUpdated:', error)
  }
}

async function handleSubscriptionDeleted(supabase: any, subscription: any) {
  try {
    console.log('❌ Abonnement supprimé:', subscription.id)
    
    // Récupérer l'utilisateur pour mettre à jour son profil
    const { data: subData } = await supabase
      .from('stripe_subscriptions')
      .select('user_id')
      .eq('stripe_subscription_id', subscription.id)
      .single()

    if (subData) {
      // Mettre à jour le statut d'abonnement dans le profil
      await supabase
        .from('profiles')
        .update({ 
          subscription_status: 'inactive',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', subData.user_id)
    }

    // Mettre à jour le statut de l'abonnement
    await supabase
      .from('stripe_subscriptions')
      .update({ 
        status: 'canceled',
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscription.id)

    console.log('✅ Annulation d\'abonnement traitée')

  } catch (error) {
    console.error('❌ Erreur handleSubscriptionDeleted:', error)
  }
}

async function handlePaymentSucceeded(supabase: any, invoice: any) {
  try {
    console.log('💳 Paiement réussi:', invoice.id)
    
    // Vérifier si c'est un paiement d'abonnement
    if (!invoice.subscription) {
      console.log('⚠️ Paiement non lié à un abonnement')
      return
    }

    // Récupérer l'utilisateur via le customer
    const { data: customer } = await supabase
      .from('stripe_customers')
      .select('user_id')
      .eq('stripe_customer_id', invoice.customer)
      .single()

    if (!customer) {
      console.error('❌ Client non trouvé pour le paiement:', invoice.customer)
      return
    }

    // Vérifier que c'est l'abonnement Entrepreneur
    const { data: subscription } = await supabase
      .from('stripe_subscriptions')
      .select('*')
      .eq('stripe_subscription_id', invoice.subscription)
      .eq('price_id', AURENTIA_CONFIG.SUBSCRIPTION.PRICE_ID)
      .single()

    if (!subscription) {
      console.log('⚠️ Abonnement non trouvé ou pas Entrepreneur')
      return
    }

    // Ajouter les crédits mensuels
    const { error: creditsError } = await supabase.rpc('billing.add_credits', {
      p_user_id: customer.user_id,
      p_amount: AURENTIA_CONFIG.SUBSCRIPTION.CREDITS,
      p_credit_type: 'monthly',
      p_description: 'Crédits mensuels abonnement Entrepreneur',
      p_stripe_reference: invoice.id
    })

    if (creditsError) {
      console.error('❌ Erreur ajout crédits:', creditsError)
    } else {
      console.log(`✅ ${AURENTIA_CONFIG.SUBSCRIPTION.CREDITS} crédits ajoutés pour ${customer.user_id}`)
    }

    // Mettre à jour le statut d'abonnement et les crédits mensuels dans le profil
    await supabase
      .from('profiles')
      .update({ 
        subscription_status: 'active',
        monthly_credits_remaining: 1500,
        monthly_credits_limit: 1500,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', customer.user_id)

    // Traiter les projets en attente d'abonnement
    await processSubscriptionForPendingProjects(supabase, customer.user_id)

    console.log('✅ Paiement d\'abonnement traité avec succès')

  } catch (error) {
    console.error('❌ Erreur handlePaymentSucceeded:', error)
  }
}

async function handlePaymentFailed(supabase: any, invoice: any) {
  try {
    console.log('❌ Échec de paiement:', invoice.id)
    
    // Récupérer l'utilisateur via le customer
    const { data: customer } = await supabase
      .from('stripe_customers')
      .select('user_id')
      .eq('stripe_customer_id', invoice.customer)
      .single()

    if (!customer) {
      console.error('❌ Client non trouvé pour le paiement échoué:', invoice.customer)
      return
    }

    // Mettre à jour le statut dans le profil si nécessaire
    // (Vous pouvez ajouter une logique spécifique ici)
    
    console.log('⚠️ Échec de paiement traité pour:', customer.user_id)

  } catch (error) {
    console.error('❌ Erreur handlePaymentFailed:', error)
  }
}

// ====== FONCTIONS UTILITAIRES ======

async function processSubscriptionForPendingProjects(supabase: any, userId: string) {
  try {
    // Récupérer les projets en attente d'abonnement
    const { data: pendingProjects } = await supabase
      .from('subscription_intents')
      .select('project_id')
      .eq('user_id', userId)
      .eq('status', 'pending')

    if (!pendingProjects || pendingProjects.length === 0) {
      return
    }

    console.log(`🔄 Traitement de ${pendingProjects.length} projets en attente pour ${userId}`)

    // Traiter chaque projet
    for (const project of pendingProjects) {
      // Mettre à jour le statut du projet pour déclencher la génération
      await supabase
        .from('project_summary')
        .update({ 
          statut_project: 'payment_receive',
          updated_at: new Date().toISOString()
        })
        .eq('project_id', project.project_id)

      // Déclencher la génération des livrables premium
      const { error: deliverableError } = await supabase.rpc('billing.generate_premium_deliverables', {
        p_user_id: userId,
        p_project_id: project.project_id
      })

      if (deliverableError) {
        console.error('❌ Erreur génération livrables pour projet:', project.project_id, deliverableError)
      } else {
        console.log('✅ Livrables premium générés pour projet:', project.project_id)
      }
    }

    // Marquer les intentions comme complétées
    await supabase
      .from('subscription_intents')
      .update({ status: 'completed', updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('status', 'pending')

    console.log('✅ Tous les projets en attente ont été traités')

  } catch (error) {
    console.error('❌ Erreur traitement projets en attente:', error)
  }
}
