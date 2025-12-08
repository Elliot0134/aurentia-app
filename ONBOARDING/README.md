# 🚀 Aurentia Onboarding - Documentation Complète

## Vue d'ensemble

Ce dossier contient tout le code et la documentation nécessaires pour implémenter le flow d'onboarding d'Aurentia dans un projet **Next.js**.

L'onboarding original a été développé en **React + Vite** avec **Framer Motion** pour les animations et **Supabase** pour la persistance des données.

---

## 📁 Structure des fichiers

```
ONBOARDING/
├── README.md                           # Ce fichier (guide principal)
├── NEXTJS_MIGRATION.md                 # Guide de migration React → Next.js
├── code/
│   ├── components/
│   │   └── onboarding/
│   │       ├── OnboardingFlow.tsx      # 🎯 Orchestrateur principal
│   │       ├── ProgressDots.tsx        # Indicateur de progression
│   │       └── slides/
│   │           ├── ThemeSelection.tsx      # Étape 1: Choix du thème
│   │           ├── PersonalInfo.tsx        # Étape 2: Infos personnelles
│   │           ├── DiscoverySource.tsx     # Étape 3: Source de découverte
│   │           ├── UserTypeSelection.tsx   # Étape 4: Type d'utilisateur
│   │           ├── GoalsSelection.tsx      # Étape 5: Objectifs
│   │           └── PlanSelection.tsx       # Étape 6: Choix du plan
│   ├── types/
│   │   └── onboarding.ts               # Types TypeScript
│   ├── hooks/
│   │   └── useOnboardingStatus.ts      # Hook de vérification du statut
│   └── pages/
│       └── Onboarding.tsx              # Page wrapper (clean, sans navbar)
└── database/
    └── migration.sql                   # Migration Supabase
```

---

## 🎯 Flow de l'onboarding

### Étapes conditionnelles

| Étape | Composant | Description | Condition |
|-------|-----------|-------------|-----------|
| 1 | `ThemeSelection` | Choix light/dark | Toujours |
| 2 | `PersonalInfo` | Nom, date naissance, pays, langue | Toujours |
| 3 | `DiscoverySource` | Comment as-tu connu Aurentia ? | Toujours |
| 4 | `UserTypeSelection` | Entrepreneur / Dreamer / Structure | Toujours |
| 5 | `GoalsSelection` | Objectifs (dynamiques selon userType) | Toujours |
| 6 | `PlanSelection` | Gratuit / Accessible | **Seulement si** `userType !== 'structure'` |

### Logique de navigation

- **Entrepreneurs/Dreamers** : 6 étapes (incluant le choix du plan)
- **Structures** : 5 étapes (pas de choix de plan)

---

## 🎨 Assets requis - Icônes

### Dossier `/public/icones/`

| Fichier | Utilisé dans |
|---------|--------------|
| `ampoule-icon.png` | UserTypeSelection (Dreamer), GoalsSelection |
| `fusee-icon.png` | UserTypeSelection (Entrepreneur) |
| `building-icon.png` | UserTypeSelection (Structure), GoalsSelection |
| `check-icon.png` | GoalsSelection |
| `roadmap-icon.png` | GoalsSelection |
| `chatbot-icon.png` | GoalsSelection |
| `ai-tool-icon.png` | GoalsSelection |
| `automation-icon.png` | GoalsSelection |
| `projet-icon.png` | GoalsSelection |
| `ressources-icon.png` | GoalsSelection |

### Dossier `/public/icones-livrables/`

| Fichier | Utilisé dans |
|---------|--------------|
| `partenaires-icon.png` | GoalsSelection |
| `persona-icon.png` | GoalsSelection (Structure) |

---

## 🗄️ Base de données (Supabase)

### Colonnes ajoutées à la table `profiles`

```sql
onboarding_completed  BOOLEAN   DEFAULT FALSE
onboarding_data       JSONB     -- Toutes les réponses en JSON
theme_preference      TEXT      DEFAULT 'light'
preferred_language    TEXT      DEFAULT 'fr'
```

### Structure du `onboarding_data` (JSONB)

```typescript
{
  theme: 'light' | 'dark',
  firstName: string,
  birthDate: { day: string, month: string, year: string },
  country: string,               // Code ISO alpha3
  preferredLanguage: string,     // 'fr', 'en', 'es'
  marketingOptIn: boolean,
  discoverySource: string,
  userType: 'entrepreneur' | 'dreamer' | 'structure',
  goals: string[],
  selectedPlan: 'free' | 'accessible',
  completedAt: string            // ISO timestamp
}
```

---

## 📦 Dépendances requises

```bash
# Animation
pnpm add framer-motion

# UI (si tu utilises shadcn/ui)
pnpm add @radix-ui/react-checkbox
pnpm add @radix-ui/react-select

# Icons
pnpm add lucide-react

# Supabase (si pas déjà installé)
pnpm add @supabase/supabase-js
```

---

## 🎭 Animations clés

### Transitions entre slides

```typescript
const slideVariants = {
  enter: { x: 50, opacity: 0, filter: 'blur(10px)' },
  center: { x: 0, opacity: 1, filter: 'blur(0px)' },
  exit: { x: -50, opacity: 0, filter: 'blur(10px)' },
};
```

### Bouton mobile avec remplissage progressif

Le bouton circulaire sur mobile se remplit progressivement de orange au fur et à mesure de la progression :

```typescript
const progressPercentage = ((currentStep + 1) / totalSteps) * 100;
// Animation de height du gradient de 0% à 100%
```

### Effet "wave" ambiant

Effet radial continu sur le bouton mobile pour attirer l'attention.

---

## 🎨 Design System

### Couleurs principales

| Variable | Valeur | Usage |
|----------|--------|-------|
| Primary | `#FF6B35` | Orange Aurentia |
| Primary Light | `#FF8A5B` | Gradient |
| Text | `#333333` | Texte principal |
| Background | `white` / `gray-950` | Light/Dark mode |

### Police

- **Font Family** : Poppins
- **Titres** : `font-bold text-3xl md:text-4xl`
- **Labels** : `font-semibold text-[17px]`
- **Body** : `font-poppins text-sm`

### Spacing

- **Cards** : `rounded-2xl p-6` ou `p-8`
- **Gaps** : `gap-4` à `gap-6`
- **Max width** : `max-w-2xl` à `max-w-5xl` selon les slides

---

## ✅ Checklist d'implémentation

- [ ] Copier les types dans `/types/onboarding.ts`
- [ ] Créer les composants dans `/components/onboarding/`
- [ ] Ajouter les icônes dans `/public/icones/`
- [ ] Exécuter la migration SQL
- [ ] Adapter les imports pour Next.js (voir `NEXTJS_MIGRATION.md`)
- [ ] Créer la route `/onboarding`
- [ ] Ajouter la logique de redirection pour les nouveaux users
- [ ] Tester le flow complet

---

## 🔗 Fichiers associés

- Voir `NEXTJS_MIGRATION.md` pour les adaptations spécifiques Next.js
- Les fichiers de code source sont dans le dossier `code/`
- La migration SQL est dans `database/migration.sql`
