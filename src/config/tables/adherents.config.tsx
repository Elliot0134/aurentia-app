import { Check, Loader, X, Mail, Phone, Trash2, Edit, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { ModularTableConfig, BaseRowData } from "@/components/ui/modular-data-table";

/**
 * Interface pour les données d'adhérent
 */
export interface AdherentData extends BaseRowData {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  statut: "Actif" | "En attente" | "Inactif";
  dateInscription: string;
  progressValue?: number;
  relatedLinks?: { label: string; href: string; target?: string }[];
  isLuthaneActive?: boolean;
}

/**
 * Configuration du tableau pour la page des adhérents
 */
export const adherentsTableConfig: ModularTableConfig<AdherentData> = {
  // Titre
  title: "Liste des adhérents",

  // Colonnes principales
  columns: [
    {
      accessorKey: "nom",
      header: "Nom",
      size: 200,
      minSize: 150,
    },
    {
      accessorKey: "prenom",
      header: "Prénom",
      size: 200,
    },
    {
      accessorKey: "email",
      header: "Email",
      size: 250,
      cell: (data) => (
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-gray-400" />
          <span className="text-sm">{data.email}</span>
        </div>
      ),
    },
    {
      accessorKey: "telephone",
      header: "Téléphone",
      size: 150,
      cell: (data) => (
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-gray-400" />
          <span className="text-sm">{data.telephone}</span>
        </div>
      ),
    },
    {
      accessorKey: "dateInscription",
      header: "Date d'inscription",
      size: 150,
    },
  ],

  // Recherche
  searchable: true,
  searchPlaceholder: "Rechercher un adhérent...",
  searchKeys: ["nom"],

  // Filtres
  filters: [
    {
      id: "statut",
      label: "Statut",
      type: "checkbox",
      options: [
        { label: "Actif", value: "Actif", icon: Check },
        { label: "En attente", value: "En attente", icon: Loader },
        { label: "Inactif", value: "Inactif", icon: X },
      ],
    },
  ],

  // Colonne des étiquettes
  hasLabelsColumn: {
    accessorKey: "statut",
    labelConfig: {
      Actif: {
        icon: Check,
        iconBgColor: "bg-green-500",
        iconColor: "text-white",
      },
      "En attente": {
        icon: Loader,
        iconBgColor: "bg-transparent",
        iconColor: "text-gray-500",
      },
      Inactif: {
        icon: X,
        iconBgColor: "bg-red-500",
        iconColor: "text-white",
      },
    },
  },

  // Colonne de progression
  hasProgressColumn: true,

  // Colonne des liens
  hasLinksColumn: true,

  // Colonne Switch (Luthane)
  hasSwitchColumn: {
    header: "Luthane",
    accessorKey: "isLuthaneActive",
    onChange: (data, value) => {
      toast.success(`Luthane pour ${data.nom} ${data.prenom} ${value ? "activé" : "désactivé"}`);
      // Ici, vous pouvez ajouter un appel API pour mettre à jour l'état
    },
  },

  // Actions de ligne
  rowActions: [
    {
      label: "Modifier",
      icon: Edit,
      onClick: (data) => {
        toast.info(`Modification de ${data.nom} ${data.prenom}`);
        // Navigation vers la page de modification
      },
    },
    {
      label: "Supprimer",
      icon: Trash2,
      variant: "destructive",
      onClick: (data) => {
        toast.success(`${data.nom} ${data.prenom} supprimé`);
        // Appel API pour supprimer
      },
    },
  ],

  // Actions groupées
  bulkActions: [
    {
      label: "Supprimer",
      icon: Trash2,
      variant: "destructive",
      confirmMessage: "Êtes-vous sûr de vouloir supprimer ces adhérents ? Cette action est irréversible.",
      onClick: (selectedRows) => {
        toast.success(`${selectedRows.length} adhérent(s) supprimé(s)`);
        // Appel API pour supprimer en masse
      },
    },
  ],

  // Drag & Drop
  draggable: true,
  onReorder: (newData) => {
    console.log("Nouvel ordre:", newData);
    // Appel API pour sauvegarder l'ordre
  },

  // Sélection
  selectable: true,

  // Pagination
  pageSizes: [10, 20, 30, 50],
  defaultPageSize: 10,

  // Modal
  modalEnabled: true,
  modalTitle: (data) => `${data.nom} ${data.prenom}`,
  modalSubtitle: (data) => data.email,
  modalAvatar: (data) => ({
    text: `${data.nom[0]}${data.prenom[0]}`,
    bgColor: "bg-aurentia-pink",
  }),
  modalTabs: [
    {
      id: "details",
      label: "Détails",
      render: (data) => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Informations personnelles</h3>
            <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
              <h4 className="text-sm font-semibold mb-2">Nom complet</h4>
              <p className="text-[#4B5563]">
                {data.nom} {data.prenom}
              </p>
            </div>
            <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
              <h4 className="text-sm font-semibold mb-2">Email</h4>
              <p className="text-[#4B5563]">{data.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-500" />
              <span>{data.telephone || "Non renseigné"}</span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Statut et progression</h3>
            <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
              <h4 className="text-sm font-semibold mb-2">Statut</h4>
              <p className="text-2xl font-bold text-[#F86E19]">{data.statut}</p>
            </div>
            <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
              <h4 className="text-sm font-semibold mb-2">Date d'inscription</h4>
              <p className="text-[#4B5563]">{data.dateInscription}</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "activity",
      label: "Activité",
      render: (data) => (
        <div className="space-y-6">
          <h3 className="font-semibold text-lg">Activité récente</h3>
          <div className="bg-[#F9FAFB] rounded-md px-4 py-8 text-center">
            <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucune activité récente</p>
            <p className="text-sm text-gray-400 mt-1">
              L'historique des activités de cet adhérent apparaîtra ici.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "documents",
      label: "Documents",
      render: (data) => (
        <div className="space-y-6">
          <h3 className="font-semibold text-lg">Documents</h3>
          <div className="bg-[#F9FAFB] rounded-md px-4 py-8 text-center">
            <p className="text-gray-500">Aucun document</p>
          </div>
        </div>
      ),
    },
  ],

  // Message vide
  emptyMessage: "Aucun adhérent trouvé.",
};
