import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMentors } from '@/hooks/useOrganisationData';
import type { Mentor } from '@/types/organisationTypes';
import { Plus } from "lucide-react";
import { ModularDataTable } from "@/components/ui/modular-data-table";
import { mentorsTableConfig, MentorData } from "@/config/tables";

const OrganisationMentors = () => {
  const { id: organisationId } = useParams();
  
  // Utiliser les données Supabase
  const { mentors, loading: mentorsLoading } = useMentors();

  // Mapper les données Supabase vers le format attendu par le tableau modulaire
  const mappedMentors: MentorData[] = mentors.map((mentor: Mentor) => ({
    id: mentor.id,
    nom: mentor.last_name || 'N/A',
    prenom: mentor.first_name || 'N/A',
    email: mentor.email || 'N/A',
    telephone: 'Non renseigné', // TODO: Ajouter le champ phone dans le type Mentor
    specialite: mentor.expertise?.[0] || 'Généraliste',
    statut: (mentor.status === 'active' ? 'Actif' : mentor.status === 'pending' ? 'En attente' : 'Inactif') as "Actif" | "En attente" | "Inactif",
    nombreMentores: mentor.total_entrepreneurs || 0,
    dateInscription: mentor.joined_at ? new Date(mentor.joined_at).toLocaleDateString('fr-FR') : 'N/A',
    progressValue: mentor.success_rate || 0,
    relatedLinks: [
      { label: "Voir le profil", href: `/organisation/${organisationId}/mentors/${mentor.id}` },
      { label: "Entrepreneurs", href: `/organisation/${organisationId}/mentors/${mentor.id}/entrepreneurs` },
    ],
  }));

  if (mentorsLoading) {
    return (
      <div className="space-y-6 p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Chargement des mentors...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* En-tête */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Mentors & Administrateurs</h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Gérez les mentors et administrateurs de votre organisation.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button 
              style={{ backgroundColor: '#ff5932' }} 
              className="hover:opacity-90 text-white w-full sm:w-auto h-9 sm:h-10"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter
            </Button>
          </div>
        </div>
      </div>

      {/* Tableau des mentors avec le composant modulaire */}
      <Card>
        <CardContent className="p-6">
          <ModularDataTable
            data={mappedMentors}
            config={mentorsTableConfig}
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

export default OrganisationMentors;