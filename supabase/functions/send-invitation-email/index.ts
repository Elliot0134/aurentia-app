import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, inviteUrl, projectName } = await req.json()

    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not set')
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invitation à collaborer - Aurentia</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 8px 8px 0 0;
            text-align: center;
          }
          .content {
            background: #fff;
            padding: 30px;
            border: 1px solid #ddd;
            border-top: none;
            border-radius: 0 0 8px 8px;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 14px;
            color: #666;
          }
          .project-name {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 6px;
            margin: 15px 0;
            border-left: 4px solid #667eea;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🚀 Invitation à collaborer</h1>
          <p>Vous avez été invité à rejoindre un projet sur Aurentia</p>
        </div>
        
        <div class="content">
          <h2>Bonjour !</h2>
          
          <p>Vous avez été invité à collaborer sur le projet suivant :</p>
          
          <div class="project-name">
            <strong>📊 ${projectName}</strong>
          </div>
          
          <p>En acceptant cette invitation, vous pourrez :</p>
          <ul>
            <li>✅ Consulter et modifier le projet selon vos permissions</li>
            <li>💬 Collaborer avec l'équipe en temps réel</li>
            <li>📈 Suivre l'évolution du projet entrepreneurial</li>
            <li>🔒 Bénéficier d'un accès sécurisé et personnalisé</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteUrl}" class="button">
              🎯 Accepter l'invitation
            </a>
          </div>
          
          <p><strong>⚠️ Important :</strong> Cette invitation expire dans 7 jours. Assurez-vous d'avoir un compte Aurentia avec cette adresse email (${email}) pour pouvoir accepter l'invitation.</p>
          
          <p>Si vous n'avez pas encore de compte, vous pouvez vous inscrire gratuitement sur <a href="https://aurentia.app">Aurentia</a>.</p>
        </div>
        
        <div class="footer">
          <p>Cet email a été envoyé automatiquement par Aurentia. Si vous pensez avoir reçu cette invitation par erreur, vous pouvez ignorer ce message.</p>
          <p>
            <strong>Aurentia</strong> - Votre plateforme de développement de projets entrepreneuriaux<br>
            <a href="https://aurentia.app">aurentia.app</a>
          </p>
        </div>
      </body>
      </html>
    `

    const textContent = `
Invitation à collaborer - Aurentia

Bonjour !

Vous avez été invité à collaborer sur le projet : ${projectName}

En acceptant cette invitation, vous pourrez :
- Consulter et modifier le projet selon vos permissions
- Collaborer avec l'équipe en temps réel  
- Suivre l'évolution du projet entrepreneurial
- Bénéficier d'un accès sécurisé et personnalisé

Pour accepter l'invitation, cliquez sur le lien suivant :
${inviteUrl}

IMPORTANT : Cette invitation expire dans 7 jours. Assurez-vous d'avoir un compte Aurentia avec cette adresse email (${email}) pour pouvoir accepter l'invitation.

Si vous n'avez pas encore de compte, vous pouvez vous inscrire gratuitement sur https://aurentia.app

---
Cet email a été envoyé automatiquement par Aurentia.
Aurentia - Votre plateforme de développement de projets entrepreneuriaux
https://aurentia.app
    `

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Aurentia <team@mail.aurentia.fr>',
        to: [email],
        subject: `🚀 Invitation à collaborer sur "${projectName}" - Aurentia`,
        html: htmlContent,
        text: textContent,
      }),
    })

    if (res.ok) {
      const data = await res.json()
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    } else {
      const errorData = await res.text()
      console.error('Resend API error:', errorData)
      return new Response(JSON.stringify({ error: 'Failed to send email' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})