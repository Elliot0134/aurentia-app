# Système d'activités récentes - Organisation Dashboard

## Vue d'ensemble

Ce système affiche les activités récentes dans la section "Activité Récente" du dashboard d'organisation. Il collecte automatiquement les événements les plus pertinents à travers toutes les tables liées à l'organisation et les affiche de manière paginée (15 par 15).

## Architecture

### 1. Service (`recentActivityService.ts`)

Le service `recentActivityService` est responsable de :
- Récupérer les activités récentes depuis différentes tables Supabase
- Combiner et trier les activités par date
- Implémenter la pagination
- Fournir le comptage total des activités

**Types d'activités supportés :**

| Type | Description | Tables source |
|------|-------------|---------------|
| `user_joined` | Nouveau membre rejoint l'organisation | `user_organizations` |
| `project_created` | Nouveau projet créé | `projects` |
| `project_completed` | Projet terminé (100% d'avancement) | `projects` |
| `deliverable_completed` | Livrable terminé | `deliverables` |
| `event_created` | Nouvel événement planifié | `events` |
| `invitation_created` | Code d'invitation créé | `invitation_codes` |
| `form_created` | Nouveau formulaire créé | `organisation_forms` |

### 2. Hook (`useRecentActivities.ts`)

Le hook `useRecentActivities` gère :
- L'état de chargement des activités
- La pagination avec le bouton "Charger plus"
- Le rafraîchissement des données
- La gestion des erreurs

**API du hook :**
```typescript
const {
  activities,        // Liste des activités
  loading,          // État de chargement initial
  loadingMore,      // État de chargement pour "Charger plus"
  error,            // Message d'erreur éventuel
  hasMore,          // Booléen indiquant s'il y a plus d'activités
  totalCount,       // Nombre total d'activités
  loadMore,         // Fonction pour charger plus d'activités
  refresh           // Fonction pour rafraîchir
} = useRecentActivities(15);
```

### 3. Composant (`recent-activities-list.tsx`)

Le composant `RecentActivitiesList` affiche :
- Liste des activités avec avatars utilisateurs et icônes
- Badges colorés par type d'activité
- Timestamps relatifs ("il y a 2 heures")
- Bouton "Charger plus" avec indicateur de chargement
- États de chargement et d'erreur
- Métadonnées additionnelles (projet associé, type d'événement, etc.)

## Fonctionnalités

### Pagination intelligente
- Charge 15 activités par défaut
- Bouton "Charger plus" pour charger 15 activités supplémentaires
- Détection automatique de la fin des données
- Indicateur de chargement pendant la récupération

### Typage fort des activités
Chaque activité contient :
```typescript
interface RecentActivity {
  id: string;                    // Identifiant unique
  type: ActivityType;            // Type d'activité
  title: string;                 // Titre court
  description: string;           // Description détaillée
  icon: string;                  // Emoji/icône
  user_name?: string;            // Nom de l'utilisateur
  user_email?: string;           // Email de l'utilisateur
  entity_id?: string;            // ID de l'entité liée
  entity_name?: string;          // Nom de l'entité liée
  created_at: string;            // Date de création
  metadata?: Record<string, any>; // Métadonnées additionnelles
}
```

### Affichage adaptatif
- **Avec utilisateur** : Avatar avec initiales + nom complet
- **Sans utilisateur** : Icône emoji représentant l'activité
- **Badges colorés** : Chaque type d'activité a sa couleur
- **Métadonnées contextuelles** : Informations supplémentaires selon le type

### Gestion des performances
- Requêtes optimisées avec `select` spécifiques
- Limite des résultats par requête
- Tri côté base de données
- Gestion du cache par React Query (si implémenté)

## Utilisation

### Dans le Dashboard

```typescript
import { useRecentActivities } from '@/hooks/useRecentActivities';
import RecentActivitiesList from '@/components/ui/recent-activities-list';

const OrganisationDashboard = () => {
  const { 
    activities, 
    loading, 
    loadingMore, 
    hasMore, 
    loadMore, 
    error 
  } = useRecentActivities(15);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activité Récente</CardTitle>
      </CardHeader>
      <CardContent>
        <RecentActivitiesList
          activities={activities}
          loading={loading}
          loadingMore={loadingMore}
          hasMore={hasMore}
          onLoadMore={loadMore}
          error={error}
        />
      </CardContent>
    </Card>
  );
};
```

## Extensibilité

### Ajouter un nouveau type d'activité

1. **Mettre à jour le type :**
```typescript
// Dans recentActivityService.ts
export type ActivityType = 
  | 'user_joined' 
  | 'project_created'
  | 'nouveau_type_activite'; // Nouveau type
```

2. **Ajouter la logique de récupération :**
```typescript
// Dans getRecentActivities()
const { data: newData } = await supabase
  .from('nouvelle_table')
  .select('*')
  .eq('organization_id', organizationId)
  .order('created_at', { ascending: false })
  .limit(5);

if (newData) {
  newData.forEach((item: any) => {
    activities.push({
      id: `nouveau_type_${item.id}`,
      type: 'nouveau_type_activite',
      title: 'Nouveau titre',
      description: 'Description',
      icon: '🆕',
      created_at: item.created_at
    });
  });
}
```

3. **Mettre à jour les composants visuels :**
```typescript
// Dans recent-activities-list.tsx
const getActivityColor = (type: RecentActivity['type']): string => {
  const colors = {
    // ... autres types
    nouveau_type_activite: 'bg-red-100 text-red-800 border-red-200'
  };
  return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
};
```

## Intégration avec Supabase

Le système utilise les tables existantes de Supabase :
- `user_organizations` : Pour les nouveaux membres
- `projects` : Pour les projets créés/terminés
- `deliverables` : Pour les livrables terminés
- `events` : Pour les événements créés
- `invitation_codes` : Pour les invitations créées
- `organisation_forms` : Pour les formulaires créés

**Optimisations de requêtes :**
- Utilisation de `select()` spécifiques pour minimiser les données transférées
- Jointures optimisées avec les profils utilisateurs
- Tri et limitation côté base de données
- Requêtes parallèles pour de meilleures performances

## Améliorations futures possibles

1. **Cache et React Query** : Implémenter du caching pour éviter les requêtes répétées
2. **Filtrage** : Permettre de filtrer les activités par type
3. **Temps réel** : Utiliser les subscriptions Supabase pour les mises à jour en temps réel
4. **Notifications push** : Envoyer des notifications pour les activités importantes
5. **Analytics** : Ajouter des métriques sur les activités les plus fréquentes
6. **Recherche** : Permettre de rechercher dans les activités
7. **Export** : Exporter les activités en CSV/PDF