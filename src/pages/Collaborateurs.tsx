import React, { useState } from 'react';
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

interface Collaborateur {
  id: string;
  nom: string;
  email: string;
  role: 'Lecteur' | 'Éditeur';
  projects: string[]; // Changed to array for multiple projects
  status: 'En attente' | 'Actif';
  avatar?: string;
}

const Collaborateurs: React.FC = () => {
  const navigate = useNavigate();
  const { userProjects } = useProject();
  
  const [collaborateurs, setCollaborateurs] = useState<Collaborateur[]>([
    {
      id: '1',
      nom: 'Marie Dupont',
      email: 'marie.dupont@example.com',
      role: 'Éditeur',
      projects: ['project-1', 'project-2'], // Multiple projects
      status: 'Actif',
    },
    {
      id: '2',
      nom: 'Jean Martin',
      email: 'jean.martin@example.com',
      role: 'Lecteur',
      projects: ['project-2'], // Single project
      status: 'Actif',
    },
    {
      id: '3',
      nom: 'Sophie Bernard',
      email: 'sophie.bernard@example.com',
      role: 'Éditeur',
      projects: ['project-1'], // Single project
      status: 'Actif',
    },
  ]);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'Lecteur' | 'Éditeur'>('Lecteur');
  const [inviteProjects, setInviteProjects] = useState<string[]>([]);

  // États pour les filtres
  const [filterEmail, setFilterEmail] = useState('');
  const [filterRole, setFilterRole] = useState<'Tous' | 'Lecteur' | 'Éditeur'>('Tous');
  const [filterStatus, setFilterStatus] = useState<'Tous' | 'Actif' | 'En attente'>('Tous');
  const [filterProject, setFilterProject] = useState<string>('Tous');
  const [showFilters, setShowFilters] = useState(false);

  const handleInvite = () => {
    if (!inviteEmail) {
      toast.error('Veuillez entrer une adresse email');
      return;
    }

    // Vérifier si l'email est valide
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      toast.error('Veuillez entrer une adresse email valide');
      return;
    }

    // Vérifier si l'utilisateur existe déjà
    if (collaborateurs.some(c => c.email === inviteEmail)) {
      toast.error('Cet utilisateur a déjà accès au projet');
      return;
    }

    // Vérifier qu'au moins un projet est sélectionné
    if (inviteProjects.length === 0) {
      toast.error('Veuillez sélectionner au moins un projet');
      return;
    }

    // Ajouter le nouveau collaborateur
    const newCollaborateur: Collaborateur = {
      id: Date.now().toString(),
      nom: inviteEmail.split('@')[0], // Nom temporaire basé sur l'email
      email: inviteEmail,
      role: inviteRole,
      projects: inviteProjects,
      status: 'En attente', // New collaborators are pending
    };

    setCollaborateurs([...collaborateurs, newCollaborateur]);
    setIsInviteModalOpen(false);
    setInviteEmail('');
    setInviteRole('Lecteur');
    setInviteProjects([]);
    
    toast.success(`Invitation envoyée à ${inviteEmail}`);
  };

  const handleRoleChange = (collaborateurId: string, newRole: 'Lecteur' | 'Éditeur') => {
    setCollaborateurs(collaborateurs.map(c => 
      c.id === collaborateurId ? { ...c, role: newRole } : c
    ));
    toast.success('Rôle mis à jour avec succès');
  };

  const handleRemoveCollaborateur = (collaborateurId: string) => {
    const collaborateur = collaborateurs.find(c => c.id === collaborateurId);
    setCollaborateurs(collaborateurs.filter(c => c.id !== collaborateurId));
    toast.success(`${collaborateur?.nom} a été retiré du projet`);
  };

  const getRoleBadgeVariant = (role: string) => {
    return role === 'Éditeur' ? 'default' : 'secondary';
  };

  const getRoleIcon = (role: string) => {
    return role === 'Éditeur' ? <Edit className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />;
  };

  const getStatusBadgeClass = (status: 'En attente' | 'Actif') => {
    if (status === 'Actif') {
      return 'bg-[#cef5d1] text-green-800'; // Green background, dark green text
    } else {
      return 'bg-[#e9eef9] text-blue-800'; // Light blue background, dark blue text
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
    if (filterStatus !== 'Tous' && collaborateur.status !== filterStatus) {
      return false;
    }
    
    // Filtre par projet
    if (filterProject !== 'Tous' && !collaborateur.projects.includes(filterProject)) {
      return false;
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
          
          <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 bg-gradient-primary hover:opacity-90 transition-opacity">
                <UserPlus className="w-4 h-4" />
                Inviter un collaborateur
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-[425px] mx-auto my-4 sm:w-full">
              <DialogHeader>
                <DialogTitle>Inviter un nouveau collaborateur</DialogTitle>
                <DialogDescription>
                  Envoyez une invitation par email pour donner accès à votre projet.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Adresse email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="collaborateur@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="placeholder:text-xs"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Rôle</Label>
                  <Select value={inviteRole} onValueChange={(value) => setInviteRole(value as 'Lecteur' | 'Éditeur')}>
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Lecteur">
                        <div className="flex items-center">
                          <Eye className="w-4 h-4 mr-2" />
                          Lecteur - Peut consulter le projet
                        </div>
                      </SelectItem>
                      <SelectItem value="Éditeur">
                        <div className="flex items-center">
                          <Edit className="w-4 h-4 mr-2" />
                          Éditeur - Peut modifier le projet
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="projects">Projets</Label>
                  <MultiSelect
                    options={userProjects.map(project => ({
                      value: project.project_id,
                      label: (
                        <div className="flex items-center gap-2">
                          <FolderSearch className="w-4 h-4" />
                          {project.nom_projet}
                        </div>
                      ),
                    }))}
                    value={inviteProjects}
                    onChange={setInviteProjects}
                    placeholder="Sélectionner les projets..."
                  />
                </div>
              </div>
              <DialogFooter className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsInviteModalOpen(false)} className="mr-2 flex-1">
                  Annuler
                </Button>
                <Button onClick={handleInvite} className="flex-1">
                  Envoyer l'invitation
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
                  {collaborateurs.filter(c => c.role === 'Éditeur').length}
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
                  {collaborateurs.filter(c => c.role === 'Lecteur').length}
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
              <Select value={filterRole} onValueChange={(value) => setFilterRole(value as 'Tous' | 'Lecteur' | 'Éditeur')}>
                <SelectTrigger id="filter-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tous">Tous</SelectItem>
                  <SelectItem value="Lecteur">
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-2" />
                      Lecteur
                    </div>
                  </SelectItem>
                  <SelectItem value="Éditeur">
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
              <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as 'Tous' | 'Actif' | 'En attente')}>
                <SelectTrigger id="filter-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tous">Tous</SelectItem>
                  <SelectItem value="Actif">Actif</SelectItem>
                  <SelectItem value="En attente">En attente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="filter-project" className="text-sm mb-2">Projet</Label>
              <Select value={filterProject} onValueChange={setFilterProject}>
                <SelectTrigger id="filter-project">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tous">Tous les projets</SelectItem>
                  {userProjects.map(project => (
                    <SelectItem key={project.project_id} value={project.project_id}>
                      <div className="flex items-center gap-2">
                        <FolderSearch className="w-4 h-4" />
                        {project.nom_projet}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                      onValueChange={(value) => handleRoleChange(collaborateur.id, value as 'Lecteur' | 'Éditeur')}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Lecteur">
                          <div className="flex items-center">
                            <Eye className="w-4 h-4 mr-2" />
                            Lecteur
                          </div>
                        </SelectItem>
                        <SelectItem value="Éditeur">
                          <div className="flex items-center">
                            <Edit className="w-4 h-4 mr-2" />
                            Éditeur
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Badge className={`${getStatusBadgeClass(collaborateur.status)} hover:bg-transparent hover:text-current cursor-default`}>
                      {collaborateur.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 mt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <FolderSearch className="w-4 h-4" />
                      <span className="font-medium">Projets :</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {collaborateur.projects.map((projectId) => (
                        <Badge
                          key={projectId}
                          variant="secondary"
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                          onClick={() => handleProjectClick(projectId)}
                        >
                          {getProjectName(projectId)}
                        </Badge>
                      ))}
                    </div>
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
                      Projets
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
                      onValueChange={(value) => handleRoleChange(collaborateur.id, value as 'Lecteur' | 'Éditeur')}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Lecteur">
                          <div className="flex items-center">
                            <Eye className="w-4 h-4 mr-2" />
                            Lecteur
                          </div>
                        </SelectItem>
                        <SelectItem value="Éditeur">
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
                      {collaborateur.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {collaborateur.projects.map((projectId) => (
                        <Badge
                          key={projectId}
                          variant="secondary"
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                          onClick={() => handleProjectClick(projectId)}
                        >
                          {getProjectName(projectId)}
                        </Badge>
                      ))}
                    </div>
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
