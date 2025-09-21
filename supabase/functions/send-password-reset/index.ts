import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 })
  }

  try {
    console.log('=== PASSWORD RESET REQUEST START ===')
    
    // 1. Parse request body
    let body;
    try {
      body = await req.json()
      console.log('Request body parsed:', { has_email: !!body.email })
    } catch (e) {
      console.error('Failed to parse request body:', e)
      throw new Error('Invalid JSON in request body')
    }

    const { email } = body
    if (!email) {
      throw new Error('email is required')
    }
    console.log('Email provided:', email)

    // 2. Create Supabase client avec service role pour vérifier l'utilisateur
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 3. Vérifier si l'utilisateur existe
    console.log('Checking if user exists...')
    const { data: users, error: userError } = await supabaseAdmin.auth.admin.listUsers({
      filter: { email }
    })
    
    if (userError) {
      console.error('User lookup error:', userError)
      throw userError
    }

    const user = users.users.find(u => u.email === email)
    if (!user) {
      // Pour la sécurité, on renvoie toujours un succès même si l'email n'existe pas
      console.log('User not found, but returning success for security')
      return new Response(JSON.stringify({ 
        message: "Si cette adresse email est associée à un compte, vous recevrez un email de réinitialisation." 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    console.log('User found:', { id: user.id, email: user.email })

    // 4. Générer un token sécurisé
    console.log('Generating reset token...')
    const resetToken = crypto.randomUUID()
    const expires_at = new Date(Date.now() + 60 * 60 * 1000) // 1 heure

    // 5. Hasher le token
    const encoder = new TextEncoder()
    const tokenData = encoder.encode(resetToken)
    const hashBuffer = await crypto.subtle.digest('SHA-256', tokenData)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const token_hash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')

    console.log('Token hashed successfully')

    // 6. Stocker dans la table email_confirmations (réutilisation)
    console.log('Storing password reset request...')
    const insertData = {
      user_id: user.id,
      email: user.email,
      token_hash: token_hash,
      expires_at: expires_at.toISOString(),
      status: 'pending',
      confirmation_type: 'single' // Utiliser 'single' au lieu de 'password_reset'
    }

    const { error: insertError } = await supabaseAdmin
      .from('email_confirmations')
      .insert(insertData)

    if (insertError) {
      console.error('Insert error:', insertError)
      throw insertError
    }
    console.log('Password reset request stored successfully')

    // 7. Générer l'URL de réinitialisation
    const siteUrl = Deno.env.get('SITE_URL')
    const resetUrl = `${siteUrl}/update-password?token=${resetToken}`

    // 8. Envoyer l'email directement avec Resend (pas via Edge Function)
    console.log('Sending password reset email to:', email)
    
    const resend = new (await import('https://esm.sh/resend@1.1.0')).Resend(Deno.env.get('RESEND_API_KEY'))
    
    // Template HTML directement intégré
    const htmlTemplate = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Réinitialisez votre mot de passe</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=BIZ+UDPMincho:wght@400;700&display=swap');
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #F4F4F1;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: #F4F4F1;
            padding: 30px;
        }
        .inner-container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            overflow: hidden;
        }
        .header {
            background: #F4F4F1;
            color: #333;
            padding: 40px 30px;
            text-align: center;
        }
        .logo {
            width: 160px;
            height: auto;
            margin-bottom: 25px;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 400;
            font-family: 'BIZ UDPMincho', serif;
            color: #333;
        }
        .content {
            padding: 40px 30px;
            background: white;
        }
        .welcome-text {
            font-size: 18px;
            margin-bottom: 25px;
            color: #2c3e50;
        }
        .cta-button {
            display: inline-block !important;
            background: #FF592C !important;
            color: #ffffff !important;
            text-decoration: none !important;
            padding: 15px 35px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            transition: all 0.3s ease;
            border: none;
        }
        .cta-button:hover {
            background: #e04a1f !important;
            color: #ffffff !important;
            transform: translateY(-1px);
        }
        .cta-button:visited {
            color: #ffffff !important;
        }
        .cta-button:active {
            color: #ffffff !important;
        }
        .footer {
            text-align: center;
            padding: 25px;
            background: white;
            color: #6c757d;
            font-size: 14px;
            border-top: 1px solid #e9ecef;
        }
        .security-info {
            margin-top: 25px;
            padding: 15px;
            background: #FFF1EE;
            border-radius: 8px;
            font-size: 14px;
            color: #FF5B3A;
        }
        .warning-info {
            margin-top: 25px;
            padding: 15px;
            background: #fff3cd;
            border-radius: 8px;
            font-size: 14px;
            color: #856404;
            border-left: 4px solid #ffc107;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="inner-container">
            <div class="header">
                <img src="https://cdn.prod.website-files.com/68b2fd357db03bbb045b95e1/68c5d9c555c56a4153719885_logo-long.svg" alt="Logo Aurentia" class="logo">
                <h1>Réinitialisez votre mot de passe</h1>
            </div>
            
            <div class="content">
                <p class="welcome-text">
                    Vous avez demandé à réinitialiser votre mot de passe sur Aurentia.
                </p>
                
                <p>
                    Pour créer un nouveau mot de passe et retrouver l'accès à votre compte, cliquez sur le bouton ci-dessous :
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" class="cta-button" style="color: #ffffff !important;">
                        🔑 Créer un nouveau mot de passe
                    </a>
                </div>
                
                <div class="warning-info">
                    <p><strong>⚠️ Vous n'avez pas demandé cette réinitialisation ?</strong></p>
                    <p>Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet email. Votre compte reste sécurisé et votre mot de passe actuel n'a pas été modifié.</p>
                </div>
                
                <div class="security-info">
                    <p><strong>🔒 Sécurité :</strong> Ce lien de réinitialisation est valable pendant 1 heure et ne peut être utilisé qu'une seule fois. Pour votre sécurité, utilisez un mot de passe fort contenant des lettres, chiffres et caractères spéciaux.</p>
                </div>
            </div>
            
            <div class="footer">
                <p>
                    Cet email a été envoyé automatiquement, merci de ne pas y répondre.<br>
                    Si vous avez des questions, contactez notre équipe support.
                </p>
            </div>
        </div>
    </div>
</body>
</html>`

    const emailResponse = await resend.emails.send({
      from: "Aurentia <team@mail.aurentia.fr>",
      to: email,
      subject: "🔑 Réinitialisez votre mot de passe Aurentia",
      html: htmlTemplate,
    })

    if (emailResponse.error) {
      console.error('Resend error:', emailResponse.error)
      throw new Error('Impossible d\'envoyer l\'email de réinitialisation.')
    }
    console.log('Password reset email sent successfully:', emailResponse.data?.id)

    console.log('=== PASSWORD RESET REQUEST SUCCESS ===')
    return new Response(JSON.stringify({ 
      message: "Un email de réinitialisation a été envoyé à votre adresse email." 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('=== PASSWORD RESET REQUEST ERROR ===')
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
