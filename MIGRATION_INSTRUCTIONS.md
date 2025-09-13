# 🚀 INSTRUCTIONS COMPLÈTES - MIGRATION SYSTÈME D'ABONNEMENT AURENTIA

## 📋 RÉSUMÉ DU NOUVEAU SYSTÈME

### 🎯 Modèle Économique
- **Abonnement mensuel** : 12,90€ → 1 500 crédits/mois (non cumulables)
- **Premier livrable premium gratuit** : Une seule fois par compte
- **Pack livrables premium** : 1 000 crédits pour TOUS les livrables premium
- **Packs de crédits** (futurs) : 10€/20€/50€ pour crédits permanents

### 🏗️ Architecture
- **Nouveau schéma `billing`** : Tables dédiées aux abonnements et crédits
- **Double système de crédits** : Mensuels (expirent) + Achetés (permanents)
- **Priorité de déduction** : Crédits achetés utilisés EN PREMIER
- **Webhooks N8N** : Gestion automatique des paiements Stripe

---

## 🔧 ÉTAPES DE MIGRATION

### **ÉTAPE 1 : BACKUP ET VÉRIFICATION**

```bash
# 1. Rendre le script exécutable
chmod +x backup_pre_migration.sh

# 2. Exécuter le backup
./backup_pre_migration.sh

# 3. Vérifier les données (dans Supabase SQL Editor)
-- Copier le contenu de backups/pre_migration_check_TIMESTAMP.sql
```

### **ÉTAPE 2 : MIGRATION BASE DE DONNÉES**

```sql
-- Dans Supabase SQL Editor, exécuter dans l'ordre :

-- 1. Migration du schéma
-- Copier tout le contenu de db_billing_schema_migration.sql

-- 2. Création des fonctions
-- Copier tout le contenu de db_billing_functions.sql
```

### **ÉTAPE 3 : CONFIGURATION N8N**

#### **Workflow N8N : Gestion Abonnement**

1. **Créer un nouveau workflow** "Stripe Subscription Management"

2. **Ajouter les nodes suivants :**

```json
{
  "nodes": [
    {
      "name": "Webhook Stripe",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "stripe-subscription-webhook",
        "httpMethod": "POST"
      }
    },
    {
      "name": "Filter Payment Amount",
      "type": "n8n-nodes-base.if",
      "parameters": {
        "conditions": {
          "number": [
            {
              "value1": "={{ $json.data.object.amount_received }}",
              "operation": "equal",
              "value2": 1290
            }
          ]
        }
      }
    },
    {
      "name": "Get User ID",
      "type": "n8n-nodes-base.supabase",
      "parameters": {
        "operation": "select",
        "table": "auth.users",
        "filterType": "manual",
        "matchType": "allFilters",
        "filters": {
          "conditions": [
            {
              "keyName": "email",
              "condition": "equals",
              "keyValue": "={{ $json.data.object.receipt_email }}"
            }
          ]
        },
        "options": {
          "limit": 1
        }
      }
    },
    {
      "name": "Add Monthly Credits",
      "type": "n8n-nodes-base.supabase",
      "parameters": {
        "operation": "rpc",
        "function": "billing.add_credits",
        "parameters": {
          "p_user_id": "={{ $('Get User ID').item.json.id }}",
          "p_amount": 1500,
          "p_credit_type": "monthly",
          "p_description": "Renouvellement abonnement mensuel",
          "p_stripe_reference": "={{ $json.data.object.id }}"
        }
      }
    },
    {
      "name": "Update Subscription Status",
      "type": "n8n-nodes-base.supabase",
      "parameters": {
        "operation": "upsert",
        "table": "billing.subscriptions",
        "data": {
          "user_id": "={{ $('Get User ID').item.json.id }}",
          "stripe_customer_id": "={{ $json.data.object.customer }}",
          "status": "active",
          "current_period_start": "={{ new Date().toISOString() }}",
          "current_period_end": "={{ new Date(Date.now() + 30*24*60*60*1000).toISOString() }}"
        }
      }
    },
    {
      "name": "Update Profile Status",
      "type": "n8n-nodes-base.supabase",
      "parameters": {
        "operation": "update",
        "table": "public.profiles",
        "filterType": "manual",
        "matchType": "allFilters",
        "filters": {
          "conditions": [
            {
              "keyName": "id",
              "condition": "equals",
              "keyValue": "={{ $('Get User ID').item.json.id }}"
            }
          ]
        },
        "data": {
          "subscription_status": "active"
        }
      }
    }
  ]
}
```

3. **Configurer l'URL du webhook** dans Stripe Dashboard :
   - URL : `https://votre-n8n-instance.com/webhook/stripe-subscription-webhook`
   - Événements : `payment_intent.succeeded`

### **ÉTAPE 4 : MISE À JOUR FRONTEND**

Les fichiers suivants ont été créés/modifiés :

1. **✅ `src/services/stripeService.ts`** - Service adapté au nouveau système
2. **✅ `src/hooks/useStripePayment.tsx`** - Hook pour abonnements
3. **✅ `src/hooks/useCredits.tsx`** - Nouveau hook pour gestion crédits
4. **✅ `src/components/ui/CreditBalance.tsx`** - Composant affichage crédits

#### **Fichiers à Adapter Manuellement :**

Les fichiers suivants utilisent encore l'ancien système et doivent être adaptés :

```typescript
// Dans les fichiers qui utilisent useStripePayment, remplacer :

// ANCIEN
const { isWaitingPayment, initiatePayment, cancelPayment } = useStripePayment();

// NOUVEAU
const { isWaitingSubscription, initiateSubscription, cancelSubscription } = useStripePayment();
```

### **ÉTAPE 5 : TESTS ET VALIDATION**

#### **Tests à Effectuer :**

1. **Test Abonnement :**
```bash
# Utiliser un paiement test Stripe de 12,90€
# Vérifier que N8N reçoit le webhook
# Vérifier que les crédits sont ajoutés (1500)
# Vérifier que le statut d'abonnement est "active"
```

2. **Test Premier Livrable Gratuit :**
```sql
-- Vérifier qu'un nouvel utilisateur peut générer gratuitement
SELECT billing.can_generate_premium_for_free('USER_ID_TEST');

-- Générer le premier livrable
SELECT billing.generate_premium_deliverables('USER_ID_TEST', 'PROJECT_ID_TEST');

-- Vérifier que first_premium_used = true
SELECT first_premium_used FROM billing.user_credits WHERE user_id = 'USER_ID_TEST';
```

3. **Test Déduction de Crédits :**
```sql
-- Ajouter des crédits achetés
SELECT billing.add_credits('USER_ID_TEST', 500, 'purchased', 'Test crédits achetés');

-- Déduire 300 crédits (doit prendre d'abord les achetés)
SELECT billing.deduct_credits_with_priority('USER_ID_TEST', 300, 'Test déduction');

-- Vérifier la priorité
SELECT * FROM billing.user_credits WHERE user_id = 'USER_ID_TEST';
```

---

## 🔍 VÉRIFICATIONS POST-MIGRATION

### **Checklist de Validation :**

- [ ] **Base de données** : Schéma `billing` créé avec 5 tables
- [ ] **Migration données** : Crédits utilisateurs migrés correctement
- [ ] **Fonctions SQL** : Toutes les fonctions créées sans erreur
- [ ] **N8N Webhook** : Reçoit et traite les paiements Stripe
- [ ] **Frontend** : Nouveau système de crédits fonctionne
- [ ] **Premier livrable** : Génération gratuite pour nouveaux utilisateurs
- [ ] **Priorité crédits** : Crédits achetés utilisés en premier
- [ ] **Abonnement** : Reset mensuel des crédits fonctionne

### **Requêtes de Vérification :**

```sql
-- 1. Vérifier la migration des utilisateurs
SELECT COUNT(*) as users_migrated FROM billing.user_credits;

-- 2. Vérifier les transactions créées
SELECT type, COUNT(*) as count, SUM(amount) as total 
FROM billing.credit_transactions 
GROUP BY type;

-- 3. Vérifier la configuration
SELECT * FROM billing.pricing_config ORDER BY category, key;

-- 4. Vérifier les abonnements actifs
SELECT status, COUNT(*) FROM billing.subscriptions GROUP BY status;
```

---

## 🚨 PLAN DE ROLLBACK

En cas de problème critique :

1. **Arrêter N8N** : Désactiver le webhook temporairement
2. **Exécuter le rollback** : `psql -f backups/rollback_migration_TIMESTAMP.sql`
3. **Restaurer les données** : Utiliser les CSV de backup si nécessaire
4. **Revenir à l'ancien code** : Git checkout vers la version précédente

---

## 📞 SUPPORT

### **Logs à Surveiller :**
- **N8N** : Logs des webhooks Stripe
- **Supabase** : Logs des fonctions SQL
- **Frontend** : Console browser pour erreurs

### **Métriques à Suivre :**
- Taux de conversion gratuit → abonnement
- Utilisation moyenne des crédits mensuels
- Erreurs de déduction de crédits
- Échecs de webhooks N8N

---

## ✅ RÉSUMÉ FINAL

Le nouveau système d'abonnement Aurentia est maintenant prêt avec :

- **🏦 Schéma billing** complet avec gestion des crédits
- **💳 Abonnement mensuel** à 12,90€ avec 1500 crédits
- **🎁 Premier livrable gratuit** pour l'acquisition
- **⚡ Priorité de déduction** optimisée
- **🔄 Webhooks N8N** automatisés
- **📊 Interface utilisateur** moderne

**Le système est conçu pour être évolutif et permettre l'ajout futur de packs de crédits supplémentaires.**