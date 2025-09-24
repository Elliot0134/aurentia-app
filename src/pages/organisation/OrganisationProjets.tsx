import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Search,
  BarChart3,
  Users,
  TrendingUp,
  Clock,
  MoreHorizontal,
  Trash2,
  Edit,
  Eye,
  ArrowUpDown
} from "lucide-react";
import { useProjects } from '@/hooks/useOrganisationData';
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Project } from '@/services/organisationService';

const OrganisationProjets = () => {
  const { id: organisationId } = useParams();
  const [selectedStatus, setSelectedStatus] = useState('all');

  const { projects, loading } = useProjects();

  const filteredProjects = projects.filter(project => {
    const matchesStatus = selectedStatus === 'all' || project.statut === selectedStatus;
    return matchesStatus;
  });

  const sortedProjects = [...filteredProjects];

  const getStatusColor = (statut: string) => {
    const statusColors = {
      'active': 'bg-green-100 text-green-800',
      'actif': 'bg-green-100 text-green-800',
      'completed': 'bg-blue-100 text-blue-800',
      'terminé': 'bg-blue-100 text-blue-800',
      'draft': 'bg-gray-100 text-gray-800',
      'brouillon': 'bg-gray-100 text-gray-800',
      'archived': 'bg-red-100 text-red-800'
    };
    return statusColors[statut as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (statut: string) => {
    const statusLabels = {
      'active': 'Actif',
      'actif': 'Actif',
      'completed': 'Terminé',
      'terminé': 'Terminé',
      'draft': 'Brouillon',
      'brouillon': 'Brouillon',
      'archived': 'Archivé'
    };
    return statusLabels[statut as keyof typeof statusLabels] || statut;
  };

  const stats = {
    active: projects.filter(p => p.statut === 'active' || p.statut === 'actif').length,
    completed: projects.filter(p => p.statut === 'completed' || p.statut === 'terminé').length,
    total: projects.length
  };

  // Colonnes pour le DataTable
  const columns: ColumnDef<Project>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "nom_projet",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Nom du projet
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const project = row.original;
        return (
          <div>
            <div className="font-medium">{project.nom_projet}</div>
            <div className="text-sm text-gray-500 line-clamp-1">
              {project.description_synthetique || 'Aucune description'}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "statut",
      header: "Statut",
      cell: ({ row }) => {
        const statut = row.getValue("statut") as string;
        return (
          <Badge className={getStatusColor(statut)}>
            {getStatusLabel(statut)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "avancement_global",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Progression
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const avancement = row.getValue("avancement_global") as string;
        const progress = avancement ? parseInt(avancement) : 0;
        
        return (
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-aurentia-pink to-aurentia-orange rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <span className="text-sm font-medium">{progress}%</span>
          </div>
        );
      },
    },
    {
      accessorKey: "user_id",
      header: "Entrepreneur",
      cell: ({ row }) => {
        const userId = row.getValue("user_id") as string;
        return (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-gradient-to-br from-aurentia-pink to-aurentia-orange rounded-full flex items-center justify-center text-white text-xs font-medium">
              {userId ? userId.slice(0, 2).toUpperCase() : 'NA'}
            </div>
            <div>
              <div className="text-sm font-medium">Entrepreneur</div>
              <div className="text-xs text-gray-500">{userId || 'Non assigné'}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Date de création
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const date = row.getValue("created_at") as string;
        return <div className="text-sm">{new Date(date || '').toLocaleDateString('fr-FR')}</div>;
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const project = row.original;
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Ouvrir le menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem>
                <Eye className="mr-2 h-4 w-4" />
                Voir le projet
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const [selectedProjects, setSelectedProjects] = useState<Project[]>([]);

  const handleRowSelectionChange = (selectedRows: Project[]) => {
    setSelectedProjects(selectedRows);
  };

  const bulkActions = (
    <div className="flex gap-2">
      <Button variant="outline" size="sm">
        <Eye className="mr-2 h-4 w-4" />
        Voir ({selectedProjects.length})
      </Button>
      <Button variant="outline" size="sm">
        <Edit className="mr-2 h-4 w-4" />
        Modifier ({selectedProjects.length})
      </Button>
      <Button variant="destructive" size="sm">
        <Trash2 className="mr-2 h-4 w-4" />
        Supprimer ({selectedProjects.length})
      </Button>
    </div>
  );

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

      {/* Liste des projets */}
      <Card>
        <CardContent className="p-6">
          <DataTable
            columns={columns}
            data={projects}
            searchKey="nom_projet"
            searchPlaceholder="Rechercher un projet..."
            onRowSelectionChange={handleRowSelectionChange}
            bulkActions={bulkActions}
            externalFilter={(project) => selectedStatus === 'all' || project.statut === selectedStatus}
            additionalControls={
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="completed">Terminé</SelectItem>
                  <SelectItem value="draft">Brouillon</SelectItem>
                </SelectContent>
              </Select>
            }
          />
        </CardContent>
      </Card>
    </>
  );
};

export default OrganisationProjets;