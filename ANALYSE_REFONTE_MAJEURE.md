# Analyse Approfondie : Refonte Majeure d'Aurentia

## Table des Matières
1. [Contexte et Vision](#contexte-et-vision)
2. [État Actuel de l'Architecture](#état-actuel-de-larchitecture)
3. [Analyse des Changements Proposés](#analyse-des-changements-proposés)
4. [Impact sur la Base de Données](#impact-sur-la-base-de-données)
5. [Impact sur le Code](#impact-sur-le-code)
6. [Impact sur n8n et les Webhooks](#impact-sur-n8n-et-les-webhooks)
7. [Roadmap de Migration](#roadmap-de-migration)
8. [Recommandations Finales](#recommandations-finales)
9. [Questions à Clarifier](#questions-à-clarifier)

---

## 1. Contexte et Vision

### 🎯 Objectifs de la Refonte

Vous souhaitez transformer Aurentia d'un système de livrables débloqués en masse vers une **roadmap entrepreneuriale progressive** avec :

1. **Modèle de déblocage par étape** : Chaque partie de la roadmap se débloque avec des crédits spécifiques
2. **Organisation thématique** : Marketing, Commercial, Juridique, Opérationnel, etc.
3. **Nouveau système de design** : Migration vers un système basé sur des design tokens (TweekCN/Tailwind)
4. **Possible migration Next.js** : React → Next.js (optionnel mais envisagé)

### 🔍 Exemple du Nouveau Modèle
```
Roadmap Entrepreneuriale
├── 🎯 Fondations (Gratuit/Onboarding)
│   └── Informations globales du projet
├── 📊 Marketing (3 étapes)
│   ├── Persona B2C (600 crédits)
│   ├── Analyse de marché (800 crédits)
│   └── Positionnement (500 crédits)
├── 💼 Commercial (2 étapes)
│   ├── Pitch (600 crédits)
│   └── Analyse concurrence (800 crédits)
├── ⚖️ Juridique (2 étapes)
│   ├── Cadre juridique (700 crédits)
│   └── Protection IP (600 crédits)
└── 💰 Finance (3 étapes)
    ├── Business Model (900 crédits)
    ├── Plan financier (1000 crédits)
    └── Ressources requises (700 crédits)
```

---

## 2. État Actuel de l'Architecture

### 📁 Architecture Technique Actuelle

**Stack Technologique :**
- **Frontend** : Vite + React 18 + TypeScript
- **Routing** : React Router v6
- **State Management** : Context API hiérarchique
- **Data Fetching** : TanStack Query (5min stale, 10min gc)
- **Backend** : Supabase (PostgreSQL + Auth + Storage + RLS)
- **Automation** : n8n workflows
- **Styling** : Tailwind CSS + CSS Variables
- **UI Components** : ShadCN UI + Radix UI

### 🏗️ Hiérarchie des Contexts (Critique)

```tsx
ErrorBoundary
└─ QueryClientProvider
   └─ BrowserRouter
      └─ UserProvider (profile, role, organizationId)
         └─ ProjectProvider (currentProjectId, userProjects, deliverableNames, userCredits)
            └─ ChatStreamingProvider
               └─ VoiceQuotaProvider
                  └─ CreditsDialogProvider
                     └─ PendingInvitationsProvider
                        └─ DeliverablesLoadingProvider
```

**Point Critique** : `ProjectProvider` gère à la fois :
- Les projets utilisateur
- Les livrables du projet actuel
- Les crédits utilisateur

### 📊 Système de Livrables Actuel

**Configuration** : `src/contexts/ProjectContext.tsx:44-55`
```typescript
const DELIVERABLES_CONFIG = [
  { name: 'Cible B2C', table: 'persona_express_b2c' },
  { name: 'Cible B2B', table: 'persona_express_b2b' },
  { name: 'Cible Organismes', table: 'persona_express_organismes' },
  { name: 'Pitch', table: 'pitch' },
  { name: 'Concurrence', table: 'concurrence' },
  { name: 'Marché', table: 'marche' },
  { name: 'Proposition de valeur', table: 'proposition_valeur' },
  { name: 'Business Model', table: 'business_model' },
  { name: 'Analyse des ressources', table: 'ressources_requises' },
  { name: 'Vision/Mission', table: 'vision_mission_valeurs' }
];
```

**Fonctionnement Actuel** :
1. Le context `loadDeliverables()` vérifie la présence de données dans chaque table
2. Si données trouvées → livrable possédé
3. Liste stockée dans `deliverableNames: string[]`
4. Aucun système de "parcours progressif" ou "roadmap"

### 💳 Système de Crédits Actuel

**Stockage** : Table `profiles`
```sql
-- Colonnes pertinentes
monthly_credits_remaining    INTEGER DEFAULT 50
purchased_credits_remaining  INTEGER DEFAULT 0
monthly_credits_limit        INTEGER DEFAULT 50
last_credit_reset           TIMESTAMP
```

**Fonctions RPC** : `supabase/migrations/20250921_create_credit_functions.sql`
- `consume_credits(p_user_id, p_amount)` : Consomme des crédits
- `add_purchased_credits(p_user_id, p_amount)` : Ajoute des crédits achetés
- `reset_monthly_credits(p_user_id)` : Réinitialise les crédits mensuels

**Hook** : `src/hooks/useCreditsSimple.tsx`
```typescript
export interface UserCredits {
  monthly_credits_remaining: number;
  monthly_credits_limit: number;
  purchased_credits_remaining: number;
  last_credit_reset: string;
}
```

**⚠️ Problème Actuel** : Pas de traçabilité des achats de livrables individuels. On ne sait pas :
- Quels livrables ont été achetés vs générés gratuitement
- Combien de crédits ont été dépensés par livrable
- L'historique des déblocages

### 🎨 Système de Design Actuel

**Architecture CSS** :
- `src/styles/theme.css` : Variables CSS (couleurs, typo, spacing, animations)
- `src/styles/components.css` : Classes réutilisables (`.btn-primary`, `.card-clickable`)
- Support light/dark mode via classe `.dark`
- White-label : Variables `--org-primary-color`, `--org-secondary-color`

**Couleurs Actuelles** :
```css
--color-primary: #FF592C (Aurentia Orange)
--text-primary: #2e333d
--bg-page: #ffffff
--bg-card-clickable: #f4f4f5
--bg-card-static: #ffffff
```

**Typographie** :
```css
--font-base: 'Inter', sans-serif       /* Tout sauf H1 */
--font-heading: 'BIZUD Mincho', serif  /* H1 uniquement */
```

**Point Fort** : Système déjà centralisé avec design tokens → **Compatible avec approche TweekCN**

### 🔗 Intégrations n8n Actuelles

**Webhook RAG Deletion** : `src/contexts/ProjectContext.tsx:341-361`
```typescript
const webhookUrl = 'https://n8n.srv906204.hstgr.cloud/webhook/supp-rag';
fetch(webhookUrl, {
  method: 'POST',
  body: JSON.stringify({
    user_id: session.user.id,
    project_id: projectId,
  })
})
```

**Utilisation** : Suppression de la base de connaissances RAG lors de la suppression d'un projet.

---

## 3. Analyse des Changements Proposés

### 3.1 Migration React → Next.js

#### ✅ Avantages de Next.js

1. **SEO & Performance**
   - SSR/SSG pour les pages marketing
   - Meilleure indexation Google
   - Core Web Vitals optimisés

2. **Routing & Performance**
   - App Router avec Server Components
   - Route handlers (API routes intégrées)
   - Streaming & Suspense natifs

3. **Image Optimization**
   - `next/image` pour optimisation automatique
   - WebP/AVIF conversion
   - Lazy loading natif

4. **DX (Developer Experience)**
   - File-based routing
   - TypeScript first-class
   - Built-in API routes

#### ❌ Inconvénients & Risques

1. **Migration Massive**
   - Refactoring complet de l'architecture
   - Réécriture des contexts (Server vs Client Components)
   - Adaptation du routing (React Router → Next Router)
   - Gestion des imports (`@/` alias fonctionne, mais structure différente)

2. **Complexité Accrue**
   - Distinction Server/Client Components à gérer
   - Hydration errors potentiels
   - Middleware pour auth (remplace ProtectedRoute)

3. **Supabase Auth Adaptation**
   - SSR Auth compliqué avec Supabase
   - Cookies vs localStorage
   - Middleware pour vérifier auth côté serveur

4. **Hébergement**
   - Vercel = optimal (mais coûts)
   - Self-hosted Node.js server requis
   - Netlify = support limité Next.js 14+

5. **Perte de Temps**
   - **Estimation** : 3-5 semaines de migration pure
   - Risque de régressions
   - Tests exhaustifs nécessaires

#### 🎯 Verdict : Migration Next.js

**RECOMMANDATION** : ⚠️ **NE PAS MIGRER MAINTENANT**

**Raisons** :
1. **Votre priorité = Roadmap entrepreneuriale** → Migration Next.js n'apporte aucun bénéfice direct à cette fonctionnalité
2. **Vite + React fonctionne parfaitement** pour votre use case (app SaaS interne)
3. **SEO non critique** : Aurentia est une app authentifiée, pas un site marketing
4. **ROI négatif** : Énorme effort, bénéfices marginaux
5. **Risque de régression** : Architecture complexe = bugs potentiels

**Quand envisager Next.js ?**
- Si vous lancez un site marketing séparé (landing pages, blog)
- Si vous avez besoin de SSR pour des pages publiques
- Quand l'architecture actuelle est stabilisée (après refonte roadmap)

**Alternative** : Garder Vite + React pour l'app, envisager Next.js pour un site vitrine séparé plus tard.

---

### 3.2 Système de Design : TweekCN / Design Tokens

#### 🎨 Qu'est-ce que "TweekCN" ?

Je suppose que vous parlez de **Tailwind CSS avec système de design tokens** (similaire à [Shadcn Themes](https://ui.shadcn.com/themes) ou [Radix Themes](https://www.radix-ui.com/themes)).

**Concept** :
- Définir des design tokens centralisés (couleurs, spacing, radius, etc.)
- Générer automatiquement les classes Tailwind
- Thèmes light/dark switchables
- Customisation facile via configuration

#### ✅ Avantages pour Aurentia

1. **Vous l'avez DÉJÀ** : Votre système actuel (`theme.css` + `components.css`) EST un système de design tokens
2. **Compatibilité native** : Tailwind + CSS variables = exactement ce que fait Shadcn/Radix Themes
3. **Migration légère** : Pas besoin de tout refactoriser, juste standardiser

#### 🔄 Ce qu'il faut faire

**Option A : Améliorer le système actuel (RECOMMANDÉ)**

1. **Standardiser les tokens**
   ```css
   /* theme.css - Structure améliorée */
   :root {
     /* Colors - Semantic */
     --color-background: 0 0% 100%;
     --color-foreground: 222.2 84% 4.9%;
     --color-card: 0 0% 100%;
     --color-primary: 17 88% 58%;        /* #FF592C */
     --color-secondary: 210 40% 96.1%;
     --color-accent: 210 40% 96.1%;
     --color-muted: 210 40% 96.1%;

     /* Radius */
     --radius-sm: 0.375rem;
     --radius-md: 0.5rem;
     --radius-lg: 0.75rem;
     --radius-xl: 1rem;

     /* Spacing scale (déjà bon) */
     /* Typography scale (déjà bon) */
   }
   ```

2. **Utiliser `tailwind.config.js` pour générer les classes**
   ```js
   module.exports = {
     theme: {
       extend: {
         colors: {
           background: 'hsl(var(--color-background))',
           foreground: 'hsl(var(--color-foreground))',
           primary: 'hsl(var(--color-primary))',
           // etc.
         },
         borderRadius: {
           sm: 'var(--radius-sm)',
           md: 'var(--radius-md)',
           lg: 'var(--radius-lg)',
           xl: 'var(--radius-xl)',
         }
       }
     }
   }
   ```

3. **Bénéfices** :
   - Garde votre système actuel
   - Ajoute génération automatique de classes Tailwind
   - Améliore la cohérence
   - Compatible avec Shadcn UI (déjà utilisé)

**Option B : Adopter Radix Themes ou Park UI (Plus lourd)**

- **Avantages** : Système complet clé en main
- **Inconvénients** : Refactoring massif, perte de votre identité visuelle actuelle
- **Verdict** : ❌ Pas recommandé, trop de travail pour peu de ROI

#### 🎯 Verdict : Design System

**RECOMMANDATION** : ✅ **Améliorer le système actuel**

**Plan d'action** :
1. Convertir `theme.css` en format HSL (compatible Tailwind + Shadcn)
2. Mettre à jour `tailwind.config.js` pour utiliser les variables
3. Refactoriser progressivement les composants pour utiliser les classes Tailwind générées
4. Documenter les tokens dans un styleguide interne

**Estimation** : 1-2 semaines de travail

---

### 3.3 Refonte du Modèle de Livrables → Roadmap

#### 🎯 Nouveau Modèle : Roadmap Entrepreneuriale

**Changements Conceptuels** :

| Ancien Modèle | Nouveau Modèle |
|---------------|----------------|
| Livrables isolés | Parcours progressif |
| Déblocage en masse | Déblocage par étape |
| Pas de catégorisation | Domaines thématiques |
| Pas de traçabilité | Historique des déblocages |
| Tous les livrables visibles | Progression séquentielle |

**Structure Proposée** :

```
Roadmap
├── Domaine (ex: Marketing)
│   ├── Étape 1 (ex: Persona B2C)
│   │   ├── Coût en crédits : 600
│   │   ├── Prérequis : Fondations complètes
│   │   ├── Statut : locked | unlocked | completed
│   │   └── Contenu : Données générées par IA
│   ├── Étape 2 (ex: Analyse marché)
│   └── Étape 3 (ex: Positionnement)
└── Domaine (ex: Commercial)
    ├── Étape 1
    └── Étape 2
```

#### 🔄 Changements Techniques Requis

**1. Nouvelles Tables Supabase**

```sql
-- Table : roadmap_domains (Domaines thématiques)
CREATE TABLE roadmap_domains (
  domain_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                    -- "Marketing", "Commercial", "Juridique"
  description TEXT,
  icon_url TEXT,
  display_order INTEGER NOT NULL,
  color VARCHAR(7),                      -- Couleur hex pour le domaine
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table : roadmap_steps (Étapes de la roadmap)
CREATE TABLE roadmap_steps (
  step_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id UUID REFERENCES roadmap_domains(domain_id) ON DELETE CASCADE,
  name TEXT NOT NULL,                    -- "Persona B2C", "Pitch"
  slug TEXT NOT NULL UNIQUE,             -- "persona-b2c", "pitch"
  description TEXT,
  credit_cost INTEGER NOT NULL,          -- 600, 800, etc.
  display_order INTEGER NOT NULL,

  -- Prérequis
  prerequisite_step_ids UUID[],          -- Array d'étapes requises avant déblocage

  -- Mapping vers l'ancienne table (pour migration)
  legacy_table_name TEXT,                -- "persona_express_b2c", "pitch"

  -- Metadata
  estimated_time_minutes INTEGER,        -- Temps estimé de complétion
  tags TEXT[],                           -- ["b2c", "marketing", "persona"]

  created_at TIMESTAMP DEFAULT NOW()
);

-- Table : user_roadmap_progress (Progrès utilisateur)
CREATE TABLE user_roadmap_progress (
  progress_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES project_summary(project_id) ON DELETE CASCADE,
  step_id UUID REFERENCES roadmap_steps(step_id) ON DELETE CASCADE,

  -- Statut
  status TEXT CHECK (status IN ('locked', 'unlocked', 'in_progress', 'completed')) DEFAULT 'locked',

  -- Traçabilité
  unlocked_at TIMESTAMP,                 -- Quand l'étape a été débloquée
  completed_at TIMESTAMP,                -- Quand l'étape a été complétée
  credits_spent INTEGER,                 -- Combien de crédits ont été dépensés

  -- Données générées
  generated_data JSONB,                  -- Stockage flexible des données générées par IA

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(user_id, project_id, step_id)
);

-- Index pour performance
CREATE INDEX idx_roadmap_progress_user_project ON user_roadmap_progress(user_id, project_id);
CREATE INDEX idx_roadmap_progress_status ON user_roadmap_progress(status);
CREATE INDEX idx_roadmap_steps_domain ON roadmap_steps(domain_id);

-- Table : roadmap_credit_transactions (Historique des transactions)
CREATE TABLE roadmap_credit_transactions (
  transaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES project_summary(project_id) ON DELETE CASCADE,
  step_id UUID REFERENCES roadmap_steps(step_id) ON DELETE SET NULL,

  amount INTEGER NOT NULL,               -- Montant (négatif pour dépense, positif pour ajout)
  transaction_type TEXT CHECK (transaction_type IN ('unlock_step', 'purchase', 'refund', 'monthly_reset')),
  description TEXT,

  -- Balance après transaction
  balance_after INTEGER NOT NULL,

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_credit_transactions_user ON roadmap_credit_transactions(user_id);
```

**2. RLS (Row Level Security)**

```sql
-- roadmap_domains : accessible à tous les utilisateurs authentifiés
ALTER TABLE roadmap_domains ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Domains visible to all authenticated users"
  ON roadmap_domains FOR SELECT
  TO authenticated
  USING (true);

-- roadmap_steps : accessible à tous les utilisateurs authentifiés
ALTER TABLE roadmap_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Steps visible to all authenticated users"
  ON roadmap_steps FOR SELECT
  TO authenticated
  USING (true);

-- user_roadmap_progress : utilisateur ne voit que son propre progrès
ALTER TABLE user_roadmap_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see their own progress"
  ON user_roadmap_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON user_roadmap_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON user_roadmap_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- roadmap_credit_transactions : utilisateur ne voit que ses propres transactions
ALTER TABLE roadmap_credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see their own transactions"
  ON roadmap_credit_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
```

**3. Fonctions RPC pour Déblocage**

```sql
-- Fonction pour débloquer une étape
CREATE OR REPLACE FUNCTION unlock_roadmap_step(
  p_user_id UUID,
  p_project_id UUID,
  p_step_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_credit_cost INTEGER;
  v_current_credits INTEGER;
  v_prerequisite_met BOOLEAN;
  v_already_unlocked BOOLEAN;
  v_result JSON;
BEGIN
  -- 1. Vérifier si l'étape existe et récupérer le coût
  SELECT credit_cost INTO v_credit_cost
  FROM roadmap_steps
  WHERE step_id = p_step_id;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Étape introuvable'
    );
  END IF;

  -- 2. Vérifier les crédits disponibles
  SELECT (monthly_credits_remaining + purchased_credits_remaining) INTO v_current_credits
  FROM profiles
  WHERE id = p_user_id;

  IF v_current_credits < v_credit_cost THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Crédits insuffisants',
      'required', v_credit_cost,
      'available', v_current_credits
    );
  END IF;

  -- 3. Vérifier si déjà débloqué
  SELECT EXISTS(
    SELECT 1 FROM user_roadmap_progress
    WHERE user_id = p_user_id
      AND project_id = p_project_id
      AND step_id = p_step_id
      AND status IN ('unlocked', 'in_progress', 'completed')
  ) INTO v_already_unlocked;

  IF v_already_unlocked THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Étape déjà débloquée'
    );
  END IF;

  -- 4. Vérifier les prérequis
  -- TODO: Implémenter logique de vérification des prerequisite_step_ids

  -- 5. Débloquer l'étape
  INSERT INTO user_roadmap_progress (user_id, project_id, step_id, status, unlocked_at, credits_spent)
  VALUES (p_user_id, p_project_id, p_step_id, 'unlocked', NOW(), v_credit_cost)
  ON CONFLICT (user_id, project_id, step_id)
  DO UPDATE SET
    status = 'unlocked',
    unlocked_at = NOW(),
    credits_spent = v_credit_cost,
    updated_at = NOW();

  -- 6. Déduire les crédits
  PERFORM consume_credits(p_user_id, v_credit_cost);

  -- 7. Enregistrer la transaction
  INSERT INTO roadmap_credit_transactions (
    user_id, project_id, step_id, amount, transaction_type, description, balance_after
  )
  VALUES (
    p_user_id,
    p_project_id,
    p_step_id,
    -v_credit_cost,
    'unlock_step',
    'Déblocage d''étape de la roadmap',
    (SELECT monthly_credits_remaining + purchased_credits_remaining FROM profiles WHERE id = p_user_id)
  );

  RETURN json_build_object(
    'success', true,
    'credits_spent', v_credit_cost,
    'remaining_credits', (SELECT monthly_credits_remaining + purchased_credits_remaining FROM profiles WHERE id = p_user_id)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION unlock_roadmap_step(UUID, UUID, UUID) TO authenticated;
```

**4. Nouveaux Contexts React**

```typescript
// src/contexts/RoadmapContext.tsx
interface RoadmapDomain {
  domain_id: string;
  name: string;
  description: string;
  icon_url: string;
  display_order: number;
  color: string;
  steps: RoadmapStep[];
}

interface RoadmapStep {
  step_id: string;
  domain_id: string;
  name: string;
  slug: string;
  description: string;
  credit_cost: number;
  display_order: number;
  prerequisite_step_ids: string[];
  estimated_time_minutes: number;
  tags: string[];

  // User progress (null si pas de progrès)
  progress?: {
    status: 'locked' | 'unlocked' | 'in_progress' | 'completed';
    unlocked_at: string | null;
    completed_at: string | null;
    credits_spent: number;
    generated_data: any;
  };
}

interface RoadmapContextType {
  domains: RoadmapDomain[];
  loading: boolean;
  error: string | null;

  // Actions
  unlockStep: (stepId: string) => Promise<{ success: boolean; error?: string }>;
  completeStep: (stepId: string, data: any) => Promise<void>;
  getStepBySlug: (slug: string) => RoadmapStep | null;
  getDomainProgress: (domainId: string) => { completed: number; total: number };
  getOverallProgress: () => { completed: number; total: number };
}

export const RoadmapProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentProjectId } = useProject();
  const [domains, setDomains] = useState<RoadmapDomain[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentProjectId) return;
    loadRoadmap();
  }, [currentProjectId]);

  const loadRoadmap = async () => {
    // 1. Charger les domaines
    const { data: domainsData } = await supabase
      .from('roadmap_domains')
      .select('*')
      .order('display_order');

    // 2. Charger les étapes
    const { data: stepsData } = await supabase
      .from('roadmap_steps')
      .select('*')
      .order('display_order');

    // 3. Charger le progrès utilisateur pour le projet actuel
    const { data: progressData } = await supabase
      .from('user_roadmap_progress')
      .select('*')
      .eq('project_id', currentProjectId);

    // 4. Merger les données
    const mergedDomains = domainsData.map(domain => ({
      ...domain,
      steps: stepsData
        .filter(step => step.domain_id === domain.domain_id)
        .map(step => ({
          ...step,
          progress: progressData?.find(p => p.step_id === step.step_id)
        }))
    }));

    setDomains(mergedDomains);
    setLoading(false);
  };

  const unlockStep = async (stepId: string) => {
    const { data, error } = await supabase.rpc('unlock_roadmap_step', {
      p_user_id: (await supabase.auth.getUser()).data.user?.id,
      p_project_id: currentProjectId,
      p_step_id: stepId
    });

    if (data?.success) {
      await loadRoadmap(); // Recharger pour MAJ le statut
    }

    return data;
  };

  // ... autres fonctions
};
```

**5. Composants UI**

```typescript
// src/components/roadmap/RoadmapView.tsx
import { RoadmapDomain } from './RoadmapDomain';

export const RoadmapView = () => {
  const { domains, loading } = useRoadmap();

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <h1>Ma Roadmap Entrepreneuriale</h1>

      {domains.map(domain => (
        <RoadmapDomain key={domain.domain_id} domain={domain} />
      ))}
    </div>
  );
};

// src/components/roadmap/RoadmapDomain.tsx
export const RoadmapDomain = ({ domain }: { domain: RoadmapDomain }) => {
  const progress = getDomainProgress(domain.domain_id);

  return (
    <div className="card-static">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <img src={domain.icon_url} className="w-8 h-8" />
          <h2>{domain.name}</h2>
        </div>
        <Badge>{progress.completed}/{progress.total} complétées</Badge>
      </div>

      <p className="text-muted mb-6">{domain.description}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {domain.steps.map(step => (
          <RoadmapStepCard key={step.step_id} step={step} />
        ))}
      </div>
    </div>
  );
};

// src/components/roadmap/RoadmapStepCard.tsx
export const RoadmapStepCard = ({ step }: { step: RoadmapStep }) => {
  const { unlockStep } = useRoadmap();
  const status = step.progress?.status || 'locked';

  const handleUnlock = async () => {
    const result = await unlockStep(step.step_id);
    if (!result.success) {
      toast({ title: "Erreur", description: result.error, variant: "destructive" });
    }
  };

  return (
    <div className={cn(
      "border rounded-lg p-4 transition-all",
      status === 'locked' && "opacity-60 bg-gray-50",
      status === 'unlocked' && "border-primary",
      status === 'completed' && "bg-green-50 border-green-500"
    )}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold">{step.name}</h3>
        {status === 'completed' && <CheckCircle className="text-green-500" />}
      </div>

      <p className="text-sm text-muted mb-4">{step.description}</p>

      <div className="flex items-center justify-between">
        <Badge variant="outline">{step.credit_cost} crédits</Badge>

        {status === 'locked' && (
          <Button size="sm" onClick={handleUnlock}>
            <Lock className="w-4 h-4 mr-2" />
            Débloquer
          </Button>
        )}

        {status === 'unlocked' && (
          <Button size="sm" variant="default">
            Commencer
          </Button>
        )}
      </div>
    </div>
  );
};
```

---

## 4. Impact sur la Base de Données

### 📊 Tables à Créer

1. `roadmap_domains` : Domaines thématiques (Marketing, Commercial, etc.)
2. `roadmap_steps` : Étapes de la roadmap avec coûts et prérequis
3. `user_roadmap_progress` : Progrès utilisateur par projet
4. `roadmap_credit_transactions` : Historique des transactions de crédits

### 🔄 Tables à Migrer/Adapter

**Anciennes Tables de Livrables** : Garder pour compatibilité, mais ajouter mapping :

```sql
-- Exemple : persona_express_b2c devient une étape de la roadmap
INSERT INTO roadmap_steps (
  domain_id, -- Marketing
  name,
  slug,
  credit_cost,
  legacy_table_name,
  display_order
) VALUES (
  (SELECT domain_id FROM roadmap_domains WHERE name = 'Marketing'),
  'Persona B2C',
  'persona-b2c',
  600,
  'persona_express_b2c', -- Mapping vers ancienne table
  1
);
```

**Table `profiles`** : Ajouter colonnes pour traçabilité

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_credits_spent INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS steps_unlocked_count INTEGER DEFAULT 0;
```

### 🗄️ Migration de Données Existantes

**Script de Migration** :

```sql
-- Migration des livrables existants vers user_roadmap_progress
INSERT INTO user_roadmap_progress (user_id, project_id, step_id, status, completed_at, credits_spent)
SELECT
  ps.user_id,
  ps.project_id,
  rs.step_id,
  'completed' as status,
  ps.created_at as completed_at,
  0 as credits_spent -- Ancien système = gratuit
FROM persona_express_b2c ps
JOIN roadmap_steps rs ON rs.legacy_table_name = 'persona_express_b2c'
ON CONFLICT (user_id, project_id, step_id) DO NOTHING;

-- Répéter pour chaque table de livrable
-- pitch, concurrence, marche, proposition_valeur, business_model, etc.
```

---

## 5. Impact sur le Code

### 📁 Fichiers à Créer

**Contexts** :
- `src/contexts/RoadmapContext.tsx` : Gestion de la roadmap et du progrès
- `src/contexts/CreditTransactionsContext.tsx` : Historique des transactions (optionnel)

**Components** :
- `src/components/roadmap/RoadmapView.tsx` : Vue principale de la roadmap
- `src/components/roadmap/RoadmapDomain.tsx` : Affichage d'un domaine
- `src/components/roadmap/RoadmapStepCard.tsx` : Carte d'une étape
- `src/components/roadmap/RoadmapProgress.tsx` : Indicateur de progression global
- `src/components/roadmap/UnlockStepDialog.tsx` : Dialog de confirmation de déblocage

**Pages** :
- `src/pages/Roadmap.tsx` : Page principale de la roadmap (à adapter)
- `src/pages/RoadmapStepDetail.tsx` : Détail d'une étape débloquée

**Hooks** :
- `src/hooks/useRoadmap.tsx` : Hook pour accéder au RoadmapContext
- `src/hooks/useStepUnlock.tsx` : Hook pour débloquer une étape
- `src/hooks/useCreditTransactions.tsx` : Hook pour l'historique des crédits

### 🔄 Fichiers à Modifier

**ProjectContext.tsx** :
- Supprimer la logique `loadDeliverables()` (remplacée par RoadmapContext)
- Garder `userCredits` et `loadUserCredits()`

**App.tsx** :
- Ajouter `RoadmapProvider` dans la hiérarchie des contexts
```tsx
<ProjectProvider>
  <RoadmapProvider>
    <ChatStreamingProvider>
      {/* ... */}
    </ChatStreamingProvider>
  </RoadmapProvider>
</ProjectProvider>
```

**Routes** :
- Remplacer `/individual/project-business` par `/individual/roadmap`
- Ajouter `/individual/roadmap/:stepSlug` pour le détail d'une étape

### 🗑️ Fichiers à Déprécier/Supprimer (après migration)

**Components délivrables** :
- `src/components/deliverables/DeliverableCard.tsx` (remplacé par RoadmapStepCard)
- `src/components/deliverables/BlurredDeliverableWrapper.tsx` (logique intégrée dans RoadmapStepCard)
- `src/components/deliverables/DeliverableProgressContainer.tsx`

**Pages** :
- `src/pages/ProjectBusiness.tsx` (remplacé par Roadmap.tsx)

### 📊 Estimation de l'Effort Code

| Tâche | Estimation |
|-------|------------|
| Création des nouvelles tables Supabase | 1-2 jours |
| Migration de données existantes | 1 jour |
| Création RoadmapContext | 2-3 jours |
| Composants UI Roadmap | 3-4 jours |
| Adaptation routes et navigation | 1 jour |
| Tests et debug | 2-3 jours |
| **TOTAL** | **10-15 jours** (2-3 semaines) |

---

## 6. Impact sur n8n et les Webhooks

### 🔗 Webhooks Actuels

**Webhook RAG Deletion** :
- URL : `https://n8n.srv906204.hstgr.cloud/webhook/supp-rag`
- Trigger : Suppression de projet
- Impact : ✅ **Aucun changement nécessaire** (logique reste identique)

### 🆕 Nouveaux Webhooks Potentiels

**1. Webhook : Step Unlocked**
- **Trigger** : Déblocage d'une étape de la roadmap
- **Payload** :
  ```json
  {
    "user_id": "uuid",
    "project_id": "uuid",
    "step_id": "uuid",
    "step_slug": "persona-b2c",
    "credits_spent": 600,
    "timestamp": "2025-01-15T10:30:00Z"
  }
  ```
- **Utilité** :
  - Analytics (tracking des étapes populaires)
  - Déclenchement de workflows IA pour pré-générer du contenu
  - Notifications email/Slack

**2. Webhook : Step Completed**
- **Trigger** : Complétion d'une étape (données générées sauvegardées)
- **Payload** :
  ```json
  {
    "user_id": "uuid",
    "project_id": "uuid",
    "step_id": "uuid",
    "step_slug": "persona-b2c",
    "generated_data": { /* ... */ },
    "timestamp": "2025-01-15T11:00:00Z"
  }
  ```
- **Utilité** :
  - Indexation dans base de connaissances RAG
  - Génération de suggestions pour prochaines étapes
  - Analytics de complétion

**3. Webhook : Credits Low**
- **Trigger** : Crédits utilisateur < 100
- **Payload** :
  ```json
  {
    "user_id": "uuid",
    "credits_remaining": 50,
    "timestamp": "2025-01-15T10:30:00Z"
  }
  ```
- **Utilité** :
  - Email de rappel pour acheter des crédits
  - Notification push

### 🔧 Implémentation dans le Code

**Exemple : Appel webhook lors du déblocage**

```typescript
// Dans unlock_roadmap_step() ou dans le context React
const triggerWebhook = async (event: string, payload: any) => {
  try {
    await fetch(`https://n8n.srv906204.hstgr.cloud/webhook/${event}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    console.error('Webhook error:', error);
    // Ne pas bloquer l'opération si webhook échoue
  }
};

// Après déblocage réussi
if (unlockResult.success) {
  triggerWebhook('step-unlocked', {
    user_id: userId,
    project_id: projectId,
    step_id: stepId,
    credits_spent: creditCost
  });
}
```

### 📊 Workflows n8n à Créer

1. **Analytics Dashboard** :
   - Agréger les événements `step-unlocked`
   - Créer graphiques de popularité des étapes
   - Identifier les abandons (étapes débloquées mais non complétées)

2. **AI Content Pre-generation** :
   - Lors de `step-unlocked`, déclencher génération de contenu par IA en arrière-plan
   - Stocker résultat dans `generated_data`
   - Notification utilisateur quand prêt

3. **Email Automation** :
   - `credits-low` → Email de rappel
   - `step-completed` → Email de félicitations + suggestions
   - `domain-completed` → Email de milestone

---

## 7. Roadmap de Migration

### 📅 Phase 1 : Préparation (Semaine 1)

**Objectifs** :
- Finaliser la conception du modèle de données
- Créer les migrations Supabase
- Mettre en place l'environnement de dev/staging

**Tâches** :
1. ✅ Valider la structure des domaines et étapes avec l'équipe
2. ✅ Écrire les migrations SQL pour les nouvelles tables
3. ✅ Créer un script de migration des données existantes
4. ✅ Tester les migrations sur une base de staging
5. ✅ Documenter le nouveau modèle de données

**Livrables** :
- Migrations SQL validées
- Script de migration de données
- Documentation du modèle

---

### 📅 Phase 2 : Backend & Context (Semaines 2-3)

**Objectifs** :
- Implémenter la logique métier côté serveur
- Créer les contexts React pour la roadmap

**Tâches** :
1. Créer les fonctions RPC Supabase (`unlock_roadmap_step`, etc.)
2. Mettre en place les politiques RLS
3. Créer `RoadmapContext.tsx` avec hooks associés
4. Adapter `ProjectContext.tsx` (supprimer logique livrables)
5. Tester la consommation de crédits et déblocage d'étapes

**Livrables** :
- RPC functions testées
- `RoadmapContext` fonctionnel
- Tests unitaires pour les fonctions critiques

---

### 📅 Phase 3 : Interface Utilisateur (Semaines 3-4)

**Objectifs** :
- Créer les composants UI de la roadmap
- Implémenter la nouvelle page Roadmap

**Tâches** :
1. Créer les composants `RoadmapView`, `RoadmapDomain`, `RoadmapStepCard`
2. Implémenter le dialog de déblocage avec confirmation
3. Créer la page de détail d'une étape débloquée
4. Ajouter indicateurs de progression (progress bars, badges)
5. Implémenter animations et états de chargement

**Livrables** :
- Composants UI fonctionnels
- Page Roadmap complète
- Design responsive et accessible

---

### 📅 Phase 4 : Design System (Semaine 5)

**Objectifs** :
- Améliorer le système de design tokens
- Harmoniser les couleurs et styles

**Tâches** :
1. Convertir `theme.css` au format HSL (compatible Tailwind)
2. Mettre à jour `tailwind.config.js` pour utiliser les variables
3. Refactoriser les composants existants pour utiliser les nouvelles classes
4. Créer un styleguide interne documenté
5. Tester light/dark mode et white-label

**Livrables** :
- Système de design tokens standardisé
- Styleguide accessible à `/individual/styleguide`
- Cohérence visuelle sur toute l'app

---

### 📅 Phase 5 : Intégrations & Webhooks (Semaine 6)

**Objectifs** :
- Mettre en place les webhooks n8n
- Créer les workflows d'automation

**Tâches** :
1. Créer workflows n8n pour `step-unlocked`, `step-completed`, `credits-low`
2. Implémenter les appels webhook dans le code
3. Configurer les emails automatiques
4. Mettre en place analytics dashboard
5. Tester les flows end-to-end

**Livrables** :
- Webhooks fonctionnels
- Workflows n8n déployés
- Analytics dashboard opérationnel

---

### 📅 Phase 6 : Migration & Tests (Semaine 7)

**Objectifs** :
- Migrer les données existantes
- Tester intensivement
- Corriger les bugs

**Tâches** :
1. Exécuter le script de migration sur la production
2. Vérifier la cohérence des données migrées
3. Tester tous les parcours utilisateur
4. Corriger les bugs identifiés
5. Optimiser les performances (requêtes SQL, loading times)

**Livrables** :
- Données migrées avec succès
- Application stable et testée
- Documentation des bugs connus et résolus

---

### 📅 Phase 7 : Déploiement & Monitoring (Semaine 8)

**Objectifs** :
- Déployer en production
- Monitorer les métriques
- Récolter les feedbacks

**Tâches** :
1. Déployer en production (staging → prod)
2. Communiquer aux utilisateurs existants (email, notification)
3. Monitorer les erreurs (Sentry, logs Supabase)
4. Récolter les feedbacks utilisateurs
5. Itérer sur les améliorations rapides

**Livrables** :
- Application en production
- Monitoring actif
- Feedbacks collectés

---

## 8. Recommandations Finales

### ✅ À FAIRE ABSOLUMENT

1. **Garder React + Vite**
   - ❌ NE PAS migrer vers Next.js maintenant
   - ✅ Focus sur la roadmap entrepreneuriale
   - ⏰ Envisager Next.js dans 6-12 mois si besoin réel

2. **Améliorer le Design System (pas refonte)**
   - ✅ Convertir `theme.css` en format HSL/Tailwind
   - ✅ Standardiser les tokens
   - ❌ Ne pas adopter Radix Themes ou Park UI (trop lourd)

3. **Migration Progressive**
   - ✅ Garder les anciennes tables de livrables en lecture seule
   - ✅ Utiliser `legacy_table_name` pour mapping
   - ✅ Permettre rétrocompatibilité pendant 3-6 mois

4. **Tests Rigoureux**
   - ✅ Tester sur base de staging avant production
   - ✅ Créer des tests E2E pour les parcours critiques (déblocage, crédits)
   - ✅ Implémenter monitoring d'erreurs (Sentry)

5. **Communication Utilisateurs**
   - ✅ Email explicatif 1 semaine avant le changement
   - ✅ Tutoriel vidéo de la nouvelle roadmap
   - ✅ FAQ sur les changements

---

### ⚠️ RISQUES À ANTICIPER

1. **Perte de Données**
   - **Risque** : Migration SQL échoue, données corrompues
   - **Mitigation** : Backups quotidiens, tester sur staging, rollback plan

2. **Confusion Utilisateurs**
   - **Risque** : Utilisateurs perdus avec le nouveau modèle
   - **Mitigation** : Onboarding interactif, tooltips explicatifs, support dédié

3. **Performance**
   - **Risque** : Requêtes SQL complexes (JOIN multiples) ralentissent l'app
   - **Mitigation** : Indexation optimale, pagination, caching avec React Query

4. **RLS Errors**
   - **Risque** : Politiques RLS mal configurées → 403 errors
   - **Mitigation** : Tests exhaustifs des politiques, logs détaillés

5. **Webhooks Failures**
   - **Risque** : n8n down → événements perdus
   - **Mitigation** : Queue system (optionnel), retry logic, monitoring

---

### 🎯 PRIORISATION

**Ordre de priorité** :

1. **CRITIQUE** : Nouvelle architecture BDD + migration données (Phases 1-2)
2. **HAUTE** : Interface utilisateur roadmap (Phase 3)
3. **MOYENNE** : Design system amélioré (Phase 4)
4. **BASSE** : Webhooks & analytics (Phase 5)
5. **OPTIONNEL** : Features avancées (prérequis complexes, gamification)

---

### 💰 Estimation Budgétaire Temps

| Phase | Durée | Développeur(s) |
|-------|-------|----------------|
| Phase 1 : Préparation | 1 semaine | 1 dev backend |
| Phase 2 : Backend & Context | 2 semaines | 1 dev fullstack |
| Phase 3 : UI | 2 semaines | 1 dev frontend |
| Phase 4 : Design System | 1 semaine | 1 dev frontend |
| Phase 5 : Intégrations | 1 semaine | 1 dev backend |
| Phase 6 : Tests & Migration | 1 semaine | 1 dev fullstack |
| Phase 7 : Déploiement | 1 semaine | 1 dev fullstack |
| **TOTAL** | **8-10 semaines** | **1-2 développeurs** |

**Coût estimé** (freelance France, ~400€/jour) :
- 1 développeur × 8 semaines × 5 jours = **16 000€ - 20 000€**
- 2 développeurs (parallélisation) × 5 semaines × 5 jours = **20 000€ - 25 000€**

---

## 9. Clarifications Validées ✅

### 📋 Réponses aux Questions Business

#### 1. **Prérequis** : ✅ OUI, ordre strict pour certaines étapes

**Règles de prérequis** :
- Pour faire **angle stratégique** → il faut d'abord **client cible**
- Pour faire **analyse de concurrence** → il faut **développement commercial** + **analyse de marché**
- Pour débloquer **Finance** (tout le domaine) → il faut **analyse marché** + **produit** + **ressources requises**

**Implémentation technique** :
- Utiliser `prerequisite_step_ids` dans la table `roadmap_steps`
- Vérification côté backend dans `unlock_roadmap_step()`
- UI : afficher les étapes verrouillées avec message "Complétez d'abord : [Liste des prérequis]"

---

#### 2. **Domaines** : ✅ 9 Domaines principaux

**Liste complète des domaines** :
1. **Marketing** : Flyers, branding, articles de blog, contacts presse, SEO
2. **Commercial** : Prospection commerciale, définir offre de vente, pitch
3. **Juridique** : Restrictions juridiques, CGV, politique de confidentialité, rédaction de contrats
4. **Finance** : Prévisionnel financier, structuration des coûts, financement
5. **Opérationnel** : Productivité, rédaction mails rapides, réflexion stratégique, analyse des conséquences
6. **Product** : Tableau produits (prix, coûts variables, quantités)
7. **Site web** : SEO, développement, design
8. **Communication** : Relations publiques, médias, événements
9. **Branding** : Identité visuelle, charte graphique, positionnement de marque

**Détails complets en Annexe A (structure mise à jour)**

---

#### 3. **Fondations Gratuites** : ✅ Modules actuellement gratuits

**Accessible sans déblocage (0 crédits)** :
- ✅ Informations basiques du projet
- ✅ Retranscription du concept
- ✅ Mini SWOT
- ✅ Mini Persona
- ✅ Note globale du projet
- ✅ **Tous les modules actuellement gratuits restent gratuits**

**Implémentation** :
- Domaine "Fondations" avec `credit_cost = 0`
- Accessible dès la création du projet
- Pas de déblocage requis

---

#### 4. **Migration Utilisateurs Existants** : ✅ Grandfathering + Crédits offerts

**Stratégie de migration** :
- ✅ Les livrables existants = automatiquement débloqués (status `completed`)
- ✅ `credits_spent = 0` pour les anciens livrables (pas de coût rétroactif)
- ✅ **Offrir des crédits gratuits** pour compenser le changement (montant à définir, suggestion : 500-1000 crédits)
- ✅ Email explicatif + tutoriel vidéo

**Script SQL de migration** :
```sql
-- Marquer tous les livrables existants comme "completed"
-- avec credits_spent = 0 (ancien système = gratuit)
-- Voir section 4 pour le détail
```

---

### 📋 Réponses aux Questions Techniques

#### 5. **Mapping Données** : ✅ 1 livrable = 1 étape

**Confirmé** :
- Persona Express B2C → 1 étape "Persona B2C"
- Pitch → 1 étape "Pitch"
- Analyse de marché → 1 étape "Analyse de Marché"
- etc.

**Colonne de mapping** :
- `roadmap_steps.legacy_table_name` pointe vers l'ancienne table
- Exemple : `legacy_table_name = 'persona_express_b2c'`

---

#### 6. **Génération IA** : ✅ Formulaire de 3 questions → Génération IA

**Workflow de déblocage** :

1. **Utilisateur clique "Débloquer"** (consomme les crédits)
2. **Affichage d'un formulaire avec ~3 questions** spécifiques à l'étape
3. **Utilisateur remplit le formulaire**
4. **IA génère le contenu** basé sur :
   - Réponses aux 3 questions
   - Informations du projet
   - Données des étapes précédentes (contexte)
5. **Stockage dans `user_roadmap_progress.generated_data` (JSONB)**

**Tables à créer** :
```sql
-- Table pour les questions de formulaire par étape
CREATE TABLE roadmap_step_questions (
  question_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id UUID REFERENCES roadmap_steps(step_id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT CHECK (question_type IN ('text', 'textarea', 'select', 'number')),
  options JSONB,  -- Pour les questions à choix multiples
  placeholder TEXT,
  display_order INTEGER NOT NULL,
  required BOOLEAN DEFAULT true
);
```

---

#### 7. **Collaboration** : ✅ Progression partagée au niveau du projet

**Règle** :
- **1 projet = 1 progression commune**
- Si collaborateur A débloque une étape → collaborateur B la voit débloquée
- Pas de progression individuelle par utilisateur

**Implémentation** :
- `user_roadmap_progress` indexé sur `(project_id, step_id)` uniquement
- RLS adapté pour permettre aux collaborateurs de voir le progrès commun

**Politique RLS à adapter** :
```sql
CREATE POLICY "Collaborators see project progress"
  ON user_roadmap_progress FOR SELECT
  TO authenticated
  USING (
    -- Propriétaire du projet
    EXISTS (SELECT 1 FROM project_summary WHERE project_id = user_roadmap_progress.project_id AND user_id = auth.uid())
    OR
    -- Collaborateur actif
    EXISTS (SELECT 1 FROM project_collaborators WHERE project_id = user_roadmap_progress.project_id AND user_id = auth.uid() AND status = 'active')
  );
```

---

#### 8. **Refund/Annulation** : ❌ Pas de re-lock, ✅ Modification payante

**Règles** :
- ❌ **Impossible de "re-lock" une étape** pour récupérer les crédits
- ✅ **Possible de remodifier une étape** (après l'avoir complétée)
- ✅ **Coût de modification** différent du coût de déblocage

**Nouvelle table** :
```sql
-- Ajouter colonne dans roadmap_steps
ALTER TABLE roadmap_steps ADD COLUMN modification_cost INTEGER DEFAULT 0;

-- Exemple : Déblocage = 600 crédits, Modification = 200 crédits
```

**Nouvelle fonction RPC** :
```sql
CREATE OR REPLACE FUNCTION modify_roadmap_step(
  p_user_id UUID,
  p_project_id UUID,
  p_step_id UUID
) RETURNS JSON AS $$
-- Consommer modification_cost
-- Permettre re-génération IA avec nouvelles réponses
$$;
```

---

### 📋 Réponses aux Questions Design

#### 9. **UI/UX** : ⏳ Maquettes à venir

**Statut** : Pas de maquettes actuellement, à fournir plus tard

**Suggestions d'inspiration** :
- **Duolingo** : Carte de progression linéaire avec étapes verrouillées/débloquées
- **Notion** : Vue en grille avec domaines et sous-étapes
- **Linear** : Roadmap visuelle avec milestones

**À faire** :
- [ ] Créer wireframes de la vue d'ensemble
- [ ] Designer les cartes d'étape
- [ ] Prototyper l'expérience de déblocage

---

#### 10. **Gamification** : ✅ OUI, très important

**Features à implémenter** :

1. **✅ Badges/Achievements** (Important)
   - Badge "Premier pas" : Compléter première étape
   - Badge "Marketeur" : Compléter tout le domaine Marketing
   - Badge "Entrepreneur complet" : Compléter tous les domaines
   - Badge "Sprinteur" : Compléter 5 étapes en 1 semaine

2. **✅ Leaderboard** (Important)
   - Classement par nombre d'étapes complétées
   - Classement par domaines maîtrisés
   - Vue globale + vue par organisation (pour les organisations)

3. **✅ Système de Niveaux** (Important)
   - Niveau 1 : Débutant (0-5 étapes)
   - Niveau 2 : Entrepreneur (6-15 étapes)
   - Niveau 3 : Expert (16-30 étapes)
   - Niveau 4 : Maître (31+ étapes)

**Nouvelles tables** :
```sql
-- Table : user_badges
CREATE TABLE user_badges (
  badge_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL,
  earned_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, badge_type)
);

-- Table : badge_definitions
CREATE TABLE badge_definitions (
  badge_type TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  criteria JSONB  -- Conditions pour obtenir le badge
);

-- Vue : leaderboard
CREATE VIEW leaderboard AS
SELECT
  u.id as user_id,
  p.full_name,
  COUNT(DISTINCT urp.step_id) FILTER (WHERE urp.status = 'completed') as steps_completed,
  COUNT(DISTINCT rs.domain_id) as domains_mastered,
  RANK() OVER (ORDER BY COUNT(DISTINCT urp.step_id) FILTER (WHERE urp.status = 'completed') DESC) as rank
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
LEFT JOIN user_roadmap_progress urp ON u.id = urp.user_id
LEFT JOIN roadmap_steps rs ON urp.step_id = rs.step_id
GROUP BY u.id, p.full_name;
```

---

#### 11. **Notifications** : ⏳ À définir

**Suggestions** :
- ✅ Étape débloquée → Notification in-app
- ✅ Étape complétée → Email de félicitations + suggestion prochaines étapes
- ✅ Domaine complété → Email milestone + badge
- ✅ Crédits < 100 → Email rappel d'achat
- ✅ Badge gagné → Notification in-app

**À clarifier** :
- Fréquence des emails
- Possibilité de désactiver certaines notifications
- Notifications push (mobile app future ?)

---

### 🆕 Clarifications Supplémentaires Importantes

#### 12. **Système de Partenariats** : ✅ Prestataires associés par étape

**Concept** :
- Chaque étape peut avoir 1+ partenaire/prestataire associé
- Exemple : Étape "SEO" → Partenaire agence SEO référencée

**Features** :
- ✅ Prendre rendez-vous avec le partenaire
- ✅ Accéder à des ressources fournies par le partenaire
- ✅ Chat direct avec le partenaire (optionnel)

**Nouvelle table** :
```sql
CREATE TABLE roadmap_step_partners (
  partner_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id UUID REFERENCES roadmap_steps(step_id) ON DELETE CASCADE,
  partner_name TEXT NOT NULL,
  partner_description TEXT,
  partner_logo_url TEXT,
  contact_email TEXT,
  booking_url TEXT,         -- URL Calendly ou autre
  resources_url TEXT[],     -- Array de liens vers docs/vidéos
  created_at TIMESTAMP DEFAULT NOW()
);
```

**UI** :
- Afficher partenaires dans la page de détail de l'étape
- CTA "Prendre RDV" + "Voir ressources"

---

## 📊 Annexes

### A. Structure Complète des Domaines ✅ VALIDÉE

```yaml
domains:
  # ========================================
  # DOMAINE 1 : FONDATIONS (Gratuit)
  # ========================================
  - name: "Fondations"
    icon: "🎯"
    color: "#3B82F6"
    description: "Les bases essentielles pour démarrer votre projet entrepreneurial"
    display_order: 1
    steps:
      - name: "Informations Générales du Projet"
        slug: "informations-generales"
        cost: 0
        modification_cost: 0
        prerequisite: []
        description: "Nom, secteur, vision, mission de votre projet"
        estimated_time_minutes: 15

      - name: "Retranscription du Concept"
        slug: "retranscription-concept"
        cost: 0
        modification_cost: 0
        prerequisite: ["informations-generales"]
        description: "Décrire votre idée d'entreprise en détail"
        estimated_time_minutes: 20

      - name: "Mini SWOT"
        slug: "mini-swot"
        cost: 0
        modification_cost: 0
        prerequisite: ["retranscription-concept"]
        description: "Forces, faiblesses, opportunités et menaces de votre projet"
        estimated_time_minutes: 15

      - name: "Mini Persona"
        slug: "mini-persona"
        cost: 0
        modification_cost: 0
        prerequisite: ["retranscription-concept"]
        description: "Portrait rapide de votre client type"
        estimated_time_minutes: 10

      - name: "Note Globale du Projet"
        slug: "note-globale"
        cost: 0
        modification_cost: 0
        prerequisite: ["mini-swot", "mini-persona"]
        description: "Évaluation automatique de la maturité de votre projet"
        estimated_time_minutes: 5

  # ========================================
  # DOMAINE 2 : MARKETING
  # ========================================
  - name: "Marketing"
    icon: "📊"
    color: "#10B981"
    description: "Stratégie marketing, acquisition et fidélisation clients"
    display_order: 2
    steps:
      - name: "Persona B2C Complet"
        slug: "persona-b2c"
        cost: 600
        modification_cost: 200
        prerequisite: ["mini-persona"]
        description: "Portrait détaillé de votre client particulier"
        legacy_table_name: "persona_express_b2c"
        estimated_time_minutes: 30

      - name: "Persona B2B Complet"
        slug: "persona-b2b"
        cost: 600
        modification_cost: 200
        prerequisite: ["mini-persona"]
        description: "Portrait détaillé de votre client professionnel"
        legacy_table_name: "persona_express_b2b"
        estimated_time_minutes: 30

      - name: "Analyse de Marché"
        slug: "analyse-marche"
        cost: 800
        modification_cost: 250
        prerequisite: ["persona-b2c"]
        description: "Étude de votre marché cible : taille, tendances, segments"
        legacy_table_name: "marche"
        estimated_time_minutes: 45

      - name: "Positionnement & Proposition de Valeur"
        slug: "proposition-valeur"
        cost: 700
        modification_cost: 250
        prerequisite: ["analyse-marche"]
        description: "Ce qui vous différencie de vos concurrents"
        legacy_table_name: "proposition_valeur"
        estimated_time_minutes: 40

      - name: "Stratégie SEO"
        slug: "strategie-seo"
        cost: 900
        modification_cost: 300
        prerequisite: ["proposition-valeur"]
        description: "Optimisation du référencement naturel de votre site"
        estimated_time_minutes: 60
        has_partners: true  # Partenaire : agence SEO

      - name: "Content Marketing (Blog, Presse)"
        slug: "content-marketing"
        cost: 700
        modification_cost: 250
        prerequisite: ["proposition-valeur"]
        description: "Stratégie de contenus : articles, communiqués, contacts presse"
        estimated_time_minutes: 45

      - name: "Supports Marketing (Flyers, Visuels)"
        slug: "supports-marketing"
        cost: 500
        modification_cost: 200
        prerequisite: ["proposition-valeur"]
        description: "Création de vos supports de communication physiques et digitaux"
        estimated_time_minutes: 30

  # ========================================
  # DOMAINE 3 : BRANDING
  # ========================================
  - name: "Branding"
    icon: "🎨"
    color: "#EC4899"
    description: "Identité de marque, charte graphique et positionnement visuel"
    display_order: 3
    steps:
      - name: "Identité Visuelle"
        slug: "identite-visuelle"
        cost: 800
        modification_cost: 300
        prerequisite: ["proposition-valeur"]
        description: "Logo, palette de couleurs, typographies"
        estimated_time_minutes: 50
        has_partners: true  # Partenaire : designer graphique

      - name: "Charte Graphique"
        slug: "charte-graphique"
        cost: 600
        modification_cost: 250
        prerequisite: ["identite-visuelle"]
        description: "Guide d'utilisation de votre identité de marque"
        estimated_time_minutes: 40

      - name: "Positionnement de Marque"
        slug: "positionnement-marque"
        cost: 700
        modification_cost: 250
        prerequisite: ["proposition-valeur"]
        description: "Tonalité, valeurs, promesse de marque"
        estimated_time_minutes: 40

  # ========================================
  # DOMAINE 4 : COMMERCIAL
  # ========================================
  - name: "Commercial"
    icon: "💼"
    color: "#F59E0B"
    description: "Stratégie commerciale, prospection et vente"
    display_order: 4
    steps:
      - name: "Pitch Entrepreneur"
        slug: "pitch"
        cost: 600
        modification_cost: 200
        prerequisite: ["proposition-valeur"]
        description: "Présentation claire et impactante de votre projet"
        legacy_table_name: "pitch"
        estimated_time_minutes: 30

      - name: "Analyse de la Concurrence"
        slug: "analyse-concurrence"
        cost: 800
        modification_cost: 250
        prerequisite: ["pitch", "analyse-marche"]
        description: "Étude détaillée de vos concurrents directs et indirects"
        legacy_table_name: "concurrence"
        estimated_time_minutes: 50

      - name: "Définition de l'Offre Commerciale"
        slug: "offre-commerciale"
        cost: 700
        modification_cost: 250
        prerequisite: ["pitch"]
        description: "Prix, packages, conditions de vente"
        estimated_time_minutes: 40

      - name: "Stratégie de Prospection"
        slug: "strategie-prospection"
        cost: 600
        modification_cost: 200
        prerequisite: ["offre-commerciale"]
        description: "Plan d'action pour acquérir vos premiers clients"
        estimated_time_minutes: 35

      - name: "Argumentaire de Vente"
        slug: "argumentaire-vente"
        cost: 500
        modification_cost: 200
        prerequisite: ["offre-commerciale"]
        description: "Scripts de vente et réponses aux objections"
        estimated_time_minutes: 30

  # ========================================
  # DOMAINE 5 : PRODUCT (Produit)
  # ========================================
  - name: "Product"
    icon: "📦"
    color: "#8B5CF6"
    description: "Catalogue produits, tarification et gestion de gamme"
    display_order: 5
    steps:
      - name: "Catalogue Produits/Services"
        slug: "catalogue-produits"
        cost: 700
        modification_cost: 250
        prerequisite: ["offre-commerciale"]
        description: "Tableau complet : produits, prix, coûts variables, quantités"
        estimated_time_minutes: 45

      - name: "Stratégie de Pricing"
        slug: "strategie-pricing"
        cost: 600
        modification_cost: 200
        prerequisite: ["catalogue-produits"]
        description: "Grille tarifaire optimisée pour votre marché"
        estimated_time_minutes: 35

      - name: "Roadmap Produit"
        slug: "roadmap-produit"
        cost: 500
        modification_cost: 200
        prerequisite: ["catalogue-produits"]
        description: "Plan de développement de votre offre sur 12 mois"
        estimated_time_minutes: 30

  # ========================================
  # DOMAINE 6 : FINANCE
  # ========================================
  - name: "Finance"
    icon: "💰"
    color: "#EF4444"
    description: "Modèle économique, prévisionnel financier et financement"
    display_order: 6
    # IMPORTANT : Tout le domaine Finance nécessite : analyse-marche + catalogue-produits + ressources-requises
    steps:
      - name: "Business Model Canvas"
        slug: "business-model"
        cost: 900
        modification_cost: 300
        prerequisite: ["analyse-marche", "catalogue-produits"]
        description: "Modèle économique de votre entreprise"
        legacy_table_name: "business_model"
        estimated_time_minutes: 60

      - name: "Prévisionnel Financier (3 ans)"
        slug: "previsionnel-financier"
        cost: 1200
        modification_cost: 400
        prerequisite: ["business-model", "ressources-requises"]
        description: "Compte de résultat prévisionnel, plan de trésorerie"
        estimated_time_minutes: 90
        has_partners: true  # Partenaire : expert-comptable

      - name: "Structuration des Coûts"
        slug: "structuration-couts"
        cost: 800
        modification_cost: 250
        prerequisite: ["business-model"]
        description: "Répartition coûts fixes / variables / investissements"
        estimated_time_minutes: 50

      - name: "Stratégie de Financement"
        slug: "strategie-financement"
        cost: 1000
        modification_cost: 350
        prerequisite: ["previsionnel-financier"]
        description: "Levée de fonds, prêts, subventions, bootstrapping"
        estimated_time_minutes: 70
        has_partners: true  # Partenaire : conseiller financier

      - name: "Analyse des Ressources Requises"
        slug: "ressources-requises"
        cost: 700
        modification_cost: 250
        prerequisite: ["business-model"]
        description: "Ressources humaines, matérielles, technologiques nécessaires"
        legacy_table_name: "ressources_requises"
        estimated_time_minutes: 45

  # ========================================
  # DOMAINE 7 : JURIDIQUE
  # ========================================
  - name: "Juridique"
    icon: "⚖️"
    color: "#6366F1"
    description: "Cadre juridique, protection et conformité"
    display_order: 7
    steps:
      - name: "Cadre Juridique & Statut"
        slug: "cadre-juridique"
        cost: 700
        modification_cost: 250
        prerequisite: []
        description: "Choix de la forme juridique (SARL, SAS, auto-entrepreneur, etc.)"
        estimated_time_minutes: 45
        has_partners: true  # Partenaire : avocat/juriste

      - name: "Restrictions Réglementaires"
        slug: "restrictions-reglementaires"
        cost: 600
        modification_cost: 200
        prerequisite: ["cadre-juridique"]
        description: "Normes, licences, autorisations spécifiques à votre secteur"
        estimated_time_minutes: 40

      - name: "Conditions Générales (CGV/CGU)"
        slug: "conditions-generales"
        cost: 500
        modification_cost: 200
        prerequisite: ["cadre-juridique"]
        description: "Rédaction de vos conditions de vente et d'utilisation"
        estimated_time_minutes: 30

      - name: "Politique de Confidentialité (RGPD)"
        slug: "politique-confidentialite"
        cost: 400
        modification_cost: 150
        prerequisite: ["cadre-juridique"]
        description: "Conformité RGPD pour la protection des données"
        estimated_time_minutes: 25

      - name: "Rédaction de Contrats Types"
        slug: "contrats-types"
        cost: 800
        modification_cost: 300
        prerequisite: ["cadre-juridique"]
        description: "Modèles de contrats clients, fournisseurs, partenaires"
        estimated_time_minutes: 50
        has_partners: true  # Partenaire : avocat

      - name: "Protection de la Propriété Intellectuelle"
        slug: "protection-ip"
        cost: 900
        modification_cost: 300
        prerequisite: ["cadre-juridique"]
        description: "Marques, brevets, droits d'auteur"
        estimated_time_minutes: 60
        has_partners: true  # Partenaire : conseil en PI

  # ========================================
  # DOMAINE 8 : SITE WEB
  # ========================================
  - name: "Site Web"
    icon: "🌐"
    color: "#06B6D4"
    description: "Présence en ligne, site vitrine et e-commerce"
    display_order: 8
    steps:
      - name: "Cahier des Charges Site Web"
        slug: "cahier-charges-site"
        cost: 600
        modification_cost: 200
        prerequisite: ["identite-visuelle"]
        description: "Spécifications fonctionnelles et techniques de votre site"
        estimated_time_minutes: 40

      - name: "Arborescence & UX Design"
        slug: "arborescence-ux"
        cost: 500
        modification_cost: 200
        prerequisite: ["cahier-charges-site"]
        description: "Structure du site et parcours utilisateur"
        estimated_time_minutes: 35

      - name: "Optimisation SEO Technique"
        slug: "seo-technique"
        cost: 700
        modification_cost: 250
        prerequisite: ["arborescence-ux", "strategie-seo"]
        description: "Optimisation technique pour le référencement"
        estimated_time_minutes: 45
        has_partners: true  # Partenaire : agence web

      - name: "Stratégie de Contenu Web"
        slug: "strategie-contenu-web"
        cost: 600
        modification_cost: 200
        prerequisite: ["arborescence-ux"]
        description: "Plan de rédaction et architecture de contenu"
        estimated_time_minutes: 40

  # ========================================
  # DOMAINE 9 : COMMUNICATION
  # ========================================
  - name: "Communication"
    icon: "📢"
    color: "#F97316"
    description: "Relations publiques, médias et événementiel"
    display_order: 9
    steps:
      - name: "Stratégie de Communication"
        slug: "strategie-communication"
        cost: 700
        modification_cost: 250
        prerequisite: ["positionnement-marque"]
        description: "Plan de communication global (offline + online)"
        estimated_time_minutes: 45

      - name: "Relations Presse"
        slug: "relations-presse"
        cost: 800
        modification_cost: 300
        prerequisite: ["strategie-communication"]
        description: "Liste de contacts médias et kit presse"
        estimated_time_minutes: 50
        has_partners: true  # Partenaire : attaché de presse

      - name: "Plan d'Événements"
        slug: "plan-evenements"
        cost: 600
        modification_cost: 200
        prerequisite: ["strategie-communication"]
        description: "Salons, webinaires, lancements produits"
        estimated_time_minutes: 40

      - name: "Community Management"
        slug: "community-management"
        cost: 500
        modification_cost: 200
        prerequisite: ["strategie-communication"]
        description: "Gestion des réseaux sociaux et engagement communauté"
        estimated_time_minutes: 30

  # ========================================
  # DOMAINE 10 : OPÉRATIONNEL
  # ========================================
  - name: "Opérationnel"
    icon: "⚙️"
    color: "#64748B"
    description: "Productivité, outils et processus opérationnels"
    display_order: 10
    steps:
      - name: "Outils de Productivité"
        slug: "outils-productivite"
        cost: 400
        modification_cost: 150
        prerequisite: []
        description: "Stack technologique et outils de gestion de projet"
        estimated_time_minutes: 25

      - name: "Templates de Mails Professionnels"
        slug: "templates-mails"
        cost: 300
        modification_cost: 100
        prerequisite: []
        description: "Modèles d'emails pour prospection, relances, etc."
        estimated_time_minutes: 20

      - name: "Framework de Réflexion Stratégique"
        slug: "reflexion-strategique"
        cost: 600
        modification_cost: 200
        prerequisite: ["business-model"]
        description: "Méthodologie pour prendre des décisions stratégiques"
        estimated_time_minutes: 40

      - name: "Analyse d'Impact des Décisions"
        slug: "analyse-impact"
        cost: 500
        modification_cost: 200
        prerequisite: ["reflexion-strategique"]
        description: "Outil d'aide à la décision et analyse des conséquences"
        estimated_time_minutes: 35

      - name: "Processus Opérationnels Clés"
        slug: "processus-operationnels"
        cost: 700
        modification_cost: 250
        prerequisite: ["ressources-requises"]
        description: "Cartographie des processus métier essentiels"
        estimated_time_minutes: 45
```

**📊 Statistiques Globales** :
- **10 domaines** (dont 1 gratuit : Fondations)
- **~60 étapes** au total
- **Coût moyen par étape** : 650 crédits (hors fondations)
- **Coût total pour tout débloquer** : ~35 000 crédits
- **Temps estimé total** : ~40 heures de travail
- **Étapes avec partenaires** : ~15 étapes

**🎯 Parcours Recommandé** :
1. **Fondations** (0 crédits) → Gratuit
2. **Marketing** (Persona + Marché) → 1400 crédits
3. **Commercial** (Pitch + Concurrence) → 1400 crédits
4. **Product** (Catalogue) → 700 crédits
5. **Finance** (Business Model + Ressources) → 1600 crédits
6. **Juridique** (Cadre de base) → 700 crédits
7. **Reste selon priorités**

**Total parcours minimum** : ~6 000 crédits

---

### B. Comparaison Ancien vs Nouveau Modèle

| Aspect | Ancien Modèle | Nouveau Modèle |
|--------|---------------|----------------|
| **Structure** | Liste plate de livrables | Roadmap hiérarchique (domaines → étapes) |
| **Déblocage** | En masse (tous accessibles) | Progressif (étape par étape) |
| **Coût** | Gratuit ou abonnement global | Pay-per-step (crédits par étape) |
| **Progression** | Pas de tracking | Tracking détaillé (locked/unlocked/completed) |
| **Prérequis** | Aucun | Prérequis entre étapes |
| **Gamification** | Aucune | Progression visible, milestones |
| **Analytics** | Limité | Riche (étapes populaires, abandons, etc.) |
| **Flexibilité** | Rigide | Modulaire (ajout facile de nouvelles étapes) |

---

### C. Stack Technologique Finale Recommandée

**Frontend** :
- ✅ **Vite** + React 18 + TypeScript (GARDER)
- ✅ **Tailwind CSS** + CSS Variables (améliorer design tokens)
- ✅ **Shadcn UI** + Radix UI (garder)
- ✅ **TanStack Query** (garder)
- ✅ **React Router** (garder)
- ✅ **Framer Motion** (animations, déjà installé)

**Backend** :
- ✅ **Supabase** (PostgreSQL + Auth + Storage + RLS)
- ✅ **n8n** (webhooks & automation)

**Tooling** :
- ✅ **Vitest** (tests unitaires - à ajouter)
- ✅ **Playwright** (tests E2E - à ajouter)
- ✅ **Sentry** (error monitoring - à ajouter)

---

## 🎯 Conclusion

Cette refonte est **ambitieuse mais réalisable** en **8-10 semaines** avec une équipe de 1-2 développeurs.

**Points clés** :
1. ❌ **NE PAS** migrer vers Next.js (pas de ROI, perte de temps)
2. ✅ **Améliorer** le design system actuel (pas refonte complète)
3. ✅ **Focus total** sur le modèle roadmap entrepreneuriale
4. ⚠️ **Planifier soigneusement** la migration des données
5. 📊 **Monitorer intensivement** après déploiement

**Prochaines étapes** :
1. **Valider** cette analyse avec vous
2. **Répondre** aux questions de clarification (section 9)
3. **Affiner** la structure des domaines et étapes
4. **Démarrer** la Phase 1 (préparation BDD)

---

**Document créé le** : 2025-01-30
**Auteur** : Claude (Anthropic)
**Version** : 1.0
