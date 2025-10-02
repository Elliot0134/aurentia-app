import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { useProjects } from '@/hooks/useOrganisationData';
import { ModularDataTable } from "@/components/ui/modular-data-table";
import { projetsTableConfig, ProjetData } from "@/config/tables";
import type { Project } from '@/services/organisationService';

const OrganisationProjets = () => {
  const { id: organisationId } = useParams();

  const { projects, loading } = useProjects();

  // Mapper les données Supabase vers le format attendu par le tableau modulaire
  const mappedProjects: ProjetData[] = projects.map((project: Project, index: number) => {
    const statut = project.statut === 'active' || project.statut === 'actif' ? 'En cours' 
      : project.statut === 'completed' || project.statut === 'terminé' ? 'Terminé' 
      : 'En attente';

    const projectId = (project as any).id || `project-${index}`;

    return {
      id: projectId,
      titre: project.nom_projet || 'Sans titre',
      porteur: project.user_id || 'Non assigné',
      categorie: (project as any).type_de_projet || 'Non catégorisé',
      statut: statut as "En cours" | "En attente" | "Terminé",
      dateCreation: project.created_at ? new Date(project.created_at).toLocaleDateString('fr-FR') : 'N/A',
      dateEcheance: project.updated_at ? new Date(project.updated_at).toLocaleDateString('fr-FR') : 'N/A',
      progressValue: project.avancement_global ? parseInt(project.avancement_global) : 0,
      relatedLinks: [
        { label: "Voir le projet", href: `/organisation/${organisationId}/projets/${projectId}` },
        { label: "Tâches", href: `/organisation/${organisationId}/projets/${projectId}/taches` },
      ],
    };
  });

  if (loading) {
    return (
      <>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestion des Projets
          </h1>
          <p className="text-gray-600">
            Suivez et gérez tous les projets de votre organisation
          </p>
        </div>
      </div>

      {/* Tableau des projets avec le composant modulaire */}
      <Card>
        <CardContent className="p-6">
          <ModularDataTable
            data={mappedProjects}
            config={projetsTableConfig}
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

export default OrganisationProjets;