# Components Chat

Cette documentation décrit la structure refactorisée des composants du chatbot pour améliorer la lisibilité et la maintenance du code.

## Structure des composants

### 🎯 **ChatbotPage.tsx** (Composant principal)
- **Responsabilité** : Orchestration de tous les sous-composants
- **État** : Gestion de l'état local (input, dialogs, paramètres)
- **Logique** : Coordination entre les différents composants

### 🎛️ **ChatHeader.tsx**
- **Responsabilité** : En-tête avec sélecteur de conversation et actions
- **Fonctionnalités** :
  - Sélection de conversation
  - Boutons nouveau chat, renommer, supprimer
  - Affichage conditionnel selon l'historique

### 💬 **MessageList.tsx**
- **Responsabilité** : Affichage des messages avec interactions
- **Fonctionnalités** :
  - Rendu des messages utilisateur/bot
  - Effet de streaming en temps réel
  - Actions copier/régénérer
  - Auto-scroll vers le bas
  - Indicateur de chargement

### ⌨️ **ChatInput.tsx**
- **Responsabilité** : Zone de saisie avec contrôles avancés
- **Fonctionnalités** :
  - Textarea auto-redimensionnable
  - Sélection du style de communication
  - Multi-sélection des livrables
  - Multi-sélection des modes de recherche
  - Bouton d'envoi avec états

### ✨ **SuggestedPrompts.tsx**
- **Responsabilité** : Grille des prompts suggérés
- **Fonctionnalités** :
  - Affichage en grille responsive
  - Sélection de prompt pré-défini
  - Intégration avec l'input

### 🗨️ **ChatDialogs.tsx**
- **Responsabilité** : Modales de gestion des conversations
- **Fonctionnalités** :
  - Dialog de renommage
  - Dialog de suppression
  - Gestion des états d'ouverture/fermeture

## Hook personnalisé

### 🔧 **useChatConversation.tsx**
- **Responsabilité** : Logique métier de gestion des conversations
- **Fonctionnalités** :
  - Chargement de l'historique
  - Création/suppression de conversations
  - Envoi/régénération de messages
  - Streaming des réponses
  - Gestion des erreurs
  - Persistence en base de données

## Avantages de cette architecture

### ✅ **Séparation des responsabilités**
- Chaque composant a une responsabilité claire et unique
- La logique métier est séparée de l'interface utilisateur

### ✅ **Réutilisabilité**
- Les composants peuvent être réutilisés dans d'autres contextes
- Interfaces props bien définies

### ✅ **Maintenabilité**
- Code plus facile à comprendre et modifier
- Tests unitaires plus simples à écrire

### ✅ **Lisibilité**
- Fichiers plus courts et focalisés
- Navigation plus facile dans le code

### ✅ **Évolutivité**
- Ajout de nouvelles fonctionnalités facilité
- Modifications isolées par composant

## Import/Export

```typescript
// Import groupé depuis l'index
import { 
  ChatHeader, 
  MessageList, 
  ChatInput, 
  SuggestedPrompts, 
  ChatDialogs 
} from '@/components/chat';

// Import du hook
import { useChatConversation } from '@/hooks/useChatConversation';
```

## Types partagés

Les types principaux sont définis dans :
- `@/services/chatbotService` : `Message`, `Conversation`
- Interfaces locales dans chaque composant selon les besoins

Cette structure permet une meilleure organisation du code tout en conservant toutes les fonctionnalités existantes. 