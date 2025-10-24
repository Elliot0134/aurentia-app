import { Check, Loader, X, Mail, Phone, Trash2, Edit, Users, Award, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { ModularTableConfig, BaseRowData } from "@/components/ui/modular-data-table";
import { Badge } from "@/components/ui/badge";

/**
 * Interface pour les données de mentor
 */
export interface MentorData extends BaseRowData {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  photoUrl?: string;
  description?: string;
  specialite: string;
  linkedin?: string;
  disponibilites?: string;
  nombreProjetsMax?: number;
  nombreProjetsActuels?: number;
  statut: "Actif" | "En attente" | "Inactif";
  nombreMentores: number;
  dateInscription: string;
  progressValue?: number;
  relatedLinks?: { label: string; href: string; target?: string }[];
  user_id?: string; // For permission checks
  is_also_staff?: boolean; // True if this mentor is also a staff member
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
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
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
      accessorKey: "nombreProjetsActuels",
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
      accessorKey: "specialite",
      header: "Spécialité",
      size: 180,
      cell: (data) => (
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-gray-400" />
          <span className="text-sm">{data.specialite}</span>
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
    {
      accessorKey: "disponibilites",
      header: "Disponibilités",
      size: 150,
      cell: (data) => (
        <span className="text-sm text-gray-600">
          {data.disponibilites || "À définir"}
        </span>
      ),
    },
    {
      accessorKey: "nombreProjetsMax",
      header: "Projets Max",
      size: 120,
      cell: (data) => (
        <span className="text-sm font-medium">
          {data.nombreProjetsMax || "N/A"} / {data.nombreProjetsActuels || 0}
        </span>
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
    // Custom rendering to add "Staff" badge for dual roles
    customRender: (data: MentorData) => {
      const defaultLabel = (
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-gray-100">
          {data.statut === "Actif" && <Check className="w-3.5 h-3.5 rounded-full bg-green-500 text-white p-0.5" />}
          {data.statut === "En attente" && <Loader className="w-3.5 h-3.5 text-gray-500" />}
          {data.statut === "Inactif" && <X className="w-3.5 h-3.5 rounded-full bg-red-500 text-white p-0.5" />}
        </div>
      );

      if (data.is_also_staff) {
        return (
          <div className="flex items-center gap-2">
            {defaultLabel}
            <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 flex items-center gap-1">
              <Briefcase className="w-3 h-3" />
              Staff
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
              <h4 className="text-sm font-semibold mb-2">Spécialité</h4>
              <p className="text-[#4B5563]">{data.specialite}</p>
            </div>
            {data.description && (
              <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
                <h4 className="text-sm font-semibold mb-2">Description</h4>
                <p className="text-[#4B5563]">{data.description}</p>
              </div>
            )}
            <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
              <h4 className="text-sm font-semibold mb-2">Disponibilités</h4>
              <p className="text-[#4B5563]">{data.disponibilites || "À définir"}</p>
            </div>
            <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
              <h4 className="text-sm font-semibold mb-2">Capacité</h4>
              <p className="text-[#4B5563]">
                {data.nombreProjetsActuels || 0} / {data.nombreProjetsMax || "Non défini"} projets
              </p>
            </div>
          </div>

          <div className="col-span-full">
            <h3 className="font-semibold text-lg mb-4">Statistiques</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-[#F9FAFB] rounded-md px-4 py-4 text-center">
                <p className="text-sm text-gray-600 mb-1">Mentorés actuels</p>
                <p className="text-2xl font-bold text-[#F86E19]">{data.nombreMentores}</p>
              </div>
              <div className="bg-[#F9FAFB] rounded-md px-4 py-4 text-center">
                <p className="text-sm text-gray-600 mb-1">Taux de réussite</p>
                <p className="text-2xl font-bold text-green-600">{data.progressValue || 0}%</p>
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
      id: "projets",
      label: "Projets",
      render: (data) => (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Projets des mentorés</h3>
            <span className="text-sm text-gray-500">{data.nombreMentores} mentoré(s)</span>
          </div>
          <div className="bg-[#F9FAFB] rounded-md px-4 py-8 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Liste des projets associés</p>
            <p className="text-sm text-gray-400 mt-1">
              Les projets des entrepreneurs mentorés apparaîtront ici.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "relationnel",
      label: "Relationnel",
      render: (data) => (
        <div className="space-y-6">
          <h3 className="font-semibold text-lg">Relations et interactions</h3>
          <div className="bg-[#F9FAFB] rounded-md px-4 py-8 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Historique des interactions</p>
            <p className="text-sm text-gray-400 mt-1">
              Messages, rendez-vous et interactions avec les mentorés.
            </p>
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
              L'historique complet des activités, événements et rendez-vous.
            </p>
          </div>
        </div>
      ),
    },
  ],

  // Message vide
  emptyMessage: "Aucun mentor trouvé.",
};
