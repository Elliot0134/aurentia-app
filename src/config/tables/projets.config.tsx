import { Check, Loader, X, Trash2, Edit, Calendar, FolderOpen, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { ModularTableConfig, BaseRowData } from "@/components/ui/modular-data-table";

/**
 * Interface pour les données de projet
 */
export interface ProjetData extends BaseRowData {
  id: string;
  titre: string;
  porteur: string;
  categorie: string;
  statut: "En cours" | "En attente" | "Terminé";
  dateCreation: string;
  dateEcheance: string;
  progressValue?: number;
  relatedLinks?: { label: string; href: string; target?: string }[];
}

/**
 * Configuration du tableau pour la page des projets
 */
export const projetsTableConfig: ModularTableConfig<ProjetData> = {
  // Titre
  title: "Liste des projets",

  // Colonnes principales
  columns: [
    {
      accessorKey: "titre",
      header: "Titre du projet",
      size: 300,
      minSize: 200,
      cell: (data) => (
        <div className="flex items-center gap-2">
          <FolderOpen className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium">{data.titre}</span>
        </div>
      ),
    },
    {
      accessorKey: "porteur",
      header: "Porteur de projet",
      size: 200,
    },
    {
      accessorKey: "categorie",
      header: "Catégorie",
      size: 150,
      cell: (data) => (
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-gray-400" />
          <span className="text-sm">{data.categorie}</span>
        </div>
      ),
    },
    {
      accessorKey: "dateCreation",
      header: "Date de création",
      size: 150,
      cell: (data) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-sm">{data.dateCreation}</span>
        </div>
      ),
    },
    {
      accessorKey: "dateEcheance",
      header: "Échéance",
      size: 150,
      cell: (data) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-sm">{data.dateEcheance}</span>
        </div>
      ),
    },
  ],

  // Recherche
  searchable: true,
  searchPlaceholder: "Rechercher un projet...",
  searchKeys: ["titre"],

  // Filtres
  filters: [
    {
      id: "statut",
      label: "Statut",
      type: "checkbox",
      options: [
        { label: "En cours", value: "En cours", icon: Loader },
        { label: "En attente", value: "En attente", icon: X },
        { label: "Terminé", value: "Terminé", icon: Check },
      ],
    },
    {
      id: "categorie",
      label: "Catégorie",
      type: "checkbox",
      options: [
        { label: "Tech", value: "Tech" },
        { label: "Marketing", value: "Marketing" },
        { label: "Finance", value: "Finance" },
        { label: "Design", value: "Design" },
      ],
    },
  ],

  // Colonne des étiquettes
  hasLabelsColumn: {
    accessorKey: "statut",
    labelConfig: {
      "En cours": {
        icon: Loader,
        iconBgColor: "bg-blue-500",
        iconColor: "text-white",
      },
      "En attente": {
        icon: X,
        iconBgColor: "bg-orange-500",
        iconColor: "text-white",
      },
      Terminé: {
        icon: Check,
        iconBgColor: "bg-green-500",
        iconColor: "text-white",
      },
    },
  },

  // Colonne de progression
  hasProgressColumn: true,

  // Colonne des liens
  hasLinksColumn: true,

  // Actions de ligne
  rowActions: [
    {
      label: "Modifier",
      icon: Edit,
      onClick: (data) => {
        toast.info(`Modification du projet ${data.titre}`);
      },
    },
    {
      label: "Voir les détails",
      icon: FolderOpen,
      onClick: (data) => {
        toast.info(`Affichage des détails de ${data.titre}`);
      },
    },
    {
      label: "Supprimer",
      icon: Trash2,
      variant: "destructive",
      onClick: (data) => {
        toast.success(`Projet ${data.titre} supprimé`);
      },
    },
  ],

  // Actions groupées
  bulkActions: [
    {
      label: "Archiver",
      icon: FolderOpen,
      onClick: (selectedRows) => {
        toast.success(`${selectedRows.length} projet(s) archivé(s)`);
      },
    },
    {
      label: "Supprimer",
      icon: Trash2,
      variant: "destructive",
      confirmMessage: "Êtes-vous sûr de vouloir supprimer ces projets ? Cette action est irréversible.",
      onClick: (selectedRows) => {
        toast.success(`${selectedRows.length} projet(s) supprimé(s)`);
      },
    },
  ],

  // Drag & Drop
  draggable: true,
  onReorder: (newData) => {
    console.log("Nouvel ordre:", newData);
  },

  // Sélection
  selectable: true,

  // Pagination
  pageSizes: [10, 20, 30, 50],
  defaultPageSize: 10,

  // Modal
  modalEnabled: true,
  modalTitle: (data) => data.titre,
  modalSubtitle: (data) => `Porté par ${data.porteur}`,
  modalAvatar: (data) => ({
    text: data.titre.substring(0, 2).toUpperCase(),
    bgColor: "bg-purple-500",
  }),
  modalTabs: [
    {
      id: "details",
      label: "Détails",
      render: (data) => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Informations du projet</h3>
            <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
              <h4 className="text-sm font-semibold mb-2">Titre</h4>
              <p className="text-[#4B5563]">{data.titre}</p>
            </div>
            <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
              <h4 className="text-sm font-semibold mb-2">Porteur</h4>
              <p className="text-[#4B5563]">{data.porteur}</p>
            </div>
            <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
              <h4 className="text-sm font-semibold mb-2">Catégorie</h4>
              <p className="text-[#4B5563]">{data.categorie}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Planning</h3>
            <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
              <h4 className="text-sm font-semibold mb-2">Date de création</h4>
              <p className="text-[#4B5563]">{data.dateCreation}</p>
            </div>
            <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
              <h4 className="text-sm font-semibold mb-2">Échéance</h4>
              <p className="text-[#4B5563]">{data.dateEcheance}</p>
            </div>
            <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
              <h4 className="text-sm font-semibold mb-2">Statut</h4>
              <p className="text-2xl font-bold text-[#F86E19]">{data.statut}</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "tasks",
      label: "Tâches",
      render: (data) => (
        <div className="space-y-6">
          <h3 className="font-semibold text-lg">Tâches du projet</h3>
          <div className="bg-[#F9FAFB] rounded-md px-4 py-8 text-center">
            <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucune tâche</p>
            <p className="text-sm text-gray-400 mt-1">Les tâches du projet apparaîtront ici.</p>
          </div>
        </div>
      ),
    },
    {
      id: "team",
      label: "Équipe",
      render: (data) => (
        <div className="space-y-6">
          <h3 className="font-semibold text-lg">Membres de l'équipe</h3>
          <div className="bg-[#F9FAFB] rounded-md px-4 py-8 text-center">
            <p className="text-gray-500">Aucun membre assigné</p>
          </div>
        </div>
      ),
    },
  ],

  // Message vide
  emptyMessage: "Aucun projet trouvé.",
};
