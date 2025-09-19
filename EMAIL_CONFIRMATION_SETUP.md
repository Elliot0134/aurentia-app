# 🚀 Système de Confirmation d'Email - Guide d'Installation

## Vue d'ensemble

Ce système complet de confirmation d'email offre :
- ✅ Génération et envoi automatique d'emails sécurisés
- ✅ Modal d'attente avec temps réel (WebSocket + polling fallback)
- ✅ Page de confirmation avec gestion d'erreurs complète
- ✅ Rate limiting multi-niveaux et anti-spam
- ✅ Logs d'audit complets avec interface d'administration
- ✅ Intégration transparente avec Supabase Auth

## 📋 Prérequis

- ✅ Projet Supabase configuré
- ✅ Compte Resend configuré
- ✅ React + TypeScript + Vite
- ✅ Supabase CLI (pour déployer les fonctions)

## 🛠️ Installation

### 1. Base de Données

Exécutez la migration SQL dans votre projet Supabase :

```bash
# Via Supabase CLI
supabase migration add create_email_confirmation_system
# Copiez le contenu de db_migrations/20250918_create_email_confirmation_system.sql
supabase db push

# Ou directement dans l'interface Supabase
# SQL Editor > Nouveau > Coller le contenu de la migration
```

### 2. Variables d'Environnement

Ajoutez dans votre projet Supabase (Project Settings > Edge Functions) :

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SITE_URL=https://votre-domaine.com
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Déploiement des Edge Functions

```bash
# Déployer la fonction d'envoi d'email
supabase functions deploy send-confirmation-email

# Déployer la fonction de confirmation
supabase functions deploy confirm-email
```

### 4. Configuration Resend

Dans votre compte Resend :
1. Ajoutez votre domaine
2. Configurez les DNS (SPF, DKIM)
3. Vérifiez le domaine
4. Testez l'envoi

### 5. Activation des Fonctionnalités

Dans votre interface Supabase :

```sql
-- Activer Realtime pour les mises à jour en temps réel
ALTER PUBLICATION supabase_realtime ADD TABLE email_confirmations;

-- Optionnel : Activer le nettoyage automatique avec pg_cron
SELECT cron.schedule(
  'cleanup-expired-email-confirmations', 
  '0 2 * * *', 
  'SELECT cleanup_expired_email_confirmations();'
);
```

## 🔧 Configuration

### Variables de Configuration

Modifiez [`src/config/emailConfirmation.ts`](src/config/emailConfirmation.ts) selon vos besoins :

```typescript
export const EMAIL_CONFIRMATION_CONFIG = {
  TOKEN_EXPIRY_HOURS: 24,        // Durée de validité des tokens
  RESEND_COOLDOWN_SECONDS: 60,   // Cooldown entre les renvois
  RATE_LIMITS: {
    PER_EMAIL_PER_HOUR: 10,      // Limite par email
    PER_IP_PER_HOUR: 15,         // Limite par IP
    PER_USER_PER_HOUR: 5,        // Limite par utilisateur
  },
  // ... autres paramètres
};
```

### Templates Email

Personnalisez les templates dans [`supabase/functions/send-confirmation-email/index.ts`](supabase/functions/send-confirmation-email/index.ts).

## 🎯 Utilisation

### Inscription avec Confirmation

```typescript
// Dans votre composant d'inscription
import { EmailConfirmationModal } from '@/components/auth/EmailConfirmationModal';
import { emailConfirmationService } from '@/services/emailConfirmationService';

// Après inscription réussie
const result = await emailConfirmationService.sendConfirmationEmail({
  email: userEmail,
  userId: user.id,
});

if (result.success) {
  setShowEmailConfirmationModal(true);
}
```

### Vérification dans les Composants

```typescript
// Guard pour bloquer l'accès
import { EmailConfirmationGuard } from '@/components/auth/EmailConfirmationGuard';

<EmailConfirmationGuard user={user} fallbackMode="block">
  <VotreContenuProtégé />
</EmailConfirmationGuard>

// Banner non-bloquant
<EmailConfirmationGuard user={user} fallbackMode="banner">
  <VotreContenu />
</EmailConfirmationGuard>
```

### Interface Profil Utilisateur

```typescript
// Dans le profil utilisateur
import { EmailConfirmationSection } from '@/components/auth/EmailConfirmationSection';

<EmailConfirmationSection user={user} />
```

## 🔐 Sécurité

### Rate Limiting Automatique

Le système implémente plusieurs niveaux de protection :
- **Par email** : 10 tentatives/heure
- **Par IP** : 15 tentatives/heure  
- **Par utilisateur** : 5 tentatives/heure
- **Global** : 1000 tentatives/heure

### Tokens Sécurisés

- Génération cryptographique (32 bytes)
- Hashage SHA-256 avant stockage
- Expiration automatique (24h)
- Usage unique

### Logs d'Audit

Toutes les actions sont loggées :
- Envois d'emails
- Clics sur les liens
- Confirmations réussies
- Tentatives d'accès
- Erreurs et échecs

## 📊 Administration

Accédez à l'interface d'administration : `/admin/email-confirmations`

### Fonctionnalités Admin

- 📈 **Métriques** : Taux de confirmation, temps moyen, activité
- 📝 **Logs** : Audit complet avec filtrage et export CSV
- 🧹 **Nettoyage** : Suppression manuelle des tokens expirés
- 🔒 **Sécurité** : Monitoring des tentatives suspectes

### Actions Admin Disponibles

```typescript
// Confirmer manuellement un email
await emailConfirmationAdminService.manuallyConfirmEmail(userId, 'Demande support');

// Expirer un token
await emailConfirmationAdminService.expireConfirmation(confirmationId, 'Sécurité');

// Export des logs
const csvData = await emailConfirmationAdminService.exportLogs();
```

## 🚀 Workflow Utilisateur

1. **Inscription** → Envoi automatique email confirmation
2. **Modal d'attente** → Affichage temps réel avec possibilité de renvoi
3. **Clic lien email** → Redirection vers page de confirmation
4. **Validation token** → Activation compte + fermeture auto modal
5. **Redirection** → Dashboard selon le rôle utilisateur

## 🔄 Maintenance

### Nettoyage Automatique

```sql
-- Programmé automatiquement (si pg_cron activé)
SELECT cleanup_expired_email_confirmations();
```

### Monitoring

Surveillez ces métriques :
- Taux de confirmation (objectif : >85%)
- Temps moyen de confirmation (objectif : <30min)
- Taux d'échec d'envoi (objectif : <5%)
- Tentatives suspectes

### Optimisations

- **Cache** : Les statuts sont mis en cache côté client
- **Realtime** : WebSocket pour les mises à jour instantanées
- **Fallback** : Polling si WebSocket échoue
- **Performance** : Index optimisés pour les requêtes fréquentes

## 🐛 Dépannage

### Problèmes Courants

**❌ Email non reçu**
- Vérifier la configuration Resend
- Contrôler les DNS du domaine
- Vérifier les logs d'erreur

**❌ Token invalide**
- Vérifier l'expiration (24h max)
- Contrôler l'unicité du token
- Vérifier les logs d'accès

**❌ Rate limiting**
- Attendre la fin du cooldown
- Vérifier les limites en base
- Réinitialiser si nécessaire

### Logs Utiles

```sql
-- Voir les erreurs récentes
SELECT * FROM email_confirmation_logs 
WHERE success = false 
ORDER BY created_at DESC LIMIT 50;

-- Voir les tentatives pour un email
SELECT * FROM email_confirmations 
WHERE email = 'user@example.com' 
ORDER BY created_at DESC;

-- Voir le rate limiting
SELECT * FROM check_email_confirmation_rate_limit(
  'user@example.com'::text, 
  '192.168.1.1'::inet, 
  'user-uuid'::uuid
);
```

## 📈 Métriques de Succès

### KPIs à Surveiller

- **Taux de confirmation** : % d'emails confirmés / envoyés
- **Temps de confirmation** : Temps moyen entre envoi et confirmation
- **Taux de renvoi** : % d'utilisateurs qui renvoient l'email
- **Taux d'abandon** : % d'utilisateurs qui n'activent jamais
- **Performance technique** : Temps de réponse des Edge Functions

### Objectifs Recommandés

- Taux de confirmation : **>85%**
- Temps moyen de confirmation : **<30 minutes**
- Temps de réponse API : **<500ms**
- Disponibilité du service : **>99.9%**

## 🔮 Évolutions Futures

### Fonctionnalités Planifiées

- [ ] Templates email personnalisables via interface
- [ ] Notifications push en complément
- [ ] A/B testing des templates
- [ ] Analytics avancées avec graphiques
- [ ] API publique pour intégrations tierces
- [ ] Webhooks pour événements de confirmation
- [ ] Intégration avec outils marketing

### Optimisations Possibles

- [ ] Cache Redis pour les tokens fréquemment accédés
- [ ] CDN pour les assets email
- [ ] Compression des logs anciens
- [ ] Machine learning pour détecter les patterns suspects

---

## 📞 Support

Pour toute question ou problème :
- 📧 Email : support@aurentia.fr
- 📚 Documentation : Cette documentation
- 🐛 Issues : Créer un ticket dans le système de suivi

**Système développé avec ❤️ pour Aurentia**