# Test du Flux de Paiement

## Vérifications à effectuer

### 1. Logs dans la console

Ouvrez la console du navigateur et vérifiez que les logs suivants apparaissent dans l'ordre :

#### Étape 1 : Initiation du paiement
```
🚀 Initiation du paiement - Plan: plan1, Projet: [project_id]
✅ Statut projet mis à jour: pay_1_waiting
✅ Initiation du paiement réussie, démarrage du polling...
🔄 Démarrage du polling pour le projet [project_id], plan plan1
```

#### Étape 2 : Polling en cours
```
🔍 Vérification statut projet: pay_1_waiting
⏳ En attente du paiement...
🔍 Vérification statut projet: pay_1_waiting
⏳ En attente du paiement...
```

#### Étape 3 : Paiement reçu
```
🔍 Vérification statut projet: payment_receive
✅ Paiement reçu, génération des livrables...
🔄 Traitement du paiement en cours...
🔍 Vérification finale du statut: payment_receive
✅ Statut confirmé: payment_receive, génération des livrables...
🌐 Appel du webhook de génération des livrables...
✅ Webhook response: [response]
```

### 2. Vérification de la base de données

Vérifiez que le statut du projet change correctement :

```sql
-- Vérifier le statut initial
SELECT project_id, statut_project FROM project_summary WHERE project_id = '[votre_project_id]';

-- Après clic sur le bouton de paiement
-- Le statut doit passer à 'pay_1_waiting' ou 'pay_2_waiting'

-- Après paiement Stripe
-- Le statut doit passer à 'payment_receive'
```

### 3. Vérification des modales

1. **Modale d'attente** : "⏳ En attente du paiement..."
2. **Modale de génération** : "☕️ Une pause café ?"

### 4. Vérification du webhook

Le webhook ne doit être appelé QUE quand le statut est `payment_receive`.

## Points critiques à vérifier

### ❌ Problèmes à éviter :
- Le webhook ne doit PAS être appelé immédiatement après le clic
- Le webhook ne doit PAS être appelé si le statut n'est pas `payment_receive`
- Le polling doit continuer tant que le statut est `pay_1_waiting` ou `pay_2_waiting`

### ✅ Comportement attendu :
- Le statut passe à `pay_1_waiting`/`pay_2_waiting` immédiatement
- Le polling démarre et vérifie toutes les 4 secondes
- Le webhook n'est appelé qu'après détection de `payment_receive`
- Les livrables se débloquent automatiquement

## Test manuel

1. Cliquez sur "J'en profite !" pour le Plan 1
2. Vérifiez que la modale "En attente du paiement..." s'affiche
3. Vérifiez dans la console que le polling démarre
4. Simulez un paiement en changeant manuellement le statut en `payment_receive`
5. Vérifiez que le webhook est appelé et que la modale change
6. Vérifiez que les livrables se débloquent

## Debug

Si le webhook est appelé trop tôt, vérifiez :
- Les logs dans la console
- Le statut actuel du projet dans la base de données
- Si un ancien polling est encore actif 