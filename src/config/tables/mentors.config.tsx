import { Check, Loader, X, Mail, Phone, Trash2, Edit, Users, Award } from "lucide-react";
import { toast } from "sonner";
import { ModularTableConfig, BaseRowData } from "@/components/ui/modular-data-table";

/**
 * Interface pour les données de mentor
 */
export interface MentorData extends BaseRowData {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  specialite: string;
  statut: "Actif" | "En attente" | "Inactif";
  nombreMentores: number;
  dateInscription: string;
  progressValue?: number;
  relatedLinks?: { label: string; href: string; target?: string }[];
}

/**
 * Configuration du tableau pour la page des mentors
 */
export const mentorsTableConfig: ModularTableConfig<MentorData> = {
  // Titre
  title: "Liste des mentors",

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
      accessorKey: "specialite",
      header: "Spécialité",
      size: 200,
      cell: (data) => (
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-gray-400" />
          <span className="text-sm">{data.specialite}</span>
        </div>
      ),
    },
    {
      accessorKey: "nombreMentores",
      header: "Mentorés",
      size: 120,
      cell: (data) => (
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-semibold">{data.nombreMentores}</span>
        </div>
      ),
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
  ],

  // Recherche
  searchable: true,
  searchPlaceholder: "Rechercher un mentor...",
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

  // Actions de ligne
  rowActions: [
    {
      label: "Modifier",
      icon: Edit,
      onClick: (data) => {
        toast.info(`Modification de ${data.nom} ${data.prenom}`);
      },
    },
    {
      label: "Voir les mentorés",
      icon: Users,
      onClick: (data) => {
        toast.info(`Affichage des mentorés de ${data.nom} ${data.prenom}`);
      },
    },
    {
      label: "Supprimer",
      icon: Trash2,
      variant: "destructive",
      onClick: (data) => {
        toast.success(`${data.nom} ${data.prenom} supprimé`);
      },
    },
  ],

  // Actions groupées
  bulkActions: [
    {
      label: "Supprimer",
      icon: Trash2,
      variant: "destructive",
      confirmMessage: "Êtes-vous sûr de vouloir supprimer ces mentors ? Cette action est irréversible.",
      onClick: (selectedRows) => {
        toast.success(`${selectedRows.length} mentor(s) supprimé(s)`);
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
  modalTitle: (data) => `${data.nom} ${data.prenom}`,
  modalSubtitle: (data) => data.specialite,
  modalAvatar: (data) => ({
    text: `${data.nom[0]}${data.prenom[0]}`,
    bgColor: "bg-blue-500",
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
              <h4 className="text-sm font-semibold mb-2">Spécialité</h4>
              <p className="text-[#4B5563]">{data.specialite}</p>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-500" />
              <span>{data.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-500" />
              <span>{data.telephone || "Non renseigné"}</span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Statistiques</h3>
            <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
              <h4 className="text-sm font-semibold mb-2">Nombre de mentorés</h4>
              <p className="text-2xl font-bold text-[#F86E19]">{data.nombreMentores}</p>
            </div>
            <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
              <h4 className="text-sm font-semibold mb-2">Statut</h4>
              <p className="text-[#4B5563]">{data.statut}</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "mentores",
      label: "Mentorés",
      render: (data) => (
        <div className="space-y-6">
          <h3 className="font-semibold text-lg">Liste des mentorés</h3>
          <div className="bg-[#F9FAFB] rounded-md px-4 py-8 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">{data.nombreMentores} mentoré(s)</p>
            <p className="text-sm text-gray-400 mt-1">
              La liste détaillée apparaîtra ici.
            </p>
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
            <p className="text-gray-500">Aucune activité récente</p>
          </div>
        </div>
      ),
    },
  ],

  // Message vide
  emptyMessage: "Aucun mentor trouvé.",
};
