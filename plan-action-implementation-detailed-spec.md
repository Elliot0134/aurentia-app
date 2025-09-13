# Spécification Détaillée - Implémentation Plan d'Action

## Vue d'ensemble
Implémentation complète de l'affichage du plan d'action sur la page `/plan-action` quand `status_action_plan = "Terminé"`.

## Architecture des Composants

### 1. Hook useActionPlanData (`src/hooks/useActionPlanData.tsx`)

**Objectif**: Récupérer toutes les données du schéma action_plan

**Interface TypeScript**:
```typescript
interface ActionPlanData {
  userResponses: UserResponses | null;
  classificationProjet: ClassificationProjet | null;
  phases: Phase[];
  jalons: Jalon[];
  taches: Tache[];
  livrables: Livrable[];
  hierarchicalData: HierarchicalElement[];
}

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

interface ClassificationProjet {
  enjeux_strategiques: string;
  contraintes_principales: string;
  opportunites_principales: string;
  axes_prioritaires: string;
  specificites_sectorielles: string;
  parametres_recommandes: string;
}

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

**Requêtes SQL**:
- Récupération des données de base (user_responses, classification_projet)
- Requête hiérarchique complexe pour phases/jalons/tâches avec tri
- Récupération des livrables avec jointures

### 2. Composant ActionPlanClassification (`src/components/actionplan/ActionPlanClassification.tsx`)

**Objectif**: Accordéon pour afficher la classification et les réponses utilisateur

**Structure**:
- 4 blocs visuels organisés logiquement
- Données user_responses et classification_projet
- Design avec cards et badges

**Disposition des blocs**:
1. **Contexte Projet**: roles, budget, type_investissement
2. **Planning & Urgence**: date_lancement_prevu, urgence_lancement
3. **Style de Travail**: prise_de_risque, preference_avancement
4. **Analyse Stratégique**: enjeux_strategiques, contraintes_principales, opportunites_principales

### 3. Composant ActionPlanLivrables (`src/components/actionplan/ActionPlanLivrables.tsx`)

**Objectif**: Accordéon pour afficher tous les livrables

**Structure**:
- Liste de tous les livrables avec jointures vers phases/tâches
- Cards avec informations complètes
- Badges de statut colorés
- Critères qualité en format JSON

**Données affichées**:
- livrable_nom, format_attendu
- phase_parent (nom de la phase)
- tache_parent (nom de la tâche si applicable)
- criteres_qualite (array JSON)
- validateur, statut

### 4. Composant ActionPlanHierarchy (`src/components/actionplan/ActionPlanHierarchy.tsx`)

**Objectif**: Tableau hiérarchique principal Phases → Jalons → Tâches

**Structure**:
- Table avec hiérarchie visuelle (indentations)
- Colonnes: Élément, Type, Responsable, Durée/Période, Priorité/Criticité, Statut, Budget
- Expand/Collapse des phases
- Modal de détails au clic

**Hiérarchie visuelle**:
- **Niveau 0 (Phases)**: Fond gris clair, texte gras, indentation 0px
- **Niveau 1 (Jalons)**: Fond gris très clair, texte semi-gras, indentation 20px  
- **Niveau 2 (Tâches)**: Fond blanc, texte normal, indentation 40px

### 5. Composant ActionPlanStatusBadge (`src/components/actionplan/ActionPlanStatusBadge.tsx`)

**Objectif**: Badge coloré pour les statuts du plan d'action

**Codes couleur**:
- "À faire": Bleu (#1976d2)
- "En cours": Orange (#f57c00)
- "Terminé": Vert (#388e3c)

**Codes couleur priorités**:
- "Critique/Bloquante": Rouge
- "Important/Élevée": Orange  
- "Normal/Moyenne/Modérée": Gris

### 6. Composant ActionPlanModal (`src/components/actionplan/ActionPlanModal.tsx`)

**Objectif**: Modal de détails pour phases/jalons/tâches

**Contenu selon le type**:
- **Phase**: Tous les champs + données JSON (livrables_majeurs, ressources_cles, risques_phase)
- **Jalon**: Détails + condition_validation, impact_si_echec
- **Tâche**: Détails complets + arrays JSON (responsables, livrables, critères_validation, etc.)

## Intégration dans PlanActionPage.tsx

### Logique d'affichage
```typescript
// Conditions d'affichage
const shouldShowActionPlan = statusActionPlan === 'Terminé';

// Structure de la page
if (shouldShowActionPlan) {
  return (
    <>
      {/* Header existant */}
      <ActionPlanClassification data={actionPlanData} />
      <ActionPlanLivrables data={actionPlanData} />
      <ActionPlanHierarchy data={actionPlanData} />
    </>
  );
}
```

### Position dans la page
- Affichage SOUS le titre, sous-titre et bouton "En savoir +"
- Toujours visible quand statut = "Terminé"
- Remplace les autres états d'affichage

## Requêtes SQL Détaillées

### Requête Classification + User Responses
```sql
SELECT 
  ur.roles, ur.budget, ur.type_investissement, ur.date_lancement_prevu, 
  ur.urgence_lancement, ur.prise_de_risque, ur.preference_avancement, 
  ur.ressources_disponibles,
  cp.enjeux_strategiques, cp.contraintes_principales, cp.opportunites_principales,
  cp.axes_prioritaires, cp.specificites_sectorielles, cp.parametres_recommandes
FROM action_plan.user_responses ur
LEFT JOIN action_plan.classification_projet cp ON ur.project_id = cp.project_id
WHERE ur.project_id = $1;
```

### Requête Hiérarchique Complète
```sql
WITH phases_data AS (
  SELECT 
    p.project_id, p.user_id, p.id, p.phase_id as element_id,
    p.phase_index, p.ordre_execution, p.nom_phase as nom, p.objectif_principal,
    p.duree_mois as duree, p.periode, p.focus_sectoriel, p.budget_minimum, p.budget_optimal,
    p.livrables_majeurs, p.ressources_cles, p.risques_phase, p.statut,
    p.created_at, p.updated_at,
    'phase' as type, 0 as level,
    p.phase_index as sort_primary, 0 as sort_secondary, 0 as sort_tertiary,
    null as criticite, null as responsable, null as parent_phase, null as parent_jalon
  FROM action_plan.phases p
  WHERE p.project_id = $1
),
jalons_data AS (
  SELECT 
    j.project_id, j.user_id, j.id, j.jalon_id as element_id,
    j.jalon_index as phase_index, 0 as ordre_execution, j.jalon_nom as nom,
    j.condition_validation as objectif_principal, j.semaine as duree, j.semaine_cible as periode,
    null as focus_sectoriel, null as budget_minimum, null as budget_optimal,
    '[]'::jsonb as livrables_majeurs, '[]'::jsonb as ressources_cles, '[]'::jsonb as risques_phase,
    j.statut, j.created_at, j.updated_at,
    'jalon' as type, 1 as level,
    p.phase_index as sort_primary, j.jalon_index as sort_secondary, 0 as sort_tertiary,
    j.criticite, j.responsable_validation as responsable, j.phase_parent_id as parent_phase, null as parent_jalon,
    j.impact_si_echec
  FROM action_plan.jalons j
  JOIN action_plan.phases p ON j.phase_parent_id = p.phase_id
  WHERE j.project_id = $1
),
taches_data AS (
  SELECT 
    t.project_id, t.user_id, t.id, t.tache_id as element_id,
    t.tache_index as phase_index, t.ordre_execution, t.nom_tache as nom,
    t.description_detaillee as objectif_principal, t.duree_estimee as duree, t.priorite as periode,
    t.criticite_justification as focus_sectoriel, null as budget_minimum, null as budget_optimal,
    t.livrables as livrables_majeurs, t.competences_requises as ressources_cles, t.risques as risques_phase,
    t.statut, t.created_at, t.updated_at,
    'tache' as type, 2 as level,
    p.phase_index as sort_primary, COALESCE(j.jalon_index, 999) as sort_secondary, t.ordre_execution as sort_tertiary,
    t.priorite as criticite, array_to_string(ARRAY(SELECT jsonb_array_elements_text(t.responsables)), ', ') as responsable,
    t.phase_parent_id as parent_phase, t.jalon_parent_id as parent_jalon,
    t.criteres_validation, t.dependances_taches, t.outils_necessaires, t.recommandations_pratiques
  FROM action_plan.taches t
  JOIN action_plan.phases p ON t.phase_parent_id = p.phase_id
  LEFT JOIN action_plan.jalons j ON t.jalon_parent_id = j.jalon_id
  WHERE t.project_id = $1
)
SELECT * FROM phases_data
UNION ALL
SELECT [...] FROM jalons_data  
UNION ALL
SELECT [...] FROM taches_data
ORDER BY sort_primary, sort_secondary, sort_tertiary;
```

### Requête Livrables
```sql
SELECT 
  l.livrable_id, l.livrable_nom, l.phase_parent_id, l.tache_parent_id,
  l.format_attendu, l.criteres_qualite, l.validateur, l.statut,
  l.created_at, l.updated_at,
  p.nom_phase, t.nom_tache
FROM action_plan.livrables l
LEFT JOIN action_plan.phases p ON l.phase_parent_id = p.phase_id
LEFT JOIN action_plan.taches t ON l.tache_parent_id = t.tache_id
WHERE l.project_id = $1
ORDER BY p.phase_index, t.ordre_execution;
```

## Fonctionnalités UX

### Accordéons
- Collapsible par défaut
- Animation smooth d'ouverture/fermeture
- Icônes chevron avec rotation

### Tableau Hiérarchique
- Expand/Collapse des phases avec icônes +/-
- Hover effects sur les lignes
- Modal de détails au clic sur les éléments
- Responsive design avec scroll horizontal sur mobile

### Filtres et Recherche
- Filtres par statut (À faire, En cours, Terminé)
- Filtres par priorité/criticité  
- Recherche textuelle globale
- Tri par colonnes

### Loading States
- Skeleton loading pour les accordéons
- Shimmer effect pour le tableau
- États d'erreur avec retry

## Styles CSS

### Variables de couleurs
```css
:root {
  --status-todo: #1976d2;
  --status-progress: #f57c00;
  --status-done: #388e3c;
  --priority-critical: #d32f2f;
  --priority-important: #f57c00;
  --priority-normal: #757575;
}
```

### Hiérarchie visuelle
```css
.hierarchy-level-0 {
  background-color: #f5f5f5;
  font-weight: 700;
  padding-left: 0px;
}

.hierarchy-level-1 {
  background-color: #fafafa;
  font-weight: 600;
  padding-left: 20px;
}

.hierarchy-level-2 {
  background-color: white;
  font-weight: 400;
  padding-left: 40px;
}
```

## Tests Requis

### Tests de Hook
- Test de récupération des données
- Test de gestion d'erreurs
- Test de loading states

### Tests de Composants
- Test d'affichage des accordéons
- Test de la hiérarchie du tableau
- Test des interactions (expand/collapse)
- Test responsive

### Tests d'Intégration
- Test avec données réelles du projet existant (5789c2c1-9838-4dae-8356-89c88976ad2d)
- Test des conditions d'affichage selon status_action_plan
- Test de performance avec grandes quantités de données

## Migration et Déploiement

### Ordre d'implémentation
1. Hook useActionPlanData
2. ActionPlanStatusBadge
3. ActionPlanClassification
4. ActionPlanLivrables  
5. ActionPlanHierarchy + Modal
6. Intégration dans PlanActionPage
7. Tests et optimisations

### Compatibilité
- Gestion des cas où les données sont partielles
- Fallbacks pour les champs manquants
- Validation des données JSON

Cette spécification complète permettra une implémentation structurée et maintenir la cohérence avec l'architecture existante du projet.