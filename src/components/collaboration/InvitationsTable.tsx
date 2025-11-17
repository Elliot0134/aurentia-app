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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Search,
  MoreHorizontal,
  Trash2,
  RefreshCw,
  Clock,
  Mail,
  ChevronDown,
  Filter,
  Send,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { CollaboratorsService } from '@/services/collaborators.service';

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: string;
  invited_at: string;
  expires_at: string;
  project_name?: string;
}

interface InvitationsTableProps {
  invitations: Invitation[];
  loading?: boolean;
  onRefresh?: () => void;
}

const InvitationsTable: React.FC<InvitationsTableProps> = ({
  invitations = [],
  loading = false,
  onRefresh
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortBy, setSortBy] = useState('invited_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [invitationToCancel, setInvitationToCancel] = useState<Invitation | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);

  // Fonction pour obtenir les initiales
  const getInitials = (email: string) => {
    if (!email) return '?';
    return email.split('@')[0].substring(0, 2).toUpperCase();
  };

  // Filtrer et trier les invitations
  const filteredInvitations = invitations
    .filter(invitation => {
      const matchesSearch = invitation.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || invitation.status === statusFilter;
      const matchesRole = roleFilter === 'all' || invitation.role === roleFilter;
      return matchesSearch && matchesStatus && matchesRole;
    })
    .sort((a, b) => {
      const aValue = a[sortBy as keyof Invitation];
      const bValue = b[sortBy as keyof Invitation];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      return 0;
    });

  // Obtenir le badge de statut
  const getStatusBadge = (status: string) => {
    const config = {
      pending: {
        label: 'En attente',
        icon: Clock,
        className: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800'
      },
      accepted: {
        label: 'Acceptée',
        icon: CheckCircle,
        className: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
      },
      rejected: {
        label: 'Refusée',
        icon: XCircle,
        className: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
      },
      expired: {
        label: 'Expirée',
        icon: AlertCircle,
        className: 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
      }
    };

    const statusConfig = config[status as keyof typeof config] || config.pending;
    const Icon = statusConfig.icon;

    return (
      <Badge variant="outline" className={cn('flex items-center gap-1 w-fit', statusConfig.className)}>
        <Icon size={12} />
        <span>{statusConfig.label}</span>
      </Badge>
    );
  };

  // Obtenir le badge de rôle
  const getRoleBadge = (role: string) => {
    const config = {
      admin: {
        label: 'Admin',
        className: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/20 dark:text-purple-400'
      },
      editor: {
        label: 'Éditeur',
        className: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/20 dark:text-blue-400'
      },
      viewer: {
        label: 'Lecteur',
        className: 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-400'
      }
    };

    const roleConfig = config[role as keyof typeof config] || config.viewer;

    return (
      <Badge variant="outline" className={cn('w-fit', roleConfig.className)}>
        {roleConfig.label}
      </Badge>
    );
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 24) {
      if (diffInHours < 1) return 'À l\'instant';
      return `Il y a ${diffInHours}h`;
    }

    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  // Annuler une invitation
  const handleCancelInvitation = async () => {
    if (!invitationToCancel) return;

    try {
      const result = await CollaboratorsService.cancelInvitation(invitationToCancel.id);

      if (result.success) {
        toast({
          title: "Invitation annulée",
          description: `L'invitation envoyée à ${invitationToCancel.email} a été annulée.`
        });
        onRefresh?.();
      } else {
        toast({
          title: "Erreur",
          description: result.error || "Impossible d'annuler l'invitation",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite",
        variant: "destructive"
      });
    } finally {
      setInvitationToCancel(null);
    }
  };

  // Renvoyer une invitation
  const handleResendInvitation = async (invitation: Invitation) => {
    setResendingId(invitation.id);

    try {
      const result = await CollaboratorsService.resendInvitation(invitation.id);

      if (result.success) {
        toast({
          title: "Invitation renvoyée",
          description: `L'invitation a été renvoyée à ${invitation.email}.`
        });
        onRefresh?.();
      } else {
        toast({
          title: "Erreur",
          description: result.error || "Impossible de renvoyer l'invitation",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite",
        variant: "destructive"
      });
    } finally {
      setResendingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 animate-pulse">
            <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Barre de recherche et filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Rechercher par email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <Filter size={16} className="mr-2" />
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="accepted">Acceptée</SelectItem>
            <SelectItem value="rejected">Refusée</SelectItem>
            <SelectItem value="expired">Expirée</SelectItem>
          </SelectContent>
        </Select>

        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
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

      {/* Version mobile - Cartes */}
      <div className="block md:hidden space-y-3">
        {filteredInvitations.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
              <Mail size={32} className="text-gray-400 dark:text-gray-600" />
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery || statusFilter !== 'all' || roleFilter !== 'all'
                ? 'Aucune invitation ne correspond aux critères'
                : 'Aucune invitation envoyée'}
            </p>
          </div>
        ) : (
          filteredInvitations.map((invitation) => (
            <div key={invitation.id} className="bg-white dark:bg-gray-900 border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="text-sm bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                      {getInitials(invitation.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-sm">{invitation.email}</div>
                    <div className="text-xs text-gray-500">{formatDate(invitation.invited_at)}</div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {invitation.status === 'pending' && (
                      <>
                        <DropdownMenuItem onClick={() => handleResendInvitation(invitation)}>
                          <RefreshCw size={16} className="mr-2" />
                          Renvoyer
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setInvitationToCancel(invitation)}
                          className="text-red-600"
                        >
                          <Trash2 size={16} className="mr-2" />
                          Annuler
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex flex-wrap gap-2">
                {getRoleBadge(invitation.role)}
                {getStatusBadge(invitation.status)}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Version desktop - Tableau */}
      <div className="hidden md:block border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-900/50">
              <TableHead className="w-[300px]">Destinataire</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Envoyée</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvitations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                    <Mail size={32} className="text-gray-400 dark:text-gray-600" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    {searchQuery || statusFilter !== 'all' || roleFilter !== 'all'
                      ? 'Aucune invitation ne correspond aux critères'
                      : 'Aucune invitation envoyée'}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filteredInvitations.map((invitation) => (
                <TableRow key={invitation.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="text-xs bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                          {getInitials(invitation.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{invitation.email}</div>
                        {invitation.project_name && (
                          <div className="text-xs text-gray-500">{invitation.project_name}</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(invitation.role)}</TableCell>
                  <TableCell>{getStatusBadge(invitation.status)}</TableCell>
                  <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(invitation.invited_at)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {invitation.status === 'pending' && (
                          <>
                            <DropdownMenuItem
                              onClick={() => handleResendInvitation(invitation)}
                              disabled={resendingId === invitation.id}
                            >
                              <RefreshCw size={16} className={cn('mr-2', resendingId === invitation.id && 'animate-spin')} />
                              Renvoyer
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setInvitationToCancel(invitation)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 size={16} className="mr-2" />
                              Annuler
                            </DropdownMenuItem>
                          </>
                        )}
                        {invitation.status !== 'pending' && (
                          <DropdownMenuItem disabled>
                            <AlertCircle size={16} className="mr-2" />
                            Aucune action disponible
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog de confirmation d'annulation */}
      <AlertDialog open={!!invitationToCancel} onOpenChange={(open) => !open && setInvitationToCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Annuler l'invitation</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir annuler l'invitation envoyée à{' '}
              <strong>{invitationToCancel?.email}</strong> ?
              <br /><br />
              Cette action est définitive et l'invitation sera supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelInvitation}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Confirmer l'annulation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default InvitationsTable;
