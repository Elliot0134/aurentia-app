# 🚀 Documentation Complète - Création de Projet (Onboarding Projet)

## Vue d'ensemble

Ce document détaille l'architecture complète du flow de **création de projet** dans Aurentia (anciennement l'onboarding projet). Ce flow permet aux utilisateurs de créer un nouveau projet business avec génération automatique de livrables via des webhooks N8N.

---

## 📁 Architecture des fichiers (React / Vite)

```
src/
├── pages/
│   └── individual/
│       └── CreateProjectForm.tsx           # Page wrapper
├── components/
│   └── project/
│       ├── CreateProjectFlow.tsx           # 🎯 Orchestrateur principal
│       ├── ProjectScoreCards.tsx           # Cartes de score (optionnel)
│       └── slides/
│           ├── StepBasicInfo.tsx           # Étape 1: Nom + Description
│           ├── StepProductsServices.tsx    # Étape 2: Produits/Services
│           ├── StepClientele.tsx           # Étape 3: Clientèle cible
│           ├── StepNeeds.tsx               # Étape 4: Besoins
│           ├── StepTypeLocation.tsx        # Étape 5: Type projet + Localisation
│           ├── StepTeam.tsx                # Étape 6: Équipe
│           ├── StepAdditionalInfo.tsx      # Étape 7: Infos supplémentaires
│           ├── StepConfirmation.tsx        # Étape 8: Récapitulatif
│           ├── StepRetranscription.tsx     # Étape 9: Retranscription IA
│           └── MarkdownEditableField.tsx   # Composant de champ éditable
├── types/
│   └── projectCreation.ts                  # Types TypeScript
├── hooks/
│   └── useFreeDeliverableProgress.ts       # Hook pour suivi livrables
└── contexts/
    └── ProjectContext.tsx                  # Context des projets
```

---

## 🎯 Flow de création de projet

### Les 9 étapes

| Étape | Composant | Description | Champs |
|-------|-----------|-------------|--------|
| 0 | `StepBasicInfo` | Informations de base | `projectName`, `projectIdeaSentence` |
| 1 | `StepProductsServices` | Produits & Services | `productsServices`, `problemSolved` |
| 2 | `StepClientele` | Clientèle cible | `clienteleCible` |
| 3 | `StepNeeds` | Besoins | `needs` |
| 4 | `StepTypeLocation` | Type + Localisation | `projectType`, `geographicArea` |
| 5 | `StepTeam` | Équipe | `teamSize` |
| 6 | `StepAdditionalInfo` | Infos supplémentaires | `additionalInfo`, `whyEntrepreneur` |
| 7 | `StepConfirmation` | Récapitulatif | (lecture seule) |
| 8 | `StepRetranscription` | Retranscription IA | Champs pré-remplis + éditables |

### Logique de validation (`canProceed`)

```typescript
const canProceed = () => {
  switch (currentStep) {
    case 0: return !!data.projectName && !!data.projectIdeaSentence;
    case 1: return !!data.productsServices && !!data.problemSolved;
    case 2: return !!data.clienteleCible;
    case 3: return !!data.needs;
    case 4: return !!data.projectType && (data.projectType === 'Digital' || !!data.geographicArea);
    case 5: return !!data.teamSize;
    case 6: return true; // Champs optionnels
    case 7: return true; // Page de confirmation
    case 8: return true; // Retranscription (pré-remplie)
    default: return false;
  }
};
```

---

## 🗄️ Tables Supabase utilisées

### Table principale: `form_business_idea`

Stocke les données brutes du formulaire.

```sql
CREATE TABLE public.form_business_idea (
  user_id uuid NOT NULL,
  project_id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  nom_projet text,
  produit_service text,
  reponse_besoin text,
  clients_type text,
  moyens_minimum text,
  type_projet text,
  localisation text,
  project_sentence text,
  other_infos text,
  motivations_entrepreneur text,
  equipe_fondatrice text,
  organization_id uuid,
  CONSTRAINT form_business_idea_pkey PRIMARY KEY (project_id),
  CONSTRAINT form_business_idea_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT form_business_idea_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id)
);
```

### Table liée: `project_summary`

Stocke le résumé enrichi du projet (après traitement IA).

```sql
CREATE TABLE public.project_summary (
  project_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  nom_projet text,
  description_synthetique text,
  produit_service text,
  proposition_valeur text,
  problemes text,
  elements_distinctifs text,
  public_cible text,
  user_id uuid,
  Marche_cible text,
  project_location text,
  project_type text,
  Motivation_entrepreneur text,
  equipe_fondatrice text,
  
  -- Statuts des livrables
  statut_project text,
  statut_persona_express text,
  statut_mini_swot text,
  statut_pitch text,
  statut_concurrence text,
  statut_business_model text,
  statut_proposition_valeur text,
  -- ... autres statuts
  
  CONSTRAINT project_summary_pkey PRIMARY KEY (project_id),
  CONSTRAINT project_summary_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.form_business_idea(project_id),
  CONSTRAINT project_summary_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
```

### Mapping des champs Form → Supabase

| Champ Frontend | Colonne `form_business_idea` |
|----------------|------------------------------|
| `projectName` | `nom_projet` |
| `projectIdeaSentence` | `project_sentence` |
| `productsServices` | `produit_service` |
| `problemSolved` | `reponse_besoin` |
| `clienteleCible` | `clients_type` |
| `needs` | `moyens_minimum` |
| `projectType` | `type_projet` |
| `geographicArea` | `localisation` |
| `additionalInfo` | `other_infos` |
| `whyEntrepreneur` | `motivations_entrepreneur` |
| `teamSize` | `equipe_fondatrice` |

---

## 🔗 Webhooks N8N

### 1. Webhook de génération de retranscription

**Appelé à:** Step 7 → Step 8

**URL:** `https://n8n.srv906204.hstgr.cloud/webhook/form-business-idea`

**Payload envoyé:**

```typescript
const formData = {
  userId: session?.user?.id || null,
  projectName: data.projectName,
  projectIdeaSentence: data.projectIdeaSentence,
  productsServices: data.productsServices,
  problemSolved: data.problemSolved,
  clienteleCible: data.clienteleCible,
  needs: data.needs,
  projectType: data.projectType,
  geographicArea: data.projectType === 'Physique' || data.projectType === 'Les deux' ? data.geographicArea : '',
  additionalInfo: data.additionalInfo,
  whyEntrepreneur: data.whyEntrepreneur,
  teamSize: data.teamSize,
  organizationId: selectedOrganization === 'none' ? null : selectedOrganization || null,
};
```

**Réponse attendue:**

```typescript
const webhookResponse = {
  DescriptionSynthetique: string,
  'Produit/Service': string,
  PropositionValeur: string,
  ElementDistinctif: string,
  ClienteleCible: string,
  ProblemResoudre: string,
  vision: string,           // Vision 3 ans
  BusinessModel: string,
  Compétences: string,
  MotivationEntrepreneur: string,
  team: string,             // Équipe fondatrice
  ProjectID: string,        // UUID du projet créé
};
```

### 2. Webhook de soumission finale

**Appelé à:** Step 8 (bouton "Générer mes livrables")

**URL:** `https://n8n.srv906204.hstgr.cloud/webhook/retranscription`

**Payload envoyé:**

```typescript
const finalData = {
  userId,
  projectID: data.projectID,
  projectName: data.projectName,
  
  // Données retranscrites (éditées par l'utilisateur)
  descriptionSynthetique: data.descriptionSynthetique,
  produitServiceRetranscription: data.produitServiceRetranscription,
  propositionValeur: data.propositionValeur,
  elementDistinctif: data.elementDistinctif,
  clienteleCibleRetranscription: data.clienteleCibleRetranscription,
  problemResoudreRetranscription: data.problemResoudreRetranscription,
  vision3Ans: data.vision3Ans,
  businessModel: data.businessModel,
  competences: data.competences,
  monPourquoiRetranscription: data.monPourquoiRetranscription,
  equipeFondatrice: data.equipeFondatrice,
  
  // Données originales
  productsServices: data.productsServices,
  problemSolved: data.problemSolved,
  clienteleCible: data.clienteleCible,
  needs: data.needs,
  projectType: data.projectType,
  geographicArea: data.geographicArea,
  additionalInfo: data.additionalInfo,
  whyEntrepreneur: data.whyEntrepreneur,
  teamSize: data.teamSize,
  projectIdeaSentence: data.projectIdeaSentence,
};
```

**Réponse attendue:**

```typescript
{
  project_id: string  // UUID du projet à rediriger
}
```

---

## 📝 Types TypeScript

### `ProjectCreationData`

```typescript
export interface ProjectCreationData {
  currentStep: number;

  // Step 0 - Informations de base
  projectName?: string;
  projectIdeaSentence?: string;

  // Step 1 - Produits & Services
  productsServices?: string;
  problemSolved?: string;

  // Step 2 - Clientèle
  clienteleCible?: string;

  // Step 3 - Besoins
  needs?: string;

  // Step 4 - Type & Localisation
  projectType?: 'Physique' | 'Digital' | 'Les deux' | '';
  geographicArea?: string;

  // Step 5 - Équipe
  teamSize?: string;

  // Step 6 - Informations supplémentaires
  additionalInfo?: string;
  whyEntrepreneur?: string;

  // Step 8 - Retranscription du concept (pré-rempli par webhook)
  descriptionSynthetique?: string;
  produitServiceRetranscription?: string;
  propositionValeur?: string;
  elementDistinctif?: string;
  clienteleCibleRetranscription?: string;
  problemResoudreRetranscription?: string;
  vision3Ans?: string;
  businessModel?: string;
  competences?: string;
  monPourquoiRetranscription?: string;
  equipeFondatrice?: string;

  // Meta
  projectID?: string;
  organizationId?: string | null;
}
```

---

## 💾 Persistance locale (localStorage)

### Fonctionnalité de brouillon

Le flow sauvegarde automatiquement les données dans `localStorage` pour permettre à l'utilisateur de reprendre là où il en était.

```typescript
const STORAGE_KEY = 'aurentia-project-draft';

// Charger le brouillon au montage
useEffect(() => {
  const savedDraft = localStorage.getItem(STORAGE_KEY);
  if (savedDraft) {
    const parsed = JSON.parse(savedDraft);
    setData(parsed);
    setCurrentStep(parsed.currentStep || 0);
  }
}, []);

// Sauvegarder à chaque changement
useEffect(() => {
  if (data.projectName || data.projectIdeaSentence) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, currentStep }));
  }
}, [data, currentStep]);

// Effacer après soumission réussie
const clearDraft = () => {
  localStorage.removeItem(STORAGE_KEY);
};
```

---

## 🔄 Migration vers Next.js

### Structure recommandée pour Next.js (App Router)

```
app/
├── create-project/
│   └── page.tsx                        # Page wrapper
├── api/
│   └── project/
│       ├── generate-retranscription/
│       │   └── route.ts                # Proxy webhook 1
│       └── submit/
│           └── route.ts                # Proxy webhook 2
└── layout.tsx

components/
└── project/
    ├── CreateProjectFlow.tsx           # Client component ('use client')
    ├── ProgressDots.tsx
    └── slides/
        ├── StepBasicInfo.tsx
        ├── StepProductsServices.tsx
        ├── StepClientele.tsx
        ├── StepNeeds.tsx
        ├── StepTypeLocation.tsx
        ├── StepTeam.tsx
        ├── StepAdditionalInfo.tsx
        ├── StepConfirmation.tsx
        └── StepRetranscription.tsx

lib/
└── supabase/
    ├── client.ts                       # Client browser
    └── server.ts                       # Client serveur

types/
└── projectCreation.ts
```

### Changements clés pour Next.js

#### 1. Navigation

```typescript
// ❌ Avant (React Router)
import { useNavigate } from 'react-router-dom';
const navigate = useNavigate();
navigate('/individual/project-business/' + projectId);

// ✅ Après (Next.js)
'use client';
import { useRouter } from 'next/navigation';
const router = useRouter();
router.push(`/project/${projectId}`);
```

#### 2. Directive 'use client'

Tous les composants avec `useState`, `useEffect`, `framer-motion`, ou handlers d'événements doivent avoir `'use client'` en première ligne.

#### 3. Supabase Client

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

// Usage dans les composants
'use client';
import { createClient } from '@/lib/supabase/client';

const Component = () => {
  const supabase = createClient();
  // ...
};
```

#### 4. API Routes (optionnel - proxy webhooks)

```typescript
// app/api/project/generate-retranscription/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  const response = await fetch(
    'https://n8n.srv906204.hstgr.cloud/webhook/form-business-idea',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );
  
  const data = await response.json();
  return NextResponse.json(data);
}
```

---

## 🎨 Composants UI utilisés

### Dépendances

```bash
pnpm add framer-motion lucide-react
pnpm add @radix-ui/react-checkbox @radix-ui/react-select
```

### Composants shadcn/ui utilisés

- `Input`
- `Button`
- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`
- `toast` (notifications)

### Icônes dans `/public/icones-livrables/`

| Fichier | Utilisé pour |
|---------|--------------|
| `reglage-icon.png` | Nom du projet |
| `retranscription-icon.png` | Description synthétique |
| `proposition-valeur-icon.png` | Proposition de valeur |
| `concurrence-icon.png` | Élément distinctif |
| `persona-icon.png` | Clientèle cible |
| `market-icon.png` | Problème à résoudre |
| `vision-icon.png` | Vision 3 ans |
| `business-model-icon.png` | Business Model |
| `ressources-icon.png` | Compétences |
| `story-icon.png` | Mon Pourquoi |
| `partenaires-icon.png` | Équipe fondatrice |

---

## 📋 Checklist de migration

### Base de données
- [ ] Vérifier que les tables `form_business_idea` et `project_summary` existent
- [ ] Vérifier les contraintes de clés étrangères
- [ ] Tester les RLS policies

### Frontend
- [ ] Créer la structure de dossiers Next.js
- [ ] Copier et adapter `CreateProjectFlow.tsx` avec `'use client'`
- [ ] Adapter tous les slides avec `'use client'`
- [ ] Créer `lib/supabase/client.ts`
- [ ] Remplacer `useNavigate` par `useRouter`
- [ ] Copier les types dans `/types/projectCreation.ts`
- [ ] Copier les icônes dans `/public/icones-livrables/`

### Backend
- [ ] Configurer les variables d'environnement Supabase
- [ ] Tester les webhooks N8N
- [ ] (Optionnel) Créer des API routes proxy

### Tests
- [ ] Tester le flow complet de création
- [ ] Vérifier la persistance localStorage
- [ ] Tester la génération de retranscription
- [ ] Tester la soumission finale
- [ ] Vérifier la redirection après création

---

## 🔧 Variables d'environnement

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optionnel - si vous créez des API routes proxy
N8N_WEBHOOK_BASE_URL=https://n8n.srv906204.hstgr.cloud
```

---

## 📚 Fichiers de référence

- Code source complet: `src/components/project/CreateProjectFlow.tsx`
- Types: `src/types/projectCreation.ts`
- Slides: `src/components/project/slides/*.tsx`
- Schema DB: `db.sql`

---

*Documentation générée le 2 décembre 2025*
