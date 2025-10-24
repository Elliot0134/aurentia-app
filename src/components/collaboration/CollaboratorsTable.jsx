import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import StatusBadge from './StatusBadge';
import ProjectSelector from './ProjectSelector';
import {
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Clock,
  Mail,
  Folder,
  ChevronDown,
  Filter,
  Eye,
  PencilLine,
  UserCog
} from 'lucide-react';

// Fonction utilitaire pour obtenir l'email de manière sécurisée
const getCollaboratorEmail = (collaborator) => {
  return collaborator?.email || collaborator?.user?.email || '';
};

// Fonction utilitaire pour obtenir les initiales de manière sécurisée
const getInitials = (email) => {
  if (!email || typeof email !== 'string') return '?';
  return email.split('@')[0].substring(0, 2).toUpperCase();
};

const CollaboratorsTable = ({
  collaborators = [],
  projects = [],
  onUpdateCollaborator,
  onRemoveCollaborator,
  onChangeStatus,
  loading = false
}) => {
  // Normaliser les collaborateurs pour s'assurer qu'ils ont toutes les propriétés requises
  const normalizedCollaborators = collaborators.map(collaborator => ({
    ...collaborator,
    email: collaborator?.email || collaborator?.user?.email || '',
    projects: collaborator?.projects || [],
    status: collaborator?.status || 'active',
    role: collaborator?.role || 'viewer',
    id: collaborator?.id || '',
    user: collaborator?.user || null,
    project: collaborator?.project || null
  }));

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortBy, setSortBy] = useState('email');
  const [sortOrder, setSortOrder] = useState('asc');
  const [editingCollaborator, setEditingCollaborator] = useState(null);
  const [collaboratorToDelete, setCollaboratorToDelete] = useState(null);

  // Filtrer et trier les collaborateurs
  const filteredCollaborators = normalizedCollaborators
    .filter(collaborator => {
      // Utiliser la fonction utilitaire pour obtenir l'email de manière sécurisée
      const email = getCollaboratorEmail(collaborator);
      const matchesSearch = email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || collaborator.status === statusFilter;
      const matchesRole = roleFilter === 'all' || collaborator.role === roleFilter;
      return matchesSearch && matchesStatus && matchesRole;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'projects') {
        aValue = (a.projects || []).length;
        bValue = (b.projects || []).length;
      }
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Obtenir le label du rôle
  const getRoleLabel = (role) => {
    const roles = {
      viewer: 'Lecteur',
      editor: 'Éditeur',
      admin: 'Administrateur'
    };
    return roles[role] || role;
  };


  // Obtenir la couleur du rôle
  const getRoleColor = (role) => {
    const colors = {
      viewer: 'bg-gray-100 text-gray-800',
      editor: 'bg-blue-100 text-blue-800',
      admin: 'bg-purple-100 text-purple-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  // Gérer le changement de statut
  const handleStatusChange = async (collaboratorId, newStatus) => {
    await onChangeStatus(collaboratorId, newStatus);
  };

  // Gérer le changement de rôle
  const handleRoleChange = async (collaboratorId, newRole) => {
    await onUpdateCollaborator(collaboratorId, { role: newRole });
  };

  // Gérer la suppression
  const handleDelete = async () => {
    if (collaboratorToDelete) {
      await onRemoveCollaborator(collaboratorToDelete.id);
      setCollaboratorToDelete(null);
    }
  };

  // Gérer la mise à jour des projets
  const handleProjectsUpdate = async (collaboratorId, newProjects) => {
    await onUpdateCollaborator(collaboratorId, { projects: newProjects });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtres et recherche */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          <div className="relative flex-1 w-2/5">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input
              placeholder="Rechercher par email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <Filter size={16} className="mr-2" />
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="active">Actif</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="suspended">Suspendu</SelectItem>
            </SelectContent>
          </Select>

          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Rôle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les rôles</SelectItem>
              <SelectItem value="viewer">Lecteur</SelectItem>
              <SelectItem value="editor">Éditeur</SelectItem>
              <SelectItem value="admin">Administrateur</SelectItem>
            </SelectContent>
          </Select>
        </div>

      </div>

      {/* Version mobile - Cartes */}
      <div className="block md:hidden space-y-3">
        {filteredCollaborators.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchQuery || statusFilter !== 'all' || roleFilter !== 'all'
              ? 'Aucun collaborateur ne correspond aux critères de recherche'
              : 'Aucun collaborateur pour le moment'
            }
          </div>
        ) : (
          filteredCollaborators.map((collaborator) => (
            <div key={collaborator.id} className="bg-white border rounded-lg p-4 space-y-3">
              {/* En-tête de la carte */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={collaborator?.user?.avatar_url} />
                    <AvatarFallback className="text-sm bg-blue-100 text-blue-600">
                      {getInitials(getCollaboratorEmail(collaborator))}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-sm">{getCollaboratorEmail(collaborator)}</div>
                    <StatusBadge status={collaborator.status} />
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCollaboratorToDelete(collaborator)}
                  className="text-red-600 hover:text-red-800 hover:bg-red-50"
                >
                  <Trash2 size={16} />
                </Button>
              </div>

              {/* Contenu de la carte */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Projets:</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-1 text-right"
                    onClick={() => setEditingCollaborator(collaborator)}
                  >
                    <span className="text-sm text-gray-900">
                      {(collaborator.projects || []).length} projet{(collaborator.projects || []).length > 1 ? 's' : ''}
                    </span>
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Rôle:</span>
                  <Select
                    value={collaborator.role}
                    onValueChange={(newRole) => handleRoleChange(collaborator.id, newRole)}
                  >
                    <SelectTrigger className="w-[120px] h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">
                        <div className="flex items-center gap-2">
                          <Eye size={14} />
                          Lecteur
                        </div>
                      </SelectItem>
                      <SelectItem value="editor">
                        <div className="flex items-center gap-2">
                          <PencilLine size={14} />
                          Éditeur
                        </div>
                      </SelectItem>
                      <SelectItem value="admin">
                        <div className="flex items-center gap-2">
                          <UserCog size={14} />
                          Admin
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Version desktop - Tableau */}
      <div className="hidden md:block border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => {
                  if (sortBy === 'email') {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortBy('email');
                    setSortOrder('asc');
                  }
                }}
              >
                <div className="flex items-center gap-2">
                  Collaborateur
                  <ChevronDown size={14} className={`transition-transform ${sortBy === 'email' && sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                </div>
              </TableHead>
              <TableHead>Projet</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCollaborators.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  {searchQuery || statusFilter !== 'all' || roleFilter !== 'all'
                    ? 'Aucun collaborateur ne correspond aux critères de recherche'
                    : 'Aucun collaborateur pour le moment'
                  }
                </TableCell>
              </TableRow>
            ) : (
              filteredCollaborators.map((collaborator) => (
                <TableRow key={collaborator.id} className="hover:bg-gray-50">
                  {/* Collaborateur */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={collaborator?.user?.avatar_url} />
                        <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                          {getInitials(getCollaboratorEmail(collaborator))}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-gray-400" />
                        <span className="font-medium">{getCollaboratorEmail(collaborator)}</span>
                      </div>
                    </div>
                  </TableCell>
                  
                  {/* Projet - Cliquable */}
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-1 text-left justify-start"
                      onClick={() => setEditingCollaborator(collaborator)}
                    >
                      <div className="flex items-center gap-2">
                        <Folder size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-900 hover:text-gray-700">
                          {(collaborator.projects || []).length} projet{(collaborator.projects || []).length > 1 ? 's' : ''}
                        </span>
                      </div>
                    </Button>
                  </TableCell>
                  
                  {/* Rôle - Dropdown */}
                  <TableCell>
                    <Select
                      value={collaborator.role}
                      onValueChange={(newRole) => handleRoleChange(collaborator.id, newRole)}
                    >
                      <SelectTrigger className="w-[140px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="viewer">
                          <div className="flex items-center gap-2">
                            <Eye size={14} />
                            Lecteur
                          </div>
                        </SelectItem>
                        <SelectItem value="editor">
                          <div className="flex items-center gap-2">
                            <PencilLine size={14} />
                            Éditeur
                          </div>
                        </SelectItem>
                        <SelectItem value="admin">
                          <div className="flex items-center gap-2">
                            <UserCog size={14} />
                            Administrateur
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  
                  {/* Statut */}
                  <TableCell>
                    <StatusBadge status={collaborator.status} />
                  </TableCell>
                  
                  {/* Actions - Seulement suppression */}
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCollaboratorToDelete(collaborator)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal d'édition */}
      {editingCollaborator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              Modifier {getCollaboratorEmail(editingCollaborator)}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Projets assignés</label>
                <ProjectSelector
                  projects={projects}
                  selectedProjects={editingCollaborator.projects || []}
                  onChange={(newProjects) => 
                    setEditingCollaborator(prev => ({ ...prev, projects: newProjects }))
                  }
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button 
                variant="outline" 
                onClick={() => setEditingCollaborator(null)}
              >
                Annuler
              </Button>
              <Button 
                onClick={() => {
                  handleProjectsUpdate(editingCollaborator.id, editingCollaborator.projects || []);
                  setEditingCollaborator(null);
                }}
              >
                Sauvegarder
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={!!collaboratorToDelete} onOpenChange={() => setCollaboratorToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. Cela supprimera définitivement le collaborateur 
              "{getCollaboratorEmail(collaboratorToDelete)}" et retirera son accès à tous les projets.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CollaboratorsTable;
