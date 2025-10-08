import { Check, Loader, X, Mail, Phone, Trash2, Edit, UserCheck, Bell } from "lucide-react";
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
  photoUrl?: string;
  projetsAssocies?: string[]; // Array of project names
  linkedin?: string;
  siteWeb?: string;
  creditsRestants?: number;
  mentorsAssocies?: string[]; // Array of mentor names
  cotisationPayee?: boolean;
  joursRetard?: number;
  formationChoisie?: string;
  promotion?: number;
  budgetFormation?: number;
  disponibilites?: string;
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
            <div className="w-10 h-10 rounded-full bg-aurentia-pink flex items-center justify-center text-white font-semibold">
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
      accessorKey: "projetsAssocies",
      header: "Projets",
      size: 200,
      cell: (data) => (
        <div className="text-sm">
          {data.projetsAssocies && data.projetsAssocies.length > 0 ? (
            <span className="text-gray-700">
              {data.projetsAssocies.slice(0, 2).join(', ')}
              {data.projetsAssocies.length > 2 && ` +${data.projetsAssocies.length - 2}`}
            </span>
          ) : (
            <span className="text-gray-400">Aucun projet</span>
          )}
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
          <span className="text-sm">{data.telephone || "Non renseigné"}</span>
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
      accessorKey: "siteWeb",
      header: "Site Web",
      size: 120,
      cell: (data) => (
        data.siteWeb ? (
          <a 
            href={data.siteWeb} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline text-sm"
          >
            Visiter
          </a>
        ) : (
          <span className="text-gray-400 text-sm">N/A</span>
        )
      ),
    },
    {
      accessorKey: "creditsRestants",
      header: "Crédits",
      size: 100,
      cell: (data) => (
        <span className={`text-sm font-semibold ${
          (data.creditsRestants || 0) > 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {data.creditsRestants !== undefined ? data.creditsRestants : 'N/A'}
        </span>
      ),
    },
    {
      accessorKey: "mentorsAssocies",
      header: "Mentors",
      size: 150,
      cell: (data) => (
        <div className="text-sm">
          {data.mentorsAssocies && data.mentorsAssocies.length > 0 ? (
            <span className="text-gray-700">{data.mentorsAssocies.join(', ')}</span>
          ) : (
            <span className="text-gray-400">Aucun mentor</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "cotisationPayee",
      header: "Cotisation",
      size: 150,
      cell: (data) => (
        <div className="flex items-center gap-2">
          {data.cotisationPayee ? (
            <>
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-600">À jour</span>
            </>
          ) : (
            <>
              <X className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-600">
                En retard {data.joursRetard ? `(${data.joursRetard}j)` : ''}
              </span>
            </>
          )}
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
      label: "Relancer Cotisation",
      icon: Bell,
      variant: "default",
      onClick: (data) => {
        if (!data.cotisationPayee) {
          toast.success(`Relance envoyée à ${data.nom} ${data.prenom}`);
          // TODO: Implement email reminder API call
        } else {
          toast.info(`${data.nom} ${data.prenom} est déjà à jour`);
        }
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
            {data.siteWeb && (
              <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
                <h4 className="text-sm font-semibold mb-2">Site Web</h4>
                <a 
                  href={data.siteWeb} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {data.siteWeb}
                </a>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Informations académiques</h3>
            {data.formationChoisie && (
              <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
                <h4 className="text-sm font-semibold mb-2">Formation</h4>
                <p className="text-[#4B5563]">{data.formationChoisie}</p>
              </div>
            )}
            {data.promotion && (
              <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
                <h4 className="text-sm font-semibold mb-2">Promotion</h4>
                <p className="text-[#4B5563]">{data.promotion}</p>
              </div>
            )}
            {data.budgetFormation !== undefined && (
              <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
                <h4 className="text-sm font-semibold mb-2">Budget Formation</h4>
                <p className="text-[#4B5563]">{data.budgetFormation} €</p>
              </div>
            )}
            {data.disponibilites && (
              <div className="bg-[#F9FAFB] rounded-md px-4 pb-4 pt-4">
                <h4 className="text-sm font-semibold mb-2">Disponibilités</h4>
                <p className="text-[#4B5563]">{data.disponibilites}</p>
              </div>
            )}
          </div>

          <div className="col-span-full">
            <h3 className="font-semibold text-lg mb-4">Suivi et finances</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-[#F9FAFB] rounded-md px-4 py-4 text-center">
                <p className="text-sm text-gray-600 mb-1">Crédits restants</p>
                <p className={`text-2xl font-bold ${
                  (data.creditsRestants || 0) > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {data.creditsRestants !== undefined ? data.creditsRestants : 'N/A'}
                </p>
              </div>
              <div className="bg-[#F9FAFB] rounded-md px-4 py-4 text-center">
                <p className="text-sm text-gray-600 mb-1">Cotisation</p>
                <p className={`text-lg font-semibold ${
                  data.cotisationPayee ? 'text-green-600' : 'text-red-600'
                }`}>
                  {data.cotisationPayee ? 'À jour' : `Retard ${data.joursRetard || 0}j`}
                </p>
              </div>
              <div className="bg-[#F9FAFB] rounded-md px-4 py-4 text-center">
                <p className="text-sm text-gray-600 mb-1">Statut</p>
                <p className="text-lg font-semibold text-[#4B5563]">{data.statut}</p>
              </div>
            </div>
          </div>

          {data.mentorsAssocies && data.mentorsAssocies.length > 0 && (
            <div className="col-span-full">
              <h3 className="font-semibold text-lg mb-4">Mentors associés</h3>
              <div className="bg-[#F9FAFB] rounded-md px-4 py-4">
                <p className="text-[#4B5563]">{data.mentorsAssocies.join(', ')}</p>
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      id: "projets",
      label: "Projets",
      render: (data) => (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Projets associés</h3>
            <span className="text-sm text-gray-500">
              {data.projetsAssocies?.length || 0} projet(s)
            </span>
          </div>
          {data.projetsAssocies && data.projetsAssocies.length > 0 ? (
            <div className="space-y-3">
              {data.projetsAssocies.map((projet, index) => (
                <div key={index} className="bg-[#F9FAFB] rounded-md px-4 py-4">
                  <h4 className="font-semibold mb-2">{projet}</h4>
                  <p className="text-sm text-gray-600">
                    Cliquez pour voir les détails du projet
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#F9FAFB] rounded-md px-4 py-8 text-center">
              <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucun projet associé</p>
              <p className="text-sm text-gray-400 mt-1">
                Les projets de cet adhérent apparaîtront ici.
              </p>
            </div>
          )}
        </div>
      ),
    },
    {
      id: "relationnel",
      label: "Relationnel",
      render: (data) => (
        <div className="space-y-6">
          <h3 className="font-semibold text-lg">Relations et réseau</h3>
          
          {data.mentorsAssocies && data.mentorsAssocies.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3">Mentors</h4>
              <div className="bg-[#F9FAFB] rounded-md px-4 py-4">
                <p className="text-[#4B5563]">{data.mentorsAssocies.join(', ')}</p>
              </div>
            </div>
          )}

          <div className="bg-[#F9FAFB] rounded-md px-4 py-8 text-center">
            <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Réseau et interactions</p>
            <p className="text-sm text-gray-400 mt-1">
              Les connections et interactions apparaîtront ici.
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
            <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Journal d'activité</p>
            <p className="text-sm text-gray-400 mt-1">
              Conversations, événements participés et toute l'activité apparaîtra ici.
            </p>
          </div>
        </div>
      ),
    },
  ],

  // Message vide
  emptyMessage: "Aucun adhérent trouvé.",
};
