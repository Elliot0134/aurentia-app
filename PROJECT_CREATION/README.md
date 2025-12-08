# 📦 Code de Création de Projet pour Next.js

Ce dossier contient le code prêt à l'emploi pour la création de projet (onboarding projet) adapté pour **Next.js App Router**.

## 📁 Structure

```
PROJECT_CREATION/
├── README.md                   # Ce fichier
├── code/
│   ├── components/
│   │   └── CreateProjectFlow.tsx    # Composant principal (adapté Next.js)
│   └── types/
│       └── projectCreation.ts       # Types TypeScript
└── (les slides sont à copier depuis src/components/project/slides/)
```

## 🚀 Installation rapide

### 1. Copier les fichiers

```bash
# Depuis le dossier racine du projet Next.js

# Types
cp PROJECT_CREATION/code/types/projectCreation.ts src/types/

# Composant principal
cp PROJECT_CREATION/code/components/CreateProjectFlow.tsx src/components/project/

# Slides (depuis le projet original)
cp -r src/components/project/slides src/components/project/
```

### 2. Adapter les slides pour Next.js

Ajouter `'use client';` en première ligne de chaque slide :
- `StepBasicInfo.tsx`
- `StepProductsServices.tsx`
- `StepClientele.tsx`
- `StepNeeds.tsx`
- `StepTypeLocation.tsx`
- `StepTeam.tsx`
- `StepAdditionalInfo.tsx`
- `StepConfirmation.tsx`
- `StepRetranscription.tsx`

### 3. Créer le client Supabase

Fichier `lib/supabase/client.ts` :

```typescript
import { createBrowserClient } from '@supabase/ssr';

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
```

### 4. Créer la page

Fichier `app/create-project/page.tsx` :

```typescript
import CreateProjectFlow from '@/components/project/CreateProjectFlow';

export default function CreateProjectPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <CreateProjectFlow />
    </div>
  );
}
```

### 5. Installer les dépendances

```bash
pnpm add framer-motion sonner lucide-react @supabase/ssr
```

## ⚙️ Configuration

### Variables d'environnement

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### URLs des webhooks

Dans `CreateProjectFlow.tsx`, adaptez les URLs si nécessaire :

```typescript
const WEBHOOK_RETRANSCRIPTION = 'https://n8n.srv906204.hstgr.cloud/webhook/form-business-idea';
const WEBHOOK_SUBMIT = 'https://n8n.srv906204.hstgr.cloud/webhook/retranscription';
```

## 📋 Tables Supabase requises

- `profiles` - Profils utilisateurs
- `form_business_idea` - Données brutes du formulaire
- `project_summary` - Résumé enrichi du projet
- `organizations` - Organisations (optionnel)
- `user_organizations` - Liens utilisateur-organisation (optionnel)

## 🔗 Documentation complète

Voir le fichier `PROJECT_CREATION_ONBOARDING.md` à la racine pour :
- Architecture détaillée
- Schéma des tables Supabase
- Payloads des webhooks
- Guide de migration complet
