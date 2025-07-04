import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Mail, Shield, Edit, Trash2, Users, Eye, FolderSearch, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { useResponsive } from '@/hooks/use-responsive';
import { MultiSelect } from '@/components/ui/multi-select';
import { useNavigate } from 'react-router-dom';
import { useProject } from '@/contexts/ProjectContext';
import { collaborationManager, ProjectCollaborator } from '@/services/collaborationManager';
import InvitationDialog from '@/components/collaboration/InvitationDialog';

interface Collaborateur {
  id: string;
  nom: string;
  email: string;
  role: 'reader' | 'editor';
  project_id: string;
  status: 'pending' | 'accepted' | 'declined';
  avatar?: string;
}

const Collaborateurs: React.FC = () => {
  const navigate = useNavigate();
  const { userProjects } = useProject();
  
  const [collaborateurs, setCollaborateurs] = useState<Collaborateur[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [loading, setLoading] = useState(false);

  // États pour les filtres
  const [filterEmail, setFilterEmail] = useState('');
  const [filterRole, setFilterRole] = useState<'Tous' | 'reader' | 'editor'>('Tous');
  const [filterStatus, setFilterStatus] = useState<'Tous' | 'accepted' | 'pending'>('Tous');
  const [showFilters, setShowFilters] = useState(false);

  // Charger l'utilisateur actuel et ses projets
  useEffect(() => {
    loadCurrentUser();
  }, []);

  // Charger les collaborateurs quand le projet change
  useEffect(() => {
    if (selectedProjectId) {
      loadCollaborators();
    }
  }, [selectedProjectId]);

  const loadCurrentUser = async () => {
    try {
      const user = await collaborationManager.getCurrentUser();
      if (user) {
        setCurrentUser(user);
        if (userProjects.length > 0) {
          setSelectedProjectId(userProjects[0].project_id);
        }
      }
    } catch (error) {
      console.error('Erreur chargement utilisateur:', error);
    }
  };

  const loadCollaborators = async () => {
    if (!selectedProjectId) return;
    
    try {
      setLoading(true);
      const collabs = await collaborationManager.getProjectCollaborators(selectedProjectId);
      
      // Transformer les données pour correspondre à notre interface
      const transformedCollabs: Collaborateur[] = collabs.map((collab: ProjectCollaborator) => ({
        id: collab.id,
        nom: collab.user?.full_name || collab.user?.email?.split('@')[0] || 'Utilisateur',
        email: collab.user?.email || '',
        role: collab.role,
        project_id: collab.project_id,
        status: collab.status,
      }));
      
      setCollaborateurs(transformedCollabs);
    } catch (error) {
      console.error('Erreur chargement collaborateurs:', error);
      toast.error('Erreur lors du chargement des collaborateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (collaborateurId: string, newRole: 'reader' | 'editor') => {
    // Note: Cette fonctionnalité nécessiterait une fonction update dans collaborationManager
    // Pour l'instant, on affiche juste un message
    toast.info('Modification des rôles - fonctionnalité à implémenter');
  };

  const handleRemoveCollaborateur = async (collaborateurId: string) => {
    const collaborateur = collaborateurs.find(c => c.id === collaborateurId);
    
    if (!confirm(`Supprimer ${collaborateur?.nom} du projet ?`)) return;

    try {
      await collaborationManager.removeCollaborator(selectedProjectId, collaborateur?.id || '');
      toast.success(`${collaborateur?.nom} a été retiré du projet`);
      await loadCollaborators(); // Recharger la liste
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    return role === 'editor' ? 'default' : 'secondary';
  };

  const getRoleIcon = (role: string) => {
    return role === 'editor' ? <Edit className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />;
  };

  const getStatusBadgeClass = (status: 'pending' | 'accepted' | 'declined') => {
    if (status === 'accepted') {
      return 'bg-[#cef5d1] text-green-800'; // Green background, dark green text
    } else if (status === 'pending') {
      return 'bg-[#e9eef9] text-blue-800'; // Light blue background, dark blue text
    } else {
      return 'bg-[#fecaca] text-red-800'; // Red background for declined
    }
  };

  const getStatusLabel = (status: 'pending' | 'accepted' | 'declined') => {
    switch (status) {
      case 'accepted': return 'Actif';
      case 'pending': return 'En attente';
      case 'declined': return 'Refusé';
      default: return status;
    }
  };

  const { isCompact, isMobile } = useResponsive();

  // Fonction pour obtenir le nom du projet à partir de son ID
  const getProjectName = (projectId: string) => {
    const project = userProjects.find(p => p.project_id === projectId);
    return project?.nom_projet || projectId;
  };

  // Fonction pour naviguer vers la page du projet
  const handleProjectClick = (projectId: string) => {
    navigate(`/project-business?project_id=${projectId}`);
  };

  // Fonction pour filtrer les collaborateurs
  const filteredCollaborateurs = collaborateurs.filter(collaborateur => {
    // Filtre par email
    if (filterEmail && !collaborateur.email.toLowerCase().includes(filterEmail.toLowerCase())) {
      return false;
    }
    
    // Filtre par rôle
    if (filterRole !== 'Tous' && collaborateur.role !== filterRole) {
      return false;
    }
    
    // Filtre par statut
    if (filterStatus !== 'Tous') {
      if (filterStatus === 'accepted' && collaborateur.status !== 'accepted') return false;
      if (filterStatus === 'pending' && collaborateur.status !== 'pending') return false;
    }
    
    return true;
  });

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen animate-fade-in">
      <div className="max-w-6xl mx-auto">
        {/* En-tête */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <Users className="w-8 h-8 text-primary" />
              Collaborateurs
            </h1>
            <p className="text-gray-600">
              Gérez les accès et les permissions de votre équipe projet
            </p>
          </div>
          
          <InvitationDialog
            defaultProjectId={selectedProjectId}
            onInvitationSent={loadCollaborators}
            buttonText="Inviter un collaborateur"
            buttonVariant="default"
            showProjectSelector={true}
            trigger={
              <Button className="flex items-center gap-2 bg-gradient-primary hover:opacity-90 transition-opacity">
                <UserPlus className="w-4 h-4" />
                Inviter un collaborateur
              </Button>
            }
          />
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total des membres</p>
                <p className="text-2xl font-bold">{collaborateurs.length}</p>
              </div>
              <Users className="w-8 h-8 text-primary opacity-20" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Éditeurs</p>
                <p className="text-2xl font-bold">
                  {collaborateurs.filter(c => c.role === 'editor').length}
                </p>
              </div>
              <Edit className="w-8 h-8 text-primary opacity-20" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Lecteurs</p>
                <p className="text-2xl font-bold">
                  {collaborateurs.filter(c => c.role === 'reader').length}
                </p>
              </div>
              <Eye className="w-8 h-8 text-primary opacity-20" />
            </div>
          </div>
        </div>

        {/* Tableau des collaborateurs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Membres de l'équipe</h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              title="Filtrer"
            >
              <Filter className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Filtres (collapsible) */}
          {showFilters && (
            <div className="p-6 border-b border-gray-100 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="filter-email" className="text-sm mb-2">Email</Label>
              <Input
                id="filter-email"
                type="text"
                placeholder="Rechercher par email..."
                value={filterEmail}
                onChange={(e) => setFilterEmail(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="filter-role" className="text-sm mb-2">Autorisations</Label>
              <Select value={filterRole} onValueChange={(value) => setFilterRole(value as 'Tous' | 'reader' | 'editor')}>
                <SelectTrigger id="filter-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tous">Tous</SelectItem>
                  <SelectItem value="reader">
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-2" />
                      Lecteur
                    </div>
                  </SelectItem>
                  <SelectItem value="editor">
                    <div className="flex items-center">
                      <Edit className="w-4 h-4 mr-2" />
                      Éditeur
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="filter-status" className="text-sm mb-2">Statut</Label>
              <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as 'Tous' | 'accepted' | 'pending')}>
                <SelectTrigger id="filter-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tous">Tous</SelectItem>
                  <SelectItem value="accepted">Actif</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="current-project" className="text-sm mb-2">Projet actuel</Label>
              <div className="p-2 bg-gray-100 rounded text-sm">
                {selectedProjectId ? getProjectName(selectedProjectId) : 'Aucun projet sélectionné'}
              </div>
            </div>
          </div>
            </div>
          )}
          
          {isCompact ? (
            <div className="p-4 grid gap-4 overflow-x-hidden">
              {filteredCollaborateurs.map((collaborateur) => (
                <div key={collaborateur.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">
                          {collaborateur.nom.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium">{collaborateur.nom}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveCollaborateur(collaborateur.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {collaborateur.email}
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <Select 
                      value={collaborateur.role} 
                      onValueChange={(value) => handleRoleChange(collaborateur.id, value as 'reader' | 'editor')}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="reader">
                          <div className="flex items-center">
                            <Eye className="w-4 h-4 mr-2" />
                            Lecteur
                          </div>
                        </SelectItem>
                        <SelectItem value="editor">
                          <div className="flex items-center">
                            <Edit className="w-4 h-4 mr-2" />
                            Éditeur
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Badge className={`${getStatusBadgeClass(collaborateur.status)} hover:bg-transparent hover:text-current cursor-default`}>
                      {getStatusLabel(collaborateur.status)}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 mt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <FolderSearch className="w-4 h-4" />
                      <span className="font-medium">Projet :</span>
                    </div>
                    <Badge
                      variant="secondary"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => handleProjectClick(collaborateur.project_id)}
                    >
                      {getProjectName(collaborateur.project_id)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead> {/* Changed from Utilisateur to Nom */}
                  <TableHead>Email</TableHead>
                  <TableHead>Autorisations</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <FolderSearch className="w-4 h-4" />
                      Projet
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCollaborateurs.map((collaborateur) => (
                  <TableRow key={collaborateur.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">
                            {collaborateur.nom.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span>{collaborateur.nom}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4" />
                        {collaborateur.email}
                      </div>
                    </TableCell>
                    <TableCell>
                    <Select 
                      value={collaborateur.role} 
                      onValueChange={(value) => handleRoleChange(collaborateur.id, value as 'reader' | 'editor')}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="reader">
                          <div className="flex items-center">
                            <Eye className="w-4 h-4 mr-2" />
                            Lecteur
                          </div>
                        </SelectItem>
                        <SelectItem value="editor">
                          <div className="flex items-center">
                            <Edit className="w-4 h-4 mr-2" />
                            Éditeur
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getStatusBadgeClass(collaborateur.status)} hover:bg-transparent hover:text-current cursor-default`}>
                      {getStatusLabel(collaborateur.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => handleProjectClick(collaborateur.project_id)}
                    >
                      {getProjectName(collaborateur.project_id)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveCollaborateur(collaborateur.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          )}
          
          {filteredCollaborateurs.length === 0 && (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucun collaborateur pour le moment</p>
              <p className="text-sm text-gray-400 mt-2">
                Invitez des membres de votre équipe pour collaborer sur ce projet
              </p>
            </div>
          )}
        </div>

        {/* Note d'information */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Note :</strong> Les invitations sont envoyées par email. Les nouveaux collaborateurs devront créer un compte ou se connecter pour accéder au projet.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Collaborateurs;
