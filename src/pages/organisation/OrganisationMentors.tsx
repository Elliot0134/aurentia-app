import { useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMentors } from '@/hooks/useOrganisationData';
import type { Mentor } from '@/types/organisationTypes';
import {
  Users,
  Search,
  Filter,
  Plus,
  Mail,
  Star,
  Calendar,
  UserCheck,
  Building,
  MoreHorizontal,
  Trash2,
  Edit,
  Eye,
  ArrowUpDown
} from "lucide-react";
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

const OrganisationMentors = () => {
  const { id: organisationId } = useParams();
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  // Utiliser les données Supabase
  const { mentors, loading: mentorsLoading } = useMentors();

  const filteredMentors = mentors.filter(mentor => {
    const matchesStatus = selectedStatus === 'all' || mentor.status === selectedStatus;
    return matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      inactive: 'bg-gray-100 text-gray-800'
    };
    const labels = {
      active: 'Actif',
      pending: 'En attente',
      inactive: 'Inactif'
    };
    return (
      <Badge className={colors[status as keyof typeof colors] || 'bg-blue-100 text-blue-800'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      organisation: 'bg-purple-100 text-purple-800',
      staff: 'bg-blue-100 text-blue-800'
    };
    const labels = {
      organisation: 'Propriétaire',
      staff: 'Administrateur'
    };
    return (
      <Badge className={colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {labels[role as keyof typeof labels] || role}
      </Badge>
    );
  };

  const stats = {
    total: mentors.length,
    active: mentors.filter(m => m.status === 'active').length,
    owners: mentors.filter(m => m.user_role === 'organisation').length,
    admins: mentors.filter(m => m.user_role === 'staff').length
  };

  // Colonnes pour le DataTable
  const columns: ColumnDef<Mentor>[] = [
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
        const mentor = row.original;
        const fullName = `${mentor.first_name} ${mentor.last_name}`.trim();
        const initials = `${mentor.first_name?.[0] || ''}${mentor.last_name?.[0] || ''}`.toUpperCase();
        
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-aurentia-pink rounded-full flex items-center justify-center text-white font-semibold text-xs">
              {initials || mentor.email.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="font-medium">{fullName || mentor.email}</div>
              <div className="text-sm text-gray-500">{mentor.email}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "user_role",
      header: "Rôle",
      cell: ({ row }) => {
        const role = row.getValue("user_role") as string;
        return getRoleBadge(role);
      },
    },
    {
      accessorKey: "status",
      header: "Statut",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return getStatusBadge(status);
      },
    },
    {
      accessorKey: "expertise",
      header: "Expertise",
      cell: ({ row }) => {
        const expertise = row.getValue("expertise") as string[];
        if (!expertise || expertise.length === 0) return <span className="text-gray-400">Aucune</span>;
        
        return (
          <div className="flex flex-wrap gap-1">
            {expertise.slice(0, 2).map((skill, index) => (
              <Badge key={index} variant="outline" className="text-xs px-2 py-0.5">
                {skill}
              </Badge>
            ))}
            {expertise.length > 2 && (
              <Badge variant="outline" className="text-xs px-2 py-0.5">
                +{expertise.length - 2}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "total_entrepreneurs",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Entrepreneurs
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const count = row.getValue("total_entrepreneurs") as number;
        return <div className="text-center font-medium">{count}</div>;
      },
    },
    {
      accessorKey: "success_rate",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Taux de succès
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const rate = row.getValue("success_rate") as number;
        return <div className="text-center font-medium">{rate}%</div>;
      },
    },
    {
      accessorKey: "rating",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Note
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const rating = row.getValue("rating") as number;
        if (rating === 0) return <span className="text-gray-400">-</span>;
        
        return (
          <div className="flex items-center justify-center gap-1">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="font-medium">{rating}/5</span>
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
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const mentor = row.original;
        
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

  const [selectedMentors, setSelectedMentors] = useState<Mentor[]>([]);

  const handleRowSelectionChange = (selectedRows: Mentor[]) => {
    setSelectedMentors(selectedRows);
  };

  const bulkActions = (
    <div className="flex gap-2">
      <Button variant="outline" size="sm">
        <Mail className="mr-2 h-4 w-4" />
        Contacter ({selectedMentors.length})
      </Button>
      <Button variant="outline" size="sm">
        <Edit className="mr-2 h-4 w-4" />
        Modifier ({selectedMentors.length})
      </Button>
      <Button variant="destructive" size="sm">
        <Trash2 className="mr-2 h-4 w-4" />
        Supprimer ({selectedMentors.length})
      </Button>
    </div>
  );

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

        {/* Liste des mentors */}
        <Card>
          <CardContent className="p-6">
            <DataTable
              columns={columns}
              data={mentors}
              searchKey="first_name"
              searchPlaceholder="Rechercher par nom..."
              onRowSelectionChange={handleRowSelectionChange}
              bulkActions={bulkActions}
              externalFilter={(mentor) => selectedStatus === 'all' || mentor.status === selectedStatus}
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

        {/* Message si aucun mentor */}
        {filteredMentors.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun mentor trouvé</h3>
              <p className="text-gray-600 mb-4">
                Aucun mentor ne correspond à vos critères de recherche.
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedStatus('all');
                }}
              >
                Réinitialiser les filtres
              </Button>
            </CardContent>
          </Card>
        )}
      </>
    );
  };

export default OrganisationMentors;