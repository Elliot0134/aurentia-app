# ModularDataTable - Composant de Tableau Modulaire

Un composant de tableau hautement configurable et réutilisable qui reprend l'UI/UX de ComponentsTemplate avec toutes ses fonctionnalités avancées.

## 📋 Table des matières

- [Installation](#installation)
- [Utilisation basique](#utilisation-basique)
- [Configuration](#configuration)
- [Exemples](#exemples)
- [API Reference](#api-reference)

## 🚀 Installation

Le composant est déjà intégré dans le projet. Il suffit de l'importer :

```tsx
import { ModularDataTable } from "@/components/ui/modular-data-table";
import type { ModularTableConfig, BaseRowData } from "@/components/ui/modular-data-table";
```

## 💡 Utilisation basique

```tsx
import { ModularDataTable } from "@/components/ui/modular-data-table";
import { adherentsTableConfig, AdherentData } from "@/config/tables";

const MyPage = () => {
  const data: AdherentData[] = [
    {
      id: "1",
      nom: "Dupont",
      prenom: "Jean",
      email: "jean.dupont@example.com",
      telephone: "0123456789",
      statut: "Actif",
      dateInscription: "01/01/2024",
      progressValue: 75,
    },
  ];

  return (
    <ModularDataTable
      data={data}
      config={adherentsTableConfig}
      onDataChange={(newData) => console.log(newData)}
    />
  );
};
```

## ⚙️ Configuration

### Structure de base

Créez un fichier de configuration dans `/src/config/tables/` :

```tsx
import { ModularTableConfig, BaseRowData } from "@/components/ui/modular-data-table";

export interface MyData extends BaseRowData {
  id: string;
  nom: string;
  // ... autres champs
}

export const myTableConfig: ModularTableConfig<MyData> = {
  // Configuration ici
};
```

### Options de configuration

#### Colonnes (`columns`)

```tsx
columns: [
  {
    accessorKey: "nom",
    header: "Nom",
    size: 200,
    minSize: 150,
    cell: (data) => (
      <div className="font-bold">{data.nom}</div>
    ),
  },
]
```

#### Recherche (`searchable`)

```tsx
searchable: true,
searchPlaceholder: "Rechercher...",
searchKeys: ["nom"], // Clés à rechercher
```

#### Filtres (`filters`)

```tsx
filters: [
  {
    id: "statut",
    label: "Statut",
    type: "checkbox",
    options: [
      { label: "Actif", value: "Actif", icon: Check },
      { label: "Inactif", value: "Inactif", icon: X },
    ],
  },
]
```

#### Actions de ligne (`rowActions`)

```tsx
rowActions: [
  {
    label: "Modifier",
    icon: Edit,
    onClick: (data) => console.log("Edit", data),
  },
  {
    label: "Supprimer",
    icon: Trash2,
    variant: "destructive",
    onClick: (data) => console.log("Delete", data),
  },
]
```

#### Actions groupées (`bulkActions`)

```tsx
bulkActions: [
  {
    label: "Supprimer",
    icon: Trash2,
    variant: "destructive",
    confirmMessage: "Êtes-vous sûr ?",
    onClick: (selectedRows) => console.log(selectedRows),
  },
]
```

#### Modal (`modalEnabled`)

```tsx
modalEnabled: true,
modalTitle: (data) => `${data.nom} ${data.prenom}`,
modalSubtitle: (data) => data.email,
modalAvatar: (data) => ({
  text: `${data.nom[0]}${data.prenom[0]}`,
  bgColor: "bg-blue-500",
}),
modalTabs: [
  {
    id: "details",
    label: "Détails",
    render: (data) => (
      <div>
        <h3>Détails de {data.nom}</h3>
        {/* Contenu de l'onglet */}
      </div>
    ),
  },
]
```

#### Colonnes spéciales

##### Étiquettes (Labels)

```tsx
hasLabelsColumn: {
  accessorKey: "statut",
  labelConfig: {
    Actif: {
      icon: Check,
      iconBgColor: "bg-green-500",
      iconColor: "text-white",
    },
    Inactif: {
      icon: X,
      iconBgColor: "bg-red-500",
      iconColor: "text-white",
    },
  },
}
```

##### Barre de progression

```tsx
hasProgressColumn: true,
// Les données doivent contenir progressValue: number (0-100)
```

##### Liens dynamiques

```tsx
hasLinksColumn: true,
// Les données doivent contenir relatedLinks: { label: string; href: string }[]
```

##### Interrupteur (Switch)

```tsx
hasSwitchColumn: {
  header: "Actif",
  accessorKey: "isActive",
  onChange: (data, value) => {
    console.log(`${data.nom} est maintenant ${value ? "actif" : "inactif"}`);
  },
}
```

## 📚 Exemples

### Exemple 1 : Tableau d'adhérents

Voir `/src/config/tables/adherents.config.tsx` et `/src/pages/organisation/OrganisationAdherents.tsx`

### Exemple 2 : Tableau de mentors

Voir `/src/config/tables/mentors.config.tsx` et `/src/pages/organisation/OrganisationMentors.tsx`

### Exemple 3 : Tableau de projets

Voir `/src/config/tables/projets.config.tsx` et `/src/pages/organisation/OrganisationProjets.tsx`

## 🎨 Fonctionnalités UI/UX

### Drag & Drop

- ✅ Réorganisation des lignes par glisser-déposer
- ✅ Support mobile avec activation au toucher prolongé
- ✅ Indicateurs visuels pendant le déplacement

### Sélection

- ✅ Sélection multiple avec checkboxes
- ✅ Sélection de toutes les lignes
- ✅ Actions groupées sur les lignes sélectionnées

### Pagination

- ✅ Navigation par pages
- ✅ Sélection du nombre de lignes par page
- ✅ Boutons première/dernière page

### Filtres

- ✅ Filtres par étiquettes
- ✅ Filtres personnalisés (checkbox, select, etc.)
- ✅ Recherche textuelle

### Modal

- ✅ Modal avec onglets
- ✅ Avatar personnalisable
- ✅ Animations fluides
- ✅ Support mobile

### Responsive

- ✅ Layout adaptatif desktop/mobile
- ✅ Clic sur ligne mobile pour ouvrir le modal
- ✅ Boutons et contrôles optimisés mobile

## 🔧 API Reference

### Props du composant

| Prop | Type | Description |
|------|------|-------------|
| `data` | `TData[]` | Données du tableau |
| `config` | `ModularTableConfig<TData>` | Configuration du tableau |
| `onDataChange` | `(newData: TData[]) => void` | Callback appelé quand les données changent (réorganisation, etc.) |

### Type `ModularTableConfig<TData>`

Voir le fichier `/src/components/ui/modular-data-table/types.ts` pour la définition complète.

## 🎯 Bonnes pratiques

1. **Créez un fichier de configuration séparé** pour chaque type de tableau dans `/src/config/tables/`
2. **Définissez une interface TypeScript** pour vos données qui étend `BaseRowData`
3. **Utilisez des callbacks** pour gérer les actions (modification, suppression, etc.)
4. **Personnalisez les rendus de cellules** pour afficher vos données de manière optimale
5. **Testez sur mobile** pour vous assurer que l'expérience tactile est bonne

## 🐛 Résolution de problèmes

### Le drag & drop ne fonctionne pas

- Vérifiez que `draggable !== false` dans votre config
- Assurez-vous que chaque item a un `id` unique

### Les filtres ne fonctionnent pas

- Vérifiez que le `id` du filtre correspond à `accessorKey` de la colonne
- Assurez-vous que `filterFn` est correctement défini si nécessaire

### Le modal ne s'affiche pas

- Vérifiez que `modalEnabled: true`
- Assurez-vous d'avoir défini au moins un onglet dans `modalTabs`

## 📝 Notes

- Le composant utilise `@dnd-kit` pour le drag & drop
- Le composant utilise `@tanstack/react-table` pour la gestion du tableau
- Toutes les icônes proviennent de `lucide-react`
- Le composant est entièrement typé avec TypeScript
