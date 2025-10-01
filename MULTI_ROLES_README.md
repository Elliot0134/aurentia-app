# 🚀 Architecture Multi-Rôles Aurentia

## Vue d'ensemble

L'application Aurentia supporte maintenant un système multi-tenant avec 4 types d'utilisateurs et des interfaces dédiées :

## 🎭 Types d'Utilisateurs

### 1. **Individual** (Particuliers)
- **Rôle** : `individual`
- **Chemin** : `/individual/*`
- **Inscription** : Libre, sans code d'invitation
- **Fonctionnalités** : Interface actuelle complète

### 2. **Member** (Entrepreneurs d'incubateur)
- **Rôle** : `member`
- **Chemin** : `/member/*`
- **Inscription** : Avec code d'invitation `incubator_member`
- **Fonctionnalités** : Interface individual + espace incubateur

### 3. **Admin** (Administrateurs d'incubateur)
- **Rôle** : `admin`
- **Chemin** : `/admin/*`
- **Inscription** : Avec code d'invitation `incubator_main_admin`
- **Fonctionnalités** : Interface de gestion d'incubateur

### 4. **Super Admin** (Équipe Aurentia)
- **Rôle** : `super_admin`
- **Chemin** : `/super-admin/*`
- **Inscription** : Avec code d'invitation `super_admin`
- **Fonctionnalités** : Administration globale de la plateforme

## 🔑 Codes d'Invitation de Test

Les codes suivants ont été créés pour les tests :

- **`ADMIN-STATION-F-TEST`** : Code administrateur pour Station F Test
- **`MEMBER-STATION-F-TEST`** : Code membre pour Station F Test  
- **`SUPER-ADMIN-TEST`** : Code super administrateur

## 🏗️ Structure Technique

### Base de Données

#### Nouvelles Tables
- **`organizations`** : Stockage des incubateurs/accélérateurs
- **`invitation_code`** : Codes d'invitation avec gestion d'usage

#### Tables Modifiées
- **`profiles`** : Ajout de `user_role`, `organization_id`, `invitation_code_used`

### Types TypeScript
- **`src/types/userTypes.ts`** : Types pour les rôles et organisations
- **`UserRole`** : 'individual' | 'member' | 'admin' | 'super_admin'
- **`InvitationType`** : 'super_admin' | 'incubator_main_admin' | 'incubator_member'

### Services
- **`src/services/invitationService.ts`** : Validation et utilisation des codes
- **`validateInvitationCode()`** : Vérifie validité d'un code
- **`useInvitationCode()`** : Utilise un code pour un utilisateur

### Hooks
- **`src/hooks/useUserProfile.tsx`** : Récupération profil + organisation
- **`src/hooks/useUserRole.tsx`** : Gestion des rôles et permissions

### Composants
- **`src/components/RoleBasedLayout.tsx`** : Layout adaptatif selon le rôle
- **`src/components/RoleBasedSidebar.tsx`** : Sidebar dynamique selon le rôle
- **`src/components/RoleBasedRedirect.tsx`** : Redirection automatique selon le rôle

### Pages Spécifiques
- **`src/pages/member/IncubatorSpace.tsx`** : Espace incubateur pour entrepreneurs
- **`src/pages/admin/AdminDashboard.tsx`** : Dashboard administrateur
- **`src/pages/super-admin/SuperAdminDashboard.tsx`** : Dashboard super admin

## 🔒 Sécurité RLS

### Politiques Implémentées

#### Organizations
- Members peuvent voir leur organisation
- Admins peuvent gérer leur organisation
- Super admins peuvent gérer toutes les organisations

#### Invitation Codes
- Public peut valider les codes (pour inscription)
- Admins peuvent gérer les codes de leur organisation
- Super admins peuvent gérer tous les codes

#### Profiles
- Utilisateurs peuvent gérer leur propre profil
- Admins peuvent voir les profils de leur organisation
- Super admins peuvent voir tous les profils

#### Project Data
- Utilisateurs voient leurs propres projets
- Members/Admins voient les projets de leur organisation
- Super admins voient tous les projets

## 🚀 Flux d'Inscription

### 1. Sans Code d'Invitation
1. Utilisateur va sur `/signup`
2. Clique "S'inscrire sans code"
3. Remplit le formulaire
4. → Redirigé vers `/individual/dashboard`

### 2. Avec Code d'Invitation
1. Utilisateur va sur `/signup`
2. Saisit un code d'invitation
3. ✅ Validation en temps réel avec feedback
4. Remplit le formulaire
5. → Redirigé vers `/{role}/dashboard` approprié

## 🎨 Personnalisation par Organisation

Chaque organisation peut personnaliser :
- **Nom et logo** dans la sidebar
- **Couleurs primaire/secondaire**
- **Message de bienvenue**
- **Newsletter** (activé/désactivé)

## 📱 Routing Dynamique

### Auto-redirection
- Connexion → redirection automatique vers `/{user_role}/dashboard`
- URL legacy → redirection vers chemins basés sur les rôles

### Chemins par Rôle
```
/individual/*  → Interface standard
/member/*      → Interface + espace incubateur  
/admin/*       → Interface gestion incubateur
/super-admin/* → Administration globale
```

## 🧪 Tests

### Codes d'Invitation à Tester
1. **MEMBER-STATION-F-TEST** : Test entrepreneur
2. **ADMIN-STATION-F-TEST** : Test administrateur
3. **SUPER-ADMIN-TEST** : Test super admin

### Scénarios de Test
1. ✅ Inscription sans code → rôle `individual`
2. ✅ Inscription avec code membre → rôle `member` + organisation
3. ✅ Inscription avec code admin → rôle `admin` + organisation
4. ✅ Inscription avec code super admin → rôle `super_admin`
5. ✅ Redirection automatique selon le rôle
6. ✅ Sidebar adaptée selon le rôle et l'organisation
7. ✅ Sécurité RLS fonctionnelle

## 🔄 Migration des Données Existantes

Pour migrer les utilisateurs existants :

```sql
-- Migrer les anciens utilisateurs vers le nouveau système
UPDATE profiles 
SET user_role = CASE 
  WHEN user_type = 'particulier' THEN 'individual'
  WHEN user_type = 'pro' AND is_member = true THEN 'admin'
  WHEN user_type = 'incubator_member' THEN 'member'
  ELSE 'individual'
END
WHERE user_role IS NULL;
```

## 🚀 Déploiement

L'architecture est maintenant prête pour :
1. **Multi-tenancy** avec organisations
2. **Codes d'invitation** sécurisés
3. **Interfaces dédiées** par rôle
4. **Sécurité RLS** complète
5. **Scalabilité** pour nouveaux incubateurs

## 📋 Prochaines Étapes

1. **Tests end-to-end** avec vrais utilisateurs
2. **Pages admin/super-admin** complètes
3. **Analytics** par organisation
4. **Système de facturation** multi-tenant
5. **Domaines personnalisés** par organisation