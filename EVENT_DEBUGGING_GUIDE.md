# Guide de débogage du système d'événements

## Problèmes courants et solutions

### 1. "Une erreur s'est produite lors de la création de l'événement"

#### Causes possibles :
- La table `events` n'existe pas en base de données
- Les policies RLS ne sont pas correctement configurées  
- L'utilisateur n'a pas les permissions pour créer des événements
- Données manquantes ou invalides

#### Comment déboguer :
1. Vérifier les logs dans la console du navigateur (F12)
2. Vérifier les logs de la console VS Code terminal
3. Tester avec Supabase SQL Editor :

```sql
-- Vérifier que la table existe
SELECT * FROM information_schema.tables WHERE table_name = 'events';

-- Vérifier les policies RLS
SELECT * FROM pg_policies WHERE tablename = 'events';

-- Tester l'insertion manuelle
INSERT INTO public.events (title, start_date, end_date, organization_id, type)
VALUES ('Test', now(), now() + interval '1 hour', 'YOUR_ORG_ID', 'workshop');
```

### 2. Valeurs négatives dans max_participants

#### Solution implémentée :
- Ajout de `min="0"` sur les inputs HTML
- Validation JavaScript côté client
- Contrainte CHECK en base de données

### 3. Types d'événements manquants

#### Types supportés :
- `workshop` (Atelier)
- `meeting` (Réunion) 
- `webinar` (Webinaire)
- `networking` (Networking)
- `presentation` (Présentation)
- `training` (Formation)
- `other` (Autre)

### 4. Permissions RLS

#### Policies configurées :
- **Lecture** : Tous les membres de l'organisation peuvent voir les événements
- **Écriture** : Seuls les admins (`organisation`, `staff`) peuvent créer/modifier/supprimer

## Fichiers modifiés

1. **`src/services/organisationService.ts`** : Fonctions CRUD pour les événements
2. **`src/hooks/useEvents.tsx`** : Hook React pour gérer les événements
3. **`src/pages/organisation/OrganisationEvenements.tsx`** : Page principale des événements
4. **`src/components/ui/event-creation-modal.tsx`** : Modal de création d'événements
5. **`src/lib/eventConstants.ts`** : Constantes et couleurs des types d'événements
6. **`db_migrations/20250124_fix_events_table_and_rls.sql`** : Migration pour corriger la table

## Tests

Pour tester le système, vous pouvez :

1. Importer et utiliser `src/utils/testEvents.ts`
2. Vérifier les fonctions avec la console du navigateur
3. Utiliser Supabase Dashboard pour inspecter les données

## Commandes utiles

```bash
# Rebuild pour appliquer les changements
npm run build:dev

# Vérifier les erreurs TypeScript
npm run typecheck

# Lancer en mode développement
npm run dev
```