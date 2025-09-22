# 🏢 Onboarding des Structures d'Accompagnement - Aurentia

## 📋 Vue d'ensemble

Ce système fournit un flow complet d'onboarding en plusieurs étapes pour les structures d'accompagnement (incubateurs, accélérateurs, etc.) qui s'inscrivent sur Aurentia.

## 🎯 Fonctionnalités Implémentées

### 1. **Flow d'Inscription Complet**
- **Étape 1** : Création du compte utilisateur Aurentia (profil owner)
- **Étape 2** : Configuration de base de l'organisation
- **Étape 3** : Onboarding détaillé en 6 étapes

### 2. **Onboarding en 6 Étapes**

#### **Étape 1 : Informations générales**
- Description de l'organisation
- Année de création
- Taille de l'équipe
- Site web
- Adresse

#### **Étape 2 : Mission, Vision & Valeurs**
- Mission de l'organisation
- Vision à long terme
- Valeurs fondamentales (tags dynamiques)

#### **Étape 3 : Spécialisations**
- Secteurs d'activité ciblés
- Stades d'accompagnement
- Domaines d'expertise

#### **Étape 4 : Méthodologie**
- Méthodologie d'accompagnement
- Durée moyenne des programmes
- Critères de succès
- Types de support offerts

#### **Étape 5 : Portée et Contact**
- Zones géographiques d'intervention
- Réseaux sociaux (LinkedIn, Twitter)

#### **Étape 6 : Paramètres de Visibilité**
- Profil public (visible dans les annuaires)
- Candidatures directes autorisées
- Récapitulatif des informations

## 🛠️ Architecture Technique

### **Composants Créés**

1. **`OrganisationOnboarding.tsx`**
   - Interface d'onboarding multi-étapes
   - Inspiré du design de FormBusinessIdea
   - Gestion des données de formulaire complexes
   - Validation et sauvegarde progressive

2. **`OrganisationFlowWrapper.tsx`**
   - Orchestration du flow complet
   - Gestion des transitions entre setup et onboarding
   - Vérification du statut d'onboarding existant

3. **`OrganisationSetupForm.tsx`** (Existant - Amélioré)
   - Configuration de base de l'organisation
   - Première étape du processus

### **Base de Données**

#### **Migration Créée :** `20250921_add_organization_onboarding_fields.sql`

Nouveaux champs ajoutés à la table `organizations` :

```sql
-- Informations détaillées
description TEXT
founded_year INTEGER
mission TEXT
vision TEXT
values JSONB DEFAULT '[]'
sectors JSONB DEFAULT '[]'
stages JSONB DEFAULT '[]'
geographic_focus JSONB DEFAULT '[]'
team_size INTEGER
specializations JSONB DEFAULT '[]'
methodology TEXT
program_duration_months INTEGER
success_criteria TEXT
support_types JSONB DEFAULT '[]'
social_media JSONB DEFAULT '{}'

-- Paramètres de visibilité
is_public BOOLEAN DEFAULT true
allow_direct_applications BOOLEAN DEFAULT true

-- Gestion de l'onboarding
onboarding_completed BOOLEAN DEFAULT false
onboarding_step INTEGER DEFAULT 0
```

#### **Politiques RLS**
- Organisations publiques visibles par tous
- Créateurs et staff peuvent voir/modifier leurs données

### **Services Étendus**

#### **`organisationService.ts`** - Nouvelles Fonctions :

```typescript
// Gestion de l'onboarding
getOnboardingStatus(organizationId: string)
completeOnboarding(organizationId: string)
saveOnboardingStep(organizationId: string, step: number, stepData: any)
```

## 🔄 Flow d'Utilisation

### **1. Inscription Nouvelle Structure**
```
Signup.tsx → Sélection "Structure d'accompagnement" 
→ OrganisationFlowWrapper 
→ OrganisationSetupForm (config de base)
→ OrganisationOnboarding (6 étapes détaillées)
→ Redirection vers /organisation/{id}/dashboard
```

### **2. Reprise d'Onboarding**
```
Si organisation existe mais onboarding_completed = false
→ OrganisationFlowWrapper détecte automatiquement
→ Reprend directement à OrganisationOnboarding
```

### **3. Affichage des Données**
```
OrganisationProfile.tsx lit maintenant toutes les données d'onboarding
Affichage complet des informations saisies
Possibilité d'édition des champs de base
```

## 🎨 UX/UI Features

### **Design Inspiré de FormBusinessIdea**
- **Indicateur de progression** avec étapes visuelles
- **Animations de transition** entre les étapes
- **Validation en temps réel**
- **Interface responsive** mobile-friendly
- **Couleurs thématiques** Aurentia (pink/orange)

### **Interactions Avancées**
- **Tags dynamiques** pour secteurs, stages, spécialisations
- **Champs personnalisés** ajoutables par l'utilisateur
- **Popup d'édition** pour textes longs
- **Boutons toggle** pour paramètres booléens
- **Récapitulatif final** avant validation

## 📊 Données Collectées

### **Informations Stratégiques**
- Mission, vision, valeurs
- Méthodologie d'accompagnement
- Critères de succès

### **Ciblage**
- Secteurs d'activité (Tech, Fintech, etc.)
- Stades d'investissement (Pré-seed, Seed, etc.)
- Zones géographiques

### **Opérationnel**
- Taille équipe
- Durée programmes
- Types de support

### **Marketing**
- Réseaux sociaux
- Visibilité publique
- Candidatures directes

## 🔧 Configuration & Déploiement

### **1. Exécuter la Migration**
```sql
-- Appliquer la migration sur la base de données
psql -d aurentia -f db_migrations/20250921_add_organization_onboarding_fields.sql
```

### **2. Vérifier les Imports**
```typescript
// Dans les composants utilisant l'onboarding
import OrganisationFlowWrapper from "@/components/organisation/OrganisationFlowWrapper";
```

### **3. Tester le Flow**
1. Aller sur `/signup`
2. Sélectionner "Structure d'accompagnement"
3. Compléter le formulaire d'inscription
4. Suivre le flow d'onboarding complet
5. Vérifier l'affichage dans `/organisation/{id}/profile`

## 🚀 Prochaines Améliorations

### **Court Terme**
- [ ] Ajout de validation avancée par étape
- [ ] Sauvegarde automatique (brouillon)
- [ ] Import de données depuis LinkedIn/site web
- [ ] Prévisualisation du profil public

### **Moyen Terme**
- [ ] Onboarding adaptatif selon le type d'organisation
- [ ] Intégration avec système de matching entrepreneurs
- [ ] Analytics d'onboarding (taux de completion, etc.)
- [ ] Workflows d'approbation pour profils publics

### **Long Terme**
- [ ] IA pour suggestions de contenu
- [ ] Intégration API partenaires (CRM, etc.)
- [ ] Système de scoring/qualité de profil
- [ ] Multi-langues pour organisations internationales

## 🧪 Tests Recommandés

### **Scénarios de Test**
1. **Nouvel utilisateur complet** - Flow de A à Z
2. **Interruption/reprise** - Fermer navigateur et revenir
3. **Validation des données** - Champs requis, formats
4. **Affichage mobile** - Responsive design
5. **Données persistées** - Vérification en base
6. **Profil public** - Visibilité et permissions

### **Cas d'Erreur**
- Connexion internet interrompue
- Session expirée pendant l'onboarding
- Données invalides/corrompues
- Conflits de simultanéité

---

## 📞 Support Technique

Pour toute question sur l'implémentation ou l'utilisation de ce système d'onboarding, référez-vous aux fichiers de code source ou contactez l'équipe de développement.

**Fichiers Principaux :**
- `/src/components/organisation/OrganisationOnboarding.tsx`
- `/src/components/organisation/OrganisationFlowWrapper.tsx`
- `/src/pages/organisation/OrganisationProfile.tsx`
- `/src/services/organisationService.ts`
- `/db_migrations/20250921_add_organization_onboarding_fields.sql`