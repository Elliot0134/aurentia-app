# 🔄 Guide de Migration React → Next.js

Ce document détaille toutes les adaptations nécessaires pour migrer le code d'onboarding de React (Vite) vers Next.js.

---

## 1. Navigation

### ❌ Avant (React Router)

```typescript
import { useNavigate } from 'react-router-dom';

const Component = () => {
  const navigate = useNavigate();
  
  // Navigation
  navigate('/individual/dashboard');
};
```

### ✅ Après (Next.js)

```typescript
'use client';

import { useRouter } from 'next/navigation';

const Component = () => {
  const router = useRouter();
  
  // Navigation
  router.push('/individual/dashboard');
};
```

---

## 2. Imports d'alias

### ❌ Avant (Vite avec `@/`)

```typescript
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
```

### ✅ Après (Next.js)

Configure `tsconfig.json` :

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

Les imports restent identiques si tu utilises la même structure.

---

## 3. Structure des pages

### ❌ Avant (React avec react-router)

```
src/
├── pages/
│   └── Onboarding.tsx
└── App.tsx (avec les routes)
```

### ✅ Après (Next.js App Router)

```
app/
├── onboarding/
│   └── page.tsx
└── layout.tsx
```

**Fichier `app/onboarding/page.tsx` :**

```typescript
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-500">
      <OnboardingFlow />
    </div>
  );
}
```

---

## 4. Directive 'use client'

Les composants utilisant :
- `useState`, `useEffect`
- `framer-motion`
- Event handlers (`onClick`, etc.)
- Browser APIs (`window`, `document`)

**Doivent avoir `'use client'` en première ligne :**

```typescript
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
// ...
```

### Fichiers nécessitant 'use client'

| Fichier | Raison |
|---------|--------|
| `OnboardingFlow.tsx` | useState, useEffect, navigation |
| `ProgressDots.tsx` | framer-motion |
| `ThemeSelection.tsx` | framer-motion, onClick |
| `PersonalInfo.tsx` | useState, useRef, framer-motion |
| `DiscoverySource.tsx` | framer-motion, onClick |
| `UserTypeSelection.tsx` | framer-motion, onClick |
| `GoalsSelection.tsx` | framer-motion, onClick |
| `PlanSelection.tsx` | framer-motion, onClick |
| `useOnboardingStatus.ts` | useState, useEffect |

---

## 5. Supabase Client

### ❌ Avant

```typescript
import { supabase } from '@/integrations/supabase/client';
```

### ✅ Après (Next.js avec @supabase/ssr)

**Installer :**

```bash
pnpm add @supabase/supabase-js @supabase/ssr
```

**Créer `/lib/supabase/client.ts` :**

```typescript
import { createBrowserClient } from '@supabase/ssr';

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
```

**Usage dans les composants :**

```typescript
'use client';

import { createClient } from '@/lib/supabase/client';

const Component = () => {
  const supabase = createClient();
  
  // Utiliser supabase...
};
```

---

## 6. Gestion du thème (Dark Mode)

### ❌ Avant (manipulation directe du DOM)

```typescript
useEffect(() => {
  if (data.theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}, [data.theme]);
```

### ✅ Après (avec next-themes - recommandé)

**Installer :**

```bash
pnpm add next-themes
```

**Dans `app/layout.tsx` :**

```typescript
import { ThemeProvider } from 'next-themes';

export default function RootLayout({ children }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**Dans `ThemeSelection.tsx` :**

```typescript
'use client';

import { useTheme } from 'next-themes';

const ThemeSelection = ({ selectedTheme, onSelect }) => {
  const { setTheme } = useTheme();
  
  const handleSelect = (theme: 'light' | 'dark') => {
    setTheme(theme);
    onSelect(theme);
  };
  
  // ...
};
```

---

## 7. Images et Assets

### ❌ Avant (chemins relatifs)

```tsx
<img src="/icones/ampoule-icon.png" alt="..." />
```

### ✅ Après (Next.js Image - optionnel mais recommandé)

```tsx
import Image from 'next/image';

<Image 
  src="/icones/ampoule-icon.png" 
  alt="..."
  width={80}
  height={80}
  className="object-contain"
/>
```

**Note :** Les chemins `/public/icones/...` fonctionnent toujours en tant que `/icones/...` dans Next.js.

---

## 8. Toast Notifications

### ❌ Avant (shadcn toast custom)

```typescript
import { toast } from '@/components/ui/use-toast';

toast({
  title: 'Bienvenue!',
  description: 'Message...',
  variant: 'destructive',
});
```

### ✅ Après (options)

**Option A : Garder shadcn/ui toast**

Fonctionne pareil, assure-toi d'avoir le `<Toaster />` dans ton layout.

**Option B : Utiliser sonner (plus simple)**

```bash
pnpm add sonner
```

```typescript
import { toast } from 'sonner';

toast.success('Bienvenue!');
toast.error('Erreur...');
```

---

## 9. Redirection des nouveaux utilisateurs

### Logic de redirection dans Next.js

**Créer un middleware `/middleware.ts` :**

```typescript
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value;
        },
        set(name, value, options) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name, options) {
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  // Si connecté, vérifier l'onboarding
  if (session) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', session.user.id)
      .single();

    // Rediriger vers onboarding si pas complété
    if (!profile?.onboarding_completed && !request.nextUrl.pathname.startsWith('/onboarding')) {
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/individual/:path*'],
};
```

---

## 10. Hook useOnboardingStatus adapté

```typescript
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export const useOnboardingStatus = () => {
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          setOnboardingCompleted(null);
          setLoading(false);
          return;
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Error checking onboarding status:', error);
          setOnboardingCompleted(null);
        } else {
          setOnboardingCompleted(profile?.onboarding_completed || false);
        }
      } catch (error) {
        console.error('Error in onboarding status check:', error);
        setOnboardingCompleted(null);
      } finally {
        setLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [supabase]);

  return { onboardingCompleted, loading };
};
```

---

## 📋 Résumé des changements

| Élément | React (Vite) | Next.js |
|---------|--------------|---------|
| Navigation | `useNavigate()` | `useRouter()` |
| Router | react-router-dom | next/navigation |
| Pages | `src/pages/` | `app/*/page.tsx` |
| Client components | Implicite | `'use client'` requis |
| Supabase | Client simple | `@supabase/ssr` |
| Thème | DOM direct | `next-themes` |
| Images | `<img>` | `<Image>` (optionnel) |
| Redirections | Dans composants | Middleware |

---

## ⚠️ Points d'attention

1. **Hydration mismatch** : Avec framer-motion et le thème, utilise `suppressHydrationWarning` sur `<html>`

2. **Animations initiales** : Utilise `initial={false}` sur AnimatePresence si tu as des problèmes au premier rendu

3. **Supabase cookies** : En Next.js, la gestion des sessions est plus complexe côté serveur

4. **Environment variables** : Utilise `NEXT_PUBLIC_` pour les variables accessibles côté client
