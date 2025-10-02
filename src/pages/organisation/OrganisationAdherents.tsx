import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { useAdherents } from '@/hooks/useOrganisationData';
import { TemplateDataTable } from '@/pages/individual/ComponentsTemplate';
import { UniqueIdentifier } from "@dnd-kit/core";
import { Adherent } from "@/types/organisationTypes"; // Assurez-vous que ce chemin est correct
import { toast } from "sonner"; // Ajout de toast

interface AdherentRowData {
  id: UniqueIdentifier;
  col1: string; // Nom de l'adhérent
  col2: string; // Statut ou autre info
  col3: string; // Email
  col4: string; // Téléphone
  col5: string; // Nombre de projets ou autre statistique
  labels: string; // Nouvelle colonne pour les étiquettes
  [key: string]: any;
}

const OrganisationAdherents = () => {
  const { id: organisationId } = useParams();

  // Utiliser les données Supabase quand disponible, sinon les données fictives
  const { adherents, loading } = useAdherents();

  const handleOpenAdherentProfile = (adherentData: AdherentRowData) => {
    toast.info(`Ouverture du profil de ${adherentData.col1}`);
    // Ici, vous pouvez implémenter la logique pour ouvrir un modal ou naviguer vers une page de profil
    // Par exemple: navigate(`/organisation/${organisationId}/adherents/${adherentData.id}`);
  };

  const mappedAdherents: AdherentRowData[] = adherents.map((adherent: Adherent) => ({
    id: adherent.id,
    col1: `${adherent.first_name} ${adherent.last_name}`.trim() || adherent.email || 'N/A', // Nom complet ou email
    col2: adherent.status || 'Actif', // Statut fictif ou réel si disponible
    col3: adherent.email || 'N/A',
    col4: adherent.phone || 'N/A',
    col5: adherent.project_count?.toString() || '0', // Exemple de donnée numérique
    labels: ["Actif", "En attente", "Inactif"][adherents.indexOf(adherent) % 3], // Attribution cyclique des étiquettes
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

      {/* Tableau des adhérents */}
      <Card>
        <CardContent className="p-6">
          <TemplateDataTable
            data={mappedAdherents}
            // onRowClick={handleOpenAdherentProfile} // Passer la fonction de gestion du clic sur la ligne
          />
        </CardContent>
      </Card>
    </>
  );
};

export default OrganisationAdherents;
