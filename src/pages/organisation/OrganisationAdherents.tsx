import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
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
    telephone: adherent.phone || '',
    photoUrl: adherent.avatar_url,
    projetsAssocies: adherent.project_names || undefined,
    linkedin: adherent.linkedin_url,
    siteWeb: adherent.website,
    creditsRestants: adherent.monthly_credits_remaining,
    mentorsAssocies: adherent.mentor_names || undefined,
    cotisationPayee: adherent.payment_status === 'paid',
    joursRetard: adherent.subscription_days_overdue || 0,
    formationChoisie: adherent.program_type,
    promotion: adherent.cohort_year,
    budgetFormation: adherent.training_budget,
    disponibilites: adherent.availability_schedule ? JSON.stringify(adherent.availability_schedule) : undefined,
    statut: adherent.status === 'active' ? 'Actif' : adherent.status === 'pending' ? 'En attente' : 'Inactif',
    dateInscription: adherent.joined_at ? new Date(adherent.joined_at).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR'),
    progressValue: adherent.completion_rate || 0,
    relatedLinks: [
      { label: "Voir le profil", href: `/organisation/${organisationId}/adherents/${adherent.id}` },
      { label: "Projets", href: `/organisation/${organisationId}/adherents/${adherent.id}/projets` },
    ],
  }));

  if (loading) {
    return (
      <div className="space-y-6 p-8">
        <LoadingSpinner message="Chargement des adhérents..." fullScreen />
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
