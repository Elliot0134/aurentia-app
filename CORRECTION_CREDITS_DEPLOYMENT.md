# 🚀 Correction du Système de Crédits - Instructions de Déploiement

## 🚨 Problème Résolu

**Symptôme :** Les utilisateurs qui prennent l'abonnement ne voient pas leurs crédits ajoutés.

**Cause Identifiée :** Le webhook de paiement Stripe ne faisait QUE la génération des livrables, sans jamais ajouter les crédits d'abonnement.

## 📋 Étapes de Déploiement (ORDRE IMPORTANT)

### **Étape 1: Nettoyer l'Ancien Système**
Exécuter dans Supabase Dashboard > SQL Editor :
```sql
-- Exécuter le contenu de cleanup_old_credits_system.sql
```

### **Étape 2: Vérifier le Nouveau Système**
Exécuter dans Supabase Dashboard > SQL Editor :
```sql
-- Exécuter le contenu de test_credits_system.sql
```

### **Étape 3: Déployer les Corrections Code**
Les fichiers suivants ont été modifiés :
- ✅ `src/services/stripeService.ts` - Ajout des crédits dans le processus de paiement
- ✅ `src/hooks/useCredits.tsx` - Écoute des événements d'abonnement

### **Étape 4: Test Complet**

1. **Créer un nouvel utilisateur de test**
2. **Prendre l'abonnement** 
3. **Vérifier les crédits** avec cette requête :
```sql
SELECT * FROM billing.get_user_balance('USER_ID_ICI');
```

## 🔧 Ce qui a été corrigé

### **Avant (Défaillant)**
```typescript
// Seul appel webhook - AUCUN crédit ajouté
const webhookResponse = await fetch('webhook/generation-livrables-premium');
```

### **Après (Corrigé)**
```typescript
// 1. Ajouter les crédits d'abonnement
await supabase.rpc('billing.add_credits', {
  p_user_id: userId,
  p_amount: 1500,
  p_credit_type: 'monthly'
});

// 2. Déclencher les événements UI
window.dispatchEvent(new CustomEvent('creditsUpdated'));
window.dispatchEvent(new CustomEvent('subscriptionUpdated'));

// 3. Puis appel webhook génération
// Note: Le statut d'abonnement sera mis à jour dans profiles.subscription_status par le workflow N8n
const webhookResponse = await fetch('webhook/generation-livrables-premium');
```

## ✅ Résultat Attendu

Après correction, lorsqu'un utilisateur prend l'abonnement :
1. ✅ **1500 crédits mensuels** sont ajoutés automatiquement
2. ✅ **Abonnement créé** dans `billing.subscriptions`
3. ✅ **UI mise à jour** en temps réel
4. ✅ **Livrables générés** automatiquement

## 🚀 Test de Validation

Exécuter ce test après déploiement :
```sql
-- Remplacer USER_ID par un utilisateur réel
SELECT 
  monthly_credits,
  purchased_credits,
  total_credits,
  subscription_status
FROM billing.get_user_balance('USER_ID');

-- Résultat attendu pour un nouvel abonné :
-- monthly_credits: 1500
-- purchased_credits: 0
-- total_credits: 1500
-- subscription_status: 'active'
```

## 📞 Support

Si problème après déploiement, vérifier :
1. Logs dans la console navigateur
2. Erreurs SQL dans Supabase > Logs
3. Status du webhook n8n