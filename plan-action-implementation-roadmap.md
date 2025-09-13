# Plan d'Implémentation - Plan d'Action Aurentia

## Résumé Exécutif

**Objectif**: Afficher le plan d'action complet généré par l'IA sur la page `/plan-action` quand `status_action_plan = "Terminé"`.

**Architecture**: 3 sections principales (Classification, Livrables, Hiérarchie) avec données du schéma `action_plan`.

**État actuel**: Analyse terminée, spécifications complètes, prêt pour l'implémentation.

## Étapes d'Implémentation Recommandées

### Phase 1: Fondations (Hook + Badge)
1. **Créer `src/hooks/useActionPlanData.tsx`**
   - Hook pour récupérer toutes les données action_plan
   - Interfaces TypeScript complètes
   - Requêtes SQL optimisées avec jointures

2. **Créer `src/components/actionplan/ActionPlanStatusBadge.tsx`**
   - Badge réutilisable pour statuts (À faire/En cours/Terminé)
   - Badge réutilisable pour priorités (Critique/Important/Normal)

### Phase 2: Composants d'Affichage
3. **Créer `src/components/actionplan/ActionPlanClassification.tsx`**
   - Accordéon avec 4 blocs organisés
   - Données user_responses + classification_projet

4. **Créer `src/components/actionplan/ActionPlanLivrables.tsx`**
   - Accordéon liste des livrables
   - Cards avec jointures phases/tâches

5. **Créer `src/components/actionplan/ActionPlanHierarchy.tsx`**
   - Tableau hiérarchique principal
   - 3 niveaux: Phases → Jalons → Tâches

### Phase 3: Intégration et UX
6. **Créer `src/components/actionplan/ActionPlanModal.tsx`**
   - Modal de détails pour éléments
   - Contenu selon type (phase/jalon/tâche)

7. **Modifier `src/pages/PlanActionPage.tsx`**
   - Intégration conditionnelle des nouveaux composants
   - Logique d'affichage selon status_action_plan

### Phase 4: Tests et Optimisations
8. **Tests avec données réelles**
   - Projet existant: `5789c2c1-9838-4dae-8356-89c88976ad2d`
   - Responsive design
   - Performance

## Spécifications Techniques Clés

### Interfaces TypeScript Principales

```typescript
// Hook principal
interface ActionPlanData {
  userResponses: UserResponses | null;
  classificationProjet: ClassificationProjet | null;  
  hierarchicalData: HierarchicalElement[];
  livrables: Livrable[];
  isLoading: boolean;
  error: string | null;
}

// Données utilisateur
interface UserResponses {
  roles: string;
  budget: string; 
  type_investissement: string;
  date_lancement_prevu: string;
  urgence_lancement: string;
  prise_de_risque: string;
  preference_avancement: string;
  ressources_disponibles: string;
}

// Classification IA
interface ClassificationProjet {
  enjeux_strategiques: string; // JSON array
  contraintes_principales: string;
  opportunites_principales: string;
  axes_prioritaires: string;
  specificites_sectorielles: string;
  parametres_recommandes: string;
}

// Hiérarchie
interface HierarchicalElement {
  id: string;
  type: 'phase' | 'jalon' | 'tache';
  level: number;
  data: Phase | Jalon | Tache;
  sort_primary: number;
  sort_secondary: number;
  sort_tertiary: number;
}
```

### Requêtes SQL Critiques

**1. Données Classification + Réponses Utilisateur**
```sql
SELECT 
  ur.roles, ur.budget, ur.type_investissement, ur.date_lancement_prevu,
  ur.urgence_lancement, ur.prise_de_risque, ur.preference_avancement, ur.ressources_disponibles,
  cp.enjeux_strategiques, cp.contraintes_principales, cp.opportunites_principales,
  cp.axes_prioritaires, cp.specificites_sectorielles, cp.parametres_recommandes
FROM action_plan.user_responses ur
LEFT JOIN action_plan.classification_projet cp ON ur.project_id = cp.project_id  
WHERE ur.project_id = $1;
```

**2. Données Hiérarchiques (Voir spécification détaillée)**
- Union de 3 CTE: phases_data, jalons_data, taches_data
- Tri par sort_primary, sort_secondary, sort_tertiary
- Jointures pour noms de phases parentes

**3. Livrables avec Jointures**
```sql
SELECT 
  l.*, p.nom_phase, t.nom_tache
FROM action_plan.livrables l
LEFT JOIN action_plan.phases p ON l.phase_parent_id = p.phase_id
LEFT JOIN action_plan.taches t ON l.tache_parent_id = t.tache_id
WHERE l.project_id = $1;
```

### Logique d'Affichage PlanActionPage

```typescript
// Dans PlanActionPage.tsx
const { actionPlanData, isLoading, error } = useActionPlanData(activeProjectId);
const shouldShowActionPlan = statusActionPlan === 'Terminé';

// Structure d'affichage
if (shouldShowActionPlan && actionPlanData) {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header existant */}
      <div className="mb-8">
        <h1>Plan d'action</h1>
        <p>Découvrez les étapes clés...</p>
        <Button>En savoir +</Button>
      </div>
      
      {/* NOUVELLES SECTIONS */}
      <div className="space-y-6">
        <ActionPlanClassification data={actionPlanData} />
        <ActionPlanLivrables data={actionPlanData} />
        <ActionPlanHierarchy data={actionPlanData} />
      </div>
    </div>
  );
}
```

### Styling et UX

**Hiérarchie Visuelle**
- Niveau 0 (Phases): `bg-gray-100 font-bold pl-0`
- Niveau 1 (Jalons): `bg-gray-50 font-semibold pl-5`
- Niveau 2 (Tâches): `bg-white font-normal pl-10`

**Badges de Statut**
- À faire: `bg-blue-100 text-blue-800` (#1976d2)
- En cours: `bg-orange-100 text-orange-800` (#f57c00)  
- Terminé: `bg-green-100 text-green-800` (#388e3c)

**Badges de Priorité**
- Critique: `bg-red-100 text-red-800`
- Important: `bg-orange-100 text-orange-800`
- Normal: `bg-gray-100 text-gray-800`

## Données de Test Disponibles

**Projet de test**: `5789c2c1-9838-4dae-8356-89c88976ad2d`
- Status: "Terminé" 
- Données complètes dans toutes les tables action_plan
- 6 phases, 7 jalons, 44 tâches
- Budget: 57000€, Type: CBD/Cannabis

## Points d'Attention Critiques

### Gestion des Données JSON
- `enjeux_strategiques` contient un JSON array complexe
- `livrables_majeurs`, `ressources_cles`, `risques_phase` sont des JSONB
- Parser et valider les données avant affichage

### Performance
- Requête hiérarchique peut être lourde (50+ éléments)
- Implémenter lazy loading ou pagination si nécessaire
- Optimiser les jointures SQL

### UX/UI
- Responsive design essential (mobile/tablet)
- Loading states pour chaque section
- États d'erreur avec retry
- Accessibilité (ARIA labels, keyboard navigation)

## Critères de Succès

✅ **Fonctionnel**
- Affichage correct quand status_action_plan = "Terminé"
- Données hiérarchiques structurées et lisibles
- 3 accordéons fonctionnels avec contenu correct

✅ **Technique** 
- Hook réutilisable et performant
- Composants modulaires et maintenables
- Requêtes SQL optimisées

✅ **UX/Design**
- Interface cohérente avec le reste de l'app
- Responsive et accessible
- Loading states et gestion d'erreurs

## Prochaines Actions Recommandées

1. **Passer en mode Code** pour l'implémentation
2. **Commencer par Phase 1** (Hook + Badge de base)
3. **Tester incrementalement** avec le projet existant
4. **Itérer sur l'UX** selon les retours

Cette roadmap fournit une base solide pour une implémentation réussie et maintenable du plan d'action Aurentia.