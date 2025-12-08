# Documentation Design Chatbot - Pour réplication dans Next.js

## Vue d'ensemble

Cette documentation décrit l'architecture et le design d'un chatbot style ChatGPT avec une interface épurée, responsive, et une barre d'input fixe qui reste toujours visible au-dessus des messages.

---

## 🎯 Caractéristiques principales

1. **Input fixe** : Barre de saisie toujours visible en bas, au-dessus du contenu
2. **Responsive complet** : Adaptation mobile/desktop avec comportements différents
3. **Scroll intelligent** : Les messages défilent sous la barre d'input avec un gradient de transition
4. **Animations fluides** : Transitions CSS personnalisées pour toutes les interactions
5. **Design épuré** : Style minimaliste inspiré de ChatGPT

---

## 📐 Structure HTML/Layout

### Architecture de la page (ChatbotPage.tsx)

```tsx
<div className="flex flex-col h-screen bg-[var(--bg-page)] overflow-hidden overflow-x-hidden">
  {/* Container principal - 60vw sur desktop, 100% sur mobile */}
  <div className="flex flex-col flex-1 w-full md:w-[60vw] mx-auto h-full overflow-hidden relative pt-4 md:pt-6">

    {/* Header fixe avec sticky */}
    <ChatHeader className="sticky top-0 z-10" />

    {/* Zone de contenu avec messages */}
    <div className="w-full flex flex-col flex-1 overflow-hidden px-4 relative z-0">

      {/* Gradient de transition au-dessus de l'input */}
      <div className="absolute bottom-[180px] md:bottom-[220px] left-0 right-0 h-24
                      bg-gradient-to-t from-[var(--bg-page)] to-transparent
                      pointer-events-none z-5" />

      {/* Messages avec scroll */}
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-[160px] md:pb-[200px] relative z-0">
        <MessageList />
      </div>

      {/* Input fixe - CRITIQUE : fixed sur mobile, absolute sur desktop */}
      <div className="fixed md:absolute bottom-[100px] md:bottom-[40px] inset-x-0 px-2 md:px-0 bg-[var(--bg-page)]/95 backdrop-blur-md z-20">
        <div className="w-full mx-auto">
          <ChatInput />
        </div>
      </div>
    </div>
  </div>
</div>
```

### Points clés du layout

1. **Container principal**
   - `h-screen` : Hauteur plein écran
   - `overflow-hidden` : Pas de scroll sur le container principal
   - `w-full md:w-[60vw]` : 100% mobile, 60% viewport desktop

2. **Zone de messages**
   - `overflow-y-auto` : Scroll vertical uniquement
   - `pb-[160px] md:pb-[200px]` : Padding bottom important pour que les messages ne soient pas cachés sous l'input
   - `scrollbar-hide` : Cache la scrollbar native

3. **Input fixe**
   - `fixed` sur mobile : Reste fixe par rapport au viewport
   - `absolute` sur desktop : Reste fixe par rapport au container parent
   - `bottom-[100px] md:bottom-[40px]` : Position en bas avec espace pour la navbar mobile
   - `backdrop-blur-md` : Effet de flou sur le fond
   - `z-20` : Au-dessus de tout le reste

4. **Gradient de transition**
   - `absolute` : Positionné juste au-dessus de l'input
   - `bg-gradient-to-t from-[var(--bg-page)] to-transparent` : Dégradé vers le haut
   - `pointer-events-none` : N'intercepte pas les clics
   - `z-5` : Entre les messages (z-0) et l'input (z-20)

---

## 💬 Composant ChatInput (Barre de saisie)

### Structure desktop

```tsx
<div className="w-full pb-safe px-2">
  <div className="w-full mx-auto bg-[var(--bg-card-static)] border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
    <div className="relative p-2">
      {/* Textarea auto-expand */}
      <textarea
        ref={textareaRef}
        className="w-full resize-none border-none bg-transparent focus:outline-none p-0 pl-2 min-h-[40px] max-h-[360px] text-base"
        style={{
          lineHeight: 'var(--text-base-line-height)',
          transition: 'height var(--transition-base) var(--ease-out)'
        }}
      />
    </div>

    {/* Boutons et options - Desktop uniquement */}
    <div className="px-3 pb-1 pt-1 sm:px-4 sm:pb-2 sm:pt-1">
      <div className="flex items-center gap-2">
        {/* Styles de communication */}
        <ChatInputMenu />

        {/* Modes de recherche */}
        <SearchModeMenu />

        {/* Boutons d'action à droite */}
        <div className="flex items-center gap-2 ml-auto">
          <Button>Reformuler</Button>
          <Button>Envoyer</Button>
        </div>
      </div>
    </div>
  </div>
</div>
```

### Structure mobile

```tsx
<div className="flex items-end gap-2">
  {/* Bouton + pour options */}
  <button className="w-8 h-8 rounded-xl">
    <Plus />
  </button>

  {/* Textarea */}
  <textarea className="flex-1" />

  {/* Boutons d'action */}
  <Button>Reformuler</Button>
  <Button>Envoyer</Button>
</div>
```

### Auto-expansion du textarea

```tsx
useEffect(() => {
  if (textareaRef.current) {
    textareaRef.current.style.height = 'auto';
    // Mobile : expansion jusqu'à la navbar
    // Desktop : maximum 15 lignes (360px)
    const maxHeight = isMobile
      ? Math.max(window.innerHeight - 180, 300)
      : 360;
    textareaRef.current.style.height =
      Math.min(textareaRef.current.scrollHeight, maxHeight) + 'px';
  }
}, [inputMessage, isMobile]);
```

---

## 🎨 Composant ChatHeader (En-tête)

### Structure

```tsx
<div className="bg-[var(--bg-card-static)] border border-gray-200 rounded-2xl shadow-sm hover:shadow-md sticky top-0 z-10 mx-4">
  <div className="px-3 sm:px-4 py-3 sm:py-4">
    <div className="flex items-center gap-3 w-full">
      {/* Logo/Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
        <Sparkles className="w-4 h-4 text-white" />
      </div>

      {/* Select conversation - Desktop uniquement */}
      <div className="flex-1 min-w-0 hidden sm:block">
        <Select>
          {/* Liste des conversations */}
        </Select>
      </div>

      {/* Boutons d'action */}
      <div className="flex items-center gap-1 sm:gap-2 ml-auto">
        {/* Historique (mobile uniquement) */}
        <Button className="sm:hidden">
          <History />
        </Button>

        {/* Nouvelle conversation */}
        <Button>
          <Plus />
          <span className="hidden sm:inline">Nouveau</span>
        </Button>

        {/* Actions sur conversation active */}
        <Button><Share2 /></Button>
        <Button><Pencil /></Button>
        <Button><Trash2 /></Button>
      </div>
    </div>
  </div>
</div>
```

### Points clés

- `sticky top-0 z-10` : Reste en haut lors du scroll
- `mx-4` : Marges latérales
- Boutons responsive : texte caché sur mobile avec `hidden sm:inline`

---

## 📝 Composant MessageList (Liste des messages)

### Structure

```tsx
<div className="mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-20 space-y-6 sm:space-y-8 w-full">
  {messages.map((message) => (
    <div
      key={message.id}
      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div className={message.sender === 'user' ? 'flex flex-row-reverse items-start' : 'flex-col sm:flex-row items-start'}>
        {/* Avatar */}
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full">
          {/* User ou Bot avatar */}
        </div>

        {/* Message bubble */}
        <div className="group relative bg-[var(--bg-card-static)] rounded-2xl px-3 py-2 sm:px-4 sm:py-3">
          {/* Markdown content */}
          <ReactMarkdown>
            {message.text}
          </ReactMarkdown>

          {/* Boutons d'action (hover) - Bot uniquement */}
          {message.sender === 'bot' && (
            <div className="absolute -bottom-7 left-0 opacity-0 group-hover:opacity-100">
              <Button>Copier</Button>
              <Button>Régénérer</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  ))}
</div>
```

### Scroll automatique intelligent

```tsx
// Détecter si l'utilisateur est proche du bas
const isNearBottom = () => {
  const container = scrollContainerRef.current?.parentElement;
  if (!container) return true;

  const threshold = 100;
  const position = container.scrollTop + container.clientHeight;
  const height = container.scrollHeight;

  return position >= height - threshold;
};

// Scroller uniquement si proche du bas
const scrollToBottom = () => {
  if (isNearBottom() && !isUserScrollingRef.current) {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }
};
```

---

## 🎨 Variables CSS et Design System

### Couleurs principales

```css
/* Variables utilisées */
--bg-page: #ffffff;                    /* Fond de page */
--bg-card-static: #ffffff;             /* Fond des cartes non-cliquables */
--bg-card-clickable: #f4f4f5;          /* Fond des cartes cliquables */
--text-primary: #2e333d;               /* Texte principal */
--text-muted: #6b7280;                 /* Texte secondaire */
--text-secondary: #ffffff;             /* Texte sur fond foncé */
--border-default: #e5e7eb;             /* Bordures */
--btn-primary-bg: #FF592C;             /* Bouton principal */
--btn-secondary-bg-hover: #f3f4f6;     /* Hover bouton secondaire */
--btn-danger-bg: #ef4444;              /* Bouton danger */
--btn-disabled-opacity: 0.5;           /* Opacité désactivé */
```

### Gradient principal

```css
.bg-gradient-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Alternative Aurentia */
.bg-gradient-primary {
  background: linear-gradient(135deg, #FF592C 0%, #FF8A5C 100%);
}
```

### Transitions

```css
--transition-fast: 150ms;
--transition-base: 200ms;
--transition-slow: 300ms;
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-default: cubic-bezier(0.4, 0, 0.2, 1);
```

### Animations

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}

/* Utilisation */
.element {
  animation: fadeIn var(--transition-base) var(--ease-out);
}
```

---

## 📱 Responsive Design

### Breakpoints

- **Mobile** : < 640px (Tailwind `sm:`)
- **Desktop** : ≥ 640px

### Différences mobile/desktop

| Élément | Mobile | Desktop |
|---------|--------|---------|
| Container width | 100% | 60vw |
| Input position | `fixed` bottom-[100px] | `absolute` bottom-[40px] |
| Header select | Caché (dropdown séparé) | Visible |
| Boutons texte | Icônes seules | Icône + texte |
| Textarea max-height | window.height - 180px | 360px (15 lignes) |
| Options chat | Popup modal | Inline sous input |
| Padding messages | pb-[160px] | pb-[200px] |

### Classes responsive importantes

```tsx
// Container principal
className="w-full md:w-[60vw]"

// Padding conditionnel
className="pb-[160px] md:pb-[200px]"

// Position input
className="fixed md:absolute bottom-[100px] md:bottom-[40px]"

// Visibility conditionnelle
className="hidden sm:block"        // Caché mobile, visible desktop
className="sm:hidden"              // Visible mobile, caché desktop

// Espacement responsive
className="gap-1 sm:gap-2"         // 4px mobile, 8px desktop
className="px-2 md:px-0"           // Padding mobile uniquement
```

---

## 🎯 Points critiques à respecter

### 1. **Positionnement de l'input**

```tsx
// Mobile : fixed pour rester visible même avec le clavier virtuel
// Desktop : absolute pour rester dans le flux du container parent

className="fixed md:absolute bottom-[100px] md:bottom-[40px]"
```

### 2. **Padding bottom des messages**

```tsx
// Doit être >= hauteur de l'input + gradient + marge
// Sinon les derniers messages seront cachés

className="pb-[160px] md:pb-[200px]"
```

### 3. **Z-index hiérarchie**

```
Messages : z-0 (en arrière)
Gradient : z-5 (au milieu)
Header : z-10 (sticky)
Input : z-20 (devant tout)
Modals : z-50 (au-dessus de tout)
```

### 4. **Backdrop blur sur l'input**

```tsx
// Donne l'effet "glassy" et améliore la lisibilité
className="bg-[var(--bg-page)]/95 backdrop-blur-md"
```

### 5. **Gradient de transition**

```tsx
// Essentiel pour une transition douce entre messages et input
<div className="absolute bottom-[180px] md:bottom-[220px] left-0 right-0 h-24
                bg-gradient-to-t from-[var(--bg-page)] to-transparent
                pointer-events-none z-5" />
```

### 6. **Overflow handling**

```tsx
// Container principal : pas de scroll
className="h-screen overflow-hidden"

// Zone messages : scroll vertical uniquement
className="overflow-y-auto scrollbar-hide"

// Input textarea : auto-expand avec max-height
className="resize-none max-h-[360px] overflow-y-auto"
```

---

## 🔧 Adaptations pour Next.js

### 1. Remplacer les imports React Router

```tsx
// De :
import { useNavigate } from 'react-router-dom';

// À :
import { useRouter } from 'next/navigation';

// Usage :
const router = useRouter();
router.push('/chat');
```

### 2. Gestion des refs

Les refs React fonctionnent de la même manière dans Next.js (côté client).

### 3. Client Components

Ajouter `'use client'` en haut des composants qui utilisent :
- `useState`, `useEffect`, `useRef`
- Event handlers (`onClick`, `onChange`, etc.)
- Hooks personnalisés

```tsx
'use client';

import { useState, useRef } from 'react';
```

### 4. Variables CSS

Créer un fichier `globals.css` avec les variables CSS :

```css
/* app/globals.css */
:root {
  --bg-page: #ffffff;
  --bg-card-static: #ffffff;
  --bg-card-clickable: #f4f4f5;
  --text-primary: #2e333d;
  --text-muted: #6b7280;
  /* ... autres variables */
}
```

### 5. Tailwind config

Étendre la config Tailwind pour les animations :

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-out',
        'fade-out': 'fadeOut 200ms ease-in',
      },
    },
  },
};
```

---

## 📦 Dépendances nécessaires

```json
{
  "dependencies": {
    "react": "^18.0.0",
    "react-markdown": "^8.0.0",
    "remark-gfm": "^3.0.0",
    "rehype-highlight": "^6.0.0",
    "highlight.js": "^11.0.0",
    "lucide-react": "^0.263.0",
    "framer-motion": "^10.0.0",
    "@radix-ui/react-select": "^1.0.0",
    "@radix-ui/react-dialog": "^1.0.0",
    "@radix-ui/react-switch": "^1.0.0"
  }
}
```

---

## 🎬 Animations supplémentaires

### Popup mobile (menu options)

```tsx
<motion.div
  initial={{ opacity: 0, scale: 0.96, y: 8 }}
  animate={{ opacity: 1, scale: 1, y: 0 }}
  exit={{ opacity: 0, scale: 0.96, y: 8 }}
  transition={{
    duration: 0.15,
    ease: [0.4, 0, 0.2, 1]
  }}
  className="fixed bottom-[60px] left-[20px] w-[280px] bg-white rounded-xl"
>
  {/* Contenu du menu */}
</motion.div>
```

### Slide entre vues (mobile)

```tsx
<AnimatePresence mode="wait">
  <motion.div
    key={currentView}
    variants={{
      enter: (direction) => ({
        x: direction > 0 ? '100%' : '-100%',
        opacity: 0,
      }),
      center: {
        x: 0,
        opacity: 1,
      },
      exit: (direction) => ({
        x: direction > 0 ? '-100%' : '100%',
        opacity: 0,
      }),
    }}
    initial="enter"
    animate="center"
    exit="exit"
    transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
  >
    {/* Contenu de la vue */}
  </motion.div>
</AnimatePresence>
```

---

## ✅ Checklist d'implémentation

### Phase 1 : Structure de base
- [ ] Créer le layout principal avec `h-screen` et `overflow-hidden`
- [ ] Implémenter le container centré (60vw desktop, 100% mobile)
- [ ] Ajouter les variables CSS dans `globals.css`
- [ ] Configurer Tailwind pour les animations

### Phase 2 : Composants principaux
- [ ] Créer `ChatHeader` avec sticky positioning
- [ ] Créer `MessageList` avec scroll automatique
- [ ] Créer `ChatInput` avec auto-expansion

### Phase 3 : Input fixe
- [ ] Positionner l'input en `fixed` (mobile) / `absolute` (desktop)
- [ ] Ajouter le padding bottom aux messages (160px/200px)
- [ ] Implémenter le gradient de transition
- [ ] Ajouter le backdrop blur

### Phase 4 : Responsive
- [ ] Tester sur mobile et desktop
- [ ] Ajuster les breakpoints si nécessaire
- [ ] Vérifier le comportement avec le clavier virtuel (mobile)
- [ ] Tester l'auto-expansion du textarea

### Phase 5 : Animations
- [ ] Implémenter les transitions CSS
- [ ] Ajouter Framer Motion pour les popups
- [ ] Tester les animations d'entrée/sortie

### Phase 6 : Finitions
- [ ] Tester le scroll automatique
- [ ] Vérifier les z-index
- [ ] Optimiser les performances
- [ ] Ajouter les boutons d'action (copier, régénérer)

---

## 🐛 Problèmes courants et solutions

### Problème : L'input cache les derniers messages

**Solution** : Augmenter le `pb-[160px]` des messages

```tsx
className="pb-[180px] md:pb-[220px]"
```

### Problème : Le scroll ne fonctionne pas

**Solution** : Vérifier la hiérarchie `overflow`

```tsx
// Parent : pas de scroll
className="overflow-hidden"

// Enfant : scroll vertical uniquement
className="overflow-y-auto"
```

### Problème : Le textarea ne s'expand pas

**Solution** : Vérifier le useEffect et les calculs de hauteur

```tsx
useEffect(() => {
  if (textareaRef.current) {
    textareaRef.current.style.height = 'auto';
    const maxHeight = isMobile ? window.innerHeight - 180 : 360;
    textareaRef.current.style.height =
      Math.min(textareaRef.current.scrollHeight, maxHeight) + 'px';
  }
}, [inputMessage]);
```

### Problème : Le gradient n'est pas visible

**Solution** : Vérifier le positionnement et le z-index

```tsx
// Doit être entre les messages et l'input
className="absolute bottom-[180px] z-5"

// Messages : z-0
// Gradient : z-5
// Input : z-20
```

### Problème : L'input bouge avec le clavier mobile

**Solution** : Utiliser `fixed` sur mobile avec `bottom-[100px]`

```tsx
className="fixed md:absolute bottom-[100px] md:bottom-[40px]"
```

---

## 📸 Captures d'écran de référence

### Desktop Layout
```
┌─────────────────────────────────────────┐
│  [Header - Sticky Top]                  │
├─────────────────────────────────────────┤
│                                         │
│  Message 1                              │
│                                         │
│  Message 2                              │
│                                         │
│  Message 3                              │
│                                         │
│  ▓▓▓▓▓▓▓▓▓ [Gradient]                   │
│  ▒▒▒▒▒▒▒▒▒                              │
│  ░░░░░░░░░                              │
├─────────────────────────────────────────┤
│  [Input Fixe - Absolute]                │
│  [Textarea + Buttons]                   │
└─────────────────────────────────────────┘
```

### Mobile Layout
```
┌──────────────────┐
│ [Header]         │
├──────────────────┤
│                  │
│ Message 1        │
│                  │
│ Message 2        │
│                  │
│ ▓▓▓▓▓ [Gradient] │
│ ▒▒▒▒▒            │
│ ░░░░░            │
├──────────────────┤
│ [Input - Fixed]  │
│ [+ ] [...] [▲]   │
├──────────────────┤
│ [Bottom Nav]     │
└──────────────────┘
```

---

## 🎓 Résumé des concepts clés

1. **Layout en `h-screen`** avec `overflow-hidden` sur le parent
2. **Input fixe** avec `fixed` (mobile) / `absolute` (desktop)
3. **Padding bottom important** sur les messages (160-200px)
4. **Gradient de transition** entre messages et input
5. **Z-index bien défini** : messages (0) < gradient (5) < header (10) < input (20)
6. **Backdrop blur** sur l'input pour l'effet "glassy"
7. **Auto-expansion** du textarea avec `useEffect` et calcul de hauteur
8. **Scroll automatique intelligent** seulement si proche du bas
9. **Responsive avec breakpoints** pour mobile/desktop
10. **Animations CSS** + Framer Motion pour les interactions

---

## 🔗 Fichiers de référence

- `ChatbotPage.tsx` : Structure principale et orchestration
- `ChatInput.tsx` : Barre de saisie avec auto-expansion
- `ChatHeader.tsx` : En-tête avec navigation
- `MessageList.tsx` : Affichage des messages avec scroll
- `theme.css` : Variables CSS du design system
- `components.css` : Classes réutilisables

---

## 💡 Conseil final

Commencez par implémenter la structure de base (layout + input fixe + padding), puis ajoutez progressivement les fonctionnalités (responsive, animations, etc.). Testez sur mobile ET desktop à chaque étape.

Le point le plus critique est le **positionnement de l'input** (`fixed` vs `absolute`) et le **padding bottom des messages** - ces deux éléments doivent être parfaitement synchronisés pour que l'interface fonctionne correctement.
