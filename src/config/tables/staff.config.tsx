import { Check, Loader, X, Mail, Phone, Trash2, Edit, Users, Briefcase, Shield } from "lucide-react";
import { toast } from "sonner";
import { ModularTableConfig, BaseRowData } from "@/components/ui/modular-data-table";
import { Badge } from "@/components/ui/badge";

/**
 * Interface pour les données de staff
 */
export interface StaffData extends BaseRowData {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  photoUrl?: string;
  description?: string;
  jobRole: string;
  manager?: string;
  linkedin?: string;
  statut: "Actif" | "En attente" | "Inactif";
  dateInscription: string;
  is_also_mentor?: boolean;
  progressValue?: number;
  relatedLinks?: { label: string; href: string; target?: string }[];
  user_id?: string; // For permission checks
}

/**
 * Configuration du tableau pour la page des staff
 */
export const staffTableConfig: ModularTableConfig<StaffData> = {
  // Titre
  title: "Liste du staff",

  // Colonnes principales
  columns: [
    {
      accessorKey: "photoUrl",
      header: "Photo",
      size: 80,
      cell: (data) => (
        <div className="flex items-center justify-center">
          {data.photoUrl ? (
            <img
              src={data.photoUrl}
              alt={`${data.prenom} ${data.nom}`}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-aurentia-orange flex items-center justify-center text-white font-semibold">
              {data.prenom?.[0]}{data.nom?.[0]}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "nom",
      header: "Nom",
      size: 150,
      minSize: 120,
    },
    {
      accessorKey: "prenom",
      header: "Prénom",
      size: 150,
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
          <span className="text-sm">{data.telephone || "Non renseigné"}</span>
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      size: 200,
      cell: (data) => (
        <span className="text-sm text-gray-600 line-clamp-2">
          {data.description || "Aucune description"}
        </span>
      ),
    },
    {
      accessorKey: "jobRole",
      header: "Rôle",
      size: 150,
      cell: (data) => (
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-gray-400" />
          <span className="text-sm">{data.jobRole}</span>
        </div>
      ),
    },
    {
      accessorKey: "manager",
      header: "Manager",
      size: 150,
      cell: (data) => (
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="text-sm">{data.manager || "Aucun"}</span>
        </div>
      ),
    },
    {
      accessorKey: "linkedin",
      header: "LinkedIn",
      size: 120,
      cell: (data) => (
        data.linkedin ? (
          <a
            href={data.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline text-sm"
          >
            Profil
          </a>
        ) : (
          <span className="text-gray-400 text-sm">N/A</span>
        )
      ),
    },
  ],

  // Recherche
  searchable: true,
  searchPlaceholder: "Rechercher un membre du staff...",
  searchKeys: ["nom", "prenom", "jobRole"],

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
    // Custom rendering to add "Mentor" badge for dual roles
    customRender: (data: StaffData) => {
      const defaultLabel = (
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-gray-100">
          {data.statut === "Actif" && <Check className="w-3.5 h-3.5 rounded-full bg-green-500 text-white p-0.5" />}
          {data.statut === "En attente" && <Loader className="w-3.5 h-3.5 text-gray-500" />}
          {data.statut === "Inactif" && <X className="w-3.5 h-3.5 rounded-full bg-red-500 text-white p-0.5" />}
        </div>
      );

      if (data.is_also_mentor) {
        return (
          <div className="flex items-center gap-2">
            {defaultLabel}
            <Badge variant="outline" className="bg-aurentia-orange/10 text-aurentia-orange border-aurentia-orange/30 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Mentor
            </Badge>
          </div>
        );
      }

      return defaultLabel;
    }
  },

  // Colonne de progression
  hasProgressColumn: false,

  // Colonne des liens
  hasLinksColumn: false,

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
      confirmMessage: "Êtes-vous sûr de vouloir supprimer ces membres du staff ? Cette action est irréversible.",
      onClick: (selectedRows) => {
        toast.success(`${selectedRows.length} membre(s) du staff supprimé(s)`);
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
  modalSubtitle: (data) => data.jobRole,
  modalAvatar: (data) => ({
    text: `${data.nom[0]}${data.prenom[0]}`,
    bgColor: "bg-aurentia-orange",
  }),
  modalTabs: [
    {
      id: "resume",
      label: "Résumé des informations",
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
            <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
              <h4 className="text-sm font-semibold mb-2">Téléphone</h4>
              <p className="text-[#4B5563]">{data.telephone || "Non renseigné"}</p>
            </div>
            {data.linkedin && (
              <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
                <h4 className="text-sm font-semibold mb-2">LinkedIn</h4>
                <a
                  href={data.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {data.linkedin}
                </a>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Informations professionnelles</h3>
            <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
              <h4 className="text-sm font-semibold mb-2">Rôle</h4>
              <p className="text-[#4B5563]">{data.jobRole}</p>
            </div>
            <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
              <h4 className="text-sm font-semibold mb-2">Manager</h4>
              <p className="text-[#4B5563]">{data.manager || "Aucun"}</p>
            </div>
            {data.description && (
              <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
                <h4 className="text-sm font-semibold mb-2">Description</h4>
                <p className="text-[#4B5563]">{data.description}</p>
              </div>
            )}
            {data.is_also_mentor && (
              <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-aurentia-orange" />
                  Rôles additionnels
                </h4>
                <Badge variant="outline" className="bg-aurentia-orange/10 text-aurentia-orange border-aurentia-orange/30">
                  Mentor
                </Badge>
              </div>
            )}
          </div>

          <div className="col-span-full">
            <h3 className="font-semibold text-lg mb-4">Informations générales</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#F9FAFB] rounded-md px-4 py-4 text-center">
                <p className="text-sm text-gray-600 mb-1">Date d'inscription</p>
                <p className="text-lg font-semibold text-[#F86E19]">{data.dateInscription}</p>
              </div>
              <div className="bg-[#F9FAFB] rounded-md px-4 py-4 text-center">
                <p className="text-sm text-gray-600 mb-1">Statut</p>
                <p className="text-lg font-semibold text-[#4B5563]">{data.statut}</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "historique",
      label: "Historique",
      render: (data) => (
        <div className="space-y-6">
          <h3 className="font-semibold text-lg">Historique d'activité</h3>
          <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4 mb-4">
            <h4 className="text-sm font-semibold mb-2">Date d'inscription</h4>
            <p className="text-[#4B5563]">{data.dateInscription}</p>
          </div>
          <div className="bg-[#F9FAFB] rounded-md px-4 py-8 text-center">
            <p className="text-gray-500">Journal d'activité</p>
            <p className="text-sm text-gray-400 mt-1">
              L'historique complet des activités et actions du staff.
            </p>
          </div>
        </div>
      ),
    },
  ],

  // Message vide
  emptyMessage: "Aucun membre du staff trouvé.",
};
