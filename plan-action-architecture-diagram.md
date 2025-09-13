# Architecture du Plan d'Action - Diagrammes

## Diagramme d'Architecture des Composants

```mermaid
graph TD
    A[PlanActionPage.tsx] --> B{status_action_plan === 'Terminé'?}
    B -->|Oui| C[useActionPlanData Hook]
    B -->|Non| D[Affichage état actuel]
    
    C --> E[Supabase Queries]
    E --> F[action_plan.user_responses]
    E --> G[action_plan.classification_projet]
    E --> H[action_plan.phases]
    E --> I[action_plan.jalons]
    E --> J[action_plan.taches]
    E --> K[action_plan.livrables]
    
    C --> L[ActionPlanClassification]
    C --> M[ActionPlanLivrables]
    C --> N[ActionPlanHierarchy]
    
    L --> O[Classification Cards]
    L --> P[User Responses Cards]
    
    M --> Q[Livrables List]
    Q --> R[ActionPlanStatusBadge]
    
    N --> S[Hierarchical Table]
    S --> T[Phase Rows - Level 0]
    S --> U[Jalon Rows - Level 1]
    S --> V[Tache Rows - Level 2]
    
    T --> W[ActionPlanModal]
    U --> W
    V --> W
    
    W --> X[Phase Details]
    W --> Y[Jalon Details]
    W --> Z[Tache Details]
```

## Flux de Données

```mermaid
sequenceDiagram
    participant Page as PlanActionPage
    participant Hook as useActionPlanData
    participant DB as Supabase
    participant Comp as Components
    
    Page->>Hook: projectId, status === 'Terminé'
    Hook->>DB: Query user_responses & classification_projet
    Hook->>DB: Query hierarchical data (phases/jalons/taches)
    Hook->>DB: Query livrables with joins
    
    DB-->>Hook: Raw data
    Hook-->>Hook: Transform & structure data
    Hook-->>Page: ActionPlanData object
    
    Page->>Comp: Pass structured data
    Comp-->>Page: Rendered UI components
```

## Structure Hiérarchique des Données

```mermaid
graph LR
    A[Project] --> B[Phase 1]
    A --> C[Phase 2]
    A --> D[Phase N]
    
    B --> E[Jalon 1.1]
    B --> F[Jalon 1.2]
    C --> G[Jalon 2.1]
    
    E --> H[Tâche 1.1.1]
    E --> I[Tâche 1.1.2]
    F --> J[Tâche 1.2.1]
    G --> K[Tâche 2.1.1]
    
    H --> L[Livrable 1.1.1.1]
    I --> M[Livrable 1.1.2.1]
    J --> N[Livrable 1.2.1.1]
```

## États d'Affichage selon Status

```mermaid
flowchart TD
    A[PlanActionPage Load] --> B{Vérifier status_action_plan}
    
    B -->|null| C[Afficher bouton 'Générer plan']
    B -->|'En cours'| D[Afficher spinner de génération]
    B -->|'Terminé'| E[Afficher plan d'action complet]
    
    E --> F[ActionPlanClassification]
    E --> G[ActionPlanLivrables] 
    E --> H[ActionPlanHierarchy]
    
    F --> I[4 blocs contexte projet]
    G --> J[Liste des livrables]
    H --> K[Tableau hiérarchique]
    
    K --> L[Phases - Niveau 0]
    K --> M[Jalons - Niveau 1]
    K --> N[Tâches - Niveau 2]
```

## Mapping des Données SQL vers Interface

```mermaid
graph TD
    A[SQL Queries] --> B[Raw Database Data]
    B --> C[Hook Processing]
    
    C --> D[ActionPlanData Interface]
    D --> E[userResponses: UserResponses]
    D --> F[classificationProjet: ClassificationProjet]
    D --> G[hierarchicalData: HierarchicalElement]
    D --> H[livrables: Livrable]
    
    E --> I[4 blocs dans Classification]
    F --> I
    G --> J[Tableau hiérarchique]
    H --> K[Accordéon livrables]
    
    J --> L[Phase display - Level 0]
    J --> M[Jalon display - Level 1]  
    J --> N[Tâche display - Level 2]
```

## Interactions Utilisateur

```mermaid
stateDiagram-v2
    [*] --> PageLoaded
    PageLoaded --> CheckingStatus
    
    CheckingStatus --> ShowGenerator: status = null
    CheckingStatus --> ShowProgress: status = "En cours"
    CheckingStatus --> ShowPlan: status = "Terminé"
    
    ShowPlan --> ClassificationExpanded: Click accordion
    ShowPlan --> LivrablesExpanded: Click accordion
    ShowPlan --> HierarchyExpanded: Click phase
    
    ClassificationExpanded --> ClassificationCollapsed: Click again
    LivrablesExpanded --> LivrablesCollapsed: Click again
    HierarchyExpanded --> HierarchyCollapsed: Click again
    
    HierarchyExpanded --> ModalOpen: Click element
    ModalOpen --> HierarchyExpanded: Close modal
```

Cette architecture modulaire et hiérarchique permet une implémentation progressive et maintient la séparation des responsabilités tout en offrant une expérience utilisateur fluide et intuitive.