import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Plus,
  Search,
  Filter,
  Mail,
  MapPin,
  Calendar,
  Briefcase,
  Star,
  Eye,
  Edit,
  MoreVertical,
  MoreHorizontal,
  Trash2,
  UserCheck,
  ArrowUpDown
} from "lucide-react";
import { useAdherents } from '@/hooks/useOrganisationData';
import type { Adherent } from '@/types/organisationTypes';
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

const OrganisationAdherents = () => {
  const { id: organisationId } = useParams();
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);

  // Utiliser les données Supabase
  const { adherents, loading } = useAdherents();

  const filteredAdherents = adherents.filter(adherent => {
    const matchesStatus = selectedStatus === 'all' || adherent.status === selectedStatus;
    return matchesStatus;
  });

  const getStatusColor = (status: Adherent['status']) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status];
  };

  const getStatusLabel = (status: Adherent['status']) => {
    const labels = {
      active: 'Actif',
      inactive: 'Inactif',
      pending: 'En attente'
    };
    return labels[status];
  };

  const stats = {
    total: adherents.length,
    active: adherents.filter(e => e.status === 'active').length,
    pending: adherents.filter(e => e.status === 'pending').length,
    avgProgress: adherents.length > 0 ? Math.round(
      adherents.reduce((sum, e) => sum + (e.completed_deliverables / e.total_deliverables), 0) / 
      adherents.length * 100
    ) : 0
  };

  // Colonnes pour le DataTable
  const columns: ColumnDef<Adherent>[] = [
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
      accessorKey: "first_name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Nom complet
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const adherent = row.original;
        const fullName = `${adherent.first_name} ${adherent.last_name}`.trim();
        const initials = `${adherent.first_name?.[0] || ''}${adherent.last_name?.[0] || ''}`.toUpperCase();
        
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-aurentia-pink rounded-full flex items-center justify-center text-white font-semibold text-xs">
              {initials || adherent.email.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="font-medium">{fullName || adherent.email}</div>
              <div className="text-sm text-gray-500">{adherent.email}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Statut",
      cell: ({ row }) => {
        const status = row.getValue("status") as Adherent['status'];
        return (
          <Badge className={getStatusColor(status)}>
            {getStatusLabel(status)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "project_count",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Projets
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const count = row.getValue("project_count") as number;
        return <div className="text-center font-medium">{count}</div>;
      },
    },
    {
      accessorKey: "completed_deliverables",
      header: "Progression",
      cell: ({ row }) => {
        const adherent = row.original;
        const progressPercentage = adherent.total_deliverables > 0 
          ? Math.round((adherent.completed_deliverables / adherent.total_deliverables) * 100) 
          : 0;
        
        return (
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-aurentia-pink h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
            <span className="text-sm font-medium">{progressPercentage}%</span>
          </div>
        );
      },
    },
    {
      accessorKey: "joined_at",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Date d'adhésion
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const date = row.getValue("joined_at") as string;
        return <div className="text-sm">{new Date(date).toLocaleDateString('fr-FR')}</div>;
      },
    },
    {
      accessorKey: "last_activity",
      header: "Dernière activité",
      cell: ({ row }) => {
        const lastActivity = row.getValue("last_activity") as string | undefined;
        if (!lastActivity) {
          return <span className="text-gray-400">-</span>;
        }
        return <div className="text-sm">{new Date(lastActivity).toLocaleDateString('fr-FR')}</div>;
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const adherent = row.original;
        
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
                Voir le profil
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Mail className="mr-2 h-4 w-4" />
                Contacter
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigate(`/organisation/mentors/assign?adherent=${adherent.id}`)}
              >
                <UserCheck className="mr-2 h-4 w-4" />
                {adherent.mentor_id ? 'Changer' : 'Assigner'} mentor
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

  const [selectedAdherents, setSelectedAdherents] = useState<Adherent[]>([]);

  const handleRowSelectionChange = (selectedRows: Adherent[]) => {
    setSelectedAdherents(selectedRows);
  };

  const bulkActions = (
    <div className="flex gap-2">
      <Button variant="outline" size="sm">
        <Mail className="mr-2 h-4 w-4" />
        Contacter ({selectedAdherents.length})
      </Button>
      <Button variant="outline" size="sm">
        <UserCheck className="mr-2 h-4 w-4" />
        Assigner mentor ({selectedAdherents.length})
      </Button>
      <Button variant="destructive" size="sm">
        <Trash2 className="mr-2 h-4 w-4" />
        Supprimer ({selectedAdherents.length})
      </Button>
    </div>
  );

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
          <div className="flex items-center gap-3">
            <Button style={{ backgroundColor: '#ff5932' }} className="hover:opacity-90 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter
            </Button>
          </div>
        </div>
      </div>

        {/* Liste des adhérents */}
        <Card>
          <CardContent className="p-6">
            <DataTable
              columns={columns}
              data={adherents}
              searchKey="first_name"
              searchPlaceholder="Rechercher par nom ou email..."
              onRowSelectionChange={handleRowSelectionChange}
              bulkActions={bulkActions}
              externalFilter={(adherent) => selectedStatus === 'all' || adherent.status === selectedStatus}
              additionalControls={
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="inactive">Inactif</SelectItem>
                  </SelectContent>
                </Select>
              }
            />
          </CardContent>
        </Card>
      </>
    );
  };

export default OrganisationAdherents;