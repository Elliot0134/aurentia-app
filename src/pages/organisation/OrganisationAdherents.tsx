import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { useAdherents } from '@/hooks/useOrganisationData';
import { ModularDataTable } from "@/components/ui/modular-data-table";
import { adherentsTableConfig, AdherentData } from "@/config/tables";
import { Adherent } from "@/types/organisationTypes";
import { toast } from "sonner";

const OrganisationAdherents = () => {
  const { id: organisationId } = useParams();

  // Utiliser les données Supabase
  const { adherents, loading } = useAdherents();

  // Mapper les données Supabase vers le format attendu par le tableau modulaire
  const mappedAdherents: AdherentData[] = adherents.map((adherent: Adherent) => ({
    id: adherent.id,
    nom: adherent.last_name || 'N/A',
    prenom: adherent.first_name || 'N/A',
    email: adherent.email || 'N/A',
    telephone: adherent.phone || 'N/A',
    statut: (["Actif", "En attente", "Inactif"][adherents.indexOf(adherent) % 3] as "Actif" | "En attente" | "Inactif"), // Attribution cyclique
    dateInscription: new Date().toLocaleDateString('fr-FR'), // Date fictive pour la démo
    progressValue: Math.floor(Math.random() * 100), // Valeur aléatoire pour la démo
    relatedLinks: [
      { label: "Voir le profil", href: `/organisation/${organisationId}/adherents/${adherent.id}` },
      { label: "Projets", href: `/organisation/${organisationId}/adherents/${adherent.id}/projets` },
    ],
    isLuthaneActive: Math.random() > 0.5, // Valeur aléatoire pour la démo
  }));

  if (loading) {
    return (
      <div className="space-y-6 p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Chargement des adhérents...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Adhérents</h1>
            <p className="text-gray-600 text-base">
              Gérez les adhérents de votre organisation.
            </p>
          </div>
        </div>
      </div>

      {/* Tableau des adhérents avec le composant modulaire */}
      <Card>
        <CardContent className="p-6">
          <ModularDataTable
            data={mappedAdherents}
            config={adherentsTableConfig}
            onDataChange={(newData) => {
              console.log("Nouvelles données:", newData);
              // Ici vous pouvez sauvegarder l'ordre dans Supabase
            }}
          />
        </CardContent>
      </Card>
    </>
  );
};

export default OrganisationAdherents;
