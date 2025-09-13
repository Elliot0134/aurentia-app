# Configuration du Webhook Stripe avec Payment Intent Database

## Problème résolu

Lorsqu'un utilisateur connecté avec l'adresse email A effectue un paiement Stripe avec une adresse email B différente, le webhook Stripe recevait l'email B au lieu de l'ID de l'utilisateur connecté A.

## Solution implémentée : Payment Intent Database

### 1. Création d'un Payment Intent en base

Avant de rediriger vers Stripe, le système :
1. Génère un ID unique de payment intent : `pi_timestamp_random`
2. Stocke l'association dans la table `payment_intents` :
   - `payment_intent_id` : ID unique généré
   - `user_id` : ID de l'utilisateur connecté
   - `project_id` : ID du projet
   - `status` : 'pending'

### 2. Passage du Payment Intent ID à Stripe

L'URL Stripe Payment Link est enrichie avec le `client_reference_id` :

```javascript
// URL générée automatiquement
https://buy.stripe.com/4gMfZidrg5Cwamd4TR0gw09?client_reference_id=pi_1704110400000_abc123def
```

### 3. Configuration côté Webhook Stripe

Dans votre webhook Stripe (n8n), utilisez le `client_reference_id` pour récupérer les informations utilisateur :

#### Code webhook n8n :
```javascript
// 1. Récupérer le payment intent ID depuis Stripe
const paymentIntentId = event.data.object.client_reference_id;

if (!paymentIntentId || !paymentIntentId.startsWith('pi_')) {
  throw new Error('Payment intent ID manquant ou invalide');
}

// 2. Appeler la fonction Supabase pour récupérer les infos utilisateur
const { data, error } = await supabase
  .rpc('billing.get_user_from_payment_intent', {
    p_payment_intent_id: paymentIntentId
  });

if (error || !data || data.length === 0) {
  throw new Error('Impossible de trouver l\'utilisateur pour ce payment intent');
}

const { user_id, project_id, status } = data[0];

// 3. Vérifier que le payment intent est en attente
if (status !== 'pending') {
  throw new Error(`Payment intent déjà traité avec le statut: ${status}`);
}

// 4. Marquer le payment intent comme complété
await supabase.rpc('billing.complete_payment_intent', {
  p_payment_intent_id: paymentIntentId,
  p_stripe_payment_intent_id: event.data.object.id // ID Stripe réel
});

// 5. Utiliser user_id et project_id pour le traitement
console.log(`Paiement reçu pour l'utilisateur ${user_id} et le projet ${project_id}`);
```

### 4. Structure du webhook event

Le webhook Stripe recevra maintenant ces informations dans l'événement :

```json
{
  "data": {
    "object": {
      "client_reference_id": "pi_1704110400000_abc123def",
      "customer_details": {
        "email": "different-email@example.com"  // ⚠️ Ne plus utiliser ceci
      }
    }
  }
}
```

### 5. Avantages de cette solution

1. **Fiabilité** : Fonctionne avec tous les types de Payment Links Stripe
2. **Sécurité** : L'utilisateur connecté est toujours correctement identifié
3. **Flexibilité** : L'utilisateur peut payer avec n'importe quelle adresse email
4. **Traçabilité** : Historique complet des payment intents en base
5. **Robustesse** : Gestion des statuts et prévention des doublons

### 6. Migration de la base de données

Exécutez la migration SQL :
```bash
# Appliquer la migration
supabase db push
```

Ou exécutez manuellement le fichier :
`supabase/migrations/20250101_create_payment_intents_table.sql`

### 7. Test de la solution

Pour tester :
1. Connectez-vous avec l'adresse email A
2. Cliquez sur le bouton de paiement
3. Vérifiez qu'un payment intent est créé en base avec votre user_id
4. Dans Stripe, utilisez une adresse email B différente pour payer
5. Vérifiez que le webhook reçoit le payment intent ID dans `client_reference_id`
6. Confirmez que la fonction `get_user_from_payment_intent` retourne le bon utilisateur A

### 8. Fonctions Supabase disponibles

- `get_user_from_payment_intent(payment_intent_id)` : Récupère user_id et project_id
- `complete_payment_intent(payment_intent_id, stripe_payment_intent_id)` : Marque comme complété

## Code modifié

Les fichiers suivants ont été modifiés :
- `src/services/stripeService.ts` : Ajout de la gestion des payment intents
- `supabase/migrations/20250101_create_payment_intents_table.sql` : Nouvelle table et fonctions