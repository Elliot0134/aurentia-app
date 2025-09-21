# Guide d'Intégration Stripe API pour Aurentia

## Vue d'ensemble

Cette intégration remplace progressivement votre système actuel basé sur des liens de paiement Stripe et des webhooks N8n par une gestion complète via l'API Stripe directement intégrée dans votre application.

## Architecture

### 1. Services créés

- **`aurentiaStripeService.ts`** : Service principal pour la gestion des abonnements
- **`stripeApiService.ts`** : Service pour les appels directs à l'API Stripe (optionnel)
- **Webhook Supabase** : `supabase/functions/stripe-webhook/index.ts`
- **Composant React** : `SubscriptionManager.tsx`

### 2. Tables de base de données

- **`stripe_customers`** : Liaison entre utilisateurs Aurentia et clients Stripe
- **`stripe_subscriptions`** : Stockage des abonnements Stripe
- **`subscription_intents`** : Suivi des intentions d'abonnement
- **`stripe_webhook_events`** : Log des événements webhook

## Configuration requise

### 1. Variables d'environnement

Ajoutez dans votre `.env` :

```env
# Clés Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_votre_cle_publique
STRIPE_SECRET_KEY=rk_live_votre_cle_limitee_ou_sk_live_votre_cle_secrete
STRIPE_WEBHOOK_SECRET=whsec_votre_secret_webhook

# Supabase (existant)
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_cle_publique_supabase
SUPABASE_SERVICE_ROLE_KEY=votre_cle_service_supabase
```

### 2. Configuration Stripe

1. **Créer une clé restreinte** dans votre dashboard Stripe avec les permissions :
   - `customers` (lecture/écriture)
   - `subscriptions` (lecture/écriture)
   - `invoices` (lecture)
   - `payment_intents` (lecture/écriture)
   - `products` (lecture)
   - `prices` (lecture)

2. **Configurer un webhook** pointant vers : `https://votre-projet.supabase.co/functions/v1/stripe-webhook`

### 3. Base de données

Exécutez le script SQL dans `db_migrations/004_stripe_integration.sql` :

```sql
-- Connectez-vous à votre Supabase et exécutez le script
```

## Utilisation

### 1. Dans vos composants React

```tsx
import { SubscriptionManager } from '@/components/subscription/SubscriptionManager';

// Dans votre composant
<SubscriptionManager 
  userId={user.id}
  projectId={currentProject?.id}
  onSubscriptionUpdate={(hasSubscription) => {
    // Callback appelé quand le statut change
    console.log('Abonnement actif:', hasSubscription);
  }}
/>
```

### 2. Utilisation directe du service

```tsx
import { aurentiaStripeService } from '@/services/aurentiaStripeService';

// Vérifier le statut d'abonnement
const subscriptionInfo = await aurentiaStripeService.getUserSubscriptionStatus(userId);

// Créer un lien de paiement
const result = await aurentiaStripeService.createSubscriptionPaymentLink(userId, projectId);

// Annuler un abonnement
const cancelResult = await aurentiaStripeService.cancelSubscription(userId, false);
```

### 3. Gestion des webhooks

Les webhooks sont automatiquement traités par la fonction Supabase. Les événements suivants sont gérés :

- `customer.subscription.created` : Nouvel abonnement
- `customer.subscription.updated` : Modification d'abonnement
- `customer.subscription.deleted` : Annulation d'abonnement
- `invoice.payment_succeeded` : Paiement réussi (ajout de crédits)
- `invoice.payment_failed` : Échec de paiement

## Migration depuis l'ancien système

### Étape 1 : Déployer la nouvelle infrastructure

1. Déployez les nouvelles tables en base
2. Déployez la fonction webhook Supabase
3. Configurez les variables d'environnement

### Étape 2 : Migration progressive

1. **Garder l'ancien système actif** pour les utilisateurs existants
2. **Utiliser le nouveau système** pour les nouveaux utilisateurs
3. **Migrer progressivement** les utilisateurs existants

### Étape 3 : Synchronisation des données existantes

```sql
-- Script pour migrer les abonnements existants
-- (à adapter selon vos données actuelles)

-- Exemple : si vous avez des utilisateurs avec subscription_status = 'active'
INSERT INTO stripe_customers (user_id, email, stripe_customer_id)
SELECT user_id, email, 'cus_placeholder_' || user_id
FROM profiles 
WHERE subscription_status = 'active'
AND user_id NOT IN (SELECT user_id FROM stripe_customers);
```

## Fonctionnalités disponibles

### ✅ Implémentées

- [x] Vérification du statut d'abonnement
- [x] Création de liens de paiement
- [x] Annulation d'abonnement (fin de période ou immédiate)
- [x] Réactivation d'abonnement
- [x] Gestion des webhooks automatique
- [x] Ajout automatique de crédits mensuels
- [x] Interface utilisateur complète
- [x] Synchronisation avec Supabase

### 🚧 À implémenter

- [ ] **Edge Functions Supabase** pour appels API Stripe sécurisés
- [ ] **Mise à jour des moyens de paiement**
- [ ] **Historique des paiements dans l'interface**
- [ ] **Gestion des coupons et promotions**
- [ ] **Métriques et analytics d'abonnement**
- [ ] **Tests automatisés**

## Edge Functions Supabase requises

Vous devez créer ces fonctions dans `supabase/functions/` :

1. **`stripe-create-customer`** : Créer un client Stripe
2. **`stripe-search-customers`** : Chercher des clients par email
3. **`stripe-list-subscriptions`** : Lister les abonnements d'un client
4. **`stripe-create-payment-link`** : Créer un lien de paiement
5. **`stripe-cancel-subscription`** : Annuler un abonnement
6. **`stripe-update-subscription`** : Mettre à jour un abonnement

Exemple pour `stripe-create-customer` :

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!

serve(async (req) => {
  const { email, name, metadata } = await req.json()
  
  const response = await fetch('https://api.stripe.com/v1/customers', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      email,
      ...(name && { name }),
      ...(metadata && { 'metadata[user_id]': metadata.user_id })
    })
  })
  
  const customer = await response.json()
  return new Response(JSON.stringify(customer))
})
```

## Tests et debugging

### 1. Vérification des webhooks

```sql
-- Voir les événements webhook reçus
SELECT * FROM stripe_webhook_events 
ORDER BY created_at DESC 
LIMIT 10;

-- Voir les abonnements en base
SELECT * FROM stripe_subscriptions 
WHERE user_id = 'votre-user-id';
```

### 2. Logs de debugging

Les services incluent des logs détaillés avec des émojis pour faciliter le debugging :

- ✅ : Opération réussie
- ❌ : Erreur
- 🔄 : En cours de traitement
- ⚠️ : Avertissement

### 3. Mode test

Utilisez les clés de test Stripe pour valider l'intégration avant de passer en production.

## Sécurité

- **Clés API** : Jamais exposées côté client
- **Webhooks** : Vérification des signatures (à implémenter)
- **RLS** : Row Level Security activée sur toutes les tables
- **Validation** : Toutes les entrées utilisateur sont validées

## Support et maintenance

- **Monitoring** : Surveillez les logs des webhooks
- **Backups** : Sauvegarde automatique via Supabase
- **Updates** : Mises à jour régulières des dépendances

Cette architecture vous donne un contrôle total sur la gestion des abonnements tout en maintenant la sécurité et la performance.
