# Configuration des Variables d'Environnement - Email Confirmation

## Variables Requises pour les Edge Functions

Les Edge Functions de confirmation d'email nécessitent les variables d'environnement suivantes dans **Supabase Dashboard** (Settings > Edge Functions) :

### Variables Essentielles

1. **SITE_URL**
   - Description : URL de base de votre application pour construire les liens de confirmation
   - Valeur de production : `https://app.aurentia.fr`
   - Exemple : `https://app.aurentia.fr`

### Variables Automatiques Supabase

Ces variables sont automatiquement disponibles dans les Edge Functions :

- `SUPABASE_URL` - URL de votre projet Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Clé service role pour les opérations administratives
- `SUPABASE_ANON_KEY` - Clé anonyme (non utilisée dans ce projet)

## Configuration via Supabase Dashboard

### Étapes pour configurer :

1. **Aller dans Supabase Dashboard**
   - Ouvrir : https://supabase.com/dashboard
   - Sélectionner votre projet : `llcliurrrrxnkquwmwsi`

2. **Naviguer vers Edge Functions**
   - Settings → Edge Functions
   - Section "Environment variables"

3. **Ajouter la variable**
   ```bash
   SITE_URL=https://app.aurentia.fr
   ```

## Configuration SMTP Supabase

Le système utilise l'intégration SMTP native de Supabase. Assurez-vous que votre configuration SMTP est correcte dans le dashboard Supabase :

1. **Aller dans Supabase Dashboard**
   - Ouvrir : https://supabase.com/dashboard
   - Sélectionner votre projet : `llcliurrrrxnkquwmwsi`

2. **Naviguer vers Authentication**
   - Authentication → Settings
   - Section "Email Settings"

3. **Vérifier la configuration SMTP**
   - Assurez-vous que les paramètres SMTP sont correctement configurés pour l'envoi d'emails.

## Test de Configuration

Une fois configuré, tester avec :

```bash
# Test des Edge Functions
curl -X POST "https://llcliurrrrxnkquwmwsi.supabase.co/functions/v1/send-confirmation-email" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

## Variables Locales (.env)

Le fichier `.env` local contient déjà les variables nécessaires côté client :

```env
VITE_SUPABASE_URL=https://llcliurrrrxnkquwmwsi.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_PROJECT_ID=llcliurrrrxnkquwmwsi
```

## Sécurité

⚠️ **Important :**
- Ne jamais committer les vraies clés API
- Utiliser des clés différentes pour dev/staging/prod
- Monitorer l'usage des clés
- Configurer les rate limits appropriés

## Vérification

Pour vérifier que tout fonctionne :

1. ✅ Variable `SITE_URL` configurée dans Supabase Dashboard
2. ✅ Configuration SMTP Supabase vérifiée
3. ✅ Edge Functions déployées et actives
4. ✅ Test d'envoi d'email réussi