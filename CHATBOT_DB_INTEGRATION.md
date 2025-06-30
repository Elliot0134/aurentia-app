# 🤖 Intégration Base de Données - Chatbot Aurentia

## 📋 Résumé des modifications

Cette implémentation ajoute la persistence complète des conversations et messages du chatbot en base de données Supabase, avec envoi des nouvelles données `isFirstMessage` et `convId` au webhook.

## 🗄️ Structure de la base de données

### Nouvelle table `conversation`
```sql
CREATE TABLE public.conversation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  project_id uuid NOT NULL REFERENCES public.project_summary(project_id),
  title text NOT NULL DEFAULT 'Nouvelle conversation',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
```

### Nouvelle table `messages`
```sql
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversation(id),
  sender text NOT NULL CHECK (sender IN ('user', 'bot')),
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);
```

## 🔧 Changements techniques

### 1. Service Chatbot (`chatbotService.ts`)

**Nouvelles méthodes ajoutées :**

- `createConversationInDB()` - Créer conversation en DB
- `loadConversationFromDB()` - Charger conversation avec messages
- `saveMessageToDB()` - Sauvegarder message en DB
- `updateMessageInDB()` - Mettre à jour message en DB
- `getUserConversationsFromDB()` - Lister conversations utilisateur
- `updateConversationTitleInDB()` - Mettre à jour titre conversation
- `deleteConversationFromDB()` - Supprimer conversation
- `createNewConversation()` - Créer conversation complète (DB + local)
- `addMessageWithDB()` - Ajouter message avec persistence DB
- `updateMessageWithDB()` - Mettre à jour message avec persistence DB

### 2. Page Chatbot (`ChatbotPage.tsx`)

**Modifications principales :**

- **Initialisation** : Création automatique de conversation en DB au chargement
- **Envoi de messages** : Sauvegarde des messages utilisateur et bot en DB
- **Webhook enrichi** : Ajout de `isFirstMessage` et `convId`
- **Nouvelles conversations** : Utilisation de la DB pour créer de nouvelles conversations
- **Gestion d'erreurs** : Notifications si échec de sauvegarde DB

### 3. Migration SQL (`chatbot_migration.sql`)

**À exécuter sur Supabase :**

- Suppression des anciennes tables avec structure incorrecte
- Création des nouvelles tables avec les bonnes relations
- Ajout d'index pour optimiser les performances
- Configuration Row Level Security (RLS) pour la sécurité
- Politiques d'accès basées sur l'utilisateur connecté

## 📤 Données envoyées au webhook

Le webhook reçoit maintenant ces données supplémentaires :

```json
{
  "message": "Message de l'utilisateur",
  "projectId": "uuid-du-projet",
  "communicationStyle": "normal",
  "projectSearchMode": false,
  "selectedDeliverables": ["Analyse de marché", "Pitch"],
  "isFirstMessage": true,  // ← NOUVEAU
  "convId": "uuid-conversation"  // ← NOUVEAU
}
```

## 🔄 Flux de fonctionnement

### Démarrage d'une conversation
1. L'utilisateur accède à `/chatbot/:projectId`
2. Le système vérifie l'authentification Supabase
3. Création automatique d'une conversation en DB
4. Affichage de l'interface avec conversation vide

### Envoi d'un message
1. L'utilisateur saisit un message
2. Sauvegarde du message utilisateur en DB
3. Envoi au webhook avec `isFirstMessage` et `convId`
4. Création d'un message bot vide pour le streaming
5. Streaming de la réponse en temps réel
6. Mise à jour du message bot avec la réponse complète en DB

### Régénération
1. Clic sur "Régénérer"
2. Envoi au webhook avec `isFirstMessage: false`
3. Mise à jour du message existant en DB

## 🛡️ Sécurité

- **RLS activé** : Seul le propriétaire peut voir ses conversations
- **Authentification** : Vérification obligatoire de la session Supabase
- **Cascade DELETE** : Suppression automatique des messages si conversation supprimée
- **Validation** : Type de sender vérifié (`user` ou `bot` uniquement)

## 🚀 Installation

1. **Exécuter la migration :**
   ```sql
   -- Exécuter le contenu de chatbot_migration.sql dans Supabase
   ```

2. **Le code est déjà intégré** dans `ChatbotPage.tsx` et `chatbotService.ts`

3. **Aucune action supplémentaire requise** - le système fonctionne automatiquement

## 📊 Avantages

- ✅ **Persistence** : Les conversations survivent au rechargement de page
- ✅ **Multi-projets** : Conversations séparées par projet
- ✅ **Sécurité** : Isolation des données par utilisateur
- ✅ **Performance** : Index optimisés pour les requêtes
- ✅ **Streaming** : Réponses en temps réel maintenues
- ✅ **Webhook enrichi** : Plus de contexte pour l'IA
- ✅ **Gestion d'erreurs** : Notifications utilisateur en cas de problème

## 🐛 Gestion d'erreurs

- Notifications toast en cas d'échec de sauvegarde
- Fallback sur localStorage si DB indisponible
- Messages d'erreur détaillés dans la console
- Cooldown pour éviter les doublons de messages

## 📝 Notes techniques

- Les conversations sont liées à `project_summary` (pas `form_business_idea`)
- Compatible avec le système existant de localStorage
- Support complet des fonctionnalités existantes (renommer, supprimer, etc.)
- Streaming maintenu pour une UX fluide 